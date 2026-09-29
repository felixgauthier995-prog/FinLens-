import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/session";

/** Landing point of the emailed sign-in link. Exchanges the one-time code
 * for a session cookie, then sends the user into the app (the app layout
 * routes them to onboarding or the paywall if needed). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  // Only same-site paths (e.g. /reset-password), never another domain.
  const nextParam = url.searchParams.get("next");
  const next = nextParam && /^\/[a-z0-9/-]*$/i.test(nextParam) && !nextParam.startsWith("//") ? nextParam : "/";
  const destination = type === "recovery" ? "/reset-password" : next;

  const db = await createSessionClient();
  if (db) {
    if (code) {
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(destination, url.origin));
    } else if (tokenHash && type) {
      const { error } = await db.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) return NextResponse.redirect(new URL(destination, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
