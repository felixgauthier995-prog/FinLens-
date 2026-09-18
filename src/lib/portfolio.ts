import type { AskSource } from "@/lib/data/ask";
import type { MarketEvent, NewsArticle } from "@/lib/types";

/**
 * Pure helpers over already-fetched data. Kept synchronous (no data
 * fetching inside) so they can run during a Client Component's render —
 * the Server Component that owns the page fetches articles/events once
 * and passes them down as props.
 */

export function latestArticleForAsset(
  ticker: string,
  articlesSorted: NewsArticle[]
): NewsArticle | undefined {
  return articlesSorted.find((a) => a.affectedAssets.includes(ticker));
}

export function nextEventForAsset(
  ticker: string,
  eventsSorted: MarketEvent[]
): MarketEvent | undefined {
  return eventsSorted.find((e) => e.status === "upcoming" && e.affectedAssets.includes(ticker));
}

/** Events in the next 7 days that touch any of the given tickers. */
export function eventsAffectingWatchlist(
  tickers: string[],
  thisWeekEvents: MarketEvent[]
): MarketEvent[] {
  return thisWeekEvents.filter((e) => e.affectedAssets.some((a) => tickers.includes(a)));
}

/** Powers the "what matters for my watchlist" Ask FinLens answer. */
export function answerForWatchlistToday(
  tickers: string[],
  thisWeekEvents: MarketEvent[],
  articlesSorted: NewsArticle[]
): {
  short: string;
  detail: string;
  sources: AskSource[];
} {
  const events = eventsAffectingWatchlist(tickers, thisWeekEvents);
  const recentArticles = articlesSorted
    .filter((a) => tickers.some((t) => a.affectedAssets.includes(t)))
    .sort((a, b) => b.impactScore.value - a.impactScore.value)
    .slice(0, 2);

  const short =
    events.length > 0
      ? `${events.length} event${events.length > 1 ? "s" : ""} on the calendar this week could affect names on your watchlist, and ${
          recentArticles.length
        } recent ${recentArticles.length === 1 ? "story looks" : "stories look"} relevant.`
      : "Nothing urgent is scheduled for your watchlist this week, but here's the most relevant recent news.";

  const detail = [
    events.length > 0
      ? `Upcoming: ${events.map((e) => e.title).join(", ")}.`
      : "No high-impact scheduled events touch your current watchlist in the next 7 days.",
    recentArticles.length > 0
      ? `Recent news: ${recentArticles.map((a) => a.title).join(" — ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sources: AskSource[] = [
    ...events.map((e) => ({ label: e.title, href: `/agenda/${e.slug}` })),
    ...recentArticles.map((a) => ({ label: a.title, href: `/news/${a.slug}` })),
  ];

  return { short, detail, sources };
}
