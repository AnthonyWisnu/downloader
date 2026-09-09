function HeroSection() {
  const platforms = [
    { code: "YT", label: "YouTube" },
    { code: "TT", label: "TikTok" },
    { code: "IG", label: "Instagram" },
    { code: "X", label: "X / Twitter" }
  ];

  return (
    <section className="hero grid-bg" aria-label="VOID Downloader">
      <div className="hero-inner section-inner">
        <div className="hero-meta-bar mono">
          <span className="hero-meta-title">UNIVERSAL MEDIA DOWNLOADER</span>
          <span className="hero-meta-index">[01]</span>
        </div>

        <div className="hero-brand-block">
          <span className="hero-brand-name">VOID</span>
          <h1 className="hero-headline">
            DOWNLOAD
            <br />
            WITHOUT
            <br />
            THE NOISE.
          </h1>
        </div>

        <div className="hero-divider" aria-hidden="true" />

        <div className="hero-platforms-bar mono" aria-label="Platform yang didukung">
          <span className="hero-platforms-label">SUPPORTED SOURCES:</span>
          <ul className="hero-platforms-list">
            {platforms.map((platform) => (
              <li key={platform.code} className="hero-platform-item">
                <span className="hero-platform-code">[{platform.code}]</span>
                <span className="hero-platform-name">{platform.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
