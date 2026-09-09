const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");
const axios = require("axios");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");
const DOWNLOAD_CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const TOKEN_PATTERN = /^[a-f0-9]{32}$/i;

function ensureCacheDir(dir = DOWNLOAD_CACHE_DIR) {
  fs.mkdirSync(dir, { recursive: true });
}

function getCacheToken(key) {
  return crypto.createHash("sha256").update(key).digest("hex").slice(0, 32);
}

function getCacheFilePath(token, extension) {
  const cleanExt = String(extension || "").replace(/^\./, "");
  return path.join(DOWNLOAD_CACHE_DIR, `${token}.${cleanExt}`);
}

function hasUsableFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

function cleanupFiles(filePaths) {
  filePaths.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
      }
    } catch {
      // Abaikan error saat cleanup file sementara
    }
  });
}

async function downloadUrlToFile(url, outputPath, headers = {}) {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
      ...headers
    },
    responseType: "stream",
    timeout: 120000,
    maxRedirects: 5,
    validateStatus(status) {
      return status >= 200 && status < 400;
    }
  });

  await pipeline(response.data, fs.createWriteStream(outputPath));
}

function cleanupExpiredCache(dir = DOWNLOAD_CACHE_DIR, ttlMs = DOWNLOAD_CACHE_TTL_MS) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const now = Date.now();

  try {
    fs.readdirSync(dir).forEach((fileName) => {
      const filePath = path.join(dir, fileName);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isFile() && now - stats.mtimeMs > ttlMs) {
          fs.rmSync(filePath, { force: true });
        }
      } catch {
        // Abaikan file yang terkunci atau sedang diakses
      }
    });
  } catch {
    // Abaikan kegagalan membaca direktori cache
  }
}

module.exports = {
  DOWNLOAD_CACHE_DIR,
  DOWNLOAD_CACHE_TTL_MS,
  TOKEN_PATTERN,
  ensureCacheDir,
  getCacheToken,
  getCacheFilePath,
  hasUsableFile,
  cleanupFiles,
  downloadUrlToFile,
  cleanupExpiredCache
};
