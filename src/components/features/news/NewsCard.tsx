import Link from "next/link";
import type { NewsArticle } from "@/lib/types";
import { CardLink } from "@/components/ui/Card";
import { CategoryTag, AssetTag } from "@/components/ui/Tag";
import { ImpactScore } from "@/components/ui/ImpactScore";
import { formatRelativeTime } from "@/lib/format";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.slug}`} className="block">
      <CardLink className="p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] text-ink-400">
          <CategoryTag category={article.category} />
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>{formatRelativeTime(article.publishedAt)}</time>
        </div>

        <h3 className="mt-2.5 text-[15px] font-semibold leading-snug text-ink-950">
          {article.title}
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{article.summary}</p>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {article.affectedAssets.slice(0, 4).map((ticker) => (
              <AssetTag key={ticker} ticker={ticker} />
            ))}
          </div>
          <ImpactScore score={article.impactScore} size="sm" />
        </div>
      </CardLink>
    </Link>
  );
}
