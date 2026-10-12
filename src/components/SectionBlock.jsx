import { Link } from "react-router";
import ArticleCard from "./ArticleCard.jsx";
import styles from "./SectionBlock.module.css";

// Fascia di una sezione nella home: titolo (con link alla pagina della
// sezione, se esiste) e fino a quattro notizie affiancate. Con `wide` la
// fascia occupa tutta la larghezza della griglia.
export default function SectionBlock({ label, slug, articles, limit = 4, wide = false }) {
  const titleId = `section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className={wide ? `${styles.block} ${styles.wide}` : styles.block} aria-labelledby={titleId}>
      <h2 id={titleId} className="block-title">
        {slug ? (
          <Link to={`/section/${slug}`}>
            {label} <span aria-hidden="true">›</span>
          </Link>
        ) : (
          label
        )}
      </h2>
      <div className={styles.grid}>
        {articles.slice(0, limit).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
