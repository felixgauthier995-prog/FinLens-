"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface/60">
      <div className="flex h-16 items-center px-5">
        <Link href="/" aria-label="FinLens home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-ink-950 text-white"
                  : "text-ink-600 hover:bg-surface-hover hover:text-ink-950"
              )}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
            isActive(pathname, "/settings")
              ? "bg-ink-950 text-white"
              : "text-ink-600 hover:bg-surface-hover hover:text-ink-950"
          )}
        >
          <Settings className="h-[17px] w-[17px]" strokeWidth={2} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
