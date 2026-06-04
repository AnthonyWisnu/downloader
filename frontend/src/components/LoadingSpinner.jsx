import { useEffect, useState } from "react";

function getHelpText(platform) {
  if (platform === "instagram") {
    return "instagram memerlukan waktu lebih lama untuk diproses";
  }

  return "tiktok biasanya 3-5 detik, instagram bisa lebih lama";
}

function LoadingSpinner({ platform }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return (
    <div className="loading-text" role="status" aria-live="polite">
      <div>[ FETCHING... {elapsedSeconds}s ]</div>
      {elapsedSeconds >= 3 ? (
        <div className="loading-help-text">{getHelpText(platform)}</div>
      ) : null}
    </div>
  );
}

export default LoadingSpinner;
