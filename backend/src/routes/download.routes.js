const express = require("express");
const { downloadContent, healthCheck } = require("../controllers/download.controller");
const { downloadFile } = require("../controllers/file.controller");
const { proxyMedia } = require("../controllers/media.controller");
const { downloadRateLimiter, mediaStreamRateLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.get("/health", healthCheck);
router.get("/file", mediaStreamRateLimiter, downloadFile);
router.get("/media", mediaStreamRateLimiter, proxyMedia);
router.post("/download", downloadRateLimiter, downloadContent);

module.exports = router;
