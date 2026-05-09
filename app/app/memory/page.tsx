"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/ui/stat";

type MemKind = "vision" | "voice" | "doc" | "place" | "person" | "agent";

type Memory = {
  id: string;
  t: string;
  date: string;
  kind: MemKind;
  title: string;
  body: string;
  tags: string[];
  conf: number;
};

const MEMS: Memory[] = [
  {
    id: "m-001",
    t: "08:14",
    date: "Today",
    kind: "voice",
    title: "Standup with Aurora team",
    body: "Cedar opened with the cognition spec. 4 risks raised. Action: Mira to draft consent appendix.",
    tags: ["aurora", "spec", "team"],
    conf: 0.94,
  },
  {
    id: "m-002",
    t: "09:42",
    date: "Today",
    kind: "vision",
    title: "Whiteboard · 9-node graph",
    body: "Captured Cedar's diagram on consent boundaries. OCR'd 27 phrases. Linked to memory#48391.",
    tags: ["whiteboard", "ocr", "consent"],
    conf: 0.97,
  },
  {
    id: "m-003",
    t: "11:02",
    date: "Today",
    kind: "doc",
    title: "Q4 forecast — invoice sample",
    body: "Detected three irregular line items. Cedar flagged for review.",
    tags: ["finance", "review"],
    conf: 0.88,
  },
  {
    id: "m-004",
    t: "13:48",
    date: "Today",
    kind: "person",
    title: "Lunch with Mira",
    body: "Topic graph: family · lakes house · cognition retreat (Q1). Sentiment: warm.",
    tags: ["mira", "personal"],
    conf: 0.91,
  },
  {
    id: "m-005",
    t: "16:21",
    date: "Today",
    kind: "vision",
    title: "Studio whiteboard distilled",
    body: "9 actions exported to Agentic Workspace. 3 already in flight.",
    tags: ["actions", "studio"],
    conf: 0.96,
  },
  {
    id: "m-006",
    t: "17:11",
    date: "Today",
    kind: "place",
    title: "Walk · Limmat riverside",
    body: "32 minutes · 4,872 steps · ambient bird audio · 8 voice memos.",
    tags: ["walk", "voice"],
    conf: 0.99,
  },
  {
    id: "m-007",
    t: "21:05",
    date: "Yesterday",
    kind: "agent",
    title: "Cedar · paper synthesis",
    body: "Synthesised 14 sources into 3-slide summary. Stored as memory#48211.",
    tags: ["cedar", "research"],
    conf: 0.93,
  },
  {
    id: "m-008",
    t: "22:30",
    date: "Yesterday",
    kind: "voice",
    title: "Bedtime reflection",
    body: "Logged 3 gratitudes, 2 tensions. Consent: private.",
    tags: ["personal", "private"],
    conf: 0.85,
  },
];

const filters: { k: "all" | MemKind; l: string; tone: "cyan" | "violet" | "aurora" | "amber" | "coral" | "neutral" }[] = [
  { k: "all", l: "All", tone: "neutral" },
  { k: "vision", l: "Vision", tone: "cyan" },
  { k: "voice", l: "Voice", tone: "violet" },
  { k: "doc", l: "Documents", tone: "amber" },
  { k: "place", l: "Places", tone: "aurora" },
  { k: "person", l: "People", tone: "coral" },
  { k: "agent", l: "Agents", tone: "violet" },
];

const kindIcon: Record<MemKind, string> = {
  vision: "eye",
  voice: "mic",
  doc: "image",
  place: "map",
  person: "users",
  agent: "agent",
};

