import { ArrowUpRight, Clipboard } from "lucide-react";
import { YouTubeLogo, TikTokLogo, InstagramLogo, XLogo } from "./BrandLogos";
import { platformLabel } from "../utils/detectPlatform";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", renderLogo: (size) => <YouTubeLogo size={size} /> },
  { id: "tiktok", label: "TikTok", renderLogo: (size) => <TikTokLogo size={size} /> },
  { id: "instagram", label: "Instagram", renderLogo: (size) => <InstagramLogo size={size} /> },
  { id: "x", label: "X (Twitter)", renderLogo: (size) => <XLogo size={size} /> }
];

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
  const detected = detectedPlatform && detectedPlatform !== "unknown";

  async function handlePaste() {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChange(text.trim());
        }
      }
    } catch {
      // Clipboard permission denied or unsupported
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit && !isLoading) {
        onSubmit(event);
      }
    }
  }

  return (
    <form className="url-form" onSubmit={onSubmit} noValidate>
      <div className="url-form-header mono">
        <label htmlFor="url-input" className="url-input-label">
          SOURCE STREAM URL_
        </label>
        {navigator?.clipboard?.readText ? (
          <button
            type="button"
            className="url-paste-btn"
            onClick={handlePaste}
            disabled={isLoading}
            title="Paste dari clipboard"
            aria-label="Paste dari clipboard"
          >
            <Clipboard size={14} strokeWidth={2.5} aria-hidden="true" />
            <span>PASTE LINK</span>
          </button>
        ) : null}
      </div>

      <div className={`url-input-wrapper ${hasError ? "has-error" : ""} ${detected ? `detected-${detectedPlatform}` : ""}`}>
        <input
          id="url-input"
          className="url-field mono"
          type="url"
          value={value}
          placeholder="PASTE LINK (YOUTUBE, TIKTOK, INSTAGRAM, X)..."
          autoComplete="off"
          spellCheck="false"
          aria-invalid={hasError}
          disabled={isLoading}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="url-submit-btn mono"
          type="submit"
          disabled={!canSubmit || isLoading}
          aria-label="Analisis URL media"
        >
          {isLoading ? (
            <span className="url-btn-text">ANALYZING...</span>
          ) : (
            <>
              <span className="url-btn-text">ANALYZE</span>
              <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <div className="url-footer mono">
        <div className="url-platforms-row" aria-label="Platform terdeteksi">
          <span className="url-platforms-prefix">PLATFORMS:</span>
          <div className="url-platform-chips">
            {PLATFORMS.map((p) => {
              const isCurrent = detected && detectedPlatform === p.id;
              return (
                <div
                  key={p.id}
                  className={`url-platform-chip chip-${p.id} ${isCurrent ? "is-active" : ""}`}
                  title={p.label}
                >
                  <span className="chip-logo">{p.renderLogo(16)}</span>
                  <span className="chip-name">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="url-state-indicator" aria-live="polite">
          {detected ? (
            <span className="url-detected-label">
              READY: {platformLabel(detectedPlatform)}
            </span>
          ) : (
            <span className="url-idle-label">WAITING FOR URL_</span>
          )}
        </div>
      </div>
    </form>
  );
}

export default UrlInput;
