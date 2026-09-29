import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { requireSignedIn } from "@/lib/account";
import { PlanPicker } from "@/components/features/billing/PlanPicker";
import { TRIAL_DAYS } from "@/lib/billing/stripe";

export const metadata: Metadata = { title: "Choose your plan — FinLens" };

const INCLUDED = [
  "Signals on who each story could affect — up or down, and why",
  "News, earnings and catalysts for the stocks you follow",
  "Ask FinLens: plain-language answers from the latest coverage",
  "Event reminders and your personal watchlist",
];

export default async function SubscribePage() {
  const account = await requireSignedIn();
  if (!account.profile?.onboardingCompletedAt) redirect("/onboarding");
  if (account.hasAccess) redirect("/");

  const trialAvailable = !account.subscription?.trialUsed;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <Logo />
      <h1 className="mt-8 text-[26px] font-semibold leading-tight tracking-tight text-ink-950">
        {trialAvailable ? `Try FinLens free for ${TRIAL_DAYS} days` : "Continue with FinLens"}
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600">
        {trialAvailable
          ? "You won't be charged today. Cancel anytime before the trial ends and you pay nothing."
          : "Pick a plan to get back to your signals and watchlist."}
      </p>

      <ul className="mt-7 space-y-3">
        {INCLUDED.map((line) => (
          <li key={line} className="flex gap-2.5 text-[14px] leading-snug text-ink-800">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" strokeWidth={2.5} aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>

      <PlanPicker trialAvailable={trialAvailable} />

      <form action="/auth/signout" method="post" className="mt-6 text-center">
        <button className="text-[13px] font-medium text-ink-400 hover:text-ink-950">
          Sign out ({account.user.email})
        </button>
      </form>
    </main>
  );
}
