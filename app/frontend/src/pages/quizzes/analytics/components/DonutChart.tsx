import { Box } from "@mui/material";
import type { ReactNode } from "react";

type DonutSegment = {
  color: string;
  value: number;
};

type DonutChartProps = {
  ariaLabel: string;
  size: number;
  thickness: number;
  segments: DonutSegment[];
  children: ReactNode;
};

export function DonutChart({
  ariaLabel,
  size,
  thickness,
  segments,
  children,
}: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 0;

  return (
    <Box
      role="img"
      aria-label={ariaLabel}
      sx={{
        width: size,
        height: size,
        position: "relative",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${size} ${size}`}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={thickness}
        />
        {total > 0
          ? segments.map((segment, index) => {
              const length = (segment.value / total) * circumference;
              const dashOffset = -offset;
              offset += length;

              return (
                <circle
                  key={`${segment.color}-${index}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${center} ${center})`}
                />
              );
            })
          : null}
      </Box>
      {children}
    </Box>
  );
}
