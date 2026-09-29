import test from "node:test";
import assert from "node:assert/strict";
import {
  filterSignals,
  quoteAppearsIn,
  companyNamedIn,
  signalMatched,
  type ProposedSignal,
} from "../src/lib/signals/filter";
import { validateAnalysis } from "../src/lib/ai/analyzeArticle";

const NAMES = new Map([
  ["NVDA", "NVIDIA Corporation"],
  ["TSM", "Taiwan Semiconductor Manufacturing"],
  ["MSFT", "Microsoft Corporation"],
]);
const TEXT =
  "Microsoft signs $10 billion deal for NVIDIA chips\n" +
  "Microsoft agreed to buy $10 billion of NVIDIA’s latest AI accelerators over three years, the company said on Monday.";

function sig(overrides: Partial<ProposedSignal>): ProposedSignal {
  return {
    ticker: "NVDA",
    direction: "positive",
    confidence: "high",
    horizon: "long",
    linkLevel: "direct",
    rationale: "A large multi-year order adds revenue.",
    evidenceQuote: "Microsoft agreed to buy $10 billion of NVIDIA's latest AI accelerators",
    ...overrides,
  };
}

test("quotes must really appear in the article (curly quotes tolerated)", () => {
  assert.equal(quoteAppearsIn("agreed to buy $10 billion of NVIDIA's latest", TEXT), true);
  assert.equal(quoteAppearsIn("NVIDIA expects record revenue next year", TEXT), false);
  assert.equal(quoteAppearsIn("NVIDIA", TEXT), false); // too short to prove anything
});

test("company must be named for a direct link", () => {
  assert.equal(companyNamedIn("NVDA", NAMES.get("NVDA"), TEXT), true);
  assert.equal(companyNamedIn("TSM", NAMES.get("TSM"), TEXT), false);
});

test("filterSignals drops invented quotes and unknown tickers", () => {
  const kept = filterSignals(
    [
      sig({}),
      sig({ ticker: "MSFT", evidenceQuote: "Microsoft will double its profits" }),
      sig({ ticker: "FAKE" }),
      sig({}), // duplicate ticker
    ],
    TEXT,
    NAMES
  );
  assert.deepEqual(kept.map((s) => s.ticker), ["NVDA"]);
});

test("unnamed companies become chain links capped at low confidence", () => {
  const [tsm] = filterSignals(
    [sig({ ticker: "TSM", linkLevel: "direct", confidence: "high" })],
    TEXT,
    NAMES
  );
  assert.equal(tsm.linkLevel, "chain");
  assert.equal(tsm.confidence, "low");
});

test("a signal matches when the stock beats (or lags) the index as signalled", () => {
  // Stock +5%, index +1% → outperformed
  assert.equal(signalMatched("positive", 100, 105, 500, 505), true);
  assert.equal(signalMatched("negative", 100, 105, 500, 505), false);
  // Stock -2%, index +1% → underperformed
  assert.equal(signalMatched("negative", 100, 98, 500, 505), true);
  // Missing data is never counted
  assert.equal(signalMatched("positive", 0, 105, 500, 505), null);
});

test("malformed signals are rejected by validation", () => {
  const base = {
    category: "tech",
    impactScoreValue: 7,
    impactDirection: "positive",
    whatHappened: "x",
    whyItMatters: "y",
    marketImpact: "z",
    whatToWatch: [],
    affectedAssets: ["NVDA"],
    plainExplanation: "Plain words.",
  };
  assert.doesNotThrow(() => validateAnalysis({ ...base, signals: [sig({})] }, ["NVDA"]));
  assert.throws(() => validateAnalysis({ ...base, signals: [sig({ direction: "up" as never })] }, ["NVDA"]));
  assert.throws(() => validateAnalysis(base, ["NVDA"]));
});
