import { cn } from "@/lib/cn";

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[12px] font-semibold text-white",
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
