// Api finta con gli stessi metodi di createNytApi: niente rete nei test.
import { article, range } from "./fixtures.js";

function homeStories() {
  const sections = ["world", "us", "business", "opinion", "world", "arts", "us", "opinion", "arts", "science", "arts", "climate"];
  return sections.map((section, index) => article(index + 1, { section, title: `Home story ${index + 1}` }));
}

export function createFakeApi({ topStories = {}, failures = {}, searchHits = 25 } = {}) {
  const calls = { topStories: [], popular: 0, search: [] };
  // failures.topStories: numero di chiamate che devono fallire prima di riuscire.
  const remaining = { topStories: failures.topStories ?? 0, search: failures.search ?? 0 };

  return {
    calls,

    async getTopStories(section) {
      calls.topStories.push(section);
      if (remaining.topStories > 0) {
        remaining.topStories--;
        throw Object.assign(new Error("Too many requests"), { response: { status: 429 } });
      }
      const articles = topStories[section] ?? (section === "home"
        ? homeStories()
        : range(1, 8).map((n) => article(`${section}-${n}`, { section, title: `${section} story ${n}` })));
      return { articles, updatedAt: "2026-10-12T12:00:00.000Z" };
    },

    async getMostPopular() {
      calls.popular++;
      return { articles: range(1, 6).map((n) => article(`popular-${n}`, { title: `Popular ${n}` })) };
    },

    async searchArticles({ query, page = 0, sort = "relevance" }) {
      calls.search.push({ query, page, sort });
      if (remaining.search > 0) {
        remaining.search--;
        throw Object.assign(new Error("Server error"), { response: { status: 502 } });
      }
      const first = page * 10 + 1;
      const last = Math.min(first + 9, searchHits);
      const articles = first > last ? [] : range(first, last).map((n) =>
        article(`search-${n}`, { title: `${query} result ${n}`, url: `https://www.nytimes.com/search-${n}.html` }));
      return { articles, hits: searchHits, page };
    },
  };
}
