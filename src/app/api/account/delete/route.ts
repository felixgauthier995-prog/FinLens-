import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/billing/stripe";

/**
 * Permanently deletes the signed-in user's account (Loi 25 / nLPD / GDPR
 * right to erasure). Cancels any Stripe subscription first so nobody keeps
 * being charged, then deletes the auth user — every FinLens table
 * referencing it is removed by ON DELETE CASCADE.
 */
export async function POST(request: Request) {
  const db = await createSessionClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!db || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!supabaseAdminClient) return NextResponse.json({ error: "Not configured." }, { status: 503 });

  let body: { confirm?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (body.confirm !== true) return NextResponse.json({ error: "Confirmation required." }, { status: 400 });

  try {
    const { data: sub } = await supabaseAdminClient
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id, status")
      .eq("user_id", user.id)
      .maybeSingle();
    const stripe = getStripe();
    if (stripe && sub?.stripe_subscription_id && !["canceled", "incomplete_expired"].includes(sub.status ?? "")) {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    }
    if (stripe && sub?.stripe_customer_id) {
      // Removes saved cards and personal details at Stripe; Stripe keeps
      // invoices as its own legal records.
      await stripe.customers.del(sub.stripe_customer_id);
    }

    const { error } = await supabaseAdminClient.auth.admin.deleteUser(user.id);
    if (error) throw error;
    await db.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account/delete]", err instanceof Error ? err.message.slice(0, 200) : err);
    return NextResponse.json({ error: "Deletion failed." }, { status: 500 });
  }
}
