"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, LogOut, User } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

const CURRENT_USER = { name: "Felix Gauthier", email: "felixgauthier995@gmail.com" };

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex items-center rounded-full"
      >
        <Avatar name={CURRENT_USER.name} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-[13px] font-medium text-ink-950">{CURRENT_USER.name}</p>
            <p className="truncate text-[12px] text-ink-400">{CURRENT_USER.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-ink-600 hover:bg-surface hover:text-ink-950"
              onClick={() => setOpen(false)}
            >
              <User className="h-3.5 w-3.5" strokeWidth={2} />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-ink-600 hover:bg-surface hover:text-ink-950"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={2} />
              Settings
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-ink-600 hover:bg-surface hover:text-ink-950"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
