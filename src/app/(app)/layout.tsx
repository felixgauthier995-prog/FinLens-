import { demoMode } from "@/lib/data/mode";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getArticlesSorted } from "@/lib/data/news";
import { getEventsSorted } from "@/lib/data/events";
import { requireAppAccess } from "@/lib/account";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  // Everything in the app needs an account, a finished questionnaire and an
  // active subscription or trial.
  await requireAppAccess();
  const [articles, events] = await Promise.all([getArticlesSorted(), getEventsSorted()]);

  return (
    <AppShell articles={articles} events={events}>
      {demoMode && <p role="status" className="bg-amber-50 p-3 text-center text-sm text-amber-900">Demo mode — fictional financial data</p>}
      {children}
    </AppShell>
  );
}
