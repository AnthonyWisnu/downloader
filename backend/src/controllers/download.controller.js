const { sanitizeUrl } = require("../utils/sanitizeUrl");
const { downloadTikTok } = require("../services/tiktok.service");
const { downloadInstagram } = require("../services/instagram.service");

const DEFAULT_ERROR = "URL tidak valid atau konten tidak dapat diakses";

function formatApiError(message) {
  const cleanMessage = message || DEFAULT_ERROR;

  if (cleanMessage.startsWith("ERR:")) {
    return cleanMessage;
  }

  return `ERR: ${cleanMessage}`;
}

function healthCheck(req, res) {
  res.json({ status: "ok" });
}

async function downloadContent(req, res) {
  const sanitized = sanitizeUrl(req.body?.url);

  if (!sanitized.ok) {
    res.status(400).json({ error: formatApiError(sanitized.error) });
    return;
  }

  try {
    const result =
      sanitized.platform === "tiktok"
        ? await downloadTikTok(sanitized.url)
        : await downloadInstagram(sanitized.url);

    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 502;
    res.status(statusCode).json({
      error: formatApiError(error.message)
    });
  }
}

module.exports = {
  healthCheck,
  downloadContent
};
