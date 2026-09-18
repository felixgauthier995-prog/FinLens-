import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getWatchlistTickers } from "@/lib/data/watchlist";
import { getAssets } from "@/lib/data/assets";
import { getThisWeekEvents } from "@/lib/data/events";
import { PriceChange } from "@/components/ui/PriceChange";
import { formatPrice } from "@/lib/format";

export async function WatchlistSnapshot() {
  const tickers = getWatchlistTickers();
  const assets = getAssets(tickers);
  const thisWeekEvents = await getThisWeekEvents();
  const relevantEvents = thisWeekEvents.filter((e) =>
    e.affectedAssets.some((a) => tickers.includes(a))
  );

  return (
    <div className="rounded-xl border border-border">
      <div className="divide-y divide-border">
        {assets.map((asset) => (
          <Link
            key={asset.ticker}
            href={`/watchlist?focus=${asset.ticker}`}
            className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface sm:px-5"
          >
            <div className="min-w-0">
              <p className="font-data text-[13.5px] font-semibold text-ink-950">
                {asset.ticker}
              </p>
              <p className="truncate text-[12px] text-ink-400">{asset.name}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <p className="font-data text-[13.5px] font-medium text-ink-950">
                {formatPrice(asset.price)}
              </p>
              <PriceChange changePercent={asset.changePercent} size="sm" />
            </div>
          </Link>
        ))}
      </div>

      {relevantEvents.length > 0 && (
        <Link
          href="/watchlist"
          className="flex items-center justify-between gap-3 border-t border-border bg-accent-soft px-4 py-3 text-[12.5px] font-medium text-accent-ink sm:px-5"
        >
          <span>
            {relevantEvents.length} event{relevantEvents.length > 1 ? "s" : ""} may affect your
            watchlist this week.
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
