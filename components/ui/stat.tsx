"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function Stat({
  label,
  value,
  suffix = "",
  prefix = "",
  delta,
  spark,
  tone = "cyan",
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delta?: string;
  spark?: number[];
  tone?: "cyan" | "violet" | "aurora" | "amber";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  const toneClass =
    tone === "violet"
      ? "from-violet-spec/40 to-fuchsia-spec/40"
      : tone === "aurora"
        ? "from-aurora/40 to-cyan-spec/40"
        : tone === "amber"
          ? "from-amber-spec/40 to-coral/40"
          : "from-cyan-spec/40 to-electric/40";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" as const }}
      className={cn("gs-panel gs-noise p-5 sm:p-6", className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-ink-mute">{label}</div>
          <div className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            {prefix}
            {Math.round(n).toLocaleString()}
            <span className="text-ink-mute font-normal text-2xl">{suffix}</span>
          </div>
        </div>
        {delta && (
          <span className="rounded-full border border-aurora/30 bg-aurora/10 px-2 py-0.5 text-[11px] font-medium text-aurora">
            {delta}
          </span>
        )}
      </div>
      {spark && spark.length > 0 && (
        <div className="mt-4">
          <Sparkline points={spark} className={toneClass} />
        </div>
      )}
    </motion.div>
  );
}

export function Sparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  const w = 240;
  const h = 56;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(1, max - min);
  const step = w / Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className={cn("text-cyan-spec bg-gradient-to-r", className)}>
        <path d={area} fill="url(#spark)" opacity="0.8" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
