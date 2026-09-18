import Link from "next/link";
import type { MarketEvent, NewsArticle } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { NotificationsButton } from "@/components/layout/NotificationsButton";
import { UserMenu } from "@/components/layout/UserMenu";

export function TopBar({
  articles,
  events,
}: {
  articles: NewsArticle[];
  events: MarketEvent[];
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <Link href="/" aria-label="FinLens home" className="shrink-0 md:hidden">
        <Logo iconOnly />
      </Link>

      <div className="flex-1 sm:max-w-64">
        <CommandSearch articles={articles} events={events} />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationsButton articles={articles} events={events} />
        <UserMenu />
      </div>
    </header>
  );
}
