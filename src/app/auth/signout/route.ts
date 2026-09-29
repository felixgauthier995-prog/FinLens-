import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";

export async function POST(request: Request) {
  const db = await createSessionClient();
  await db?.auth.signOut();
  return NextResponse.redirect(new URL("/welcome", request.url), { status: 303 });
}
