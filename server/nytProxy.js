// Proxy verso le API del New York Times.
// Gira lato server (Netlify Function in produzione, middleware di Vite in
// sviluppo): aggiunge la chiave segreta, accetta solo gli endpoint usati
// dall'app e imposta la cache per restare nei limiti dell'API
// (5 richieste al minuto, 500 al giorno).
import { TOP_STORIES_SECTIONS } from "../src/config/sections.js";

const NYT_BASE_URL = "https://api.nytimes.com/svc";
const POPULAR_TYPES = ["viewed", "emailed"];
const POPULAR_PERIODS = ["1", "7", "30"];
const SEARCH_SORTS = ["relevance", "newest", "oldest"];
const MAX_QUERY_LENGTH = 200;
const MAX_SEARCH_PAGE = 100;

// Secondi di cache sulla CDN di Netlify per ogni tipo di richiesta.
const CDN_TTL = { topstories: 600, mostpopular: 3600, search: 1800 };

// Trasforma il percorso dell'app (/api/...) nella richiesta all'API NYT.
// Restituisce null se l'endpoint o i parametri non sono ammessi.
export function resolveNytRoute(pathname, searchParams) {
  const path = pathname.replace(/^\/api\//, "").replace(/\/+$/, "");

  if (path.startsWith("topstories/")) {
    const section = path.slice("topstories/".length);
    if (!TOP_STORIES_SECTIONS.includes(section)) return null;
    return { kind: "topstories", path: `/topstories/v2/${section}.json`, params: {} };
  }

  const popular = path.match(/^mostpopular\/([a-z]+)\/(\d+)$/);
  if (popular) {
    const [, type, period] = popular;
    if (!POPULAR_TYPES.includes(type) || !POPULAR_PERIODS.includes(period)) return null;
    return { kind: "mostpopular", path: `/mostpopular/v2/${type}/${period}.json`, params: {} };
  }

  if (path === "search") {
    const query = (searchParams.get("q") ?? "").trim();
    const page = Number(searchParams.get("page") ?? "0");
    const sort = searchParams.get("sort") ?? "relevance";
    if (!query || query.length > MAX_QUERY_LENGTH) return null;
    if (!Number.isInteger(page) || page < 0 || page > MAX_SEARCH_PAGE) return null;
    if (!SEARCH_SORTS.includes(sort)) return null;
    return {
      kind: "search",
      path: "/search/v2/articlesearch.json",
      params: { q: query, page: String(page), sort },
    };
  }

  return null;
}

function errorResponse(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function successResponse(body, kind) {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${CDN_TTL[kind]}, stale-while-revalidate=86400`,
    },
  });
}

// Cache in memoria: evita di richiamare l'API per la stessa risposta finché
// l'istanza resta attiva (utile soprattutto in sviluppo, dove non c'è la CDN).
// Ha un numero massimo di voci: la ricerca accetta testi sempre diversi, e
// senza limite chi inviasse richieste tutte diverse farebbe crescere la
// memoria senza fermarsi. Oltre il limite si elimina la voce più vecchia.
export const MAX_CACHE_ENTRIES = 100;

export function createMemoryCache({ ttlMs = 5 * 60 * 1000, maxEntries = MAX_CACHE_ENTRIES, now = Date.now } = {}) {
  // Una Map conserva l'ordine di inserimento: la prima chiave è la più vecchia.
  const entries = new Map();
  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (now() - entry.savedAt > ttlMs) {
        entries.delete(key);
        return null;
      }
      return entry.body;
    },
    set(key, body) {
      // Cancellare prima di reinserire sposta la voce in fondo: è la più recente.
      entries.delete(key);
      entries.set(key, { body, savedAt: now() });
      while (entries.size > maxEntries) {
        entries.delete(entries.keys().next().value);
      }
    },
    get size() {
      return entries.size;
    },
  };
}

export async function handleNytRequest(request, { apiKey, fetchImpl = fetch, cache = null } = {}) {
  if (request.method !== "GET") return errorResponse(405, "Method not allowed");

  const url = new URL(request.url);
  const route = resolveNytRoute(url.pathname, url.searchParams);
  if (!route) return errorResponse(404, "Unknown endpoint or invalid parameters");
  if (!apiKey) return errorResponse(500, "The NYT API key is not configured on the server");

  const cacheKey = `${route.path}?${new URLSearchParams(route.params)}`;
  const cached = cache?.get(cacheKey);
  if (cached) return successResponse(cached, route.kind);

  const upstreamUrl = new URL(NYT_BASE_URL + route.path);
  for (const [name, value] of Object.entries(route.params)) upstreamUrl.searchParams.set(name, value);
  upstreamUrl.searchParams.set("api-key", apiKey);

  let upstream;
  try {
    upstream = await fetchImpl(upstreamUrl, { headers: { Accept: "application/json" } });
  } catch {
    return errorResponse(502, "The New York Times API cannot be reached");
  }

  if (upstream.status === 429) return errorResponse(429, "Too many requests to the NYT API");
  if (upstream.status === 401 || upstream.status === 403) {
    return errorResponse(502, "The NYT API rejected the server key");
  }
  if (!upstream.ok) return errorResponse(502, `The NYT API answered with status ${upstream.status}`);

  const body = await upstream.text();
  cache?.set(cacheKey, body);
  return successResponse(body, route.kind);
}
