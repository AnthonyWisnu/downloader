const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com"
]);

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
  "www.instagr.am"
]);

function getPlatform(hostname) {
  if (TIKTOK_HOSTS.has(hostname) || hostname.endsWith(".tiktok.com")) {
    return "tiktok";
  }

  if (INSTAGRAM_HOSTS.has(hostname) || hostname.endsWith(".instagram.com")) {
    return "instagram";
  }

  return null;
}

function sanitizeUrl(rawUrl) {
  if (typeof rawUrl !== "string") {
    return {
      ok: false,
      error: "URL tidak valid atau konten tidak dapat diakses"
    };
  }

  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    return {
      ok: false,
      error: "URL tidak valid atau konten tidak dapat diakses"
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return {
      ok: false,
      error: "URL tidak valid atau konten tidak dapat diakses"
    };
  }

  if (!SUPPORTED_PROTOCOLS.has(parsedUrl.protocol)) {
    return {
      ok: false,
      error: "URL tidak valid atau konten tidak dapat diakses"
    };
  }

  parsedUrl.hash = "";

  const hostname = parsedUrl.hostname.toLowerCase();
  const platform = getPlatform(hostname);

  if (!platform) {
    return {
      ok: false,
      error: "URL tidak valid atau konten tidak dapat diakses"
    };
  }

  return {
    ok: true,
    platform,
    url: parsedUrl.toString()
  };
}

module.exports = {
  sanitizeUrl
};
