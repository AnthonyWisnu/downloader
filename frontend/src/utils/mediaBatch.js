import axios from "axios";

export async function downloadAllAsZip(title, items, setZippingState) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  if (typeof setZippingState === "function") {
    setZippingState(true);
  }

  try {
    const payload = {
      title: title || "slides",
      items: items.map((item, idx) => ({
        url: item.rawUrl || item.url || item.directUrl,
        format: item.format || "jpg",
        filename: `slide-${String(idx + 1).padStart(2, "0")}.${item.format ? String(item.format).toLowerCase() : "jpg"}`
      }))
    };

    const response = await axios.post("/api/batch/zip", payload, {
      responseType: "blob",
      timeout: 120000
    });

    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/zip" }));
    const safeTitle = String(title || "slides")
      .trim()
      .replace(/[^\w.-]+/g, "_")
      .slice(0, 35) || "slides";

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", `void-${safeTitle}-all-slides.zip`);
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
