const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { getOrCreateMp3FromUrl } = require("./audio-cache.service");
const { downloadUrlToFile, getOrCreateNormalizedVideo } = require("./video-cache.service");
const { runYtDlp } = require("../utils/execTool");

const DOWNLOAD_CACHE_DIR = path.join(os.tmpdir(), "void-dl-cache");

function getDownloader() {
  const tiktokApi = require("@tobyg74/tiktok-api-dl");

  return (
    tiktokApi.Downloader ||
    tiktokApi.TiktokDL ||
    tiktokApi.tiktokdl ||
    tiktokApi.tiktokDl ||
    tiktokApi.default ||
    tiktokApi
  );
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }

    if (Array.isArray(value)) {
      const match = value.map((item) => firstString(item)).find(Boolean);

      if (match) {
        return match;
      }
    }

    if (value && typeof value === "object") {
      const match = firstString(
        value.play,
        value.playUrl,
        value.url,
        value.downloadUrl,
        value.download,
        value.href,
        value.src
      );

      if (match) {
        return match;
      }
    }
  }

  return "";
}

function ensureDownloadCacheDir() {
  fs.mkdirSync(DOWNLOAD_CACHE_DIR, { recursive: true });
}

function getDownloadToken(url) {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}


function logAudioFallbackError(error) {
  const message = String(error?.stderr || error?.message || "").trim();

  if (!message) {
    return;
  }

  const firstLine = message.split(/\r?\n/).find(Boolean) || message;
  process.stderr.write(`[tiktok] audio fallback failed: ${firstLine.slice(0, 180)}\n`);
}

function logAudioConvertError(error, audioUrl) {
  const message = String(error?.message || "").slice(0, 180);
  process.stderr.write(`[tiktok] audio convert failed host=${getHostLabel(audioUrl)} reason=${message}\n`);
}

function getHostLabel(rawUrl) {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return "invalid-host";
  }
}

function logVideoNormalizeFallback(error, videoUrl) {
  const message = String(error?.message || "").slice(0, 180);
  process.stderr.write(`[tiktok] video normalize fallback host=${getHostLabel(videoUrl)} reason=${message}\n`);
}

async function downloadAudioWithYtDlp(url) {
  ensureDownloadCacheDir();

  const token = getDownloadToken(`tiktok-audio:${url}`);
  const outputPath = path.join(DOWNLOAD_CACHE_DIR, `${token}.mp3`);

  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    return {
      token,
      path: outputPath
    };
  }

  const outputBase = path.join(DOWNLOAD_CACHE_DIR, token);

  await runYtDlp([
    "--no-warnings",
    "--no-playlist",
    "--extract-audio",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "--output",
    `${outputBase}.%(ext)s`,
    url
  ]);

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error("Audio TikTok kosong");
  }

  return {
    token,
    path: outputPath
  };
}

async function createNormalizedVideoDownload(videoUrl, label) {
  try {
    const videoFile = await getOrCreateNormalizedVideo({
      sourceKey: `tiktok-video:${videoUrl}`,
      sourceExtension: "mp4",
      platform: "tiktok",
      createSource(sourcePath) {
        return downloadUrlToFile(videoUrl, sourcePath, {
          Referer: "https://www.tiktok.com/"
        });
      }
    });

    return {
      download: {
        label,
        url: `/api/file?token=${videoFile.token}&download=1`,
        format: "mp4"
      },
      previewUrl: `/api/file?token=${videoFile.token}`
    };
  } catch (error) {
    logVideoNormalizeFallback(error, videoUrl);

    return {
      download: {
        label: `${label} Fallback External`,
        url: videoUrl,
        format: "mp4"
      },
      previewUrl: ""
    };
  }
}

function findMediaUrlByKeyword(items, keywords) {
  if (!Array.isArray(items)) {
    return "";
  }

  return items
    .map((item) => {
      const descriptor = [
        item?.label,
        item?.type,
        item?.format,
        item?.quality,
        item?.mimeType,
        item?.contentType
      ].filter(Boolean).join(" ").toLowerCase();

      if (!keywords.some((keyword) => descriptor.includes(keyword))) {
        return "";
      }

      return firstString(item);
    })
    .find(Boolean) || "";
}

