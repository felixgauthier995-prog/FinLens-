"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { MarketEvent, NewsArticle, WatchlistItem } from "@/lib/types";
import { getAsset } from "@/lib/data/assets";
import { latestArticleForAsset, nextEventForAsset, eventsAffectingWatchlist } from "@/lib/portfolio";
import { isWithinNextDays } from "@/lib/format";
import { WatchlistRow } from "@/components/features/watchlist/WatchlistRow";
import { AddAssetControl } from "@/components/features/watchlist/AddAssetControl";
import { EventRow } from "@/components/features/agenda/EventRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/Card";

export function WatchlistView({
  initialItems,
  focusTicker,
  articles,
  events,
}: {
  initialItems: WatchlistItem[];
  focusTicker?: string;
  articles: NewsArticle[];
  events: MarketEvent[];
}) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);

  useEffect(() => {
    if (!focusTicker) return;
    const el = document.getElementById(`asset-${focusTicker}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusTicker]);

  const tickers = items.map((i) => i.ticker);
  const thisWeekEvents = useMemo(
    () => events.filter((e) => isWithinNextDays(e.scheduledAt, 7)),
    [events]
  );
  const relevantEvents = useMemo(
    () => eventsAffectingWatchlist(tickers, thisWeekEvents),
    [tickers, thisWeekEvents]
  );

  function handleAdd(ticker: string) {
    setItems((prev) => [
      ...prev,
      { ticker, attentionLevel: "normal", addedAt: new Date().toISOString() },
    ]);
  }

  function handleRemove(ticker: string) {
    setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">
            Watchlist
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-400">
            Track the companies, funds, and assets you care about.
          </p>
        </div>
        <AddAssetControl excludeTickers={tickers} onAdd={handleAdd} />
      </div>

      {relevantEvents.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-surface/60 p-5">
          <SectionHeading
            eyebrow="Personalized"
            title="What matters for your portfolio"
            className="mb-3"
          />
          <p className="mb-4 text-[13.5px] text-ink-600">
            <span className="font-semibold text-ink-950">{relevantEvents.length}</span> event
            {relevantEvents.length > 1 ? "s" : ""} may affect your watchlist this week.
          </p>
          <div className="space-y-3">
            {relevantEvents.slice(0, 3).map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" strokeWidth={2} />}
          title="Your watchlist is empty"
          description="Add a stock, ETF, index, or crypto asset to start tracking what matters to you."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const asset = getAsset(item.ticker);
            if (!asset) return null;
            return (
              <WatchlistRow
                key={item.ticker}
                asset={asset}
                attentionLevel={item.attentionLevel}
                latestArticle={latestArticleForAsset(item.ticker, articles)}
                nextEvent={nextEventForAsset(item.ticker, events)}
                focused={focusTicker === item.ticker}
                onRemove={() => handleRemove(item.ticker)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
