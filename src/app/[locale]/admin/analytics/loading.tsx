import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="mt-4 h-3 w-24" />
            <Skeleton className="mt-2 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-strong rounded-3xl p-6 md:p-8">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-6 h-52 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}