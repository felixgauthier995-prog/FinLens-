import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { getAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Sign in — FinLens" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  if (await getAccount()) redirect("/");
  const { error, mode } = await searchParams;
  const signup = mode === "signup";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-10">
      <Link
        href="/welcome"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back
      </Link>
      <Logo className="mt-8" />
      <h1 className="mt-8 text-[26px] font-semibold tracking-tight text-ink-950">
        {signup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600">
        {signup
          ? "Start with a 7-day free trial. No charge today."
          : "Sign in to see what moves your stocks."}
      </p>
      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-negative-soft px-3.5 py-2.5 text-[13px] text-negative">
          That link has expired or was already used. Sign in below, or request a new link.
        </p>
      )}
      <LoginForm initialMode={signup ? "signup" : "signin"} />
    </main>
  );
}
