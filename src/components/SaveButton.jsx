import { useSaved } from "../store/SavedContext.jsx";
import { BookmarkIcon } from "./Icons.jsx";
import styles from "./SaveButton.module.css";

export default function SaveButton({ article }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(article.id);

  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={saved}
      aria-label={saved ? `Remove “${article.title}” from saved articles` : `Save “${article.title}” for later`}
      title={saved ? "Remove from saved" : "Save for later"}
      onClick={() => toggle(article)}
    >
      <BookmarkIcon size={16} filled={saved} />
    </button>
  );
}
