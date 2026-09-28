export type DonutSegment = {
  label: string;
  value: number;
  color: string; // hex color
};

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string | number;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="relative flex size-40 items-center justify-center rounded-full border-4 border-muted">
          <div className="text-center">
            <p className="text-2xl font-bold">0</p>
            <p className="text-[10px] text-muted-foreground">{centerLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      {/* Donut */}
      <div className="relative flex size-40 shrink-0 items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            className="text-muted/40"
          />

          {/* Segments */}
          {segments.map((seg) => {
            if (seg.value === 0) return null;
            const length = (seg.value / total) * circumference;
            const circle = (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                className="transition-all duration-1000"
              />
            );
            offset += length;
            return circle;
          })}
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold">{centerValue}</p>
          <p className="text-[10px] text-muted-foreground">{centerLabel}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-medium">{seg.label}</span>
              <span className="text-muted-foreground">
                {seg.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}