"use client";

import { useMemo } from "react";

/**
 * Lightweight, SVG-based area + line chart with grid and tooltips region.
 * Multiple series with gradient fills.
 */
export function AreaChart({
  series,
  height = 220,
  className,
  showGrid = true,
}: {
  series: { name: string; color: string; data: number[] }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
}) {
  const w = 800;
  const h = height;
  const padX = 18;
  const padY = 18;

  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const range = Math.max(1, max - min);
  const points = (data: number[]) => {
    const step = (w - padX * 2) / Math.max(1, data.length - 1);
    return data.map((v, i) => {
      const x = padX + i * step;
      const y = h - padY - ((v - min) / range) * (h - padY * 2);
      return [x, y] as const;
    });
  };

  const paths = useMemo(
    () =>
      series.map((s) => {
        const pts = points(s.data);
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
        const area = `${line} L${pts[pts.length - 1][0]},${h - padY} L${pts[0][0]},${h - padY} Z`;
        return { line, area, last: pts[pts.length - 1] };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, h],
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className ?? "h-full w-full"}
      preserveAspectRatio="none"
    >
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`fill-${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {showGrid && (
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
          {Array.from({ length: 4 }).map((_, i) => {
            const y = padY + (i * (h - padY * 2)) / 4;
            return <line key={i} x1={padX} x2={w - padX} y1={y} y2={y} />;
          })}
        </g>
      )}
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.area} fill={`url(#fill-${i})`} />
          <path d={p.line} fill="none" stroke={series[i].color} strokeWidth="1.6" />
          <circle cx={p.last[0]} cy={p.last[1]} r={3} fill={series[i].color} />
          <circle cx={p.last[0]} cy={p.last[1]} r={6} fill={series[i].color} opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

export function BarChart({
  data,
  color = "#58e3ff",
  height = 180,
}: {
  data: { l: string; v: number }[];
  color?: string;
  height?: number;
}) {
  const w = 600;
  const h = height;
  const padX = 12;
  const padY = 18;
  const max = Math.max(...data.map((d) => d.v), 1);
  const bw = (w - padX * 2) / data.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="barg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = ((d.v / max) * (h - padY * 2));
        const x = padX + i * (bw + 8);
        const y = h - padY - bh;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={bh}
              rx={3}
              fill="url(#barg)"
            />
            <text
              x={x + bw / 2}
              y={h - 4}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(196,202,230,0.5)"
            >
              {d.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({
  segments,
  size = 160,
  thickness = 14,
}: {
  segments: { l: string; v: number; c: string }[];
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((acc, s) => acc + s.v, 0);
  let offset = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
      <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
        {segments.map((s) => {
          const len = (s.v / total) * C;
          const dash = `${len} ${C - len}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle
              key={s.l}
              r={r}
              fill="none"
              stroke={s.c}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={dashoffset}
            />
          );
        })}
      </g>
    </svg>
  );
}
