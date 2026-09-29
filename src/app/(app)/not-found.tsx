import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n/server";

export default async function NotFound() {
  const m = await getMessages();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-400">
        <Compass className="h-5 w-5" strokeWidth={2} />
      </div>
      <h1 className="text-[19px] font-semibold text-ink-950">{m.notFound.title}</h1>
      <Link href="/" className="mt-5">
        <Button size="sm">{m.notFound.back}</Button>
      </Link>
    </div>
  );
}
