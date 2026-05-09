"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/ui/stat";
import { ScanGrid } from "@/components/fx/scan-grid";
import { Waveform } from "@/components/fx/waveform";

const HoloOrb = dynamic(
  () => import("@/components/fx/holo-orb").then((m) => m.HoloOrb),
  { ssr: false },
);

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cognitive hub · live"
        title={
          <>
            Good evening, Mira. <br className="sm:hidden" />
            <span className="gs-text-aurora">Aurora is at full coherence.</span>
          </>
        }
        description="A unified surface for your senses, your memory, and the autonomous workforce moving on your behalf."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Icon name="scan" className="h-4 w-4" /> Scan environment
            </Button>
            <Button variant="spectral" size="sm">
              <Icon name="sparkles" className="h-4 w-4" /> Brief me
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Cognition latency"
          value={420}
          suffix="μs"
          delta="−14%"
          tone="cyan"
          spark={[8, 12, 9, 14, 11, 7, 9, 6, 8, 10, 7, 9, 6, 8, 5, 6]}
        />
        <Stat
          label="Memory ingested"
          value={12847}
          suffix=" events"
          delta="+8.2%"
          tone="violet"
          spark={[10, 18, 14, 22, 19, 26, 30, 28, 36, 31, 38, 44, 42, 50, 58]}
        />
        <Stat
          label="Active agents"
          value={12}
          delta="2 negotiating"
          tone="aurora"
          spark={[2, 3, 2, 4, 5, 4, 6, 7, 6, 8, 9, 10, 11, 11, 12]}
        />
        <Stat
          label="Vision frames"
          value={184_320}
          delta="42fps"
          tone="amber"
          spark={[20, 22, 24, 21, 28, 30, 26, 32, 31, 33, 36, 34, 38, 40, 42]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <motion.div {...fade} className="lg:col-span-8">
          <Panel className="relative overflow-hidden p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <Badge tone="violet" pulse>Aurora · live brief</Badge>
                <h2 className="mt-3 font-display text-xl tracking-tight sm:text-2xl">
                  Your cognitive day
                </h2>
                <p className="text-sm text-ink-mute">
                  Synthesised across 14 sources of memory, 8 calendar events and 3 active flows.
                </p>
              </div>
              <Waveform bars={20} className="!h-9 max-w-[180px]" />
            </div>

            <ul className="mt-6 space-y-3">
              {[
                {
                  i: "users",
                  t: "Mira × Cedar review at 11:00",
                  d: "Cedar drafted a 3-slide synthesis of last week's experiments.",
                  tone: "cyan" as const,
                },
                {
                  i: "compass",
                  t: "Travel hold for ZRH → SFO confirmed",
                  d: "Meridian secured 3 fares; awaiting your tap to commit.",
                  tone: "violet" as const,
                },
                {
                  i: "brain",
                  t: "Memory replay queued",
                  d: "Tuesday whiteboard session distilled into 9 actions.",
                  tone: "aurora" as const,
                },
                {
                  i: "shieldCheck",
                  t: "Trust boundary nominal",
                  d: "0 unauthorised inferences. 4 explicit consents granted today.",
                  tone: "amber" as const,
                },
              ].map((row) => (
                <li
                  key={row.t}
                  className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                >
                  <span
                    className={`mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-${row.tone}-spec`}
                  >
                    <Icon name={row.i} className={`h-4 w-4 text-${row.tone}-spec`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.t}</span>
                      <Badge tone={row.tone}>{row.tone}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{row.d}</p>
                  </div>
                  <Icon name="arrowUpRight" className="h-4 w-4 text-ink-mute" />
                </li>
              ))}
            </ul>
          </Panel>
        </motion.div>

        <motion.div {...fade} className="lg:col-span-4">
          <Panel className="relative h-full overflow-hidden p-5 sm:p-7">
            <ScanGrid />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <Badge>Digital twin</Badge>
                  <h3 className="mt-3 font-display text-xl">Mira · echo</h3>
                </div>
                <Badge tone="aurora" pulse>
                  resonant
                </Badge>
              </div>
              <div className="my-6 flex items-center justify-center">
                <HoloOrb size={200} label="EMBODIED · 0.92" />
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  ["Cognitive bandwidth", "92%", "cyan"],
                  ["Emotional baseline", "calm · focused", "aurora"],
                  ["Energy", "78%", "violet"],
                  ["Suggested rituals", "10m walk · water", "amber"],
                ].map(([k, v, t]) => (
                  <li
                    key={k as string}
                    className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2"
                  >
                    <span className="text-ink-mute">{k}</span>
                    <span className={`font-mono text-[12px] text-${t}-spec`}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </motion.div>

        <motion.div {...fade} className="lg:col-span-7">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="cyan">Activity stream</Badge>
                <h3 className="mt-3 font-display text-xl">Real-time inference</h3>
              </div>
              <span className="text-[11px] uppercase tracking-widest text-ink-mute">
                last 60s
              </span>
            </div>
            <div className="mt-5 space-y-2 font-mono text-[12px] text-ink-soft">
              {[
                ["02s", "vision.detect → 14 ROIs · 1 person · 3 documents", "cyan"],
                ["04s", "memory.write → episode#48391 (calendar context)", "violet"],
                ["07s", "agent.cedar → drafting synthesis (9 sources)", "aurora"],
                ["12s", "speech.transcribe → 312 tokens · confidence 0.97", "amber"],
                ["18s", "policy.consent → user granted: cloud reasoning · 1h", "coral"],
                ["24s", "agent.finch → meeting hold confirmed (Mon 14:00)", "aurora"],
                ["31s", "vision.gaze → focus drift detected · suggesting break", "cyan"],
              ].map(([t, msg, tone]) => (
                <div
                  key={(t as string) + (msg as string)}
                  className="flex gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-1.5"
                >
                  <span className="w-8 text-ink-faint">{t}</span>
                  <span className={`text-${tone}-spec`}>{msg}</span>
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>

        <motion.div {...fade} className="lg:col-span-5">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="violet">Cognition load</Badge>
                <h3 className="mt-3 font-display text-xl">Compute distribution</h3>
              </div>
              <Icon name="cpu" className="h-5 w-5 text-violet-spec" />
            </div>

            <div className="mt-6 space-y-4">
              {[
                { l: "On-device · neural core", v: 64, t: "cyan" },
                { l: "Edge · Aurora mesh", v: 23, t: "violet" },
                { l: "Cloud · sovereign reasoning", v: 13, t: "fuchsia" },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>{r.l}</span>
                    <span className="font-mono">{r.v}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.v}%` }}
                      transition={{ duration: 1, ease: "easeOut" as const }}
                      className={`h-full rounded-full bg-${r.t}-spec gs-shimmer`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-ink-mute">
                  Carbon footprint · 24h
                </div>
                <div className="mt-1 font-display text-lg">2.4g CO₂e</div>
              </div>
              <Sparkline
                className="text-aurora w-44"
                points={[12, 14, 11, 10, 9, 11, 8, 7, 9, 8, 6, 5, 6, 4, 3]}
              />
            </div>
          </Panel>
        </motion.div>
      </div>
    </>
  );
}
