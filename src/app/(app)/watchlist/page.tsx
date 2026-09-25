import type { Metadata } from "next";
import { WATCHLIST, getWatchlistTickers } from "@/lib/data/watchlist";
import { getArticlesSorted } from "@/lib/data/news";
import { getEventsSorted } from "@/lib/data/events";
import { getAssets } from "@/lib/data/assets";
import { WatchlistView } from "@/components/features/watchlist/WatchlistView";

export const metadata: Metadata = {
  title: "Watchlist — FinLens",
};

export default async function WatchlistPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const params = await searchParams;
  const [articles, events, assets] = await Promise.all([
    getArticlesSorted(),
    getEventsSorted(),
    getAssets(getWatchlistTickers()),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <WatchlistView
        initialItems={WATCHLIST}
        focusTicker={params.focus}
        articles={articles}
        events={events}
        assets={assets}
      />
    </div>
  );
}
