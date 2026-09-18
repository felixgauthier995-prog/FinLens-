/**
 * Sanity is optional: until these env vars are set, the data layer
 * (src/lib/data/news.ts, events.ts) falls back to the built-in mock data
 * so the app keeps working unmodified.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-01-01";

export const isSanityConfigured = Boolean(projectId);
