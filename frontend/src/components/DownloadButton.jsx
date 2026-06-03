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
      <div className="download-label" title={label}>
        [{label}]
      </div>

      <a
        className={isDisabled ? "download-action is-disabled" : "download-action"}
        href={href}
        target="_blank"
        rel="noreferrer"
        download
        aria-disabled={isDisabled}
      >
        [ DOWNLOAD ]
      </a>
    </div>
  );
}

export default DownloadButton;
