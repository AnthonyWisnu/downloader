import { YouTubeLogo, TikTokLogo, InstagramLogo, XLogo } from "./BrandLogos";
import { Radio, ArrowUpRight } from "lucide-react";

const platforms = [
  {
    id: "youtube",
    tag: "CH.01",
    name: "YouTube",
    scope: "VIDEO & AUDIO MATRIX",
    colorClass: "card-youtube",
    logo: <YouTubeLogo size={32} />,
    formats: ["1080P FHD", "SHORTS", "192K MP3", "AUDIO ONLY"],
    description: "Extract Full HD videos, YouTube Shorts, and dedicated audio tracks with instant stream playback."
  },
  {
    id: "tiktok",
    tag: "CH.02",
    name: "TikTok",
    scope: "WATERMARK-FREE ENGINE",
    colorClass: "card-tiktok",
    logo: <TikTokLogo size={32} />,
    formats: ["NO WATERMARK", "SLIDESHOW", "SOUND MP3", "WATERMARK"],
    description: "Extract clean, watermark-free videos, multi-image slideshow carousels, and viral background sounds."
  },
  {
    id: "instagram",
    tag: "CH.03",
    name: "Instagram",
    scope: "FEED, REELS, STORIES",
    colorClass: "card-instagram",
    logo: <InstagramLogo size={32} />,
    formats: ["REELS MP4", "FEED POSTS", "PUBLIC STORIES", "CAROUSEL"],
    description: "Query high-bitrate Reels, multi-post image albums, and active public Stories without quality downsampling."
  },
  {
    id: "x",
    tag: "CH.04",
    name: "X (Twitter)",
    scope: "MEDIA & ORIG PHOTO",
    colorClass: "card-x",
    logo: <XLogo size={32} />,
    formats: ["MP4 VIDEO", "ORIGINAL JPG", "LOOPING GIF", "AUDIO"],
    description: "Download embedded video clips, looping GIFs, and full uncompressed master photos up to 4 images per tweet."
  }
];

function PlatformCard({ platform }) {
  return (
    <article className={`platform-card ${platform.colorClass}`}>
      <span className="deck-corner deck-corner-tl" aria-hidden="true">+</span>
      <span className="deck-corner deck-corner-tr" aria-hidden="true">+</span>

      <div className="platform-card-header">
        <div className="platform-card-logo-wrap">
          {platform.logo}
        </div>
        <div className="platform-card-tag-wrap mono">
          <span className="platform-card-tag">[{platform.tag}]</span>
          <ArrowUpRight size={14} className="platform-card-arrow" aria-hidden="true" />
        </div>
      </div>

      <div className="platform-card-body">
        <div className="platform-card-meta mono">
          <span className="platform-card-scope">{platform.scope}</span>
        </div>
        <h3 className="platform-card-title">{platform.name}</h3>
        <p className="platform-card-text">{platform.description}</p>

        <div className="platform-format-pills mono" aria-label="Format yang didukung">
          {platform.formats.map((fmt) => (
            <span key={fmt} className="platform-format-pill">
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function PlatformSupport() {
  return (
    <section className="section platform-section" aria-label="Platform yang didukung">
      <div className="section-inner platform-inner">
        <div className="platform-header-bar mono">
          <div className="platform-header-left">
            <Radio size={14} className="platform-header-icon" aria-hidden="true" />
            <span className="section-tag">[03] CHANNEL MATRIX</span>
          </div>
          <span className="platform-header-status">ALL PROTOCOLS ACTIVE (4/4)</span>
        </div>

        <div className="platform-grid">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlatformSupport;
