import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import type { LineEfficiencyDayCell } from "../../../interfaces/production/LineEfficiencyReport";

interface Props {
  days: LineEfficiencyDayCell[];
  monthlyAverage: number;
}

const COLORS = {
  text: "#F4F6F8",
  textSecondary: "#B7BEC7",
  grid: "rgba(244,246,248,0.14)",
  bar: "#60a5fa",
  holidayBar: "#7A828C",
  average: "#E2A716",
  tooltipBg: "#1E2530",
  tooltipBorder: "rgba(244,246,248,0.25)",
};

const WIDTH = 900;
const HEIGHT = 320;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;
const GRID_LINES = 5;

const LineEfficiencyBarChart = ({ days, monthlyAverage }: Props) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = days.length;
  if (n === 0) {
    return <Typography sx={{ color: COLORS.textSecondary }}>No days to show.</Typography>;
  }

  const maxValue = Math.max(...days.map((d) => d.efficiencyPercent ?? 0), monthlyAverage, 10);
  const yMax = Math.max(Math.ceil((maxValue * 1.15) / GRID_LINES) * GRID_LINES, GRID_LINES);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const bandWidth = plotWidth / n;
  const barWidth = Math.max(bandWidth * 0.6, 2);
  const xScale = (i: number) => PAD_LEFT + i * bandWidth + bandWidth / 2;
  const yScale = (v: number) => PAD_TOP + plotHeight - (v / yMax) * plotHeight;

  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) => Math.round((yMax / GRID_LINES) * i));
  const dayLabelStep = Math.max(1, Math.ceil(n / 15));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const clamped = Math.max(PAD_LEFT, Math.min(WIDTH - PAD_RIGHT, relX));
    const idx = Math.min(n - 1, Math.max(0, Math.floor((clamped - PAD_LEFT) / bandWidth)));
    setHoverIndex(idx);
  };

  const hovered = hoverIndex !== null ? days[hoverIndex] : null;

  return (
    <Box sx={{ position: "relative" }}>
      <svg
        ref={svgRef}
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        style={{ display: "block" }}
      >
        {gridValues.map((v) => (
          <g key={v}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yScale(v)} y2={yScale(v)} stroke={COLORS.grid} strokeWidth={1} />
            <text x={PAD_LEFT - 8} y={yScale(v) + 4} textAnchor="end" fontSize={11} fill={COLORS.textSecondary}>
              {v}%
            </text>
          </g>
        ))}

        {days.map((d, i) =>
          i % dayLabelStep === 0 ? (
            <text key={d.day} x={xScale(i)} y={HEIGHT - PAD_BOTTOM + 16} textAnchor="middle" fontSize={10} fill={COLORS.textSecondary}>
              {d.day}
            </text>
          ) : null,
        )}

        <line
          x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yScale(monthlyAverage)} y2={yScale(monthlyAverage)}
          stroke={COLORS.average} strokeWidth={1.5} strokeDasharray="5,4"
        />
        <text x={WIDTH - PAD_RIGHT} y={yScale(monthlyAverage) - 4} textAnchor="end" fontSize={11} fill={COLORS.average}>
          Avg {monthlyAverage.toFixed(1)}%
        </text>

        {days.map((d, i) => {
          const value = d.efficiencyPercent ?? 0;
          const barHeight = Math.max((value / yMax) * plotHeight, value > 0 ? 1 : 0);
          return (
            <rect
              key={d.day}
              x={xScale(i) - barWidth / 2}
              y={yScale(value)}
              width={barWidth}
              height={barHeight}
              fill={d.isHoliday ? COLORS.holidayBar : COLORS.bar}
              opacity={hoverIndex === i ? 1 : 0.85}
              rx={1.5}
            />
          );
        })}

        {hoverIndex !== null && (
          <line
            x1={xScale(hoverIndex)} x2={xScale(hoverIndex)} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM}
            stroke={COLORS.tooltipBorder} strokeWidth={1} strokeDasharray="2,3"
          />
        )}
      </svg>

      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: `${Math.min(78, (xScale(hoverIndex!) / WIDTH) * 100)}%`,
            bgcolor: COLORS.tooltipBg,
            border: `1px solid ${COLORS.tooltipBorder}`,
            borderRadius: 1,
            p: 1,
            minWidth: 150,
            pointerEvents: "none",
            boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
          }}
        >
          <Typography variant="caption" sx={{ color: COLORS.text, fontWeight: 600, display: "block" }}>
            Day {hovered.day} — {hovered.dayOfWeek}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text, display: "block" }}>
            {hovered.efficiencyPercent === null ? "No production" : `${hovered.efficiencyPercent}% efficiency`}
          </Typography>
          {hovered.isHoliday && (
            <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: "block" }}>
              {hovered.holidayDescription ?? "Holiday"}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: COLORS.bar, display: "inline-block" }} />
          Efficiency %
        </Typography>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: COLORS.holidayBar, display: "inline-block" }} />
          Holiday
        </Typography>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 12, height: 0, borderTop: `1.5px dashed ${COLORS.average}`, display: "inline-block" }} />
          Monthly average
        </Typography>
      </Box>
    </Box>
  );
};

export default LineEfficiencyBarChart;
