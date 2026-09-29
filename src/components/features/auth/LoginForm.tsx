"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup" | "forgot" | "magic";

const MIN_PASSWORD = 8;

/** Supabase error messages → plain, non-revealing wording. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox for our link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account already exists for this email. Sign in instead, or reset your password.";
  if (m.includes("password") && (m.includes("weak") || m.includes("short") || m.includes("characters")))
    return `Choose a stronger password (at least ${MIN_PASSWORD} characters, mixing letters and numbers).`;
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  return message;
}

export function LoginForm({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<null | "confirm" | "reset" | "magic">(null);

  function switchTo(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirm("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!db) {
      setError("Account service is not configured.");
      return;
    }
    setError("");
    const cleanEmail = email.trim();

    if (mode === "signup") {
      if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
      if (password !== confirm) return setError("The two passwords don't match.");
    }

    setBusy(true);
    try {
      const callback = `${window.location.origin}/auth/callback`;
      if (mode === "signin") {
        const { error } = await db.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        router.replace("/");
        router.refresh();
        return;
      }
      if (mode === "signup") {
        const { data, error } = await db.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: callback },
        });
        if (error) throw error;
        // With email confirmation on, there's no session yet.
        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }
        setSent("confirm");
      } else if (mode === "forgot") {
        const { error } = await db.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${callback}?next=/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
      } else {
        const { error } = await db.auth.signInWithOtp({
          email: cleanEmail,
          options: { emailRedirectTo: callback, shouldCreateUser: false },
        });
        if (error) throw error;
        setSent("magic");
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    const copy = {
      confirm: {
        title: "Confirm your email",
        body: "We sent a confirmation link to",
        after: "Open it on this device to activate your account.",
      },
      reset: {
        title: "Check your email",
        body: "If an account exists for",
        after: "you'll receive a link to choose a new password.",
      },
      magic: {
        title: "Check your email",
        body: "If an account exists for",
        after: "you'll receive a sign-in link. Open it on this device.",
      },
    }[sent];
    return (
      <div className="mt-8 rounded-xl border border-border p-5">
        <MailCheck className="h-6 w-6 text-accent" strokeWidth={2} aria-hidden="true" />
        <p className="mt-3 text-[15px] font-semibold text-ink-950">{copy.title}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-600">
          {copy.body} <span className="font-medium text-ink-950">{email}</span>{sent === "confirm" ? "." : ","} {copy.after}
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(null);
            switchTo("signin");
          }}
          className="mt-4 text-[13px] font-medium text-accent-ink hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  const needsPassword = mode === "signin" || mode === "signup";
  const submitLabel = {
    signin: busy ? "Signing in…" : "Sign in",
    signup: busy ? "Creating account…" : "Create account",
    forgot: busy ? "Sending…" : "Send reset link",
    magic: busy ? "Sending…" : "Email me a sign-in link",
  }[mode];

  return (
    <div className="mt-8">
      {(mode === "signin" || mode === "signup") && (
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-surface p-1" role="tablist">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchTo(m)}
              className={cn(
                "h-9 rounded-lg text-[13.5px] font-semibold transition-colors",
                mode === m ? "bg-background text-ink-950 shadow-sm" : "text-ink-400 hover:text-ink-600"
              )}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      )}

      {mode === "forgot" && (
        <p className="mb-5 text-[14px] leading-relaxed text-ink-600">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>
      )}
      {mode === "magic" && (
        <p className="mb-5 text-[14px] leading-relaxed text-ink-600">
          We&apos;ll email you a one-time link to sign in without your password.
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
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
            className="mt-1.5 h-12 w-full rounded-xl border border-border-strong px-4 text-[15px] text-ink-950 outline-none placeholder:text-ink-300 focus:border-accent"
          />
        </div>

        {needsPassword && (
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[13px] font-medium text-ink-800">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => switchTo("forgot")}
                  className="text-[12.5px] font-medium text-accent-ink hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={mode === "signup" ? MIN_PASSWORD : undefined}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-border-strong pl-4 pr-12 text-[15px] text-ink-950 outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:text-ink-950"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="mt-1.5 text-[12px] text-ink-400">At least {MIN_PASSWORD} characters.</p>
            )}
          </div>
        )}

        {mode === "signup" && (
          <div>
            <label htmlFor="confirm" className="block text-[13px] font-medium text-ink-800">
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl border border-border-strong px-4 text-[15px] text-ink-950 outline-none focus:border-accent"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-[13px] text-negative">
            {error}
          </p>
        )}

        <button
          disabled={busy}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:bg-ink-300"
        >
          {submitLabel}
        </button>
      </form>

      <div className="mt-5 text-center text-[13px]">
        {mode === "signin" && (
          <button type="button" onClick={() => switchTo("magic")} className="font-medium text-ink-600 hover:text-ink-950">
            Email me a sign-in link instead
          </button>
        )}
        {(mode === "forgot" || mode === "magic") && (
          <button type="button" onClick={() => switchTo("signin")} className="font-medium text-ink-600 hover:text-ink-950">
            Back to sign in with password
          </button>
        )}
      </div>
    </div>
  );
}
