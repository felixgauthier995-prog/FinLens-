import "server-only";
import webpush from "web-push";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { reserveQuota } from "@/lib/security/quota";

export interface PushPayload {
  title: string;
  body: string;
  /** Same-site path opened when the notification is tapped. */
  url: string;
  /** Notifications with the same tag replace each other on the device. */
  tag?: string;
}

/** Max signal alerts per person per day, so notifications stay welcome. */
export const SIGNAL_PUSHES_PER_DAY = 5;

let configured: boolean | null = null;
function configure(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.PUSH_CONTACT || process.env.NEXT_PUBLIC_SITE_URL;
  if (!publicKey || !privateKey || !contact) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(contact.startsWith("http") || contact.startsWith("mailto:") ? contact : `mailto:${contact}`, publicKey, privateKey);
  configured = true;
  return true;
}

/** Sends to every device of one user. Expired subscriptions are removed.
 * Returns how many devices received it. Never throws. */
export async function sendToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!supabaseAdminClient || !configure()) return 0;
  const { data: subs } = await supabaseAdminClient
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);
  let delivered = 0;
  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 6 * 3600, urgency: "normal" }
      );
      delivered += 1;
      await supabaseAdminClient.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", sub.id);
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabaseAdminClient.from("push_subscriptions").delete().eq("id", sub.id);
      } else {
        console.error("[push] send failed:", status ?? (err instanceof Error ? err.message.slice(0, 120) : "unknown"));
      }
    }
  }
  return delivered;
}

interface SignalForPush {
  ticker: string;
  direction: "positive" | "negative";
  linkLevel: "direct" | "chain";
}

/**
 * Tells people who follow a ticker that a new signal concerns it. Only
 * direct links (company named in the article) trigger a notification.
 */
export async function notifySignalWatchers(
  article: { title: string; slug: string },
  signals: SignalForPush[]
): Promise<number> {
  if (!supabaseAdminClient || !configure()) return 0;
  const direct = signals.filter((s) => s.linkLevel === "direct");
  if (direct.length === 0) return 0;

  const { data: rows } = await supabaseAdminClient
    .from("user_watchlists")
    .select("user_id, ticker")
    .in("ticker", direct.map((s) => s.ticker));
  const byUser = new Map<string, SignalForPush[]>();
  for (const row of rows ?? []) {
    const sig = direct.find((s) => s.ticker === row.ticker);
    if (!sig) continue;
    byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), sig]);
  }
  if (byUser.size === 0) return 0;

  const { data: optedOut } = await supabaseAdminClient
    .from("profiles")
    .select("user_id")
    .in("user_id", [...byUser.keys()])
    .eq("notify_signals", false);
  const skip = new Set((optedOut ?? []).map((r) => r.user_id));

  const day = new Date().toISOString().slice(0, 10);
  let sent = 0;
  for (const [userId, sigs] of byUser) {
    if (skip.has(userId)) continue;
    if (!(await reserveQuota(`push-signal:${userId}:${day}`, SIGNAL_PUSHES_PER_DAY))) continue;
    const arrows = sigs.map((s) => `${s.ticker} ${s.direction === "positive" ? "↑" : "↓"}`).join(" · ");
    sent += await sendToUser(userId, {
      title: `New signal: ${arrows}`,
      body: article.title.slice(0, 140),
      url: `/news/${article.slug}`,
      tag: `signal-${article.slug}`,
    });
  }
  return sent;
}
