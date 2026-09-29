import { reserveIngestionAiCall } from "@/lib/security/aiBudget";
import { isCronAuthorized } from "@/lib/security/cron";
import { reserveQuota } from "@/lib/security/quota";
import { NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { createFinnhubNewsProvider } from "@/lib/providers/news/finnhub";
import { analyzeArticle } from "@/lib/ai/analyzeArticle";
import { ASSETS } from "@/lib/data/assets";
import { storeSignals } from "@/lib/signals/store";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Cost control: never analyze more than this many new articles in one
 * run, regardless of how many the provider returns. */
const MAX_NEW_ARTICLES_PER_RUN = 8;
const FETCH_LIMIT = 25;

function extractErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "Data operation failed";
  return message
    .replace(/(?:sk-[A-Za-z0-9_-]+|(?:token|apikey|key)=\S+)/gi, "[redacted]")
    .slice(0, 300);
}


export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdminClient) {
    return NextResponse.json(
      {
        error:
          "Supabase admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)",
      },
      { status: 500 },
    );
  }
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!finnhubKey)
    return NextResponse.json(
      { error: "Missing FINNHUB_API_KEY" },
      { status: 500 },
    );
  if (!openaiKey)
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );

  const slot = Math.floor(Date.now() / 900000);
  if (!(await reserveQuota(`news-run:${slot}`, 1)))
    return NextResponse.json(
      {
        error:
          "Job already reserved in this 15-minute window or quota storage unavailable",
      },
      { status: 429 },
    );
  const startedAt = new Date().toISOString();
  let itemsUpdated = 0;
  let itemsSkipped = 0;
  let itemsFailed = 0;
  const errors: string[] = [];
  let itemsReceived = 0;
  let signalsStored = 0;
  // Optional here: without it, signals are stored without a baseline price.
  const fmpKey = process.env.FMP_API_KEY;

  try {
    const provider = createFinnhubNewsProvider(finnhubKey);
    const fetched = await provider.fetchLatest(FETCH_LIMIT);
    itemsReceived = fetched.length;

    // Dedup: only analyze articles we haven't already stored (saves
    // OpenAI cost — never re-analyze the same headline twice).
    const { data: existing, error: existingError } = await supabaseAdminClient
      .from("articles")
      .select("external_id")
      .in(
        "external_id",
        fetched.map((a) => a.externalId),
      );
    if (existingError) throw existingError;
    const existingIds = new Set((existing ?? []).map((r) => r.external_id));

    const newArticles = fetched.filter((a) => !existingIds.has(a.externalId));
    itemsSkipped = fetched.length - newArticles.length;
    const toAnalyze = newArticles.slice(0, MAX_NEW_ARTICLES_PER_RUN);
    itemsSkipped += newArticles.length - toAnalyze.length;

    const knownTickers = ASSETS.map((a) => a.ticker);

    for (const article of toAnalyze) {
      try {
        if (
          !(await reserveIngestionAiCall())
        ) {
          itemsSkipped += 1;
          continue;
        }
        const analysis = await analyzeArticle(article, knownTickers, openaiKey);
        const { data: upserted, error } = await supabaseAdminClient.from("articles").upsert(
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
            raw_data: article.rawData,
          },
          { onConflict: "external_id" },
        ).select("id").single();
        if (error) throw error;
        itemsUpdated += 1;
        if (upserted) {
          signalsStored += await storeSignals(upserted.id, article, analysis.signals, {
            openaiKey,
            fmpKey,
          });
        }
      } catch (err) {
        itemsFailed += 1;
        const message = extractErrorMessage(err);
        errors.push(`${article.externalId}: ${message}`);
        console.error("[sync-news] item failed:", article.externalId, message);
      }
    }
  } catch (err) {
    const message = extractErrorMessage(err);
    await supabaseAdminClient.from("ingestion_runs").insert({
      provider: "finnhub+openai",
      job_type: "sync-news",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: "failed",
      items_updated: itemsUpdated,
      items_skipped: itemsSkipped,
      items_failed: itemsFailed,
      error_message: message,
    });
    console.error("[sync-news] run failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const summary = {
    provider: "finnhub+openai",
    job_type: "sync-news",
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
    `[sync-news] analyzed=${itemsUpdated} signals=${signalsStored} skipped=${itemsSkipped} failed=${itemsFailed}`,
  );

  return NextResponse.json({ ...summary, signals_stored: signalsStored });
}
