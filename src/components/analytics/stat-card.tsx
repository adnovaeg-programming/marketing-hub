import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color?: "primary" | "accent" | "emerald" | "amber";
}) {
  const colorClasses = {
    primary: "from-primary/20 to-accent/20 text-primary",
    accent: "from-accent/20 to-primary/20 text-accent",
    emerald: "from-emerald-500/20 to-primary/20 text-emerald-500",
    amber: "from-amber-500/20 to-primary/20 text-amber-500",
  }[color];

  return (
    <div className="glass glass-hover rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div
          className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses}`}
        >
          <Icon className="size-5" />
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              trend >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>

      {trendLabel && (
        <p className="mt-1 text-[11px] text-muted-foreground">{trendLabel}</p>
      )}
    </div>
  );
}