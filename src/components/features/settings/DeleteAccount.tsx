"use client";
import { useState } from "react";
import { useI18n } from "@/i18n/client";

export function DeleteAccount() {
  const { m } = useI18n();
  const t = m.settings;
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    if (res.ok) {
      window.location.replace("/welcome");
      return;
    }
    setBusy(false);
    setError(t.errDelete);
  }

  return (
    <section className="mb-6 rounded-xl border border-negative/30 p-5">
      <h2 className="font-semibold text-ink-950">{t.deleteTitle}</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-600">{t.deleteText}</p>
      <label className="mt-4 block text-[13px] font-medium text-ink-800" htmlFor="delete-confirm">
        {t.deleteConfirmLabel(t.deleteWord)}
      </label>
      <div className="mt-1.5 flex flex-wrap gap-3">
        <input
          id="delete-confirm"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="h-10 w-48 rounded-md border border-border-strong px-3 text-[14px] outline-none focus:border-negative"
        />
        <button
          onClick={remove}
          disabled={busy || typed.trim().toUpperCase() !== t.deleteWord}
          className="rounded-md bg-negative px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          {busy ? t.deleting : t.deleteButton}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-negative">
          {error}
        </p>
      )}
    </section>
  );
}
