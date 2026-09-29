import type { Locale } from "@/i18n/config";
import type { NewsArticle } from "@/lib/types";

/**
 * Shows an article in the reader's language: the AI's French version when
 * available (title, analysis, plain explanation, signal reasons). The
 * source summary and quoted evidence always stay in the original language.
 */
export function localizeArticle(article: NewsArticle, locale: Locale): NewsArticle {
  if (locale !== "fr" || !article.fr) return article;
  const f = article.fr;
  return {
    ...article,
    title: f.title || article.title,
    summary: f.whatHappened || article.summary,
    whatHappened: f.whatHappened || article.whatHappened,
    whyItMatters: f.whyItMatters || article.whyItMatters,
    marketImpact: f.marketImpact || article.marketImpact,
    whatToWatch: f.whatToWatch.length ? f.whatToWatch : article.whatToWatch,
    plainExplanation: f.plainExplanation || article.plainExplanation,
    signals: article.signals?.map((s) => (s.rationaleFr ? { ...s, rationale: s.rationaleFr } : s)),
    translated: true,
  };
}
