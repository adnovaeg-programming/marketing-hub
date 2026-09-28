export type BarData = {
  label: string;
  value: number;
  color?: string; // tailwind class prefix like "bg-primary"
};

export function BarChart({
  data,
  maxValue,
}: {
  data: BarData[];
  maxValue?: number;
}) {
  if (data.length === 0) return null;

  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct = (item.value / max) * 100;
        const share = total > 0 ? Math.round((item.value / total) * 100) : 0;

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {item.value} <span className="text-[10px]">({share}%)</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  item.color ?? "bg-gradient-to-r from-primary to-accent"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}