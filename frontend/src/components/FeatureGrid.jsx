import { Eye, FileCheck, Globe, Server, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Preview Dulu",
    text: "Lihat video sebelum download, pastikan file yang diambil benar."
  },
  {
    icon: Globe,
    title: "Tanpa Aplikasi",
    text: "Buka dari browser di HP, tablet, atau desktop."
  },
  {
    icon: Zap,
    title: "Cepat Dipakai",
    text: "Tempel link, klik tombol, pilih file. Tidak ada langkah rumit."
  },
  {
    icon: Shield,
    title: "Aman di Server",
    text: "Cookie Instagram diproses di backend, tidak dikirim ke browser."
  },
  {
    icon: Server,
    title: "Proxy Media",
    text: "Media di-proxy lewat server, tidak ada request langsung ke platform."
  },
  {
    icon: FileCheck,
    title: "Format Jelas",
    text: "File yang didownload punya nama dan format yang jelas."
  }
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="feature-card">
      <div className="feature-card-icon" aria-hidden="true">
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <h3 className="feature-card-title">{feature.title}</h3>
      <p className="feature-card-text">{feature.text}</p>
    </article>
  );
}

function FeatureGrid() {
  return (
    <section className="section bg-purple" aria-label="Kenapa VOID">
      <div className="section-inner feature-grid-inner">
        <span className="section-label">KENAPA VOID</span>

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
