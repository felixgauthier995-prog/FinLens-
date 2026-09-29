"use client";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!db) {
      setState("error");
      setError("Account service is not configured.");
      return;
    }
    setState("sending");
    const { error } = await db.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState("error");
      setError(error.message);
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-8 rounded-xl border border-border p-5">
        <MailCheck className="h-6 w-6 text-accent" strokeWidth={2} aria-hidden="true" />
        <p className="mt-3 text-[15px] font-semibold text-ink-950">Check your email</p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-600">
          We sent a sign-in link to <span className="font-medium text-ink-950">{email}</span>. Open
          it on this device to continue.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 text-[13px] font-medium text-accent-ink hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-3">
      <label htmlFor="email" className="block text-[13px] font-medium text-ink-800">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-12 w-full rounded-xl border border-border-strong px-4 text-[15px] text-ink-950 outline-none placeholder:text-ink-300 focus:border-accent"
      />
      <button
        disabled={state === "sending"}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:bg-ink-300"
      >
        {state === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-[13px] text-negative">
          {error}
        </p>
      )}
    </form>
  );
}
