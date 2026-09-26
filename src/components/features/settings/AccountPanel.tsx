"use client";
import { useEffect, useState } from "react";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
export function AccountPanel() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!db) return;
    db.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data } = db.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user.email ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/settings" },
    });
    setMessage(
      error ? error.message : "Check your email for your sign-in link.",
    );
    setBusy(false);
  }
  return (
    <section className="rounded-xl border border-border p-5 mb-6">
      <h2 className="font-semibold">Your account</h2>
      {!db ? (
        <p>Account service is not configured.</p>
      ) : user ? (
        <>
          <p className="my-3">{user}</p>
          <button
            onClick={async () => {
              const { error } = await db!.auth.signOut();
              setMessage(error ? error.message : "Signed out.");
            }}
            className="underline"
          >
            Sign out
          </button>
        </>
      ) : (
        <form onSubmit={login} className="mt-3 flex flex-wrap gap-3">
          <input
            aria-label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded border p-2"
          />
          <button
            disabled={busy}
            className="rounded bg-ink-950 text-white px-4 py-2"
          >
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}
      <p role="status" className="mt-2 text-sm">
        {message}
      </p>
    </section>
  );
}
