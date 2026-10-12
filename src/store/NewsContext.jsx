import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { describeApiError } from "../api/nytApi.js";
import { EMPTY_ENTRY, initialNewsState, newsReducer } from "./newsReducer.js";

// Dopo questo intervallo una risposta salvata viene richiesta di nuovo.
export const FRESH_FOR_MS = 5 * 60 * 1000;

const NewsContext = createContext(null);

// L'api viene passata come prop (Dependency Injection): in produzione è
// quella reale, nei test un oggetto finto con gli stessi metodi.
export function NewsProvider({ api, children, now = Date.now }) {
  const [entries, dispatch] = useReducer(newsReducer, initialNewsState);
  const entriesRef = useRef(entries);
  const inFlight = useRef(new Set());
  entriesRef.current = entries;

  const load = useCallback(
    async (key, loader, { force = false } = {}) => {
      const entry = entriesRef.current[key];
      const isFresh = entry?.status === "success" && now() - entry.updatedAt < FRESH_FOR_MS;
      if (inFlight.current.has(key) || (isFresh && !force)) return;

      inFlight.current.add(key);
      dispatch({ type: "request", key });
      try {
        const data = await loader(api);
        dispatch({ type: "success", key, data, at: now() });
      } catch (error) {
        dispatch({ type: "failure", key, error: describeApiError(error) });
      } finally {
        inFlight.current.delete(key);
      }
    },
    [api, now],
  );

  const value = useMemo(() => ({ api, entries, load }), [api, entries, load]);
  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) throw new Error("useNews must be used inside <NewsProvider>");
  return context;
}

// Carica (o riprende dalla cache) una risorsa e ne restituisce lo stato.
function useNewsResource(key, loader) {
  const { entries, load } = useNews();
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    load(key, (api) => loaderRef.current(api));
  }, [key, load]);

  const reload = useCallback(() => load(key, (api) => loaderRef.current(api), { force: true }), [key, load]);
  const entry = entries[key] ?? EMPTY_ENTRY;
  // Prima che l'effetto parta la voce non esiste ancora: è già "in caricamento".
  const status = entry.status === "idle" ? "loading" : entry.status;
  return { ...entry, status, reload };
}

export function useTopStories(section) {
  return useNewsResource(`topstories/${section}`, (api) => api.getTopStories(section));
}

export function useMostPopular(days = 1) {
  return useNewsResource(`mostpopular/${days}`, (api) => api.getMostPopular(days));
}
