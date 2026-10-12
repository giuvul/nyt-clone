import styles from "./StatusMessage.module.css";

// Messaggio di errore con pulsante per riprovare.
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.title}>We couldn’t load the news.</p>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

// Segnaposto grigi mentre arrivano i dati, con la stessa forma delle notizie.
export function LoadingSkeleton({ rows = 3, label = "Loading the news…" }) {
  return (
    <div className={styles.skeleton} role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.row} aria-hidden="true">
          <div className={styles.lines}>
            <span style={{ width: "90%" }} />
            <span style={{ width: "70%" }} />
            <span style={{ width: "40%" }} />
          </div>
          <div className={styles.picture} />
        </div>
      ))}
    </div>
  );
}

export function EmptyMessage({ children }) {
  return <p className={styles.empty}>{children}</p>;
}
