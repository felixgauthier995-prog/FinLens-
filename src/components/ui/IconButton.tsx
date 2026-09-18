import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-surface hover:text-ink-950",
          active && "bg-surface text-ink-950",
          className
        )}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
