import { platformLabel } from "../utils/detectPlatform";

function UrlInput({
  value,
  error,
  isLoading,
  detectedPlatform,
  canSubmit,
  onChange,
  onSubmit
}) {
  const hasError = Boolean(error);
  const inputClassName = hasError ? "url-input-field has-error" : "url-input-field";
  const statusLabel =
    detectedPlatform && detectedPlatform !== "unknown"
      ? platformLabel(detectedPlatform)
      : "WAITING";

  return (
    <section className="url-input-section" aria-label="Download form">
      <form className="url-input-form" onSubmit={onSubmit}>
        <div className="url-input-row">
          <input
            className={inputClassName}
            type="url"
            value={value}
            placeholder="PASTE URL HERE_"
            autoComplete="off"
            spellCheck="false"
            aria-invalid={hasError}
            aria-describedby={hasError ? "url-input-error" : "url-input-status"}
            disabled={isLoading}
            onChange={(event) => onChange(event.target.value)}
          />

          <button
            className="grab-button"
            type="submit"
            disabled={!canSubmit}
            aria-label="Grab download links"
          >
            {isLoading ? "[ ... ]" : "[ GRAB ]"}
          </button>
        </div>

        <div className="url-input-meta" id="url-input-status">
          <span>INPUT: {value ? "READY" : "EMPTY"}</span>
          <span>PLATFORM: {statusLabel}</span>
        </div>

        {hasError ? (
          <p className="url-input-error" id="url-input-error">
            ERR: {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export default UrlInput;
