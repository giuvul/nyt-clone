import { useMostPopular } from "../store/NewsContext.jsx";
import { ErrorMessage } from "./StatusMessage.jsx";
import styles from "./MostPopular.module.css";

// Classifica degli articoli più letti nelle ultime 24 ore (Most Popular API).
export default function MostPopular({ count = 6 }) {
  const { status, data, error, reload } = useMostPopular(1);
  const articles = data?.articles.slice(0, count) ?? [];

  return (
    <section className={styles.box} aria-labelledby="most-popular-title">
      <h2 id="most-popular-title" className="block-title">Most Popular</h2>
      {status === "error" && !data && <ErrorMessage message={error} onRetry={reload} />}
      {!data && status === "loading" && <p className={styles.note}>Loading…</p>}
      <ol className={styles.list}>
        {articles.map((article, index) => (
          <li key={article.id} className={styles.item}>
            <span className={styles.rank} aria-hidden="true">{index + 1}</span>
            <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
              {article.title}
            </a>
            {article.image && (
              <img src={article.image.square} alt="" loading="lazy" className={styles.thumb} />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
