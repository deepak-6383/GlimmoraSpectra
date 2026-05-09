"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * AI-reactive voice waveform: animated SVG bars that breathe.
 */
export function Waveform({
  bars = 24,
  className,
  active = true,
}: {
  bars?: number;
  className?: string;
  active?: boolean;
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const svg = ref.current;
    if (!svg) return;
    const els = Array.from(svg.querySelectorAll<SVGRectElement>("rect"));
    let raf = 0;
    const start = performance.now();

    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      els.forEach((rect, i) => {
        const v =
          0.4 +
          Math.abs(
            Math.sin(elapsed * (1.4 + (i % 5) * 0.18) + i * 0.4) *
              Math.cos(elapsed * 0.6 + i * 0.13),
          ) *
            0.6;
        const h = 6 + v * 38;
        rect.setAttribute("height", h.toFixed(1));
        rect.setAttribute("y", ((48 - h) / 2).toFixed(1));
        rect.setAttribute("opacity", (0.45 + v * 0.55).toFixed(2));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const total = bars;
  const w = 4;
  const gap = 6;
  const width = total * (w + gap) - gap;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} 48`}
      className={cn("h-12 w-full", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="wf" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#58e3ff" />
          <stop offset="50%" stopColor="#8c5cff" />
          <stop offset="100%" stopColor="#c965ff" />
        </linearGradient>
      </defs>
      {Array.from({ length: total }).map((_, i) => (
        <rect
          key={i}
          x={i * (w + gap)}
          y={20}
          width={w}
          height={8}
          rx={2}
          fill="url(#wf)"
        />
      ))}
    </svg>
  );
}
