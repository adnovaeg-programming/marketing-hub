import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="p-6 md:p-10">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-48" />

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-72 rounded-xl" />
        <Skeleton className="h-11 w-24 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-5 w-40" />
            <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}