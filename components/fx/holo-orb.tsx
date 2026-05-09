"use client";

import { cn } from "@/lib/cn";

/**
 * Pure-CSS holographic orb — used where Three.js would be overkill.
 * Layered gradients + spinning rings + scan lines.
 */
export function HoloOrb({
  size = 220,
  className,
  intensity = 1,
  label,
}: {
  size?: number;
  className?: string;
  intensity?: number;
  label?: string;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full blur-3xl gs-pulse"
        style={{
          background:
            "radial-gradient(closest-side, rgba(140,92,255,0.65), transparent 70%)",
          opacity: 0.7 * intensity,
        }}
      />
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(88,227,255,0.55), transparent 60%)",
          opacity: 0.7 * intensity,
        }}
      />

      <div
        className="absolute inset-[10%] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(88,227,255,0.0), rgba(88,227,255,0.55), rgba(140,92,255,0.55), rgba(201,101,255,0.55), rgba(88,227,255,0.0))",
          mask: "radial-gradient(circle, transparent 50%, black 51%, black 60%, transparent 61%)",
          WebkitMask:
            "radial-gradient(circle, transparent 50%, black 51%, black 60%, transparent 61%)",
        }}
      >
        <div className="h-full w-full gs-orbit" />
      </div>

      <div
        className="absolute inset-[16%] rounded-full"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(106,255,193,0.0), rgba(106,255,193,0.45), rgba(88,227,255,0.45), rgba(106,255,193,0.0))",
          mask: "radial-gradient(circle, transparent 60%, black 61%, black 65%, transparent 66%)",
          WebkitMask:
            "radial-gradient(circle, transparent 60%, black 61%, black 65%, transparent 66%)",
        }}
      >
        <div className="h-full w-full gs-orbit-rev" />
      </div>

      <div
        className="absolute inset-[24%] rounded-full border border-white/10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.18), rgba(140,92,255,0.45) 60%, rgba(88,227,255,0.6) 100%)",
          boxShadow:
            "inset 0 0 60px rgba(255,255,255,0.18), 0 0 60px rgba(140,92,255,0.45)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.25), transparent 40%)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/85">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
