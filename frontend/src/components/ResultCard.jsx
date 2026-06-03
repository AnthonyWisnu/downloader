import DownloadButton from "./DownloadButton";
import PlatformBadge from "./PlatformBadge";
import { typeLabel } from "../utils/detectPlatform";

function ResultCard({ result }) {
  if (!result) {
    return null;
  }

  const hasThumbnail = Boolean(result.thumbnail);
  const type = typeLabel(result.type);
  const downloads = Array.isArray(result.downloads) ? result.downloads : [];

  return (
    <section className="result-card" aria-label="Download result">
      <header className="result-header">
        <PlatformBadge platform={result.platform} type={result.type} />
        <span className="result-header-divider" aria-hidden="true" />
        <span className="result-type">{type}</span>
      </header>

      <div className="result-separator" />

      {hasThumbnail ? (
        <div className="thumbnail-frame">
          <img className="thumbnail-image" src={result.thumbnail} alt="" loading="lazy" />
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
    </section>
  );
}

export default ResultCard;
