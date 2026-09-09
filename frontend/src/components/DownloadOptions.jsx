import { Volume2, VolumeX } from "lucide-react";
import DownloadOptionRow from "./DownloadOptionRow";

function DownloadOptions({ adapted }) {
  const { videoDownloads, audioDownloads, imageDownloads, audioWarning } = adapted;

  return (
    <div className="download-options-container" aria-label="Opsi Unduhan">
      <div className="download-options-title-bar mono">
        <span className="download-options-main-title">DOWNLOAD OPTIONS_</span>
        <span className="download-options-count">
          TOTAL STREAMS: {adapted.downloads.length}
        </span>
      </div>

      {videoDownloads.length > 0 ? (
        <div className="download-group">
          <div className="download-group-header mono">
            <span className="download-group-tag">[VIDEO STREAM]</span>
            <span className="download-group-desc">MP4 / DIRECT CONTAINER</span>
          </div>
          <div className="download-group-list">
            {videoDownloads.map((item) => (
              <DownloadOptionRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : null}

      {audioDownloads.length > 0 ? (
        <div className="download-group">
          <div className="download-group-header mono">
            <span className="download-group-tag">[AUDIO STREAM]</span>
            <span className="download-group-desc">MP3 / EXTRACTED AUDIO</span>
          </div>
          <div className="download-group-list">
            {audioDownloads.map((item) => (
              <div key={item.id} className="audio-row-wrapper">
                <DownloadOptionRow item={item} />
                {item.streamUrl ? (
                  <div className="audio-inline-player">
                    <div className="audio-player-label mono">
                      <Volume2 size={14} strokeWidth={2.5} aria-hidden="true" />
                      <span>AUDIO PREVIEW</span>
                    </div>
                    <audio
                      className="audio-player-element"
                      src={item.streamUrl}
                      controls
                      preload="none"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {audioWarning ? (
        <div className="download-audio-warning mono" role="note">
          <VolumeX size={16} strokeWidth={2.5} aria-hidden="true" />
          <span>{audioWarning}</span>
        </div>
      ) : null}

      {imageDownloads.length > 0 && !adapted.hasImageSlideshow ? (
        <div className="download-group">
          <div className="download-group-header mono">
            <span className="download-group-tag">[IMAGE ASSETS]</span>
            <span className="download-group-desc">HIGH-RES JPG</span>
          </div>
          <div className="download-group-list">
            {imageDownloads.map((item) => (
              <DownloadOptionRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DownloadOptions;
