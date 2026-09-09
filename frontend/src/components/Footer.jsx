function Footer({ healthStatus }) {
  const isOk = healthStatus === "ok";
  const statusText = isOk ? "SERVER: OK" : "SERVER: ERROR";

  return (
    <footer className="footer bg-black" aria-label="Informasi Footer">
      <div className="section-inner footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">VOID</span>
            <p className="footer-tagline mono">HIGH-PERFORMANCE MEDIA EXTRACTION UTILITY</p>
          </div>

          <div className="footer-security-note mono">
            <span className="footer-security-badge">[SECURITY ARCHITECTURE]</span>
            <p className="footer-security-text">
              COOKIES AND EXTRACTION CREDENTIALS REMAIN SERVER-SIDE.
            </p>
          </div>
        </div>

        <div className="footer-meta mono">
          <div className="footer-status" role="status" aria-label={`Status server: ${statusText}`}>
            <span
              className={`status-dot ${isOk ? "" : "is-error"}`}
              aria-hidden="true"
            />
            <span>{statusText}</span>
          </div>

          <span className="footer-legal">
            VOID IS FOR USER-AUTHORIZED OR PUBLIC MEDIA ONLY.
          </span>

          <span className="footer-version">[BUILD 2.0.0-PROD]</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
