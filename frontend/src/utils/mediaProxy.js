const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

export function getMediaUrl(url, options = {}) {
  if (!url) {
    return "";
  }

  // Handle internal /api/file cached endpoint
  if (url.startsWith("/api/file") || url.startsWith(`${API_BASE_URL}/file`)) {
    try {
      const parsed = new URL(url, "http://127.0.0.1");
      if (options.download) {
        parsed.searchParams.set("download", "1");
      }
      if (options.filename && !parsed.searchParams.has("filename")) {
        parsed.searchParams.set("filename", options.filename);
      }
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return url;
    }
  }

  const params = new URLSearchParams({
    url
  });

  if (options.download) {
    params.set("download", "1");
  }

  if (options.filename) {
    params.set("filename", options.filename);
  }

  return `${API_BASE_URL}/media?${params.toString()}`;
}
