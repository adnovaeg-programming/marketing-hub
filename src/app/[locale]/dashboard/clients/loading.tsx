import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-64 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="size-4" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="size-12 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1.5 h-3 w-16" />
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}