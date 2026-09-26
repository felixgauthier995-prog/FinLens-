import type { NewsProvider, RawNewsArticle } from "@/lib/providers/news/types";

interface FinnhubNewsItem {
  category: string;
  datetime: number; // unix seconds
  headline: string;
  id: number;
  image: string;
  related: string; // comma-separated tickers, often empty
  source: string;
  summary: string;
  url: string;
}

function isValidItem(item: FinnhubNewsItem): boolean {
  return (
    typeof item.headline === "string" &&
    typeof item.summary === "string" &&
    Number.isFinite(item.datetime) &&
    /^https?:\/\//.test(item.url)
  );
}

function mapItem(item: FinnhubNewsItem): RawNewsArticle {
  return {
    externalId: `finnhub-${item.id}`,
    title: item.headline,
    summary: item.summary,
    url: item.url,
    sourceName: item.source,
    publishedAt: new Date(item.datetime * 1000).toISOString(),
    imageUrl: item.image || undefined,
    tickers: item.related
      ? item.related.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    rawData: item,
  };
}

export function createFinnhubNewsProvider(apiKey: string): NewsProvider {
  return {
    name: "finnhub",
    async fetchLatest(limit: number): Promise<RawNewsArticle[]> {
      const res = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`,
        { cache: "no-store", signal: AbortSignal.timeout(12000) }
      );
      if (!res.ok) {
        throw new Error(`Finnhub news request failed: ${res.status} ${res.statusText}`);
      }
      const items = (await res.json()) as FinnhubNewsItem[];
      if (!Array.isArray(items)) {
        throw new Error(`Finnhub news error: ${JSON.stringify(items)}`);
      }

      return items.filter(isValidItem).slice(0, limit).map(mapItem);
    },
  };
}

/**
 * Per-company news — used for major-event detection (product launches,
 * contracts, M&A, earnings, regulatory decisions) as opposed to the
 * general market feed above. Same normalization/externalId scheme, so an
 * article seen through both channels dedupes naturally on write.
 */
export async function fetchCompanyNews(
  ticker: string,
  fromDate: string, // YYYY-MM-DD
  toDate: string, // YYYY-MM-DD
  apiKey: string
): Promise<RawNewsArticle[]> {
  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${fromDate}&to=${toDate}&token=${apiKey}`,
    { cache: "no-store", signal: AbortSignal.timeout(12000) }
  );
  if (!res.ok) {
    throw new Error(`Finnhub company-news request failed for ${ticker}: ${res.status}`);
  }
  const items = (await res.json()) as FinnhubNewsItem[];
  if (!Array.isArray(items)) {
    throw new Error(`Finnhub company-news error for ${ticker}: ${JSON.stringify(items)}`);
  }
  // Company-news items don't reliably fill "related", so tag the queried
  // ticker directly — this is the one we know for certain is relevant.
  return items.filter(isValidItem).map((item) => {
    const mapped = mapItem(item);
    return { ...mapped, tickers: mapped.tickers.includes(ticker) ? mapped.tickers : [...mapped.tickers, ticker] };
  });
}
