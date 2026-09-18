import Link from "next/link";
import type { MarketEvent } from "@/lib/types";
import { CardLink } from "@/components/ui/Card";
import { CategoryTag, AssetTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { AddAlertButton } from "@/components/features/agenda/AddAlertButton";
import { EVENT_TYPE_LABEL } from "@/lib/data/categories";
import { formatEventDay, formatEventTime } from "@/lib/format";

export function EventRow({ event }: { event: MarketEvent }) {
  const completed = event.status === "completed";

  return (
    <Link href={`/agenda/${event.slug}`} className="block">
      <CardLink className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
            <span className="font-data font-semibold text-ink-950">
              {formatEventDay(event.scheduledAt)} · {formatEventTime(event.scheduledAt)}
            </span>
            <CategoryTag category={event.category} />
            <span className="rounded-full border border-border px-2 py-0.5 font-medium text-ink-600">
              {EVENT_TYPE_LABEL[event.eventType]}
            </span>
            {completed && (
              <span className="rounded-full bg-surface px-2 py-0.5 font-medium text-ink-400">
                Completed
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
          {!completed && <AddAlertButton compact />}
        </div>
      </CardLink>
    </Link>
  );
}
