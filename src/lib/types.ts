/**
 * Core domain types for FinLens.
 *
 * These mirror the data model the product is designed around, independent
 * of whatever storage or API layer eventually backs it (see src/lib/data
 * for the mock implementation used in this build).
 */

export type AssetType = "equity" | "etf" | "index" | "crypto" | "commodity" | "currency";

export const COMPANY_EVENT_TYPES = [
  "product-launch",
  "contract",
  "partnership",
  "acquisition",
  "earnings-guidance",
  "regulatory",
  "other",
] as const;
export type CompanyEventType = (typeof COMPANY_EVENT_TYPES)[number];

export interface Asset {
  ticker: string;
  name: string;
  assetType: AssetType;
  sector?: string;
  price: number | null;
  priceUpdatedAt?: string;
  dataStatus?: "demo" | "stored" | "unavailable";
  changePercent: number | null;
  changeAbsolute: number | null;
  currency: string;
}

export type Category =
  | "tech"
  | "macro"
  | "energy"
  | "crypto"
  | "earnings"
  | "policy"
  | "geopolitics"
  | "ai"
  | "healthcare"
  | "financials";

export type ImpactLevel = "low" | "moderate" | "high" | "major";

export interface ImpactScore {
  /** 1–10 scale. */
  value: number;
  level: ImpactLevel;
}

export type ImpactDirection = "positive" | "negative" | "mixed" | "neutral";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: Category;
  publishedAt: string; // ISO 8601
  source: string;
  sourceUrl: string;
  additionalSources?: { name: string; url: string }[];
  impactScore: ImpactScore;
  impactDirection: ImpactDirection;
  affectedAssets: string[]; // tickers, resolved against ASSETS
  whatHappened: string;
  whyItMatters: string;
  marketImpact: string;
  whatToWatch: string[];
  relatedEventSlug?: string;
  /** Set when AI analysis flagged this as a major company-specific event
   * (product launch, contract, partnership, M&A, earnings, regulatory). */
  companyEventType?: CompanyEventType;
  /** Stock price movement since this article was published, compared to a
   * reference index — a timing correlation, never a claimed cause. Absent
   * when no snapshot was captured (never fabricated). */
  priceReaction?: PriceReaction[];
  /** Per-company catalyst signals. Absent for editorial/demo articles. */
  signals?: ArticleSignal[];
}

export type SignalDirection = "positive" | "negative";
export type SignalConfidence = "high" | "medium" | "low";
export type SignalHorizon = "short" | "long";
/** direct = company named in the article; chain = second-order effect. */
export type SignalLinkLevel = "direct" | "chain";

/** The AI's assessment that a story is good or bad news for one company.
 * An assessment of the news, never a price prediction. */
export interface ArticleSignal {
  ticker: string;
  direction: SignalDirection;
  confidence: SignalConfidence;
  horizon: SignalHorizon;
  linkLevel: SignalLinkLevel;
  rationale: string;
  /** Sentence from the source article that supports the signal. */
  evidenceQuote: string;
  verified: boolean;
  createdAt: string;
}

/** How past signals compared with the stock's move vs the index. */
export interface SignalTrackRecord {
  window: "1d" | "1w" | "1m";
  /** Signals with a baseline and a follow-up price for this window. */
  measured: number;
  /** Signals whose direction matched the move relative to the index. */
  matched: number;
}

export interface PriceReaction {
  ticker: string;
  indexTicker: string;
  /** Null when the current quote for this ticker isn't available. */
  changeSincePercent: number | null;
  indexChangeSincePercent: number | null;
  capturedAt: string;
  currentDataStatus: Asset["dataStatus"];
}

export type EventType =
  | "rate-decision"
  | "economic-data"
  | "earnings"
  | "press-conference"
  | "investor-day"
  | "product-launch"
  | "opec-meeting"
  | "government"
  | "regulatory"
  | "geopolitical";

export type EventStatus = "upcoming" | "in-progress" | "completed";

export interface PossibleScenario {
  label: string;
  direction: ImpactDirection;
  description: string;
}

export interface MarketEvent {
  id: string;
  slug: string;
  title: string;
  eventType: EventType;
  category: Category;
  scheduledAt: string; // ISO 8601
  timeConfirmed?: boolean;
  description: string;
  impactScore: ImpactScore;
  affectedAssets: string[];
  expectations: string;
  whyItMatters: string;
  possibleScenarios: PossibleScenario[];
  previousRelatedEventSlug?: string;
  relatedArticleSlug?: string; // populated once the event has passed
  status: EventStatus;
}

export interface Alert {
  id: string;
  eventSlug: string;
  alertTime: "at-event" | "15-min-before" | "1-hour-before" | "morning-of";
  status: "active" | "triggered" | "cancelled";
}

export interface WatchlistItem {
  ticker: string;
  attentionLevel: "normal" | "elevated" | "high";
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
