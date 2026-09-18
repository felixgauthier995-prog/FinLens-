"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { MarketEvent, NewsArticle } from "@/lib/types";
import { formatRelativeTime, formatEventDay, formatEventTime } from "@/lib/format";

export function NotificationsButton({
  articles,
  events,
}: {
  articles: NewsArticle[];
  events: MarketEvent[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const topStory = [...articles].sort((a, b) => b.impactScore.value - a.impactScore.value)[0];
  const nextEvent = events.find((e) => e.status === "upcoming");

  const items = [
    topStory && {
      key: `n-${topStory.slug}`,
      href: `/news/${topStory.slug}`,
      title: topStory.title,
      meta: `High impact · ${formatRelativeTime(topStory.publishedAt)}`,
    },
    nextEvent && {
      key: `e-${nextEvent.slug}`,
      href: `/agenda/${nextEvent.slug}`,
      title: `${nextEvent.title} — ${formatEventDay(nextEvent.scheduledAt)} at ${formatEventTime(
        nextEvent.scheduledAt
      )}`,
      meta: "Upcoming event",
    },
  ].filter(Boolean) as { key: string; href: string; title: string; meta: string }[];

  return (
    <div className="relative" ref={ref}>
      <IconButton aria-label="Notifications" onClick={() => setOpen((v) => !v)} active={open}>
        <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
        {items.length > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-[13px] font-semibold text-ink-950">Notifications</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-border px-4 py-3 last:border-0 hover:bg-surface"
              >
                <p className="text-[13px] font-medium leading-snug text-ink-950">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">{item.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
