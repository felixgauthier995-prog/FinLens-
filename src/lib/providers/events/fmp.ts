import type { FinancialEventProvider, RawFinancialEvent } from "@/lib/providers/events/types";

interface FmpEarningRow {
  symbol: string;
  date: string; // "YYYY-MM-DD"
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
  lastUpdated: string;
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString("en-US")}`;
}

function describeEarnings(row: FmpEarningRow): string {
  const parts: string[] = [];
  if (row.epsEstimated != null) parts.push(`EPS estimate of $${row.epsEstimated.toFixed(2)}`);
  if (row.revenueEstimated != null) {
    parts.push(`revenue estimate of ${formatRevenue(row.revenueEstimated)}`);
  }
  if (parts.length === 0) {
    return `${row.symbol} is scheduled to report quarterly earnings.`;
  }
  return `${row.symbol} is scheduled to report quarterly earnings, with a ${parts.join(" and a ")}.`;
}

/**
 * Financial Modeling Prep — earnings calendar only on the free tier
 * (their economic calendar endpoint requires a paid plan). Docs:
 * https://site.financialmodelingprep.com/developer/docs
 */
export function createFmpEventProvider(apiKey: string): FinancialEventProvider {
  return {
    name: "fmp",
    async fetchUpcomingEvents(daysAhead: number): Promise<RawFinancialEvent[]> {
      const from = new Date();
      const to = new Date(from.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);

      const url = `https://financialmodelingprep.com/stable/earnings-calendar?from=${fmt(from)}&to=${fmt(to)}&apikey=${apiKey}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`FMP earnings-calendar request failed: ${res.status} ${res.statusText}`);
      }
      const rows = (await res.json()) as FmpEarningRow[] | { "Error Message": string };
      if (!Array.isArray(rows)) {
        throw new Error(`FMP earnings-calendar error: ${JSON.stringify(rows)}`);
      }

      return rows.map((row) => ({
        externalId: `fmp-earnings-${row.symbol}-${row.date}`,
        title: `${row.symbol} Earnings Call`,
        description: describeEarnings(row),
        eventType: "earnings",
        category: "earnings",
        // FMP's free earnings-calendar doesn't include a time of day, so we
        // anchor to market open local time as a reasonable default.
        scheduledAt: new Date(`${row.date}T13:30:00.000Z`).toISOString(),
        tickers: [row.symbol],
        importance: 6,
        sourceName: "Financial Modeling Prep",
        country: "US",
        rawData: row,
      }));
    },
  };
}
