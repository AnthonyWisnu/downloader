const fs = require("fs");
const path = require("path");
const { runYtDlp, parseYtDlpJson } = require("../utils/execTool");
const { createServiceError } = require("../utils/errors");
const { validateXCookies } = require("./cookies.service");
const { getOrCreateNormalizedVideo } = require("./video-cache.service");
const {
  DOWNLOAD_CACHE_DIR,
  ensureCacheDir,
  getCacheToken,
  getCacheFilePath,
  hasUsableFile,
  cleanupFiles
} = require("./media-cache.service");

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const PRIMARY_MERGE_FORMAT =
  "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best";
const FALLBACK_MERGE_FORMAT = "best";
const OUTPUT_EXTENSIONS = ["mp4", "mkv", "webm"];

function normalizeXError(error) {
  const raw = [error?.stderr, error?.stdout, error?.message].filter(Boolean).join("\n").toLowerCase();

  if (raw.includes("status is not available") || raw.includes("not found") || raw.includes("http error 404")) {
    return createServiceError("Tweet tidak ditemukan atau telah dihapus", 404);
  }

  if (raw.includes("age-restricted") || raw.includes("adult content") || raw.includes("login required") || raw.includes("sign in")) {
    return createServiceError("Tweet ini memerlukan autentikasi cookies X (Twitter)", 401);
  }

  if (raw.includes("protected") || raw.includes("not authorized")) {
    return createServiceError("Akun X ini bersifat privat atau dilindungi", 403);
  }

  return createServiceError("Gagal memproses URL X (Twitter)");
}

function getCookieArgs() {
  const cookies = validateXCookies();
  return cookies.ok ? ["--cookies", cookies.path] : [];
}

async function fetchXMetadata(url) {
  const args = [
    ...getCookieArgs(),
    "--user-agent",
    BROWSER_USER_AGENT,
    "--dump-json",
    "--no-warnings",
    "--no-playlist",
    url
  ];

  const output = await runYtDlp(args);
  return parseYtDlpJson(output);
}

function toOriginalTwitterImageUrl(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl) {
    return "";
  }

  try {
    const parsed = new URL(imageUrl);

    if (parsed.hostname.includes("twimg.com") && parsed.pathname.includes("/media/")) {
      parsed.searchParams.set("name", "orig");
      return parsed.toString();
    }
  } catch {
    // Kembalikan URL asli jika gagal parse
  }

  return imageUrl;
}

function extractImageUrls(metadata) {
  const imageUrls = new Set();

  if (metadata?._type === "playlist" && Array.isArray(metadata.entries)) {
    metadata.entries.forEach((entry) => {
      if (entry?.url && entry.url.includes("twimg.com/media/")) {
        imageUrls.add(toOriginalTwitterImageUrl(entry.url));
      } else if (entry?.thumbnail) {
        imageUrls.add(toOriginalTwitterImageUrl(entry.thumbnail));
      }
    });
  }

  if (Array.isArray(metadata?.thumbnails)) {
    metadata.thumbnails.forEach((thumb) => {
      if (thumb?.url && thumb.url.includes("twimg.com/media/")) {
        imageUrls.add(toOriginalTwitterImageUrl(thumb.url));
      }
    });
  }

  if (metadata?.url && metadata.url.includes("twimg.com/media/")) {
    imageUrls.add(toOriginalTwitterImageUrl(metadata.url));
  }

  return Array.from(imageUrls);
}

function getTweetDownloads(metadata) {
  const downloads = [];
  const imageUrls = extractImageUrls(metadata);

  imageUrls.forEach((imageUrl, index) => {
    downloads.push({
      label: `JPG / IMAGE ${index + 1}`,
      url: imageUrl,
      format: "jpg"
    });
  });

  return downloads;
}

function hasAudioStream(metadata) {
  const formats = Array.isArray(metadata?.formats) ? metadata.formats : [];
  return formats.some((format) => {
    const acodec = String(format?.acodec || "").toLowerCase();
    return Boolean(acodec) && acodec !== "none";
  });
}

function hasVideoFormats(metadata) {
  const formats = Array.isArray(metadata?.formats) ? metadata.formats : [];
  return formats.some((format) => {
    const vcodec = String(format?.vcodec || "").toLowerCase();
    const ext = String(format?.ext || "").toLowerCase();
    return (Boolean(vcodec) && vcodec !== "none") || ext === "mp4";
  });
}

