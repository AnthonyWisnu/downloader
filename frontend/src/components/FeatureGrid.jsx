import { Film, Music, Layers, ShieldCheck, ArrowRight, Zap } from "lucide-react";

function FeatureGrid() {
  return (
    <section className="section bento-section" aria-label="Spesifikasi Arsitektur VOID">
      <div className="section-inner bento-inner">
        <div className="bento-header-bar mono">
          <div className="bento-header-left">
            <Zap size={14} className="bento-header-icon" aria-hidden="true" />
            <span className="section-tag">[04] CORE ENGINE ARCHITECTURE</span>
          </div>
          <span className="bento-header-status">HIGH CONCURRENCY STREAMING PIPELINE</span>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1: FastStart Video Pipeline (Wide) */}
          <article className="bento-card bento-wide bento-video">
            <span className="deck-corner deck-corner-tl" aria-hidden="true">+</span>
            <span className="deck-corner deck-corner-tr" aria-hidden="true">+</span>
            <div className="bento-card-top">
              <div className="bento-icon-wrap icon-video">
                <Film size={20} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="bento-badge badge-video mono">HARDWARE ACCELERATED</span>
            </div>

            <div className="bento-card-content">
              <h3 className="bento-title mono">H.264 FASTSTART UNIVERSAL PIPELINE</h3>
              <p className="bento-desc">
                Video containers are remuxed in-stream using FFmpeg, relocating the MP4 <code>moov atom</code> to the file header. Ensures instant scrubbing and zero stutter across Safari, iOS, and all Android devices.
              </p>

              <div className="bento-pipeline-graphic mono" aria-hidden="true">
                <div className="pipeline-node">RAW UPSTREAM</div>
                <ArrowRight size={14} className="pipeline-arrow" />
                <div className="pipeline-node highlight">FFMPEG REMUX</div>
                <ArrowRight size={14} className="pipeline-arrow" />
                <div className="pipeline-node">MOOV FASTSTART</div>
                <ArrowRight size={14} className="pipeline-arrow" />
                <div className="pipeline-node success">IOS READY</div>
              </div>
            </div>
          </article>

          {/* Bento Card 2: Audio Synthesizer */}
          <article className="bento-card bento-tall bento-audio">
            <span className="deck-corner deck-corner-tl" aria-hidden="true">+</span>
            <span className="deck-corner deck-corner-tr" aria-hidden="true">+</span>
            <div className="bento-card-top">
              <div className="bento-icon-wrap icon-audio">
                <Music size={20} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="bento-badge badge-audio mono">192 KBPS STEREO</span>
            </div>

            <div className="bento-card-content">
              <h3 className="bento-title mono">LOSSLESS AUDIO EXTRACTION</h3>
              <p className="bento-desc">
                Extract high-bitrate MP3 audio tracks directly from TikTok viral trends, YouTube Music, and Instagram Reels with full ID3 metadata tags.
              </p>

              <div className="bento-waveform-graphic" aria-hidden="true">
                <span className="waveform-bar bar-1" />
                <span className="waveform-bar bar-2" />
                <span className="waveform-bar bar-3" />
                <span className="waveform-bar bar-4" />
                <span className="waveform-bar bar-5" />
                <span className="waveform-bar bar-6" />
                <span className="waveform-bar bar-7" />
                <span className="waveform-bar bar-8" />
              </div>
            </div>
          </article>

          {/* Bento Card 3: Original Photos */}
          <article className="bento-card bento-tall bento-photo">
            <span className="deck-corner deck-corner-tl" aria-hidden="true">+</span>
            <span className="deck-corner deck-corner-tr" aria-hidden="true">+</span>
            <div className="bento-card-top">
              <div className="bento-icon-wrap icon-photo">
                <Layers size={20} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="bento-badge badge-photo mono">ORIGINAL ASSETS</span>
            </div>

            <div className="bento-card-content">
              <h3 className="bento-title mono">ORIGINAL SLIDESHOW SCRAPER</h3>
              <p className="bento-desc">
                Bypasses platform compression by querying raw master endpoints (including X <code>name=orig</code> and Instagram full-bleed carousel slide assets).
              </p>

              <div className="bento-photo-graphic mono" aria-hidden="true">
                <div className="photo-card-chip">SLIDE 01 : MASTER</div>
                <div className="photo-card-chip">SLIDE 02 : RAW JPG</div>
              </div>
            </div>
          </article>

          {/* Bento Card 4: Proxy Shield (Wide) */}
          <article className="bento-card bento-wide bento-security">
            <span className="deck-corner deck-corner-tl" aria-hidden="true">+</span>
            <span className="deck-corner deck-corner-tr" aria-hidden="true">+</span>
            <div className="bento-card-top">
              <div className="bento-icon-wrap icon-security">
                <ShieldCheck size={20} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <span className="bento-badge badge-security mono">AIR-GAPPED SHIELD</span>
            </div>

            <div className="bento-card-content">
              <h3 className="bento-title mono">SSRF-HARDENED ZERO-LOG PROXY</h3>
              <p className="bento-desc">
                All media payloads stream through an in-memory secure proxy with active DNS-lookup validation. Zero disk logs, zero client tracking, and strict origin isolation.
              </p>

              <div className="bento-status-row mono" aria-hidden="true">
                <div className="status-item">
                  <span className="status-label">LATENCY</span>
                  <span className="status-val">&lt; 15MS</span>
                </div>
                <div className="status-item">
                  <span className="status-label">DNS CHECK</span>
                  <span className="status-val text-green">PASSED</span>
                </div>
                <div className="status-item">
                  <span className="status-label">DISK RETENTION</span>
                  <span className="status-val">0 BYTES</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
