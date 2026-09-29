import { intlLocale, type Locale } from "@/i18n/config";

export function formatPrice(value: number | null, currency = "USD", locale: Locale = "en"): string {
  if (value == null || !Number.isFinite(value)) return locale === "fr" ? "Indisponible" : "Unavailable";
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSigned(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatRelativeTime(iso: string, locale: Locale = "en"): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);
  if (locale === "fr") {
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${diffDays} j`;
  }
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function fmt(locale: Locale, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale(locale), options);
}

export function formatEventDay(iso: string, locale: Locale = "en"): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.round(
    (new Date(date.toDateString()).getTime() - new Date(now.toDateString()).getTime()) /
      86400000
  );
  const words =
    locale === "fr"
      ? { 0: "Aujourd'hui", 1: "Demain", [-1]: "Hier" }
      : { 0: "Today", 1: "Tomorrow", [-1]: "Yesterday" };
  if (diffDays in words) return words[diffDays as 0 | 1 | -1];
  if (diffDays > 1 && diffDays < 7) {
    const day = fmt(locale, { weekday: "long" }).format(date);
    return locale === "fr" ? day.charAt(0).toUpperCase() + day.slice(1) : day;
  }
  return fmt(locale, { month: "short", day: "numeric" }).format(date);
}

export function formatEventTime(iso: string, locale: Locale = "en"): string {
  return fmt(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function formatFullDate(iso: string, locale: Locale = "en"): string {
  return fmt(locale, { weekday: "long", month: "long", day: "numeric" }).format(new Date(iso));
}

export function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

/** True when `iso` falls between now and `days` days from now. */
export function isWithinNextDays(iso: string, days: number): boolean {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return target >= now && target <= now + days * 24 * 60 * 60 * 1000;
}
