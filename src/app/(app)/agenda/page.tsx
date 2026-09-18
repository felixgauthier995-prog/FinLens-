import Link from "next/link";
import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { CategoryChips } from "@/components/features/shared/CategoryChips";
import { EventRow } from "@/components/features/agenda/EventRow";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getTodayEvents,
  getThisWeekEvents,
  getUpcomingEvents,
  getEventsSorted,
} from "@/lib/data/events";
import { CATEGORY_ORDER } from "@/lib/data/categories";
import type { Category, MarketEvent } from "@/lib/types";
import { formatEventDay } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Agenda — FinLens",
};

const VIEWS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "calendar", label: "Calendar" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function isCategory(value: string | undefined): value is Category {
  return !!value && (CATEGORY_ORDER as string[]).includes(value);
}

function groupByDay(events: MarketEvent[]): { label: string; events: MarketEvent[] }[] {
  const groups: { label: string; events: MarketEvent[] }[] = [];
  for (const event of events) {
    const label = formatEventDay(event.scheduledAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(event);
    } else {
      groups.push({ label, events: [event] });
    }
  }
  return groups;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; category?: string }>;
}) {
  const params = await searchParams;
  const view: ViewKey = params.view === "today" || params.view === "calendar" ? params.view : "week";
  const activeCategory = isCategory(params.category) ? params.category : undefined;

  let events: MarketEvent[];
  if (view === "today") {
    events = await getTodayEvents();
  } else if (view === "calendar") {
    const [sorted, upcoming] = await Promise.all([getEventsSorted(), getUpcomingEvents()]);
    events = [...sorted.filter((e) => e.status === "completed"), ...upcoming];
  } else {
    events = await getThisWeekEvents();
  }

  if (activeCategory) {
    events = events.filter((e) => e.category === activeCategory);
  }

  const groups = groupByDay(events);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">
          Agenda
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-400">What could move the market next.</p>
      </div>

      <div className="mb-5 flex items-center gap-1 rounded-md border border-border p-0.5 w-fit">
        {VIEWS.map((v) => {
          const params2 = new URLSearchParams();
          if (v.key !== "week") params2.set("view", v.key);
          if (activeCategory) params2.set("category", activeCategory);
          const qs = params2.toString();
          return (
            <Link
              key={v.key}
              href={qs ? `/agenda?${qs}` : "/agenda"}
              className={cn(
                "rounded px-3 py-1.5 text-[13px] font-medium transition-colors",
                view === v.key ? "bg-surface text-ink-950" : "text-ink-400 hover:text-ink-600"
              )}
            >
              {v.label}
            </Link>
          );
        })}
      </div>

      <div className="mb-5">
        <CategoryChips
          basePath="/agenda"
          activeCategory={activeCategory}
          extraParams={{ view: view !== "week" ? view : undefined }}
        />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-5 w-5" strokeWidth={2} />}
          title={
            view === "today" ? "No scheduled events remaining today" : "No events in this window"
          }
          description="Try a different view or clear the category filter."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {group.label}
              </p>
              <div className="space-y-3">
                {group.events.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
