import { useCallback, useEffect, useReducer, useRef } from "react";
import { describeApiError, SEARCH_PAGE_SIZE } from "../api/nytApi.js";
import { useNews } from "../store/NewsContext.jsx";

// L'Article Search API non restituisce pagine oltre la 100.
const LAST_PAGE = 100;

const initialState = { status: "idle", articles: [], hits: 0, page: -1, error: null };

function searchReducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialState;
    case "request":
      return { ...state, status: "loading", error: null };
    case "success": {
      const known = new Set(state.articles.map((article) => article.url));
      const fresh = action.articles.filter((article) => !known.has(article.url));
      const articles = action.page === 0 ? action.articles : [...state.articles, ...fresh];
      return { status: "success", articles, hits: action.hits, page: action.page, error: null };
    }
    case "failure":
      return { ...state, status: "error", error: action.error };
    default:
      return state;
  }
}

// Ricerca con paginazione "Load more": le pagine si sommano finché ce ne sono.
export function useArticleSearch(query, sort) {
  const { api } = useNews();
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (page) => {
      const id = ++requestId.current;
      dispatch({ type: "request" });
      try {
        const result = await api.searchArticles({ query, page, sort });
        // Una risposta arrivata dopo una nuova ricerca viene ignorata.
        if (id === requestId.current) dispatch({ type: "success", ...result, page });
      } catch (error) {
        if (id === requestId.current) dispatch({ type: "failure", error: describeApiError(error) });
      }
    },
    [api, query, sort],
  );

  useEffect(() => {
    dispatch({ type: "reset" });
    if (query) fetchPage(0);
    else requestId.current++;
  }, [query, fetchPage]);

  const nextPage = state.page + 1;
  const hasMore =
    state.status !== "loading" && nextPage * SEARCH_PAGE_SIZE < state.hits && nextPage <= LAST_PAGE;

  const loadMore = useCallback(() => fetchPage(nextPage), [fetchPage, nextPage]);
  // Riprova la pagina che è fallita (la prima, o la successiva a quelle già caricate).
  const retry = useCallback(() => fetchPage(state.page + 1), [fetchPage, state.page]);

  return { ...state, hasMore, loadMore, retry };
}
