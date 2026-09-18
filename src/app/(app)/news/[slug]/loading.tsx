import { Skeleton } from "@/components/ui/Skeleton";

export default function NewsDetailLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-4 w-32" />
      <Skeleton className="mt-3 h-8 w-full" />
      <Skeleton className="mt-2 h-8 w-3/4" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-5/6" />
      <Skeleton className="mt-5 h-12 w-48 rounded-lg" />
      <div className="mt-8 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-5 w-40" />
            <Skeleton className="mt-2.5 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-11/12" />
          </div>
        ))}
      </div>
    </div>
  );
}
