import { cn } from "@/lib/cn";
import type { WatchlistItem } from "@/lib/types";

const CONFIG: Record<WatchlistItem["attentionLevel"], { label: string; dot: string; text: string }> = {
  normal: { label: "Normal attention", dot: "bg-ink-300", text: "text-ink-400" },
  elevated: { label: "Elevated attention", dot: "bg-amber-500", text: "text-amber-700" },
  high: { label: "High attention", dot: "bg-red-600", text: "text-red-700" },
};

export function AttentionBadge({ level }: { level: WatchlistItem["attentionLevel"] }) {
  const { label, dot, text } = CONFIG[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11.5px] font-medium", text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
