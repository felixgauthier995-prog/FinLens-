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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/finlens-icon.png"
        alt="FinLens"
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-md"
      />
      {!iconOnly && (
        <span className="font-serif text-[17px] font-semibold tracking-tight text-ink-950">
          FinLens
        </span>
      )}
    </div>
  );
}
