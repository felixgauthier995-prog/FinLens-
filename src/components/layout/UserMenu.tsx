import Link from "next/link";

export function UserMenu() {
  return (
    <Link href="/settings" className="rounded-md border border-border px-3 py-2 text-sm">
      Account
    </Link>
  );
}
