import { Skeleton } from "@/components/ui/skeleton";

export default function WalletLoading() {
  return (
    <div className="p-6 md:p-10">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="mt-4 h-3 w-24" />
            <Skeleton className="mt-2 h-8 w-32" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <Skeleton className="h-10 w-32 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-strong rounded-3xl p-6">
            <Skeleton className="size-11 rounded-2xl" />
            <Skeleton className="mt-6 h-3 w-24" />
            <Skeleton className="mt-2 h-8 w-40" />
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-12" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}