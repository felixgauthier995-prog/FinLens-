import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { requireSignedIn } from "@/lib/account";
import { PlanPicker } from "@/components/features/billing/PlanPicker";
import { TRIAL_DAYS } from "@/lib/billing/stripe";
import { getMessages } from "@/i18n/server";

export const metadata: Metadata = { title: "Choose your plan — FinLens" };


export default async function SubscribePage() {
  const account = await requireSignedIn();
  if (!account.profile?.onboardingCompletedAt) redirect("/onboarding");
  if (account.hasAccess) redirect("/");

  const trialAvailable = !account.subscription?.trialUsed;
  const m = await getMessages();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <Logo />
      <h1 className="mt-8 text-[26px] font-semibold leading-tight tracking-tight text-ink-950">
        {trialAvailable ? m.subscribe.trialTitle(TRIAL_DAYS) : m.subscribe.continueTitle}
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600">
        {trialAvailable ? m.subscribe.trialIntro : m.subscribe.continueIntro}
      </p>

      <ul className="mt-7 space-y-3">
        {m.subscribe.included.map((line) => (
          <li key={line} className="flex gap-2.5 text-[14px] leading-snug text-ink-800">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" strokeWidth={2.5} aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>

      <PlanPicker trialAvailable={trialAvailable} />

      <p className="mt-4 flex justify-center gap-4 text-[11.5px] text-ink-400">
        <Link href="/legal/terms" className="hover:text-ink-950">{m.common.terms}</Link>
        <Link href="/legal/privacy" className="hover:text-ink-950">{m.common.privacy}</Link>
      </p>

      <form action="/auth/signout" method="post" className="mt-6 text-center">
        <button className="text-[13px] font-medium text-ink-400 hover:text-ink-950">
          {m.subscribe.signOutAs(account.user.email ?? "")}
        </button>
      </form>
    </main>
  );
}
