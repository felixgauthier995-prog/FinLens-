import "server-only";
import { getArticlesSorted, getArticle } from "@/lib/data/news";
import { getLocale } from "@/i18n/server";
import { localizeArticle } from "@/i18n/content";
import type { NewsArticle } from "@/lib/types";

/** Articles in the reader's language (French AI version when available). */
export async function getArticlesForReader(): Promise<NewsArticle[]> {
  const [articles, locale] = await Promise.all([getArticlesSorted(), getLocale()]);
  return articles.map((a) => localizeArticle(a, locale));
}

export async function getArticleForReader(slug: string): Promise<NewsArticle | undefined> {
  const [article, locale] = await Promise.all([getArticle(slug), getLocale()]);
  return article ? localizeArticle(article, locale) : undefined;
}
