/**
 * Core domain types for FinLens.
 *
 * These mirror the data model the product is designed around, independent
 * of whatever storage or API layer eventually backs it (see src/lib/data
 * for the mock implementation used in this build).
 */

export type AssetType = "equity" | "etf" | "index" | "crypto" | "commodity" | "currency";

export interface Asset {
  ticker: string;
  name: string;
  assetType: AssetType;
  sector?: string;
  price: number;
  changePercent: number;
  changeAbsolute: number;
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
