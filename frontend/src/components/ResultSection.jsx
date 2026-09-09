import MediaResult from "./MediaResult";

function ResultSection({ result, onReset }) {
  if (!result) {
    return null;
  }

  return (
    <section className="result-section section bg-black" aria-label="Hasil Ekstraksi Media">
      <div className="section-inner result-inner">
        <div className="result-tag-bar mono">
          <span className="section-tag">[04] EXTRACTION RESULT</span>
          <span className="result-sys-status">UNIVERSAL MEDIA DISPATCHER</span>
        </div>

        <MediaResult result={result} onReset={onReset} />
      </div>
    </section>
  );
}

export default ResultSection;
