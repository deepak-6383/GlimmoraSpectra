"use client";

import { motion } from "framer-motion";
import type { VisionFramePayload } from "@/lib/api";
import { ScanGrid } from "@/components/fx/scan-grid";

const PALETTE: Record<string, { ring: string; text: string }> = {
  cyan: { ring: "border-cyan-spec/80", text: "text-cyan-spec" },
  violet: { ring: "border-violet-spec/80", text: "text-violet-spec" },
  aurora: { ring: "border-aurora/80", text: "text-aurora" },
  amber: { ring: "border-amber-spec/80", text: "text-amber-spec" },
  coral: { ring: "border-coral/80", text: "text-coral" },
};

const TONES = Object.keys(PALETTE);

export function VisionOverlays({
  frame,
  withGrid = true,
}: {
  frame: VisionFramePayload | null;
  withGrid?: boolean;
}) {
  return (
    <>
      {withGrid && <ScanGrid />}
      <Crosshair />
      {frame?.detections?.map((d, i) => {
        const tone = TONES[i % TONES.length];
        const [x, y, w, h] = d.bbox;
        return (
          <ROI
            key={`det-${i}`}
            x={x}
            y={y}
            w={w}
            h={h}
            label={`${d.label} · ${d.confidence.toFixed(2)}`}
            tone={tone}
          />
        );
      })}
      {frame?.text?.slice(0, 4).map((t, i) => {
        const [x, y, w, h] = t.bbox;
        return (
          <ROI
            key={`txt-${i}`}
            x={x}
            y={y}
            w={w}
            h={h}
            label={`"${t.text.slice(0, 18)}"`}
            tone="amber"
          />
        );
      })}
      {frame?.faces?.map((f, i) => {
        const [x, y, w, h] = f.bbox;
        return (
          <ROI
            key={`face-${i}`}
            x={x}
            y={y}
            w={w}
            h={h}
            label="face"
            tone="coral"
          />
        );
      })}
    </>
  );
}

function ROI({
  x,
  y,
  w,
  h,
  label,
  tone,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone: string;
}) {
  const p = PALETTE[tone] ?? PALETTE.cyan;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="absolute"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
      }}
    >
      <div className={`relative h-full w-full rounded-md border ${p.ring}`}>
        <span className={`absolute -top-1 -left-1 h-2 w-2 border-t border-l ${p.ring}`} />
        <span className={`absolute -top-1 -right-1 h-2 w-2 border-t border-r ${p.ring}`} />
        <span className={`absolute -bottom-1 -left-1 h-2 w-2 border-b border-l ${p.ring}`} />
        <span className={`absolute -bottom-1 -right-1 h-2 w-2 border-b border-r ${p.ring}`} />
      </div>
      <div className="absolute -top-7 left-0 whitespace-nowrap rounded-md gs-glass-strong px-2 py-1 font-mono text-[10px]">
        <span className={p.text}>{label}</span>
      </div>
    </motion.div>
  );
}

function Crosshair() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-16 w-16">
        <div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-cyan-spec/70" />
        <div className="absolute left-1/2 bottom-0 h-3 w-px -translate-x-1/2 bg-cyan-spec/70" />
        <div className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-cyan-spec/70" />
        <div className="absolute top-1/2 right-0 h-px w-3 -translate-y-1/2 bg-cyan-spec/70" />
        <div className="absolute inset-0 m-auto h-2 w-2 rounded-full border border-cyan-spec/80" />
      </div>
    </div>
  );
}
