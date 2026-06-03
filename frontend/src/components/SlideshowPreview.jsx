import { useState } from "react";
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

    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1
    );
  }

  function showNext() {
    if (!canNavigate) {
      return;
    }

    setActiveIndex((currentIndex) =>
      currentIndex === slides.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <div className="slideshow-preview">
      <div className="slideshow-frame">
        <img
          className="slideshow-image"
          src={getMediaUrl(activeSlide.url)}
          alt=""
          loading="lazy"
        />

        <div className="slideshow-nav" aria-label="Slideshow navigation">
          <button className="slideshow-nav-button" type="button" onClick={showPrevious}>
            [ &lt; ]
          </button>
          <button className="slideshow-nav-button" type="button" onClick={showNext}>
            [ &gt; ]
          </button>
        </div>

        <span className="slideshow-counter">
          {getCounter(activeIndex, slides.length)}
        </span>
      </div>

      <a
        className="slideshow-active-download"
        href={getMediaUrl(activeSlide.url, { download: true })}
        target="_blank"
        rel="noreferrer"
        download
      >
        [ DOWNLOAD THIS SLIDE ]
      </a>
    </div>
  );
}

export default SlideshowPreview;
