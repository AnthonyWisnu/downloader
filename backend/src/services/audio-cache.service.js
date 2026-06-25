const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { downloadUrlToFile } = require("./video-cache.service");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");

function ensureAudioCacheDir() {
  fs.mkdirSync(DOWNLOAD_CACHE_DIR, { recursive: true });
}

function getAudioCacheToken(sourceKey) {
  return crypto.createHash("sha256").update(sourceKey).digest("hex").slice(0, 32);
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

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, { maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      if (error) {
        const message = error.code === "ENOENT"
          ? "ffmpeg belum terinstall"
          : `ffmpeg gagal convert audio: ${String(stderr || error.message).slice(0, 500)}`;
        reject(new Error(message));
        return;
      }

      resolve(stdout);
    });
  });
}

async function convertAudioToMp3(inputPath, outputPath) {
  await runFfmpeg([
    "-y",
    "-i",
    inputPath,
    "-vn",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath
  ]);
}

async function getOrCreateMp3FromUrl(sourceKey, audioUrl, headers = {}) {
  ensureAudioCacheDir();

  const token = getAudioCacheToken(sourceKey);
  const outputPath = path.join(DOWNLOAD_CACHE_DIR, `${token}.mp3`);

  if (hasUsableFile(outputPath)) {
    return {
      token,
      outputPath,
      cached: true
    };
  }

  const sourcePath = path.join(DOWNLOAD_CACHE_DIR, `${token}.audio-source`);

  cleanupFiles([sourcePath]);

  try {
    await downloadUrlToFile(audioUrl, sourcePath, headers);
    await convertAudioToMp3(sourcePath, outputPath);

    if (!hasUsableFile(outputPath)) {
      throw new Error("hasil audio MP3 kosong");
    }

    cleanupFiles([sourcePath]);

    return {
      token,
      outputPath,
      cached: false
    };
  } catch (error) {
    cleanupFiles([sourcePath, outputPath]);
    throw error;
  }
}

module.exports = {
  getOrCreateMp3FromUrl
};
