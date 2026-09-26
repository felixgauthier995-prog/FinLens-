export interface RawNewsArticle {
  externalId: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  publishedAt: string; // ISO 8601
  imageUrl?: string;
  /** Tickers the source already tagged, if any — often empty for general
   * market/political news, which is exactly why the AI analysis step
   * exists to infer relevance. */
  tickers: string[];
  rawData: unknown;
}

export interface NewsProvider {
  name: string;
  fetchLatest(limit: number): Promise<RawNewsArticle[]>;
}
