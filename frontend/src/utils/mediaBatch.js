import axios from "axios";
import { generateMediaFilename } from "./filenameHelper";

export async function downloadAllAsZip(title, items, setZippingState, mediaContext = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  if (typeof setZippingState === "function") {
    setZippingState(true);
  }

  try {
    const total = items.length;
    const platform = mediaContext.platform || "";
    const author = mediaContext.author || "";
    const sourceUrl = mediaContext.sourceUrl || "";
    const postTitle = mediaContext.title || title || "slides";

    const zipFilename = generateMediaFilename({
      platform,
      author,
      title: postTitle,
      sourceUrl,
      kind: "zip",
      totalSlides: total,
      format: "zip"
    });

    const payload = {
      title: postTitle,
      filename: zipFilename,
      items: items.map((item, idx) => {
        const itemFormat = item.format ? String(item.format).toLowerCase() : "jpg";
        const itemFilename = item.filename || generateMediaFilename({
          platform,
          author,
          title: postTitle,
          sourceUrl,
          kind: "slide",
          slideIndex: idx + 1,
          totalSlides: total,
          format: itemFormat
        });

        return {
          url: item.rawUrl || item.url || item.directUrl,
          format: itemFormat,
          filename: itemFilename
        };
      })
    };

    const response = await axios.post("/api/batch/zip", payload, {
      responseType: "blob",
      timeout: 120000
    });

    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/zip" }));

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", zipFilename);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      link.remove();
    }, 1500);
  } catch (error) {
    console.error("[mediaBatch] Gagal mengunduh paket ZIP:", error);
    alert("Gagal mengunduh seluruh slide dalam bentuk ZIP. Anda tetap dapat mengunduh tiap slide secara manual.");
  } finally {
    if (typeof setZippingState === "function") {
      setZippingState(false);
    }
  }
}
