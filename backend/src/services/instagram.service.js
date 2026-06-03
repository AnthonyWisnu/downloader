const { execFile } = require("child_process");
const { validateInstagramCookies } = require("./cookies.service");

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        error.stdout = stdout;
        error.isYtDlpError = true;
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
}

function createInstagramError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeInstagramError(error) {
  const rawMessage = [
    error?.stderr,
    error?.stdout,
    error?.message
  ]
    .filter(Boolean)
    .join("\n");
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes("no video formats found")) {
    return createInstagramError("ERR: Format konten tidak didukung");
  }

  if (normalized.includes("http error 404")) {
    return createInstagramError("ERR: Konten tidak ditemukan atau sudah dihapus", 404);
  }

  if (normalized.includes("login required")) {
    return createInstagramError("ERR: Konten membutuhkan autentikasi", 401);
  }

  if (
    normalized.includes("metadata instagram kosong") ||
    normalized.includes("metadata kosong") ||
    normalized.includes("output json kosong") ||
    normalized.includes("unexpected end of json input")
  ) {
    return createInstagramError("ERR: Gagal mengambil metadata, coba lagi");
  }

  return createInstagramError("ERR: Gagal memproses URL Instagram");
}

function detectInstagramType(metadata) {
  const webpageUrl = String(metadata.webpage_url || metadata.original_url || "").toLowerCase();

  if (webpageUrl.includes("/stories/")) {
    return "story";
  }

  if (webpageUrl.includes("/reel/") || webpageUrl.includes("/reels/")) {
    return "reels";
  }

  if (metadata.entries && metadata.entries.length > 1) {
    return "slideshow";
  }

  return metadata.ext === "mp4" ? "video" : "image";
}

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isImageExt(ext) {
  return ["jpg", "jpeg", "webp", "png"].includes(String(ext || "").toLowerCase());
}

function isVideoFormat(format) {
  if (!format || !isHttpUrl(format.url)) {
    return false;
  }

  if (format.vcodec === "none") {
    return false;
  }

  return format.ext === "mp4" || String(format.url).includes(".mp4");
}

function hasAudio(format) {
  return Boolean(format?.acodec && format.acodec !== "none");
}

function hasVideo(format) {
  return Boolean(format?.vcodec && format.vcodec !== "none");
}

function isPlayableVideoFormat(format) {
  return isVideoFormat(format) && hasAudio(format) && hasVideo(format);
}

function isImageFormat(format) {
  if (!format || !isHttpUrl(format.url)) {
    return false;
  }

  return isImageExt(format.ext);
}

function getFormatScore(format) {
  const height = Number(format.height || 0);
  const width = Number(format.width || 0);
  const tbr = Number(format.tbr || 0);
  const hasAudio = format.acodec && format.acodec !== "none" ? 100000 : 0;

  return hasAudio + height * 1000 + width + tbr;
}

function pickBestFormat(formats, predicate) {
  if (!Array.isArray(formats)) {
    return null;
  }

  return formats
    .filter(predicate)
    .sort((left, right) => getFormatScore(right) - getFormatScore(left))[0] || null;
}

function getDirectImageMedia(entry) {
  if (isHttpUrl(entry.url) && isImageExt(entry.ext)) {
    return {
      url: entry.url,
      format: entry.ext,
      kind: "Image"
    };
  }

  const imageFormat = pickBestFormat(entry.formats, isImageFormat);

  if (imageFormat) {
    return {
      url: imageFormat.url,
      format: imageFormat.ext || "jpg",
      kind: "Image"
    };
  }

  if (isHttpUrl(entry.thumbnail) && isImageExt(entry.ext)) {
    return {
      url: entry.thumbnail,
      format: entry.ext || "jpg",
      kind: "Image"
    };
  }

  return null;
}

function isImageEntry(entry) {
  if (!entry) {
    return false;
  }

  if (isImageExt(entry.ext)) {
    return true;
  }

  return Boolean(getDirectImageMedia(entry));
}

function isImageContent(metadata) {
  if (isImageEntry(metadata)) {
    return true;
  }

  if (!Array.isArray(metadata.entries) || metadata.entries.length === 0) {
    return false;
  }

  return metadata.entries.some(isImageEntry);
}

