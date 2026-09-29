/** Subscription state as stored in public.subscriptions (mirrors Stripe). */
export interface SubscriptionState {
  status: string | null;
  planInterval: string | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialUsed: boolean;
}

/** Stripe statuses that grant access. past_due keeps access while Stripe
 * retries the card (a few days), so a failed renewal doesn't lock people
 * out instantly. */
const ACCESS_STATUSES = new Set(["trialing", "active", "past_due"]);

export function hasPaidAccess(sub: SubscriptionState | null, now = Date.now()): boolean {
  if (!sub?.status || !ACCESS_STATUSES.has(sub.status)) return false;
  // Safety net if a webhook is missed: never grant access long after the
  // paid period ended (3-day grace for clock skew / renewal processing).
  if (sub.currentPeriodEnd) {
    const end = Date.parse(sub.currentPeriodEnd);
    if (Number.isFinite(end) && end + 3 * 24 * 60 * 60 * 1000 < now) return false;
  }
  return true;
}
