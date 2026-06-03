import { Download, Monitor, Shield, ThumbsUp } from "lucide-react";

const features = [
  {
    title: "Cepat dipakai",
    icon: Download,
    text: "Tempel link, tekan tombol, lalu pilih file yang tersedia. Tidak perlu langkah rumit."
  },
  {
    title: "Tanpa aplikasi",
    icon: Monitor,
    text: "Buka langsung dari browser di ponsel, tablet, atau desktop. Tidak perlu install apa pun."
  },
  {
    title: "Lihat dulu",
    icon: ThumbsUp,
    text: "Cek videonya di player sebelum download, jadi kamu tahu file yang diambil sudah benar."
  },
  {
    title: "Lebih aman",
    icon: Shield,
    text: "Kamu tidak perlu login di halaman ini. Cukup masukkan link konten yang ingin diambil."
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
        <h2>Download konten tanpa ribet</h2>
        <p>
          VOID dibuat untuk pengguna yang cuma ingin ambil video atau foto dengan cepat.
          Masukkan link, lihat preview, lalu download.
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
