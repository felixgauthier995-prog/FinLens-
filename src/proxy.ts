import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Keeps the Supabase session cookie fresh on every page request. Access
 * control itself happens in the server layouts (src/lib/account.ts), which
 * is where it's safe — this proxy only refreshes tokens.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });
  // Triggers a token refresh when needed. Do not remove.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Everything except API routes, the Sanity studio, Next internals and static files.
    "/((?!api|studio|_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
