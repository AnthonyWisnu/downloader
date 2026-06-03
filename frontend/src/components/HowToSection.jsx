const steps = [
  {
    index: "01",
    title: "Salin URL",
    label: "SOURCE",
    lines: ["Buka TikTok atau Instagram.", "Salin URL video, Reels, post, atau Story."]
  },
  {
    index: "02",
    title: "Tempel Tautan",
    label: "INPUT",
    lines: ["Kembali ke VOID.", "Tempel URL ke field utama dan tekan [ GRAB ]."]
  },
  {
    index: "03",
    title: "Preview dan Download",
    label: "OUTPUT",
    lines: ["Cek preview video di halaman.", "Pilih format yang tersedia lalu tekan [ DOWNLOAD ]."]
  }
];

function HowToStep({ step }) {
  return (
    <article className="how-step">
      <header className="how-step-header">
        <span>{step.index}</span>
        <span>{step.label}</span>
      </header>

      <div className="how-step-screen">
        <div className="how-step-bar" />
        <div className="how-step-command">[{step.title}]</div>
      </div>

      <h3>{step.title}</h3>

      <div className="how-step-divider" />

      {step.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </article>
  );
}

function HowToSection() {
  return (
    <section className="how-section" aria-label="Cara pakai VOID">
      <header className="how-header">
        <span>MANUAL</span>
        <h2>Cara pakai VOID</h2>
        <p>Ambil konten dari TikTok dan Instagram dalam tiga langkah.</p>
      </header>

      <div className="how-grid">
        {steps.map((step) => (
          <HowToStep key={step.index} step={step} />
        ))}
      </div>

      <article className="how-summary">
        <div className="how-summary-visual">
          <div className="how-summary-window">
            <span>VOID</span>
            <span>FETCH</span>
            <span>PREVIEW</span>
            <span>DOWNLOAD</span>
          </div>
        </div>

        <div className="how-summary-copy">
          <span>NOTES</span>
          <h2>TikTok, Reels, Story, dan post dalam satu alur.</h2>
          <p>
            VOID memproses URL lewat server, menampilkan preview jika link video tersedia,
            lalu memberi opsi download sesuai hasil dari platform.
          </p>
        </div>
      </article>
    </section>
  );
}

export default HowToSection;
