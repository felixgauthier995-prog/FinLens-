import { NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { fetchQuotes } from "@/lib/providers/prices/fmp";
import { ASSETS } from "@/lib/data/assets";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdminClient) {
    return NextResponse.json(
      { error: "Supabase admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }
  const fmpKey = process.env.FMP_API_KEY;
  if (!fmpKey) {
    return NextResponse.json({ error: "Missing FMP_API_KEY" }, { status: 500 });
  }

  const startedAt = new Date().toISOString();
  const tickers = ASSETS.map((a) => a.ticker);
  const quotes = await fetchQuotes(tickers, fmpKey);

  let itemsUpdated = 0;
  let itemsFailed = 0;
  const now = new Date().toISOString();

  for (const quote of quotes) {
    const { error } = await supabaseAdminClient.from("stocks").upsert(
      {
        ticker: quote.ticker,
        price: quote.price,
        change_percent: quote.changePercent,
        change_absolute: quote.changeAbsolute,
        price_updated_at: now,
      },
      { onConflict: "ticker" }
    );
    if (error) {
      itemsFailed += 1;
      console.error(`[sync-asset-prices] upsert failed for ${quote.ticker}:`, error.message);
    } else {
      itemsUpdated += 1;
    }
  }

  const skipped = tickers.length - quotes.length;

  const summary = {
    provider: "fmp",
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    status: itemsUpdated > 0 ? "success" : "failed",
    items_received: quotes.length,
    items_created: 0,
    items_updated: itemsUpdated,
    items_skipped: skipped,
    items_failed: itemsFailed,
    error_message: null,
  };

  await supabaseAdminClient.from("ingestion_runs").insert({
    ...summary,
    job_type: "sync-asset-prices",
  });

  console.log(
    `[sync-asset-prices] tickers=${tickers.length} updated=${itemsUpdated} skipped=${skipped} failed=${itemsFailed}`
  );

  return NextResponse.json(summary);
}
