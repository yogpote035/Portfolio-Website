function LoadingOverlay({ message = "Loading your workspace..." }) {
  return (
    <div
      className="admin-loading-overlay"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="admin-loading-dialog">
        <span className="admin-loading-spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
