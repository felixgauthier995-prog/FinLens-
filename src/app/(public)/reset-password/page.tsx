import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { requireSignedIn } from "@/lib/account";
import { NewPasswordForm } from "@/components/features/auth/NewPasswordForm";

export const metadata: Metadata = { title: "Choose a password — FinLens" };

/** Reached from the "forgot password" email (the link signs the user in
 * first) or from Settings → Change password. */
export default async function ResetPasswordPage() {
  const account = await requireSignedIn();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-10">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to FinLens
      </Link>
      <Logo className="mt-8" />
      <h1 className="mt-8 text-[26px] font-semibold tracking-tight text-ink-950">Choose a new password</h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600">
        For <span className="font-medium text-ink-950">{account.user.email}</span>. You&apos;ll use it to sign in
        from now on.
      </p>
      <NewPasswordForm />
    </main>
  );
}
