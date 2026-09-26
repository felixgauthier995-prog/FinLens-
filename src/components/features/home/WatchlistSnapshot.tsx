import Link from "next/link";
export function WatchlistSnapshot() {
  return (
    <div className="rounded-xl border border-border p-5 text-sm">
      <p>Your saved watchlist is available in your account.</p>
      <Link href="/watchlist" className="mt-3 inline-block underline">
        Open your watchlist
      </Link>
    </div>
  );
}
