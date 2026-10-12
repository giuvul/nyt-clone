// Repository: l'unico modulo dell'app che conosce gli endpoint e Axios.
// Le richieste vanno al proxy /api (Netlify Function), che aggiunge la chiave.
import axios from "axios";
import { fromPopular, fromSearchDoc, fromTopStory, mapArticles } from "../models/article.js";

export const SEARCH_PAGE_SIZE = 10;

// Converte gli errori di Axios in messaggi comprensibili per l'utente.
export function describeApiError(error) {
  const status = error?.response?.status;
  if (status === 429) return "The NYT API limit was reached. Please try again in a minute.";
  if (status === 404) return "This content is not available.";
  if (status >= 500) return "The news service is not responding right now.";
  if (error?.code === "ECONNABORTED") return "The request took too long.";
  return "Check your connection and try again.";
}

export function createNytApi(http = axios.create({ baseURL: "/api", timeout: 15000 })) {
  return {
    async getTopStories(section) {
      const { data } = await http.get(`/topstories/${section}`);
      return {
        articles: mapArticles(data?.results, fromTopStory),
        updatedAt: data?.last_updated ?? null,
      };
    },

    async getMostPopular(days = 1) {
      const { data } = await http.get(`/mostpopular/viewed/${days}`);
      return { articles: mapArticles(data?.results, fromPopular) };
    },

    async searchArticles({ query, page = 0, sort = "relevance" }) {
      const { data } = await http.get("/search", { params: { q: query, page, sort } });
      const docs = data?.response?.docs;
      const hits = data?.response?.meta?.hits ?? data?.response?.metadata?.hits ?? 0;
      return { articles: mapArticles(docs, fromSearchDoc), hits, page };
    },
  };
}
