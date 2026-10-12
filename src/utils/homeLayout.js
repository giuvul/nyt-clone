// Divide le notizie della home (Top Stories "home") nei blocchi della pagina,
// rispettando l'ordine scelto dalla redazione del NYT.
import { findSectionByName } from "../config/sections.js";

const SECONDARY_COUNT = 3;
const SPOTLIGHT_COUNT = 2;
const OPINION_COUNT = 5;
const MIN_GROUP_SIZE = 2;

function sectionInfo(name) {
  const section = findSectionByName(name);
  if (section) return { key: section.slug, label: section.label, slug: section.slug };
  const label = name ? name.charAt(0).toUpperCase() + name.slice(1) : "More News";
  return { key: name || "more", label, slug: null };
}

// Raggruppa gli articoli per sezione, nell'ordine in cui compaiono.
export function groupBySection(articles) {
  const groups = new Map();
  for (const article of articles) {
    const info = sectionInfo(article.section);
    if (!groups.has(info.key)) groups.set(info.key, { ...info, articles: [] });
    groups.get(info.key).articles.push(article);
  }
  return [...groups.values()];
}

export function buildHomeLayout(articles) {
  const opinion = articles.filter((article) => article.section === "opinion");
  const news = articles.filter((article) => article.section !== "opinion");

  // In apertura va la prima notizia con una foto, come sul sito originale.
  const lead = news.find((article) => article.image) ?? news[0] ?? null;
  const others = news.filter((article) => article !== lead);

  // Le sezioni con una sola notizia finiscono insieme in un blocco finale,
  // per non avere righe quasi vuote.
  const groups = groupBySection(others.slice(SECONDARY_COUNT + SPOTLIGHT_COUNT));
  const sections = groups.filter((group) => group.articles.length >= MIN_GROUP_SIZE);
  const singles = groups.filter((group) => group.articles.length < MIN_GROUP_SIZE).flatMap((group) => group.articles);
  if (singles.length > 0) {
    sections.push({ key: "more", label: "More Top Stories", slug: null, articles: singles });
  }

  return {
    lead,
    secondary: others.slice(0, SECONDARY_COUNT),
    spotlight: others.slice(SECONDARY_COUNT, SECONDARY_COUNT + SPOTLIGHT_COUNT),
    opinion: opinion.slice(0, OPINION_COUNT),
    sections,
  };
}
