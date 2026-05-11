"use client";

/**
 * Phase 5 AGI client.
 * Talks to /v1/agi/* on the gateway. Provides:
 *   - typed REST helpers for agents / goals / reflections / decisions /
 *     learning / proactive suggestions / workflows / blackboard
 *   - an async generator over the NDJSON event stream
 */

import { authedFetch } from "./api";
import { GATEWAY } from "./config";

// =============================================================
//  Types
// =============================================================

export type AgentKind =
  | "vision"
  | "context"
  | "memory"
  | "planning"
  | "action"
  | "communication"
  | "prediction"
  | "reflection"
  | "learning";

export type AgentStatus =
  | "idle"
  | "thinking"
  | "acting"
  | "waiting"
  | "error"
  | "sleeping";

export type AgentSnapshot = {
  kind: AgentKind;
  role: string;
  status: AgentStatus;
  tick_count: number;
  error_count: number;
  last_tick_at: number;
  last_summary: string;
  confidence: number;
  energy: number;
  interval_s: number;
};

export type GoalPriority = "now" | "soon" | "later" | "ambient";
export type GoalStatus = "open" | "active" | "blocked" | "done" | "abandoned";
export type TaskStatus =
  | "pending"
  | "ready"
  | "in_progress"
  | "blocked"
  | "done"
  | "skipped";

export type AGITask = {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  depends_on: string[];
  effort_min: number;
  owner: string;
  progress: number;
  started_at: number | null;
  completed_at: number | null;
  notes: string[];
};

export type AGIGoal = {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  description: string;
  priority: GoalPriority;
  status: GoalStatus;
  deadline_at: number | null;
  created_at: number;
  completed_at: number | null;
  progress: number;
  tags: string[];
  tasks: AGITask[];
};

export type Reflection = {
  id: string;
  kind: "performance" | "quality" | "alignment" | "strategy";
  summary: string;
  observations: string[];
  improvements: string[];
  severity: number;
  created_at: number;
};

export type Skill = {
  name: string;
  level: number;
  confidence: number;
  samples: number;
  last_updated_at: number;
  notes: string[];
};

export type Decision = {
  id: string;
  chosen: string;
  score: number;
  rationale: string[];
  options: Array<{
    label: string;
    value: number;
    cost: number;
    risk: number;
    skill: string | null;
    score: number;
  }>;
  created_at: number;
};

export type ProactiveSuggestion = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "nudge" | "warning" | "opportunity";
  confidence: number;
  deliver_at: number;
  expires_at: number | null;
  delivered: boolean;
  dismissed: boolean;
  payload: Record<string, unknown>;
};

export type WorkflowStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type AGIWorkflow = {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
  user_id: string;
  tenant_id: string;
  created_at: number;
  started_at: number | null;
  ended_at: number | null;
  context: Record<string, unknown>;
  steps: Array<{
    id: string;
    name: string;
    handler_key: string;
    inputs: Record<string, unknown>;
    status: WorkflowStatus;
    output: Record<string, unknown>;
    started_at: number | null;
    ended_at: number | null;
    error: string | null;
  }>;
};

export type BlackboardEntry = {
  id: string;
  topic?: string;
  author: string;
  summary: string;
  payload: Record<string, unknown>;
  importance: number;
  created_at: number;
};

export type OrchestratorEvent = {
  id: string;
  at: number;
  kind: string;
  agent: string | null;
  summary: string;
  payload: Record<string, unknown>;
};

export type AGIState = {
  node_id: string;
  started_at: number;
  uptime_s: number;
  agents: AgentSnapshot[];
  planner: { goals: AGIGoal[]; ready_tasks: AGITask[] };
  reflections: Reflection[];
  learner: { skills: Skill[]; recent_events: unknown[] };
  decisions: Decision[];
  blackboard_topics: string[];
  proactive: ProactiveSuggestion[];
  workflows: AGIWorkflow[];
  recent_events: OrchestratorEvent[];
};

// =============================================================
//  REST helpers
// =============================================================

export async function fetchAGIState(): Promise<AGIState> {
  const r = await authedFetch("/v1/agi/state");
  if (!r.ok) throw new Error(`agi.state: ${r.status}`);
  return r.json();
}

export async function fetchAgents(): Promise<AgentSnapshot[]> {
  const r = await authedFetch("/v1/agi/agents");
  if (!r.ok) throw new Error(`agi.agents: ${r.status}`);
  const json = await r.json();
  return json.agents;
}

