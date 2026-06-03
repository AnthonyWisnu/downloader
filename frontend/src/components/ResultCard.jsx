import { useState } from "react";
import DownloadButton from "./DownloadButton";
import PlatformBadge from "./PlatformBadge";
import { typeLabel } from "../utils/detectPlatform";
import { getMediaUrl } from "../utils/mediaProxy";

function isVideoDownload(download) {
  const format = String(download?.format || "").toLowerCase();
  const label = String(download?.label || "").toLowerCase();

  return format === "mp4" || label.includes("video");
}

function getPreviewDownload(downloads) {
  return downloads.find(isVideoDownload) || null;
}

function getMediaClassName(result) {
  const portraitTypes = new Set(["video", "reels", "story"]);
  const isPortrait = result.platform === "tiktok" || portraitTypes.has(result.type);

  return isPortrait ? "media-preview is-portrait" : "media-preview";
}

function PreviewModal({ previewDownload, result, onClose }) {
  const previewUrl = result.previewUrl || getMediaUrl(previewDownload.url);

  return (
    <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Video preview">
      <div className="preview-modal-panel">
        <button className="preview-close" type="button" onClick={onClose}>
          [ CLOSE ]
        </button>

        <video
          className="preview-modal-video"
          src={previewUrl}
          poster={result.thumbnail || ""}
          controls
          autoPlay
          preload="metadata"
          playsInline
        />
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!result) {
    return null;
  }

  const hasThumbnail = Boolean(result.thumbnail);
  const type = typeLabel(result.type);
  const downloads = Array.isArray(result.downloads) ? result.downloads : [];
  const previewDownload = getPreviewDownload(downloads);
  const mediaClassName = getMediaClassName(result);

  return (
    <section className="result-card" aria-label="Download result">
      <header className="result-header">
        <PlatformBadge platform={result.platform} type={result.type} />
        <span className="result-header-divider" aria-hidden="true" />
        <span className="result-type">{type}</span>
      </header>

      <div className="result-separator" />

      {previewDownload || hasThumbnail ? (
        <div className={mediaClassName}>
          {previewDownload ? (
            <button
              className="media-preview-button"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
            >
              <video
                className="media-video"
                src={getMediaUrl(previewDownload.url)}
                poster={result.thumbnail || ""}
                muted
                preload="metadata"
                playsInline
              />
              <span className="media-preview-label">[ PREVIEW ]</span>
            </button>
          ) : (
            <img className="media-image" src={result.thumbnail} alt="" loading="lazy" />
          )}
        </div>
      ) : null}

      <p className="result-title" title={result.title}>
        {result.title}
      </p>

      <div className="result-separator" />

      <div className="download-list">
        {downloads.map((download, index) => (
          <DownloadButton
            key={`${download.format}-${download.url}-${index}`}
            download={download}
          />
        ))}
      </div>

      {isPreviewOpen && previewDownload ? (
        <PreviewModal
          previewDownload={previewDownload}
          result={result}
          onClose={() => setIsPreviewOpen(false)}
        />
      ) : null}
    </section>
  );
}

export default ResultCard;
