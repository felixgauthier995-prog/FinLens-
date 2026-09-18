import { sanityClient } from "@/sanity/client";

/**
 * Fetches a list from Sanity and falls back to the given mock array when
 * Sanity isn't configured, the dataset is empty, or the request fails —
 * so the app always renders, before and after the CMS is set up.
 */
export async function fetchListOrFallback<TDoc, T>(
  query: string,
  mapDoc: (doc: TDoc) => T,
  fallback: T[]
): Promise<T[]> {
  if (!sanityClient) return fallback;
  try {
    const docs = await sanityClient.fetch<TDoc[]>(query);
    if (!docs || docs.length === 0) return fallback;
    return docs.map(mapDoc);
  } catch (err) {
    console.error("[sanity] list fetch failed, falling back to mock data:", err);
    return fallback;
  }
}

/**
 * Fetches a single document by a query param and falls back to a plain
 * lookup function (usually a `.find()` over the mock array) on failure.
 */
export async function fetchOneOrFallback<TDoc, T>(
  query: string,
  params: Record<string, string>,
  mapDoc: (doc: TDoc) => T,
  fallback: () => T | undefined
): Promise<T | undefined> {
  if (!sanityClient) return fallback();
  try {
    const doc = await sanityClient.fetch<TDoc | null>(query, params);
    if (!doc) return fallback();
    return mapDoc(doc);
  } catch (err) {
    console.error("[sanity] single fetch failed, falling back to mock data:", err);
    return fallback();
  }
}
