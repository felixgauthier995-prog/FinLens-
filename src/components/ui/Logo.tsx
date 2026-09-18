import { Aperture } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink-950">
        <Aperture className="h-4 w-4 text-white" strokeWidth={2} />
      </div>
      {!iconOnly && (
        <span className="text-[15px] font-semibold tracking-tight text-ink-950">
          FinLens
        </span>
      )}
    </div>
  );
}
