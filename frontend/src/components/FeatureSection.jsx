import { Download, Monitor, Shield, ThumbsUp } from "lucide-react";

const features = [
  {
    title: "Unduh cepat",
    icon: Download,
    text: "Server memproses URL dan mengembalikan opsi download tanpa alur tambahan."
  },
  {
    title: "Semua perangkat",
    icon: Monitor,
    text: "VOID berjalan di browser desktop, tablet, dan ponsel tanpa aplikasi tambahan."
  },
  {
    title: "Preview dulu",
    icon: ThumbsUp,
    text: "Video bisa dicek melalui player sebelum memilih file yang ingin diunduh."
  },
  {
    title: "Privasi server",
    icon: Shield,
    text: "Cookies Instagram hanya dipakai di backend dan tidak pernah dikirim ke frontend."
  }
];

function FeatureItem({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="feature-item">
      <div className="feature-icon" aria-hidden="true">
        <Icon size={32} strokeWidth={2} />
      </div>

      <h3>{feature.title}</h3>
      <div className="feature-divider" />
      <p>{feature.text}</p>
    </article>
  );
}

function FeatureSection() {
  return (
    <section className="feature-section" aria-label="Keunggulan VOID">
      <header className="feature-header">
        <span>WHY VOID</span>
        <h2>Pilih VOID untuk download TikTok dan Instagram</h2>
        <p>
          VOID dibuat sebagai alat langsung pakai: tempel URL, cek preview,
          lalu ambil media yang tersedia tanpa login di browser pengguna.
        </p>
      </header>

      <div className="feature-grid">
        {features.map((feature) => (
          <FeatureItem key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;
