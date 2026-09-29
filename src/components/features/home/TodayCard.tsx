import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CalendarClock, Sun } from "lucide-react";
import type { Brief } from "@/lib/brief";
import { cn } from "@/lib/cn";

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export function TodayCard({ brief, hasStocks }: { brief: Brief; hasStocks: boolean }) {
  const { signals, events, topStory } = brief;
  const quiet = signals.length === 0;

  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-ink-400">
        <Sun className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        Today on your stocks
      </div>

      <h2 className="mt-2 text-[18px] font-semibold leading-snug text-ink-950">
        {!hasStocks
          ? "Follow a few stocks to get your daily brief."
          : quiet
            ? "No new signals on your stocks in the last 24 hours."
            : `${signals.length} new signal${signals.length === 1 ? "" : "s"} on your stocks since yesterday`}
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
                <span className="shrink-0 text-[12px] text-ink-400">{timeFormatter.format(new Date(e.scheduledAt))}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {quiet && topStory && (
        <p className="mt-3 text-[13.5px] text-ink-600">
          Top story for you:{" "}
          <Link href={`/news/${topStory.slug}`} className="font-medium text-ink-950 hover:underline">
            {topStory.title}
          </Link>
        </p>
      )}
    </section>
  );
}
