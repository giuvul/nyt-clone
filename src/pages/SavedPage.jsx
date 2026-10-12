import { Link } from "react-router";
import ArticleCard from "../components/ArticleCard.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useSaved } from "../store/SavedContext.jsx";
import styles from "./SimplePage.module.css";

// Elenco degli articoli salvati, conservati nel browser (localStorage).
export default function SavedPage() {
  useDocumentTitle("Saved articles");
  const { saved, clear } = useSaved();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Saved articles</h1>

      {saved.length === 0 ? (
        <>
          <p className={styles.lead}>
            Nothing saved yet. Use the bookmark icon next to any story to read it later.
          </p>
          <Link to="/" className="button">Browse today’s stories</Link>
        </>
      ) : (
        <>
          <div className={styles.toolbar}>
            <span>
              {saved.length} {saved.length === 1 ? "article" : "articles"} saved in this browser
            </span>
            <button type="button" className="button button-light" onClick={clear}>
              Remove all
            </button>
          </div>
          <div className={styles.list}>
            {saved.map((article) => (
              <ArticleCard key={article.id} article={article} variant="horizontal" headingLevel={2} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
