import { NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { reserveQuota } from "@/lib/security/quota";
import { fetchQuotes } from "@/lib/providers/prices/fmp";
import { SIGNAL_INDEX_TICKER } from "@/lib/signals/store";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Each follow-up window, and how late we still accept a snapshot for it.
 * A snapshot taken far past its window would distort the track record, so
 * it is skipped (left null, and excluded from stats) instead. */
const WINDOWS = [
  { key: "1d", days: 1, graceDays: 2 },
  { key: "1w", days: 7, graceDays: 3 },
  { key: "1m", days: 30, graceDays: 5 },
] as const;

/** FMP free tier ≈ 250 calls/day, one call per ticker. */
const MAX_TICKERS_PER_RUN = 40;
const MAX_ROWS_PER_WINDOW = 200;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

interface PendingRow {
  id: number;
  ticker: string;
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
  if (!fmpKey) return NextResponse.json({ error: "Missing FMP_API_KEY" }, { status: 500 });

  const slot = Math.floor(Date.now() / 900000);
  if (!(await reserveQuota(`track-signals-run:${slot}`, 1))) {
    return NextResponse.json(
      { error: "Job already reserved in this 15-minute window or quota storage unavailable" },
      { status: 429 }
    );
  }

  const startedAt = new Date().toISOString();
  const now = Date.now();

  try {
    // 1. Find signals due for each window.
    const pending = new Map<(typeof WINDOWS)[number]["key"], PendingRow[]>();
    for (const w of WINDOWS) {
      const dueBefore = new Date(now - w.days * DAY_MS).toISOString();
      const notOlderThan = new Date(now - (w.days + w.graceDays) * DAY_MS).toISOString();
      const { data, error } = await supabaseAdminClient
        .from("article_signals")
        .select("id, ticker")
        .is(`price_${w.key}`, null)
        .not("price_at_signal", "is", null)
        .lte("created_at", dueBefore)
        .gte("created_at", notOlderThan)
        .order("created_at", { ascending: true })
        .limit(MAX_ROWS_PER_WINDOW);
      if (error) throw error;
      pending.set(w.key, (data ?? []) as PendingRow[]);
    }

    // 2. One quote per distinct ticker (plus the index), capped per run.
    const tickers = Array.from(
      new Set([...pending.values()].flat().map((r) => r.ticker))
    ).slice(0, MAX_TICKERS_PER_RUN);
    if (tickers.length === 0) {
      return NextResponse.json({ status: "success", started_at: startedAt, snapshots: 0 });
    }
    const quotes = await fetchQuotes([...tickers, SIGNAL_INDEX_TICKER], fmpKey);
    const priceByTicker = new Map(quotes.map((q) => [q.ticker, q.price]));
    const indexPrice = priceByTicker.get(SIGNAL_INDEX_TICKER);
    if (indexPrice === undefined) throw new Error("Index quote unavailable");

    // 3. Write snapshots — only where a real quote came back.
    let snapshots = 0;
    let failed = 0;
    const checkedAt = new Date().toISOString();
    for (const w of WINDOWS) {
      for (const row of pending.get(w.key) ?? []) {
        const price = priceByTicker.get(row.ticker);
        if (price === undefined) continue;
        const { error } = await supabaseAdminClient
          .from("article_signals")
          .update({
            [`price_${w.key}`]: price,
            [`index_price_${w.key}`]: indexPrice,
            [`checked_${w.key}_at`]: checkedAt,
          })
          .eq("id", row.id)
          .is(`price_${w.key}`, null);
        if (error) failed += 1;
        else snapshots += 1;
      }
    }

    const summary = {
      provider: "fmp",
      job_type: "track-signals",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: failed ? (snapshots ? "partial" : "failed") : "success",
      items_received: [...pending.values()].flat().length,
      items_created: 0,
      items_updated: snapshots,
      items_skipped: 0,
      items_failed: failed,
      error_message: null,
    };
    await supabaseAdminClient.from("ingestion_runs").insert(summary);
    return NextResponse.json(summary);
  } catch (err) {
    const message = (err instanceof Error ? err.message : "Data operation failed")
      .replace(/(?:(?:token|apikey|key)=\S+)/gi, "[redacted]")
      .slice(0, 300);
    await supabaseAdminClient.from("ingestion_runs").insert({
      provider: "fmp",
      job_type: "track-signals",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: "failed",
      items_updated: 0,
      items_skipped: 0,
      items_failed: 0,
      error_message: message,
    });
    console.error("[track-signals] run failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
