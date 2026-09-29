"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { intlLocale, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

export interface AccountSummary {
  email: string;
  status: string | null;
  planInterval: string | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

function planLine(a: AccountSummary, t: Messages["settings"], locale: Locale): string {
  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(intlLocale(locale), { dateStyle: "medium" }) : "";
  const plan = a.planInterval === "year" ? t.yearlyPlan : a.planInterval === "month" ? t.monthlyPlan : t.plan;
  if (a.status === "trialing") return t.trial(date(a.trialEnd));
  if (a.cancelAtPeriodEnd) return t.ends(plan, date(a.currentPeriodEnd));
  if (a.status === "past_due") return t.pastDue(plan);
  return t.renews(plan, date(a.currentPeriodEnd));
}

export function AccountPanel({ account }: { account: AccountSummary }) {
  const { locale, m } = useI18n();
  const t = m.settings;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function openBilling() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || t.errBilling);
      window.location.href = data.url;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t.errBilling);
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-border p-5">
      <h2 className="font-semibold text-ink-950">{t.yourAccount}</h2>
      <p className="mt-2 text-[14px] text-ink-800">{account.email}</p>
      <p className="mt-1 text-[13px] text-ink-600">{planLine(account, t, locale)}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={openBilling}
          disabled={busy}
          className="rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-ink-950 hover:bg-surface disabled:text-ink-300"
        >
          {busy ? t.opening : t.manageSub}
        </button>
        <Link
          href="/reset-password"
          className="rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-ink-950 hover:bg-surface"
        >
          {t.changePassword}
        </Link>
        <form action="/auth/signout" method="post">
          <button className="rounded-md px-3.5 py-2 text-[13px] font-medium text-ink-600 hover:bg-surface hover:text-ink-950">
            {m.common.signOut}
          </button>
        </form>
      </div>
      <p role="status" className="mt-2 text-[13px] text-negative">
        {message}
      </p>
    </section>
  );
}
