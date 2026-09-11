import { useState } from "react";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    maxValue?: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
}

export function BarChart({ data, title, height = 300 }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxValue = Math.max(...data.map((d) => d.maxValue ?? d.value));
  const barWidth = 60;
  const gap = 20;
  const chartWidth = data.length * (barWidth + gap) + 50;
  const chartHeight = height - 50;

  return (
    <div className="w-full overflow-x-auto">
      {title && <h4 className="mb-3 text-[14px] font-bold text-ink">{title}</h4>}
      <svg width={Math.max(chartWidth, 400)} height={height} className="mx-auto">
        {/* Eixo Y */}
        <line x1="40" y1="20" x2="40" y2={chartHeight} stroke="#ddd6bf" strokeWidth="1" />
        
        {/* Linhas de grade */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = chartHeight - (chartHeight * percent) / 100;
          return (
            <g key={percent}>
              <line x1="40" y1={y} x2={chartWidth} y2={y} stroke="#ddd6bf" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x="35" y={y + 4} textAnchor="end" fontSize="10" fill="#78867c">
                {Math.round((maxValue * percent) / 100)}
              </text>
            </g>
          );
        })}

        {/* Barras */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = 50 + i * (barWidth + gap);
          const y = chartHeight - barHeight;
          const color = d.color || "#2e6b54";
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Barra */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity={isHovered ? 1 : 0.8}
                rx="4"
                className="transition-opacity"
              />

              {/* Valor */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#182620"
                >
                  {d.value}
                </text>
              )}

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#4c5b52"
                transform={`rotate(-45 ${x + barWidth / 2} ${chartHeight + 15})`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
