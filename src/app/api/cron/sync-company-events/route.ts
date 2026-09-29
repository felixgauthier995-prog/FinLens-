import { reserveIngestionAiCall } from "@/lib/security/aiBudget";
import { isCronAuthorized } from "@/lib/security/cron";
import { reserveQuota } from "@/lib/security/quota";
import { NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { fetchCompanyNews } from "@/lib/providers/news/finnhub";
import { analyzeArticle } from "@/lib/ai/analyzeArticle";
import { fetchQuotes } from "@/lib/providers/prices/fmp";
import { ASSETS } from "@/lib/data/assets";
import type { RawNewsArticle } from "@/lib/providers/news/types";
import { storeSignals } from "@/lib/signals/store";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Cost control: never analyze more than this many new articles in one
 * run, regardless of how many tickers/items are fetched. */
const MAX_NEW_ARTICLES_PER_RUN = 8;
const LOOKBACK_DAYS = 3;
const REFERENCE_INDEX = "SPY";

function extractErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "Data operation failed";
  return message
    .replace(/(?:sk-[A-Za-z0-9_-]+|(?:token|apikey|key)=\S+)/gi, "[redacted]")
    .slice(0, 300);
}


function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdminClient) {
    return NextResponse.json(
      { error: "Supabase admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const fmpKey = process.env.FMP_API_KEY;
  if (!finnhubKey) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });
  if (!openaiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  if (!fmpKey) return NextResponse.json({ error: "Missing FMP_API_KEY" }, { status: 500 });

  const slot = Math.floor(Date.now() / 900000);
  if (!(await reserveQuota(`company-events-run:${slot}`, 1))) {
    return NextResponse.json(
      { error: "Job already reserved in this 15-minute window or quota storage unavailable" },
      { status: 429 }
    );
  }

  const startedAt = new Date().toISOString();
  let itemsUpdated = 0;
  let itemsSkipped = 0;
  let itemsFailed = 0;
  let itemsReceived = 0;
  let priceReactionsCaptured = 0;
  let signalsStored = 0;
  const errors: string[] = [];

  try {
    const to = new Date();
    const from = new Date(to.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const tickers = ASSETS.map((a) => a.ticker);

    // Fetch per-ticker company news in parallel; one ticker failing
    // doesn't take down the others.
    const perTicker = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          return await fetchCompanyNews(ticker, toDateStr(from), toDateStr(to), finnhubKey);
        } catch (err) {
          console.error(`[sync-company-events] fetch failed for ${ticker}:`, extractErrorMessage(err));
          return [] as RawNewsArticle[];
        }
      })
    );

    // Flatten + de-dupe by externalId (the same story can surface under
    // multiple tickers' feeds).
    const byExternalId = new Map<string, RawNewsArticle>();
    for (const article of perTicker.flat()) {
      const existingArticle = byExternalId.get(article.externalId);
      if (existingArticle) {
        const mergedTickers = Array.from(new Set([...existingArticle.tickers, ...article.tickers]));
        byExternalId.set(article.externalId, { ...existingArticle, tickers: mergedTickers });
      } else {
        byExternalId.set(article.externalId, article);
      }
    }
    const fetched = Array.from(byExternalId.values());
    itemsReceived = fetched.length;

    // Dedup against what's already stored (never re-analyze the same story).
    const { data: existing, error: existingError } = await supabaseAdminClient
      .from("articles")
      .select("external_id")
      .in("external_id", fetched.map((a) => a.externalId));
    if (existingError) throw existingError;
    const existingIds = new Set((existing ?? []).map((r) => r.external_id));

    const newArticles = fetched.filter((a) => !existingIds.has(a.externalId));
    itemsSkipped = fetched.length - newArticles.length;
    const toAnalyze = newArticles.slice(0, MAX_NEW_ARTICLES_PER_RUN);
    itemsSkipped += newArticles.length - toAnalyze.length;

    const knownTickers = ASSETS.map((a) => a.ticker);

    for (const article of toAnalyze) {
      try {
        if (!(await reserveIngestionAiCall())) {
          itemsSkipped += 1;
          continue;
        }
        const analysis = await analyzeArticle(article, knownTickers, openaiKey, {
          isCompanyNews: true,
        });

        const { data: upserted, error } = await supabaseAdminClient
          .from("articles")
          .upsert(
            {
              external_id: article.externalId,
              title: article.title,
              summary: article.summary,
              url: article.url,
              source_name: article.sourceName,
              published_at: article.publishedAt,
              image_url: article.imageUrl ?? null,
              tickers: analysis.affectedAssets,
              category: analysis.category,
              impact_score: analysis.impactScoreValue,
              impact_direction: analysis.impactDirection,
              what_happened: analysis.whatHappened,
              why_it_matters: analysis.whyItMatters,
              market_impact: analysis.marketImpact,
              what_to_watch: analysis.whatToWatch,
              plain_explanation: analysis.plainExplanation.trim() || null,
              company_event_type: analysis.isMajorCompanyEvent ? analysis.companyEventType : null,
              raw_data: article.rawData,
            },
            { onConflict: "external_id" }
          )
          .select("id")
          .single();
        if (error) throw error;
        itemsUpdated += 1;

        if (upserted) {
          signalsStored += await storeSignals(upserted.id, article, analysis.signals, {
            openaiKey,
            fmpKey,
          });
        }

        // Only capture a price snapshot for genuinely major, ticker-linked
        // events — and only using real fetched quotes, never a fabricated
        // value. A quote failure for one ticker just skips that row.
        if (analysis.isMajorCompanyEvent && analysis.affectedAssets.length > 0 && upserted) {
          try {
            const quotes = await fetchQuotes(
              [...analysis.affectedAssets, REFERENCE_INDEX],
              fmpKey
            );
            const quoteByTicker = new Map(quotes.map((q) => [q.ticker, q]));
            const indexQuote = quoteByTicker.get(REFERENCE_INDEX);

            for (const ticker of analysis.affectedAssets) {
              const quote = quoteByTicker.get(ticker);
              if (!quote || !indexQuote) continue; // never fabricate a snapshot
              const { error: reactionError } = await supabaseAdminClient
                .from("article_price_reactions")
                .upsert(
                  {
                    article_id: upserted.id,
                    ticker,
                    index_ticker: REFERENCE_INDEX,
                    price_at_announcement: quote.price,
                    index_price_at_announcement: indexQuote.price,
                  },
                  { onConflict: "article_id,ticker" }
                );
              if (reactionError) throw reactionError;
              priceReactionsCaptured += 1;
            }
          } catch (err) {
            console.error(
              `[sync-company-events] price snapshot failed for ${article.externalId}:`,
              extractErrorMessage(err)
            );
          }
        }
      } catch (err) {
        itemsFailed += 1;
        const message = extractErrorMessage(err);
        errors.push(`${article.externalId}: ${message}`);
        console.error("[sync-company-events] item failed:", article.externalId, message);
      }
    }
  } catch (err) {
    const message = extractErrorMessage(err);
    await supabaseAdminClient.from("ingestion_runs").insert({
      provider: "finnhub+openai+fmp",
      job_type: "sync-company-events",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: "failed",
      items_updated: itemsUpdated,
      items_skipped: itemsSkipped,
      items_failed: itemsFailed,
      error_message: message,
    });
    console.error("[sync-company-events] run failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const summary = {
    provider: "finnhub+openai+fmp",
    job_type: "sync-company-events",
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    status: itemsFailed ? (itemsUpdated ? "partial" : "failed") : "success",
    items_received: itemsReceived,
    items_created: 0,
    items_updated: itemsUpdated,
    items_skipped: itemsSkipped,
    items_failed: itemsFailed,
    error_message: errors.length > 0 ? errors.slice(0, 5).join(" | ") : null,
  };

  await supabaseAdminClient.from("ingestion_runs").insert(summary);
  console.log(
    `[sync-company-events] analyzed=${itemsUpdated} priceSnapshots=${priceReactionsCaptured} signals=${signalsStored} skipped=${itemsSkipped} failed=${itemsFailed}`
  );

  return NextResponse.json({ ...summary, price_reactions_captured: priceReactionsCaptured, signals_stored: signalsStored });
}
