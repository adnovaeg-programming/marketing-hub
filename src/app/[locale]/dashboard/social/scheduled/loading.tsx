import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduledPostsLoading() {
  return (
    <div className="p-6 md:p-10">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}