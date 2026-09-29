import test from "node:test";
import assert from "node:assert/strict";
import {
  rankForUser,
  relevanceReason,
  signalsForUser,
  NO_PREFERENCES,
  type UserPreferences,
} from "../src/lib/personalization";
import { isCronAuthorized } from "../src/lib/security/cron";
import type { ArticleSignal, NewsArticle } from "../src/lib/types";

const NOW = Date.parse("2026-09-29T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3600000).toISOString();

function article(o: Partial<NewsArticle>): NewsArticle {
  return {
    id: o.id ?? "1",
    slug: o.id ?? "1",
    title: "t",
    summary: "s",
    category: "macro",
    publishedAt: hoursAgo(1),
    source: "src",
    sourceUrl: "",
    impactScore: { value: 5, level: "moderate" },
    impactDirection: "neutral",
    affectedAssets: [],
    whatHappened: "",
    whyItMatters: "",
    marketImpact: "",
    whatToWatch: [],
    ...o,
  };
}

function signal(o: Partial<ArticleSignal>): ArticleSignal {
  return {
    ticker: "NVDA",
    direction: "positive",
    confidence: "high",
    horizon: "short",
    linkLevel: "direct",
    rationale: "r",
    evidenceQuote: "q",
    verified: true,
    createdAt: hoursAgo(1),
    ...o,
  };
}

const me: UserPreferences = { experience: "beginner", risk: "cautious", sectors: ["energy"], tickers: ["NVDA"] };

test("the user's own stocks rank above bigger market stories", () => {
  const big = article({ id: "big", impactScore: { value: 9, level: "major" } });
  const mine = article({ id: "mine", affectedAssets: ["NVDA"], impactScore: { value: 4, level: "moderate" } });
  const sector = article({ id: "sector", category: "energy" });
  assert.deepEqual(rankForUser([big, sector, mine], me, NOW).map((a) => a.id), ["mine", "big", "sector"]);
});

test("old stories fade even when they concern the user", () => {
  const oldMine = article({ id: "old", affectedAssets: ["NVDA"], publishedAt: hoursAgo(24 * 6) });
  const fresh = article({ id: "fresh", impactScore: { value: 8, level: "high" } });
  assert.equal(rankForUser([oldMine, fresh], me, NOW)[0].id, "fresh");
});

test("relevance labels name the stock or the sector", () => {
  assert.deepEqual(relevanceReason(article({ affectedAssets: ["NVDA"] }), me), { kind: "stock", ticker: "NVDA" });
  assert.deepEqual(relevanceReason(article({ category: "energy" }), me), { kind: "sector", category: "energy" });
  assert.equal(relevanceReason(article({}), NO_PREFERENCES), null);
});

test("indirect leads are hidden from cautious beginners; risks come first for them", () => {
  const signals = [
    signal({ ticker: "AMD", direction: "positive" }),
    signal({ ticker: "TSM", linkLevel: "chain", confidence: "low" }),
    signal({ ticker: "XOM", direction: "negative" }),
    signal({ ticker: "NVDA", direction: "positive" }),
  ];
  assert.deepEqual(signalsForUser(signals, me).map((s) => s.ticker), ["NVDA", "XOM", "AMD"]);
  const pro: UserPreferences = { ...me, experience: "advanced", risk: "aggressive" };
  assert.equal(signalsForUser(signals, pro).length, 4);
});

test("cron routes accept either secret, and nothing else", () => {
  const prev = { c: process.env.CRON_SECRET, s: process.env.SCHEDULER_SECRET };
  process.env.CRON_SECRET = "vercel-cron-secret-123456";
  process.env.SCHEDULER_SECRET = "supabase-scheduler-secret-abc";
  const req = (auth?: string) =>
    new Request("https://x/api/cron/sync-news", auth ? { headers: { authorization: auth } } : {});
  try {
    assert.equal(isCronAuthorized(req("Bearer vercel-cron-secret-123456")), true);
    assert.equal(isCronAuthorized(req("Bearer supabase-scheduler-secret-abc")), true);
    assert.equal(isCronAuthorized(req("Bearer wrong")), false);
    assert.equal(isCronAuthorized(req()), false);
    delete process.env.SCHEDULER_SECRET;
    assert.equal(isCronAuthorized(req("Bearer undefined")), false);
  } finally {
    process.env.CRON_SECRET = prev.c;
    process.env.SCHEDULER_SECRET = prev.s;
    if (prev.c === undefined) delete process.env.CRON_SECRET;
    if (prev.s === undefined) delete process.env.SCHEDULER_SECRET;
  }
});
