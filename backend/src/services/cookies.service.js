const fs = require("fs");
const path = require("path");

function resolveFromBackend(relativeOrAbsolutePath) {
  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }

  return path.resolve(__dirname, "..", "..", relativeOrAbsolutePath);
}

function getInstagramCookiesPath() {
  const configuredPath = process.env.IG_COOKIES_PATH || "./cookies/ig_cookies.txt";
  return resolveFromBackend(configuredPath);
}

function getYoutubeCookiesPath() {
  const configuredPath = process.env.YT_COOKIES_PATH || "./cookies/yt_cookies.txt";
  return resolveFromBackend(configuredPath);
}

function getXCookiesPath() {
  const configuredPath = process.env.X_COOKIES_PATH || "./cookies/x_cookies.txt";
  return resolveFromBackend(configuredPath);
}

function isValidNetscapeCookieFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { ok: false, error: "File cookies belum tersedia" };
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile() || stats.size === 0) {
    return { ok: false, error: "File cookies kosong" };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const hasCookieLine = content
    .split(/\r?\n/)
    .some((line) => {
      const trimmedLine = line.trim();
      return trimmedLine && !trimmedLine.startsWith("#") && trimmedLine.split(/\s+/).length >= 7;
    });

  if (!hasCookieLine) {
    return { ok: false, error: "Format cookies harus memakai format Netscape .txt" };
  }

  return { ok: true };
}

function validateInstagramCookies() {
  const cookiesPath = getInstagramCookiesPath();
  const check = isValidNetscapeCookieFile(cookiesPath);

  if (!check.ok) {
    return {
      ok: false,
      path: cookiesPath,
      error: check.error === "File cookies belum tersedia"
        ? "Cookies Instagram belum tersedia"
        : check.error === "Format cookies harus memakai format Netscape .txt"
          ? "Cookies Instagram harus memakai format Netscape .txt"
          : "Cookies Instagram tidak valid"
    };
  }

  return {
    ok: true,
    path: cookiesPath
  };
}

function validateYoutubeCookies() {
  const cookiesPath = getYoutubeCookiesPath();
  const check = isValidNetscapeCookieFile(cookiesPath);

  if (!check.ok) {
    return {
      ok: false,
      path: cookiesPath,
      error: check.error === "File cookies belum tersedia"
        ? "Cookies YouTube belum tersedia"
        : check.error === "Format cookies harus memakai format Netscape .txt"
          ? "Cookies YouTube harus memakai format Netscape .txt"
          : "Cookies YouTube tidak valid"
    };
  }

  return {
    ok: true,
    path: cookiesPath
  };
}

function validateXCookies() {
  const cookiesPath = getXCookiesPath();
  const check = isValidNetscapeCookieFile(cookiesPath);

  if (!check.ok) {
    return {
      ok: false,
      path: cookiesPath,
      error: check.error === "File cookies belum tersedia"
        ? "Cookies X belum tersedia"
        : check.error === "Format cookies harus memakai format Netscape .txt"
          ? "Cookies X harus memakai format Netscape .txt"
          : "Cookies X tidak valid"
    };
  }

  return {
    ok: true,
    path: cookiesPath
  };
}

function validateInstagramCookiesOnStartup() {
  const cookiesPath = getInstagramCookiesPath();

  if (!fs.existsSync(cookiesPath)) {
    console.warn(`cookies warning: ig_cookies.txt not found at ${cookiesPath}`);
    return;
  }

  const stats = fs.statSync(cookiesPath);

  if (!stats.isFile() || stats.size === 0) {
    console.warn(`cookies warning: ig_cookies.txt is empty at ${cookiesPath}`);
    return;
  }

  console.log("instagram cookies loaded: OK");
}

function validateYoutubeCookiesOnStartup() {
  const cookiesPath = getYoutubeCookiesPath();

  if (!fs.existsSync(cookiesPath)) {
    console.warn(`cookies notice: yt_cookies.txt not found at ${cookiesPath} (optional for public videos)`);
    return;
  }

  const stats = fs.statSync(cookiesPath);

  if (!stats.isFile() || stats.size === 0) {
    console.warn(`cookies warning: yt_cookies.txt is empty at ${cookiesPath}`);
    return;
  }

  console.log("youtube cookies loaded: OK");
}

function validateXCookiesOnStartup() {
  const cookiesPath = getXCookiesPath();

  if (!fs.existsSync(cookiesPath)) {
    console.warn(`cookies notice: x_cookies.txt not found at ${cookiesPath} (optional for public tweets)`);
    return;
  }

  const stats = fs.statSync(cookiesPath);

  if (!stats.isFile() || stats.size === 0) {
    console.warn(`cookies warning: x_cookies.txt is empty at ${cookiesPath}`);
    return;
  }

  console.log("x cookies loaded: OK");
}

function validateAllCookiesOnStartup() {
  validateInstagramCookiesOnStartup();
  validateYoutubeCookiesOnStartup();
  validateXCookiesOnStartup();
}

module.exports = {
  getInstagramCookiesPath,
  getYoutubeCookiesPath,
  getXCookiesPath,
  validateInstagramCookies,
  validateYoutubeCookies,
  validateXCookies,
  validateInstagramCookiesOnStartup,
  validateYoutubeCookiesOnStartup,
  validateXCookiesOnStartup,
  validateAllCookiesOnStartup
};
