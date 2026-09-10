const archiver = require("archiver");
const axios = require("axios");
const { validateMediaUrl } = require("./media.controller");
const { sanitizeSafeFilename } = require("../utils/filenameHelper");

function sanitizeFilename(name) {
  return String(name || "slides")
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 45) || "slides";
}

async function createBatchZip(req, res) {
  try {
    let title = "slides";
    let items = [];
    const customFilename = req.body?.filename || req.query?.filename;

    if (req.method === "POST") {
      title = req.body?.title || title;
      items = Array.isArray(req.body?.items) ? req.body.items : [];
    } else if (req.method === "GET") {
      title = req.query?.title || title;
      try {
        items = JSON.parse(req.query?.items || "[]");
      } catch {
        items = [];
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "ERR: Daftar media untuk ZIP kosong atau tidak valid" });
    }

    // Batasi hingga 50 item per batch agar performa server terjaga
    const safeItems = items.slice(0, 50);
    let zipFilename;
    if (customFilename && typeof customFilename === "string") {
      zipFilename = sanitizeSafeFilename(customFilename, "zip");
    } else {
      const cleanTitle = sanitizeFilename(title);
      zipFilename = `VOID_${cleanTitle}_all-slides.zip`;
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const archive = archiver("zip", {
      zlib: { level: 6 }
    });

    archive.on("warning", (warn) => {
      console.warn("[batch-zip] Warning:", warn.message);
    });

    archive.on("error", (err) => {
      console.error("[batch-zip] Error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "ERR: Gagal memproses arsip ZIP" });
      } else {
        res.end();
      }
    });

    archive.pipe(res);

    for (let i = 0; i < safeItems.length; i++) {
      const item = safeItems[i];
      const rawUrl = typeof item === "string" ? item : (item?.url || item?.rawUrl);

      if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.startsWith("http")) {
        continue;
      }

      try {
        const parsedUrl = await validateMediaUrl(rawUrl);
        const format = String(item?.format || "").toLowerCase();
        let ext = format === "png" || format === "mp4" || format === "webp" ? format : "jpg";

        if (rawUrl.includes(".png")) ext = "png";
        if (rawUrl.includes(".mp4")) ext = "mp4";

        const slideName = item?.filename
          ? sanitizeSafeFilename(item.filename, ext)
          : `slide-${String(i + 1).padStart(2, "0")}.${ext}`;

        const streamResponse = await axios.get(parsedUrl.toString(), {
          responseType: "stream",
          timeout: 25000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            Referer: parsedUrl.origin
          }
        });

        archive.append(streamResponse.data, { name: slideName });
      } catch (itemErr) {
        console.warn(`[batch-zip] Lewati slide ${i + 1} karena error: ${itemErr.message}`);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("[batch-zip] Exception:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "ERR: Gagal membuat arsip ZIP" });
    }
  }
}

module.exports = {
  createBatchZip
};
