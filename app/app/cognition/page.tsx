"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  decideAction,
  fetchActions,
  fetchAnticipations,
  fetchSituation,
  fetchTwin,
  runGraph,
  type ActionItem,
  type Anticipation,
  type DigitalTwin,
  type GraphEvent,
  type Situation,
} from "@/lib/cognition";

const SITUATION_TONE: Record<string, "cyan" | "violet" | "aurora" | "amber" | "coral"> = {
  office_meeting: "violet",
  deep_work: "cyan",
  social: "coral",
  travel: "aurora",
  shopping: "amber",
  exercise: "aurora",
  leisure: "violet",
  commute: "amber",
  unknown: "cyan",
};

export default function CognitionPage() {
  const toast = useToast();

  const [situation, setSituation] = useState<Situation | null>(null);
  const [anticipations, setAnticipations] = useState<Anticipation[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [graph, setGraph] = useState<GraphEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "Tell me what's worth my attention right now.",
  );

  const refreshAll = useCallback(async () => {
    try {
      const [s, a, ac, t] = await Promise.all([
        fetchSituation({ refresh: true }).catch(() => null),
        fetchAnticipations().catch(() => []),
        fetchActions().catch(() => []),
        fetchTwin().catch(() => null),
      ]);
      if (s) setSituation(s);
      setAnticipations(a);
      setActions(ac);
      if (t) setTwin(t);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refreshAll();
    const id = setInterval(() => void refreshAll(), 12_000);
    return () => clearInterval(id);
  }, [refreshAll]);

  const onRunGraph = useCallback(async () => {
    if (running || !prompt.trim()) return;
    setRunning(true);
    setGraph([]);
    try {
      for await (const event of runGraph({ prompt })) {
        setGraph((prev) => [...prev, event]);
      }
      toast({
        title: "Cognitive graph complete",
        description: "Plan, reflection, actions and reply all in.",
        tone: "success",
      });
      void refreshAll();
    } catch (e: unknown) {
      toast({
        title: "Graph failed",
        description: e instanceof Error ? e.message : String(e),
        tone: "error",
      });
    } finally {
      setRunning(false);
    }
  }, [prompt, running, refreshAll, toast]);

  const onDecide = useCallback(
    async (id: string, decision: "approve" | "reject") => {
      try {
        await decideAction(id, decision);
        toast({
          title: decision === "approve" ? "Approved" : "Rejected",
          description: `Action ${id.slice(0, 8)} ${decision}d.`,
          tone: decision === "approve" ? "success" : "warning",
        });
        const next = await fetchActions();
        setActions(next);
      } catch (e: unknown) {
        toast({
          title: "Decision failed",
          description: e instanceof Error ? e.message : String(e),
          tone: "error",
        });
      }
    },
    [toast],
  );

  return (
    <>
      <PageHeader
        eyebrow="Phase 2 · cognition"
        title={
          <>
            Aurora&apos;s <span className="gs-text-aurora">situational mind.</span>
          </>
        }
        description="Live situation, anticipations, autonomous actions and your evolving digital twin — wired through the full PERCEIVE → RESPOND graph."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void refreshAll()}>
              <Icon name="refresh" className="h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="spectral"
              size="sm"
              onClick={onRunGraph}
              disabled={running}
            >
              <Icon
                name={running ? "loader" : "sparkles"}
                className={`h-4 w-4 ${running ? "animate-spin" : ""}`}
              />
              {running ? "Reasoning…" : "Run cognitive graph"}
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* situation + graph */}
        <div className="lg:col-span-8 space-y-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={situation ? SITUATION_TONE[situation.kind] : "cyan"} pulse>
                {situation?.kind?.replace("_", " ") ?? "no signal"}
              </Badge>
              <span className="text-[11px] text-ink-mute">
                confidence {((situation?.confidence ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl">
              {situation?.summary || "Aurora is listening for context…"}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <Mini label="Activity" value={situation?.activity ?? "—"} tone="cyan" />
              <Mini
                label="Social"
                value={situation?.social_density ?? "solo"}
                tone="violet"
              />
              <Mini
                label="Emotion"
                value={situation?.emotion ?? "neutral"}
                tone="aurora"
              />
              <Mini
                label="Intent"
                value={situation?.intent ?? "—"}
                tone="amber"
              />
            </div>
            {situation?.detected_objects?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {situation.detected_objects.slice(0, 8).map((o) => (
                  <span
                    key={o}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] uppercase tracking-widest text-ink-mute"
                  >
                    {o}
                  </span>
                ))}
              </div>
            ) : null}
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <Badge tone="violet">Cognitive graph</Badge>
              <span className="text-[11px] uppercase tracking-widest text-ink-mute">
                {running ? "running" : "idle"}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onRunGraph()}
                placeholder="Ask Aurora to reason across her senses, memory and twin…"
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition focus:border-violet-spec/60 focus:bg-white/[0.06]"
              />
              <Button variant="spectral" onClick={onRunGraph} disabled={running}>
                <Icon name="zap" className="h-4 w-4" />
                Reason
              </Button>
            </div>

            <div className="mt-5 space-y-2 font-mono text-[11px]">
              <AnimatePresence initial={false}>
                {graph.length === 0 && !running && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-ink-mute"
                  >
                    No graph events yet — run the graph to see Aurora&apos;s
                    perception, recall, plan, reflection, action gating and reply
                    stream past in order.
                  </motion.p>
                )}
                {graph.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2"
                  >
                    <span className="w-20 text-cyan-spec">{ev.node}</span>
                    <span className="flex-1 text-ink-soft truncate">
                      {summariseEvent(ev)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Panel>

          {/* actions */}
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <Badge tone="amber">Autonomous actions</Badge>
              <span className="text-[11px] text-ink-mute">
                {actions.filter((a) => a.status === "pending").length} awaiting you
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {actions.length === 0 && (
                <li className="text-xs text-ink-mute">
                  no actions queued — run the graph to generate some
                </li>
              )}
              {actions.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-cyan-spec">{a.kind}</span>
                    <span className="text-ink-mute">·</span>
                    <span className="text-ink-mute">risk: {a.risk}</span>
                    <Badge
                      tone={
                        a.status === "executed"
                          ? "aurora"
                          : a.status === "approved"
                            ? "cyan"
                            : a.status === "rejected"
                              ? "coral"
                              : a.status === "failed"
                                ? "coral"
                                : "amber"
                      }
                      className="ml-auto"
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-ink-soft">
                    {String(a.payload?.step ?? a.kind)}
                  </div>
                  {a.failure_reason && (
                    <div className="mt-1 text-[11px] text-coral">
                      {a.failure_reason}
                    </div>
                  )}
                  {a.status === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="spectral"
                        size="sm"
                        onClick={() => onDecide(a.id, "approve")}
                      >
                        <Icon name="check" className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-coral"
                        onClick={() => onDecide(a.id, "reject")}
                      >
                        <Icon name="x" className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* anticipations + twin */}
        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5">
            <Badge tone="aurora" pulse>
              Anticipations
            </Badge>
            <h3 className="mt-3 font-display text-lg">What's next</h3>
            <ul className="mt-3 space-y-2">
              {anticipations.length === 0 && (
                <li className="text-xs text-ink-mute">
                  Aurora is still learning your patterns.
                </li>
              )}
              {anticipations.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
                >
                  <div className="flex items-center gap-2 text-[11px] text-ink-mute">
                    <span className="text-aurora">
                      {(a.confidence * 100).toFixed(0)}%
                    </span>
                    <span>·</span>
                    <span>~{Math.max(1, Math.round(a.horizon_s / 60))} min</span>
                    {a.suggested_action && (
                      <span className="ml-auto rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest">
                        {a.suggested_action}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-medium text-sm">{a.title}</div>
                  <div className="mt-1 text-xs text-ink-soft">{a.description}</div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <Badge tone="violet">Digital twin</Badge>
            <h3 className="mt-3 font-display text-lg">
              {twin
                ? `learning · ${(twin.learning_score * 100).toFixed(0)}%`
                : "warming up"}
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Tone" value={twin?.preferred_tone ?? "calm"} />
              <Row
                label="Focus block"
                value={`${twin?.focus_blocks_minutes ?? 25} min`}
              />
              <Row
                label="Peak hours"
                value={(twin?.attention_peak_hours ?? []).join(", ") || "—"}
              />
              <Row
                label="Typical places"
                value={(twin?.typical_places ?? []).join(" · ") || "—"}
              />
              <Row
                label="Routines"
                value={String(twin?.routines?.length ?? 0)}
              />
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-violet-spec to-cyan-spec gs-shimmer"
                style={{ width: `${(twin?.learning_score ?? 0) * 100}%` }}
              />
            </div>
            {twin?.routines?.length ? (
              <ul className="mt-3 space-y-1.5 text-[11px]">
                {twin.routines.slice(0, 4).map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-1"
                  >
                    <span className="font-mono text-cyan-spec">
                      {r.weekday.slice(0, 3)} · {String(r.hour).padStart(2, "0")}h
                    </span>
                    <span className="truncate text-ink-soft">{r.title}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Panel>
        </div>
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "aurora" | "amber";
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className={`mt-1 font-display text-sm text-${tone}-spec truncate`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-1.5">
      <span className="text-ink-mute">{label}</span>
      <span className="font-mono text-xs text-ink">{value}</span>
    </div>
  );
}

function summariseEvent(ev: GraphEvent): string {
  const p = ev.payload as Record<string, unknown>;
  if (ev.node === "PERCEIVE") {
    const s = (p.situation as { summary?: string })?.summary;
    return s ?? "(situation)";
  }
  if (ev.node === "RECALL") {
    return `${p.hit_count ?? 0} memories · "${String(p.query ?? "").slice(0, 60)}"`;
  }
  if (ev.node === "REASON") return String(p.understanding ?? "").slice(0, 200);
  if (ev.node === "PLAN")
    return `plan: ${(p.plan as string[] | undefined)?.slice(0, 3).join(" → ") ?? ""}`;
  if (ev.node === "REFLECT")
    return `${(p.corrections as string[] | undefined)?.length ?? 0} corrections`;
  if (ev.node === "ACT")
    return `${(p.actions as unknown[] | undefined)?.length ?? 0} actions`;
  if (ev.node === "RESPOND") return String(p.text ?? "").slice(0, 200);
  if (ev.node === "DONE") return `done · ${p.duration_ms ?? "?"}ms`;
  if (ev.node === "ERROR") return String(p.error ?? "error");
  return JSON.stringify(p).slice(0, 200);
}
