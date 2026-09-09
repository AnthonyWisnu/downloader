import { useEffect, useState } from "react";
import { AlertTriangle, Activity } from "lucide-react";
import UrlInput from "./UrlInput";

function DownloaderPanel({
  url,
  error,
  isLoading,
  detectedPlatform,
  canSubmit,
  onChange,
  onSubmit
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isLoading]);

  return (
    <section
      id="downloader"
      className="downloader-section"
      aria-label="Panel Input Downloader"
    >
      <div className="downloader-inner section-inner">
        <div className="downloader-tag-bar mono">
          <div className="downloader-tag-left">
            <Activity size={14} className="downloader-tag-icon" aria-hidden="true" />
            <span className="section-tag">[02] INGESTION CONSOLE</span>
          </div>
          <span className="downloader-sys-spec">PAYLOAD BUFFER: HIGH PERFORMANCE</span>
        </div>

        <div className="downloader-panel deck-panel">
          <span className="deck-corner deck-corner-tl" aria-hidden="true">+</span>
          <span className="deck-corner deck-corner-tr" aria-hidden="true">+</span>
          <span className="deck-corner deck-corner-bl" aria-hidden="true">+</span>
          <span className="deck-corner deck-corner-br" aria-hidden="true">+</span>

          <UrlInput
            value={url}
            error={error}
            isLoading={isLoading}
            detectedPlatform={detectedPlatform}
            canSubmit={canSubmit}
            onChange={onChange}
            onSubmit={onSubmit}
          />

          {isLoading ? (
            <div
              className="downloader-loading-bar mono"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="downloader-loading-header">
                <span className="downloader-loading-title">
                  EXTRACTING MULTI-STREAM PAYLOAD...
                </span>
                <span className="downloader-loading-timer">
                  LATENCY: {elapsedSeconds}s
                </span>
              </div>
              <div className="downloader-progress-track" aria-hidden="true">
                <div className="downloader-progress-fill" />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="downloader-error-banner mono" role="alert">
              <div className="downloader-error-header">
                <AlertTriangle size={16} strokeWidth={2.5} aria-hidden="true" />
                <span className="downloader-error-badge">ERROR / EXTRACTION FAILED</span>
              </div>
              <p className="downloader-error-message">{error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default DownloaderPanel;
