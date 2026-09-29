import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/security/cron";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { getArticlesSorted } from "@/lib/data/news";
import { getEventsSorted } from "@/lib/data/events";
import { buildBrief, localTime } from "@/lib/brief";
import { sendToUser } from "@/lib/push/send";
import type { UserPreferences } from "@/lib/personalization";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const SEND_HOUR = 8;

/**
 * Runs every hour. Sends the morning brief to people for whom it is now
 * 8 a.m. on a weekday, once per local day, if they have notifications on.
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseAdminClient) return NextResponse.json({ error: "Supabase admin client not configured" }, { status: 500 });

  const { data: devices } = await supabaseAdminClient.from("push_subscriptions").select("user_id");
  const userIds = [...new Set((devices ?? []).map((d) => d.user_id as string))];
  if (userIds.length === 0) return NextResponse.json({ status: "success", due: 0, sent: 0 });

  const { data: profiles } = await supabaseAdminClient
    .from("profiles")
    .select("user_id, timezone, last_morning_push, experience, risk, sectors")
    .in("user_id", userIds)
    .eq("notify_morning", true)
    .not("timezone", "is", null);

  const now = new Date();
  const due = (profiles ?? []).flatMap((p) => {
    try {
      const t = localTime(p.timezone as string, now);
      const weekday = t.weekday >= 1 && t.weekday <= 5;
      return t.hour === SEND_HOUR && weekday && p.last_morning_push !== t.date ? [{ ...p, localDate: t.date }] : [];
    } catch {
      return [];
    }
  });
  if (due.length === 0) return NextResponse.json({ status: "success", due: 0, sent: 0 });

  const [articles, events, watch] = await Promise.all([
    getArticlesSorted(),
    getEventsSorted(),
    supabaseAdminClient.from("user_watchlists").select("user_id, ticker").in("user_id", due.map((p) => p.user_id)),
  ]);

  let sent = 0;
  for (const p of due) {
    const prefs: UserPreferences = {
      experience: p.experience,
      risk: p.risk,
      sectors: p.sectors ?? [],
      tickers: (watch.data ?? []).filter((w) => w.user_id === p.user_id).map((w) => w.ticker as string),
    };
    const brief = buildBrief(prefs, articles, events, now.getTime());
    sent += await sendToUser(p.user_id, { title: brief.pushTitle, body: brief.pushBody, url: "/", tag: "morning-brief" });
    // Mark the day as done either way, so a failing device isn't retried every hour.
    await supabaseAdminClient.from("profiles").update({ last_morning_push: p.localDate }).eq("user_id", p.user_id);
  }

  return NextResponse.json({ status: "success", due: due.length, sent });
}
