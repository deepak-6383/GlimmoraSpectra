"use client";

/**
 * Phase 3 — spatial AR client + state.
 *
 * Talks to /v1/cognition/spatial/* on the backend, plus a Zustand store
 * that the spatial scene + HUD subscribe to.
 */

import { create } from "zustand";
import { authedFetch } from "./api";

// =============================================================
//  Types
// =============================================================

export type AnchorKind = "object" | "person" | "place" | "memory" | "note";

export type SpatialAnchor = {
  id: string;
  user_id: string;
  tenant_id: string;
  kind: AnchorKind;
  label: string;
  description: string;
  bbox: [number, number, number, number] | null;
  depth: number;
  confidence: number;
  importance: number;
  payload: Record<string, unknown>;
  created_at: number;
  last_seen_at: number;
};

export type SpatialScene = {
  user_id: string;
  tenant_id: string;
  indoor: boolean;
  crowd_density: "solo" | "pair" | "small_group" | "crowd";
  room_kind: string;
  illumination: "dim" | "ambient" | "bright" | "stage";
  semantic_zones: string[];
  captured_at: number;
};

// =============================================================
//  Store
// =============================================================

type SpatialState = {
  anchors: SpatialAnchor[];
  scene: SpatialScene | null;
  /** Anchor id currently focused by the gaze cursor (or null). */
  focusedId: string | null;
  /** How long the cursor has been dwelling on the focused anchor (ms). */
  dwellMs: number;
  /** Anchor id that the user has activated (after dwell). */
  activatedId: string | null;
  /** Cursor position in normalized device coords (-1..1). */
  cursorNDC: { x: number; y: number };
  /** True while the wearable HUD chrome is mounted on /app/spatial. */
  isImmersive: boolean;

  setAnchors: (a: SpatialAnchor[]) => void;
  setScene: (s: SpatialScene) => void;
  setFocused: (id: string | null) => void;
  setDwellMs: (ms: number) => void;
  setActivated: (id: string | null) => void;
  setCursorNDC: (x: number, y: number) => void;
  setImmersive: (v: boolean) => void;
  reset: () => void;
};

export const useSpatialStore = create<SpatialState>((set) => ({
  anchors: [],
  scene: null,
  focusedId: null,
  dwellMs: 0,
  activatedId: null,
  cursorNDC: { x: 0, y: 0 },
  isImmersive: false,

  setAnchors: (a) => set({ anchors: a }),
  setScene: (s) => set({ scene: s }),
  setFocused: (id) =>
    set((prev) =>
      prev.focusedId === id
        ? prev
        : { focusedId: id, dwellMs: 0, activatedId: null },
    ),
  setDwellMs: (ms) => set({ dwellMs: ms }),
  setActivated: (id) => set({ activatedId: id }),
  setCursorNDC: (x, y) => set({ cursorNDC: { x, y } }),
  setImmersive: (v) => set({ isImmersive: v }),
  reset: () =>
    set({
      anchors: [],
      scene: null,
      focusedId: null,
      dwellMs: 0,
      activatedId: null,
      cursorNDC: { x: 0, y: 0 },
      isImmersive: false,
    }),
}));

// =============================================================
//  REST helpers
// =============================================================

export async function fetchAnchors(): Promise<SpatialAnchor[]> {
  const resp = await authedFetch("/v1/cognition/spatial/anchors");
  if (!resp.ok) throw new Error(`anchors: ${resp.status}`);
  return resp.json();
}

export async function pushFrameToSpatial(opts: {
  detections?: unknown[];
  text?: unknown[];
  scene_caption?: string | null;
}): Promise<{ anchors_refreshed: number; anchor_ids: string[] }> {
  const resp = await authedFetch("/v1/cognition/spatial/frame", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      detections: opts.detections ?? [],
      text: opts.text ?? [],
      scene_caption: opts.scene_caption ?? null,
    }),
  });
  if (!resp.ok) throw new Error(`spatial.frame: ${resp.status}`);
  return resp.json();
}

export async function fetchSpatialScene(): Promise<SpatialScene> {
  const resp = await authedFetch("/v1/cognition/spatial/scene");
  if (!resp.ok) throw new Error(`scene: ${resp.status}`);
  return resp.json();
}

export async function upsertAnchor(opts: {
  kind?: AnchorKind;
  label: string;
  description?: string;
  bbox?: [number, number, number, number];
  depth?: number;
  confidence?: number;
  importance?: number;
  payload?: Record<string, unknown>;
}): Promise<SpatialAnchor> {
  const resp = await authedFetch("/v1/cognition/spatial/anchors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: opts.kind ?? "object",
      label: opts.label,
      description: opts.description ?? "",
      bbox: opts.bbox,
      depth: opts.depth ?? 3.0,
      confidence: opts.confidence ?? 0.5,
      importance: opts.importance ?? 0.5,
      payload: opts.payload ?? {},
    }),
  });
  if (!resp.ok) throw new Error(`anchor.upsert: ${resp.status}`);
  return resp.json();
}

export async function removeAnchor(id: string): Promise<void> {
  await authedFetch(`/v1/cognition/spatial/anchors/${id}`, { method: "DELETE" });
}

// =============================================================
//  Geometry helpers — normalized bbox → 3D world position
// =============================================================

/**
 * Convert a normalized 0..1 screen-space bbox + depth into a 3D
 * world-space (x, y, z) point in front of a perspective camera at origin.
 *
 * Assumes camera looks down -Z and bbox uses screen coords with origin
 * at top-left. `aspect` is the canvas's width / height.
 */
export function bboxToWorld(
  bbox: [number, number, number, number],
  depth: number,
  fovRad: number,
  aspect: number,
): [number, number, number] {
  const [x, y, w, h] = bbox;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const halfFovTan = Math.tan(fovRad / 2);
  const z = -Math.abs(depth);
  // distance to plane is |z|; visible half-extent at that depth:
  const viewHeight = 2 * halfFovTan * Math.abs(z);
  const viewWidth = viewHeight * aspect;
  const wx = (cx - 0.5) * viewWidth;
  const wy = -(cy - 0.5) * viewHeight; // invert Y (screen vs world)
  return [wx, wy, z];
}
