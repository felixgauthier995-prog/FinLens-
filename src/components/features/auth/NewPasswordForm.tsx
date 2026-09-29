"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";

const MIN_PASSWORD = 8;

export function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError("The two passwords don't match.");
    if (!db) return setError("Account service is not configured.");
    setBusy(true);
    const { error } = await db.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(
        /same|different/i.test(error.message)
          ? "Choose a password different from your current one."
          : /weak|short|characters/i.test(error.message)
            ? `Choose a stronger password (at least ${MIN_PASSWORD} characters, mixing letters and numbers).`
            : error.message
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 rounded-xl border border-border p-5">
        <p className="text-[15px] font-semibold text-ink-950">Password saved</p>
        <p className="mt-1 text-[14px] text-ink-600">You can now sign in with your email and this password.</p>
        <Link
          href="/"
          className="mt-4 flex h-11 items-center justify-center rounded-xl bg-ink-950 text-[14px] font-semibold text-white hover:bg-ink-800"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-[13px] font-medium text-ink-800">
          New password
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
        <p className="mt-1.5 text-[12px] text-ink-400">At least {MIN_PASSWORD} characters.</p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-[13px] font-medium text-ink-800">
          Confirm new password
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
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
