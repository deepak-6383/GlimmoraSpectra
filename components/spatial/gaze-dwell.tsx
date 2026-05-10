"use client";

/**
 * GazeDwellEngine — drives the dwell timer + activation logic.
 *
 * Watches the cursor's NDC position (in store) against every anchor's
 * bbox center. Whichever anchor the cursor is closest to (within a
 * threshold) becomes the "focused" anchor. After a continuous focus
 * period (default 800 ms), the anchor is "activated".
 *
 * No 3D — runs as a tiny effect outside the canvas, cheap.
 */

import { useEffect, useRef } from "react";
import { useSpatialStore } from "@/lib/spatial";

const FOCUS_RADIUS_NDC = 0.12;
const ACTIVATE_AT_MS = 800;

export function GazeDwellEngine() {
  const lastTickRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lastFocusedRef = useRef<string | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      const state = useSpatialStore.getState();
      const { cursorNDC, anchors } = state;

      // find the closest anchor whose bbox center is within the focus radius
      let closestId: string | null = null;
      let closestDist = Infinity;
      for (const a of anchors) {
        if (!a.bbox) continue;
        // bbox center → NDC ([-1, 1])
        const cx = a.bbox[0] + a.bbox[2] / 2;
        const cy = a.bbox[1] + a.bbox[3] / 2;
        const ax = (cx - 0.5) * 2;
        const ay = -(cy - 0.5) * 2;
        const dx = ax - cursorNDC.x;
        const dy = ay - cursorNDC.y;
        const d = Math.hypot(dx, dy);
        if (d < FOCUS_RADIUS_NDC && d < closestDist) {
          closestDist = d;
          closestId = a.id;
        }
      }

      // dwell accounting
      const dt = lastTickRef.current ? t - lastTickRef.current : 16;
      lastTickRef.current = t;

      if (closestId && closestId === lastFocusedRef.current) {
        accumulatedRef.current += dt;
        state.setDwellMs(accumulatedRef.current);
        if (
          accumulatedRef.current >= ACTIVATE_AT_MS &&
          state.activatedId !== closestId
        ) {
          state.setActivated(closestId);
        }
      } else {
        accumulatedRef.current = 0;
        state.setDwellMs(0);
        if (state.activatedId !== null && closestId !== state.activatedId) {
          state.setActivated(null);
        }
        lastFocusedRef.current = closestId;
        state.setFocused(closestId);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
