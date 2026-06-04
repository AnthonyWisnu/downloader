const fs = require("fs");
const os = require("os");
const path = require("path");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");
const TOKEN_PATTERN = /^[a-f0-9]{32}$/i;

function getFilePath(token) {
  return path.join(DOWNLOAD_CACHE_DIR, `${token}.mp4`);
}

function streamFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "private, max-age=7200");

  if (req.query.download === "1") {
    res.setHeader("Content-Disposition", "attachment; filename=\"void-download.mp4\"");
  }

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

function downloadFile(req, res) {
  const token = String(req.query.token || "");

  if (!TOKEN_PATTERN.test(token)) {
    res.status(404).json({ error: "ERR: File tidak ditemukan" });
    return;
  }

  const filePath = getFilePath(token);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    res.status(404).json({ error: "ERR: File tidak ditemukan" });
    return;
  }

  streamFile(req, res, filePath);
}

module.exports = {
  downloadFile
};
