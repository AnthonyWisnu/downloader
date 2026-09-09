import { ExternalLink, User } from "lucide-react";

function MediaMetadata({ adapted }) {
  const { title, author, sourceUrl, platformLabel } = adapted;

  return (
    <div className="media-metadata-container">
      <div className="media-metadata-header mono">
        <span className="media-metadata-tag">[METADATA]</span>
        {author ? (
          <div className="media-metadata-author">
            <User size={12} strokeWidth={2.5} aria-hidden="true" />
            <span>{author}</span>
          </div>
        ) : null}
      </div>

      <h2 className="media-metadata-title" title={title}>
        {title}
      </h2>

      {sourceUrl ? (
        <div className="media-metadata-source mono">
          <span className="media-source-label">SOURCE:</span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="media-source-link"
            title={sourceUrl}
          >
            <span>{sourceUrl}</span>
            <ExternalLink size={12} strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default MediaMetadata;
