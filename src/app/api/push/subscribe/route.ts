import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";

function validTimeZone(tz: unknown): string | null {
  if (typeof tz !== "string" || tz.length > 64) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return null;
  }
}

/** Saves this device's push subscription for the signed-in user. */
export async function POST(request: Request) {
  const db = await createSessionClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!db || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  let body: { subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }; timezone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const sub = body.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (
    typeof endpoint !== "string" || !endpoint.startsWith("https://") || endpoint.length > 1000 ||
    typeof p256dh !== "string" || p256dh.length > 200 ||
    typeof auth !== "string" || auth.length > 100
  )
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });

  // A device that was used by another account moves to this one.
  await db.from("push_subscriptions").delete().eq("endpoint", endpoint);
  const { error } = await db.from("push_subscriptions").insert({
    user_id: user.id,
    endpoint,
    p256dh,
    auth,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });
  if (error) return NextResponse.json({ error: "Couldn't save this device." }, { status: 500 });

  const timezone = validTimeZone(body.timezone);
  if (timezone) await db.from("profiles").update({ timezone }).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}

/** Removes this device's subscription. */
export async function DELETE(request: Request) {
  const db = await createSessionClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!db || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let endpoint: unknown;
  try {
    endpoint = (await request.json()).endpoint;
  } catch {
    endpoint = null;
  }
  if (typeof endpoint !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await db.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
