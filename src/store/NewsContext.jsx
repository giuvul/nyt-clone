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
  // Due registri che load deve consultare senza dipendere dallo stato:
  // le richieste in corso e l'ora dell'ultimo caricamento riuscito per chiave.
  // Si aggiornano solo dentro load (effetti e clic), mai durante il render.
  const inFlight = useRef(new Set());
  const loadedAt = useRef(new Map());

  const load = useCallback(
    async (key, loader, { force = false } = {}) => {
      const lastSuccess = loadedAt.current.get(key);
      const isFresh = lastSuccess !== undefined && now() - lastSuccess < FRESH_FOR_MS;
      if (inFlight.current.has(key) || (isFresh && !force)) return;

      inFlight.current.add(key);
      dispatch({ type: "request", key });
      try {
        const data = await loader(api);
        const at = now();
        loadedAt.current.set(key, at);
        dispatch({ type: "success", key, data, at });
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
// Il loader deve essere stabile (useCallback): cambia solo quando cambia la
// risorsa richiesta, quindi può stare tra le dipendenze dell'effetto.
function useNewsResource(key, loader) {
  const { entries, load } = useNews();

  useEffect(() => {
    load(key, loader);
  }, [key, loader, load]);

  const reload = useCallback(() => load(key, loader, { force: true }), [key, loader, load]);
  const entry = entries[key] ?? EMPTY_ENTRY;
  // Prima che l'effetto parta la voce non esiste ancora: è già "in caricamento".
  const status = entry.status === "idle" ? "loading" : entry.status;
  return { ...entry, status, reload };
}

export function useTopStories(section) {
  const loader = useCallback((api) => api.getTopStories(section), [section]);
  return useNewsResource(`topstories/${section}`, loader);
}

export function useMostPopular(days = 1) {
  const loader = useCallback((api) => api.getMostPopular(days), [days]);
  return useNewsResource(`mostpopular/${days}`, loader);
}
