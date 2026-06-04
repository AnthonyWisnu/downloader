const fs = require("fs");
const os = require("os");
const path = require("path");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");
const TOKEN_PATTERN = /^[a-f0-9]{32}$/i;
const FILE_TYPES = {
  audio: {
    extension: "mp3",
    contentType: "audio/mpeg",
    filename: "void-download.mp3"
  },
  video: {
    extension: "mp4",
    contentType: "video/mp4",
    filename: "void-download.mp4"
  }
};

function getFileType(req) {
  return req.query.kind === "audio" ? FILE_TYPES.audio : FILE_TYPES.video;
}

function getFilePath(token, fileType) {
  return path.join(DOWNLOAD_CACHE_DIR, `${token}.${fileType.extension}`);
}

function streamFile(req, res, filePath, fileType) {
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  res.setHeader("Content-Type", fileType.contentType);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "private, max-age=7200");

  if (req.query.download === "1") {
    res.setHeader("Content-Disposition", `attachment; filename="${fileType.filename}"`);
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
  const fileType = getFileType(req);

  if (!TOKEN_PATTERN.test(token)) {
    res.status(404).json({ error: "ERR: File tidak ditemukan" });
    return;
  }

  const filePath = getFilePath(token, fileType);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    res.status(404).json({ error: "ERR: File tidak ditemukan" });
    return;
  }

  streamFile(req, res, filePath, fileType);
}

module.exports = {
  downloadFile
};
