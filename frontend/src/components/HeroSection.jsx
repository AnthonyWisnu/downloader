import { YouTubeLogo, TikTokLogo, InstagramLogo, XLogo } from "./BrandLogos";
import { Sparkles } from "lucide-react";

function HeroSection() {
  const platforms = [
    {
      code: "YT",
      name: "YouTube",
      colorClass: "badge-yt",
      logo: <YouTubeLogo size={20} />
    },
    {
      code: "TT",
      name: "TikTok",
      colorClass: "badge-tt",
      logo: <TikTokLogo size={20} />
    },
    {
      code: "IG",
      name: "Instagram",
      colorClass: "badge-ig",
      logo: <InstagramLogo size={20} />
    },
    {
      code: "X",
      name: "X (Twitter)",
      colorClass: "badge-x",
      logo: <XLogo size={20} />
    }
  ];

  return (
    <section className="hero grid-bg" aria-label="VOID Downloader">
      <div className="hero-inner section-inner">
        <div className="hero-meta-bar mono">
          <div className="hero-meta-title-wrapper">
            <span className="hero-status-pulse" />
            <span className="hero-meta-title">UNIVERSAL MEDIA EXTRACTION PLATFORM</span>
          </div>
          <span className="hero-meta-index">[SYS.01]</span>
        </div>

        <div className="hero-brand-block">
          <div className="hero-badge-live mono">
            <Sparkles size={13} className="hero-sparkle-icon" aria-hidden="true" />
            <span>FULL QUALITY · NO WATERMARK · ZERO LOGIN</span>
          </div>
          <h1 className="hero-headline">
            DOWNLOAD
            <br />
            <span className="hero-headline-accent">WITHOUT</span>
            <br />
            THE NOISE.
          </h1>
        </div>

        <div className="hero-divider" aria-hidden="true" />

        <div className="hero-platforms-bar mono" aria-label="Platform yang didukung">
          <span className="hero-platforms-label">SUPPORTED CHANNELS:</span>
          <ul className="hero-platforms-list">
            {platforms.map((p) => (
              <li key={p.code} className={`hero-platform-badge ${p.colorClass}`}>
                <span className="hero-platform-logo">{p.logo}</span>
                <span className="hero-platform-name">{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
