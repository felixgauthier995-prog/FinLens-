import Link from "next/link";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/data/categories";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

export function CategoryChips({
  basePath,
  activeCategory,
  extraParams,
}: {
  basePath: string;
  activeCategory?: Category;
  /** Additional query params to preserve when switching category (e.g. sort, view). */
  extraParams?: Record<string, string | undefined>;
}) {
  function hrefFor(category: Category | "all") {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        if (value) params.set(key, value);
      }
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={hrefFor("all")}
        className={cn(
          "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
          !activeCategory
            ? "border-ink-950 bg-ink-950 text-white"
            : "border-border text-ink-600 hover:bg-surface"
        )}
      >
        All
      </Link>
      {CATEGORY_ORDER.map((category) => (
        <Link
          key={category}
          href={hrefFor(category)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            activeCategory === category
              ? "border-ink-950 bg-ink-950 text-white"
              : "border-border text-ink-600 hover:bg-surface"
          )}
        >
          {CATEGORY_LABEL[category]}
        </Link>
      ))}
    </div>
  );
}
