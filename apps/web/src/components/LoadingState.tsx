import { useEffect, useState } from "react";

const messages = [
  "Reading your profile…",
  "Mapping the right signal…",
  "Turning insight into a clear path…",
  "Almost ready…",
];

export function LoadingState({ label = "Working on your personalized path" }: { label?: string }) {
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setMessageIndex((index) => (index + 1) % messages.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-orbit">
        <span />
        <span />
        <span />
      </div>
      <div>
        <strong>{label}</strong>
        <p>{messages[messageIndex]}</p>
      </div>
      <div className="skeleton-lines">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
