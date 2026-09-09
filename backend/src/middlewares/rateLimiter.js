const rateLimit = require("express-rate-limit");

const downloadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "ERR: Terlalu banyak permintaan unduhan. Silakan coba lagi setelah beberapa menit."
  }
});

const mediaStreamRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "ERR: Terlalu banyak request media. Harap tunggu sebentar."
  }
});

module.exports = {
  downloadRateLimiter,
  mediaStreamRateLimiter
};
