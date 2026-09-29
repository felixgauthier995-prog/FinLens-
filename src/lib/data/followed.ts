import "server-only";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { ASSETS, CORE_TICKERS } from "@/lib/data/assets";

/**
 * Which tickers background jobs should spend API calls on: stocks that
 * users actually follow come first (most-followed first), then the core
 * list, capped. Free data plans can't refresh 130+ tickers every run.
 */
export async function tickersToRefresh(limit: number, includeCore = true): Promise<string[]> {
  const known = new Set(ASSETS.map((a) => a.ticker));
  const counts = new Map<string, number>();
  if (supabaseAdminClient) {
    const { data } = await supabaseAdminClient.from("user_watchlists").select("ticker").limit(5000);
    for (const row of data ?? []) {
      const t = row.ticker as string;
      if (known.has(t)) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  const followed = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const ordered = includeCore ? [...followed, ...CORE_TICKERS] : followed;
  return Array.from(new Set(ordered)).slice(0, limit);
}
