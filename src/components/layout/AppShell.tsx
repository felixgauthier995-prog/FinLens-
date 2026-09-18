import type { ReactNode } from "react";
import type { MarketEvent, NewsArticle } from "@/lib/types";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({
  children,
  articles,
  events,
}: {
  children: ReactNode;
  articles: NewsArticle[];
  events: MarketEvent[];
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar articles={articles} events={events} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
