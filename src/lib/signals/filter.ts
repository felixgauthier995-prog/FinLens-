import type {
  SignalConfidence,
  SignalDirection,
  SignalHorizon,
  SignalLinkLevel,
} from "@/lib/types";

/** A signal as proposed by the AI, before any checks. */
export interface ProposedSignal {
  ticker: string;
  direction: SignalDirection;
  confidence: SignalConfidence;
  horizon: SignalHorizon;
  linkLevel: SignalLinkLevel;
  rationale: string;
  evidenceQuote: string;
}

export const MAX_SIGNALS_PER_ARTICLE = 5;
const MIN_QUOTE_LENGTH = 12;

/** Lowercase, unify quotes/dashes, collapse whitespace — so a quote copied
 * with slightly different punctuation still matches the source. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function trimQuote(quote: string): string {
  return normalizeText(quote)
    .replace(/^["'.…\s]+|["'.…\s]+$/g, "")
    .replace(/\.\.\.|…/g, "")
    .trim();
}

/** True when the quote really appears in the source text. This is the main
 * guard against invented links: no quote, no signal. */
export function quoteAppearsIn(quote: string, sourceText: string): boolean {
  const q = trimQuote(quote);
  if (q.length < MIN_QUOTE_LENGTH) return false;
  return normalizeText(sourceText).includes(q);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whether the article names the company, by ticker or by the first
 * distinctive word of its name ("NVIDIA", "Taiwan", "Advanced"...). */
export function companyNamedIn(
  ticker: string,
  companyName: string | undefined,
  sourceText: string
): boolean {
  const text = normalizeText(sourceText);
  const candidates = [ticker];
  const firstWord = companyName?.split(/[\s,.]+/)[0];
  if (firstWord && firstWord.length >= 3) candidates.push(firstWord);
  return candidates.some((c) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(c.toLowerCase())}([^a-z0-9]|$)`).test(text)
  );
}

/**
 * Applies FinLens's evidence rules to the AI's proposed signals:
 * - unknown tickers are dropped
 * - a signal whose quote isn't in the article is dropped
 * - a "direct" signal whose company isn't named is downgraded to "chain"
 * - every "chain" signal is capped at low confidence
 * - one signal per ticker, at most MAX_SIGNALS_PER_ARTICLE
 */
export function filterSignals(
  proposed: ProposedSignal[],
  sourceText: string,
  companyNames: Map<string, string>
): ProposedSignal[] {
  const seen = new Set<string>();
  const kept: ProposedSignal[] = [];

  for (const s of proposed) {
    if (kept.length >= MAX_SIGNALS_PER_ARTICLE) break;
    if (!companyNames.has(s.ticker) || seen.has(s.ticker)) continue;
    if (!s.rationale.trim()) continue;
    if (!quoteAppearsIn(s.evidenceQuote, sourceText)) continue;

    let linkLevel = s.linkLevel;
    if (
      linkLevel === "direct" &&
      !companyNamedIn(s.ticker, companyNames.get(s.ticker), sourceText)
    ) {
      linkLevel = "chain";
    }
    const confidence: SignalConfidence = linkLevel === "chain" ? "low" : s.confidence;

    seen.add(s.ticker);
    kept.push({ ...s, linkLevel, confidence });
  }
  return kept;
}

/** Did the stock move in the signalled direction relative to the index? */
export function signalMatched(
  direction: SignalDirection,
  priceAtSignal: number,
  priceLater: number,
  indexAtSignal: number,
  indexLater: number
): boolean | null {
  if (![priceAtSignal, priceLater, indexAtSignal, indexLater].every((n) => Number.isFinite(n) && n > 0))
    return null;
  const excess = priceLater / priceAtSignal - indexLater / indexAtSignal;
  if (excess === 0) return null;
  return direction === "positive" ? excess > 0 : excess < 0;
}
