import { useState } from "react";
import { useSearchParams } from "react-router";
import ArticleCard from "../components/ArticleCard.jsx";
import { EmptyMessage, ErrorMessage, LoadingSkeleton } from "../components/StatusMessage.jsx";
import { useArticleSearch } from "../hooks/useArticleSearch.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import styles from "./SimplePage.module.css";

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const numberFormatter = new Intl.NumberFormat("en-US");

// La ricerca vive nell'URL (/search?q=...&sort=...): si può condividere
// e il tasto Indietro del browser funziona.
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const sort = SORTS.some((item) => item.value === params.get("sort")) ? params.get("sort") : "relevance";
  const search = useArticleSearch(query, sort);
  useDocumentTitle(query ? `Search: ${query}` : "Search");

  function handleSort(event) {
    setParams({ q: query, sort: event.target.value });
  }

  const firstLoad = search.articles.length === 0 && (search.status === "loading" || (search.status === "idle" && query));

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Search</h1>
      {/* key: se la ricerca cambia dall'esterno (barra in alto, Indietro)
          il campo riparte dal nuovo testo, senza effetti di sincronizzazione. */}
      <SearchForm key={query} initialQuery={query} onSearch={(text) => setParams({ q: text, sort })} />

      {query && search.status === "success" && (
        <div className={styles.toolbar}>
          <span role="status">
            {numberFormatter.format(search.hits)} results for “{query}”
          </span>
          <label>
            Sort by{" "}
            <select className={styles.select} value={sort} onChange={handleSort}>
              {SORTS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {firstLoad && <LoadingSkeleton label="Searching…" />}
      {search.status === "error" && <ErrorMessage message={search.error} onRetry={search.retry} />}
      {search.status === "success" && search.hits === 0 && (
        <EmptyMessage>No articles match your search. Try different words.</EmptyMessage>
      )}

      {search.articles.length > 0 && (
        <div className={styles.list}>
          {search.articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="horizontal" headingLevel={2} />
          ))}
        </div>
      )}

      {(search.hasMore || (search.status === "loading" && search.articles.length > 0)) && (
        <button
          type="button"
          className={`button ${styles.more}`}
          onClick={search.loadMore}
          disabled={search.status === "loading"}
        >
          {search.status === "loading" ? "Loading…" : "Show more"}
        </button>
      )}
    </div>
  );
}

function SearchForm({ initialQuery, onSearch }) {
  const [draft, setDraft] = useState(initialQuery);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <input
        type="search"
        className={styles.input}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search the archive since 1851"
        aria-label="Search articles"
        maxLength={200}
      />
      <button type="submit" className="button">Search</button>
    </form>
  );
}
