import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { getMediaUrl } from "../utils/mediaProxy";

function getCounter(index, total) {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

function SlideshowPreview({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!Array.isArray(slides) || slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const canNavigate = slides.length > 1;

  function showPrevious() {
    if (!canNavigate) {
      return;
    }

    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  }

  function showNext() {
    if (!canNavigate) {
      return;
    }

    setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="slideshow">
      <div className="slideshow-frame">
        <img
          className="slideshow-image"
          src={getMediaUrl(activeSlide.url)}
          alt=""
          loading="lazy"
        />

        {canNavigate ? (
          <div className="slideshow-nav" aria-label="Navigasi slideshow">
            <button
              className="slideshow-nav-button"
              type="button"
              onClick={showPrevious}
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button
              className="slideshow-nav-button"
              type="button"
              onClick={showNext}
              aria-label="Slide berikutnya"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        ) : null}

        <span className="slideshow-counter mono">
          {getCounter(activeIndex, slides.length)}
        </span>
      </div>

      <a
        className="slideshow-download btn btn-yellow btn-block"
        href={getMediaUrl(activeSlide.url, { download: true })}
        target="_blank"
        rel="noreferrer"
        download
      >
        <Download size={18} strokeWidth={2.5} aria-hidden="true" />
        Download Slide Ini
      </a>
    </div>
  );
}

export default SlideshowPreview;
