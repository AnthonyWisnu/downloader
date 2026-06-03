const express = require("express");
const { downloadContent, healthCheck } = require("../controllers/download.controller");
const { proxyMedia } = require("../controllers/media.controller");

const router = express.Router();

router.get("/health", healthCheck);
router.get("/media", proxyMedia);
router.post("/download", downloadContent);

module.exports = router;
