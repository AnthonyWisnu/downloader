const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");
const axios = require("axios");
const { normalizeVideoForAllDevices } = require("./video-normalize.service");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");

function ensureVideoCacheDir() {
  fs.mkdirSync(DOWNLOAD_CACHE_DIR, { recursive: true });
}

function getVideoCacheToken(sourceKey) {
  return crypto.createHash("sha256").update(sourceKey).digest("hex").slice(0, 32);
}

function getFinalVideoPath(token) {
  return path.join(DOWNLOAD_CACHE_DIR, `${token}.mp4`);
}

function hasUsableFile(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

function cleanupFiles(filePaths) {
  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }
  });
}

function getHostLabel(sourceKey) {
  try {
    return new URL(sourceKey).hostname;
  } catch {
    return "local";
  }
}

function logNormalizeResult(platform, sourceKey, token, result, outputPath) {
  const metadata = result.metadata || {};
  const video = metadata.video || {};
  const audio = metadata.audio || {};
  const outputSize = hasUsableFile(outputPath) ? fs.statSync(outputPath).size : 0;

  process.stderr.write(
    `[video-normalize] platform=${platform} host=${getHostLabel(sourceKey)} token=${token.slice(0, 8)} ` +
    `mode=${result.mode} vcodec=${video.codec_name || "none"} acodec=${audio.codec_name || "none"} ` +
    `pix_fmt=${video.pix_fmt || "none"} size=${video.width || 0}x${video.height || 0} output=${outputSize}\n`
  );
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

async function getOrCreateNormalizedVideo(options) {
  const {
    sourceKey,
    sourceExtension = "mp4",
    platform = "unknown",
    createSource
  } = options;

  ensureVideoCacheDir();

  const token = getVideoCacheToken(sourceKey);
  const finalPath = getFinalVideoPath(token);

  if (hasUsableFile(finalPath)) {
    return {
      token,
      outputPath: finalPath,
      cached: true
    };
  }

  const safeExtension = String(sourceExtension || "mp4").replace(/[^a-z0-9]/gi, "") || "mp4";
  const sourcePath = path.join(DOWNLOAD_CACHE_DIR, `${token}.source.${safeExtension}`);
  const normalizedPath = path.join(DOWNLOAD_CACHE_DIR, `${token}.normalized.mp4`);

  cleanupFiles([sourcePath, normalizedPath]);

  try {
    await createSource(sourcePath);

    if (!hasUsableFile(sourcePath)) {
      throw new Error("source video kosong");
    }

    const result = await normalizeVideoForAllDevices(sourcePath, normalizedPath);

    if (!hasUsableFile(normalizedPath)) {
      throw new Error("normalized video kosong");
    }

    fs.renameSync(normalizedPath, finalPath);
    cleanupFiles([sourcePath]);
    logNormalizeResult(platform, sourceKey, token, result, finalPath);

    return {
      token,
      outputPath: finalPath,
      cached: false,
      mode: result.mode,
      metadata: result.metadata
    };
  } catch (error) {
    cleanupFiles([sourcePath, normalizedPath]);
    throw error;
  }
}

module.exports = {
  DOWNLOAD_CACHE_DIR,
  downloadUrlToFile,
  getFinalVideoPath,
  getOrCreateNormalizedVideo,
  getVideoCacheToken
};
