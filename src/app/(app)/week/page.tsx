import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { getEventsSorted } from "@/lib/data/events";
import { getArticlesForReader } from "@/lib/data/reader";
import { getMessages, getLocale } from "@/i18n/server";
import { intlLocale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { getUserPreferences } from "@/lib/data/preferences";
import { buildWeek, weekRecap } from "@/lib/week";
import type { MarketEvent } from "@/lib/types";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "My week — FinLens" };


function EventLine({ event, mine, m }: { event: MarketEvent; mine: boolean; m: Messages }) {
  return (
    <li>
      <Link
        href={`/agenda/${event.slug}`}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors",
          mine ? "bg-accent-soft hover:bg-accent-soft/70" : "bg-surface hover:bg-surface-hover"
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium text-ink-950">{event.title}</span>
          <span className="block text-[12px] text-ink-400">
            {m.eventTypes[event.eventType]}
            {event.affectedAssets.length > 0 && ` · ${event.affectedAssets.slice(0, 3).join(", ")}`}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-300" strokeWidth={2} aria-hidden="true" />
      </Link>
    </li>
  );
}

export default async function WeekPage() {
  const [events, articles, prefs, m, locale] = await Promise.all([
    getEventsSorted(),
    getArticlesForReader(),
    getUserPreferences(),
    getMessages(),
    getLocale(),
  ]);
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  const dayName = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", timeZone: "UTC" });
  const dayDate = new Intl.DateTimeFormat(intlLocale(locale), { month: "long", day: "numeric", timeZone: "UTC" });
  const days = buildWeek(prefs, events);
  const recap = weekRecap(prefs, articles);
  const total = days.length + 1;

  const cardClass =
    "flex w-[85vw] max-w-sm shrink-0 snap-center flex-col rounded-3xl border border-border bg-background p-6 shadow-sm sm:w-96";

  return (
    <div className="py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">{m.week.title}</h1>
        <p className="mt-1 text-[13.5px] text-ink-400">{m.week.subtitle}</p>
      </div>

      <div
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={m.week.daysLabel}
      >
        {/* Recap card */}
        <section className={cardClass} aria-label={m.week.soFar}>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-400">1 / {total}</p>
          <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight text-ink-950">{m.week.soFar}</h2>
          {recap.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {recap.map((s) => {
                const Icon = s.direction === "positive" ? ArrowUpRight : ArrowDownRight;
                return (
                  <li key={s.ticker}>
                    <Link href={`/news/${s.slug}`} className="flex items-start gap-3 rounded-xl bg-surface px-3.5 py-3 hover:bg-surface-hover">
                      <span
                        className={cn(
                          "font-data inline-flex shrink-0 items-center gap-0.5 text-[14px] font-semibold",
                          s.direction === "positive" ? "text-positive" : "text-negative"
                        )}
                      >
                        {s.ticker}
                        <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                      </span>
                      <span className="line-clamp-2 text-[13px] leading-snug text-ink-800">{s.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-5 text-[14px] leading-relaxed text-ink-600">
              {prefs.tickers.length ? m.week.noSignals : m.week.followHint}
            </p>
          )}
          <p className="mt-auto pt-6 text-[12px] text-ink-400">{m.week.swipe}</p>
        </section>

        {days.map((day, i) => {
          const t = Date.parse(`${day.date}T12:00:00Z`);
          const empty = day.mine.length === 0 && day.market.length === 0;
          return (
            <section key={day.date} className={cardClass} aria-label={cap(dayName.format(t))}>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-400">
                {i + 2} / {total}
                {day.isToday && <span className="ml-2 rounded-full bg-ink-950 px-2 py-0.5 text-white">{m.week.today}</span>}
              </p>
              <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight text-ink-950">{cap(dayName.format(t))}</h2>
              <p className="text-[14px] text-ink-400">{dayDate.format(t)}</p>

              {day.mine.length > 0 && (
                <>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-accent-ink">{m.week.yourStocks}</p>
                  <ul className="mt-2 space-y-2">
                    {day.mine.map((e) => (
                      <EventLine key={e.id} event={e} mine m={m} />
                    ))}
                  </ul>
                </>
              )}
              {day.market.length > 0 && (
                <>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{m.week.market}</p>
                  <ul className="mt-2 space-y-2">
                    {day.market.map((e) => (
                      <EventLine key={e.id} event={e} mine={false} m={m} />
                    ))}
                  </ul>
                </>
              )}
              {empty && <p className="mt-5 text-[14px] text-ink-600">{m.week.nothing}</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
