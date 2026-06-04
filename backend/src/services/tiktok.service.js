const { execFile } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

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

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 16 }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
}

function logAudioFallbackError(error) {
  const message = String(error?.stderr || error?.message || "").trim();

  if (!message) {
    return;
  }

  const firstLine = message.split(/\r?\n/).find(Boolean) || message;
  process.stderr.write(`[tiktok] audio fallback failed: ${firstLine.slice(0, 180)}\n`);
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
    downloads.push({
      label: "Video (No Watermark)",
      url: videoUrl,
      format: "mp4"
    });
  }

  const watermarkUrl = firstString(
    payload.videoWatermark,
    payload.wm,
    payload.watermark,
    payload.video_watermark,
    payload.video?.watermark
  );

  if (watermarkUrl) {
    downloads.push({
      label: "Video (Watermark)",
      url: watermarkUrl,
      format: "mp4"
    });
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
    downloads.push({
      label: "Audio Only",
      url: audioUrl,
      format: "mp3"
    });
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

  return downloads;
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
  const downloads = await collectDownloads(result, url);

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
    downloads
  };
}

module.exports = {
  downloadTikTok
};
