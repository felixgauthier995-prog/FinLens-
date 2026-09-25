import { NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { createFmpEventProvider } from "@/lib/providers/events/fmp";
import type { RawFinancialEvent } from "@/lib/providers/events/types";

export const dynamic = "force-dynamic";

const DAYS_AHEAD = 30;

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function upsertStocksForTickers(tickers: Set<string>) {
  if (tickers.size === 0 || !supabaseAdminClient) return;
  const rows = Array.from(tickers).map((ticker) => ({ ticker }));
  const { error } = await supabaseAdminClient
    .from("stocks")
    .upsert(rows, { onConflict: "ticker", ignoreDuplicates: true });
  if (error) {
    console.error("[sync-financial-events] failed to upsert stocks:", error.message);
  }
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
  let received: RawFinancialEvent[] = [];
  let itemsUpdated = 0;
  let itemsFailed = 0;
  const errors: string[] = [];

  try {
    const provider = createFmpEventProvider(fmpKey);
    received = await provider.fetchUpcomingEvents(DAYS_AHEAD);

    const tickers = new Set(received.flatMap((e) => e.tickers));
    await upsertStocksForTickers(tickers);

    for (const event of received) {
      try {
        const { error } = await supabaseAdminClient.from("events").upsert(
          {
            external_id: event.externalId,
            title: event.title,
            description: event.description,
            event_type: event.eventType,
            category: event.category,
            event_date: event.scheduledAt,
            tickers: event.tickers,
            importance: event.importance,
            source_name: event.sourceName,
            source_url: event.sourceUrl ?? null,
            country: event.country ?? null,
            raw_data: event.rawData,
          },
          { onConflict: "external_id" }
        );
        if (error) throw error;
        itemsUpdated += 1;
      } catch (err) {
        itemsFailed += 1;
        const message = extractErrorMessage(err);
        errors.push(`${event.externalId}: ${message}`);
        console.error("[sync-financial-events] item failed:", event.externalId, message);
      }
    }
  } catch (err) {
    const message = extractErrorMessage(err);
    await supabaseAdminClient.from("ingestion_runs").insert({
      provider: "fmp",
      job_type: "sync-financial-events",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: "failed",
      items_received: received.length,
      items_updated: itemsUpdated,
      items_failed: itemsFailed,
      error_message: message,
    });
    console.error("[sync-financial-events] run failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const summary = {
    provider: "fmp",
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    status: itemsFailed > 0 && itemsUpdated === 0 ? "failed" : "success",
    items_received: received.length,
    items_created: 0,
    items_updated: itemsUpdated,
    items_skipped: 0,
    items_failed: itemsFailed,
    error_message: errors.length > 0 ? errors.slice(0, 5).join(" | ") : null,
  };

  await supabaseAdminClient.from("ingestion_runs").insert(summary);

  console.log(
    `[sync-financial-events] received=${summary.items_received} updated=${summary.items_updated} failed=${summary.items_failed}`
  );

  return NextResponse.json(summary);
}
