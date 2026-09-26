import { sanityClient } from "@/sanity/client";
import { makeImpact } from "@/lib/impact";
import type { NewsArticle, MarketEvent } from "@/lib/types";
export async function editorialArticles(): Promise<NewsArticle[]> {
  if (!sanityClient) return [];
  try {
    const rows = await sanityClient.fetch(
      `*[_type == "newsArticle" && isDemo != true]{..., "id": _id, "slug": slug.current}`,
      {},
      { cache: "no-store", timeout: 10000 },
    );
    return rows
      .filter(
        (r: NewsArticle) =>
          r.slug &&
          r.title &&
          r.sourceUrl &&
          !r.sourceUrl.includes("example.com") &&
          Number.isFinite(Date.parse(r.publishedAt)),
      )
      .map((r: NewsArticle & { impactScoreValue: number }) => ({
        ...r,
        id: `sanity:${r.id}`,
        impactScore: makeImpact(r.impactScoreValue),
        affectedAssets: r.affectedAssets ?? [],
        whatToWatch: r.whatToWatch ?? [],
        impactDirection: r.impactDirection ?? "neutral",
      }));
  } catch {
    console.error("[editorial] Article source unavailable");
    return [];
  }
}
export async function editorialEvents(): Promise<MarketEvent[]> {
  if (!sanityClient) return [];
  try {
    const rows = await sanityClient.fetch(
      `*[_type == "marketEvent" && !(_id in path("marketEvent-**")) && isDemo != true]{..., "id": _id, "slug": slug.current}`,
      {},
      { cache: "no-store", timeout: 10000 },
    );
    return rows
      .filter(
        (r: MarketEvent) =>
          r.slug && r.title && Number.isFinite(Date.parse(r.scheduledAt)),
      )
      .map((r: MarketEvent & { impactScoreValue: number }) => ({
        ...r,
        id: `sanity:${r.id}`,
        impactScore: makeImpact(r.impactScoreValue),
        affectedAssets: r.affectedAssets ?? [],
        possibleScenarios: r.possibleScenarios ?? [],
        status:
          Date.parse(r.scheduledAt) < Date.now() ? "completed" : "upcoming",
      }));
  } catch {
    console.error("[editorial] Event source unavailable");
    return [];
  }
}
