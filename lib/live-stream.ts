"use client";

import { create } from "zustand";
import type { VisionFramePayload, InteractEvent } from "./api";

/**
 * Phase 1 live state — the central source of truth for /app/live.
 *
 * Two streams converge here:
 *   1. Vision-service WS  → onVisionFrame()    (per-frame analysis)
 *   2. Stream-service WS  → onPlatformEvent()  (kafka-fanout events)
 *   3. /v1/agents/interact NDJSON → onInteractEvent() (full pipeline)
 */

export type DeviceTelemetry = {
  device_id: string;
  battery_pct?: number;
  thermal_c?: number;
  fps?: number;
  rssi?: number;
  metrics?: Record<string, number>;
  ts: number;
};

export type AgentTrace = {
  step: number;
  agent: string;
  kind: string;
  payload: Record<string, any>;
  ts: number;
};

export type MemoryHit = { id?: string; score?: number; payload?: any };

export type LiveStatus = "idle" | "connecting" | "live" | "error";

type LiveState = {
  visionStatus: LiveStatus;
  streamStatus: LiveStatus;
  latestFrame: (VisionFramePayload & { receivedAt: number }) | null;
  framesProcessed: number;
  lastFrameLatencyMs: number | null;

  telemetry: DeviceTelemetry | null;
  alerts: { device_id: string; severity: string; code: string; message: string; ts: number }[];

  memoryHits: MemoryHit[];
  contextText: string | null;
  reply: string | null;
  replyStreaming: boolean;

  agentTraces: AgentTrace[];

  interactionCount: number;

  setVisionStatus: (s: LiveStatus) => void;
  setStreamStatus: (s: LiveStatus) => void;
  onVisionFrame: (frame: VisionFramePayload) => void;
  onPlatformEvent: (event: any) => void;
  onInteractEvent: (event: InteractEvent) => void;
  startInteraction: () => void;
  endInteraction: () => void;
  reset: () => void;
};

export const useLiveStream = create<LiveState>((set, get) => ({
  visionStatus: "idle",
  streamStatus: "idle",
  latestFrame: null,
  framesProcessed: 0,
  lastFrameLatencyMs: null,
  telemetry: null,
  alerts: [],
  memoryHits: [],
  contextText: null,
  reply: null,
  replyStreaming: false,
  agentTraces: [],
  interactionCount: 0,

  setVisionStatus: (s) => set({ visionStatus: s }),
  setStreamStatus: (s) => set({ streamStatus: s }),

  onVisionFrame: (frame) =>
    set((state) => ({
      latestFrame: { ...frame, receivedAt: Date.now() },
      framesProcessed: state.framesProcessed + 1,
      lastFrameLatencyMs: frame.metrics?.elapsed_ms ?? null,
    })),

  onPlatformEvent: (event) => {
    const type = event?.type ?? "";
    const data = event?.data ?? event?.payload ?? {};
    if (type === "device.telemetry") {
      set({
        telemetry: {
          device_id: data.device_id,
          battery_pct: data.battery_pct,
          thermal_c: data.thermal_c,
          fps: data.fps,
          rssi: data.rssi,
          metrics: data.metrics,
          ts: Date.now(),
        },
      });
    } else if (type === "device.alert") {
      set((state) => ({
        alerts: [
          {
            device_id: data.device_id,
            severity: data.severity,
            code: data.code,
            message: data.message,
            ts: Date.now(),
          },
          ...state.alerts,
        ].slice(0, 8),
      }));
    } else if (type === "agent.task.started" || type === "agent.task.completed") {
      set((state) => ({
        agentTraces: [
          {
            step: 0,
            agent: data.agent || "aurora",
            kind: type.endsWith("started") ? "task.started" : "task.completed",
            payload: data,
            ts: Date.now() / 1000,
          },
          ...state.agentTraces,
        ].slice(0, 60),
      }));
    } else if (type === "memory.episode.created") {
      set((state) => ({
        memoryHits: [
          { id: data.episode_id, payload: data },
          ...state.memoryHits,
        ].slice(0, 12),
      }));
    }
  },

  onInteractEvent: (event) => {
    if (event.kind === "vision") {
      // already covered by the vision WS, but keep frame_id parity
    } else if (event.kind === "memory") {
      set({ memoryHits: event.payload.hits.slice(0, 8) });
    } else if (event.kind === "context") {
      set({ contextText: event.payload.text });
    } else if (event.kind === "agent") {
      const trace: AgentTrace = {
        step: event.payload.step,
        agent: event.payload.agent,
        kind: event.payload.kind,
        payload: event.payload.payload || {},
        ts: event.ts,
      };
      set((state) => ({
        agentTraces: [trace, ...state.agentTraces].slice(0, 80),
        reply:
          event.payload.kind === "reply"
            ? String(event.payload.payload?.text || "")
            : state.reply,
      }));
    } else if (event.kind === "done") {
      set({ replyStreaming: false });
    }
  },

  startInteraction: () =>
    set((s) => ({
      replyStreaming: true,
      reply: null,
      contextText: null,
      memoryHits: [],
      agentTraces: [],
      interactionCount: s.interactionCount + 1,
    })),

  endInteraction: () => set({ replyStreaming: false }),

  reset: () =>
    set({
      visionStatus: "idle",
      streamStatus: "idle",
      latestFrame: null,
      framesProcessed: 0,
      lastFrameLatencyMs: null,
      telemetry: null,
      alerts: [],
      memoryHits: [],
      contextText: null,
      reply: null,
      replyStreaming: false,
      agentTraces: [],
      interactionCount: 0,
    }),
}));

