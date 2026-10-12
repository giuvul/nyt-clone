// Le tre API del NYT restituiscono gli articoli con forme diverse.
// Queste funzioni li trasformano tutti nello stesso oggetto, così i
// componenti non devono conoscere i dettagli di ogni endpoint:
//
// { id, url, title, abstract, byline, section, subsection, kicker,
//   publishedAt, image: { large, medium, square, caption, credit } | null }

const STATIC_HOST = "https://static01.nyt.com/";

function absoluteUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : STATIC_HOST + url.replace(/^\//, "");
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildImage({ large, medium, square, caption, credit }) {
  const best = large ?? medium ?? square;
  if (!best) return null;
  return {
    large: best,
    medium: medium ?? best,
    square: square ?? medium ?? best,
    caption: cleanText(caption),
    credit: cleanText(credit),
  };
}

function isValid(article) {
  return Boolean(article.title && article.url);
}

// Top Stories API: multimedia è un array di formati della stessa foto.
export function fromTopStory(raw) {
  const media = Array.isArray(raw?.multimedia) ? raw.multimedia : [];
  const byFormat = (format) => absoluteUrl(media.find((item) => item.format === format)?.url);
  const first = media[0] ?? {};

  const article = {
    id: raw?.uri || raw?.url || "",
    url: cleanText(raw?.url),
    title: cleanText(raw?.title),
    abstract: cleanText(raw?.abstract),
    byline: cleanText(raw?.byline),
    section: cleanText(raw?.section),
    subsection: cleanText(raw?.subsection),
    kicker: cleanText(raw?.kicker),
    publishedAt: toDate(raw?.published_date) ?? toDate(raw?.updated_date),
    image: buildImage({
      large: byFormat("Super Jumbo"),
      medium: byFormat("threeByTwoSmallAt2X") ?? byFormat("mediumThreeByTwo440"),
      square: byFormat("Large Thumbnail") ?? byFormat("Standard Thumbnail"),
      caption: first.caption,
      credit: first.copyright,
    }),
  };
  return isValid(article) ? article : null;
}

// Most Popular API: le foto sono in media[0]["media-metadata"].
export function fromPopular(raw) {
  const photo = (Array.isArray(raw?.media) ? raw.media : []).find((item) => item.type === "image");
  const metadata = Array.isArray(photo?.["media-metadata"]) ? photo["media-metadata"] : [];
  const byFormat = (format) => absoluteUrl(metadata.find((item) => item.format === format)?.url);

  const article = {
    id: raw?.uri || String(raw?.id ?? raw?.url ?? ""),
    url: cleanText(raw?.url),
    title: cleanText(raw?.title),
    abstract: cleanText(raw?.abstract),
    byline: cleanText(raw?.byline),
    section: cleanText(raw?.section),
    subsection: cleanText(raw?.subsection),
    kicker: "",
    publishedAt: toDate(raw?.published_date),
    image: buildImage({
      large: byFormat("mediumThreeByTwo440"),
      medium: byFormat("mediumThreeByTwo440") ?? byFormat("mediumThreeByTwo210"),
      square: byFormat("Standard Thumbnail"),
      caption: photo?.caption,
      credit: photo?.copyright,
    }),
  };
  return isValid(article) ? article : null;
}

// Article Search API. Gestisce sia il formato attuale di multimedia
// (oggetto con default e thumbnail) sia quello precedente (array con
// percorsi relativi).
function searchImage(multimedia) {
  if (Array.isArray(multimedia)) {
    const bySubtype = (subtype) => absoluteUrl(multimedia.find((item) => item.subtype === subtype)?.url);
    return buildImage({
      large: bySubtype("superJumbo") ?? bySubtype("xlarge"),
      medium: bySubtype("threeByTwoSmallAt2X") ?? bySubtype("xlarge"),
      square: bySubtype("thumbLarge") ?? bySubtype("thumbnail"),
    });
  }
  return buildImage({
    large: absoluteUrl(multimedia?.default?.url),
    medium: absoluteUrl(multimedia?.default?.url),
    square: absoluteUrl(multimedia?.thumbnail?.url),
    caption: multimedia?.caption,
    credit: multimedia?.credit,
  });
}

export function fromSearchDoc(raw) {
  const article = {
    id: raw?.uri || raw?._id || raw?.web_url || "",
    url: cleanText(raw?.web_url),
    title: cleanText(raw?.headline?.main),
    abstract: cleanText(raw?.abstract) || cleanText(raw?.snippet),
    byline: cleanText(raw?.byline?.original),
    section: cleanText(raw?.section_name),
    subsection: cleanText(raw?.subsection_name),
    kicker: cleanText(raw?.headline?.kicker),
    publishedAt: toDate(raw?.pub_date),
    image: searchImage(raw?.multimedia),
  };
  return isValid(article) ? article : null;
}

// Applica un mapper a una lista, scarta gli elementi non validi e i doppioni.
export function mapArticles(list, mapper) {
  const seen = new Set();
  const articles = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const article = mapper(raw);
    if (!article || seen.has(article.url)) continue;
    seen.add(article.url);
    articles.push(article);
  }
  return articles;
}
