import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/data/categories";

export function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-ink-600",
        className
      )}
      {...props}
    />
  );
}

export function CategoryTag({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return <Tag className={className}>{CATEGORY_LABEL[category]}</Tag>;
}

export function AssetTag({ ticker, className }: { ticker: string; className?: string }) {
  return (
    <span
      className={cn(
        "font-data inline-flex items-center rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-ink-800",
        className
      )}
    >
      {ticker}
    </span>
  );
}
