export const ARTICLE_CATEGORY = "Informasi & Edukasi";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Jakarta",
});

export function formatLongDate(value) {
  return dateFormatter.format(new Date(value));
}

export function formatTimeWib(value) {
  return `${timeFormatter.format(new Date(value))} WIB`;
}