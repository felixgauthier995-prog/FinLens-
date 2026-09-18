import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-400">
        <Compass className="h-5 w-5" strokeWidth={2} />
      </div>
      <h1 className="text-[19px] font-semibold text-ink-950">Page not found</h1>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-400">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or may have moved.
      </p>
      <Link href="/" className="mt-5">
        <Button size="sm">Back to Home</Button>
      </Link>
    </div>
  );
}
