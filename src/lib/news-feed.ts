import type { NewsArticle } from "./types";
import { signalsForUser, type UserPreferences } from "./personalization";

export interface NewsFilters {
  q: string;
  scope: "all" | "companies" | "watchlist";
  period: "all" | "24h" | "7d";
}
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Filter existing coverage only: no inferred tickers or fabricated catalysts. */
export function filterNews(articles: NewsArticle[], filters: NewsFilters, prefs: UserPreferences, now = Date.now()): NewsArticle[] {
  const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
  const mine = new Set(prefs.tickers.map(t => t.toUpperCase()));
  const maxAge = filters.period === "24h" ? 86400000 : filters.period === "7d" ? 604800000 : Infinity;
  return articles.filter(article => {
    const signals = signalsForUser(article.signals ?? [], prefs);
    const published = Date.parse(article.publishedAt);
    if (filters.period !== "all" && (!Number.isFinite(published) || published > now + 300000 || now - published > maxAge)) return false;
    if (filters.scope === "companies" && !(article.companyEventType && article.companyEventType !== "other") && !signals.some(s => s.linkLevel === "direct")) return false;
    if (filters.scope === "watchlist" && ![...article.affectedAssets, ...signals.map(s => s.ticker)].some(t => mine.has(t.toUpperCase()))) return false;
    const haystack = normalize([article.title, article.summary, article.source, ...article.affectedAssets, ...signals.map(s => s.ticker)].join(" "));
    return terms.every(term => haystack.includes(term));
  });
}
