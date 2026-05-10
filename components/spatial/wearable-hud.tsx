"use client";

/**
 * WearableHUD — peripheral chrome overlaying the spatial scene.
 *
 *   ┌──────────────────────────────────────────┐
 *   │ ●live  | situation summary | 09:42  ⚡82%│ ← top bar
 *   │                                          │
 *   │                                          │
 *   │  ◀ memory                       agents ▶ │ ← side rails
 *   │                                          │
 *   │                                          │
 *   │  cursor target: laptop  ·  hold to act   │ ← bottom bar
 *   └──────────────────────────────────────────┘
 *
 * Pure HTML/CSS for crisp text — sits *outside* the R3F canvas but
 * inside the same parent container so it overlays correctly.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useSpatialStore } from "@/lib/spatial";

type Situation = {
  kind: string;
  summary: string;
  emotion: string;
  social_density: string;
};

export function WearableHUD({
  situation,
  battery = 82,
  fps = 42,
  onExitImmersive,
}: {
  situation: Situation | null;
  battery?: number;
  fps?: number;
  onExitImmersive?: () => void;
}) {
  const anchors = useSpatialStore((s) => s.anchors);
  const focusedId = useSpatialStore((s) => s.focusedId);
  const activatedId = useSpatialStore((s) => s.activatedId);
  const dwellMs = useSpatialStore((s) => s.dwellMs);

  const [time, setTime] = useState("");
  useEffect(() => {
    const t = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    t();
    const id = setInterval(t, 30_000);
    return () => clearInterval(id);
  }, []);

  const focused = anchors.find((a) => a.id === focusedId);
  const activated = anchors.find((a) => a.id === activatedId);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* vignette + scanline overlay (always-on lens feel) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 4px)",
          mixBlendMode: "screen",
        }}
      />

      {/* TOP BAR */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[11px]">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-aurora opacity-75 gs-pulse" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora" />
          </span>
          <span className="uppercase tracking-[0.25em] text-aurora">
            spectra · live
          </span>
        </div>

        <div className="hidden flex-1 justify-center sm:flex">
          {situation && (
            <div className="rounded-full gs-glass-strong px-4 py-1.5 text-[11px] text-white/90">
              <span className="text-cyan-spec">
                {situation.kind.replace("_", " ")}
              </span>
              <span className="mx-2 text-white/30">·</span>
              <span>{situation.summary || "ambient"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 font-mono text-[11px] text-white/85">
            <Icon name="clock" className="h-3 w-3 text-cyan-spec" />
            {time}
            <span className="text-white/30">·</span>
            <Icon name="battery" className="h-3 w-3 text-aurora" />
            {battery}%
            <span className="text-white/30">·</span>
            <span className="text-violet-spec">{fps}fps</span>
          </div>
          {onExitImmersive && (
            <button
              type="button"
              onClick={onExitImmersive}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full gs-glass-strong hover:bg-white/[0.10]"
              aria-label="Exit immersive mode"
            >
              <Icon name="minimize" className="h-3.5 w-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* LEFT RAIL — memory anchors quickbar */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 sm:left-5">
        <div className="flex flex-col gap-2">
          {anchors.slice(0, 4).map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`pointer-events-auto flex h-9 w-9 cursor-default items-center justify-center rounded-full border ${
                a.id === activatedId
                  ? "border-aurora/60 bg-aurora/15 shadow-[0_0_18px_rgba(106,255,193,0.45)]"
                  : a.id === focusedId
                    ? "border-cyan-spec/60 bg-cyan-spec/15"
                    : "border-white/10 bg-white/[0.04]"
              }`}
              title={a.label}
            >
              <Icon
                name={
                  a.kind === "person"
                    ? "users"
                    : a.kind === "place"
                      ? "map"
                      : a.kind === "memory"
                        ? "brain"
                        : a.kind === "note"
                          ? "image"
                          : "target"
                }
                className="h-3.5 w-3.5 text-white"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT RAIL — agent activity / suggestions */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden flex-col items-end gap-2 sm:right-5 sm:flex">
        {[
          { icon: "agent", tone: "violet" },
          { icon: "brain", tone: "cyan" },
          { icon: "shield", tone: "aurora" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/80"
          >
            <Icon
              name={item.icon}
              className={`h-3 w-3 text-${item.tone}-spec`}
            />
            {item.icon === "agent" && "12 agents online"}
            {item.icon === "brain" && "memory active"}
            {item.icon === "shield" && "trust nominal"}
          </div>
        ))}
      </div>

      {/* BOTTOM BAR — gaze focus + dwell */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-4 pb-5 sm:gap-3 sm:px-6 sm:pb-7">
        <AnimatePresence mode="wait">
          {activated ? (
            <motion.div
              key="activated"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl gs-glass-strong px-5 py-3 text-center"
              style={{
                boxShadow: "0 0 40px rgba(106,255,193,0.25)",
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-aurora">
                anchor activated
              </div>
              <div className="mt-1 font-medium text-white">{activated.label}</div>
              <div className="mt-0.5 text-[11px] text-white/70">
                {activated.description}
              </div>
            </motion.div>
          ) : focused ? (
            <motion.div
              key="focused"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="rounded-full gs-glass-strong px-4 py-2 text-[11px]"
            >
              <span className="text-cyan-spec uppercase tracking-widest">
                gaze
              </span>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-white">{focused.label}</span>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-aurora">
                hold {Math.max(0, 800 - dwellMs)}ms
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="text-[10px] uppercase tracking-[0.3em] text-white/45"
            >
              move your gaze · hover an anchor for 800ms to activate
            </motion.div>
          )}
        </AnimatePresence>

        {/* dwell ring */}
        {focused && !activated && (
          <div className="relative h-1 w-32 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-spec to-aurora"
              animate={{ width: `${Math.min(100, (dwellMs / 800) * 100)}%` }}
              transition={{ ease: "linear", duration: 0.04 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
