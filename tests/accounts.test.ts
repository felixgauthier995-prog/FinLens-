import test from "node:test";
import assert from "node:assert/strict";
import { hasPaidAccess, type SubscriptionState } from "../src/lib/billing/access";
import { parseAnswers, suggestAssets, MAX_STOCKS } from "../src/lib/onboarding/options";

const DAY = 24 * 60 * 60 * 1000;
function sub(o: Partial<SubscriptionState>): SubscriptionState {
  return {
    status: "active",
    planInterval: "month",
    trialEnd: null,
    currentPeriodEnd: new Date(Date.now() + 10 * DAY).toISOString(),
    cancelAtPeriodEnd: false,
    trialUsed: false,
    ...o,
  };
}

test("only trialing, active and past_due subscriptions grant access", () => {
  assert.equal(hasPaidAccess(null), false);
  assert.equal(hasPaidAccess(sub({ status: null })), false);
  assert.equal(hasPaidAccess(sub({ status: "trialing" })), true);
  assert.equal(hasPaidAccess(sub({ status: "active" })), true);
  assert.equal(hasPaidAccess(sub({ status: "past_due" })), true);
  assert.equal(hasPaidAccess(sub({ status: "canceled" })), false);
  assert.equal(hasPaidAccess(sub({ status: "incomplete" })), false);
});

test("access ends if the paid period is long over, even if a webhook was missed", () => {
  assert.equal(
    hasPaidAccess(sub({ currentPeriodEnd: new Date(Date.now() - 10 * DAY).toISOString() })),
    false
  );
  assert.equal(
    hasPaidAccess(sub({ currentPeriodEnd: new Date(Date.now() - 1 * DAY).toISOString() })),
    true
  );
});

const valid = {
  experience: "beginner",
  goal: "long-term",
  sectors: ["tech", "ai"],
  risk: "balanced",
  tickers: ["AAPL", "NVDA"],
};
const KNOWN = ["AAPL", "NVDA", "XOM"];

test("questionnaire answers are validated on the server", () => {
  assert.deepEqual(parseAnswers(valid, KNOWN)?.tickers, ["AAPL", "NVDA"]);
  assert.equal(parseAnswers({ ...valid, experience: "guru" }, KNOWN), null);
  assert.equal(parseAnswers({ ...valid, sectors: [] }, KNOWN), null);
  assert.equal(parseAnswers({ ...valid, tickers: [] }, KNOWN), null);
  assert.equal(parseAnswers({ ...valid, tickers: ["FAKE"] }, KNOWN), null);
  assert.equal(
    parseAnswers({ ...valid, tickers: Array.from({ length: MAX_STOCKS + 1 }, () => "AAPL") }, KNOWN)?.tickers.length,
    1 // duplicates collapse
  );
});

test("stock suggestions follow the chosen sectors", () => {
  const assets = [
    { ticker: "NVDA", name: "NVIDIA", assetType: "equity", sector: "Semiconductors" },
    { ticker: "XOM", name: "Exxon", assetType: "equity", sector: "Energy" },
    { ticker: "BTC", name: "Bitcoin", assetType: "crypto" },
  ];
  const { suggested, others } = suggestAssets(assets, ["energy", "crypto"]);
  assert.deepEqual(suggested.map((a) => a.ticker), ["XOM", "BTC"]);
  assert.deepEqual(others.map((a) => a.ticker), ["NVDA"]);
});
