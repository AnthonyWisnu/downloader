import { platformLabel } from "../utils/detectPlatform";

function PlatformBadge({ platform, type }) {
  const label = platformLabel(platform, type);
  const colorClass = platform === "tiktok" ? "badge-cyan" : "badge-pink";

  return (
    <span className={`badge ${colorClass}`} aria-label={`Platform ${label}`}>
      {label}
    </span>
  );
}

export default PlatformBadge;
