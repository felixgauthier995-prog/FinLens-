import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe, priceIdFor, siteUrl, TRIAL_DAYS, type Plan } from "@/lib/billing/stripe";
import { getLocale } from "@/i18n/server";

/** Starts a Stripe Checkout for the signed-in user. Returns { url }. */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !supabaseAdminClient)
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });

  const db = await createSessionClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  let plan: Plan = "monthly";
  try {
    const body = await request.json();
    if (body?.plan === "yearly") plan = "yearly";
  } catch {
    // default monthly
  }
  const priceId = priceIdFor(plan);
  if (!priceId) return NextResponse.json({ error: "This plan is not available yet." }, { status: 503 });

  try {
    const { data: existing } = await supabaseAdminClient
      .from("subscriptions")
      .select("stripe_customer_id, trial_used, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing && ["trialing", "active", "past_due"].includes(existing.status ?? ""))
      return NextResponse.json({ url: `${siteUrl(request)}/` });

    // One Stripe customer per user, created once and remembered.
    let customerId = existing?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      const { error } = await supabaseAdminClient
        .from("subscriptions")
        .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
      if (error) throw error;
    }

    const base = siteUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      locale: (await getLocale()) === "fr" ? "fr-CA" : "en",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id },
        // One free trial per person.
        ...(existing?.trial_used ? {} : { trial_period_days: TRIAL_DAYS }),
      },
      success_url: `${base}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/subscribe`,
    });
    if (!session.url) throw new Error("Checkout session has no URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/checkout]", err instanceof Error ? err.message.slice(0, 200) : err);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
}
