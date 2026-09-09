import { YouTubeLogo, TikTokLogo, InstagramLogo, XLogo } from "./BrandLogos";

const platforms = [
  {
    id: "youtube",
    tag: "YOUTUBE",
    name: "YouTube",
    scope: "VIDEO & AUDIO",
    colorClass: "card-youtube",
    logo: <YouTubeLogo size={28} />,
    description: "Download Full HD/4K videos, Shorts, and extracted 320kbps MP3 audio tracks."
  },
  {
    id: "tiktok",
    tag: "TIKTOK",
    name: "TikTok",
    scope: "VIDEO & SLIDESHOW",
    colorClass: "card-tiktok",
    logo: <TikTokLogo size={28} />,
    description: "Download crystal-clear watermark-free videos, slideshow photo carousels, and audio."
  },
  {
    id: "instagram",
    tag: "INSTAGRAM",
    name: "Instagram",
    scope: "REELS, POST, STORY",
    colorClass: "card-instagram",
    logo: <InstagramLogo size={28} />,
    description: "Extract high-resolution Reels, multi-image post carousels, and active public Stories."
  },
  {
    id: "x",
    tag: "X (TWITTER)",
    name: "X (Twitter)",
    scope: "VIDEO, GIF, PHOTOS",
    colorClass: "card-x",
    logo: <XLogo size={28} />,
    description: "Download high-definition video clips, looping GIFs, and original high-res photos."
  }
];

function PlatformCard({ platform }) {
  return (
    <article className={`platform-card card ${platform.colorClass}`}>
      <div className="platform-card-header">
        <div className="platform-card-logo-wrap">
          {platform.logo}
        </div>
        <span className="platform-card-tag mono">[{platform.tag}]</span>
      </div>

      <div className="platform-card-body">
        <div className="platform-card-meta mono">
          <span className="platform-card-scope">{platform.scope}</span>
        </div>
        <h3 className="platform-card-title">{platform.name}</h3>
        <p className="platform-card-text">{platform.description}</p>
      </div>
    </article>
  );
}

function PlatformSupport() {
  return (
    <section className="section bg-black" aria-label="Platform yang didukung">
      <div className="section-inner platform-inner">
        <div className="platform-header-bar mono">
          <span className="section-tag">[03] SUPPORT MATRIX</span>
          <span className="platform-header-status">OFFICIAL PROTOCOLS ACTIVE</span>
        </div>

        <div className="grid grid-2 platform-grid">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlatformSupport;
