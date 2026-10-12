import { useMemo } from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import MostPopular from "../components/MostPopular.jsx";
import SectionBlock from "../components/SectionBlock.jsx";
import { EmptyMessage, ErrorMessage, LoadingSkeleton } from "../components/StatusMessage.jsx";
import UpdatedNote from "../components/UpdatedNote.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useTopStories } from "../store/NewsContext.jsx";
import { buildHomeLayout } from "../utils/homeLayout.js";
import styles from "./HomePage.module.css";

export default function HomePage() {
  useDocumentTitle("");
  const { status, data, error, reload } = useTopStories("home");
  const layout = useMemo(() => buildHomeLayout(data?.articles ?? []), [data]);

  if (!data) {
    return (
      <>
        <h1 className="visually-hidden">Top stories</h1>
        {status === "error" ? <ErrorMessage message={error} onRetry={reload} /> : <LoadingSkeleton />}
      </>
    );
  }

  if (!layout.lead) return <EmptyMessage>There are no stories to show right now.</EmptyMessage>;

  return (
    <>
      <h1 className="visually-hidden">Top stories</h1>

      <div className={styles.top}>
        <div className={styles.main}>
          <ArticleCard article={layout.lead} variant="lead" headingLevel={2} priority />
          <div className={styles.secondary}>
            {layout.secondary.map((article) => (
              <ArticleCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </div>

        <aside className={styles.aside} aria-label="More top stories and opinion">
          <div className={styles.spotlight}>
            {layout.spotlight.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {layout.opinion.length > 0 && (
            <section className={styles.opinion} aria-labelledby="opinion-title">
              <h2 id="opinion-title" className="block-title">Opinion</h2>
              {layout.opinion.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </section>
          )}

          <MostPopular />
        </aside>
      </div>

      <div className={styles.sections}>
        {layout.sections.map((group) => (
          <SectionBlock
            key={group.key}
            label={group.label}
            slug={group.slug}
            articles={group.articles}
            limit={group.slug ? 4 : 8}
            wide={!group.slug || group.articles.length > 2}
          />
        ))}
      </div>

      <UpdatedNote updatedAt={data.updatedAt} loading={status === "loading"} error={status === "error" ? error : null} onRefresh={reload} />
    </>
  );
}
