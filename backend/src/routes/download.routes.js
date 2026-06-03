const express = require("express");
const { downloadContent, healthCheck } = require("../controllers/download.controller");

const router = express.Router();

router.get("/health", healthCheck);
router.post("/download", downloadContent);

module.exports = router;
