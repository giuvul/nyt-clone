import { formatTimeAgo } from "../utils/format.js";
import SaveButton from "./SaveButton.jsx";
import styles from "./ArticleCard.module.css";

// Una notizia, in diverse varianti grafiche:
// - "lead":       apertura della home, testo a sinistra e foto grande a destra
// - "standard":   foto sopra e testo sotto
// - "horizontal": testo a sinistra, miniatura a destra (liste)
// - "compact":    solo titolo e meta, senza foto
export default function ArticleCard({ article, variant = "standard", headingLevel = 3, priority = false }) {
  const Heading = `h${headingLevel}`;
  const showImage = article.image && variant !== "compact";
  const imageUrl = variant === "horizontal" ? article.image?.medium : article.image?.large;
  const timeAgo = formatTimeAgo(article.publishedAt);

  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      {showImage && (
        <figure className={styles.figure}>
          <img
            src={imageUrl}
            alt={article.image.caption || ""}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
          {variant === "lead" && article.image.credit && (
            <figcaption className={styles.credit}>{article.image.credit}</figcaption>
          )}
        </figure>
      )}

      <div className={styles.text}>
        {article.kicker && <p className={styles.kicker}>{article.kicker}</p>}
        <Heading className={styles.title}>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </Heading>
        {article.abstract && variant !== "compact" && <p className={styles.abstract}>{article.abstract}</p>}
        <div className={styles.meta}>
          <span>
            {timeAgo && <time dateTime={article.publishedAt}>{timeAgo}</time>}
            {timeAgo && article.byline && <span aria-hidden="true"> · </span>}
            {article.byline && <span className={styles.byline}>{article.byline.replace(/^By /i, "")}</span>}
          </span>
          <SaveButton article={article} />
        </div>
      </div>
    </article>
  );
}
