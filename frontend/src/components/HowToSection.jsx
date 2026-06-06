const steps = [
  {
    number: "01",
    title: "Salin Link",
    text: "Buka TikTok atau Instagram. Salin URL video, Reels, post, atau Story."
  },
  {
    number: "02",
    title: "Tempel ke VOID",
    text: "Kembali ke VOID. Tempel URL ke input lalu klik tombol GRAB."
  },
  {
    number: "03",
    title: "Preview dan Download",
    text: "Cek preview media, lalu klik tombol download untuk menyimpan file."
  }
];

function HowToStep({ step }) {
  return (
    <article className="howto-step">
      <span className="howto-number mono" aria-hidden="true">
        {step.number}
      </span>
      <div className="howto-step-body">
        <h3 className="howto-step-title">{step.title}</h3>
        <p className="howto-step-text">{step.text}</p>
      </div>
    </article>
  );
}

function HowToSection() {
  return (
    <section className="section bg-off-white" aria-label="Cara pakai VOID">
      <div className="section-inner howto-inner">
        <span className="section-label">CARA PAKAI</span>

        <div className="howto-grid">
          {steps.map((step) => (
            <HowToStep key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowToSection;