export async function fetchGoals(opts?: {
  tenant_id?: string;
  status?: GoalStatus;
}): Promise<AGIGoal[]> {
  const params = new URLSearchParams();
  if (opts?.tenant_id) params.set("tenant_id", opts.tenant_id);
  if (opts?.status) params.set("status", opts.status);
  const qs = params.toString();
  const r = await authedFetch(`/v1/agi/goals${qs ? "?" + qs : ""}`);
  if (!r.ok) throw new Error(`agi.goals: ${r.status}`);
  const json = await r.json();
  return json.goals;
}

export async function createGoal(body: {
  title: string;
  description?: string;
  priority?: GoalPriority;
  tags?: string[];
  subtasks?: string[];
  user_id?: string;
}): Promise<AGIGoal> {
  const r = await authedFetch("/v1/agi/goals", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: body.title,
      description: body.description ?? "",
      priority: body.priority ?? "soon",
      tags: body.tags ?? [],
      subtasks: body.subtasks ?? [],
      user_id: body.user_id ?? "demo",
    }),
  });
  if (!r.ok) throw new Error(`agi.createGoal: ${r.status}`);
  return r.json();
}

export async function patchTask(
  goalId: string,
  taskId: string,
  body: { status?: TaskStatus; progress?: number; note?: string },
): Promise<AGITask> {
  const r = await authedFetch(`/v1/agi/goals/${goalId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`agi.patchTask: ${r.status}`);
  return r.json();
}

export async function triggerReflection(): Promise<Reflection> {
  const r = await authedFetch("/v1/agi/reflections/run", { method: "POST" });
  if (!r.ok) throw new Error(`agi.triggerReflection: ${r.status}`);
  return r.json();
}

export async function fetchDecisions(): Promise<Decision[]> {
  const r = await authedFetch("/v1/agi/decisions");
  if (!r.ok) throw new Error(`agi.decisions: ${r.status}`);
  const json = await r.json();
  return json.decisions;
}

export async function decide(
  options: Array<{
    label: string;
    value?: number;
    cost?: number;
    risk?: number;
    skill?: string;
  }>,
  opts?: { risk_aversion?: number },
): Promise<Decision> {
  const r = await authedFetch("/v1/agi/decisions/decide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      options,
      risk_aversion: opts?.risk_aversion ?? 1.0,
    }),
  });
  if (!r.ok) throw new Error(`agi.decide: ${r.status}`);
  return r.json();
}

export async function fetchProactive(): Promise<ProactiveSuggestion[]> {
  const r = await authedFetch("/v1/agi/proactive");
  if (!r.ok) throw new Error(`agi.proactive: ${r.status}`);
  const json = await r.json();
  return json.suggestions;
}

export async function dismissProactive(sid: string): Promise<void> {
  await authedFetch(`/v1/agi/proactive/${sid}/dismiss`, { method: "POST" });
}

export async function fetchWorkflows(): Promise<AGIWorkflow[]> {
  const r = await authedFetch("/v1/agi/workflows");
  if (!r.ok) throw new Error(`agi.workflows: ${r.status}`);
  const json = await r.json();
  return json.workflows;
}

export async function runWorkflow(wid: string): Promise<AGIWorkflow> {
  const r = await authedFetch(`/v1/agi/workflows/${wid}/run`, { method: "POST" });
  if (!r.ok) throw new Error(`agi.runWorkflow: ${r.status}`);
  return r.json();
}

export async function fetchBlackboard(topic?: string): Promise<
  Record<string, BlackboardEntry[]> | { topic: string; entries: BlackboardEntry[] }
> {
  const path = topic
    ? `/v1/agi/blackboard?topic=${encodeURIComponent(topic)}`
    : "/v1/agi/blackboard";
  const r = await authedFetch(path);
  if (!r.ok) throw new Error(`agi.blackboard: ${r.status}`);
  return r.json();
}

// =============================================================
//  NDJSON stream
// =============================================================

export async function* streamEvents(opts?: {
  signal?: AbortSignal;
}): AsyncGenerator<
  | { type: "snapshot"; data: AGIState }
  | { type: "event"; data: OrchestratorEvent }
> {
  const r = await authedFetch("/v1/agi/stream", { signal: opts?.signal });
  if (!r.ok || !r.body) throw new Error(`agi.stream: ${r.status}`);
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line);
      } catch {
        /* skip malformed line */
      }
    }
  }
}

export const AGI_GATEWAY = GATEWAY;
