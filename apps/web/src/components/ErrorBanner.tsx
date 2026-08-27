interface ErrorBannerProps {
  message: string;
  onRetry: (() => void) | null;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <div className="error-icon">!</div>
      <div><strong>We hit a snag</strong><p>{message}</p></div>
      <div className="error-actions">{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}<button className="icon-button" aria-label="Dismiss error" onClick={onDismiss}>×</button></div>
    </div>
  );
}