async function collectDownloads(result, sourceUrl) {
  const payload = result.result || result.data || result;
  const downloads = [];
  let previewUrl = "";

  const videoUrl = firstString(
    payload.videoHD,
    payload.videoSD,
    payload.nowm,
    payload.no_watermark,
    payload.noWatermark,
    payload.video_no_watermark,
    payload.video?.noWatermark,
    payload.video?.nowm,
    payload.video?.url,
    payload.video?.playAddr,
    payload.video?.downloadAddr,
    payload.direct
  );

  if (videoUrl) {
    const normalizedVideo = await createNormalizedVideoDownload(videoUrl, "Video (No Watermark)");
    downloads.push(normalizedVideo.download);
    previewUrl = normalizedVideo.previewUrl;
  }

  const watermarkUrl = firstString(
    payload.videoWatermark,
    payload.wm,
    payload.watermark,
    payload.video_watermark,
    payload.video?.watermark
  );

  if (watermarkUrl) {
    const normalizedWatermarkVideo = await createNormalizedVideoDownload(watermarkUrl, "Video (Watermark)");
    downloads.push(normalizedWatermarkVideo.download);
    previewUrl = previewUrl || normalizedWatermarkVideo.previewUrl;
  }

  const audioUrl = firstString(
    findMediaUrlByKeyword(payload.medias, ["audio", "music", "mp3", "m4a"]),
    findMediaUrlByKeyword(payload.downloads, ["audio", "music", "mp3", "m4a"]),
    findMediaUrlByKeyword(payload.links, ["audio", "music", "mp3", "m4a"]),
    payload.music,
    payload.music?.play,
    payload.music?.playUrl,
    payload.music?.url,
    payload.music?.downloadUrl,
    payload.audio,
    payload.audio?.play,
    payload.audio?.playUrl,
    payload.audio?.url,
    payload.audio?.downloadUrl,
    payload.audio_url,
    payload.sound,
    payload.sound?.play,
    payload.sound?.playUrl,
    payload.sound?.url,
    payload.sound?.downloadUrl,
    payload.music_info?.play,
    payload.music_info?.playUrl,
    payload.music_info?.url,
    payload.music_info?.downloadUrl,
    payload.musicInfo?.play,
    payload.musicInfo?.playUrl,
    payload.musicInfo?.url,
    payload.musicInfo?.downloadUrl
  );
  if (audioUrl) {
    try {
      const audioFile = await getOrCreateMp3FromUrl(`tiktok-audio-url:${audioUrl}`, audioUrl, {
        Referer: "https://www.tiktok.com/"
      });

      downloads.push({
        label: "Audio Only",
        url: `/api/file?token=${audioFile.token}&kind=audio&download=1`,
        format: "mp3"
      });
    } catch (error) {
      logAudioConvertError(error, audioUrl);

      try {
        const audioFile = await downloadAudioWithYtDlp(sourceUrl);

        downloads.push({
          label: "Audio Only",
          url: `/api/file?token=${audioFile.token}&kind=audio&download=1`,
          format: "mp3"
        });
      } catch (fallbackError) {
        logAudioFallbackError(fallbackError);
      }
    }
  } else if (videoUrl || watermarkUrl) {
    try {
      const audioFile = await downloadAudioWithYtDlp(sourceUrl);

      downloads.push({
        label: "Audio Only",
        url: `/api/file?token=${audioFile.token}&kind=audio&download=1`,
        format: "mp3"
      });
    } catch (error) {
      logAudioFallbackError(error);
    }
  }

  const images = payload.images || payload.image_post?.images || payload.imagePost?.images || [];

  if (Array.isArray(images)) {
    images.forEach((imageUrl, index) => {
      if (typeof imageUrl === "string" && imageUrl.length > 0) {
        downloads.push({
          label: `Slideshow Image ${index + 1}`,
          url: imageUrl,
          format: "jpg"
        });
      }
    });
  }

  return {
    downloads,
    previewUrl
  };
}

function getMetadata(result) {
  const payload = result.result || result.data || result;

  return {
    title: firstString(payload.desc, payload.title, payload.description, "TikTok content"),
    thumbnail: firstString(
      payload.cover,
      payload.author?.avatar,
      payload.thumbnail,
      payload.video?.cover,
      payload.video?.originCover,
      payload.video?.dynamicCover
    )
  };
}

async function downloadTikTok(url) {
  const downloader = getDownloader();

  if (typeof downloader !== "function") {
    throw new Error("Downloader TikTok tidak tersedia");
  }

  const result = await downloader(url, { version: "v1" });
  const collected = await collectDownloads(result, url);
  const downloads = collected.downloads;

  if (downloads.length === 0) {
    throw new Error("URL tidak valid atau konten tidak dapat diakses");
  }

  const metadata = getMetadata(result);
  const hasImages = downloads.some((download) => download.format === "jpg");

  return {
    platform: "tiktok",
    type: hasImages ? "slideshow" : "video",
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    previewUrl: collected.previewUrl || undefined,
    downloads
  };
}

module.exports = {
  downloadTikTok
};
