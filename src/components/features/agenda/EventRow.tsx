"use client";

import Link from "next/link";
import type { MarketEvent } from "@/lib/types";
import { CardLink } from "@/components/ui/Card";
import { CategoryTag, AssetTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { AddAlertButton } from "@/components/features/agenda/AddAlertButton";
import { useI18n } from "@/i18n/client";
import { formatEventDay, formatEventTime } from "@/lib/format";

export function EventRow({ event }: { event: MarketEvent }) {
  const { locale, m } = useI18n();
  const completed = event.status === "completed";

  return (
    <Link href={`/agenda/${event.slug}`} className="block">
      <CardLink className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
            <span className="font-data font-semibold text-ink-950">
              {formatEventDay(event.scheduledAt, locale)} · {event.timeConfirmed === false ? m.agenda.timeUnconfirmed : formatEventTime(event.scheduledAt, locale)}
            </span>
            <CategoryTag category={event.category} />
            <span className="rounded-full border border-border px-2 py-0.5 font-medium text-ink-600">
              {m.eventTypes[event.eventType]}
            </span>
            {completed && (
              <span className="rounded-full bg-surface px-2 py-0.5 font-medium text-ink-400">
                {m.agenda.completed}
              </span>
            )}
          </div>
          <ImpactScore score={event.impactScore} size="sm" className="shrink-0" />
        </div>

        <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-ink-950">
          {event.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-600">
          {event.whyItMatters}
        </p>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {event.affectedAssets.slice(0, 5).map((ticker) => (
              <AssetTag key={ticker} ticker={ticker} />
            ))}
          </div>
          {!completed && event.timeConfirmed !== false && <AddAlertButton eventSlug={event.slug} eventTitle={event.title} scheduledAt={event.scheduledAt} compact />}
        </div>
      </CardLink>
    </Link>
  );
}
