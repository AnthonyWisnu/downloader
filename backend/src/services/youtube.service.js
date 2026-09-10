const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { runYtDlp, parseYtDlpJson } = require("../utils/execTool");
const { createServiceError } = require("../utils/errors");
const { generateMediaFilename } = require("../utils/filenameHelper");
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

function isYouTubeCommunityUrl(url) {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("/post/") ||
    lower.includes("/community") ||
    lower.includes("?lb=") ||
    lower.includes("&lb=")
  );
}

function isCommunityPostError(error) {
  const raw = [error?.stderr, error?.stdout, error?.message].filter(Boolean).join("\n").toLowerCase();
  return raw.includes("does not have a") || raw.includes("tab") || raw.includes("no video");
}

async function extractYouTubeCommunity(url) {
  const matchLb = url.match(/[?&]lb=([a-zA-Z0-9_-]+)/);
  const targetUrl = matchLb ? `https://www.youtube.com/post/${matchLb[1]}` : url;

  let response;
  try {
    response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 15000
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw createServiceError("Postingan komunitas tidak ditemukan atau telah dihapus", 404);
    }
    throw createServiceError("Gagal mengambil data postingan komunitas YouTube");
  }

  const html = response.data;
  const match =
    html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s) ||
    html.match(/ytInitialData\s*=\s*({.+?});/s);

  if (!match) {
    throw createServiceError("Gagal membaca data postingan komunitas YouTube", 502);
  }

  let data;
  try {
    data = JSON.parse(match[1]);
  } catch {
    throw createServiceError("Gagal memproses struktur data komunitas YouTube", 502);
  }

  function findKeys(obj, target) {
    const results = [];
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        for (const item of obj) results.push(...findKeys(item, target));
      } else {
        for (const [k, v] of Object.entries(obj)) {
          if (k === target) results.push(v);
          else results.push(...findKeys(v, target));
        }
      }
    }
    return results;
  }

  const posts = findKeys(data, "backstagePostRenderer");
  if (posts.length === 0) {
    throw createServiceError("Postingan komunitas tidak ditemukan atau tidak memiliki konten publik", 404);
  }

  const post = posts[0];
  const textRuns = post.contentText?.runs || [];
  const text = textRuns.map((r) => r.text || "").join("").trim();
  const authorRuns = post.authorText?.runs || [];
  const author = authorRuns.map((r) => r.text || "").join("").trim();

  const attachment = post.backstageAttachment || {};
  const images = [];

  const multi = attachment.postMultiImageRenderer;
  if (multi && Array.isArray(multi.images)) {
    for (const item of multi.images) {
      const thumbs = item.backstageImageRenderer?.image?.thumbnails || [];
      if (thumbs.length > 0) {
        const raw = thumbs[thumbs.length - 1].url;
        images.push(raw.replace(/=s\d+.*$/, "=s0"));
      }
    }
  }

  const single = attachment.backstageImageRenderer;
  if (single && Array.isArray(single.image?.thumbnails)) {
    const thumbs = single.image.thumbnails;
    if (thumbs.length > 0) {
      const raw = thumbs[thumbs.length - 1].url;
      images.push(raw.replace(/=s\d+.*$/, "=s0"));
    }
  }

  if (images.length === 0) {
    throw createServiceError("Postingan komunitas ini tidak memiliki gambar atau foto yang dapat diunduh", 404);
  }

  const title = text || `Postingan Komunitas oleh ${author || "Kreator YouTube"}`;
  const downloads = images.map((imgUrl, index) => {
    const filename = generateMediaFilename({
      platform: "youtube",
      author: author || "creator",
      title: text || "community-post",
      sourceUrl: url,
      kind: images.length > 1 ? "slide" : "photo",
      slideIndex: images.length > 1 ? index + 1 : null,
      totalSlides: images.length > 1 ? images.length : null,
      format: "jpg"
    });

    return {
      label: images.length > 1 ? `Slideshow Image ${index + 1}` : "High-Res Photo",
      url: imgUrl,
      format: "jpg",
      filename
    };
  });

  return {
    platform: "youtube",
    type: images.length > 1 ? "slideshow" : "photo",
    title,
    author: author || null,
    thumbnail: images[0],
    sourceUrl: url,
    downloads
  };
}

function detectYouTubeType(url) {
  return String(url || "").toLowerCase().includes("/shorts/") ? "shorts" : "video";
}

async function downloadYouTube(url) {
  if (isYouTubeCommunityUrl(url)) {
    return await extractYouTubeCommunity(url);
  }

  try {
    let metadata;
    try {
      metadata = await fetchYouTubeMetadata(url);
    } catch (metaError) {
      if (isYouTubeCommunityUrl(url) || isCommunityPostError(metaError)) {
        return await extractYouTubeCommunity(url);
      }
      throw metaError;
    }

    const videoFile = await getOrCreateNormalizedVideo({
      sourceKey: `youtube-video:${url}`,
      sourceExtension: "mp4",
      platform: "youtube",
      createSource(sourcePath) {
        return createYouTubeSourceVideo(url, sourcePath);
      }
    });

    const author = metadata.uploader || metadata.channel || metadata.uploader_id || "";
    const title = metadata.title || "YouTube video";
    const thumbnail = metadata.thumbnail || null;
    const type = detectYouTubeType(url);
    const videoFilename = generateMediaFilename({
      platform: "youtube",
      author,
      title,
      sourceUrl: url,
      kind: type === "shorts" ? "shorts" : "video",
      format: "mp4"
    });

    const downloads = [
      {
        label: "MP4 / VIDEO",
        url: `/api/file?token=${videoFile.token}&download=1&filename=${encodeURIComponent(videoFilename)}`,
        format: "mp4",
        filename: videoFilename
      }
    ];

    try {
      const audioFile = await downloadYouTubeAudio(url);
      const audioFilename = generateMediaFilename({
        platform: "youtube",
        author,
        title,
        sourceUrl: url,
        kind: "audio",
        format: "mp3"
      });
      downloads.push({
        label: "Audio Only",
        url: `/api/file?token=${audioFile.token}&kind=audio&download=1&filename=${encodeURIComponent(audioFilename)}`,
        format: "mp3",
        filename: audioFilename
      });
    } catch {
      // Audio optional jika ekstraksi audio gagal
    }

    return {
      platform: "youtube",
      type,
      title,
      author: author || null,
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
