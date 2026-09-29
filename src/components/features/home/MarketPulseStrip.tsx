import { getAssets, MARKET_PULSE_TICKERS } from "@/lib/data/assets";
import { PriceChange } from "@/components/ui/PriceChange";
import { formatPrice } from "@/lib/format";
import { getMessages, getLocale } from "@/i18n/server";


export async function MarketPulseStrip() {
  const [assets, m, locale] = await Promise.all([getAssets(MARKET_PULSE_TICKERS), getMessages(), getLocale()]);
  const names: Record<string, string> = m.pulse;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
      {assets.map((asset) => (
        <div key={asset.ticker} className="bg-background p-3.5">
          <p className="text-[11.5px] font-medium text-ink-400">
            {names[asset.ticker] ?? asset.name}
          </p>
          <p className="font-data mt-1 text-[15px] font-semibold text-ink-950">
            {formatPrice(asset.price, "USD", locale)}<span className="block text-[10px] font-normal text-ink-400">{asset.dataStatus === "demo" ? m.news.demoQuote : asset.priceUpdatedAt ? m.news.storedQuote(asset.priceUpdatedAt) : m.news.noQuote}</span>
          </p>
          <PriceChange changePercent={asset.changePercent} size="sm" className="mt-0.5" />
        </div>
      ))}
    </div>
  );
}
