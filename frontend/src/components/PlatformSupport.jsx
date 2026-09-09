import { Clapperboard, Film, Images, Music2, Radio, Twitter, Video } from "lucide-react";

const platforms = [
  {
    icon: Video,
    tag: "YT",
    name: "YouTube",
    scope: "VIDEO & AUDIO",
    description: "Download high-resolution video (MP4) and extracted audio (MP3)."
  },
  {
    icon: Music2,
    tag: "TT",
    name: "TikTok",
    scope: "VIDEO & SLIDESHOW",
    description: "Download video without watermark and full photo slideshow carousels."
  },
  {
    icon: Film,
    tag: "IG",
    name: "Instagram",
    scope: "REELS, POST, STORY",
    description: "Extract Reels, multi-image posts, and active public Stories."
  },
  {
    icon: Twitter,
    tag: "X",
    name: "X (Twitter)",
    scope: "VIDEO, GIF, PHOTOS",
    description: "Download native video streams, animated GIFs, and high-res photos."
  }
];

function PlatformCard({ platform }) {
  const Icon = platform.icon;

  return (
    <article className="platform-card card card-hover">
      <div className="platform-card-header">
        <div className="platform-card-icon" aria-hidden="true">
          <Icon size={20} strokeWidth={2.2} />
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
          <span className="platform-header-status">ALL PROTOCOLS OPERATIONAL</span>
        </div>

        <div className="grid grid-2 platform-grid">
          {platforms.map((platform) => (
            <PlatformCard key={platform.tag} platform={platform} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlatformSupport;
