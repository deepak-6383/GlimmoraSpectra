"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ScanGrid } from "@/components/fx/scan-grid";
import { useToast } from "@/components/ui/toast";

const ROIs = [
  { x: 18, y: 22, w: 22, h: 30, label: "Person · Cedar Lin", conf: 0.97, tone: "cyan" as const },
  { x: 52, y: 30, w: 18, h: 22, label: "Whiteboard · 9 nodes", conf: 0.93, tone: "violet" as const },
  { x: 30, y: 64, w: 18, h: 18, label: "MacBook · M5 Pro", conf: 0.94, tone: "aurora" as const },
  { x: 70, y: 58, w: 14, h: 18, label: "Espresso · ceramic", conf: 0.88, tone: "amber" as const },
  { x: 8, y: 70, w: 12, h: 14, label: "Plant · Monstera", conf: 0.86, tone: "coral" as const },
];

const INITIAL_LAYERS = [
  { k: "objects", l: "Object detection", on: true, tone: "cyan" },
  { k: "ocr", l: "Optical character recognition", on: true, tone: "violet" },
  { k: "depth", l: "Depth & geometry", on: true, tone: "aurora" },
  { k: "faces", l: "Face & gaze", on: true, tone: "amber" },
  { k: "text", l: "Live translation", on: false, tone: "coral" },
  { k: "biome", l: "Biometric overlay", on: false, tone: "cyan" },
];

