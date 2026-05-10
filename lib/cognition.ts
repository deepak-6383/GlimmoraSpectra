"use client";

/**
 * Phase 2 cognition client.
 *
 * Wraps the new /v1/cognition/... and /v1/users/twin endpoints with
 * typed helpers + an NDJSON streaming generator for the cognitive graph.
 */

import { authedFetch } from "./api";
import { GATEWAY } from "./config";

// =============================================================
//  Types
// =============================================================

export type Situation = {
  id: string;
  user_id: string;
  tenant_id: string;
  kind:
    | "office_meeting"
    | "deep_work"
    | "social"
    | "travel"
    | "shopping"
    | "exercise"
    | "leisure"
    | "commute"
    | "unknown";
  confidence: number;
  summary: string;
  activity: string | null;
  place: string | null;
  social_density: "solo" | "pair" | "small_group" | "crowd";
  detected_people: string[];
  detected_objects: string[];
  ocr_signals: string[];
  emotion: "calm" | "focused" | "excited" | "stressed" | "tired" | "neutral";
  intent: string | null;
  started_at: number;
  duration_s: number;
  extras: Record<string, unknown>;
};

export type Anticipation = {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  description: string;
  confidence: number;
  horizon_s: number;
  suggested_action: string | null;
  rationale: string[];
  created_at: number;
};

export type ActionItem = {
  id: string;
  kind: string;
  risk: "read" | "write" | "external" | "financial";
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  requires_user_confirmation: boolean;
  failure_reason: string | null;
  payload: Record<string, unknown>;
  created_at: number;
  decided_at: number | null;
};

export type GraphNode =
  | "PERCEIVE"
  | "RECALL"
  | "REASON"
  | "PLAN"
  | "REFLECT"
  | "ACT"
  | "RESPOND"
  | "DONE"
  | "ERROR";

export type GraphEvent = {
  node: GraphNode;
  ts: number;
  payload: Record<string, unknown>;
};

export type DigitalTwin = {
  user_id: string;
  tenant_id: string;
  routines: {
    weekday: string;
    hour: number;
    title: string;
    description: string;
    confidence: number;
    occurrences: number;
  }[];
  preferred_tone: string;
  preferred_channels: string[];
  typical_places: string[];
  focus_blocks_minutes: number;
  attention_peak_hours: number[];
  last_signal_at: number | null;
  learning_score: number;
  extras: Record<string, unknown>;
};

// =============================================================
//  Calls
// =============================================================

export async function fetchSituation(opts?: {
  refresh?: boolean;
  useLLM?: boolean;
}): Promise<Situation> {
  const qs = new URLSearchParams();
  if (opts?.refresh) qs.set("refresh", "true");
  if (opts?.useLLM === false) qs.set("use_llm", "false");
  const resp = await authedFetch(`/v1/cognition/situation?${qs}`);
  if (!resp.ok) throw new Error(`situation: ${resp.status}`);
  return resp.json();
}

export async function ingestFrame(
  frame: Pick<
    Situation,
    "detected_objects"
  > & {
    detections?: { label: string; confidence: number; bbox: number[] }[];
    text?: { text: string; confidence: number; bbox: number[] }[];
    faces?: { bbox: number[] }[];
    scene_caption?: string | null;
    metrics?: Record<string, number>;
  },
): Promise<void> {
  await authedFetch("/v1/cognition/frames", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      detections: frame.detections ?? [],
      text: frame.text ?? [],
      faces: frame.faces ?? [],
      scene_caption: frame.scene_caption ?? null,
      metrics: frame.metrics ?? {},
    }),
  });
}

export async function fetchAnticipations(): Promise<Anticipation[]> {
  const resp = await authedFetch("/v1/cognition/anticipations");
  if (!resp.ok) throw new Error(`anticipations: ${resp.status}`);
  return resp.json();
}

export async function fetchActions(): Promise<ActionItem[]> {
  const resp = await authedFetch("/v1/cognition/actions");
  if (!resp.ok) throw new Error(`actions: ${resp.status}`);
  return resp.json();
}

export async function decideAction(
  id: string,
  decision: "approve" | "reject",
  reason?: string,
): Promise<{ id: string; status: string; failure_reason: string | null }> {
  const resp = await authedFetch(`/v1/cognition/actions/${id}/decision`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision, reason }),
  });
  if (!resp.ok) throw new Error(`decide: ${resp.status}`);
  return resp.json();
}

export async function fetchTwin(): Promise<DigitalTwin> {
  const resp = await authedFetch("/v1/users/twin");
  if (!resp.ok) throw new Error(`twin: ${resp.status}`);
  return resp.json();
}

export async function observeTwin(opts: {
  situation_kind: string;
  place?: string;
}): Promise<DigitalTwin> {
  const resp = await authedFetch("/v1/users/twin/observe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!resp.ok) throw new Error(`twin.observe: ${resp.status}`);
  return resp.json();
}

/**
 * Stream the full PERCEIVE → RESPOND graph as NDJSON GraphEvent objects.
 */
export async function* runGraph(opts: {
  prompt: string;
  consent?: string;
  signal?: AbortSignal;
}): AsyncGenerator<GraphEvent> {
  const resp = await authedFetch("/v1/cognition/graph", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      prompt: opts.prompt,
      consent: opts.consent ?? "private",
    }),
    signal: opts.signal,
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`graph: ${resp.status}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as GraphEvent;
      } catch {
        // skip malformed line
      }
    }
  }
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer) as GraphEvent;
    } catch {
      /* noop */
    }
  }
}
