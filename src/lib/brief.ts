import type { MarketEvent, NewsArticle } from "@/lib/types";
import { rankForUser, type UserPreferences } from "@/lib/personalization";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

export interface BriefSignal {
  ticker: string;
  direction: "positive" | "negative";
  slug: string;
  title: string;
}

export interface Brief {
  /** Latest signal per followed stock in the last 24 hours. */
  signals: BriefSignal[];
  /** Events in the next 24 hours for followed stocks (or big market events). */
  events: MarketEvent[];
  topStory: NewsArticle | null;
  pushTitle: string;
  pushBody: string;
}

const DAY = 24 * 3600 * 1000;

export function buildBrief(
  prefs: UserPreferences,
  articles: NewsArticle[],
  events: MarketEvent[],
  now = Date.now(),
  locale: Locale = "en"
): Brief {
  const t = messages[locale].push;
  const mine = new Set(prefs.tickers);
  const recent = articles.filter((a) => now - Date.parse(a.publishedAt) < DAY);

  const signals: BriefSignal[] = [];
  const seen = new Set<string>();
  for (const a of [...recent].sort((x, y) => Date.parse(y.publishedAt) - Date.parse(x.publishedAt))) {
    for (const s of a.signals ?? []) {
      if (!mine.has(s.ticker) || seen.has(s.ticker) || s.linkLevel !== "direct") continue;
      seen.add(s.ticker);
      signals.push({ ticker: s.ticker, direction: s.direction, slug: a.slug, title: a.title });
    }
  }

  const upcoming = events.filter((e) => {
    const t = Date.parse(e.scheduledAt);
    return t >= now - 2 * 3600 * 1000 && t < now + DAY;
  });
  const myEvents = upcoming.filter((e) => e.affectedAssets.some((t) => mine.has(t)));
  const bigEvents = upcoming.filter((e) => e.impactScore.value >= 8 && !myEvents.includes(e));
  const eventsOut = [...myEvents, ...bigEvents].slice(0, 4);

  const topStory = rankForUser(recent, prefs, now)[0] ?? null;

  const parts: string[] = [];
  if (signals.length) parts.push(signals.map((s) => `${s.ticker} ${s.direction === "positive" ? "↑" : "↓"}`).join(" · "));
  if (myEvents.length) parts.push(`${t.todayPrefix} ${myEvents.slice(0, 2).map((e) => e.title).join(", ")}`);
  if (!parts.length && topStory) parts.push(topStory.title);

  const pushTitle = signals.length ? t.morningSignals(signals.length) : t.morningDefault;
  const pushBody = (parts.join(" — ") || t.quiet).slice(0, 180);

  return { signals, events: eventsOut, topStory, pushTitle, pushBody };
}

/** Local hour, weekday (0 = Sunday) and date (YYYY-MM-DD) in a time zone. */
export function localTime(timeZone: string, now = new Date()): { hour: number; weekday: number; date: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { hour: Number(get("hour")), weekday, date: `${get("year")}-${get("month")}-${get("day")}` };
}
