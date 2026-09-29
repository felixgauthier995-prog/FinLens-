import { supabaseServerClient } from "@/lib/supabase/server";
import { signalMatched } from "@/lib/signals/filter";
import type { ArticleSignal, SignalTrackRecord } from "@/lib/types";

interface SignalRow {
  article_id: number;
  ticker: string;
  direction: ArticleSignal["direction"];
  confidence: ArticleSignal["confidence"];
  horizon: ArticleSignal["horizon"];
  link_level: ArticleSignal["linkLevel"];
  rationale: string;
  rationale_fr: string | null;
  evidence_quote: string;
  verified: boolean;
  created_at: string;
}

const CONFIDENCE_RANK = { high: 0, medium: 1, low: 2 } as const;

/** Signals grouped by article id. Returns an empty map on any failure
 * (e.g. migration 0007 not applied yet) so the news feed keeps working. */
export async function getSignalsForArticles(
  articleIds: number[]
): Promise<Map<number, ArticleSignal[]>> {
  const byArticle = new Map<number, ArticleSignal[]>();
  if (!supabaseServerClient || articleIds.length === 0) return byArticle;

  try {
    const { data, error } = await supabaseServerClient
      .from("article_signals")
      .select(
        "article_id, ticker, direction, confidence, horizon, link_level, rationale, rationale_fr, evidence_quote, verified, created_at"
      )
      .in("article_id", articleIds);
    if (error) throw error;

    for (const row of (data ?? []) as SignalRow[]) {
      const list = byArticle.get(row.article_id) ?? [];
      list.push({
        ticker: row.ticker,
        direction: row.direction,
        confidence: row.confidence,
        horizon: row.horizon,
        linkLevel: row.link_level,
        rationale: row.rationale,
        ...(row.rationale_fr ? { rationaleFr: row.rationale_fr } : {}),
        evidenceQuote: row.evidence_quote,
        verified: row.verified,
        createdAt: row.created_at,
      });
      byArticle.set(row.article_id, list);
    }
    // Direct links first, then by confidence.
    for (const list of byArticle.values()) {
      list.sort(
        (a, b) =>
          (a.linkLevel === b.linkLevel ? 0 : a.linkLevel === "direct" ? -1 : 1) ||
          CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence]
      );
    }
  } catch (err) {
    console.error("[signals] fetch failed:", err instanceof Error ? err.message : err);
  }
  return byArticle;
}

interface OutcomeRow {
  direction: ArticleSignal["direction"];
  price_at_signal: number | null;
  index_price_at_signal: number | null;
  price_1d: number | null;
  index_price_1d: number | null;
  price_1w: number | null;
  index_price_1w: number | null;
  price_1m: number | null;
  index_price_1m: number | null;
}

/**
 * How often past signals matched the stock's move relative to the index,
 * per window. Every measured signal counts — wrong ones included.
 */
export async function getSignalTrackRecord(): Promise<SignalTrackRecord[]> {
  const empty: SignalTrackRecord[] = (["1d", "1w", "1m"] as const).map((window) => ({
    window,
    measured: 0,
    matched: 0,
  }));
  if (!supabaseServerClient) return empty;

  try {
    const { data, error } = await supabaseServerClient
      .from("article_signals")
      .select(
        "direction, price_at_signal, index_price_at_signal, price_1d, index_price_1d, price_1w, index_price_1w, price_1m, index_price_1m"
      )
      .not("price_at_signal", "is", null)
      .or("price_1d.not.is.null,price_1w.not.is.null,price_1m.not.is.null")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw error;

    return empty.map(({ window }) => {
      let measured = 0;
      let matched = 0;
      for (const row of (data ?? []) as OutcomeRow[]) {
        const later = row[`price_${window}`];
        const indexLater = row[`index_price_${window}`];
        if (later == null || indexLater == null) continue;
        const result = signalMatched(
          row.direction,
          Number(row.price_at_signal),
          Number(later),
          Number(row.index_price_at_signal),
          Number(indexLater)
        );
        if (result === null) continue;
        measured += 1;
        if (result) matched += 1;
      }
      return { window, measured, matched };
    });
  } catch (err) {
    console.error("[signals] track record failed:", err instanceof Error ? err.message : err);
    return empty;
  }
}
