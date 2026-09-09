const fs = require("fs");
const path = require("path");
const { runYtDlp, parseYtDlpJson } = require("../utils/execTool");
const { createServiceError } = require("../utils/errors");
const { validateYoutubeCookies } = require("./cookies.service");
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
  "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/bestvideo[ext=mp4]+bestaudio/best[ext=mp4]/best";
const FALLBACK_MERGE_FORMAT = "bestvideo+bestaudio/best/18";
const OUTPUT_EXTENSIONS = ["mp4", "mkv", "webm"];

function normalizeYouTubeError(error) {
  const raw = [error?.stderr, error?.stdout, error?.message].filter(Boolean).join("\n").toLowerCase();

  if (raw.includes("private video") || raw.includes("this video is private")) {
    return createServiceError("Video tidak ditemukan atau bersifat privat", 404);
  }

  if (raw.includes("sign in to confirm you're not a bot") || raw.includes("confirm your age")) {
    return createServiceError("Konten YouTube memerlukan autentikasi cookies", 401);
  }

  if (raw.includes("video unavailable") || raw.includes("this video is unavailable")) {
    return createServiceError("Video YouTube tidak tersedia atau telah dihapus", 404);
  }

  if (raw.includes("http error 404")) {
    return createServiceError("Konten tidak ditemukan", 404);
  }

  return createServiceError("Gagal memproses URL YouTube");
}

function getCookieArgs() {
  const cookies = validateYoutubeCookies();
  return cookies.ok ? ["--cookies", cookies.path] : [];
}

async function fetchYouTubeMetadata(url) {
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

async function createYouTubeSourceVideo(url, sourcePath) {
  let mergedPath;

  try {
    mergedPath = await runYtDlpVideoDownload(url, sourcePath, PRIMARY_MERGE_FORMAT);
  } catch (error) {
    mergedPath = await runYtDlpVideoDownload(url, sourcePath, FALLBACK_MERGE_FORMAT);
  }

  if (!mergedPath) {
    throw new Error("File unduhan video YouTube kosong");
  }

  if (mergedPath !== sourcePath) {
    fs.renameSync(mergedPath, sourcePath);
  }
}

async function downloadYouTubeAudio(url) {
  ensureCacheDir();

  const token = getCacheToken(`youtube-audio:${url}`);
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
    throw new Error("File audio YouTube kosong");
  }

  return {
    token,
    path: outputPath
  };
}

function detectYouTubeType(url) {
  return String(url || "").toLowerCase().includes("/shorts/") ? "shorts" : "video";
}

async function downloadYouTube(url) {
  try {
    const metadata = await fetchYouTubeMetadata(url);
    const videoFile = await getOrCreateNormalizedVideo({
      sourceKey: `youtube-video:${url}`,
      sourceExtension: "mp4",
      platform: "youtube",
      createSource(sourcePath) {
        return createYouTubeSourceVideo(url, sourcePath);
      }
    });

    const downloads = [
      {
        label: "MP4 / VIDEO",
        url: `/api/file?token=${videoFile.token}&download=1`,
        format: "mp4"
      }
    ];

    try {
      const audioFile = await downloadYouTubeAudio(url);
      downloads.push({
        label: "Audio Only",
        url: `/api/file?token=${audioFile.token}&kind=audio&download=1`,
        format: "mp3"
      });
    } catch {
      // Audio optional jika ekstraksi audio gagal
    }

    const title = metadata.title || "YouTube video";
    const thumbnail = metadata.thumbnail || null;
    const type = detectYouTubeType(url);

    return {
      platform: "youtube",
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

    throw normalizeYouTubeError(error);
  }
}

module.exports = {
  downloadYouTube
};
