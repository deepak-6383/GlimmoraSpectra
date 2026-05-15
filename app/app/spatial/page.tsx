"use client";

/**
 * /app/spatial — Phase 3 immersive AR experience.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  webcam (full-screen) + R3F holographic overlay          │
 *  │  + wearable HUD chrome (top/bottom/sides)                │
 *  │  + gaze cursor + dwell activation                        │
 *  └──────────────────────────────────────────────────────────┘
 *
 * Two phases of intelligence run side by side:
 *   1. live vision  — webcam frames stream to vision-service which
 *      returns detections → seeded into spatial anchors.
 *   2. demo seed    — when the camera is off (or vision isn't returning
 *      detections yet), a small set of beautiful seed anchors makes the
 *      experience "feel" populated immediately.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CameraFeed, type CameraFeedHandle } from "@/components/live/camera-feed";
import { GazeDwellEngine } from "@/components/spatial/gaze-dwell";
import { WearableHUD } from "@/components/spatial/wearable-hud";
import {
  useSpatialStore,
  type SpatialAnchor,
  pushFrameToSpatial,
  fetchAnchors,
} from "@/lib/spatial";
import { fetchSituation, type Situation } from "@/lib/cognition";
import {
  connectVisionStream,
  useLiveStream,
} from "@/lib/live-stream";
import { getDevToken } from "@/lib/api";

const SpatialScene = dynamic(
  () => import("@/components/spatial/spatial-scene").then((m) => m.SpatialScene),
  {
    ssr: false,
    loading: () => null,
  },
);

const SEED_ANCHORS: SpatialAnchor[] = [
  {
    id: "seed-1",
    user_id: "mira",
    tenant_id: "acme",
    kind: "person",
    label: "Cedar Lin",
    description: "Research Copilot · last met 9:42 today",
    bbox: [0.18, 0.30, 0.18, 0.32],
    depth: 2.6,
    confidence: 0.94,
    importance: 0.85,
    payload: {},
    created_at: 0,
    last_seen_at: 0,
  },
  {
    id: "seed-2",
    user_id: "mira",
    tenant_id: "acme",
    kind: "memory",
    label: "Whiteboard · 9-node graph",
    description: "Tuesday's discussion on consent boundaries",
    bbox: [0.55, 0.22, 0.22, 0.28],
    depth: 2.8,
    confidence: 0.88,
    importance: 0.78,
    payload: {},
    created_at: 0,
    last_seen_at: 0,
  },
  {
    id: "seed-3",
    user_id: "mira",
    tenant_id: "acme",
    kind: "object",
    label: "MacBook · M5",
    description: "Aurora L4 spec draft open",
    bbox: [0.30, 0.62, 0.22, 0.20],
    depth: 2.5,
    confidence: 0.92,
    importance: 0.7,
    payload: {},
    created_at: 0,
    last_seen_at: 0,
  },
  {
    id: "seed-4",
    user_id: "mira",
    tenant_id: "acme",
    kind: "place",
    label: "Spectra Studio · Zürich",
    description: "47.376° N · indoor · 320 lx",
    bbox: [0.78, 0.65, 0.16, 0.12],
    depth: 4.0,
    confidence: 0.99,
    importance: 0.65,
    payload: {},
    created_at: 0,
    last_seen_at: 0,
  },
  {
    id: "seed-5",
    user_id: "mira",
    tenant_id: "acme",
    kind: "note",
    label: '"AGENDA · Q4 cognition"',
    description: "OCR · whiteboard text",
    bbox: [0.04, 0.74, 0.20, 0.08],
    depth: 3.0,
    confidence: 0.81,
    importance: 0.55,
    payload: {},
    created_at: 0,
    last_seen_at: 0,
  },
];

export default function SpatialPage() {
  const camRef = useRef<CameraFeedHandle | null>(null);
  const latestBlobRef = useRef<Blob | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [usingSeed, setUsingSeed] = useState(true);
  const toast = useToast();

  const setAnchors = useSpatialStore((s) => s.setAnchors);
  const setImmersive = useSpatialStore((s) => s.setImmersive);
  const reset = useSpatialStore((s) => s.reset);

  const live = useLiveStream();

  // -----------------------------------------------------------
  // mark immersive on mount → some shell elements can hide
  // -----------------------------------------------------------
  useEffect(() => {
    setImmersive(true);
    return () => {
      setImmersive(false);
      reset();
    };
  }, [setImmersive, reset]);

  // -----------------------------------------------------------
  // dev-token bootstrap
  // -----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    getDevToken()
      .then((t) => {
        if (!cancelled) setToken(t);
      })
      .catch((e) => setError(`auth: ${e?.message ?? e}`));
    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------------------------------------
  // seed anchors immediately so the page feels populated
  // -----------------------------------------------------------
  useEffect(() => {
    if (usingSeed) {
      setAnchors(SEED_ANCHORS);
    }
  }, [usingSeed, setAnchors]);

  // -----------------------------------------------------------
  // keep situation refreshed (best effort, falls back gracefully)
  // -----------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await fetchSituation({ refresh: false, useLLM: false });
        if (!cancelled) setSituation(s);
      } catch {
        // backend may not be reachable — keep seed
      }
    };
    void tick();
    const id = setInterval(() => void tick(), 8_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  // -----------------------------------------------------------
  // when camera + token are on, run vision stream + spatial frames
  // -----------------------------------------------------------
  useEffect(() => {
    if (!token || !cameraOn) return;

    let raf = 0;
    const grab = async () => {
      const cam = camRef.current;
      if (cam?.isReady()) {
        const blob = await cam.capture(0.55);
        if (blob) latestBlobRef.current = blob;
      }
      raf = window.setTimeout(grab, 130) as unknown as number;
    };
    grab();

    const stop = connectVisionStream({
      deviceId: "spatial-demo",
      token,
      getNextFrame: () => {
        const b = latestBlobRef.current;
        latestBlobRef.current = null;
        return b;
      },
      fps: 5,
    });

    return () => {
      window.clearTimeout(raf);
      stop();
    };
  }, [token, cameraOn]);

  // -----------------------------------------------------------
  // forward each fresh vision frame into spatial anchors
  // -----------------------------------------------------------
  useEffect(() => {
    if (!live.latestFrame) return;
    if (!live.latestFrame.detections?.length && !live.latestFrame.text?.length) {
      return;
    }
    setUsingSeed(false);
    void pushFrameToSpatial({
      detections: live.latestFrame.detections,
      text: live.latestFrame.text,
      scene_caption: live.latestFrame.scene_caption ?? null,
    })
      .then(() => fetchAnchors())
      .then((anchors) => {
        if (anchors.length) setAnchors(anchors);
      })
      .catch(() => {
        // ignore — keep last anchors visible
      });
  }, [live.latestFrame, setAnchors]);

  const onResetSeed = useCallback(() => {
    setUsingSeed(true);
    setAnchors(SEED_ANCHORS);
    toast({
      title: "Seed anchors loaded",
      description: "Demo overlays are pinned for inspection.",
      tone: "info",
    });
  }, [setAnchors, toast]);

  return (
    <div className="relative min-h-[calc(100vh-100px)] overflow-hidden rounded-[24px] border border-white/10 bg-void">
      <div
        className="relative h-[calc(100vh-120px)] min-h-[640px] w-full overflow-hidden rounded-[24px]"
      >
        {/* webcam — fullscreen background */}
        <CameraFeed
          ref={camRef}
          active={cameraOn}
          onError={(e) => setError(`camera: ${e.message}`)}
          className="absolute inset-0"
        >
          {/* fallback: ambient gradient when camera is off */}
          {!cameraOn && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 60% at 30% 30%, rgba(140,92,255,0.45), transparent 70%), " +
                  "radial-gradient(80% 70% at 80% 70%, rgba(88,227,255,0.35), transparent 70%), " +
                  "linear-gradient(180deg, #0a0d1f 0%, #03040a 100%)",
              }}
            />
          )}

          {/* gaze + anchors layer (R3F) */}
          <SpatialScene className="absolute inset-0 z-10" />

          {/* dwell engine — pure JS, no DOM */}
          <GazeDwellEngine />

          {/* HUD chrome */}
          <WearableHUD
            situation={
              situation
                ? {
                    kind: situation.kind,
                    summary: situation.summary,
                    emotion: situation.emotion,
                    social_density: situation.social_density,
                  }
                : null
            }
            battery={Math.max(2, 92 - Math.floor(Date.now() / 60000) % 30)}
            fps={cameraOn ? 42 : 0}
          />

          {/* mode toggle bar (floating, top-left under HUD) */}
          <div className="pointer-events-auto absolute left-4 top-16 z-20 flex flex-col gap-2 sm:left-6 sm:top-20">
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur-md transition ${
                cameraOn
                  ? "border border-aurora/40 bg-aurora/15 text-aurora"
                  : "border border-white/15 bg-white/[0.06] text-white"
              }`}
            >
              <Icon name={cameraOn ? "pause" : "camera"} className="h-3 w-3" />
              {cameraOn ? "vision live" : "start vision"}
            </button>
            <button
              type="button"
              onClick={onResetSeed}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur-md hover:bg-white/[0.10]"
            >
              <Icon name="sparkles" className="h-3 w-3 text-cyan-spec" />
              demo anchors
            </button>
            <Link
              href="/app/dashboard"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur-md hover:bg-white/[0.10]"
            >
              <Icon name="arrow" className="h-3 w-3" />
              exit immersive
            </Link>
          </div>

          {/* bottom-left attribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pointer-events-none absolute bottom-4 left-4 z-20 hidden items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/70 sm:flex"
          >
            <Badge tone="aurora" pulse>
              phase 3
            </Badge>
            spectra spatial os · v3
          </motion.div>

          {error && (
            <div className="pointer-events-auto absolute right-4 top-20 z-30 max-w-xs rounded-2xl border border-coral/40 bg-coral/15 p-3 text-xs text-coral backdrop-blur-md">
              {error}
            </div>
          )}
        </CameraFeed>
      </div>

      {/* below-canvas explainer (visible without overlapping the AR) */}
      <div className="border-t border-white/10 bg-black/40 px-5 py-4 text-xs text-white/60 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-cyan-spec">spatial</span> ·{" "}
            <span className="text-white/85">
              hold the cursor on any anchor for 800 ms to activate it
            </span>
            <span className="mx-2 text-white/30">·</span>
            anchors render above the live camera feed in real 3D
          </div>
          <div className="flex items-center gap-2 text-white/45">
            <Icon name="zap" className="h-3 w-3 text-cyan-spec" />
            R3F · GLSL · WebGL
            <span className="mx-2 text-white/30">·</span>
            <Icon name="layers" className="h-3 w-3 text-violet-spec" />
            holographic ui
            <span className="mx-2 text-white/30">·</span>
            <Icon name="eye" className="h-3 w-3 text-aurora" />
            gaze-aware
          </div>
        </div>
      </div>
    </div>
  );
}
