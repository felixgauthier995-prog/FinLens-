import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock, ExternalLink } from "lucide-react";
import { getArticle } from "@/lib/data/news";
import { getEvent } from "@/lib/data/events";
import { getAssets } from "@/lib/data/assets";
import { CategoryTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { PriceChange } from "@/components/ui/PriceChange";
import { ImpactDirectionBadge } from "@/components/features/news/ImpactDirection";
import { ArticleSection } from "@/components/features/news/ArticleSection";
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

  const assets = getAssets(article.affectedAssets);
  const relatedEvent = article.relatedEventSlug ? await getEvent(article.relatedEventSlug) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to News
      </Link>

      <div className="flex items-center gap-2 text-[12px] text-ink-400">
        <CategoryTag category={article.category} />
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt} title={formatFullDate(article.publishedAt)}>
          {formatRelativeTime(article.publishedAt)}
        </time>
      </div>

      <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-ink-950 sm:text-[28px]">
        {article.title}
      </h1>
      <p className="mt-3 text-[15.5px] leading-relaxed text-ink-600">{article.summary}</p>

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
            This follows a scheduled event: <span className="font-medium text-ink-950">{relatedEvent.title}</span>
          </span>
        </Link>
      )}

      <div className="mt-2">
        <ArticleSection eyebrow="Facts" title="What happened">
          <p>{article.whatHappened}</p>
        </ArticleSection>

        <ArticleSection eyebrow="Analysis" title="Why it matters">
          <p>{article.whyItMatters}</p>
        </ArticleSection>

        <ArticleSection eyebrow="Analysis" title="Market impact">
          <p>{article.marketImpact}</p>
          <p className="mt-3 text-[12.5px] italic text-ink-400">
            This is analysis, not a guarantee — markets can move in unexpected ways.
          </p>
        </ArticleSection>

        <section className="border-t border-border py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Data</p>
          <h2 className="mt-1.5 text-[16px] font-semibold text-ink-950">Assets affected</h2>
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

        <ArticleSection eyebrow="Outlook" title="What to watch next">
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
            Sources
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
