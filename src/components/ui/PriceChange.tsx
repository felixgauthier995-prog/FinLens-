import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

export function PriceChange({
  changePercent,
  size = "md",
  className,
}: {
  changePercent: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const isUp = changePercent > 0;
  const isFlat = changePercent === 0;
  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "font-data inline-flex items-center gap-0.5 font-medium",
        isFlat ? "text-ink-400" : isUp ? "text-positive" : "text-negative",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.25} />
      {formatPercent(changePercent)}
    </span>
  );
}
