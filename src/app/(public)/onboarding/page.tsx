import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireSignedIn } from "@/lib/account";
import { ASSETS } from "@/lib/data/assets";
import { OnboardingFlow } from "@/components/features/onboarding/OnboardingFlow";

export const metadata: Metadata = { title: "Set up FinLens" };

export default async function OnboardingPage() {
  const account = await requireSignedIn();
  if (account.profile?.onboardingCompletedAt) redirect(account.hasAccess ? "/" : "/subscribe");

  // Indices and currencies can't be "followed" like a holding.
  const pickable = ASSETS.filter((a) => a.assetType !== "index" && a.assetType !== "currency").map(
    ({ ticker, name, assetType, sector }) => ({ ticker, name, assetType, sector })
  );

  return <OnboardingFlow assets={pickable} />;
}
