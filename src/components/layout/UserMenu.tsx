"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
export function UserMenu() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!db) return;
    db.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data } = db.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <Link
      href="/settings"
      className="rounded-md border border-border px-3 py-2 text-sm"
    >
      {signedIn ? "Account" : "Sign in"}
    </Link>
  );
}
