const { execFile } = require("child_process");
const fs = require("fs");
const { instagramGetUrl } = require("instagram-url-direct");
const path = require("path");
const { validateInstagramCookies } = require("./cookies.service");
const { getOrCreateNormalizedVideo } = require("./video-cache.service");

const PRIMARY_MERGE_FORMAT =
  "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc1]/best[ext=mp4]/best";
const FALLBACK_MERGE_FORMAT = "bestvideo+bestaudio/best";
const OUTPUT_EXTENSIONS = ["mp4", "mkv", "webm"];

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 16 }, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        error.stdout = stdout;
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

function getRawError(error) {
  return [error?.stderr, error?.stdout, error?.message].filter(Boolean).join("\n");
}

function logYtDlpStderr(error) {
  const stderr = String(error?.stderr || "").trim();

  if (!stderr) {
    return;
  }

  const firstLine = stderr.split(/\r?\n/).find(Boolean) || stderr;
  console.warn(`[instagram] yt-dlp stderr: ${firstLine.slice(0, 240)}`);
}

function normalizeInstagramError(error) {
  const normalized = getRawError(error).toLowerCase();

  if (normalized.includes("http error 404")) {
    return createInstagramError("ERR: Konten tidak ditemukan atau sudah dihapus", 404);
  }

  if (normalized.includes("login required")) {
    return createInstagramError("ERR: Konten membutuhkan autentikasi", 401);
  }

  if (
    normalized.includes("metadata instagram kosong") ||
    normalized.includes("output json kosong") ||
    normalized.includes("unexpected end of json input")
  ) {
    return createInstagramError("ERR: Gagal mengambil metadata, coba lagi");
  }

  return createInstagramError("ERR: Gagal memproses URL Instagram");
}

function isNoVideoFormatsError(error) {
  return getRawError(error).toLowerCase().includes("no video formats found");
}

function parseYtDlpJson(output) {
  const trimmedOutput = String(output || "").trim();

  if (!trimmedOutput) {
    throw new Error("Metadata Instagram kosong");
  }

  try {
    return JSON.parse(trimmedOutput);
  } catch {
    const lines = trimmedOutput.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    try {
      return JSON.parse(lines[lines.length - 1]);
    } catch {
      throw new Error("Output JSON kosong");
    }
  }
}

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function getItems(metadata) {
  if (metadata?._type === "playlist" && Array.isArray(metadata.entries)) {
    return metadata.entries.filter(Boolean);
  }

  return [metadata].filter(Boolean);
}

function detectInstagramType(url, metadata) {
  const source = String(metadata?.webpage_url || metadata?.original_url || url || "").toLowerCase();

  if (source.includes("/stories/")) {
    return "story";
  }

  if (source.includes("/reel/") || source.includes("/reels/")) {
    return "reels";
  }

  return "video";
}

function getFormatScore(format) {
  return Number(format?.tbr || 0) * 1000000 +
    Number(format?.height || 0) * 1000 +
    Number(format?.width || 0);
}

function hasAudioStream(metadata) {
  return getItems(metadata).some((item) => {
    const formats = Array.isArray(item?.formats) ? item.formats : [];

    return formats.some((format) => {
      const acodec = String(format?.acodec || "").toLowerCase();
      return Boolean(acodec) && acodec !== "none";
    });
  });
}

function hasUsableAudioCodec(format) {
  const acodec = String(format?.acodec || "").toLowerCase();
  return Boolean(acodec) && acodec !== "none";
}

function hasNoVideoCodec(format) {
  const vcodec = String(format?.vcodec || "").toLowerCase();
  return !vcodec || vcodec === "none";
}

function isSupportedAudioExt(format) {
  return ["m4a", "mp4", "aac"].includes(String(format?.ext || "").toLowerCase());
}

function extractAudioUrl(metadata) {
  const audioFormats = getItems(metadata)
    .flatMap((item) => Array.isArray(item?.formats) ? item.formats : [])
    .filter((format) =>
      isHttpUrl(format?.url) &&
      hasUsableAudioCodec(format) &&
      hasNoVideoCodec(format) &&
      isSupportedAudioExt(format)
    )
    .sort((left, right) => Number(right?.tbr || 0) - Number(left?.tbr || 0));

  return audioFormats[0]?.url || null;
}

function pickBestVideoUrl(item) {
  const formats = Array.isArray(item?.formats) ? item.formats : [];
  const bestFormat = formats
    .filter((format) => format?.ext === "mp4" && isHttpUrl(format.url))
    .sort((left, right) => getFormatScore(right) - getFormatScore(left))[0];

  if (bestFormat) {
    return bestFormat.url;
  }

  if (item?.ext === "mp4" && isHttpUrl(item.url)) {
    return item.url;
  }

  return "";
}

function buildYtDlpDownloads(metadata) {
  const items = getItems(metadata);
  const downloads = items
    .map((item, index) => {
      const url = pickBestVideoUrl(item);

      if (!url) {
        return null;
      }

      return {
        label: `MP4 / VIDEO ${index + 1}`,
        url,
        format: "mp4"
      };
    })
    .filter(Boolean);

  if (metadata?.thumbnail && detectInstagramType("", metadata) === "story") {
    downloads.unshift({
      label: "JPG / STORY IMAGE 1",
      url: metadata.thumbnail,
      format: "jpg"
    });
  }

  return downloads;
}

