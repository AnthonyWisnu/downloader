function Footer({ healthStatus }) {
  const isOk = healthStatus === "ok";
  const statusText = isOk ? "SERVER: OK" : "SERVER: ERROR";
  const dotClass = isOk ? "footer-dot is-ok" : "footer-dot is-error";

  return (
    <footer className="footer bg-ink" aria-label="Footer">
      <div className="section-inner footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">VOID</span>
          <p className="footer-tagline">Built for fast social media access.</p>
        </div>

        <p className="footer-disclaimer">
          VOID hanya untuk konten yang kamu miliki atau punya izin untuk
          didownload. Gunakan dengan bertanggung jawab.
        </p>

        <div className="footer-meta mono">
          <span className="footer-status">
            <span className={dotClass} aria-hidden="true" />
            {statusText}
          </span>
          <span className="footer-version">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
