"use client";

import Link from "next/link";
import type { NewsArticle } from "@/lib/types";
import { CardLink } from "@/components/ui/Card";
import { CategoryTag, AssetTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { formatRelativeTime } from "@/lib/format";
import { SignalChips } from "@/components/features/news/SignalList";
import { useI18n } from "@/i18n/client";
import {
  NO_PREFERENCES,
  relevanceReason,
  signalsForUser,
  type UserPreferences,
} from "@/lib/personalization";

export function NewsCard({
  article,
  prefs = NO_PREFERENCES,
}: {
  article: NewsArticle;
  prefs?: UserPreferences;
}) {
  const { locale, m } = useI18n();
  const reason = relevanceReason(article, prefs);
  const signals = article.signals ? signalsForUser(article.signals, prefs) : [];
  const text =
    prefs.experience === "beginner" && article.plainExplanation
      ? article.plainExplanation
      : article.summary;

  return (
    <Link href={`/news/${article.slug}`} className="block">
      <CardLink className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
          {reason && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-ink">
              {reason.kind === "stock" ? m.news.yourStock(reason.ticker) : m.news.yourInterest(m.categories[reason.category])}
            </span>
          )}
          <CategoryTag category={article.category} />
          <span aria-hidden="true">·</span>
          <span>{article.source}</span>
          <span aria-hidden="true">·</span>
          <time title={article.publishedAt} dateTime={article.publishedAt}>
            {formatRelativeTime(article.publishedAt, locale)}
          </time>
        </div>

        <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-ink-950">
          {article.title}
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{text}</p>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          {signals.length ? (
            <SignalChips signals={signals} />
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {article.affectedAssets.slice(0, 4).map((ticker) => (
                <AssetTag key={ticker} ticker={ticker} />
              ))}
            </div>
          )}
          <ImpactScore score={article.impactScore} size="sm" />
        </div>
      </CardLink>
    </Link>
  );
}
