import type { Category, NewsArticle, ArticleSignal } from "@/lib/types";
import type { Sector } from "@/lib/onboarding/options";

export interface UserPreferences {
  experience: "beginner" | "intermediate" | "advanced" | null;
  risk: "cautious" | "balanced" | "aggressive" | null;
  sectors: string[];
  /** Tickers on the user's watchlist. */
  tickers: string[];
}

export const NO_PREFERENCES: UserPreferences = {
  experience: null,
  risk: null,
  sectors: [],
  tickers: [],
};

/** Questionnaire sectors → news categories. */
const SECTOR_CATEGORIES: Record<Sector, Category[]> = {
  tech: ["tech"],
  ai: ["ai", "tech"],
  energy: ["energy"],
  financials: ["financials"],
  consumer: ["earnings"],
  media: ["tech"],
  industrials: ["geopolitics", "policy"],
  crypto: ["crypto"],
  healthcare: ["healthcare"],
  broad: ["macro", "policy"],
};

export function categoriesForSectors(sectors: string[]): Set<Category> {
  const out = new Set<Category>();
  for (const s of sectors) for (const c of SECTOR_CATEGORIES[s as Sector] ?? []) out.add(c);
  return out;
}

/**
 * Indirect ("chain") signals are low-confidence leads. Show them only to
 * people who said they're experienced or comfortable with risk.
 */
export function showsIndirectSignals(prefs: UserPreferences): boolean {
  return prefs.experience === "advanced" || prefs.risk === "aggressive";
}

/** Signals this user should see, most relevant first: their own stocks
 * first, and for cautious users, negative signals (risks) before positives. */
export function signalsForUser(signals: ArticleSignal[], prefs: UserPreferences): ArticleSignal[] {
  const mine = new Set(prefs.tickers);
  return signals
    .filter((s) => s.linkLevel === "direct" || showsIndirectSignals(prefs))
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      const own = Number(mine.has(b.s.ticker)) - Number(mine.has(a.s.ticker));
      if (own) return own;
      if (prefs.risk === "cautious") {
        const neg = Number(b.s.direction === "negative") - Number(a.s.direction === "negative");
        if (neg) return neg;
      }
      return a.i - b.i;
    })
    .map(({ s }) => s);
}

export type RelevanceReason =
  | { kind: "stock"; ticker: string }
  | { kind: "sector"; category: Category }
  | null;

/** Why an article is relevant to this user (shown as a small label). */
export function relevanceReason(article: NewsArticle, prefs: UserPreferences): RelevanceReason {
  const mine = new Set(prefs.tickers);
  const signalTicker = signalsForUser(article.signals ?? [], prefs).find((s) => mine.has(s.ticker))?.ticker;
  const ticker = signalTicker ?? article.affectedAssets.find((t) => mine.has(t));
  if (ticker) return { kind: "stock", ticker };
  if (categoriesForSectors(prefs.sectors).has(article.category))
    return { kind: "sector", category: article.category };
  return null;
}

/**
 * Personal ranking: the user's stocks count most, then their sectors, then
 * market-wide importance, with older stories fading over ~2 days.
 */
export function relevanceScore(article: NewsArticle, prefs: UserPreferences, now = Date.now()): number {
  const mine = new Set(prefs.tickers);
  let score = article.impactScore.value; // 1–10
  if (signalsForUser(article.signals ?? [], prefs).some((s) => mine.has(s.ticker))) score += 12;
  else if (article.affectedAssets.some((t) => mine.has(t))) score += 8;
  if (categoriesForSectors(prefs.sectors).has(article.category)) score += 4;
  const published = Date.parse(article.publishedAt);
  if (!Number.isFinite(published) || published > now + 300000) return 0;
  const ageHours = Math.max(0, (now - published) / 3600000);
  return score * Math.pow(0.5, ageHours / 48);
}

export function rankForUser(articles: NewsArticle[], prefs: UserPreferences, now = Date.now()): NewsArticle[] {
  return articles
    .map((a) => ({ a, score: relevanceScore(a, prefs, now) }))
    .sort((x, y) => y.score - x.score)
    .map(({ a }) => a);
}
