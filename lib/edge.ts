"use client";

/**
 * Phase 4 edge client — talks to /v1/edge/* on the gateway.
 * Reads device-side telemetry (power, IMU motion, voice, inference
 * counters, wearable profiles) and feeds the /app/edge dashboard.
 */

import { authedFetch } from "./api";

// =============================================================
//  Types — mirror the backend's _state_to_dict() shape
// =============================================================

export type ThermalState = "nominal" | "warm" | "hot" | "critical";

export type PowerMode = "peak" | "balanced" | "efficient" | "low_power" | "sleep";

export type ActivityClass =
  | "still"
  | "walking"
  | "running"
  | "cycling"
  | "driving"
  | "unknown";

export type EdgeDevice = {
  device_id: string;
  power: {
    battery_pct: number;
    charging: boolean;
    thermal_c: number;
    thermal_state: ThermalState;
    cpu_load: number;
    gpu_load: number;
    estimated_hours_remaining: number;
  };
  mode: PowerMode;
  policy: {
    prefer_battery_life: boolean;
    minimum_battery_pct: number;
    allow_peak_unplugged: boolean;
  };
  motion: {
    ts: number;
    activity: ActivityClass;
    activity_confidence: number;
    step_rate_hz: number;
    gravity_align_deg: number;
    orientation: {
      pitch_deg: number;
      yaw_deg: number;
      roll_deg: number;
      confidence: number;
    };
    extras: Record<string, unknown>;
  };
  voice: {
    rms: number;
    listening: boolean;
    last_wake_at: number | null;
    last_speech_at: number | null;
  };
  inference_counters: Record<string, number>;
  last_event_at: number;
  history: Array<{ kind: string; ts: number; [k: string]: unknown }>;
};

export type WearableProfile = {
  id: string;
  name: string;
  soc: string;
  has_npu: boolean;
  npu_tops: number;
  camera_resolutions: string[];
  camera_max_fps: number;
  microphones: number;
  has_imu: boolean;
  battery_mah: number;
  battery_hours_typical: number;
  local_models: string[];
  radios: string[];
};

// =============================================================
//  REST helpers
// =============================================================

export async function fetchEdgeDevices(): Promise<EdgeDevice[]> {
  const resp = await authedFetch("/v1/edge/devices");
  if (!resp.ok) throw new Error(`edge.devices: ${resp.status}`);
  return resp.json();
}

export async function fetchEdgeDevice(deviceId: string): Promise<EdgeDevice> {
  const resp = await authedFetch(`/v1/edge/devices/${encodeURIComponent(deviceId)}`);
  if (!resp.ok) throw new Error(`edge.device: ${resp.status}`);
  return resp.json();
}

export async function fetchProfiles(): Promise<WearableProfile[]> {
  const resp = await authedFetch("/v1/edge/profiles");
  if (!resp.ok) throw new Error(`edge.profiles: ${resp.status}`);
  return resp.json();
}

export async function fetchDefaultProfile(): Promise<WearableProfile> {
  const resp = await authedFetch("/v1/edge/profiles/default");
  if (!resp.ok) throw new Error(`edge.default_profile: ${resp.status}`);
  return resp.json();
}
