import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock, ExternalLink } from "lucide-react";
import { getArticleForReader as getArticle } from "@/lib/data/reader";
import { getMessages, getLocale } from "@/i18n/server";
import { getEvent } from "@/lib/data/events";
import { getAssets } from "@/lib/data/assets";
import { CategoryTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { PriceChange } from "@/components/ui/PriceChange";
import { ImpactDirectionBadge } from "@/components/features/news/ImpactDirection";
import { ArticleSection } from "@/components/features/news/ArticleSection";
import { SignalList } from "@/components/features/news/SignalList";
import { getSignalTrackRecord } from "@/lib/data/signals";
import { getUserPreferences } from "@/lib/data/preferences";
import { signalsForUser, showsIndirectSignals } from "@/lib/personalization";
import { Lightbulb } from "lucide-react";
import { formatFullDate, formatRelativeTime, formatPrice } from "@/lib/format";

// Rendered on demand (not pre-built) so articles published in the Sanity
// Studio show up immediately without a redeploy.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} — FinLens`,
    description: article.summary,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const assets = await getAssets(article.affectedAssets);
  const relatedEvent = article.relatedEventSlug ? await getEvent(article.relatedEventSlug) : undefined;
  const [prefs, m, locale] = await Promise.all([getUserPreferences(), getMessages(), getLocale()]);
  const visibleSignals = article.signals ? signalsForUser(article.signals, prefs) : [];
  const hiddenIndirect = (article.signals?.length ?? 0) - visibleSignals.length;
  const trackRecord = visibleSignals.length ? await getSignalTrackRecord() : undefined;
  const showPlain =
    !!article.plainExplanation && (prefs.experience === "beginner" || prefs.experience === "intermediate");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        {m.news.backToNews}
      </Link>

      <div className="flex items-center gap-2 text-[12px] text-ink-400">
        <CategoryTag category={article.category} />
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt} title={formatFullDate(article.publishedAt, locale)}>
          {formatRelativeTime(article.publishedAt, locale)}
        </time>
      </div>

      <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-ink-950 sm:text-[28px]">
        {article.title}
      </h1>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-600">{article.summary}</p>
      {article.translated && <p className="mt-2 text-[12px] italic text-ink-400">{m.news.translatedNote}</p>}

      {showPlain && (
        <div className="mt-5 flex gap-3 rounded-xl bg-accent-soft p-4">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" strokeWidth={2} aria-hidden="true" />
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-accent-ink">{m.news.plainWords}</p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-ink-800">{article.plainExplanation}</p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ImpactScore score={article.impactScore} />
        <ImpactDirectionBadge direction={article.impactDirection} />
      </div>

      {relatedEvent && (
        <Link
          href={`/agenda/${relatedEvent.slug}`}
          className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
        >
          <CalendarClock className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2} />
          <span className="text-[13px] text-ink-600">
            {m.news.followsEvent} <span className="font-medium text-ink-950">{relatedEvent.title}</span>
          </span>
        </Link>
      )}

      <div className="mt-2">
        <ArticleSection eyebrow={m.news.facts} title={m.news.whatHappened}>
          <p>{article.whatHappened}</p>
        </ArticleSection>

        <ArticleSection eyebrow={m.news.analysis} title={m.news.whyItMatters}>
          <p>{article.whyItMatters}</p>
        </ArticleSection>

        {visibleSignals.length > 0 && (
          <ArticleSection eyebrow={m.news.signalsEyebrow} title={m.news.whoAffected}>
            <SignalList signals={visibleSignals} trackRecord={trackRecord} />
            {hiddenIndirect > 0 && !showsIndirectSignals(prefs) && (
              <p className="mt-2 text-[12px] text-ink-400">
                {m.news.hiddenLeads(hiddenIndirect)}
              </p>
            )}
          </ArticleSection>
        )}

        <ArticleSection eyebrow={m.news.analysis} title={m.news.marketImpact}>
          <p>{article.marketImpact}</p>
          <p className="mt-3 text-[12.5px] italic text-ink-400">
            {m.news.analysisNotGuarantee}
          </p>
        </ArticleSection>

        {article.priceReaction && article.priceReaction.length > 0 && (
          <ArticleSection eyebrow={m.news.marketData} title={m.news.reaction}>
            <div className="space-y-3">
              {article.priceReaction.map((reaction) => (
                <div
                  key={reaction.ticker}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-data text-[13.5px] font-semibold text-ink-950">
                      {reaction.ticker}
                    </p>
                    <p className="text-[11px] text-ink-400">
                      {m.news.since(formatFullDate(reaction.capturedAt, locale))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {reaction.currentDataStatus === "unavailable" ||
                    reaction.changeSincePercent === null ? (
                      <span className="text-[13px] text-ink-400">{m.news.noQuote}</span>
                    ) : (
                      <PriceChange changePercent={reaction.changeSincePercent} />
                    )}
                    <span className="text-[11px] text-ink-400">{m.news.vs} {reaction.indexTicker}</span>
                    {reaction.indexChangeSincePercent === null ? (
                      <span className="text-[13px] text-ink-400">—</span>
                    ) : (
                      <PriceChange changePercent={reaction.indexChangeSincePercent} size="sm" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12.5px] italic text-ink-400">
              {m.news.reactionNote}
            </p>
          </ArticleSection>
        )}

        <section className="border-t border-border py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{m.news.data}</p>
          <h2 className="mt-1.5 text-[16px] font-semibold text-ink-950">{m.news.assetsAffected}</h2>
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
                    {formatPrice(asset.price, "USD", locale)}<span className="block text-[10px] font-normal text-ink-400">{asset.dataStatus === "demo" ? m.news.demoQuote : asset.priceUpdatedAt ? m.news.storedQuote(asset.priceUpdatedAt) : m.news.noQuote}</span>
                  </p>
                  <PriceChange changePercent={asset.changePercent} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <ArticleSection eyebrow={m.news.outlook} title={m.news.watchNext}>
          <ul className="space-y-2.5">
            {article.whatToWatch.map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ArticleSection>

        <section className="border-t border-border py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            {m.news.sources}
          </p>
          <ul className="mt-2.5 space-y-1.5">
            <li>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent-ink hover:underline"
              >
                {article.source}
                <ExternalLink className="h-3 w-3" strokeWidth={2} />
              </a>
            </li>
            {article.additionalSources?.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent-ink hover:underline"
                >
                  {s.name}
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
