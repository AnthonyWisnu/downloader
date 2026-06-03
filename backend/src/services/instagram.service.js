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

function normalizeInstagramEntry(entry, index) {
  const directUrl = entry.url || entry.webpage_url || "";
  const ext = entry.ext || "mp4";
  const labelPrefix = ext === "jpg" || ext === "webp" ? "Image" : "Video";

  return {
    label: `${labelPrefix} ${index + 1}`,
    url: directUrl,
    format: ext
  };
}

function buildDownloads(metadata) {
  if (Array.isArray(metadata.entries) && metadata.entries.length > 0) {
    return metadata.entries
      .map((entry, index) => normalizeInstagramEntry(entry, index))
      .filter((download) => Boolean(download.url));
  }

  const format = metadata.ext || "mp4";
  const label = format === "jpg" || format === "webp" ? "Image" : "Video";
  const url = metadata.url || metadata.webpage_url || "";

  if (!url) {
    return [];
  }

  return [
    {
      label,
      url,
      format
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
