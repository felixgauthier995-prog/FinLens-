import { supabaseAdminClient } from "@/lib/supabase/admin";
import { reserveIngestionAiCall } from "@/lib/security/aiBudget";
import { fetchQuotes } from "@/lib/providers/prices/fmp";
import { COMPANY_NAMES } from "@/lib/data/assets";
import type { RawNewsArticle } from "@/lib/providers/news/types";
import { filterSignals, type ProposedSignal } from "@/lib/signals/filter";
import { verifySignals } from "@/lib/signals/verify";
import { notifySignalWatchers } from "@/lib/push/send";
import { slugifyArticle } from "@/lib/data/news";

export const SIGNAL_INDEX_TICKER = "SPY";


interface StoreSignalsOptions {
  openaiKey: string;
  /** French headline, for notifications to French-speaking users. */
  titleFr?: string;
  /** Without it, signals are stored but have no baseline price and never
   * count toward the track record. */
  fmpKey?: string;
}

/**
 * Filters, verifies and stores the signals for one freshly analyzed
 * article. Never throws: a failure here must not lose the article itself.
 * Returns the number of signals stored.
 */
export async function storeSignals(
  articleId: number,
  article: RawNewsArticle,
  proposed: ProposedSignal[],
  options: StoreSignalsOptions
): Promise<number> {
  const { openaiKey, fmpKey } = options;
  if (!supabaseAdminClient || proposed.length === 0) return 0;

  try {
    const sourceText = `${article.title}\n${article.summary}`;
    const filtered = filterSignals(proposed, sourceText, COMPANY_NAMES);
    if (filtered.length === 0) return 0;

    // The verification pass is a second paid call: it shares the global
    // daily AI ceiling. Without budget, keep only code-checked direct links.
    let kept: ProposedSignal[];
    let verified = false;
    const verificationOn = process.env.SIGNAL_VERIFICATION !== "off";
    if (
      verificationOn &&
      (await reserveIngestionAiCall())
    ) {
      const result = await verifySignals(article, filtered, openaiKey);
      kept = result.kept;
      verified = result.verified;
    } else {
      kept = filtered.filter((s) => s.linkLevel === "direct");
    }
    if (kept.length === 0) return 0;

    // Baseline prices — real quotes only, never fabricated.
    const quoteByTicker = new Map<string, number>();
    if (fmpKey) {
      const quotes = await fetchQuotes(
        [...kept.map((s) => s.ticker), SIGNAL_INDEX_TICKER],
        fmpKey
      );
      for (const q of quotes) quoteByTicker.set(q.ticker, q.price);
    }
    const indexPrice = quoteByTicker.get(SIGNAL_INDEX_TICKER) ?? null;

    const rows = kept.map((s) => {
      const price = quoteByTicker.get(s.ticker) ?? null;
      const hasBaseline = price !== null && indexPrice !== null;
      return {
        article_id: articleId,
        ticker: s.ticker,
        direction: s.direction,
        confidence: s.confidence,
        horizon: s.horizon,
        link_level: s.linkLevel,
        rationale: s.rationale.trim(),
        rationale_fr: s.rationaleFr?.trim() || null,
        evidence_quote: s.evidenceQuote.trim(),
        verified,
        index_ticker: SIGNAL_INDEX_TICKER,
        price_at_signal: hasBaseline ? price : null,
        index_price_at_signal: hasBaseline ? indexPrice : null,
      };
    });

    const { error } = await supabaseAdminClient
      .from("article_signals")
      .upsert(rows, { onConflict: "article_id,ticker", ignoreDuplicates: true });
    if (error) throw error;

    // Tell followers of these stocks. A failure here never loses the signals.
    try {
      await notifySignalWatchers(
        { title: article.title, titleFr: options.titleFr, slug: slugifyArticle(article.title, articleId) },
        kept
      );
    } catch (err) {
      console.error("[signals] notification failed:", err instanceof Error ? err.message.slice(0, 120) : err);
    }
    return rows.length;
  } catch (err) {
    console.error(
      `[signals] storing failed for ${article.externalId}:`,
      err instanceof Error ? err.message.slice(0, 200) : "unknown"
    );
    return 0;
  }
}
