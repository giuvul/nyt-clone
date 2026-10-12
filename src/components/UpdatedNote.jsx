import { formatTimeAgo } from "../utils/format.js";
import styles from "./UpdatedNote.module.css";

// Ultimo aggiornamento delle notizie e pulsante per ricaricarle.
export default function UpdatedNote({ updatedAt, loading, error, onRefresh }) {
  const timeAgo = formatTimeAgo(updatedAt);

  return (
    <div className={styles.note} aria-live="polite">
      {timeAgo && (
        <span>
          Updated <time dateTime={updatedAt}>{timeAgo.toLowerCase()}</time>
        </span>
      )}
      {error && <span className={styles.error}>{error}</span>}
      <button type="button" className="button button-light" onClick={onRefresh} disabled={loading}>
        {loading ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
