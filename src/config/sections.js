// Sezioni del sito. `slug` è usato negli URL dell'app, `api` è il nome che
// la Top Stories API si aspetta (diverso solo per Books).
export const SECTIONS = [
  { slug: "us", api: "us", label: "U.S." },
  { slug: "world", api: "world", label: "World" },
  { slug: "politics", api: "politics", label: "Politics" },
  { slug: "nyregion", api: "nyregion", label: "N.Y." },
  { slug: "business", api: "business", label: "Business" },
  { slug: "technology", api: "technology", label: "Tech" },
  { slug: "science", api: "science", label: "Science" },
  { slug: "health", api: "health", label: "Health" },
  { slug: "sports", api: "sports", label: "Sports" },
  { slug: "arts", api: "arts", label: "Arts" },
  { slug: "books", api: "books/review", label: "Books" },
  { slug: "movies", api: "movies", label: "Movies" },
  { slug: "theater", api: "theater", label: "Theater" },
  { slug: "fashion", api: "fashion", label: "Style" },
  { slug: "food", api: "food", label: "Food" },
  { slug: "travel", api: "travel", label: "Travel" },
  { slug: "magazine", api: "magazine", label: "Magazine" },
  { slug: "t-magazine", api: "t-magazine", label: "T Magazine" },
  { slug: "realestate", api: "realestate", label: "Real Estate" },
  { slug: "opinion", api: "opinion", label: "Opinion" },
  { slug: "upshot", api: "upshot", label: "The Upshot" },
  { slug: "obituaries", api: "obituaries", label: "Obituaries" },
  { slug: "insider", api: "insider", label: "Times Insider" },
];

// Sezioni mostrate nella barra di navigazione orizzontale (desktop).
export const NAV_SLUGS = [
  "us", "world", "politics", "nyregion", "business", "technology", "science",
  "health", "sports", "arts", "books", "fashion", "food", "travel", "opinion",
];

// Sezioni che la Top Stories API accetta: "home" più quelle del sito.
export const TOP_STORIES_SECTIONS = ["home", ...SECTIONS.map((section) => section.api)];

export function findSectionBySlug(slug) {
  return SECTIONS.find((section) => section.slug === slug) ?? null;
}

// Gli articoli riportano la sezione con il nome usato dall'API ("us",
// "world", "books"...): restituisce la sezione del sito corrispondente.
export function findSectionByName(name) {
  if (!name) return null;
  const key = name.toLowerCase();
  return SECTIONS.find((section) => section.slug === key || section.api === key) ?? null;
}
