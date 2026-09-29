import test from "node:test";
import assert from "node:assert/strict";
import { buildBrief, localTime } from "../src/lib/brief";
import { buildWeek, weekRecap } from "../src/lib/week";
import type { MarketEvent, NewsArticle, ArticleSignal } from "../src/lib/types";
import type { UserPreferences } from "../src/lib/personalization";

const NOW = Date.parse("2026-09-29T12:00:00Z"); // a Tuesday
const hoursAgo = (h: number) => new Date(NOW - h * 3600000).toISOString();
const inHours = (h: number) => new Date(NOW + h * 3600000).toISOString();

const sig = (ticker: string, direction: "positive" | "negative", linkLevel: "direct" | "chain" = "direct"): ArticleSignal => ({
  ticker, direction, linkLevel, confidence: "high", horizon: "short", rationale: "r", evidenceQuote: "q", verified: true, createdAt: hoursAgo(1),
});

function article(id: string, publishedAt: string, signals: ArticleSignal[] = []): NewsArticle {
  return {
    id, slug: id, title: `Story ${id}`, summary: "", category: "tech", publishedAt, source: "", sourceUrl: "",
    impactScore: { value: 5, level: "moderate" }, impactDirection: "neutral", affectedAssets: signals.map((s) => s.ticker),
    whatHappened: "", whyItMatters: "", marketImpact: "", whatToWatch: [], signals,
  };
}

function event(id: string, scheduledAt: string, tickers: string[], impact = 5): MarketEvent {
  return {
    id, slug: id, title: `Event ${id}`, eventType: "earnings", category: "earnings", scheduledAt, description: "",
    impactScore: { value: impact, level: impact >= 8 ? "high" : "moderate" }, affectedAssets: tickers,
    expectations: "", whyItMatters: "", possibleScenarios: [], status: "upcoming",
  };
}

const me: UserPreferences = { experience: "beginner", risk: "balanced", sectors: [], tickers: ["NVDA", "AAPL"] };

test("morning brief lists the latest direct signal per followed stock from the last 24h", () => {
  const articles = [
    article("new", hoursAgo(2), [sig("NVDA", "positive"), sig("AAPL", "negative", "chain")]),
    article("older", hoursAgo(5), [sig("NVDA", "negative")]),
    article("stale", hoursAgo(30), [sig("AAPL", "positive")]),
  ];
  const brief = buildBrief(me, articles, [], NOW);
  assert.deepEqual(brief.signals.map((s) => `${s.ticker}:${s.direction}:${s.slug}`), ["NVDA:positive:new"]);
  assert.match(brief.pushTitle, /1 signal on your stocks/);
  assert.match(brief.pushBody, /NVDA ↑/);
});

test("morning brief mentions today's events for followed stocks", () => {
  const brief = buildBrief(me, [], [event("aapl-earnings", inHours(6), ["AAPL"]), event("far", inHours(48), ["NVDA"])], NOW);
  assert.deepEqual(brief.events.map((e) => e.id), ["aapl-earnings"]);
  assert.match(brief.pushBody, /Today: Event aapl-earnings/);
});

test("local time is computed in the user's time zone", () => {
  const t = localTime("America/Toronto", new Date(NOW)); // 12:00 UTC = 08:00 EDT
  assert.deepEqual(t, { hour: 8, weekday: 2, date: "2026-09-29" });
  assert.equal(localTime("Europe/Zurich", new Date(NOW)).hour, 14);
});

test("the week puts the user's stocks first and drops empty days", () => {
  const events = [
    event("big", inHours(24), ["SPY"], 9),
    event("mine", inHours(24), ["NVDA"]),
    event("later", inHours(72), ["XOM"], 4),
  ];
  const days = buildWeek(me, events, NOW);
  assert.deepEqual(days.map((d) => d.date), ["2026-09-29", "2026-09-30", "2026-10-02"]);
  assert.deepEqual(days[1].mine.map((e) => e.id), ["mine"]);
  assert.deepEqual(days[1].market.map((e) => e.id), ["big"]);
  assert.equal(days[0].isToday, true);
});

test("week recap keeps one signal per followed stock over 7 days", () => {
  const recap = weekRecap(me, [
    article("a", hoursAgo(10), [sig("AAPL", "positive")]),
    article("b", hoursAgo(50), [sig("AAPL", "negative"), sig("NVDA", "negative")]),
    article("c", hoursAgo(24 * 9), [sig("NVDA", "positive")]),
  ], NOW);
  assert.deepEqual(recap.map((s) => `${s.ticker}:${s.slug}`), ["AAPL:a", "NVDA:b"]);
});
