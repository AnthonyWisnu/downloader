import { ArrowUpRight, Clipboard, CornerDownLeft } from "lucide-react";
import { platformLabel } from "../utils/detectPlatform";

const PLATFORMS = [
  { id: "youtube", tag: "YT", label: "YouTube" },
  { id: "tiktok", tag: "TT", label: "TikTok" },
  { id: "instagram", tag: "IG", label: "Instagram" },
  { id: "x", tag: "X", label: "X / Twitter" }
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
          INPUT SOURCE_
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
            <span>PASTE</span>
          </button>
        ) : null}
      </div>

      <div className={`url-input-wrapper ${hasError ? "has-error" : ""}`}>
        <input
          id="url-input"
          className="url-field mono"
          type="url"
          value={value}
          placeholder="PASTE URL HERE (YOUTUBE, TIKTOK, INSTAGRAM, X)..."
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
            <span>ANALYZING...</span>
          ) : (
            <>
              <span>ANALYZE</span>
              <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <div className="url-footer mono">
        <div className="url-platforms-row" aria-label="Platform terdeteksi">
          <span className="url-platforms-prefix">SUPPORTED:</span>
          <div className="url-platform-chips">
            {PLATFORMS.map((p) => {
              const isCurrent = detected && detectedPlatform === p.id;
              return (
                <span
                  key={p.id}
                  className={`url-platform-chip ${isCurrent ? "is-active" : ""}`}
                >
                  [{p.tag}]
                </span>
              );
            })}
          </div>
        </div>

        <div className="url-state-indicator" aria-live="polite">
          {detected ? (
            <span className="url-detected-label">
              DETECTED: {platformLabel(detectedPlatform)}
            </span>
          ) : (
            <span className="url-idle-label">AWAITING SOURCE_</span>
          )}
        </div>
      </div>
    </form>
  );
}

export default UrlInput;
