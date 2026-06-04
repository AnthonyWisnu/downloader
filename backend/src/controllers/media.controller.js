const dns = require("dns/promises");
const net = require("net");
const axios = require("axios");
const { downloadFile } = require("./file.controller");

const DEFAULT_ERROR = "Media tidak dapat diputar";

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

  return headers;
}

function setProxyHeaders(res, upstream, shouldDownload) {
  const passthroughHeaders = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges"
  ];

  passthroughHeaders.forEach((header) => {
    const value = upstream.headers[header];

    if (value) {
      res.setHeader(header, value);
    }
  });

  if (shouldDownload) {
    res.setHeader("Content-Disposition", "attachment; filename=\"void-download\"");
  }
}

async function proxyMedia(req, res) {
  try {
    if (typeof req.query.url === "string" && req.query.url.startsWith("/api/file?")) {
      const internalUrl = new URL(req.query.url, "http://127.0.0.1");
      req.query.token = internalUrl.searchParams.get("token") || "";
      req.query.download = req.query.download === "1" ? "1" : internalUrl.searchParams.get("download");
      downloadFile(req, res);
      return;
    }

    const parsedUrl = await validateMediaUrl(req.query.url);
    const shouldDownload = req.query.download === "1";
    const upstream = await axios.get(parsedUrl.toString(), {
      headers: getRequestHeaders(req, parsedUrl),
      responseType: "stream",
      timeout: 60000,
      maxRedirects: 5,
      validateStatus(status) {
        return status >= 200 && status < 400;
      }
    });

    res.status(upstream.status);
    setProxyHeaders(res, upstream, shouldDownload);
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
  proxyMedia
};
