require("dotenv").config();

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const downloadRoutes = require("./routes/download.routes");
const { validateInstagramCookiesOnStartup } = require("./services/cookies.service");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");
const DOWNLOAD_CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const app = express();
const port = Number(process.env.PORT || 3001);
const frontendUrl =
  process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173";
const allowedOrigins = new Set(frontendUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean));

function cleanupDownloadCache() {
  if (!fs.existsSync(DOWNLOAD_CACHE_DIR)) {
    return;
  }

  const now = Date.now();

  fs.readdirSync(DOWNLOAD_CACHE_DIR).forEach((fileName) => {
    const filePath = path.join(DOWNLOAD_CACHE_DIR, fileName);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && now - stats.mtimeMs > DOWNLOAD_CACHE_TTL_MS) {
      fs.rmSync(filePath, { force: true });
    }
  });
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin tidak diizinkan"));
    }
  })
);

app.use(express.json({ limit: "1mb" }));
app.use("/api", downloadRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

app.use((error, req, res, next) => {
  const message = error.message || "Server error";

  res.status(500).json({
    error: message.startsWith("ERR:") ? message : `ERR: ${message}`
  });
});

if (require.main === module) {
  validateInstagramCookiesOnStartup();
  cleanupDownloadCache();
  const server = app.listen(port);
  server.timeout = 300000;
}

module.exports = app;
