import { platformLabel, typeLabel } from "./detectPlatform";
import { getMediaUrl } from "./mediaProxy";

const PORTRAIT_TYPES = new Set(["shorts", "reels", "story", "story_photo"]);
const IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);

function parseQuality(label = "") {
  const clean = label.toUpperCase();
  const resMatch = clean.match(/(\d{3,4}[P|K])/i);
  if (resMatch) return resMatch[1];
  if (clean.includes("NO WATERMARK") || clean.includes("HD")) return "HD";
  if (clean.includes("WATERMARK") || clean.includes("SD")) return "SD";
  if (clean.includes("ORIG")) return "ORIGINAL";
  return "STANDARD";
}

function parseFormat(download = {}) {
  const format = String(download.format || "").toLowerCase();
  if (format) return format;

  const label = String(download.label || "").toLowerCase();
  if (label.includes("mp4") || label.includes("video")) return "mp4";
  if (label.includes("mp3") || label.includes("audio")) return "mp3";
  if (label.includes("jpg") || label.includes("photo") || label.includes("image")) return "jpg";
  return "bin";
}

function categorizeDownload(download = {}) {
  const format = parseFormat(download);
  const label = String(download.label || "").toLowerCase();

  if (format === "mp3" || label.includes("audio")) {
    return "audio";
  }
  if (IMAGE_FORMATS.has(format) || label.includes("image") || label.includes("photo") || label.includes("slideshow")) {
    return "image";
  }
  return "video";
}

function normalizeDownloadItem(download, index) {
  const category = categorizeDownload(download);
  const format = parseFormat(download);
  const label = download.label || `Download ${index + 1}`;
  const quality = parseQuality(label);
  const rawUrl = download.url || "";
  const directUrl = getMediaUrl(rawUrl, { download: true });
  const streamUrl = getMediaUrl(rawUrl);

  return {
    id: `${category}-${format}-${index}`,
    label,
    format: format.toUpperCase(),
    quality,
    category,
    rawUrl,
    directUrl,
    streamUrl,
    size: download.size || null
  };
}

export function adaptMediaResult(raw = {}) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const platform = String(raw.platform || "unknown").toLowerCase();
  const type = String(raw.type || "video").toLowerCase();
  const title = raw.title || raw.description || "Untitled Media";
  const thumbnail = raw.thumbnail || null;
  const sourceUrl = raw.sourceUrl || null;
  const author = raw.author || raw.uploader || null;

  const downloads = Array.isArray(raw.downloads)
    ? raw.downloads
        .filter((d) => d && d.url)
        .map(normalizeDownloadItem)
    : [];

  const videoDownloads = downloads.filter((d) => d.category === "video");
  const audioDownloads = downloads.filter((d) => d.category === "audio");
  const imageDownloads = downloads.filter((d) => d.category === "image");

  const isPortrait =
    platform === "tiktok" ||
    PORTRAIT_TYPES.has(type) ||
    type === "story";

  const hasImageSlideshow =
    type === "slideshow" ||
    type === "photo" ||
    type === "carousel" ||
    imageDownloads.length > 0;

  // Determine best preview stream
  let previewUrl = raw.previewUrl ? getMediaUrl(raw.previewUrl) : null;
  if (!previewUrl && videoDownloads.length > 0) {
    previewUrl = videoDownloads[0].streamUrl;
  }

  const audioWarning =
    platform === "instagram" && raw.audioStatus === "unavailable"
      ? "Audio tidak tersedia, musik dilindungi hak cipta platform."
      : null;

  return {
    platform,
    platformLabel: platformLabel(platform, type),
    type,
    typeLabel: typeLabel(type),
    title,
    author,
    thumbnail,
    previewUrl,
    sourceUrl,
    isPortrait,
    hasImageSlideshow,
    audioWarning,
    videoDownloads,
    audioDownloads,
    imageDownloads,
    downloads
  };
}
