"use client";

import Link from "next/link";
import { X, Newspaper, CalendarClock } from "lucide-react";
import type { Asset, MarketEvent, NewsArticle, WatchlistItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PriceChange } from "@/components/ui/PriceChange";
import { AttentionBadge } from "@/components/features/watchlist/AttentionBadge";
import { formatPrice, formatEventDay } from "@/lib/format";

export function WatchlistRow({
  asset,
  attentionLevel,
  latestArticle,
  nextEvent,
  focused,
  onRemove,
}: {
  asset: Asset;
  attentionLevel: WatchlistItem["attentionLevel"];
  latestArticle?: NewsArticle;
  nextEvent?: MarketEvent;
  focused?: boolean;
  onRemove: () => void;
}) {
  return (
    <Card
      id={`asset-${asset.ticker}`}
      className={
        focused
          ? "border-accent bg-accent-soft/40 p-4 sm:p-5 scroll-mt-20"
          : "p-4 sm:p-5 scroll-mt-20"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-data text-[15px] font-semibold text-ink-950">{asset.ticker}</p>
            <AttentionBadge level={attentionLevel} />
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-400">{asset.name}</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end">
            <p className="font-data text-[15px] font-medium text-ink-950">
              {formatPrice(asset.price)}
            </p>
            <PriceChange changePercent={asset.changePercent} size="sm" />
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${asset.ticker} from watchlist`}
            className="rounded-md p-1 text-ink-300 transition-colors hover:bg-surface hover:text-ink-600"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-2">
        {latestArticle ? (
          <Link
            href={`/news/${latestArticle.slug}`}
            className="flex items-start gap-2 rounded-md p-1.5 -m-1.5 text-[12.5px] text-ink-600 transition-colors hover:bg-surface"
          >
            <Newspaper className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
            <span className="line-clamp-2">{latestArticle.title}</span>
          </Link>
        ) : (
          <p className="flex items-center gap-2 p-1.5 text-[12.5px] text-ink-300">
            <Newspaper className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            No recent news
          </p>
        )}

        {nextEvent ? (
          <Link
            href={`/agenda/${nextEvent.slug}`}
            className="flex items-start gap-2 rounded-md p-1.5 -m-1.5 text-[12.5px] text-ink-600 transition-colors hover:bg-surface"
          >
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
            <span className="line-clamp-2">
              {nextEvent.title} — {formatEventDay(nextEvent.scheduledAt)}
            </span>
          </Link>
        ) : (
          <p className="flex items-center gap-2 p-1.5 text-[12.5px] text-ink-300">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            No upcoming events
          </p>
        )}
      </div>
    </Card>
  );
}
