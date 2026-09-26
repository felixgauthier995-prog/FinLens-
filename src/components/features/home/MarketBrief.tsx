import Link from "next/link";
import { getArticlesSorted } from "@/lib/data/news";
export async function MarketBrief() {
  const articles = (await getArticlesSorted())
    .filter(
      (a) => new Date().getTime() - Date.parse(a.publishedAt) < 48 * 3600000,
    )
    .slice(0, 3);
  return (
    <section className="rounded-xl border border-border bg-surface/60 p-5">
      <h2 className="text-sm font-semibold">Market Brief</h2>
      <p className="mt-1 text-xs text-ink-400">
        Compiled {new Date().toISOString()} · coverage from the last 48 hours
      </p>
      {articles.length ? (
        <ul className="mt-3 space-y-3">
          {articles.map((a) => (
            <li key={a.id}>
              <Link
                href={`/news/${a.slug}`}
                className="font-medium hover:underline"
              >
                {a.title}
              </Link>
              <p className="mt-1 text-sm text-ink-600">{a.summary}</p>
              <p className="text-xs text-ink-400">
                {a.source} · {a.publishedAt}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm">
          No recent verified coverage is available. Please check back later.
        </p>
      )}
    </section>
  );
}
