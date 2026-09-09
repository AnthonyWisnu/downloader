import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Play, Image as ImageIcon } from "lucide-react";

function MediaPreview({ adapted }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const { hasImageSlideshow, imageDownloads, previewUrl, thumbnail, isPortrait } = adapted;

  if (hasImageSlideshow && imageDownloads.length > 0) {
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

        <a
          className="media-slide-download-btn btn btn-block mono"
          href={activeSlide.directUrl}
          target="_blank"
          rel="noreferrer"
          download
        >
          <Download size={14} strokeWidth={2.5} aria-hidden="true" />
          <span>DOWNLOAD SLIDE [{slideIndex + 1}]</span>
        </a>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className={`media-preview-container ${isPortrait ? "is-portrait" : ""}`}>
        <div className="media-video-box">
          <video
            className="media-video-element"
            src={previewUrl}
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
  }

  if (thumbnail) {
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
  }

  return (
    <div className="media-preview-empty mono">
      <span>NO DIRECT PREVIEW STREAM AVAILABLE</span>
    </div>
  );
}

export default MediaPreview;