export default function VisionPage() {
  const [active, setActive] = useState(0);
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % ROIs.length), 2400);
    return () => clearInterval(id);
  }, []);

  const toggleLayer = (k: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.k === k ? { ...l, on: !l.on } : l)),
    );
  };

  const onSnapshot = () => {
    const roi = ROIs[active];
    toast({
      title: "Snapshot captured",
      description: `Pinned "${roi.label}" to memory · confidence ${roi.conf.toFixed(2)}`,
      tone: "success",
    });
  };

  const onAutoAnnotate = () => {
    toast({
      title: "Auto-annotation queued",
      description: "Aurora will narrate the scene in your console.",
      tone: "info",
    });
    router.push(
      "/app/console?prompt=" +
        encodeURIComponent("Describe everything in my current view"),
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Vision intelligence · streaming"
        title={<>The world, <span className="gs-text-aurora">re-rendered.</span></>}
        description="Real-time fusion of object recognition, scene understanding and ambient annotation. Streamed from your Spectra Lens at 42fps."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={onSnapshot}>
              <Icon name="camera" className="h-4 w-4" /> Snapshot
            </Button>
            <Button variant="spectral" size="sm" onClick={onAutoAnnotate}>
              <Icon name="sparkles" className="h-4 w-4" /> Auto-annotate
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel className="overflow-hidden p-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px]">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #0c1224 0%, #0a0c18 35%, #160c25 65%, #0a0c18 100%)",
                }}
              />
              <ScanGrid />
              <SceneIllustration />

              {ROIs.map((r, i) => (
                <ROIBox key={i} {...r} highlighted={i === active} />
              ))}

              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-coral gs-blink" />
                REC · 42fps · 4K
              </div>
              <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 font-mono text-[11px]">
                LAT 0.4ms · ON-DEVICE 87%
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[11px]">
                  <Icon name="map" className="h-3.5 w-3.5 text-cyan-spec" />
                  Spectra Studio · Zürich · 47.376° N
                </div>
                <div className="flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[11px]">
                  <span>FOV 112°</span>
                  <span className="text-ink-mute">|</span>
                  <span>Focus 1.2m</span>
                </div>
              </div>

              <Crosshair />
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Cognition layers</h3>
              <Badge tone="cyan" pulse>
                {layers.filter((l) => l.on).length} / {layers.length} active
              </Badge>
            </div>
            <ul className="mt-4 space-y-2">
              {layers.map((l) => (
                <li key={l.k}>
                  <button
                    type="button"
                    onClick={() => toggleLayer(l.k)}
                    aria-pressed={l.on}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                      l.on
                        ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                        : "border-white/[0.05] bg-white/[0.02] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full bg-${l.tone}-spec ${
                          l.on ? "gs-pulse" : ""
                        }`}
                      />
                      <span className="text-sm">{l.l}</span>
                    </div>
                    <div
                      className={`h-5 w-9 rounded-full border ${
                        l.on
                          ? `border-${l.tone}-spec/50 bg-${l.tone}-spec/20`
                          : "border-white/10 bg-white/[0.04]"
                      } relative`}
                    >
                      <span
                        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${
                          l.on ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Detected entities</h3>
              <span className="text-[11px] text-ink-mute">{ROIs.length} this frame</span>
            </div>
            <ul className="mt-4 space-y-2">
              {ROIs.map((r, i) => (
                <motion.li
                  key={r.label}
                  onMouseEnter={() => setActive(i)}
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    active === i
                      ? `border-${r.tone}-spec/50 bg-${r.tone}-spec/10`
                      : "border-white/10 bg-white/[0.025]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-${r.tone}-spec`}
                  >
                    <Icon name="target" className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{r.label}</div>
                    <div className="text-[11px] text-ink-mute">conf {r.conf}</div>
                  </div>
                  <Badge tone={r.tone}>{r.tone}</Badge>
                </motion.li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-7">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="violet">Scene understanding</Badge>
                <h3 className="mt-3 font-display text-xl">Aurora&apos;s description</h3>
              </div>
              <Icon name="brain" className="h-5 w-5 text-violet-spec" />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              <span className="text-cyan-spec">Cedar</span> is seated across the
              oak conference table at <span className="text-violet-spec">Spectra Studio Zürich</span>.
              Behind them, a whiteboard holds a 9-node graph annotated in fuchsia
              and orange — a continuation of Tuesday&apos;s discussion on{" "}
              <span className="text-aurora">cognitive consent boundaries</span>.
              An open <span className="text-amber-spec">MacBook</span> displays a
              draft of the Aurora L4 spec. Lighting is calm, ambient at 320lx,
              colour temperature 4200K. No sensitive personal information is in
              frame.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Sentiment", "calm · curious"],
                ["Relevance", "0.86"],
                ["Privacy class", "internal"],
                ["Action items", "3"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                    {k}
                  </div>
                  <div className="mt-1 font-mono text-sm">{v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="aurora">Pipeline</Badge>
                <h3 className="mt-3 font-display text-xl">Inference graph</h3>
              </div>
              <span className="text-[11px] uppercase tracking-widest text-ink-mute">
                42fps
              </span>
            </div>
            <ol className="mt-5 space-y-2 font-mono text-[12px]">
              {[
                ["sense → camera/imu/audio", "0.04ms"],
                ["enc → vision-encoder@v3", "0.18ms"],
                ["fuse → spatial+text+depth", "0.08ms"],
                ["cog → aurora-reason", "0.34ms"],
                ["render → overlay-composer", "0.06ms"],
              ].map(([s, t], i) => (
                <li
                  key={s as string}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink-soft">{s}</span>
                  </span>
                  <span className="text-cyan-spec">{t}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}

function ROIBox({
  x,
  y,
  w,
  h,
  label,
  conf,
  tone,
  highlighted,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  conf: number;
  tone: "cyan" | "violet" | "aurora" | "amber" | "coral";
  highlighted?: boolean;
}) {
  const colorClass = {
    cyan: "border-cyan-spec text-cyan-spec",
    violet: "border-violet-spec text-violet-spec",
    aurora: "border-aurora text-aurora",
    amber: "border-amber-spec text-amber-spec",
    coral: "border-coral text-coral",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
      }}
    >
      <div
        className={`relative h-full w-full rounded-md border ${colorClass} ${
          highlighted ? "shadow-[0_0_0_1px_currentColor,0_0_24px_currentColor]" : "opacity-70"
        }`}
        style={{ borderStyle: highlighted ? "solid" : "dashed" }}
      >
        <span className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-current" />
        <span className="absolute -top-1 -right-1 h-2 w-2 border-t border-r border-current" />
        <span className="absolute -bottom-1 -left-1 h-2 w-2 border-b border-l border-current" />
        <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-current" />
      </div>
      <div
        className={`absolute -top-7 left-0 whitespace-nowrap rounded-md gs-glass-strong px-2 py-1 text-[10px] font-mono ${
          highlighted ? "" : "opacity-70"
        }`}
      >
        <span className={colorClass.split(" ")[1]}>{label}</span>
        <span className="ml-1 text-ink-mute">· {conf.toFixed(2)}</span>
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

function SceneIllustration() {
  return (
    <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full opacity-90">
      <defs>
        <radialGradient id="vgrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1d2742" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06070f" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(88,227,255,0.08)" />
          <stop offset="100%" stopColor="rgba(88,227,255,0)" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#vgrad)" />
      {/* Floor / depth lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          x2={1600}
          y1={620 + i * 35}
          y2={620 + i * 35}
          stroke="rgba(88,227,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={i}
          y1={620}
          y2={1000}
          x1={i * 100 - 200}
          x2={(i - 9) * 200 + 800}
          stroke="rgba(140,92,255,0.07)"
          strokeWidth={1}
        />
      ))}
      <rect x="0" y="600" width="1600" height="400" fill="url(#floor)" />

      {/* Person silhouette */}
      <g transform="translate(360,260)" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2">
        <circle cx="60" cy="40" r="42" />
        <path d="M -10 130 q 70 -50 140 0 v 220 h -140 z" fill="rgba(140,92,255,0.06)" />
      </g>

      {/* Whiteboard */}
      <g transform="translate(840,300)" stroke="rgba(140,92,255,0.45)" fill="none">
        <rect x="0" y="0" width="280" height="220" rx="6" stroke="rgba(255,255,255,0.18)" />
        {[
          [40, 70], [110, 50], [200, 80], [60, 140], [150, 130], [220, 150], [40, 190], [120, 200], [220, 200],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="rgba(201,101,255,0.4)" />
          </g>
        ))}
        <path d="M40 70 L110 50 L200 80 L150 130 L220 150 L120 200 L40 190 L60 140 L40 70" stroke="rgba(255,186,106,0.5)" strokeDasharray="4 4" />
      </g>

      {/* Laptop */}
      <g transform="translate(480,640)">
        <rect x="0" y="0" width="280" height="170" rx="10" fill="rgba(106,255,193,0.05)" stroke="rgba(106,255,193,0.4)" />
        <rect x="-20" y="170" width="320" height="14" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" />
      </g>

      {/* Coffee */}
      <g transform="translate(1100,700)" fill="none" stroke="rgba(255,186,106,0.5)">
        <ellipse cx="40" cy="20" rx="46" ry="12" />
        <path d="M-6 20 v 50 a 46 12 0 0 0 92 0 v -50" />
        <path d="M86 30 q 30 8 0 40" />
      </g>

      {/* Plant */}
      <g transform="translate(120,720)" fill="rgba(106,255,193,0.18)" stroke="rgba(106,255,193,0.5)">
        <path d="M50 90 q -40 -60 -10 -100 q 30 30 10 100" />
        <path d="M50 90 q 40 -60 10 -100 q -30 30 -10 100" />
        <rect x="20" y="90" width="60" height="50" />
      </g>

      {/* Holographic spotlight */}
      <radialGradient id="spot" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="rgba(88,227,255,0.16)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <rect width="1600" height="1000" fill="url(#spot)" />
    </svg>
  );
}
