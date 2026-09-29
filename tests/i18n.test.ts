import test from "node:test";
import assert from "node:assert/strict";
import { detectLocale } from "../src/i18n/config";
import { localizeArticle } from "../src/i18n/content";
import { messages } from "../src/i18n/messages";
import { formatPrice, formatRelativeTime } from "../src/lib/format";
import { LEGAL } from "../src/legal/documents";
import type { NewsArticle } from "../src/lib/types";

test("language: saved choice first, then the browser's preference, else English", () => {
  assert.equal(detectLocale("en", "fr-CA,fr;q=0.9"), "en");
  assert.equal(detectLocale(undefined, "fr-CH,fr;q=0.9,en;q=0.8"), "fr");
  assert.equal(detectLocale(undefined, "de-CH,de;q=0.9,fr;q=0.8"), "fr");
  assert.equal(detectLocale(undefined, "es-ES"), "en");
  assert.equal(detectLocale("xx", null), "en");
});

test("French articles use the AI translation and keep the source quote", () => {
  const article = {
    id: "1", slug: "s", title: "Nvidia beats", summary: "sum", category: "tech", publishedAt: new Date().toISOString(),
    source: "", sourceUrl: "", impactScore: { value: 5, level: "moderate" }, impactDirection: "positive",
    affectedAssets: ["NVDA"], whatHappened: "w", whyItMatters: "y", marketImpact: "m", whatToWatch: ["a"],
    fr: { title: "Nvidia dépasse", whatHappened: "fw", whyItMatters: "fy", marketImpact: "fm", whatToWatch: ["fa"], plainExplanation: "fp" },
    signals: [{ ticker: "NVDA", direction: "positive", confidence: "high", horizon: "short", linkLevel: "direct", rationale: "r", rationaleFr: "rf", evidenceQuote: "quote", verified: true, createdAt: "" }],
  } as NewsArticle;
  const fr = localizeArticle(article, "fr");
  assert.equal(fr.title, "Nvidia dépasse");
  assert.equal(fr.slug, "s");
  assert.equal(fr.signals?.[0].rationale, "rf");
  assert.equal(fr.signals?.[0].evidenceQuote, "quote");
  assert.equal(fr.translated, true);
  assert.equal(localizeArticle(article, "en"), article);
});

test("French formatting and plurals", () => {
  assert.equal(formatPrice(null, "USD", "fr"), "Indisponible");
  assert.equal(formatRelativeTime(new Date(Date.now() - 5 * 60000).toISOString(), "fr"), "Il y a 5 min");
  assert.equal(messages.fr.home.newSignals(1), "1 nouveau signal sur tes actions depuis hier");
  assert.equal(messages.fr.home.newSignals(3), "3 nouveaux signaux sur tes actions depuis hier");
  assert.equal(messages.fr.push.morningSignals(2), "Bonjour — 2 signaux sur tes actions");
});

test("legal documents exist in both languages with the same sections", () => {
  for (const doc of Object.values(LEGAL)) {
    assert.equal(doc.en.sections.length, doc.fr.sections.length);
    assert.ok(doc.fr.intro.length > 50);
  }
});
