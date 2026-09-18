"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/cn";

export function AddAlertButton({ className, compact }: { className?: string; compact?: boolean }) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive((v) => !v);
      }}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "border-accent-soft bg-accent-soft text-accent-ink"
          : "border-border text-ink-600 hover:bg-surface",
        className
      )}
    >
      {active ? (
        <BellRing className="h-3.5 w-3.5" strokeWidth={2} />
      ) : (
        <Bell className="h-3.5 w-3.5" strokeWidth={2} />
      )}
      {!compact && (active ? "Alert set" : "Add Alert")}
    </button>
  );
}
