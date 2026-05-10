"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";

const SpectraLens3D = dynamic(
  () => import("@/components/spectra-lens-3d").then((m) => m.SpectraLens3D),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 m-auto flex items-center justify-center">
        <div className="h-32 w-64 rounded-3xl bg-gradient-to-br from-cyan-spec/30 to-violet-spec/30 blur-2xl" />
      </div>
    ),
  },
);

const FRAME_COLORS = [
  { id: "midnight", name: "Midnight Onyx", frame: "#0d0d10", swatch: "#0d0d10" },
  { id: "graphite", name: "Graphite", frame: "#22232a", swatch: "#2c2d36" },
  { id: "havana", name: "Havana Tortoise", frame: "#3a2118", swatch: "#5a3322" },
  { id: "platinum", name: "Platinum Silver", frame: "#9aa0aa", swatch: "#bcc1cc" },
  { id: "violet", name: "Violet Ion", frame: "#3a2658", swatch: "#6a44a8" },
];

const LENS_COLORS = [
  { id: "smoke", name: "Smoke", lens: "#1a1f2a", swatch: "#2a2f3a" },
  { id: "amber", name: "Amber Aurora", lens: "#3a2616", swatch: "#a06a3a" },
  { id: "cyan", name: "Cyan Mirror", lens: "#0a2230", swatch: "#1d6488" },
  { id: "violet", name: "Violet Mirror", lens: "#1d0d36", swatch: "#5128a4" },
  { id: "clear", name: "Photochromic Clear", lens: "#aab8c8", swatch: "#dde6ee" },
];

export default function LensPage() {
  const [frame, setFrame] = useState(FRAME_COLORS[0]);
  const [lens, setLens] = useState(LENS_COLORS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const toast = useToast();

  return (
    <>
      <PageHeader
        eyebrow="Spectra Lens · v3 Aurora"
        title={
          <>
            See the future, <span className="gs-text-aurora">on your face.</span>
          </>
        }
        description="A real-time 3D preview of the Spectra Lens. Drag to rotate, swap colorways, study every angle of the device that ships with your tier."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate((v) => !v)}
            >
              <Icon name={autoRotate ? "pause" : "play"} className="h-4 w-4" />
              {autoRotate ? "Stop spin" : "Auto-rotate"}
            </Button>
            <Button
              variant="spectral"
              size="sm"
              onClick={() => {
                toast({
                  title: "Pre-order opened",
                  description: `${frame.name} · ${lens.name} · pairs with your account on ship.`,
                  tone: "success",
                });
              }}
            >
              <Icon name="sparkles" className="h-4 w-4" /> Reserve this look
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* 3D viewer */}
        <div className="lg:col-span-8">
          <Panel className="relative overflow-hidden p-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[22px] bg-gradient-to-br from-deep via-graphite to-deep">
              <SpectraLens3D
                className="absolute inset-0"
                frame={frame.frame}
                lens={lens.lens}
                autoRotate={autoRotate}
              />
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-aurora gs-pulse" />
                live preview · v3 Aurora
              </div>
              <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 font-mono text-[11px]">
                {frame.name.split(" ")[0]} · {lens.name.split(" ")[0]}
              </div>
            </div>
          </Panel>

          {/* Color pickers below the viewer */}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Panel className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone="cyan">Frame</Badge>
                <span className="text-[11px] text-ink-mute">{frame.name}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {FRAME_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFrame(c)}
                    aria-label={c.name}
                    aria-pressed={frame.id === c.id}
                    className={`group relative h-10 w-10 rounded-full border-2 transition-all ${
                      frame.id === c.id
                        ? "border-cyan-spec scale-110 shadow-[0_0_20px_rgba(88,227,255,0.5)]"
                        : "border-white/15 hover:border-white/40"
                    }`}
                    style={{ background: c.swatch }}
                  >
                    {frame.id === c.id && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-spec text-[10px] text-deep">
                        <Icon name="check" className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone="violet">Lens</Badge>
                <span className="text-[11px] text-ink-mute">{lens.name}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {LENS_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setLens(c)}
                    aria-label={c.name}
                    aria-pressed={lens.id === c.id}
                    className={`group relative h-10 w-10 rounded-full border-2 transition-all ${
                      lens.id === c.id
                        ? "border-violet-spec scale-110 shadow-[0_0_20px_rgba(140,92,255,0.5)]"
                        : "border-white/15 hover:border-white/40"
                    }`}
                    style={{ background: c.swatch }}
                  >
                    {lens.id === c.id && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-spec text-[10px] text-deep">
                        <Icon name="check" className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* Specs */}
        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5 sm:p-6">
            <Badge tone="aurora" pulse>
              In stock · ships in 3 weeks
            </Badge>
            <h3 className="mt-3 font-display text-2xl">Spectra Lens · v3 Aurora</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Optical waveguide HD. 112° FOV. Aurora cognition core. 14h battery
              life. Surgical-grade titanium hinges.
            </p>

            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                ["Display", "Optical waveguide · HD per eye", "cyan"],
                ["Field of view", "112°", "violet"],
                ["Cognition core", "Aurora L4 on-device", "aurora"],
                ["Battery", "14 h mixed · 8 h vision-on", "amber"],
                ["Weight", "38 g", "cyan"],
                ["Frame", "Acetate / titanium hinges", "violet"],
                ["Cameras", "12 MP · ultra-wide · LiDAR", "aurora"],
                ["Audio", "Bone-conduction + open-ear", "amber"],
                ["Connectivity", "Wi-Fi 7 · BLE · UWB · 5G SA", "cyan"],
              ].map(([k, v, t]) => (
                <li
                  key={k as string}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-xs"
                >
                  <span className="text-ink-mute">{k}</span>
                  <span className={`font-mono text-${t}-spec`}>{v}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                  retail
                </div>
                <div className="mt-1 font-display text-xl">$1,899</div>
              </div>
              <div className="rounded-xl border border-cyan-spec/20 bg-cyan-spec/[0.05] p-3">
                <div className="text-[10px] uppercase tracking-widest text-cyan-spec">
                  founders
                </div>
                <div className="mt-1 font-display text-xl">$1,499</div>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="font-display text-lg">In the box</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["glasses", "Spectra Lens · v3 Aurora"],
                ["device", "Spectra Studio dock + induction tray"],
                ["camera", "Travel case · vegan leather"],
                ["plus", "Photochromic spare lens kit"],
                ["link", "USB-C · Spectra fast-link cable"],
                ["map", "On-site calibration appointment"],
              ].map(([icon, label]) => (
                <li
                  key={label as string}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon
                      name={icon as string}
                      className="h-3.5 w-3.5 text-cyan-spec"
                    />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <h3 className="font-display text-lg">Surface materials</h3>
            <p className="mt-2 text-xs text-ink-mute">
              Each frame is hand-finished with the same composite as aerospace
              optics — anti-fingerprint nano-coating, hydrophobic outer skin,
              recycled bio-acetate core.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["96%", "recycled"],
                ["IP68", "rated"],
                ["+50°C", "thermal"],
              ].map(([v, l]) => (
                <div
                  key={l as string}
                  className="rounded-xl border border-white/10 bg-white/[0.03] py-2"
                >
                  <div className="font-display text-base text-aurora">{v}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