async function fetchYtDlpMetadata(url, cookiesPath) {
  const output = await runYtDlp([
    "--cookies",
    cookiesPath,
    "--dump-json",
    "--no-warnings",
    "--no-playlist",
    url
  ]);

  return parseYtDlpJson(output);
}

async function runYtDlpVideoDownload(url, cookiesPath, sourcePath, format) {
  const outputBase = sourcePath.replace(/\.[^.]+$/, "");
  const outputTemplate = `${outputBase}.%(ext)s`;
  const candidatePaths = OUTPUT_EXTENSIONS.map((extension) => `${outputBase}.${extension}`);

  candidatePaths.forEach((candidatePath) => {
    if (fs.existsSync(candidatePath)) {
      fs.rmSync(candidatePath, { force: true });
    }
  });

  await runYtDlp([
    "--cookies",
    cookiesPath,
    "--no-warnings",
    "--no-playlist",
    "--format",
    format,
    "--merge-output-format",
    "mp4",
    "--output",
    outputTemplate,
    url
  ]);

  return candidatePaths.find((candidatePath) =>
    fs.existsSync(candidatePath) && fs.statSync(candidatePath).size > 0
  );
}

async function createInstagramSourceVideo(url, cookiesPath, sourcePath) {
  let mergedPath;

  try {
    mergedPath = await runYtDlpVideoDownload(url, cookiesPath, sourcePath, PRIMARY_MERGE_FORMAT);
  } catch (error) {
    logYtDlpStderr(error);
    mergedPath = await runYtDlpVideoDownload(url, cookiesPath, sourcePath, FALLBACK_MERGE_FORMAT);
  }

  if (!mergedPath) {
    throw new Error("Merged file kosong");
  }

  if (mergedPath !== sourcePath) {
    fs.renameSync(mergedPath, sourcePath);
  }
}

async function downloadWithMerge(url, cookiesPath) {
  return getOrCreateNormalizedVideo({
    sourceKey: url,
    sourceExtension: "mp4",
    platform: "instagram",
    createSource(sourcePath) {
      return createInstagramSourceVideo(url, cookiesPath, sourcePath);
    }
  });
}

function detectPhotoFormat(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes(".mp4")) {
    return {
      labelFormat: "MP4",
      format: "mp4",
      type: "VIDEO"
    };
  }

  return {
    labelFormat: "JPG",
    format: "jpg",
    type: "IMAGE"
  };
}

async function fetchIgPhoto(url) {
  let data;

  try {
    data = await instagramGetUrl(url);
  } catch (error) {
    throw createInstagramError("ERR: Konten tidak dapat diakses atau tidak didukung");
  }

  const urls = Array.isArray(data?.url_list) ? data.url_list : [];
  const downloads = urls
    .filter(isHttpUrl)
    .map((mediaUrl, index) => {
      const media = detectPhotoFormat(mediaUrl);

      return {
        label: `${media.labelFormat} / ${media.type} ${index + 1}`,
        url: mediaUrl,
        format: media.format
      };
    });

  if (downloads.length === 0) {
    throw createInstagramError("ERR: Konten tidak dapat diakses atau tidak didukung");
  }

  return {
    platform: "instagram",
    type: downloads.length > 1 ? "carousel" : "photo",
    title: data?.post_info?.caption || "Instagram content",
    thumbnail: data?.media_details?.[0]?.thumbnail || data?.media_details?.[0]?.url || null,
    sourceUrl: url,
    downloads
  };
}

async function downloadInstagram(url) {
  const cookies = validateInstagramCookies();

  if (!cookies.ok) {
    throw createInstagramError(`ERR: ${cookies.error}`, 500);
  }

  try {
    const metadata = await fetchYtDlpMetadata(url, cookies.path);
    const downloads = buildYtDlpDownloads(metadata);

    if (downloads.length === 0) {
      throw new Error("No video formats found");
    }

    const videoFile = await downloadWithMerge(url, cookies.path);
    const token = videoFile.token;
    const hasAudio = hasAudioStream(metadata);
    const label = hasAudio ? "MP4 / VIDEO" : "MP4 / VIDEO (NO AUDIO)";
    const responseDownloads = [
      {
        label,
        url: `/api/file?token=${token}&download=1`,
        format: "mp4"
      }
    ];
    const audioUrl = extractAudioUrl(metadata);
    const audioStatus = audioUrl ? "available" : "unavailable";

    if (audioUrl) {
      responseDownloads.push({
        label: "Audio Only",
        url: audioUrl,
        format: "mp3"
      });
    }

    return {
      platform: "instagram",
      type: detectInstagramType(url, metadata),
      title: metadata.title || metadata.description || "Instagram content",
      thumbnail: metadata.thumbnail || null,
      sourceUrl: url,
      previewUrl: `/api/file?token=${token}`,
      audioStatus,
      downloads: responseDownloads
    };
  } catch (error) {
    if (isNoVideoFormatsError(error)) {
      logYtDlpStderr(error);
      return fetchIgPhoto(url);
    }

    if (error.message?.startsWith("ERR:")) {
      throw error;
    }

    logYtDlpStderr(error);
    throw normalizeInstagramError(error);
  }
}

module.exports = {
  downloadInstagram
};
