import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="mt-4 h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-strong rounded-3xl p-6 md:p-8">
            <Skeleton className="h-6 w-40" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="glass flex items-center gap-3 rounded-xl p-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}