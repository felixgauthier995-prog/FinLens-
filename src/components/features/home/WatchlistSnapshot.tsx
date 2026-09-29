"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import type { NewsArticle } from "@/lib/types";
import type { UserPreferences } from "@/lib/personalization";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

interface TickerLatest {
  ticker: string;
  direction: "positive" | "negative" | null;
  headline: string | null;
  slug: string | null;
}

/** Latest story (and signal, if any) for each stock on the user's watchlist. */
function latestForTickers(tickers: string[], articles: NewsArticle[]): TickerLatest[] {
  return tickers.map((ticker) => {
    // articles are newest first
    const withSignal = articles.find((a) => a.signals?.some((s) => s.ticker === ticker));
    const article = withSignal ?? articles.find((a) => a.affectedAssets.includes(ticker));
    const signal = withSignal?.signals?.find((s) => s.ticker === ticker);
    return {
      ticker,
      direction: signal?.direction ?? null,
      headline: article?.title ?? null,
      slug: article?.slug ?? null,
    };
  });
}

export function WatchlistSnapshot({
  prefs,
  articles,
}: {
  prefs: UserPreferences;
  articles: NewsArticle[];
}) {
  const { m } = useI18n();
  if (prefs.tickers.length === 0) {
    return (
      <Link
        href="/watchlist"
        className="flex items-center gap-2 rounded-xl border border-dashed border-border-strong p-5 text-[13.5px] font-medium text-ink-600 hover:bg-surface"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        {m.home.addStocks}
      </Link>
    );
  }

  const rows = latestForTickers(prefs.tickers.slice(0, 8), articles);
  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {rows.map((row) => {
        const Icon = row.direction === "negative" ? ArrowDownRight : ArrowUpRight;
        const content = (
          <>
            <span className="font-data w-14 shrink-0 text-[13.5px] font-semibold text-ink-950">
              {row.ticker}
            </span>
            <span className="flex-1 truncate text-[12.5px] text-ink-600">
              {row.headline ?? m.home.noRecentNews}
            </span>
            {row.direction && (
              <Icon
                className={cn("h-4 w-4 shrink-0", row.direction === "positive" ? "text-positive" : "text-negative")}
                strokeWidth={2.25}
                aria-label={row.direction === "positive" ? m.signals.positive : m.signals.negative}
              />
            )}
          </>
        );
        return (
          <li key={row.ticker}>
            {row.slug ? (
              <Link href={`/news/${row.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                {content}
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
