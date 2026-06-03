function getDownloader() {
  const tiktokApi = require("@tobyg74/tiktok-api-dl");

  return (
    tiktokApi.Downloader ||
    tiktokApi.TiktokDL ||
    tiktokApi.tiktokdl ||
    tiktokApi.tiktokDl ||
    tiktokApi.default ||
    tiktokApi
  );
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }

    if (Array.isArray(value)) {
      const match = value.find((item) => typeof item === "string" && item.length > 0);

      if (match) {
        return match;
      }
    }
  }

  return "";
}

function collectDownloads(result) {
  const payload = result.result || result.data || result;
  const downloads = [];

  const videoUrl = firstString(
    payload.nowm,
    payload.no_watermark,
    payload.noWatermark,
    payload.video_no_watermark,
    payload.videoHD,
    payload.videoSD,
    payload.video?.noWatermark,
    payload.video?.nowm,
    payload.video?.url,
    payload.video?.playAddr,
    payload.video?.downloadAddr,
    payload.direct
  );

  if (videoUrl) {
    downloads.push({
      label: "Video (No Watermark)",
      url: videoUrl,
      format: "mp4"
    });
  }

  const watermarkUrl = firstString(
    payload.wm,
    payload.watermark,
    payload.video_watermark,
    payload.videoWatermark,
    payload.video?.watermark
  );

  if (watermarkUrl) {
    downloads.push({
      label: "Video (Watermark)",
      url: watermarkUrl,
      format: "mp4"
    });
  }

  const audioUrl = firstString(
    payload.music,
    payload.audio,
    payload.audio_url,
    payload.music?.playUrl,
    payload.music_info?.play,
    payload.musicInfo?.play
  );

  if (audioUrl) {
    downloads.push({
      label: "Audio Only",
      url: audioUrl,
      format: "mp3"
    });
  }

  const images = payload.images || payload.image_post?.images || payload.imagePost?.images || [];

  if (Array.isArray(images)) {
    images.forEach((imageUrl, index) => {
      if (typeof imageUrl === "string" && imageUrl.length > 0) {
        downloads.push({
          label: `Slideshow Image ${index + 1}`,
          url: imageUrl,
          format: "jpg"
        });
      }
    });
  }

  return downloads;
}

function getMetadata(result) {
  const payload = result.result || result.data || result;

  return {
    title: firstString(payload.title, payload.desc, payload.description, "TikTok content"),
    thumbnail: firstString(
      payload.cover,
      payload.thumbnail,
      payload.video?.cover,
      payload.video?.originCover,
      payload.video?.dynamicCover
    )
  };
}

async function downloadTikTok(url) {
  const downloader = getDownloader();

  if (typeof downloader !== "function") {
    throw new Error("Downloader TikTok tidak tersedia");
  }

  const result = await downloader(url, { version: "v1" });
  const downloads = collectDownloads(result);

  if (downloads.length === 0) {
    throw new Error("URL tidak valid atau konten tidak dapat diakses");
  }

  const metadata = getMetadata(result);
  const hasImages = downloads.some((download) => download.format === "jpg");

  return {
    platform: "tiktok",
    type: hasImages ? "slideshow" : "video",
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    downloads
  };
}

module.exports = {
  downloadTikTok
};
