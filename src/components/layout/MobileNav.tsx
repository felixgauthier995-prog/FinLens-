"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium"
          >
            <Icon
              className={cn("h-5 w-5", active ? "text-ink-950" : "text-ink-400")}
              strokeWidth={active ? 2.25 : 2}
            />
            <span className={active ? "text-ink-950" : "text-ink-400"}>
              {item.label === "Ask FinLens" ? "Ask" : item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
