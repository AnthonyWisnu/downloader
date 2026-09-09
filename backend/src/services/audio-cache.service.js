const path = require("path");
const { runFfmpeg } = require("../utils/execTool");
const {
  DOWNLOAD_CACHE_DIR,
  ensureCacheDir,
  getCacheToken,
  getCacheFilePath,
  hasUsableFile,
  cleanupFiles,
  downloadUrlToFile
} = require("./media-cache.service");

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
  ensureCacheDir();

  const token = getCacheToken(sourceKey);
  const outputPath = getCacheFilePath(token, "mp3");

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
  convertAudioToMp3,
  getOrCreateMp3FromUrl
};
