"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CalendarClock, Sun } from "lucide-react";
import type { Brief } from "@/lib/brief";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";
import { formatEventTime } from "@/lib/format";

export function TodayCard({ brief, hasStocks }: { brief: Brief; hasStocks: boolean }) {
  const { locale, m } = useI18n();
  const { signals, events, topStory } = brief;
  const quiet = signals.length === 0;

  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-ink-400">
        <Sun className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        {m.home.today}
      </div>

      <h2 className="mt-2 text-[18px] font-semibold leading-snug text-ink-950">
        {!hasStocks
          ? m.home.followToStart
          : quiet
            ? m.home.quiet
            : m.home.newSignals(signals.length)}
      </h2>

      {signals.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {signals.map((s) => {
            const Icon = s.direction === "positive" ? ArrowUpRight : ArrowDownRight;
            return (
              <li key={s.ticker}>
                <Link
                  href={`/news/${s.slug}`}
                  title={s.title}
                  className={cn(
                    "font-data inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold",
                    s.direction === "positive" ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative"
                  )}
                >
                  {s.ticker}
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {events.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-[13.5px] text-ink-800">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} aria-hidden="true" />
              <Link href={`/agenda/${e.slug}`} className="truncate hover:underline">
                {e.title}
              </Link>
              {e.timeConfirmed !== false && (
                <span className="shrink-0 text-[12px] text-ink-400">{formatEventTime(e.scheduledAt, locale)}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {quiet && topStory && (
        <p className="mt-3 text-[13.5px] text-ink-600">
          {m.home.topStory}{" "}
          <Link href={`/news/${topStory.slug}`} className="font-medium text-ink-950 hover:underline">
            {topStory.title}
          </Link>
        </p>
      )}
    </section>
  );
}
