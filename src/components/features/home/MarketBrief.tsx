import { getAsset } from "@/lib/data/assets";
import { PriceChange } from "@/components/ui/PriceChange";

export async function MarketBrief() {
  const [spx, nasdaq, dollar] = await Promise.all([
    getAsset("SPX"),
    getAsset("IXIC"),
    getAsset("DXY"),
  ]);
  if (!spx || !nasdaq || !dollar) return null;

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Market Brief
        </p>
        <span className="text-[11px] text-ink-400">Updated a few minutes ago</span>
      </div>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-800">
        The S&P 500 is{" "}
        <span className="font-data font-medium text-ink-950">
          {spx.changePercent >= 0 ? "up" : "down"} {Math.abs(spx.changePercent).toFixed(2)}%
        </span>{" "}
        today after the Federal Reserve held interest rates steady and struck a more cautious tone
        on future cuts than markets had priced in. Technology shares are outperforming, with the
        Nasdaq <PriceChange changePercent={nasdaq.changePercent} size="sm" className="mx-0.5" />{" "}
        on the back of a strong earnings report from NVIDIA. The dollar is firmer as rate-cut
        expectations get pushed out, a mixed signal for gold and other dollar-denominated
        commodities. All eyes now turn to tomorrow&rsquo;s U.S. retail sales report and Friday&rsquo;s
        employment data for the next read on the economy.
      </p>
      <p className="mt-2 text-[11px] text-ink-400">
        Dollar Index: <span className="font-data text-ink-600">{dollar.price.toFixed(2)}</span>
      </p>
    </div>
  );
}
