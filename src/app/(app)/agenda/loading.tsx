import { Skeleton } from "@/components/ui/Skeleton";

export default function AgendaLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="mt-2 h-4 w-64" />
      <Skeleton className="mt-6 h-9 w-56 rounded-md" />
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
