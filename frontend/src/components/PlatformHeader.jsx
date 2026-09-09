import { RotateCcw } from "lucide-react";

function PlatformHeader({ adapted, onReset }) {
  return (
    <div className="platform-header-container mono">
      <div className="platform-header-left">
        <span className="platform-header-tag">[PAYLOAD DETECTED]</span>
        <span className="platform-header-badge">{adapted.platformLabel}</span>
        <span className="platform-header-type">/ {adapted.typeLabel}</span>
      </div>

      <div className="platform-header-right">
        <span className="platform-header-status">STATUS: PARSED OK</span>
        {onReset ? (
          <button
            type="button"
            className="platform-header-reset-btn"
            onClick={onReset}
            title="Reset dan grab URL lain"
            aria-label="Reset downloader"
          >
            <RotateCcw size={13} strokeWidth={2.5} aria-hidden="true" />
            <span>RESET</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default PlatformHeader;
