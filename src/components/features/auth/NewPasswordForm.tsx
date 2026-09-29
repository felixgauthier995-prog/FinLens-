"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/client";

const MIN_PASSWORD = 8;

export function NewPasswordForm() {
  const { m } = useI18n();
  const t = m.auth;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD) return setError(t.errTooShort(MIN_PASSWORD));
    if (password !== confirm) return setError(t.errMismatch);
    if (!db) return setError(t.notConfigured);
    setBusy(true);
    const { error } = await db.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(
        /same|different/i.test(error.message)
          ? t.errSame
          : /weak|short|characters/i.test(error.message)
            ? t.errWeak(MIN_PASSWORD)
            : error.message
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 rounded-xl border border-border p-5">
        <p className="text-[15px] font-semibold text-ink-950">{t.passwordSaved}</p>
        <p className="mt-1 text-[14px] text-ink-600">{t.passwordSavedText}</p>
        <Link
          href="/"
          className="mt-4 flex h-11 items-center justify-center rounded-xl bg-ink-950 text-[14px] font-semibold text-white hover:bg-ink-800"
        >
          {m.common.continue}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-[13px] font-medium text-ink-800">
          {t.newPassword}
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-border-strong px-4 text-[15px] text-ink-950 outline-none focus:border-accent"
        />
        <p className="mt-1.5 text-[12px] text-ink-400">{t.minChars(MIN_PASSWORD)}</p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-[13px] font-medium text-ink-800">
          {t.confirmNewPassword}
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-border-strong px-4 text-[15px] text-ink-950 outline-none focus:border-accent"
        />
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-negative">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:bg-ink-300"
      >
        {busy ? m.common.saving : t.savePassword}
      </button>
    </form>
  );
}
