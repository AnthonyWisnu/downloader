const { execFile } = require("child_process");
const { validateInstagramCookies } = require("./cookies.service");

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 8 }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
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

function isVideoFormat(format) {
  if (!format || !isHttpUrl(format.url)) {
    return false;
  }

  if (format.vcodec === "none") {
    return false;
  }

  return format.ext === "mp4" || String(format.url).includes(".mp4");
}

function isImageFormat(format) {
  if (!format || !isHttpUrl(format.url)) {
    return false;
  }

  return ["jpg", "jpeg", "webp", "png"].includes(format.ext);
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

function getDirectMedia(entry) {
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

  const requestedFormat = Array.isArray(entry.requested_formats)
    ? entry.requested_formats.find(isVideoFormat)
    : null;

  if (requestedFormat) {
    return {
      url: requestedFormat.url,
      format: requestedFormat.ext || "mp4",
      kind: "Video"
    };
  }

  const videoFormat = pickBestFormat(entry.formats, isVideoFormat);

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

  return JSON.parse(lines[lines.length - 1]);
}

async function downloadInstagram(url) {
  const cookies = validateInstagramCookies();

  if (!cookies.ok) {
    const error = new Error(cookies.error);
    error.statusCode = 500;
    throw error;
  }

  const output = await runYtDlp([
    "--cookies",
    cookies.path,
    "--dump-json",
    "--no-warnings",
    "--no-playlist",
    "--format",
    "best[ext=mp4]/best",
    url
  ]);

  const metadata = parseYtDlpJson(output);
  const downloads = buildDownloads(metadata);

  if (downloads.length === 0) {
    throw new Error("URL tidak valid atau konten tidak dapat diakses");
  }

  return {
    platform: "instagram",
    type: detectInstagramType(metadata),
    title: metadata.title || metadata.description || "Instagram content",
    thumbnail: metadata.thumbnail || "",
    downloads
  };
}

module.exports = {
  downloadInstagram
};
