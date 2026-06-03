const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

export function getMediaUrl(url, options = {}) {
  if (!url) {
    return "";
  }

  const params = new URLSearchParams({
    url
  });

  if (options.download) {
    params.set("download", "1");
  }

  return `${API_BASE_URL}/media?${params.toString()}`;
}
