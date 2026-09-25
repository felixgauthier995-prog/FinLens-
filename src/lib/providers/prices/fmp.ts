export interface RawQuote {
  ticker: string;
  price: number;
  changePercent: number;
  changeAbsolute: number;
}

/**
 * Maps FinLens's internal tickers to the symbol FMP expects. Most are
 * identical; indices/crypto/commodities need FMP-specific symbols.
 * OIL and DXY are omitted — FMP's free tier doesn't include them (returns
 * a "Premium" error), so those two keep their static fallback price.
 */
const FMP_SYMBOL: Record<string, string> = {
  SPX: "^GSPC",
  IXIC: "^IXIC",
  DJI: "^DJI",
  BTC: "BTCUSD",
  ETH: "ETHUSD",
  GOLD: "GCUSD",
};

function toFmpSymbol(ticker: string): string {
  return FMP_SYMBOL[ticker] ?? ticker;
}

interface FmpQuoteRow {
  symbol: string;
  price: number;
  changePercentage: number;
  change: number;
}

/**
 * FMP's free tier doesn't support comma-separated batch quotes (premium
 * only), so we fetch one symbol at a time in parallel. A failure on one
 * ticker doesn't affect the others.
 */
export async function fetchQuotes(tickers: string[], apiKey: string): Promise<RawQuote[]> {
  const results = await Promise.all(
    tickers.map(async (ticker): Promise<RawQuote | null> => {
      try {
        const symbol = encodeURIComponent(toFmpSymbol(ticker));
        const res = await fetch(
          `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${apiKey}`,
          { cache: "no-store" }
        );
        if (!res.ok) return null;
        const rows = (await res.json()) as FmpQuoteRow[] | { [key: string]: unknown };
        if (!Array.isArray(rows) || rows.length === 0) return null;
        const row = rows[0];
        return {
          ticker,
          price: row.price,
          changePercent: row.changePercentage,
          changeAbsolute: row.change,
        };
      } catch (err) {
        console.error(`[prices] fetch failed for ${ticker}:`, err);
        return null;
      }
    })
  );
  return results.filter((r): r is RawQuote => r !== null);
}
