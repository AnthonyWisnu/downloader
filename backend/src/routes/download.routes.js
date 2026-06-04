const express = require("express");
const { downloadContent, healthCheck } = require("../controllers/download.controller");
const { downloadFile } = require("../controllers/file.controller");
const { proxyMedia } = require("../controllers/media.controller");
const { previewMedia } = require("../controllers/preview.controller");

const router = express.Router();

router.get("/health", healthCheck);
router.get("/file", downloadFile);
router.get("/media", proxyMedia);
router.get("/preview", previewMedia);
router.post("/download", downloadContent);

module.exports = router;
