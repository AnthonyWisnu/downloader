import { Download } from "lucide-react";
import { getMediaUrl } from "../utils/mediaProxy";

function formatLabel(download) {
  const format = String(download?.format || "file").toUpperCase();
  const label = String(download?.label || "Download");

  if (label.toLowerCase().includes(format.toLowerCase())) {
    return label.toUpperCase();
  }

  return `${format} / ${label}`.toUpperCase();
}

function DownloadButton({ download }) {
  const label = formatLabel(download);
  const href = download?.url ? getMediaUrl(download.url, { download: true }) : "#";
  const isDisabled = !download?.url;

  return (
    <div className="download-row">
      <span className="download-label mono" title={label}>
        {label}
      </span>

      <a
        className={isDisabled ? "download-action btn btn-yellow is-disabled" : "download-action btn btn-yellow"}
        href={href}
        target="_blank"
        rel="noreferrer"
        download
        aria-disabled={isDisabled}
      >
        <Download size={18} strokeWidth={2.5} aria-hidden="true" />
        Download
      </a>
    </div>
  );
}

export default DownloadButton;