async function runYtDlpVideoDownload(url, sourcePath, format) {
  const outputBase = sourcePath.replace(/\.[^.]+$/, "");
  const outputTemplate = `${outputBase}.%(ext)s`;
  const candidatePaths = OUTPUT_EXTENSIONS.map((ext) => `${outputBase}.${ext}`);

  cleanupFiles(candidatePaths);

  const args = [
    ...getCookieArgs(),
    "--user-agent",
    BROWSER_USER_AGENT,
    "--no-warnings",
    "--no-playlist",
    "--format",
    format,
    "--merge-output-format",
    "mp4",
    "--output",
    outputTemplate,
    url
  ];

  await runYtDlp(args);

  return candidatePaths.find((candidate) => hasUsableFile(candidate));
}

async function createXSourceVideo(url, sourcePath) {
  let mergedPath;

  try {
    mergedPath = await runYtDlpVideoDownload(url, sourcePath, PRIMARY_MERGE_FORMAT);
  } catch (error) {
    mergedPath = await runYtDlpVideoDownload(url, sourcePath, FALLBACK_MERGE_FORMAT);
  }

  if (!mergedPath) {
    throw new Error("File unduhan video X kosong");
  }

  if (mergedPath !== sourcePath) {
    fs.renameSync(mergedPath, sourcePath);
  }
}

async function downloadXAudio(url) {
  ensureCacheDir();

  const token = getCacheToken(`x-audio:${url}`);
  const outputPath = getCacheFilePath(token, "mp3");

  if (hasUsableFile(outputPath)) {
    return {
      token,
      path: outputPath
    };
  }

  const outputBase = path.join(DOWNLOAD_CACHE_DIR, token);
  const args = [
    ...getCookieArgs(),
    "--user-agent",
    BROWSER_USER_AGENT,
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
  ];

  await runYtDlp(args);

  if (!hasUsableFile(outputPath)) {
    throw new Error("File audio X kosong");
  }

  return {
    token,
    path: outputPath
  };
}

async function downloadX(url) {
  try {
    const metadata = await fetchXMetadata(url);
    const title = metadata.title || metadata.description || "X post";
    const thumbnail = metadata.thumbnail || null;
    const isVideo = hasVideoFormats(metadata);
    const images = extractImageUrls(metadata);

    // Kasus 1: Tweet Foto / Slideshow (tidak ada format video)
    if (!isVideo && images.length > 0) {
      const type = images.length > 1 ? "slideshow" : "photo";
      const downloads = images.map((imageUrl, index) => ({
        label: `Slideshow Image ${index + 1}`,
        url: imageUrl,
        format: "jpg"
      }));

      return {
        platform: "x",
        type,
        title,
        thumbnail: images[0],
        sourceUrl: url,
        downloads
      };
    }

    // Kasus 2: Video atau GIF Tweet
    const hasAudio = hasAudioStream(metadata);
    const duration = Number(metadata.duration || 0);
    const isGif = !hasAudio && duration > 0 && duration <= 10;
    const type = isGif ? "gif" : "video";
    const label = isGif ? "MP4 / GIF" : "MP4 / VIDEO";

    const videoFile = await getOrCreateNormalizedVideo({
      sourceKey: `x-video:${url}`,
      sourceExtension: "mp4",
      platform: "x",
      createSource(sourcePath) {
        return createXSourceVideo(url, sourcePath);
      }
    });

    const downloads = [
      {
        label,
        url: `/api/file?token=${videoFile.token}&download=1`,
        format: "mp4"
      }
    ];

    if (hasAudio) {
      try {
        const audioFile = await downloadXAudio(url);
        downloads.push({
          label: "Audio Only",
          url: `/api/file?token=${audioFile.token}&kind=audio&download=1`,
          format: "mp3"
        });
      } catch {
        // Audio optional jika ekstraksi gagal
      }
    }

    return {
      platform: "x",
      type,
      title,
      thumbnail,
      sourceUrl: url,
      previewUrl: `/api/file?token=${videoFile.token}`,
      downloads
    };
  } catch (error) {
    if (error.message?.startsWith("ERR:")) {
      throw error;
    }

    throw normalizeXError(error);
  }
}

module.exports = {
  downloadX
};