export default function MemoryPage() {
  const [active, setActive] = useState<Memory>(MEMS[1]);
  const [kind, setKind] = useState<"all" | MemKind>("all");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      MEMS.filter((m) => (kind === "all" || m.kind === kind))
        .filter((m) =>
          q
            ? (m.title + " " + m.body + " " + m.tags.join(" "))
                .toLowerCase()
                .includes(q.toLowerCase())
            : true,
        ),
    [kind, q],
  );

  return (
    <>
      <PageHeader
        eyebrow="Memory engine"
        title={<>Your perception, <span className="gs-text-aurora">queryable.</span></>}
        description="Every event, every conversation, every glance — woven into a private, semantic timeline you can recall in plain language."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Icon name="download" className="h-4 w-4" /> Export
            </Button>
            <Button variant="spectral" size="sm">
              <Icon name="sparkles" className="h-4 w-4" /> Ask memory
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel className="p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder='“that diagram from Tuesday with the orange arrows”'
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm outline-none transition focus:border-cyan-spec/60 focus:bg-white/[0.07]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.k}
                    type="button"
                    onClick={() => setKind(f.k)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      kind === f.k
                        ? "border-cyan-spec/50 bg-cyan-spec/10 text-cyan-spec"
                        : "border-white/10 bg-white/[0.03] text-ink-soft hover:bg-white/[0.06]"
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-spec/30 via-violet-spec/30 to-transparent" />
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {list.map((m) => (
                    <motion.li
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35 }}
                    >
                      <button
                        type="button"
                        onClick={() => setActive(m)}
                        className={`group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                          active.id === m.id
                            ? "border-cyan-spec/40 bg-cyan-spec/5"
                            : "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="relative z-10 mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                          <Icon
                            name={kindIcon[m.kind]}
                            className={`h-4 w-4 ${
                              m.kind === "vision"
                                ? "text-cyan-spec"
                                : m.kind === "voice"
                                  ? "text-violet-spec"
                                  : m.kind === "doc"
                                    ? "text-amber-spec"
                                    : m.kind === "place"
                                      ? "text-aurora"
                                      : m.kind === "person"
                                        ? "text-coral"
                                        : "text-violet-spec"
                            }`}
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-ink-mute">
                            <span className="font-mono">{m.t}</span>
                            <span>·</span>
                            <span>{m.date}</span>
                            <span className="ml-auto text-cyan-spec/80 font-mono text-[11px]">
                              {(m.conf * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="mt-1 truncate font-medium">{m.title}</div>
                          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{m.body}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {m.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-mute"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5 sm:p-6">
            <Badge tone="cyan">Detail</Badge>
            <h3 className="mt-3 font-display text-lg">{active.title}</h3>
            <div className="mt-1 text-xs text-ink-mute">
              {active.date} · {active.t} · confidence {(active.conf * 100).toFixed(0)}%
            </div>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-spec/15 via-deep to-cyan-spec/10">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 gs-grid-bg opacity-50" />
                <div className="absolute inset-3 rounded-lg border border-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon
                    name={kindIcon[active.kind]}
                    className="h-10 w-10 text-cyan-spec/60"
                  />
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-soft">{active.body}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <Stat2 k="Sentiment" v="warm" />
              <Stat2 k="Privacy" v="private" />
              <Stat2 k="Linked" v="3 events" />
              <Stat2 k="Trust" v="local-only" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Icon name="play" className="h-3.5 w-3.5" /> Replay
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="share" className="h-3.5 w-3.5" /> Share
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="trash" className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Memory pulse</h3>
              <Badge tone="violet" pulse>14d</Badge>
            </div>
            <Sparkline
              className="text-violet-spec mt-3"
              points={[12, 18, 22, 17, 28, 30, 26, 34, 38, 31, 42, 48, 44, 52]}
            />
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Episodes", "12,847"],
                ["Recall hits", "1,403"],
                ["Avg recall latency", "14ms"],
                ["Fully private", "97%"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-xs"
                >
                  <span className="text-ink-mute">{k}</span>
                  <span className="font-mono text-cyan-spec">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Stat2({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">{k}</div>
      <div className="mt-1 font-mono text-[12px] text-ink">{v}</div>
    </div>
  );
}
