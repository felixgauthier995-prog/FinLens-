"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";

// Display prices. The amount actually charged is whatever the Stripe price
// IDs are set to — keep these in sync when you change prices in Stripe.
const PLANS = [
  { id: "yearly", label: "Yearly", price: "$59.99", per: "/year", note: "$5.00/month · save 37%" },
  { id: "monthly", label: "Monthly", price: "$7.99", per: "/month", note: "Billed monthly" },
] as const;

export function PlanPicker({ trialAvailable }: { trialAvailable: boolean }) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Couldn't start checkout.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-auto pt-8">
      <div className="space-y-2.5" role="radiogroup" aria-label="Plan">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={plan === p.id}
            onClick={() => setPlan(p.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors",
              plan === p.id ? "border-ink-950 bg-surface" : "border-border hover:bg-surface"
            )}
          >
            <span>
              <span className="block text-[15px] font-semibold text-ink-950">{p.label}</span>
              <span className="text-[12.5px] text-ink-600">{p.note}</span>
            </span>
            <span className="text-right">
              <span className="font-data text-[17px] font-semibold text-ink-950">{p.price}</span>
              <span className="text-[12px] text-ink-400">{p.per}</span>
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:bg-ink-300"
      >
        {loading ? "Opening secure checkout…" : trialAvailable ? "Start free trial" : "Subscribe"}
      </button>
      <p className="mt-3 text-center text-[11.5px] leading-relaxed text-ink-400">
        Secure payment by Stripe. Prices in USD. Cancel anytime from Settings.
        {trialAvailable && " You'll get a reminder before your trial ends."}
      </p>
    </div>
  );
}
