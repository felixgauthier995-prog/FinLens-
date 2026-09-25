/** A financial calendar event, normalized to a common shape regardless of
 * which provider (FMP, and later others) it came from. */
export interface RawFinancialEvent {
  /** Stable, unique identifier from the source — used for dedup on write. */
  externalId: string;
  title: string;
  description: string;
  eventType: string;
  category: string;
  /** ISO 8601 datetime. */
  scheduledAt: string;
  tickers: string[];
  /** 1-10. */
  importance: number;
  sourceName: string;
  sourceUrl?: string;
  country?: string;
  rawData: unknown;
}

export interface FinancialEventProvider {
  name: string;
  fetchUpcomingEvents(daysAhead: number): Promise<RawFinancialEvent[]>;
}
