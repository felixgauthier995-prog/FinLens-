"use client";
import { useState } from "react";
import Link from "next/link";

export interface AccountSummary {
  email: string;
  status: string | null;
  planInterval: string | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : null;
}

function planLine(a: AccountSummary): string {
  const plan = a.planInterval === "year" ? "Yearly plan" : a.planInterval === "month" ? "Monthly plan" : "Plan";
  if (a.status === "trialing") return `Free trial · ends ${formatDate(a.trialEnd) ?? "soon"}`;
  if (a.cancelAtPeriodEnd) return `${plan} · ends ${formatDate(a.currentPeriodEnd)}`;
  if (a.status === "past_due") return `${plan} · payment issue, please update your card`;
  return `${plan} · renews ${formatDate(a.currentPeriodEnd) ?? ""}`;
}

export function AccountPanel({ account }: { account: AccountSummary }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function openBilling() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Couldn't open billing.");
      window.location.href = data.url;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't open billing.");
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-border p-5">
      <h2 className="font-semibold text-ink-950">Your account</h2>
      <p className="mt-2 text-[14px] text-ink-800">{account.email}</p>
      <p className="mt-1 text-[13px] text-ink-600">{planLine(account)}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={openBilling}
          disabled={busy}
          className="rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-ink-950 hover:bg-surface disabled:text-ink-300"
        >
          {busy ? "Opening…" : "Manage subscription"}
        </button>
        <Link
          href="/reset-password"
          className="rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-ink-950 hover:bg-surface"
        >
          Change password
        </Link>
        <form action="/auth/signout" method="post">
          <button className="rounded-md px-3.5 py-2 text-[13px] font-medium text-ink-600 hover:bg-surface hover:text-ink-950">
            Sign out
          </button>
        </form>
      </div>
      <p role="status" className="mt-2 text-[13px] text-negative">
        {message}
      </p>
    </section>
  );
}
