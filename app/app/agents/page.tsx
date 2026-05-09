"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type AgentStatus = "active" | "thinking" | "blocked" | "idle";

type Agent = {
  id: string;
  name: string;
  role: string;
  desc: string;
  tone: "cyan" | "violet" | "aurora" | "amber" | "coral" | "fuchsia";
  status: AgentStatus;
  progress: number;
  steps: number;
  current: string;
};

const AGENTS: Agent[] = [
  { id: "meridian", name: "Meridian", role: "Travel & Logistics", desc: "Negotiates flights, hotels, ground transport — secures fastest, lowest-carbon routes.", tone: "cyan", status: "active", progress: 64, steps: 9, current: "Comparing 3 fares · ZRH→SFO" },
  { id: "cedar", name: "Cedar", role: "Research Copilot", desc: "Synthesises papers, internal docs and slack threads into evidence-grade briefs.", tone: "violet", status: "thinking", progress: 38, steps: 14, current: "Reading 14 sources · drafting outline" },
  { id: "finch", name: "Finch", role: "Calendar & Coordination", desc: "Holds time, books rooms, gracefully renegotiates conflicts without nagging humans.", tone: "aurora", status: "active", progress: 92, steps: 4, current: "Held Mon 14:00 · Mira" },
  { id: "vesper", name: "Vesper", role: "Vision Curator", desc: "Indexes everything you see — surfaces stills, OCRs documents, captions whiteboards.", tone: "amber", status: "idle", progress: 100, steps: 1, current: "Watchful · 248 frames today" },
  { id: "ember", name: "Ember", role: "Health & Rituals", desc: "Tracks energy, hydration and posture; nudges you back to your rituals when you drift.", tone: "coral", status: "blocked", progress: 12, steps: 5, current: "Awaiting consent · biometrics" },
  { id: "atlas", name: "Atlas", role: "Knowledge Graph", desc: "Connects everything Spectra has ever ingested into a shared neural lattice.", tone: "fuchsia", status: "active", progress: 71, steps: 12, current: "Linking 84 episodes" },
];

const statusBadge: Record<AgentStatus, { tone: "aurora" | "violet" | "coral" | "neutral"; label: string }> = {
  active: { tone: "aurora", label: "active" },
  thinking: { tone: "violet", label: "thinking" },
  blocked: { tone: "coral", label: "needs you" },
  idle: { tone: "neutral", label: "idle" },
};

