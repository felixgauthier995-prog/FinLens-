"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ASSETS } from "@/lib/data/assets";
import { Input } from "@/components/ui/Input";

export function AddAssetControl({
  excludeTickers,
  onAdd,
}: {
  excludeTickers: string[];
  onAdd: (ticker: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSETS.filter((a) => !excludeTickers.includes(a.ticker))
      .filter((a) => !q || a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, excludeTickers]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md bg-ink-950 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-ink-800"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Add to watchlist
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            <div className="p-2">
              <Input
                icon={<Search className="h-3.5 w-3.5" />}
                placeholder="Search stocks, ETFs, crypto…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto border-t border-border p-1">
              {results.length === 0 && (
                <p className="px-3 py-4 text-center text-[12.5px] text-ink-400">No matches.</p>
              )}
              {results.map((asset) => (
                <button
                  key={asset.ticker}
                  type="button"
                  onClick={() => {
                    onAdd(asset.ticker);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] hover:bg-surface"
                >
                  <span>
                    <span className="font-data font-semibold text-ink-950">{asset.ticker}</span>{" "}
                    <span className="text-ink-400">{asset.name}</span>
                  </span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
