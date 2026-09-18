import { TrendingUp, TrendingDown, Shuffle, Eye } from "lucide-react";
import type { ImpactDirection as Direction } from "@/lib/types";
import { cn } from "@/lib/cn";

const CONFIG: Record<Direction, { label: string; icon: typeof TrendingUp; className: string }> = {
  positive: {
    label: "Potential positive impact",
    icon: TrendingUp,
    className: "text-positive bg-positive-soft",
  },
  negative: {
    label: "Potential negative impact",
    icon: TrendingDown,
    className: "text-negative bg-negative-soft",
  },
  mixed: {
    label: "Mixed impact",
    icon: Shuffle,
    className: "text-ink-600 bg-surface",
  },
  neutral: {
    label: "Worth monitoring",
    icon: Eye,
    className: "text-ink-600 bg-surface",
  },
};

export function ImpactDirectionBadge({ direction }: { direction: Direction }) {
  const { label, icon: Icon, className } = CONFIG[direction];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {label}
    </span>
  );
}
