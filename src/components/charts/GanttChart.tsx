import { useState } from "react";

interface GanttChartProps {
  data: Array<{
    label: string;
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    color?: string;
    status?: string;
  }>;
  title?: string;
  height?: number;
}

export function GanttChart({ data, title, height = 300 }: GanttChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Calcular datas mínimas e máximas
  const allDates = data.flatMap((d) => [new Date(d.start), new Date(d.end)]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const chartWidth = 800;
  const chartHeight = height - 50;
  const barHeight = 30;
  const barGap = 10;
  const labelWidth = 150;
  const timelineWidth = chartWidth - labelWidth;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "concluido":
        return "#2e6b54"; // verde
      case "em_andamento":
        return "#d99a26"; // âmbar
      case "atrasado":
        return "#bd4f26"; // vermelho
      case "planejado":
        return "#78867c"; // cinza
      case "pausado":
        return "#78867c"; // cinza
      default:
        return "#2e6b54";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  // Gerar meses para o eixo X
  const months = [];
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return (
    <div className="w-full overflow-x-auto">
      {title && <h4 className="mb-3 text-[14px] font-bold text-ink">{title}</h4>}
      <svg width={chartWidth} height={height}>
        {/* Eixo X - Meses */}
        {months.map((month, i) => {
          const x = labelWidth + (i * timelineWidth) / months.length;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={30}
                x2={x}
                y2={chartHeight}
                stroke="#ddd6bf"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x={x}
                y={20}
                textAnchor="middle"
                fontSize="10"
                fill="#78867c"
              >
                {month.toLocaleDateString("pt-BR", { month: "short" })}
              </text>
            </g>
          );
        })}

        {/* Barras */}
        {data.map((d, i) => {
          const startDate = new Date(d.start);
          const endDate = new Date(d.end);
          const startOffset = (startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
          const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          
          const x = labelWidth + (startOffset / totalDays) * timelineWidth;
          const width = (duration / totalDays) * timelineWidth;
          const y = 40 + i * (barHeight + barGap);
          const color = d.color || getStatusColor(d.status);
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Label */}
              <text
                x={labelWidth - 10}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize="11"
                fill="#182620"
                fontWeight={isHovered ? "bold" : "normal"}
              >
                {d.label.length > 20 ? d.label.substring(0, 20) + "..." : d.label}
              </text>

              {/* Barra */}
              <rect
                x={x}
                y={y}
                width={Math.max(width, 10)}
                height={barHeight}
                fill={color}
                opacity={isHovered ? 1 : 0.8}
                rx="4"
                className="transition-opacity"
              />

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x + width / 2 - 60}
                    y={y - 35}
                    width={120}
                    height={30}
                    fill="white"
                    stroke="#ddd6bf"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={x + width / 2}
                    y={y - 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#182620"
                  >
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legenda de status */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: "#2e6b54" }} />
          <span className="text-[11px] text-ink-soft">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: "#d99a26" }} />
          <span className="text-[11px] text-ink-soft">Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: "#bd4f26" }} />
          <span className="text-[11px] text-ink-soft">Atrasado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: "#78867c" }} />
          <span className="text-[11px] text-ink-soft">Planejado/Pausado</span>
        </div>
      </div>
    </div>
  );
}
