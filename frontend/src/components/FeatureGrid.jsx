import { Eye, FileCheck, Globe, Server, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "IN-LINE STREAM PREVIEW",
    text: "Direct browser-native media preview prior to triggering heavy file transfers."
  },
  {
    icon: Zap,
    title: "UNIVERSAL EXTRACTION",
    text: "Unified dispatcher for YouTube, TikTok, Instagram, and X without manual platform selection."
  },
  {
    icon: Shield,
    title: "SERVER-SIDE ISOLATION",
    text: "All cookie sessions and scraper execution remain strictly isolated on the backend server."
  },
  {
    icon: Server,
    title: "MEDIA PROXY LAYER",
    text: "CORS-bypassing proxy pipeline streams media assets reliably without direct CDN blocks."
  },
  {
    icon: FileCheck,
    title: "CONTAINER NORMALIZATION",
    text: "Automated container remuxing guarantees iOS and standard media player playback compatibility."
  },
  {
    icon: Globe,
    title: "ZERO RUNTIME CLIENT",
    text: "Engineered as a pure responsive web application. No extensions, trackers, or client binaries."
  }
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="feature-card card">
      <div className="feature-card-icon" aria-hidden="true">
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <h3 className="feature-card-title mono">{feature.title}</h3>
      <p className="feature-card-text">{feature.text}</p>
    </article>
  );
}

function FeatureGrid() {
  return (
    <section className="section bg-black" aria-label="Spesifikasi Arsitektur VOID">
      <div className="section-inner feature-grid-inner">
        <div className="feature-header-bar mono">
          <span className="section-tag">[06] ARCHITECTURE SPEC</span>
          <span className="feature-header-status">PRODUCTION GRADE UTILITY</span>
        </div>

        <div className="grid grid-2 grid-3 feature-grid-list">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
