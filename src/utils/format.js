// Date nello stile del NYT, in inglese come i contenuti dell'API.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const mastheadFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

// "Monday, October 12, 2026"
export function formatMastheadDate(date) {
  return mastheadFormatter.format(date);
}

const MONTHS_AP = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

// "Oct. 12, 2026": i mesi abbreviati secondo lo stile AP usato dal giornale.
export function formatArticleDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS_AP[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// "Just now", "12 min ago", "3h ago"; oltre le 24 ore la data completa.
export function formatTimeAgo(isoDate, now = new Date()) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  return formatArticleDate(isoDate);
}
