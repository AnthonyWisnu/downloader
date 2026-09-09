import { RotateCcw } from "lucide-react";
import { PlatformLogo } from "./BrandLogos";

function PlatformHeader({ adapted, onReset }) {
  return (
    <div className={`platform-header-container platform-hdr-${adapted.platform} mono`}>
      <div className="platform-header-left">
        <span className="platform-header-icon">
          <PlatformLogo platform={adapted.platform} size={22} />
        </span>
        <span className="platform-header-badge">{adapted.platformLabel}</span>
        <span className="platform-header-type">/ {adapted.typeLabel}</span>
      </div>

      <div className="platform-header-right">
        <span className="platform-header-status">
          <span className="platform-status-dot" />
          EXTRACTED OK
        </span>
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
