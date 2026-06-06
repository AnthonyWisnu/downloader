import { useState } from "react";
import { Music } from "lucide-react";
import { getMediaUrl } from "../utils/mediaProxy";

function AudioPreview({ download }) {
  const [isVisible, setIsVisible] = useState(Boolean(download?.url));

  if (!isVisible || !download?.url) {
    return null;
  }

  return (
    <div className="audio-card">
      <span className="audio-card-label">
        <Music size={18} strokeWidth={2.5} aria-hidden="true" />
        Audio Preview
      </span>

      <audio
        className="audio-card-player"
        src={getMediaUrl(download.url)}
        controls
        preload="metadata"
        onError={() => setIsVisible(false)}
      />
    </div>
  );
}

export default AudioPreview;
