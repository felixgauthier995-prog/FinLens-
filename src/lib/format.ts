export function formatPrice(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSigned(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function formatEventDay(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.round(
    (new Date(date.toDateString()).getTime() - new Date(now.toDateString()).getTime()) /
      86400000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return dayFormatter.format(date);
  return dateFormatter.format(date);
}

export function formatEventTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function formatFullDate(iso: string): string {
  return fullDateFormatter.format(new Date(iso));
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
