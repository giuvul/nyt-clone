// Netlify Function: risponde su /api/* e inoltra le richieste all'API del NYT.
// La chiave è nella variabile d'ambiente NYT_API_KEY, mai nel codice del browser.
import { createMemoryCache, handleNytRequest } from "../../server/nytProxy.js";

const cache = createMemoryCache();

export default (request) =>
  handleNytRequest(request, { apiKey: process.env.NYT_API_KEY, cache });

export const config = { path: "/api/*" };
