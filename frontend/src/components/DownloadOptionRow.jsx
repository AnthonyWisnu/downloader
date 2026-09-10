import { ArrowUpRight } from "lucide-react";

function DownloadOptionRow({ item }) {
  if (!item || !item.directUrl) {
    return null;
  }

  const categoryClass = `category-${item.category}`;

  return (
    <div className={`download-option-row ${categoryClass} mono`}>
      <div className="download-row-specs">
        <span className="download-row-badge">{item.category.toUpperCase()}</span>
        <span className="download-row-quality">{item.quality}</span>
        <span className="download-row-format">{item.format}</span>
        {item.size ? <span className="download-row-size">{item.size}</span> : null}
        <span className="download-row-label" title={item.label}>
          {item.label}
        </span>
      </div>

      <a
        className="download-row-action"
        href={item.directUrl}
        target="_blank"
        rel="noreferrer"
        download={item.filename || true}
        aria-label={`Download ${item.quality} ${item.format}`}
      >
        <span>DOWNLOAD</span>
        <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden="true" />
      </a>
    </div>
  );
}

export default DownloadOptionRow;
