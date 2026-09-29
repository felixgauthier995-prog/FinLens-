import test from "node:test";
import assert from "node:assert/strict";
import { validateAnalysis, analyzeArticle } from "../src/lib/ai/analyzeArticle";
import { formatPrice } from "../src/lib/format";
import { createFinnhubNewsProvider } from "../src/lib/providers/news/finnhub";
const valid = {
  category: "macro",
  impactScoreValue: 6,
  impactDirection: "mixed",
  whatHappened: "A source reported a change.",
  whyItMatters: "Potential relevance.",
  marketImpact: "Uncertain.",
  whatToWatch: ["Next report"],
  affectedAssets: ["SPY"],
  signals: [],
};
test("rejects invented tickers and invalid impact scores", () => {
  assert.deepEqual(validateAnalysis(valid, ["SPY"]), valid);
  assert.throws(() =>
    validateAnalysis({ ...valid, affectedAssets: ["FAKE"] }, ["SPY"]),
  );
  assert.throws(() =>
    validateAnalysis({ ...valid, impactScoreValue: 11 }, ["SPY"]),
  );
  assert.throws(() =>
    validateAnalysis({ ...valid, whatHappened: null }, ["SPY"]),
  );
});
test("unknown prices never render as actual prices", () => {
  assert.equal(formatPrice(null), "Unavailable");
  assert.equal(formatPrice(NaN), "Unavailable");
  assert.equal(formatPrice(0), "$0.00");
});
test("Finnhub drops malformed stories and preserves source metadata", async () => {
  const original = global.fetch;
  global.fetch = async () =>
    Response.json([
      {
        id: 1,
        headline: "Real headline",
        summary: "Summary",
        datetime: 1700000000,
        url: "https://example.org/story",
        source: "Publisher",
        related: "SPY",
        image: "",
      },
      { id: 2, headline: null },
    ]);
  try {
    const stories = await createFinnhubNewsProvider("test").fetchLatest(25);
    assert.equal(stories.length, 1);
    assert.equal(stories[0].externalId, "finnhub-1");
    assert.equal(stories[0].sourceName, "Publisher");
  } finally {
    global.fetch = original;
  }
});
test("AI truncation is rejected and upstream error body is not leaked", async () => {
  const original = global.fetch;
  const article = {
    externalId: "a",
    title: "t",
    summary: "s",
    sourceName: "s",
    url: "https://example.org",
    publishedAt: new Date().toISOString(),
    tickers: [],
    rawData: {},
  };
  try {
    global.fetch = async () => new Response("secret-body", { status: 500 });
    await assert.rejects(
      analyzeArticle(article, [], "test"),
      (e) => e instanceof Error && !e.message.includes("secret-body"),
    );
    global.fetch = async () =>
      Response.json({
        choices: [
          {
            finish_reason: "length",
            message: { content: JSON.stringify(valid) },
          },
        ],
      });
    await assert.rejects(
      analyzeArticle(article, ["SPY"], "test"),
      /Incomplete/,
    );
  } finally {
    global.fetch = original;
  }
});