function getDirectMedia(entry) {
  const directImage = getDirectImageMedia(entry);

  if (directImage) {
    return directImage;
  }

  const selectedDownload = Array.isArray(entry.requested_downloads)
    ? entry.requested_downloads.find((download) => isHttpUrl(download.url))
    : null;

  if (selectedDownload) {
    return {
      url: selectedDownload.url,
      format: selectedDownload.ext || entry.ext || "mp4",
      kind: selectedDownload.ext === "mp4" ? "Video" : "Media"
    };
  }

  const requestedFormat = pickBestFormat(entry.requested_formats, isPlayableVideoFormat);

  if (requestedFormat) {
    return {
      url: requestedFormat.url,
      format: requestedFormat.ext || "mp4",
      kind: "Video"
    };
  }

  const videoFormat =
    pickBestFormat(entry.formats, isPlayableVideoFormat) ||
    pickBestFormat(entry.formats, isVideoFormat);

  if (videoFormat) {
    return {
      url: videoFormat.url,
      format: videoFormat.ext || "mp4",
      kind: "Video"
    };
  }

  const imageFormat = pickBestFormat(entry.formats, isImageFormat);

  if (imageFormat) {
    return {
      url: imageFormat.url,
      format: imageFormat.ext || "jpg",
      kind: "Image"
    };
  }

  if (isHttpUrl(entry.url) && entry.url !== entry.webpage_url) {
    return {
      url: entry.url,
      format: entry.ext || "mp4",
      kind: entry.ext === "mp4" ? "Video" : "Media"
    };
  }

  return null;
}

function normalizeInstagramEntry(entry, index) {
  const media = getDirectMedia(entry);

  if (!media) {
    return null;
  }

  return {
    label: `${media.kind} ${index + 1}`,
    url: media.url,
    format: media.format
  };
}

function buildDownloads(metadata) {
  if (Array.isArray(metadata.entries) && metadata.entries.length > 0) {
    return metadata.entries
      .map((entry, index) => normalizeInstagramEntry(entry, index))
      .filter(Boolean);
  }

  const media = getDirectMedia(metadata);

  if (!media) {
    return [];
  }

  return [
    {
      label: media.kind,
      url: media.url,
      format: media.format
    }
  ];
}

function parseYtDlpJson(output) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("Metadata Instagram kosong");
  }

  try {
    return JSON.parse(lines[lines.length - 1]);
  } catch (error) {
    throw new Error("Output JSON kosong");
  }
}

async function getInstagramMetadata(url, cookiesPath) {
  const output = await runYtDlp([
    "--cookies",
    cookiesPath,
    "--dump-single-json",
    "--no-warnings",
    url
  ]);

  return parseYtDlpJson(output);
}

async function getInstagramVideoMetadata(url, cookiesPath) {
  const output = await runYtDlp([
    "--cookies",
    cookiesPath,
    "--dump-json",
    "--no-warnings",
    "--no-playlist",
    "--format",
    "best[ext=mp4][acodec!=none][vcodec!=none]/best[acodec!=none][vcodec!=none]/best[ext=mp4]/best",
    url
  ]);

  return parseYtDlpJson(output);
}

async function downloadInstagram(url) {
  const cookies = validateInstagramCookies();

  if (!cookies.ok) {
    const error = new Error(cookies.error);
    error.statusCode = 500;
    throw error;
  }

  try {
    const initialMetadata = await getInstagramMetadata(url, cookies.path);
    const metadata = isImageContent(initialMetadata)
      ? initialMetadata
      : await getInstagramVideoMetadata(url, cookies.path);
    const downloads = buildDownloads(metadata);

    if (downloads.length === 0) {
      throw new Error("No video formats found");
    }

    return {
      platform: "instagram",
      type: detectInstagramType(metadata),
      title: metadata.title || metadata.description || "Instagram content",
      thumbnail: metadata.thumbnail || "",
      sourceUrl: url,
      previewUrl: `/api/preview?url=${encodeURIComponent(url)}`,
      downloads
    };
  } catch (error) {
    throw normalizeInstagramError(error);
  }
}

module.exports = {
  downloadInstagram
};
