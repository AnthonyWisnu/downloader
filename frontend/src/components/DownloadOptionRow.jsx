import { ArrowUpRight, Download } from "lucide-react";

function DownloadOptionRow({ item }) {
  if (!item || !item.directUrl) {
    return null;
  }

  return (
    <div className="download-option-row mono">
      <div className="download-row-specs">
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
        download
        aria-label={`Download ${item.quality} ${item.format}`}
      >
        <span>DOWNLOAD</span>
        <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden="true" />
      </a>
    </div>
  );
}

export default DownloadOptionRow;
