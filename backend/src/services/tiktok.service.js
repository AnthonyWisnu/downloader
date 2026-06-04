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
      const match = value.map((item) => firstString(item)).find(Boolean);

      if (match) {
        return match;
      }
    }

    if (value && typeof value === "object") {
      const match = firstString(
        value.play,
        value.playUrl,
        value.url,
        value.downloadUrl,
        value.download,
        value.href,
        value.src
      );

      if (match) {
        return match;
      }
    }
  }

  return "";
}

function findMediaUrlByKeyword(items, keywords) {
  if (!Array.isArray(items)) {
    return "";
  }

  return items
    .map((item) => {
      const descriptor = [
        item?.label,
        item?.type,
        item?.format,
        item?.quality,
        item?.mimeType,
        item?.contentType
      ].filter(Boolean).join(" ").toLowerCase();

      if (!keywords.some((keyword) => descriptor.includes(keyword))) {
        return "";
      }

      return firstString(item);
    })
    .find(Boolean) || "";
}

function collectDownloads(result) {
  const payload = result.result || result.data || result;
  const downloads = [];

  const videoUrl = firstString(
    payload.videoHD,
    payload.videoSD,
    payload.nowm,
    payload.no_watermark,
    payload.noWatermark,
    payload.video_no_watermark,
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
    payload.videoWatermark,
    payload.wm,
    payload.watermark,
    payload.video_watermark,
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
    findMediaUrlByKeyword(payload.medias, ["audio", "music", "mp3", "m4a"]),
    findMediaUrlByKeyword(payload.downloads, ["audio", "music", "mp3", "m4a"]),
    findMediaUrlByKeyword(payload.links, ["audio", "music", "mp3", "m4a"]),
    payload.music,
    payload.music?.play,
    payload.music?.playUrl,
    payload.music?.url,
    payload.music?.downloadUrl,
    payload.audio,
    payload.audio?.play,
    payload.audio?.playUrl,
    payload.audio?.url,
    payload.audio?.downloadUrl,
    payload.audio_url,
    payload.sound,
    payload.sound?.play,
    payload.sound?.playUrl,
    payload.sound?.url,
    payload.sound?.downloadUrl,
    payload.music_info?.play,
    payload.music_info?.playUrl,
    payload.music_info?.url,
    payload.music_info?.downloadUrl,
    payload.musicInfo?.play,
    payload.musicInfo?.playUrl,
    payload.musicInfo?.url,
    payload.musicInfo?.downloadUrl
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
    title: firstString(payload.desc, payload.title, payload.description, "TikTok content"),
    thumbnail: firstString(
      payload.cover,
      payload.author?.avatar,
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

  const result = await downloader(url, { version: "v3" });
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
