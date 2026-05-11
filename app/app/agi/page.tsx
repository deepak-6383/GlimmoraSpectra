"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  createGoal,
  decide,
  dismissProactive,
  fetchAGIState,
  patchTask,
  runWorkflow,
  streamEvents,
  triggerReflection,
  type AGIState,
  type AgentSnapshot,
  type AgentStatus,
  type Decision,
  type OrchestratorEvent,
  type ProactiveSuggestion,
  type Reflection,
  type AGIGoal,
  type AGITask,
  type AGIWorkflow,
} from "@/lib/agi";

const STATUS_TONE: Record<AgentStatus, "cyan" | "aurora" | "violet" | "amber" | "coral"> = {
  idle: "cyan",
  thinking: "aurora",
  acting: "violet",
  waiting: "cyan",
  error: "coral",
  sleeping: "amber",
};

const AGENT_ICON: Record<string, string> = {
  vision: "eye",
  context: "compass",
  memory: "brain",
  planning: "layers",
  action: "zap",
  communication: "wave",
  prediction: "sparkles",
  reflection: "activity",
  learning: "chart",
};

export default function AGIPage() {
  const [state, setState] = useState<AGIState | null>(null);
  const [events, setEvents] = useState<OrchestratorEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalSubtasks, setNewGoalSubtasks] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchAGIState();
      setState(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 4000);
    return () => clearInterval(id);
  }, [refresh]);

  // live event stream
  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    (async () => {
      try {
        for await (const msg of streamEvents({ signal: ctrl.signal })) {
          if (msg.type === "event") {
            setEvents((prev) => [msg.data, ...prev].slice(0, 64));
          } else if (msg.type === "snapshot") {
            setState(msg.data);
          }
        }
      } catch {
        // stream dropped; the 4s poll keeps state alive
      }
    })();
    return () => ctrl.abort();
  }, []);

  const handleAddGoal = async () => {
    const title = newGoalTitle.trim();
    if (!title) return;
    setBusy("goal");
    try {
      const subs = newGoalSubtasks
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await createGoal({ title, subtasks: subs, priority: "soon" });
      setNewGoalTitle("");
      setNewGoalSubtasks("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleTaskDone = async (goalId: string, taskId: string) => {
    setBusy(`task:${taskId}`);
    try {
      await patchTask(goalId, taskId, { status: "done", progress: 1 });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleReflect = async () => {
    setBusy("reflect");
    try {
      await triggerReflection();
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const handleDecide = async () => {
    setBusy("decide");
    try {
      await decide([
        { label: "Notify user now", value: 0.7, cost: 0.1, risk: 0.2, skill: "voice.tone_match" },
        { label: "Defer until break", value: 0.6, cost: 0.05, risk: 0.05 },
        { label: "Silently log only", value: 0.3, cost: 0.02, risk: 0.0 },
      ]);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const handleRunWorkflow = async (wid: string) => {
    setBusy(`wf:${wid}`);
    try {
      await runWorkflow(wid);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const handleDismiss = async (sid: string) => {
    setBusy(`dismiss:${sid}`);
    try {
      await dismissProactive(sid);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const agents = state?.agents ?? [];
  const goals = state?.planner?.goals ?? [];
  const reflections = state?.reflections ?? [];
  const decisions = state?.decisions ?? [];
  const proactive = (state?.proactive ?? []).filter((s) => !s.dismissed);
  const workflows = state?.workflows ?? [];
  const skills = state?.learner?.skills ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Phase 5 · autonomous AGI"
        title={
          <>
            A live mind, <span className="gs-text-aurora">always on.</span>
          </>
        }
        description="Nine persistent agents, long-horizon goals, self-reflection, continuous learning and distributed decisioning — all running in one orchestrator process."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              <Icon name="refresh" className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => void handleReflect()} disabled={busy === "reflect"}>
              <Icon name="activity" className="h-4 w-4" /> Reflect now
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      {/* OVERVIEW STRIP */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryStat label="Agents" value={String(agents.length)} hint={`node ${state?.node_id ?? "—"}`} />
        <SummaryStat
          label="Open goals"
          value={String(goals.filter((g) => g.status === "open" || g.status === "active").length)}
          hint={`${goals.length} total`}
        />
        <SummaryStat
          label="Reflections"
          value={String(reflections.length)}
          hint={reflections[reflections.length - 1]?.kind ?? "—"}
        />
        <SummaryStat
          label="Uptime"
          value={state ? formatUptime(state.uptime_s) : "—"}
          hint={`${decisions.length} decisions`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* LEFT — agents + goals */}
        <div className="lg:col-span-8 space-y-5">
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="cyan">Persistent agents</Badge>
              <span className="text-xs text-ink-mute">
                {agents.filter((a) => a.status === "thinking" || a.status === "acting").length} active
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((a) => (
                <AgentCard key={a.kind} agent={a} />
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="violet">Long-term goals</Badge>
              <span className="text-xs text-ink-mute">
                {goals.length} tracked
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-start">
              <input
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Add a goal — e.g. 'prep EU pilot demo'"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-cyan-spec/60"
              />
              <textarea
                value={newGoalSubtasks}
                onChange={(e) => setNewGoalSubtasks(e.target.value)}
                placeholder="Sub-tasks, one per line (optional)"
                rows={2}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-cyan-spec/60"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => void handleAddGoal()}
                disabled={busy === "goal" || !newGoalTitle.trim()}
              >
                <Icon name="sparkles" className="h-4 w-4" /> Add
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              {goals.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-ink-mute">
                  No goals yet — the planner is idle.
                </div>
              )}
              {goals.map((g) => (
                <GoalRow key={g.id} goal={g} busy={busy} onTaskDone={handleTaskDone} />
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="aurora">Autonomous workflows</Badge>
              <span className="text-xs text-ink-mute">{workflows.length} loaded</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {workflows.length === 0 && (
                <div className="col-span-2 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-ink-mute">
                  No workflows registered.
                </div>
              )}
              {workflows.map((wf) => (
                <WorkflowCard
                  key={wf.id}
                  wf={wf}
                  busy={busy === `wf:${wf.id}`}
                  onRun={() => void handleRunWorkflow(wf.id)}
                />
              ))}
            </div>
          </Panel>
        </div>

        {/* RIGHT — reflections + decisions + proactive + stream */}
        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5">
            <Badge tone="cyan">Proactive suggestions</Badge>
            <div className="mt-3 space-y-2">
              {proactive.length === 0 && (
                <div className="text-xs text-ink-mute">Nothing pending.</div>
              )}
              {proactive.map((s) => (
                <ProactiveItem
                  key={s.id}
                  s={s}
                  onDismiss={() => void handleDismiss(s.id)}
                  busy={busy === `dismiss:${s.id}`}
                />
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="violet">Self-reflections</Badge>
              <Button variant="ghost" size="sm" onClick={() => void handleReflect()} disabled={busy === "reflect"}>
                Run
              </Button>
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
              {reflections.slice().reverse().slice(0, 8).map((r) => (
                <ReflectionItem key={r.id} r={r} />
              ))}
              {reflections.length === 0 && (
                <div className="text-xs text-ink-mute">No reflections yet.</div>
              )}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="aurora">Decisions</Badge>
              <Button variant="ghost" size="sm" onClick={() => void handleDecide()} disabled={busy === "decide"}>
                Demo
              </Button>
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
              {decisions.slice().reverse().slice(0, 6).map((d) => (
                <DecisionItem key={d.id} d={d} />
              ))}
              {decisions.length === 0 && (
                <div className="text-xs text-ink-mute">No decisions logged.</div>
              )}
            </div>
          </Panel>

          <Panel className="p-5">
            <Badge tone="cyan">Skill registry</Badge>
            <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
              {skills.length === 0 && (
                <div className="text-xs text-ink-mute">No skills tracked.</div>
              )}
              {skills.map((s) => (
                <div key={s.name} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{s.name}</span>
                    <span className="text-ink-mute">L{s.level} · {Math.round(s.confidence * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-spec to-violet-spec"
                      style={{ width: `${Math.max(2, s.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <Badge tone="violet">Event stream</Badge>
            <div className="mt-3 max-h-72 space-y-1.5 overflow-auto pr-1">
              {events.length === 0 && (
                <div className="text-xs text-ink-mute">Waiting for events…</div>
              )}
              {events.slice(0, 32).map((e) => (
                <div key={e.id} className="text-[11px] leading-snug">
                  <span className="font-mono text-ink-mute">
                    {new Date(e.at * 1000).toLocaleTimeString([], { hour12: false })}
                  </span>{" "}
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-ink-soft">
                    {e.kind}
                  </span>
                  {e.agent && (
                    <span className="ml-1 text-cyan-spec/80">[{e.agent}]</span>
                  )}{" "}
                  <span className="text-ink">{e.summary}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

// =============================================================
//  Pieces
// =============================================================

function SummaryStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel className="p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-ink-mute">{hint}</div>}
    </Panel>
  );
}

function AgentCard({ agent }: { agent: AgentSnapshot }) {
  const tone = STATUS_TONE[agent.status];
  const iconName = AGENT_ICON[agent.kind] ?? "circle";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={iconName} className="h-4 w-4 text-ink-soft" />
          <div className="font-mono text-xs uppercase tracking-widest text-ink">{agent.kind}</div>
        </div>
        <Badge tone={tone}>{agent.status}</Badge>
      </div>
      <div className="mt-2 line-clamp-2 text-[11px] text-ink-mute">{agent.last_summary || "—"}</div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-mute">
        <span>ticks {agent.tick_count}</span>
        {agent.error_count > 0 && (
          <span className="text-coral">err {agent.error_count}</span>
        )}
        <span className="ml-auto">{agent.interval_s.toFixed(1)}s</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-cyan-spec via-aurora to-violet-spec"
          style={{ width: `${Math.max(4, agent.energy * 100)}%` }}
        />
      </div>
    </div>
  );
}

function GoalRow({
  goal,
  busy,
  onTaskDone,
}: {
  goal: AGIGoal;
  busy: string | null;
  onTaskDone: (gid: string, tid: string) => void;
}) {
  const pct = Math.round(goal.progress * 100);
  const priTone =
    goal.priority === "now"
      ? "coral"
      : goal.priority === "soon"
        ? "violet"
        : goal.priority === "later"
          ? "cyan"
          : "aurora";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={priTone as "coral" | "violet" | "cyan" | "aurora"}>
              {goal.priority}
            </Badge>
            <span className="font-display text-sm">{goal.title}</span>
          </div>
          {goal.description && (
            <div className="mt-1 text-[11px] text-ink-mute">{goal.description}</div>
          )}
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-ink-soft">{pct}%</div>
          <div className="text-[10px] uppercase tracking-widest text-ink-mute">
            {goal.status}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-cyan-spec to-aurora"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <ul className="mt-3 space-y-1.5">
        {goal.tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            busy={busy === `task:${t.id}`}
            onDone={() => onTaskDone(goal.id, t.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function TaskRow({
  task,
  busy,
  onDone,
}: {
  task: AGITask;
  busy: boolean;
  onDone: () => void;
}) {
  const done = task.status === "done";
  return (
    <li className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={onDone}
        disabled={busy || done}
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          done ? "border-aurora bg-aurora/30" : "border-white/20 hover:border-cyan-spec"
        }`}
        aria-label="mark done"
      >
        {done && <Icon name="check" className="h-3 w-3 text-ink" />}
      </button>
      <span className={done ? "line-through text-ink-mute" : "text-ink"}>{task.title}</span>
      <span className="ml-auto text-[10px] uppercase tracking-widest text-ink-mute">
        {task.status}
      </span>
    </li>
  );
}

function ReflectionItem({ r }: { r: Reflection }) {
  const tone =
    r.severity >= 0.7 ? "coral" : r.severity >= 0.45 ? "amber" : "cyan";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[11px]">
      <div className="flex items-center justify-between">
        <Badge tone={tone as "coral" | "amber" | "cyan"}>{r.kind}</Badge>
        <span className="text-ink-mute">sev {Math.round(r.severity * 100)}</span>
      </div>
      <div className="mt-1 text-ink">{r.summary}</div>
      {r.improvements.length > 0 && (
        <ul className="mt-1 list-disc pl-4 text-ink-mute">
          {r.improvements.slice(0, 2).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DecisionItem({ d }: { d: Decision }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="font-mono">{d.chosen}</span>
        <span className="text-ink-mute">score {d.score}</span>
      </div>
      <div className="mt-1 text-ink-mute">
        {d.rationale.slice(0, 2).join(" · ")}
      </div>
    </div>
  );
}

function ProactiveItem({
  s,
  busy,
  onDismiss,
}: {
  s: ProactiveSuggestion;
  busy: boolean;
  onDismiss: () => void;
}) {
  const tone =
    s.tone === "warning"
      ? "coral"
      : s.tone === "opportunity"
        ? "aurora"
        : s.tone === "nudge"
          ? "violet"
          : "cyan";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Badge tone={tone as "coral" | "aurora" | "violet" | "cyan"}>{s.tone}</Badge>
          <div className="mt-1 font-display text-sm">{s.title}</div>
          {s.body && <div className="mt-1 text-[11px] text-ink-mute">{s.body}</div>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="rounded-full p-1 text-ink-mute hover:text-ink"
          aria-label="dismiss"
        >
          <Icon name="x" className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-ink-mute">
        conf {Math.round(s.confidence * 100)}% · {s.delivered ? "delivered" : "pending"}
      </div>
    </div>
  );
}

function WorkflowCard({
  wf,
  busy,
  onRun,
}: {
  wf: AGIWorkflow;
  busy: boolean;
  onRun: () => void;
}) {
  const tone =
    wf.status === "succeeded"
      ? "aurora"
      : wf.status === "failed"
        ? "coral"
        : wf.status === "running"
          ? "violet"
          : "cyan";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between">
        <Badge tone={tone as "aurora" | "coral" | "violet" | "cyan"}>{wf.status}</Badge>
        <Button variant="ghost" size="sm" onClick={onRun} disabled={busy}>
          Run
        </Button>
      </div>
      <div className="mt-2 font-display text-sm">{wf.title}</div>
      {wf.description && (
        <div className="mt-0.5 text-[11px] text-ink-mute">{wf.description}</div>
      )}
      <ol className="mt-2 space-y-1 text-[11px] text-ink-soft">
        {wf.steps.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                s.status === "succeeded"
                  ? "bg-aurora"
                  : s.status === "failed"
                    ? "bg-coral"
                    : s.status === "running"
                      ? "bg-violet-spec"
                      : "bg-white/30"
              }`}
            />
            <span className="font-mono">{s.name}</span>
            <span className="text-ink-mute">·</span>
            <span className="text-ink-mute">{s.handler_key}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatUptime(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
