import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";
import { getStripe, siteUrl } from "@/lib/billing/stripe";

/** Opens the Stripe customer portal (change plan, card, cancel). */
export async function POST(request: Request) {
  const stripe = getStripe();
  const db = await createSessionClient();
  if (!stripe || !db) return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });

  const user = (await db.auth.getUser()).data.user;
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  // Read through the user's own session (RLS): only their row is visible.
  const { data } = await db
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data?.stripe_customer_id)
    return NextResponse.json({ error: "No subscription found." }, { status: 404 });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${siteUrl(request)}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/portal]", err instanceof Error ? err.message.slice(0, 200) : err);
    return NextResponse.json({ error: "Couldn't open billing. Please try again." }, { status: 502 });
  }
}
