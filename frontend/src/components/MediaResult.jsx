import { adaptMediaResult } from "../utils/mediaAdapter";
import PlatformHeader from "./PlatformHeader";
import MediaPreview from "./MediaPreview";
import MediaMetadata from "./MediaMetadata";
import DownloadOptions from "./DownloadOptions";

function MediaResult({ result, onReset }) {
  const adapted = adaptMediaResult(result);

  if (!adapted) {
    return null;
  }

  return (
    <article className="media-result-card" aria-label="Hasil Analisis Media">
      <PlatformHeader adapted={adapted} onReset={onReset} />

      <div className={`media-result-grid ${adapted.isPortrait ? "layout-portrait" : "layout-landscape"}`}>
        <div className="media-result-preview-col">
          <MediaPreview adapted={adapted} />
        </div>

        <div className="media-result-content-col">
          <MediaMetadata adapted={adapted} />
          <div className="media-result-divider" aria-hidden="true" />
          <DownloadOptions adapted={adapted} />
        </div>
      </div>
    </article>
  );
}

export default MediaResult;
