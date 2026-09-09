export function YouTubeLogo({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="YouTube"
    >
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
    </svg>
  );
}

export function TikTokLogo({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="TikTok"
    >
      {/* Cyan glitch shadow */}
      <path
        d="M16.6 5.82s.51.5 1.5 1.05c1 .55 2.15.83 3.4.88V11.2a7.66 7.66 0 0 1-4.9-1.8v6.7a6.1 6.1 0 1 1-6.1-6.1c.35 0 .7.03 1.04.09v3.47a2.72 2.72 0 1 0 1.66 2.54V2.5h3.4a5.3 5.3 0 0 0 0 3.32z"
        fill="#00F2FE"
        transform="translate(-0.8, -0.6)"
        opacity="0.85"
      />
      {/* Red glitch shadow */}
      <path
        d="M16.6 5.82s.51.5 1.5 1.05c1 .55 2.15.83 3.4.88V11.2a7.66 7.66 0 0 1-4.9-1.8v6.7a6.1 6.1 0 1 1-6.1-6.1c.35 0 .7.03 1.04.09v3.47a2.72 2.72 0 1 0 1.66 2.54V2.5h3.4a5.3 5.3 0 0 0 0 3.32z"
        fill="#FE2C55"
        transform="translate(0.8, 0.6)"
        opacity="0.85"
      />
      {/* Crisp White core */}
      <path
        d="M16.6 5.82s.51.5 1.5 1.05c1 .55 2.15.83 3.4.88V11.2a7.66 7.66 0 0 1-4.9-1.8v6.7a6.1 6.1 0 1 1-6.1-6.1c.35 0 .7.03 1.04.09v3.47a2.72 2.72 0 1 0 1.66 2.54V2.5h3.4a5.3 5.3 0 0 0 0 3.32z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function InstagramLogo({ size = 24, className = "" }) {
  const gradientId = `ig-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Instagram"
    >
      <defs>
        <radialGradient id={`${gradientId}-rg`} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        fill={`url(#${gradientId}-rg)`}
      />
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="3.5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        fill="none"
      />
      <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="16.5" cy="7.5" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

export function XLogo({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="X (Twitter)"
    >
      <rect width="24" height="24" rx="4" fill="#0F1419" />
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function PlatformLogo({ platform, size = 24, className = "" }) {
  const p = String(platform || "").toLowerCase();
  if (p === "youtube") return <YouTubeLogo size={size} className={className} />;
  if (p === "tiktok") return <TikTokLogo size={size} className={className} />;
  if (p === "instagram") return <InstagramLogo size={size} className={className} />;
  if (p === "x" || p === "twitter") return <XLogo size={size} className={className} />;
  return null;
}
