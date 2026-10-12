import { describe, expect, it, vi } from "vitest";
import { createNytApi, describeApiError } from "../src/api/nytApi.js";
import { rawPopular, rawSearchDoc, rawTopStory } from "./fixtures.js";

function fakeHttp(data) {
  return { get: vi.fn(async () => ({ data })) };
}

describe("createNytApi", () => {
  it("loads top stories of a section through the proxy", async () => {
    const http = fakeHttp({ results: [rawTopStory(1), rawTopStory(2)], last_updated: "2026-10-12T10:00:00-04:00" });
    const result = await createNytApi(http).getTopStories("world");

    expect(http.get).toHaveBeenCalledWith("/topstories/world");
    expect(result.articles.map((article) => article.title)).toEqual(["Top story 1", "Top story 2"]);
    expect(result.updatedAt).toBe("2026-10-12T10:00:00-04:00");
  });

  it("loads the most viewed articles", async () => {
    const http = fakeHttp({ results: [rawPopular(1)] });
    const result = await createNytApi(http).getMostPopular(7);
    expect(http.get).toHaveBeenCalledWith("/mostpopular/viewed/7");
    expect(result.articles[0].title).toBe("Popular story 1");
  });

  it("searches with query, page and sort", async () => {
    const http = fakeHttp({ response: { docs: [rawSearchDoc(1)], metadata: { hits: 42 } } });
    const result = await createNytApi(http).searchArticles({ query: "mars", page: 2, sort: "newest" });

    expect(http.get).toHaveBeenCalledWith("/search", { params: { q: "mars", page: 2, sort: "newest" } });
    expect(result).toMatchObject({ hits: 42, page: 2 });
    expect(result.articles[0].title).toBe("Search result 1");
  });

  it("reads hits from the older meta field and survives null docs", async () => {
    const http = fakeHttp({ response: { docs: null, meta: { hits: 0 } } });
    const result = await createNytApi(http).searchArticles({ query: "zzz" });
    expect(result).toMatchObject({ articles: [], hits: 0, page: 0 });
  });
});

describe("describeApiError", () => {
  it("turns HTTP errors into readable messages", () => {
    expect(describeApiError({ response: { status: 429 } })).toMatch(/limit/);
    expect(describeApiError({ response: { status: 502 } })).toMatch(/not responding/);
    expect(describeApiError({ code: "ECONNABORTED" })).toMatch(/too long/);
    expect(describeApiError(new Error("Network Error"))).toMatch(/connection/);
  });
});
