import { platformLabel } from "../utils/detectPlatform";

function UrlInput({
  value,
  error,
  isLoading,
  detectedPlatform,
  canSubmit,
  onChange,
  onSubmit
}) {
  const hasError = Boolean(error);
  const hasPlatform = detectedPlatform && detectedPlatform !== "unknown";
  const statusBadgeClass =
    detectedPlatform === "tiktok"
      ? "badge-cyan"
      : detectedPlatform === "instagram"
        ? "badge-pink"
        : "badge-yellow";

  return (
    <form className="url-form" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="url-input">
        URL TikTok atau Instagram
      </label>

      <input
        id="url-input"
        className={hasError ? "url-field has-error" : "url-field"}
        type="url"
        value={value}
        placeholder="Tempel link TikTok atau Instagram di sini..."
        autoComplete="off"
        spellCheck="false"
        aria-invalid={hasError}
        disabled={isLoading}
        onChange={(event) => onChange(event.target.value)}
      />

      <p className="url-microcopy mono">
        Mendukung TikTok video, Instagram Reels, Post, dan Story
      </p>

      <button
        className="url-grab btn btn-block"
        type="submit"
        disabled={!canSubmit}
        aria-label="Grab konten"
      >
        {isLoading ? "GRABBING..." : "GRAB"}
      </button>

      <div className="url-status mono" aria-live="polite">
        {hasPlatform ? (
          <span className={`badge ${statusBadgeClass}`}>
            PLATFORM: {platformLabel(detectedPlatform)}
          </span>
        ) : (
          <span className="url-status-empty">INPUT: KOSONG</span>
        )}
      </div>
    </form>
  );
}

export default UrlInput;
