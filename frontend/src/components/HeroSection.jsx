import { ChevronDown } from "lucide-react";

const platformBadges = [
  { label: "TikTok", className: "badge-yellow" },
  { label: "Instagram", className: "badge-cyan" },
  { label: "Reels", className: "badge-pink" },
  { label: "Story", className: "badge-lime" },
  { label: "Slideshow", className: "badge-orange" }
];

const stats = ["2 Platform", "No Watermark", "No Login"];

function HeroSection() {
  return (
    <section className="hero" aria-label="VOID downloader">
      <div className="hero-pattern" aria-hidden="true" />

      <div className="hero-inner section-inner">
        <span className="hero-tag">[ FREE TOOL ]</span>

        <h1 className="hero-title">VOID</h1>

        <p className="hero-subtitle">
          Download TikTok dan Instagram tanpa ribet. No watermark. No login.
        </p>

        <ul className="hero-badges" aria-label="Platform yang didukung">
          {platformBadges.map((badge) => (
            <li key={badge.label} className={`badge ${badge.className}`}>
              {badge.label}
            </li>
          ))}
        </ul>

        <ul className="hero-stats" aria-label="Ringkasan">
          {stats.map((stat) => (
            <li key={stat} className="hero-stat mono">
              {stat}
            </li>
          ))}
        </ul>

        <a className="hero-scroll" href="#downloader" aria-label="Scroll ke downloader">
          <ChevronDown size={28} strokeWidth={2.5} />
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
