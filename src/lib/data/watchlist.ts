import type { WatchlistItem } from "@/lib/types";
import { daysAgo } from "@/lib/data/dates";

/**
 * Mock watchlist for the single demo user. A real build would key this by
 * userId and persist it via the Watchlist table described in the product
 * spec (userId, assetId).
 */
export const WATCHLIST: WatchlistItem[] = [
  { ticker: "AAPL", attentionLevel: "normal", addedAt: daysAgo(48) },
  { ticker: "NVDA", attentionLevel: "high", addedAt: daysAgo(48) },
  { ticker: "TSLA", attentionLevel: "elevated", addedAt: daysAgo(30) },
  { ticker: "SPY", attentionLevel: "normal", addedAt: daysAgo(48) },
  { ticker: "BTC", attentionLevel: "elevated", addedAt: daysAgo(12) },
];

export function getWatchlistTickers(): string[] {
  return WATCHLIST.map((w) => w.ticker);
}
