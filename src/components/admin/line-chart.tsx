"use client";

export type LinePoint = {
  label: string;
  value: number;
};

export function LineChart({
  data,
  height = 200,
  color = "var(--primary)",
  fill = "url(#lineGradient)",
  showGrid = true,
  formatValue,
}: {
  data: LinePoint[];
  height?: number;
  color?: string;
  fill?: string;
  showGrid?: boolean;
  formatValue?: (v: number) => string;
}) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        مفيش بيانات
      </div>
    );
  }

  const padding = 20;
  const width = 800;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = 0;

  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y =
      padding +
      chartHeight -
      ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, ...point };
  });

  // نبني الـ path للـ line
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // نبني الـ area path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - padding
  } L ${points[0].x} ${height - padding} Z`;

  // نعمل 4 خطوط أفقية للـ grid
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {showGrid &&
          gridLines.map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * chartHeight}
              x2={width - padding}
              y2={padding + ratio * chartHeight}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeDasharray="4 4"
            />
          ))}

        {/* Area */}
        <path d={areaPath} fill={fill} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--background)"
              stroke={color}
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>

      {/* X-axis labels (show every nth) */}
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {data
          .filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)
          .map((point, i) => (
            <span key={i}>{point.label}</span>
          ))}
      </div>
    </div>
  );
}