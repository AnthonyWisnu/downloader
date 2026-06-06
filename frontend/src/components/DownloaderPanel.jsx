import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
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
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isLoading]);

  return (
    <section
      id="downloader"
      className="downloader section bg-yellow"
      aria-label="Form download"
    >
      <div className="downloader-inner section-inner">
        <span className="section-label">GRAB YOUR CONTENT</span>

        <div className="downloader-card">
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
            <div className="downloader-loading mono" role="status" aria-live="polite" aria-busy="true">
              GRABBING
              <span className="downloader-loading-dots" aria-hidden="true">
                ...
              </span>
              {elapsedSeconds > 0 ? <span> {elapsedSeconds}s</span> : null}
            </div>
          ) : null}

          {error ? (
            <div className="downloader-error" role="alert">
              <AlertCircle size={20} strokeWidth={2.5} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default DownloaderPanel;
