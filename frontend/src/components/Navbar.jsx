import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar({ healthStatus = "ok" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isOk = healthStatus === "ok";
  const statusLabel = isOk ? "ONLINE" : "OFFLINE";

  return (
    <header className="navbar" aria-label="Navigasi Utama">
      <div className="navbar-inner section-inner">
        <div className="navbar-brand">
          <a href="#" className="navbar-logo">
            VOID
          </a>
          <span className="navbar-tag mono">[SYS.01]</span>
        </div>

        <nav className="navbar-links" aria-label="Tautan navigasi">
          <a href="#how-to" className="navbar-link mono">
            DOCS
          </a>
          <a
            href="https://github.com/AnthonyWisnu/downloader"
            target="_blank"
            rel="noreferrer"
            className="navbar-link mono"
          >
            GITHUB
          </a>
          <div className="navbar-status mono" role="status" aria-label={`Status sistem: ${statusLabel}`}>
            <span
              className={`status-dot ${isOk ? "" : "is-error"}`}
              aria-hidden="true"
            />
            <span>{statusLabel}</span>
          </div>
        </nav>

        <button
          type="button"
          className="navbar-menu-btn mono"
          aria-expanded={mobileMenuOpen}
          aria-label="Menu navigasi"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={18} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Menu size={18} strokeWidth={2.5} aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="navbar-mobile-drawer mono" role="dialog" aria-modal="false">
          <a
            href="#how-to"
            className="navbar-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            DOCS
          </a>
          <a
            href="https://github.com/AnthonyWisnu/downloader"
            target="_blank"
            rel="noreferrer"
            className="navbar-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            GITHUB
          </a>
          <div className="navbar-mobile-status">
            <span
              className={`status-dot ${isOk ? "" : "is-error"}`}
              aria-hidden="true"
            />
            <span>SYSTEM: {statusLabel}</span>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
