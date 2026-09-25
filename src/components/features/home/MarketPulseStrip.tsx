import { getAssets, MARKET_PULSE_TICKERS } from "@/lib/data/assets";
import { PriceChange } from "@/components/ui/PriceChange";
import { formatPrice } from "@/lib/format";

const DISPLAY_NAME: Record<string, string> = {
  SPX: "S&P 500",
  IXIC: "Nasdaq",
  DJI: "Dow",
  BTC: "Bitcoin",
  OIL: "Oil (WTI)",
  GOLD: "Gold",
};

export async function MarketPulseStrip() {
  const assets = await getAssets(MARKET_PULSE_TICKERS);

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
      {assets.map((asset) => (
        <div key={asset.ticker} className="bg-background p-3.5">
          <p className="text-[11.5px] font-medium text-ink-400">
            {DISPLAY_NAME[asset.ticker] ?? asset.name}
          </p>
          <p className="font-data mt-1 text-[15px] font-semibold text-ink-950">
            {formatPrice(asset.price)}
          </p>
          <PriceChange changePercent={asset.changePercent} size="sm" className="mt-0.5" />
        </div>
      ))}
    </div>
  );
}
