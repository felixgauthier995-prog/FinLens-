import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Newspaper, History } from "lucide-react";
import { getEvent } from "@/lib/data/events";
import { getArticle } from "@/lib/data/news";
import { getAssets } from "@/lib/data/assets";
import { CategoryTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { PriceChange } from "@/components/ui/PriceChange";
import { ArticleSection } from "@/components/features/news/ArticleSection";
import { ImpactDirectionBadge } from "@/components/features/news/ImpactDirection";
import { AddAlertButton } from "@/components/features/agenda/AddAlertButton";
import { EVENT_TYPE_LABEL } from "@/lib/data/categories";
import { formatEventDay, formatEventTime, formatFullDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

// Rendered on demand (not pre-built) so events published in the Sanity
// Studio show up immediately without a redeploy.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return { title: `${event.title} — FinLens`, description: event.description };
}

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const assets = getAssets(event.affectedAssets);
  const [relatedArticle, previousEvent] = await Promise.all([
    event.relatedArticleSlug ? getArticle(event.relatedArticleSlug) : Promise.resolve(undefined),
    event.previousRelatedEventSlug
      ? getEvent(event.previousRelatedEventSlug)
      : Promise.resolve(undefined),
  ]);
  const completed = event.status === "completed";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/agenda"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to Agenda
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-400">
        <CategoryTag category={event.category} />
        <span className="rounded-full border border-border px-2 py-0.5 font-medium text-ink-600">
          {EVENT_TYPE_LABEL[event.eventType]}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium",
            completed ? "bg-surface text-ink-400" : "bg-accent-soft text-accent-ink"
          )}
        >
          {completed ? "Completed" : "Upcoming"}
        </span>
      </div>

      <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-ink-950 sm:text-[28px]">
        {event.title}
      </h1>

      <p
        className="mt-2 font-data text-[14px] font-medium text-ink-600"
        title={formatFullDate(event.scheduledAt)}
      >
        {formatEventDay(event.scheduledAt)} · {formatEventTime(event.scheduledAt)}
      </p>

      <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{event.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ImpactScore score={event.impactScore} />
        {!completed && <AddAlertButton />}
      </div>

      {completed && relatedArticle && (
        <Link
          href={`/news/${relatedArticle.slug}`}
          className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
        >
          <Newspaper className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2} />
          <span className="flex-1 text-[13px] text-ink-600">
            <span className="font-medium text-ink-950">What actually happened:</span>{" "}
            {relatedArticle.title}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
        </Link>
      )}

      {previousEvent && (
        <Link
          href={`/agenda/${previousEvent.slug}`}
          className="mt-3 flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-surface"
        >
          <History className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2} />
          <span className="flex-1 text-[13px] text-ink-600">
            <span className="font-medium text-ink-950">Previous occurrence:</span>{" "}
            {previousEvent.title}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
        </Link>
      )}

      <div className="mt-2">
        <ArticleSection eyebrow="Consensus" title="Expectations">
          <p>{event.expectations}</p>
        </ArticleSection>

        <ArticleSection eyebrow="Analysis" title="Why it matters">
          <p>{event.whyItMatters}</p>
        </ArticleSection>

        <section className="border-t border-border py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Scenarios
          </p>
          <h2 className="mt-1.5 text-[16px] font-semibold text-ink-950">Possible scenarios</h2>
          <p className="mt-1 text-[12.5px] italic text-ink-400">
            Not predictions — a range of outcomes FinLens is watching for.
          </p>
          <div className="mt-3 space-y-2.5">
            {event.possibleScenarios.map((scenario) => (
              <div key={scenario.label} className="rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13.5px] font-semibold text-ink-950">{scenario.label}</p>
                  <ImpactDirectionBadge direction={scenario.direction} />
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">
                  {scenario.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Data</p>
          <h2 className="mt-1.5 text-[16px] font-semibold text-ink-950">Assets to watch</h2>
          <div className="mt-3 divide-y divide-border rounded-lg border border-border">
            {assets.map((asset) => (
              <Link
                key={asset.ticker}
                href={`/watchlist?focus=${asset.ticker}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface"
              >
                <div>
                  <p className="font-data text-[13.5px] font-semibold text-ink-950">
                    {asset.ticker}
                  </p>
                  <p className="text-[12px] text-ink-400">{asset.name}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="font-data text-[13.5px] font-medium text-ink-950">
                    {formatPrice(asset.price)}
                  </p>
                  <PriceChange changePercent={asset.changePercent} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {!completed && (
          <section className="border-t border-border py-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Stay ahead of it
            </p>
            <h2 className="mt-1.5 text-[16px] font-semibold text-ink-950">Alerts</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">
              Get notified before this event so you have time to review your positions.
            </p>
            <div className="mt-3">
              <AddAlertButton />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
