import { RotateCcw } from "lucide-react";
import ResultCard from "./ResultCard";

function ResultSection({ result, onReset }) {
  if (!result) {
    return null;
  }

  return (
    <section className="result section bg-off-white" aria-label="Hasil download">
      <div className="result-inner section-inner">
        <div className="result-topbar">
          <span className="section-label">HASIL GRAB</span>

          <button
            className="result-reset btn btn-yellow"
            type="button"
            onClick={onReset}
          >
            <RotateCcw size={18} strokeWidth={2.5} aria-hidden="true" />
            Grab Lagi
          </button>
        </div>

        <ResultCard result={result} />
      </div>
    </section>
  );
}

export default ResultSection;
