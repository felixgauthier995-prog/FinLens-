import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";

/** Turns signal alerts and the morning brief on or off. */
export async function POST(request: Request) {
  const db = await createSessionClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!db || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let body: { notifySignals?: unknown; notifyMorning?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const update: Record<string, boolean> = {};
  if (typeof body.notifySignals === "boolean") update.notify_signals = body.notifySignals;
  if (typeof body.notifyMorning === "boolean") update.notify_morning = body.notifyMorning;
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  const { error } = await db.from("profiles").update(update).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
