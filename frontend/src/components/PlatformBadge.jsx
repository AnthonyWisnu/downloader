import { platformLabel } from "../utils/detectPlatform";

function PlatformBadge({ platform, type }) {
  const label = platformLabel(platform, type);

  return (
    <span className="platform-badge" aria-label={`Platform ${label}`}>
      {label}
    </span>
  );
}

export default PlatformBadge;
