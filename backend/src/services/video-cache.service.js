const fs = require("fs");
const path = require("path");
const { normalizeVideoForAllDevices } = require("./video-normalize.service");
const {
  DOWNLOAD_CACHE_DIR,
  ensureCacheDir,
  getCacheToken,
  getCacheFilePath,
  hasUsableFile,
  cleanupFiles,
  downloadUrlToFile
} = require("./media-cache.service");

function getFinalVideoPath(token) {
  return getCacheFilePath(token, "mp4");
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

async function getOrCreateNormalizedVideo(options) {
  const {
    sourceKey,
    sourceExtension = "mp4",
    platform = "unknown",
    createSource
  } = options;

  ensureCacheDir();

  const token = getCacheToken(sourceKey);
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
  getVideoCacheToken: getCacheToken
};
