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

function validateInstagramCookies() {
  const cookiesPath = getInstagramCookiesPath();

  if (!fs.existsSync(cookiesPath)) {
    return {
      ok: false,
      path: cookiesPath,
      error: "Cookies Instagram belum tersedia"
    };
  }

  const stats = fs.statSync(cookiesPath);

  if (!stats.isFile() || stats.size === 0) {
    return {
      ok: false,
      path: cookiesPath,
      error: "Cookies Instagram tidak valid"
    };
  }

  const content = fs.readFileSync(cookiesPath, "utf8");
  const hasCookieLine = content
    .split(/\r?\n/)
    .some((line) => {
      const trimmedLine = line.trim();
      return trimmedLine && !trimmedLine.startsWith("#") && trimmedLine.split(/\s+/).length >= 7;
    });

  if (!hasCookieLine) {
    return {
      ok: false,
      path: cookiesPath,
      error: "Cookies Instagram harus memakai format Netscape .txt"
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

  console.log("cookies loaded: OK");
}

module.exports = {
  getInstagramCookiesPath,
  validateInstagramCookiesOnStartup,
  validateInstagramCookies
};
