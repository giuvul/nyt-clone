import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createMemoryCache, handleNytRequest } from "./server/nytProxy.js";

// In sviluppo (npm run dev / preview) le richieste /api/* passano dallo
// stesso proxy usato dalla Netlify Function, con la chiave letta da .env.
function nytApiProxy(apiKey) {
  const cache = createMemoryCache({ ttlMs: 10 * 60 * 1000 });

  async function middleware(req, res) {
    const request = new Request(`http://localhost/api${req.url}`, { method: req.method });
    const response = await handleNytRequest(request, { apiKey, cache });
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(await response.text());
  }

  return {
    name: "nyt-api-proxy",
    configureServer(server) {
      server.middlewares.use("/api", middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api", middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Senza prefisso VITE_ la variabile non entra mai nel bundle del browser.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), nytApiProxy(env.NYT_API_KEY)],
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.js"],
    },
  };
});
