"use client";

/**
 * System health client + reactive store.
 *
 * Polls the gateway's `/v1/system/health` aggregator on a configurable
 * cadence and exposes a Zustand store so any UI surface can subscribe
 * (topbar status dot, /app/system dashboard, banners, etc.).
 *
 * The hook is *idempotent* — multiple components calling
 * `useApiHealth()` share a single poll loop.
 */

import { useEffect } from "react";
import { create } from "zustand";
import { GATEWAY } from "./config";

export type ServiceStatus = "up" | "degraded" | "down";

export type ServiceHealth = {
  name: string;
  url: string;
  status: ServiceStatus;
  latency_ms: number;
  http_code?: number;
  error?: string;
  service_response?: Record<string, string>;
};

export type SystemHealth = {
  overall: "operational" | "partial" | "down";
  checked_at: number;
  service_count: number;
  up_count: number;
  services: ServiceHealth[];
  gateway: { version: string; env: string };
};

type State = {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  /** "unreachable" means the gateway itself didn't respond. */
  gatewayReachable: boolean;
  setHealth: (h: SystemHealth) => void;
  setError: (err: string | null) => void;
  setLoading: (b: boolean) => void;
  setGatewayReachable: (b: boolean) => void;
};

const useStore = create<State>((set) => ({
  health: null,
  loading: false,
  error: null,
  lastFetchedAt: null,
  gatewayReachable: true,
  setHealth: (h) =>
    set({
      health: h,
      lastFetchedAt: Date.now(),
      error: null,
      gatewayReachable: true,
    }),
  setError: (err) => set({ error: err }),
  setLoading: (b) => set({ loading: b }),
  setGatewayReachable: (b) => set({ gatewayReachable: b }),
}));

let _pollerStarted = false;

/**
 * Start the health poller exactly once for the whole tab.
 * Default cadence: 8s when visible, 30s when tab is hidden.
 */
export function useApiHealth(opts?: { intervalMs?: number }) {
  const intervalMs = opts?.intervalMs ?? 8000;

  useEffect(() => {
    if (_pollerStarted) return;
    _pollerStarted = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      useStore.getState().setLoading(true);
      try {
        const resp = await fetch(`${GATEWAY}/v1/system/health`, {
          method: "GET",
          headers: { accept: "application/json" },
          // health is anonymous — don't ship cookies / tokens
          credentials: "omit",
          cache: "no-store",
        });
        if (!resp.ok) {
          useStore.getState().setError(`gateway ${resp.status}`);
          useStore.getState().setGatewayReachable(false);
        } else {
          const json = (await resp.json()) as SystemHealth;
          useStore.getState().setHealth(json);
        }
      } catch (e: unknown) {
        useStore.getState().setError(
          e instanceof Error ? e.message : "network error",
        );
        useStore.getState().setGatewayReachable(false);
      } finally {
        useStore.getState().setLoading(false);
        if (!cancelled) {
          const slowdown =
            typeof document !== "undefined" && document.hidden
              ? Math.max(intervalMs, 30_000)
              : intervalMs;
          timer = setTimeout(tick, slowdown);
        }
      }
    };

    void tick();
    return () => {
      cancelled = true;
      _pollerStarted = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Read-only hook — does NOT start the poller. */
export function useSystemHealth() {
  return useStore();
}

export function selectOverall(): "operational" | "partial" | "down" | "unknown" {
  const s = useStore.getState();
  if (!s.gatewayReachable) return "down";
  return s.health?.overall ?? "unknown";
}
