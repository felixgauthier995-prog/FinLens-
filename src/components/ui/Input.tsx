import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(
              "h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-ink-950 placeholder:text-ink-400 outline-none transition-colors focus:border-accent",
              className
            )}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-ink-950 placeholder:text-ink-400 outline-none transition-colors focus:border-accent",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
