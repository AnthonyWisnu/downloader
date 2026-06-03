const steps = [
  {
    number: "01",
    label: "SOURCE",
    action: "[ Salin URL ]",
    title: "Salin URL",
    lines: ["Buka TikTok atau Instagram.", "Salin URL video, Reels, post, atau Story."]
  },
  {
    number: "02",
    label: "INPUT",
    action: "[ Tempel Tautan ]",
    title: "Tempel Tautan",
    lines: ["Kembali ke VOID.", "Tempel URL ke field utama dan tekan [ GRAB ]."]
  },
  {
    number: "03",
    label: "OUTPUT",
    action: "[ Preview dan Download ]",
    title: "Preview dan Download",
    lines: ["Cek preview video di halaman.", "Pilih format yang tersedia lalu tekan [ DOWNLOAD ]."]
  }
];

const terminalItems = ["VOID", "FETCH", "PREVIEW", "DOWNLOAD"];

function StepCard({ step }) {
  return (
    <article className="how-it-step-card">
      <header className="how-it-step-header">
        <span>{step.number}</span>
        <span>{step.label}</span>
      </header>

      <div className="how-it-url-bar" />

      <div className="how-it-mock-button">{step.action}</div>

      <div className="how-it-divider" />

      <h3>{step.title}</h3>

      {step.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </article>
  );
}

function BottomPanel() {
  return (
    <div className="how-it-bottom">
      <div className="how-it-terminal">
        {terminalItems.map((item) => (
          <div className="how-it-terminal-item" key={item}>
            {item}
          </div>
        ))}
      </div>

      <div className="how-it-notes">
        <span>NOTES</span>
        <h3>TikTok, Reels, Story, dan post dalam satu alur.</h3>
        <p>
          VOID memproses URL lewat server, menampilkan preview jika link video tersedia,
          lalu memberi opsi download sesuai hasil dari platform.
        </p>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="how-it-section" aria-label="Cara pakai VOID">
      <header className="how-it-header">
        <span>MANUAL</span>
        <h2>Cara pakai VOID</h2>
        <p>Ambil konten dari TikTok dan Instagram dalam tiga langkah.</p>
      </header>

      <div className="how-it-steps">
        {steps.map((step) => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>

      <BottomPanel />
    </section>
  );
}

export default HowItWorks;
