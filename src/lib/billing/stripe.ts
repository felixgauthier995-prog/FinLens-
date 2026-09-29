import "server-only";
import Stripe from "stripe";
import { supabaseAdminClient } from "@/lib/supabase/admin";

export const TRIAL_DAYS = 7;

export type Plan = "monthly" | "yearly";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export function priceIdFor(plan: Plan): string | undefined {
  return plan === "yearly" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
}

/** Public base URL used in Stripe redirects. */
export function siteUrl(request: Request): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

function toIso(seconds: number | null | undefined): string | null {
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}

/**
 * Copies a Stripe subscription into public.subscriptions. The single place
 * where access is granted or removed — called by the webhook and right
 * after checkout. The user id comes from metadata we set ourselves, or
 * from the customer id we stored when creating the customer.
 */
export async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  if (!supabaseAdminClient) throw new Error("Supabase admin client not configured");
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let userId = sub.metadata?.user_id || null;
  if (!userId) {
    const { data } = await supabaseAdminClient
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) throw new Error(`No FinLens user for Stripe customer ${customerId}`);

  const item = sub.items.data[0];
  const { error } = await supabaseAdminClient.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: item?.price.id ?? null,
      plan_interval: item?.price.recurring?.interval ?? null,
      trial_end: toIso(sub.trial_end),
      current_period_end: toIso(item?.current_period_end),
      cancel_at_period_end: sub.cancel_at_period_end,
      ...(sub.trial_end ? { trial_used: true } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}