// -------------------------------------------------------------------
// Connection helpers — return cleanup functions.
// -------------------------------------------------------------------

import { VISION_BASE, STREAM_BASE, wsUrl } from "./config";

export function connectVisionStream(opts: {
  deviceId: string;
  token: string;
  getNextFrame: () => Blob | null;
  fps: number;
}): () => void {
  const url = `${wsUrl(VISION_BASE, `/v1/vision/stream/${opts.deviceId}`)}?token=${encodeURIComponent(opts.token)}`;
  let closed = false;
  let ws: WebSocket | null = null;
  let interval: ReturnType<typeof setInterval> | null = null;

  const store = useLiveStream.getState();
  store.setVisionStatus("connecting");

  ws = new WebSocket(url);

  ws.onopen = () => {
    if (closed) return;
    useLiveStream.getState().setVisionStatus("live");
    interval = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const blob = opts.getNextFrame();
      if (blob) ws.send(blob);
    }, Math.max(50, 1000 / Math.max(1, opts.fps)));
  };
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data?.type === "heartbeat") return;
      useLiveStream.getState().onVisionFrame(data);
    } catch {
      /* noop */
    }
  };
  ws.onerror = () => {
    useLiveStream.getState().setVisionStatus("error");
  };
  ws.onclose = () => {
    if (!closed) useLiveStream.getState().setVisionStatus("idle");
  };

  return () => {
    closed = true;
    if (interval) clearInterval(interval);
    if (ws && ws.readyState <= 1) ws.close();
  };
}

export function connectPlatformStream(token: string): () => void {
  const url = `${wsUrl(STREAM_BASE, "/v1/stream/live")}?token=${encodeURIComponent(token)}`;
  const ws = new WebSocket(url);
  let closed = false;

  useLiveStream.getState().setStreamStatus("connecting");

  ws.onopen = () => useLiveStream.getState().setStreamStatus("live");
  ws.onmessage = (msg) => {
    try {
      useLiveStream.getState().onPlatformEvent(JSON.parse(msg.data));
    } catch {
      /* noop */
    }
  };
  ws.onerror = () => useLiveStream.getState().setStreamStatus("error");
  ws.onclose = () => {
    if (!closed) useLiveStream.getState().setStreamStatus("idle");
  };

  // pings to keep the connection warm
  const ping = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.send("ping");
  }, 25_000);

  return () => {
    closed = true;
    clearInterval(ping);
    if (ws.readyState <= 1) ws.close();
  };
}