export default function AgentsPage() {
  const [active, setActive] = useState(AGENTS[0]);

  return (
    <>
      <PageHeader
        eyebrow="Agentic workspace · 12 online"
        title={<>A workforce of <span className="gs-text-gradient">cognition.</span></>}
        description="Composable, auditable agents that act on your behalf — from the cinematic edge of your vision to the boardroom and back."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Icon name="branch" className="h-4 w-4" /> Compose flow
            </Button>
            <Button variant="spectral" size="sm">
              <Icon name="plus" className="h-4 w-4" /> New agent
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {AGENTS.map((a) => (
              <motion.button
                key={a.id}
                whileHover={{ y: -2 }}
                onClick={() => setActive(a)}
                className={`text-left ${active.id === a.id ? "" : ""}`}
              >
                <Panel
                  className={`relative h-full p-5 transition ${
                    active.id === a.id
                      ? "ring-1 ring-cyan-spec/40"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="relative h-10 w-10 flex-none rounded-2xl"
                      style={{
                        background:
                          a.tone === "cyan"
                            ? "conic-gradient(from 0deg, #58e3ff, #4f7dff)"
                            : a.tone === "violet"
                              ? "conic-gradient(from 0deg, #8c5cff, #58e3ff)"
                              : a.tone === "aurora"
                                ? "conic-gradient(from 0deg, #6affc1, #58e3ff)"
                                : a.tone === "amber"
                                  ? "conic-gradient(from 0deg, #ffba6a, #c965ff)"
                                  : a.tone === "coral"
                                    ? "conic-gradient(from 0deg, #ff7a8d, #c965ff)"
                                    : "conic-gradient(from 0deg, #c965ff, #4f7dff)",
                      }}
                    >
                      <div className="absolute inset-[2px] rounded-[14px] bg-deep flex items-center justify-center">
                        <Icon name="agent" className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.name}</span>
                        <Badge tone={statusBadge[a.status].tone} pulse={a.status === "active"}>
                          {statusBadge[a.status].label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-ink-mute">{a.role}</div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{a.desc}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-ink-mute">
                      <span>{a.current}</span>
                      <span className="font-mono">{a.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.progress}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" as const }}
                        className={`h-full rounded-full bg-${a.tone}-spec gs-shimmer`}
                      />
                    </div>
                  </div>
                </Panel>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone={active.tone === "fuchsia" ? "violet" : active.tone}>
                  {active.role}
                </Badge>
                <h3 className="mt-3 font-display text-2xl">{active.name}</h3>
              </div>
              <Badge tone={statusBadge[active.status].tone} pulse={active.status === "active"}>
                {statusBadge[active.status].label}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{active.desc}</p>

            <div className="mt-5 space-y-2 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                Current trace
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4 font-mono text-[12px] leading-relaxed">
                <p>
                  <span className="text-cyan-spec">{active.id}.observe</span>(context) → ok
                </p>
                <p className="pl-3 text-ink-soft">
                  <span className="text-violet-spec">plan.draft</span>(steps={active.steps}) → 3 paths
                </p>
                <p className="pl-6 text-ink-soft">
                  <span className="text-aurora">policy.check</span>() → consent: granted
                </p>
                <p className="pl-9 text-ink-soft">
                  <span className="text-amber-spec">act.run</span>("{active.current}")
                  <span className="ml-1 text-ink-mute gs-caret">▌</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Icon name="play" className="h-3.5 w-3.5" /> Run
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="pause" className="h-3.5 w-3.5" /> Pause
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="branch" className="h-3.5 w-3.5" /> Inspect plan
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="settings" className="h-3.5 w-3.5" /> Configure
              </Button>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Orchestration map</h3>
              <Icon name="workflow" className="h-5 w-5 text-violet-spec" />
            </div>
            <FlowGraph />
            <ul className="mt-4 space-y-2 text-xs">
              {[
                ["aurora.observe", "→ cedar.summarise", "aurora"],
                ["cedar.summarise", "→ finch.schedule", "violet"],
                ["finch.schedule", "→ meridian.book", "cyan"],
                ["meridian.book", "→ awaiting human", "coral"],
              ].map(([a, b, t]) => (
                <li
                  key={a as string}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2"
                >
                  <span className={`h-1.5 w-1.5 rounded-full bg-${t}-spec`} />
                  <span className="font-mono text-cyan-spec">{a}</span>
                  <span className="text-ink-mute">{b}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function FlowGraph() {
  return (
    <svg viewBox="0 0 360 200" className="mt-4 h-44 w-full">
      <defs>
        <linearGradient id="fgrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#58e3ff" />
          <stop offset="100%" stopColor="#c965ff" />
        </linearGradient>
      </defs>
      {[
        [40, 100, "Aurora", "#58e3ff"],
        [140, 50, "Cedar", "#8c5cff"],
        [140, 150, "Vesper", "#ffba6a"],
        [240, 50, "Finch", "#6affc1"],
        [240, 150, "Atlas", "#c965ff"],
        [320, 100, "Meridian", "#ff7a8d"],
      ].map(([x, y, label, c], i) => (
        <g key={i}>
          <circle
            cx={x as number}
            cy={y as number}
            r={20}
            fill={`${c as string}20`}
            stroke={c as string}
            strokeWidth="1"
          />
          <circle
            cx={x as number}
            cy={y as number}
            r={5}
            fill={c as string}
          >
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="2s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={x as number}
            y={(y as number) + 36}
            textAnchor="middle"
            fontSize="9"
            fill="#c4cae6"
          >
            {label as string}
          </text>
        </g>
      ))}
      {[
        [40, 100, 140, 50],
        [40, 100, 140, 150],
        [140, 50, 240, 50],
        [140, 150, 240, 150],
        [240, 50, 320, 100],
        [240, 150, 320, 100],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="url(#fgrad)"
          strokeWidth="1.2"
          strokeDasharray="2 4"
          opacity="0.5"
        />
      ))}
    </svg>
  );
}
