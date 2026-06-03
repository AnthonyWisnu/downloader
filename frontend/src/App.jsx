import FeatureSection from "./components/FeatureSection";
import HowToSection from "./components/HowToSection";
import LoadingSpinner from "./components/LoadingSpinner";
import ResultCard from "./components/ResultCard";
import UrlInput from "./components/UrlInput";
import useDownloader from "./hooks/useDownloader";

function App() {
  const downloader = useDownloader();

  return (
    <main className="app-shell">
      <section className="hero-section">
        <h1>VOID</h1>
        <p>// download tiktok & instagram. no watermark. no bullshit.</p>
      </section>

      <div className="page-separator" />

      <UrlInput
        value={downloader.url}
        error={downloader.error}
        isLoading={downloader.isLoading}
        detectedPlatform={downloader.detectedPlatform}
        canSubmit={downloader.canSubmit}
        onChange={downloader.setUrl}
        onSubmit={downloader.submit}
      />

      {downloader.isLoading ? <LoadingSpinner /> : null}
      {!downloader.isLoading ? <ResultCard result={downloader.result} /> : null}

      <HowToSection />
      <FeatureSection />

      <footer className="app-footer">
        <span>VOID v1.0.0</span>
        <span>{downloader.serverLabel}</span>
      </footer>
    </main>
  );
}

export default App;
