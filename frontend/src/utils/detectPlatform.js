export function detectPlatform(url) {
  if (!url) {
    return "unknown";
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes("tiktok.com")) {
      return "tiktok";
    }

    if (hostname.includes("instagram.com") || hostname.includes("instagr.am")) {
      return "instagram";
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

export function platformLabel(platform, type) {
  if (platform === "tiktok") {
    return "TIKTOK";
  }

  if (platform === "instagram" && type === "story") {
    return "INSTAGRAM STORY";
  }

  if (platform === "instagram") {
    return "INSTAGRAM";
  }

  return "UNKNOWN";
}

export function typeLabel(type) {
  const labels = {
    video: "VIDEO",
    audio: "AUDIO",
    slideshow: "SLIDESHOW",
    reels: "REELS",
    story: "STORY",
    image: "IMAGE"
  };

  return labels[type] || "VIDEO";
}
