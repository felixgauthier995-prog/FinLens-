import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

/** Shell for the pages reachable without an active subscription:
 * welcome, login, onboarding and the paywall. No app navigation here. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      {children}
    </div>
  );
}
