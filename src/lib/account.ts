import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/session";
import { hasPaidAccess, type SubscriptionState } from "@/lib/billing/access";

export interface Profile {
  experience: "beginner" | "intermediate" | "advanced" | null;
  goal: "long-term" | "active-trading" | "stay-informed" | "learn" | null;
  sectors: string[];
  risk: "cautious" | "balanced" | "aggressive" | null;
  onboardingCompletedAt: string | null;
}

export interface Account {
  user: User;
  profile: Profile | null;
  subscription: SubscriptionState | null;
  hasAccess: boolean;
}

/** The signed-in user with their profile and subscription, or null. */
export async function getAccount(): Promise<Account | null> {
  const db = await createSessionClient();
  if (!db) return null;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const [profileRes, subRes] = await Promise.all([
    db
      .from("profiles")
      .select("experience, goal, sectors, risk, onboarding_completed_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    db
      .from("subscriptions")
      .select("status, plan_interval, trial_end, current_period_end, cancel_at_period_end, trial_used")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const p = profileRes.data;
  const profile: Profile | null = p
    ? {
        experience: p.experience,
        goal: p.goal,
        sectors: p.sectors ?? [],
        risk: p.risk,
        onboardingCompletedAt: p.onboarding_completed_at,
      }
    : null;

  const s = subRes.data;
  const subscription: SubscriptionState | null = s
    ? {
        status: s.status,
        planInterval: s.plan_interval,
        trialEnd: s.trial_end,
        currentPeriodEnd: s.current_period_end,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        trialUsed: s.trial_used,
      }
    : null;

  return { user, profile, subscription, hasAccess: hasPaidAccess(subscription) };
}

/**
 * Gate for the app: signed in → questionnaire done → paying (or trialing).
 * Redirects to the first missing step.
 */
export async function requireAppAccess(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/welcome");
  if (!account.profile?.onboardingCompletedAt) redirect("/onboarding");
  if (!account.hasAccess) redirect("/subscribe");
  return account;
}

/** Gate for onboarding/paywall pages: only needs a signed-in user. */
export async function requireSignedIn(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect("/login");
  return account;
}
