import { useState } from "react";
import { getMediaUrl } from "../utils/mediaProxy";

function AudioPreview({ download }) {
  const [isVisible, setIsVisible] = useState(Boolean(download?.url));

  if (!isVisible || !download?.url) {
    return null;
  }

  return (
    <div className="audio-preview-row">
      <span className="audio-preview-label">AUDIO PREVIEW</span>
      <audio
        className="audio-preview-player"
        src={getMediaUrl(download.url)}
        controls
        preload="metadata"
        onError={() => setIsVisible(false)}
      />
    </div>
  );
}

export default AudioPreview;
