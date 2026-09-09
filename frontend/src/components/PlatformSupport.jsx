import { Clapperboard, Film, Images, Music2, Radio, Twitter, Video } from "lucide-react";

const platforms = [
  {
    icon: Music2,
    name: "TikTok Video",
    description: "Download video TikTok tanpa watermark.",
    color: "card-cyan"
  },
  {
    icon: Images,
    name: "TikTok Slideshow",
    description: "Download kumpulan foto dari postingan slideshow TikTok.",
    color: "card-yellow"
  },
  {
    icon: Film,
    name: "Instagram Reels",
    description: "Download Reels langsung dari link Instagram.",
    color: "card-pink"
  },
  {
    icon: Clapperboard,
    name: "Instagram Post",
    description: "Download foto atau video dari postingan Instagram.",
    color: "card-lime"
  },
  {
    icon: Radio,
    name: "Instagram Story",
    description: "Download Story Instagram yang sedang aktif.",
    color: "card-orange"
  },
  {
    icon: Video,
    name: "YouTube Video & Shorts",
    description: "Download video YouTube dan Shorts beserta audio MP3.",
    color: "card-red"
  },
  {
    icon: Twitter,
    name: "X (Twitter)",
    description: "Download video, GIF, audio, dan foto dari postingan X.",
    color: "card-yellow"
  }
];

function PlatformCard({ platform }) {
  const Icon = platform.icon;

  return (
    <article className={`platform-card card-hover ${platform.color}`}>
      <div className="platform-card-icon" aria-hidden="true">
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <h3 className="platform-card-title">{platform.name}</h3>
      <p className="platform-card-text">{platform.description}</p>
    </article>
  );
}

function PlatformSupport() {
  return (
    <section className="section bg-off-white" aria-label="Platform yang didukung">
      <div className="section-inner platform-inner">
        <span className="section-label">PLATFORM YANG DIDUKUNG</span>

        <div className="grid grid-2 grid-3 platform-grid">
          {platforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlatformSupport;
