const steps = [
  {
    number: "01",
    title: "COPY MEDIA URL",
    text: "Copy the public URL of any video, reel, post, or tweet from YouTube, TikTok, Instagram, or X."
  },
  {
    number: "02",
    title: "ANALYZE SOURCE",
    text: "Paste the URL into the input field above and click ANALYZE. The engine detects the platform automatically."
  },
  {
    number: "03",
    title: "STREAM & DOWNLOAD",
    text: "Inspect the direct preview stream, select your preferred resolution or audio format, and download."
  }
];

function HowToStep({ step }) {
  return (
    <article className="howto-step card">
      <span className="howto-number mono" aria-hidden="true">
        {step.number}
      </span>
      <div className="howto-step-body">
        <h3 className="howto-step-title mono">{step.title}</h3>
        <p className="howto-step-text">{step.text}</p>
      </div>
    </article>
  );
}

function HowToSection() {
  return (
    <section id="how-to" className="section bg-black" aria-label="Workflow VOID">
      <div className="section-inner howto-inner">
        <div className="howto-header-bar mono">
          <span className="section-tag">[05] EXECUTION PROTOCOL</span>
          <span className="howto-header-status">3-STEP WORKFLOW</span>
        </div>

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
