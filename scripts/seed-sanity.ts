/**
 * One-time import of FinLens's built-in mock content into Sanity, so the
 * Studio isn't empty on first login. Safe to re-run (uses deterministic
 * document IDs + createOrReplace).
 *
 * Usage: npm run seed
 * Requires SANITY_WRITE_TOKEN in .env.local — generate one at
 * https://www.sanity.io/manage → your project → API → Tokens (Editor role).
 */
import { createClient } from "next-sanity";
import { NEWS_ARTICLES } from "../src/lib/data/news";
import { MARKET_EVENTS } from "../src/lib/data/events";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local — set up Sanity before seeding."
  );
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_WRITE_TOKEN in .env.local.\n" +
      "Generate one at https://www.sanity.io/manage → your project → API → Tokens (Editor permission),\n" +
      "then add SANITY_WRITE_TOKEN=<your-token> to .env.local and re-run `npm run seed`."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

async function seedNewsArticles() {
  console.log(`Seeding ${NEWS_ARTICLES.length} news articles…`);
  for (const a of NEWS_ARTICLES) {
    await client.createOrReplace({
      _id: `newsArticle-${a.slug}`,
      _type: "newsArticle",
      title: a.title,
      slug: { _type: "slug", current: a.slug },
      summary: a.summary,
      category: a.category,
      publishedAt: a.publishedAt,
      source: a.source,
      sourceUrl: a.sourceUrl,
      additionalSources: a.additionalSources?.map((s, i) => ({
        _type: "sourceLink",
        _key: `source-${i}`,
        name: s.name,
        url: s.url,
      })),
      impactScoreValue: a.impactScore.value,
      impactDirection: a.impactDirection,
      affectedAssets: a.affectedAssets,
      whatHappened: a.whatHappened,
      whyItMatters: a.whyItMatters,
      marketImpact: a.marketImpact,
      whatToWatch: a.whatToWatch,
      relatedEventSlug: a.relatedEventSlug,
    });
    console.log(`  ✓ ${a.title}`);
  }
}

async function seedMarketEvents() {
  console.log(`\nSeeding ${MARKET_EVENTS.length} market events…`);
  for (const e of MARKET_EVENTS) {
    await client.createOrReplace({
      _id: `marketEvent-${e.slug}`,
      _type: "marketEvent",
      title: e.title,
      slug: { _type: "slug", current: e.slug },
      eventType: e.eventType,
      category: e.category,
      scheduledAt: e.scheduledAt,
      description: e.description,
      affectedAssets: e.affectedAssets,
      expectations: e.expectations,
      whyItMatters: e.whyItMatters,
      possibleScenarios: e.possibleScenarios?.map((s, i) => ({
        _type: "scenario",
        _key: `scenario-${i}`,
        label: s.label,
        direction: s.direction,
        description: s.description,
      })),
      impactScoreValue: e.impactScore.value,
      previousRelatedEventSlug: e.previousRelatedEventSlug,
      relatedArticleSlug: e.relatedArticleSlug,
    });
    console.log(`  ✓ ${e.title}`);
  }
}

async function run() {
  await seedNewsArticles();
  await seedMarketEvents();
  console.log("\nDone. Open /studio to see your content, or refresh the site.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
