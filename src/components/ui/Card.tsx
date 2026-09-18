import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background",
        className
      )}
      {...props}
    />
  );
}

export function CardLink({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background transition-colors duration-150 hover:border-border-strong hover:bg-surface/60 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-4", className)}>
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[17px] font-semibold text-ink-950 tracking-tight">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
