const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { validateInstagramCookies } = require("../services/cookies.service");
const { sanitizeUrl } = require("../utils/sanitizeUrl");

const CACHE_DIR = path.join(os.tmpdir(), "void-preview-cache");
const PREVIEW_FORMAT =
  "best[ext=mp4][acodec!=none][vcodec!=none]/best[acodec!=none][vcodec!=none]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best";

function ensureCacheDir() {
  fs.mkdirSync(CACHE_DIR, {
    recursive: true
  });
}

function getCachePath(url) {
  const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
  return path.join(CACHE_DIR, `${hash}.mp4`);
}

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
}

async function ensurePreviewFile(url) {
  ensureCacheDir();

  const outputPath = getCachePath(url);

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    return outputPath;
  }

  const cookies = validateInstagramCookies();

  if (!cookies.ok) {
    throw new Error(cookies.error);
  }

  const tempBase = outputPath.replace(/\.mp4$/, "");
  const tempOutput = `${tempBase}.%(ext)s`;
  const candidatePaths = [
    `${tempBase}.mp4`,
    `${tempBase}.mkv`,
    `${tempBase}.webm`
  ];

  candidatePaths.forEach((candidatePath) => {
    if (fs.existsSync(candidatePath)) {
      fs.rmSync(candidatePath, { force: true });
    }
  });

  try {
    await runYtDlp([
      "--cookies",
      cookies.path,
      "--no-warnings",
      "--no-playlist",
      "--format",
      PREVIEW_FORMAT,
      "--merge-output-format",
      "mp4",
      "--output",
      tempOutput,
      url
    ]);
  } catch (error) {
    throw new Error(error.stderr || error.message || "yt-dlp gagal membuat preview");
  }

  const mergedPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (!mergedPath) {
    throw new Error("Preview tidak dapat dibuat");
  }

  fs.renameSync(mergedPath, outputPath);
  return outputPath;
}

function streamPreviewFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "private, max-age=3600");

  if (!range) {
    res.setHeader("Content-Length", stat.size);
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const [startRaw, endRaw] = range.replace(/bytes=/, "").split("-");
  const start = Number(startRaw);
  const end = endRaw ? Number(endRaw) : stat.size - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start >= stat.size || end >= stat.size) {
    res.status(416).end();
    return;
  }

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
  res.setHeader("Content-Length", end - start + 1);
  fs.createReadStream(filePath, { start, end }).pipe(res);
}

async function previewMedia(req, res) {
  try {
    const sanitized = sanitizeUrl(req.query.url);

    if (!sanitized.ok || sanitized.platform !== "instagram") {
      res.status(400).json({ error: "Preview tidak valid" });
      return;
    }

    const filePath = await ensurePreviewFile(sanitized.url);
    streamPreviewFile(req, res, filePath);
  } catch (error) {
    process.stderr.write(`preview failed reason=${error.message}\n`);
    res.status(502).json({
      error: "Preview tidak dapat dibuat"
    });
  }
}

module.exports = {
  previewMedia
};
