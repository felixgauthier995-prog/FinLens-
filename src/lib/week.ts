import type { MarketEvent, NewsArticle } from "@/lib/types";
import type { UserPreferences } from "@/lib/personalization";

export interface WeekDay {
  /** YYYY-MM-DD in UTC. */
  date: string;
  isToday: boolean;
  /** Events involving the user's stocks. */
  mine: MarketEvent[];
  /** Other notable market events, most important first. */
  market: MarketEvent[];
}

export interface WeekRecapSignal {
  ticker: string;
  direction: "positive" | "negative";
  slug: string;
  title: string;
}

const DAY = 24 * 3600 * 1000;

function utcDate(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * The next 7 days as cards. Days with nothing scheduled are dropped (except
 * today), and each day lists the user's stocks first, then up to
 * `marketPerDay` other events by importance.
 */
export function buildWeek(
  prefs: UserPreferences,
  events: MarketEvent[],
  now = Date.now(),
  marketPerDay = 5
): WeekDay[] {
  const mine = new Set(prefs.tickers);
  const today = utcDate(now);
  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = utcDate(now + i * DAY);
    const onDay = events.filter((e) => e.scheduledAt.slice(0, 10) === date);
    const own = onDay.filter((e) => e.affectedAssets.some((t) => mine.has(t)));
    const market = onDay
      .filter((e) => !own.includes(e))
      .sort((a, b) => b.impactScore.value - a.impactScore.value)
      .slice(0, marketPerDay);
    if (own.length || market.length || date === today) {
      days.push({ date, isToday: date === today, mine: own, market });
    }
  }
  return days;
}

/** Latest direct signal per followed stock over the past 7 days. */
export function weekRecap(prefs: UserPreferences, articles: NewsArticle[], now = Date.now()): WeekRecapSignal[] {
  const mine = new Set(prefs.tickers);
  const out: WeekRecapSignal[] = [];
  const seen = new Set<string>();
  const recent = articles
    .filter((a) => now - Date.parse(a.publishedAt) < 7 * DAY)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  for (const a of recent) {
    for (const s of a.signals ?? []) {
      if (s.linkLevel !== "direct" || !mine.has(s.ticker) || seen.has(s.ticker)) continue;
      seen.add(s.ticker);
      out.push({ ticker: s.ticker, direction: s.direction, slug: a.slug, title: a.title });
    }
  }
  return out;
}
