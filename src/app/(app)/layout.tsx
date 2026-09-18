import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getArticlesSorted } from "@/lib/data/news";
import { getEventsSorted } from "@/lib/data/events";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const [articles, events] = await Promise.all([getArticlesSorted(), getEventsSorted()]);

  return (
    <AppShell articles={articles} events={events}>
      {children}
    </AppShell>
  );
}
