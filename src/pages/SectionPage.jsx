import { useParams } from "react-router";
import ArticleCard from "../components/ArticleCard.jsx";
import { EmptyMessage, ErrorMessage, LoadingSkeleton } from "../components/StatusMessage.jsx";
import UpdatedNote from "../components/UpdatedNote.jsx";
import { findSectionBySlug } from "../config/sections.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useTopStories } from "../store/NewsContext.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import styles from "./SectionPage.module.css";

const FEATURED_COUNT = 5;

export default function SectionPage() {
  const { slug } = useParams();
  const section = findSectionBySlug(slug);
  if (!section) return <NotFoundPage />;
  // key: cambiando sezione il componente riparte da zero.
  return <SectionContent key={section.slug} section={section} />;
}

function SectionContent({ section }) {
  useDocumentTitle(section.label);
  const { status, data, error, reload } = useTopStories(section.api);
  const articles = data?.articles ?? [];
  const featured = articles.slice(0, FEATURED_COUNT);
  const latest = articles.slice(FEATURED_COUNT);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>{section.label}</h1>
      </header>

      {!data && status === "error" && <ErrorMessage message={error} onRetry={reload} />}
      {!data && status === "loading" && <LoadingSkeleton label={`Loading ${section.label}…`} />}
      {data && articles.length === 0 && <EmptyMessage>No stories in this section right now.</EmptyMessage>}

      {featured.length > 0 && (
        <div className={styles.featured}>
          {featured.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant={index === 0 ? "lead" : "standard"}
              headingLevel={2}
              priority={index === 0}
            />
          ))}
        </div>
      )}

      {latest.length > 0 && (
        <section aria-labelledby="latest-title">
          <h2 id="latest-title" className="block-title">Latest</h2>
          <div className={styles.latest}>
            {latest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </section>
      )}

      {data && (
        <UpdatedNote updatedAt={data.updatedAt} loading={status === "loading"} error={status === "error" ? error : null} onRefresh={reload} />
      )}
    </>
  );
}
