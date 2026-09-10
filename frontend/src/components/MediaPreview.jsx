import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Play, Image as ImageIcon, Archive } from "lucide-react";
import { downloadAllAsZip } from "../utils/mediaBatch";

function MediaPreview({ adapted }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const { hasImageSlideshow, imageDownloads, videoDownloads, previewUrl, thumbnail, isPortrait, title } = adapted;

  const hasSlides = hasImageSlideshow && imageDownloads.length > 0;
  const activeVideoUrl = previewUrl || (videoDownloads && videoDownloads[0]?.streamUrl) || null;
  const hasVideo = Boolean(activeVideoUrl);

  const [activeTab, setActiveTab] = useState(hasSlides ? "slideshow" : "video");

  const handleDownloadAllZip = () => {
    downloadAllAsZip(title, imageDownloads, setIsZipping, adapted);
  };

  const renderTabs = () => {
    if (!hasSlides || !hasVideo) return null;
    return (
      <div className="media-preview-tabs mono">
        <button
          type="button"
          className={`media-preview-tab ${activeTab === "slideshow" ? "active" : ""}`}
          onClick={() => setActiveTab("slideshow")}
        >
          <ImageIcon size={13} strokeWidth={2.5} aria-hidden="true" />
          <span>SLIDESHOW ({imageDownloads.length})</span>
        </button>
        <button
          type="button"
          className={`media-preview-tab ${activeTab === "video" ? "active" : ""}`}
          onClick={() => setActiveTab("video")}
        >
          <Play size={13} strokeWidth={2.5} aria-hidden="true" />
          <span>VIDEO PREVIEW</span>
        </button>
      </div>
    );
  };

  const renderSlideshow = () => {
    const activeSlide = imageDownloads[slideIndex] || imageDownloads[0];
    const total = imageDownloads.length;
    const canNav = total > 1;

    return (
      <div className="media-preview-container">
        <div className="media-slideshow-box">
          <img
            className="media-slideshow-img"
            src={activeSlide.streamUrl || activeSlide.rawUrl}
            alt="Preview slide"
            loading="lazy"
          />

          {canNav ? (
            <div className="media-slideshow-controls" aria-label="Kontrol slide">
              <button
                type="button"
                className="media-slide-nav-btn"
                onClick={() => setSlideIndex((i) => (i === 0 ? total - 1 : i - 1))}
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className="media-slide-nav-btn"
                onClick={() => setSlideIndex((i) => (i === total - 1 ? 0 : i + 1))}
                aria-label="Slide berikutnya"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          ) : null}

          <div className="media-slide-badge mono">
            <ImageIcon size={12} strokeWidth={2.5} aria-hidden="true" />
            <span>
              {String(slideIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="media-slideshow-actions">
          <a
            className="media-slide-download-btn btn btn-block mono"
            href={activeSlide.directUrl}
            target="_blank"
            rel="noreferrer"
            download={activeSlide.filename || true}
          >
            <Download size={14} strokeWidth={2.5} aria-hidden="true" />
            <span>DOWNLOAD SLIDE [{slideIndex + 1}]</span>
          </a>

          {total > 1 ? (
            <button
              type="button"
              className="media-slide-zip-btn btn btn-block mono"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
            >
              <Archive size={14} strokeWidth={2.5} aria-hidden="true" />
              <span>
                {isZipping ? "PACKAGING ZIP..." : `DOWNLOAD ALL (${total} SLIDES ZIP)`}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderVideo = () => {
    return (
      <div className={`media-preview-container ${isPortrait ? "is-portrait" : ""}`}>
        <div className="media-video-box">
          <video
            className="media-video-element"
            src={activeVideoUrl}
            poster={thumbnail || ""}
            controls
            playsInline
            preload="metadata"
          />
          <div className="media-format-indicator mono">
            <span>PREVIEW STREAM</span>
          </div>
        </div>
      </div>
    );
  };

  const renderThumbnail = () => {
    return (
      <div className={`media-preview-container ${isPortrait ? "is-portrait" : ""}`}>
        <div className="media-image-box">
          <img className="media-image-element" src={thumbnail} alt="" loading="lazy" />
          <div className="media-format-indicator mono">
            <span>POSTER THUMBNAIL</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="media-preview-wrapper">
      {renderTabs()}
      {hasSlides && activeTab === "slideshow"
        ? renderSlideshow()
        : hasVideo && (activeTab === "video" || !hasSlides)
          ? renderVideo()
          : thumbnail
            ? renderThumbnail()
            : (
              <div className="media-preview-empty mono">
                <span>NO DIRECT PREVIEW STREAM AVAILABLE</span>
              </div>
            )}
    </div>
  );
}

export default MediaPreview;
