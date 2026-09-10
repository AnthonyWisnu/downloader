const dns = require("dns/promises");
const net = require("net");
const fs = require("fs");
const axios = require("axios");
const { downloadFile } = require("./file.controller");
const { convertWebpStreamToJpeg } = require("../services/image-download.service");

const DEFAULT_ERROR = "Media tidak dapat diputar";
const CONTENT_TYPE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "video/mp4": "mp4",
  "video/webm": "webm"
};

function isPrivateIPv4(address) {
  const parts = address.split(".").map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function isPrivateAddress(address) {
  const type = net.isIP(address);

  if (type === 4) {
    return isPrivateIPv4(address);
  }

  if (type === 6) {
    return address === "::1" || address.toLowerCase().startsWith("fc");
  }

  return true;
}

async function validateMediaUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.length === 0) {
    throw new Error(DEFAULT_ERROR);
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error(DEFAULT_ERROR);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(DEFAULT_ERROR);
  }

  const records = await dns.lookup(parsedUrl.hostname, { all: true });

  if (records.length === 0 || records.some((record) => isPrivateAddress(record.address))) {
    throw new Error(DEFAULT_ERROR);
  }

  return parsedUrl;
}

function getRequestHeaders(req, parsedUrl) {
  const headers = {
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36"
  };

  if (req.headers.range) {
    headers.Range = req.headers.range;
  }

  if (parsedUrl.hostname.includes("instagram") || parsedUrl.hostname.includes("fbcdn")) {
    headers.Referer = "https://www.instagram.com/";
  }

  if (parsedUrl.hostname.includes("tiktok")) {
    headers.Referer = "https://www.tiktok.com/";
  }

  if (
    parsedUrl.hostname.includes("youtube") ||
    parsedUrl.hostname.includes("googlevideo") ||
    parsedUrl.hostname.includes("ggpht.com")
  ) {
    headers.Referer = "https://www.youtube.com/";
  }

  if (
    parsedUrl.hostname.includes("twitter") ||
    parsedUrl.hostname.includes("x.com") ||
    parsedUrl.hostname.includes("twimg.com")
  ) {
    headers.Referer = "https://x.com/";
  }

  return headers;
}

function getContentType(upstream, parsedUrl) {
  const upstreamType = String(upstream.headers["content-type"] || "").split(";")[0].trim();

  if (upstreamType) {
    return upstreamType;
  }

  const extension = getUrlExtension(parsedUrl);

  if (["jpg", "jpeg"].includes(extension)) {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "mp3") {
    return "audio/mpeg";
  }

  if (extension === "mp4") {
    return "video/mp4";
  }

  return "application/octet-stream";
}

function getUrlExtension(parsedUrl) {
  const pathname = parsedUrl.pathname.toLowerCase();
  const match = /\.([a-z0-9]+)$/.exec(pathname);

  return match ? match[1] : "";
}

function getDownloadFilename(contentType, parsedUrl) {
  const normalizedType = String(contentType || "").toLowerCase();
  const mappedExtension = CONTENT_TYPE_EXTENSIONS[normalizedType];
  const urlExtension = getUrlExtension(parsedUrl);
  const extension = mappedExtension || urlExtension || "bin";

  if (normalizedType.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    const imageExtension = extension === "jpeg" ? "jpg" : extension;
    return `void-image.${imageExtension}`;
  }

  if (normalizedType.startsWith("audio/") || ["mp3", "m4a", "aac"].includes(extension)) {
    return `void-audio.${extension}`;
  }

  if (normalizedType.startsWith("video/") || ["mp4", "webm"].includes(extension)) {
    return `void-video.${extension}`;
  }

  return `void-download.${extension}`;
}

function setProxyHeaders(res, upstream, shouldDownload, parsedUrl) {
  const contentType = getContentType(upstream, parsedUrl);
  const passthroughHeaders = [
    "content-length",
    "content-range",
    "accept-ranges"
  ];

  res.setHeader("Content-Type", contentType);

  passthroughHeaders.forEach((header) => {
    const value = upstream.headers[header];

    if (value) {
      res.setHeader(header, value);
    }
  });

  if (shouldDownload) {
    const filename = getDownloadFilename(contentType, parsedUrl);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }
}

async function sendConvertedWebpDownload(res, upstream) {
  const converted = await convertWebpStreamToJpeg(upstream.data);
  const stat = fs.statSync(converted.outputPath);

  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Disposition", "attachment; filename=\"void-image.jpg\"");

  const outputStream = fs.createReadStream(converted.outputPath);
  outputStream.on("close", converted.cleanup);
  outputStream.pipe(res);
}

async function fetchSecureUpstream(initialUrl, req, maxHops = 3) {
  let currentUrl = initialUrl;
  let hops = 0;

  while (hops <= maxHops) {
    const parsedUrl = await validateMediaUrl(currentUrl);
    const headers = getRequestHeaders(req, parsedUrl);

    const response = await axios.get(parsedUrl.toString(), {
      headers,
      responseType: "stream",
      timeout: 60000,
      maxRedirects: 0,
      validateStatus(status) {
        return (status >= 200 && status < 400) || [301, 302, 303, 307, 308].includes(status);
      }
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const redirectLocation = response.headers.location;
      if (!redirectLocation) {
        throw new Error(DEFAULT_ERROR);
      }
      currentUrl = new URL(redirectLocation, parsedUrl).toString();
      hops++;
      continue;
    }

    return { response, parsedUrl };
  }

  throw new Error("Terlalu banyak redirect media");
}

async function proxyMedia(req, res) {
  try {
    if (typeof req.query.url === "string" && req.query.url.startsWith("/api/file?")) {
      const internalUrl = new URL(req.query.url, "http://127.0.0.1");
      req.query.token = internalUrl.searchParams.get("token") || "";
      req.query.kind = internalUrl.searchParams.get("kind") || "";
      req.query.download = req.query.download === "1" ? "1" : internalUrl.searchParams.get("download");
      downloadFile(req, res);
      return;
    }

    const shouldDownload = req.query.download === "1";
    const { response: upstream, parsedUrl } = await fetchSecureUpstream(req.query.url, req);

    res.status(upstream.status);
    const upstreamContentType = getContentType(upstream, parsedUrl).toLowerCase();

    if (shouldDownload && upstreamContentType === "image/webp") {
      await sendConvertedWebpDownload(res, upstream);
      return;
    }

    setProxyHeaders(res, upstream, shouldDownload, parsedUrl);
    upstream.data.pipe(res);
  } catch (error) {
    const status = error.response?.status || "no-status";
    const host = (() => {
      try {
        return new URL(req.query.url).hostname;
      } catch {
        return "invalid-host";
      }
    })();

    process.stderr.write(`media proxy failed host=${host} status=${status}\n`);

    res.status(502).json({
      error: DEFAULT_ERROR
    });
  }
}

module.exports = {
  proxyMedia,
  validateMediaUrl
};
