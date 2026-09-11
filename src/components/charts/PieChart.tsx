import { useState } from "react";

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title?: string;
  size?: number;
}

export function PieChart({ data, title, size = 200 }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = 0;

  const slices = data.map((d, i) => {
    const percentage = d.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return {
      pathData,
      color: d.color,
      label: d.label,
      value: d.value,
      percentage: (percentage * 100).toFixed(1),
      index: i,
    };
  });

  return (
    <div className="flex flex-col items-center">
      {title && <h4 className="mb-3 text-[14px] font-bold text-ink">{title}</h4>}
      <div className="relative">
        <svg width={size} height={size}>
          {slices.map((slice) => (
            <path
              key={slice.index}
              d={slice.pathData}
              fill={slice.color}
              opacity={hoveredIndex === slice.index ? 1 : 0.8}
              stroke="white"
              strokeWidth="2"
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-opacity"
            />
          ))}
        </svg>
        
        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-3 py-2 shadow-lg">
            <p className="text-[12px] font-bold text-ink">{slices[hoveredIndex].label}</p>
            <p className="text-[11px] text-ink-soft">
              {slices[hoveredIndex].value} ({slices[hoveredIndex].percentage}%)
            </p>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="h-3 w-3 rounded" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] text-ink-soft">
              {d.label}: {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
