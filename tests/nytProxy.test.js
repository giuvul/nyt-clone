// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createMemoryCache, handleNytRequest, MAX_CACHE_ENTRIES, resolveNytRoute } from "../server/nytProxy.js";

const params = (query = "") => new URLSearchParams(query);
const request = (path, init) => new Request(`https://clone.example${path}`, init);
const okFetch = (body = { results: [] }) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }));

describe("resolveNytRoute", () => {
  it("maps top stories sections, including books/review", () => {
    expect(resolveNytRoute("/api/topstories/home", params()).path).toBe("/topstories/v2/home.json");
    expect(resolveNytRoute("/api/topstories/books/review", params()).path).toBe("/topstories/v2/books/review.json");
  });

  it("rejects unknown sections and path tricks", () => {
    expect(resolveNytRoute("/api/topstories/cooking", params())).toBeNull();
    expect(resolveNytRoute("/api/topstories/../search/v2/x", params())).toBeNull();
    expect(resolveNytRoute("/api/archive/v1/2020/1", params())).toBeNull();
  });

  it("accepts only the most popular types and periods the API supports", () => {
    expect(resolveNytRoute("/api/mostpopular/viewed/1", params()).path).toBe("/mostpopular/v2/viewed/1.json");
    expect(resolveNytRoute("/api/mostpopular/emailed/30", params())).not.toBeNull();
    expect(resolveNytRoute("/api/mostpopular/viewed/2", params())).toBeNull();
    expect(resolveNytRoute("/api/mostpopular/shared/1", params())).toBeNull();
  });

  it("validates search query, page and sort", () => {
    const route = resolveNytRoute("/api/search", params("q=%20climate%20&page=2&sort=newest"));
    expect(route.params).toEqual({ q: "climate", page: "2", sort: "newest" });
    expect(resolveNytRoute("/api/search", params("q=climate")).params).toEqual({ q: "climate", page: "0", sort: "relevance" });
    expect(resolveNytRoute("/api/search", params("q="))).toBeNull();
    expect(resolveNytRoute("/api/search", params(`q=${"a".repeat(201)}`))).toBeNull();
    expect(resolveNytRoute("/api/search", params("q=x&page=101"))).toBeNull();
    expect(resolveNytRoute("/api/search", params("q=x&page=1.5"))).toBeNull();
    expect(resolveNytRoute("/api/search", params("q=x&sort=random"))).toBeNull();
  });
});

describe("handleNytRequest", () => {
  it("adds the API key on the server side and returns the body", async () => {
    const fetchImpl = okFetch({ results: [1] });
    const response = await handleNytRequest(request("/api/topstories/world"), { apiKey: "secret", fetchImpl });

    const calledUrl = fetchImpl.mock.calls[0][0];
    expect(calledUrl.href).toBe("https://api.nytimes.com/svc/topstories/v2/world.json?api-key=secret");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ results: [1] });
  });

  it("forwards search parameters", async () => {
    const fetchImpl = okFetch();
    await handleNytRequest(request("/api/search?q=moon%20landing&page=1&sort=oldest"), { apiKey: "k", fetchImpl });
    const calledUrl = fetchImpl.mock.calls[0][0];
    expect(calledUrl.searchParams.get("q")).toBe("moon landing");
    expect(calledUrl.searchParams.get("page")).toBe("1");
    expect(calledUrl.searchParams.get("sort")).toBe("oldest");
  });

  it("sets CDN cache headers on success", async () => {
    const response = await handleNytRequest(request("/api/topstories/home"), { apiKey: "k", fetchImpl: okFetch() });
    expect(response.headers.get("Netlify-CDN-Cache-Control")).toContain("s-maxage=600");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
  });

  it("returns 404 for endpoints that are not allowed, without calling the API", async () => {
    const fetchImpl = okFetch();
    const response = await handleNytRequest(request("/api/topstories/unknown"), { apiKey: "k", fetchImpl });
    expect(response.status).toBe(404);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns 405 for methods other than GET", async () => {
    const response = await handleNytRequest(request("/api/topstories/home", { method: "POST" }), { apiKey: "k" });
    expect(response.status).toBe(405);
  });

  it("explains a missing key with a 500", async () => {
    const response = await handleNytRequest(request("/api/topstories/home"), { apiKey: "" });
    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("passes rate limits through as 429 and never caches errors", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 429 }));
    const response = await handleNytRequest(request("/api/topstories/home"), { apiKey: "k", fetchImpl });
    expect(response.status).toBe(429);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("does not leak the key when the API rejects it", async () => {
    const fetchImpl = vi.fn(async () => new Response('{"fault":{}}', { status: 401 }));
    const response = await handleNytRequest(request("/api/topstories/home"), { apiKey: "top-secret", fetchImpl });
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("top-secret");
  });

  it("answers 502 when the API cannot be reached", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const response = await handleNytRequest(request("/api/topstories/home"), { apiKey: "k", fetchImpl });
    expect(response.status).toBe(502);
  });

  it("serves repeated requests from the memory cache", async () => {
    const fetchImpl = okFetch({ results: ["cached"] });
    const cache = createMemoryCache();
    await handleNytRequest(request("/api/topstories/home"), { apiKey: "k", fetchImpl, cache });
    const second = await handleNytRequest(request("/api/topstories/home"), { apiKey: "k", fetchImpl, cache });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(await second.json()).toEqual({ results: ["cached"] });
  });
});

describe("createMemoryCache", () => {
  it("forgets entries after the time to live", () => {
    let time = 0;
    const cache = createMemoryCache({ ttlMs: 1000, now: () => time });
    cache.set("a", "body");
    time = 999;
    expect(cache.get("a")).toBe("body");
    time = 1001;
    expect(cache.get("a")).toBeNull();
  });

  it("never holds more than maxEntries, dropping the oldest first", () => {
    const cache = createMemoryCache({ maxEntries: 3 });
    for (const key of ["a", "b", "c", "d"]) cache.set(key, key);
    expect(cache.size).toBe(3);
    expect(cache.get("a")).toBeNull();
    expect(["b", "c", "d"].map((key) => cache.get(key))).toEqual(["b", "c", "d"]);
  });

  it("treats a rewritten entry as the newest", () => {
    const cache = createMemoryCache({ maxEntries: 2 });
    cache.set("a", "old");
    cache.set("b", "b");
    cache.set("a", "new");
    cache.set("c", "c");
    expect(cache.get("b")).toBeNull();
    expect(cache.get("a")).toBe("new");
  });

  it("stays bounded under many different searches", async () => {
    const cache = createMemoryCache();
    const fetchImpl = okFetch();
    for (let n = 0; n < MAX_CACHE_ENTRIES + 50; n++) {
      await handleNytRequest(request(`/api/search?q=query-${n}`), { apiKey: "k", fetchImpl, cache });
    }
    expect(cache.size).toBe(MAX_CACHE_ENTRIES);
  });
});
