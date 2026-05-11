"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/ui/stat";
import {
  fetchEdgeDevices,
  fetchDefaultProfile,
  type ActivityClass,
  type EdgeDevice,
  type PowerMode,
  type WearableProfile,
} from "@/lib/edge";

const MODE_TONE: Record<PowerMode, "cyan" | "aurora" | "violet" | "amber" | "coral"> = {
  peak: "violet",
  balanced: "aurora",
  efficient: "cyan",
  low_power: "amber",
  sleep: "coral",
};

const ACTIVITY_ICON: Record<ActivityClass, string> = {
  still: "user",
  walking: "compass",
  running: "zap",
  cycling: "compass",
  driving: "compass",
  unknown: "circle",
};

export default function EdgePage() {
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [profile, setProfile] = useState<WearableProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});

  const refresh = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        fetchEdgeDevices().catch(() => []),
        fetchDefaultProfile().catch(() => null),
      ]);
      setDevices(d);
      if (p) setProfile(p);
      setError(null);
      // accumulate battery history per device
      setHistory((prev) => {
        const next: Record<string, number[]> = { ...prev };
        for (const dev of d) {
          const series = next[dev.device_id] ?? [];
          next[dev.device_id] = [...series, dev.power.battery_pct].slice(-32);
        }
        return next;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 3000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <>
      <PageHeader
        eyebrow="Phase 4 · edge AI"
        title={
          <>
            Wearable runtime, <span className="gs-text-aurora">on-device.</span>
          </>
        }
        description="Live IMU, voice, power and inference telemetry per connected Spectra Lens — plus the hardware profile the cognition layer is targeting."
        actions={
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <Icon name="refresh" className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* DEVICE LIST */}
        <div className="lg:col-span-8 space-y-5">
          {devices.length === 0 ? (
            <Panel className="p-6 text-center text-sm text-ink-mute">
              No connected wearables reporting yet. Start the virtual device
              with{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px]">
                python services/virtual-device/run.py --synthetic --edge
              </code>{" "}
              and refresh.
            </Panel>
          ) : (
            devices.map((d) => (
              <DeviceCard
                key={d.device_id}
                device={d}
                batteryHistory={history[d.device_id] ?? []}
              />
            ))
          )}
        </div>

        {/* PROFILE + INFERENCE SPLIT */}
        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5">
            <Badge tone="cyan">Hardware profile</Badge>
            <h3 className="mt-3 font-display text-lg">
              {profile?.name ?? "Spectra Lens"}
            </h3>
            <div className="mt-1 text-xs text-ink-mute">{profile?.soc ?? "—"}</div>

            <ul className="mt-4 space-y-1.5 text-sm">
              <Row label="NPU" value={profile?.has_npu ? `${profile.npu_tops} TOPS` : "—"} />
              <Row
                label="Camera"
                value={
                  profile
                    ? `${profile.camera_resolutions[0]} @ ${profile.camera_max_fps}fps`
                    : "—"
                }
              />
              <Row label="Microphones" value={String(profile?.microphones ?? "—")} />
              <Row
                label="Battery"
                value={
                  profile
                    ? `${profile.battery_mah} mAh · ${profile.battery_hours_typical}h`
                    : "—"
                }
              />
              <Row label="Radios" value={profile?.radios?.join(" · ") ?? "—"} />
            </ul>

            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                Local models
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(profile?.local_models ?? []).map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-soft"
                  >
                    {m}
                  </span>
                ))}
                {!profile?.local_models?.length && (
                  <span className="text-[11px] text-ink-mute">none</span>
                )}
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <Badge tone="violet">Edge vs cloud</Badge>
            <h3 className="mt-3 font-display text-lg">Inference split</h3>
            {devices.map((d) => {
              const c = d.inference_counters || {};
              const total =
                (c.local || 0) + (c.cloud || 0) + (c.deferred || 0);
              const local = total ? (c.local || 0) / total : 0;
              const cloud = total ? (c.cloud || 0) / total : 0;
              const deferred = total ? (c.deferred || 0) / total : 0;
              return (
                <div key={d.device_id} className="mt-3 first:mt-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-ink-soft">
                      {d.device_id}
                    </span>
                    <span className="text-ink-mute">{total} runs</span>
                  </div>
                  <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="bg-aurora"
                      style={{ width: `${local * 100}%` }}
                    />
                    <div
                      className="bg-cyan-spec"
                      style={{ width: `${cloud * 100}%` }}
                    />
                    <div
                      className="bg-amber-spec"
                      style={{ width: `${deferred * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-3 text-[10px] uppercase tracking-widest text-ink-mute">
                    <span>
                      <span className="text-aurora">local</span>{" "}
                      {(local * 100).toFixed(0)}%
                    </span>
                    <span>
                      <span className="text-cyan-spec">cloud</span>{" "}
                      {(cloud * 100).toFixed(0)}%
                    </span>
                    <span>
                      <span className="text-amber-spec">deferred</span>{" "}
                      {(deferred * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {devices.length === 0 && (
              <p className="mt-3 text-xs text-ink-mute">
                Connect a wearable to see the live local vs cloud split.
              </p>
            )}
          </Panel>

          <Panel className="p-5">
            <Badge tone="aurora">Sensor fusion</Badge>
            <h3 className="mt-3 font-display text-lg">Activity tracker</h3>
            <ul className="mt-3 space-y-2">
              {devices.length === 0 && (
                <li className="text-xs text-ink-mute">no devices reporting</li>
              )}
              {devices.map((d) => {
                const iconName = ACTIVITY_ICON[d.motion.activity] || "circle";
                return (
                  <li
                    key={d.device_id}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-2.5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Icon name={iconName} className="h-4 w-4 text-aurora" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <span className="text-aurora">
                          {d.motion.activity}
                        </span>
                        <span className="ml-2 text-[11px] text-ink-mute">
                          {(d.motion.activity_confidence * 100).toFixed(0)}%
                          conf
                        </span>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                        {d.motion.step_rate_hz.toFixed(1)} Hz · pitch{" "}
                        {d.motion.orientation.pitch_deg.toFixed(0)}° · yaw{" "}
                        {d.motion.orientation.yaw_deg.toFixed(0)}°
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

// =============================================================
//  DeviceCard
// =============================================================

function DeviceCard({
  device,
  batteryHistory,
}: {
  device: EdgeDevice;
  batteryHistory: number[];
}) {
  const ageS = Math.max(0, Math.floor(Date.now() / 1000) - device.last_event_at);
  const tone = MODE_TONE[device.mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  ageS < 8 ? "bg-aurora gs-pulse" : "bg-ink-faint"
                }`}
              />
              <h3 className="font-display text-lg text-ink">
                {device.device_id}
              </h3>
              <Badge tone={tone} pulse={device.mode !== "sleep"}>
                {device.mode.replace("_", " ")}
              </Badge>
              <Badge
                tone={
                  device.power.thermal_state === "nominal"
                    ? "aurora"
                    : device.power.thermal_state === "warm"
                      ? "cyan"
                      : device.power.thermal_state === "hot"
                        ? "amber"
                        : "coral"
                }
              >
                {device.power.thermal_state}
              </Badge>
            </div>
            <div className="mt-1 text-[11px] text-ink-mute">
              last event {ageS}s ago
            </div>
          </div>
        </div>

        {/* power tiles */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile
            label="Battery"
            value={`${device.power.battery_pct.toFixed(0)}%`}
            tone="aurora"
            sub={`${device.power.estimated_hours_remaining.toFixed(1)}h left`}
          />
          <Tile
            label="Thermal"
            value={`${device.power.thermal_c.toFixed(1)}°C`}
            tone="amber"
            sub={device.power.thermal_state}
          />
          <Tile
            label="CPU load"
            value={`${(device.power.cpu_load * 100).toFixed(0)}%`}
            tone="cyan"
          />
          <Tile
            label="GPU load"
            value={`${(device.power.gpu_load * 100).toFixed(0)}%`}
            tone="violet"
          />
        </div>

        {batteryHistory.length > 4 && (
          <div className="mt-4">
            <Sparkline points={batteryHistory} className="text-aurora" />
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-ink-mute">
              <span>battery · 32 samples</span>
              <span>
                {Math.min(...batteryHistory).toFixed(0)}–
                {Math.max(...batteryHistory).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* motion + voice */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="text-[10px] uppercase tracking-widest text-ink-mute">
              Motion
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Icon
                name={ACTIVITY_ICON[device.motion.activity] || "circle"}
                className="h-4 w-4 text-aurora"
              />
              <span className="text-sm">
                <span className="text-aurora">{device.motion.activity}</span>
                <span className="ml-2 text-[11px] text-ink-mute">
                  {(device.motion.activity_confidence * 100).toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="mt-2 font-mono text-[11px] text-ink-soft">
              pitch {device.motion.orientation.pitch_deg.toFixed(0)}° · yaw{" "}
              {device.motion.orientation.yaw_deg.toFixed(0)}° · roll{" "}
              {device.motion.orientation.roll_deg.toFixed(0)}° · steps{" "}
              {device.motion.step_rate_hz.toFixed(1)} Hz
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                Voice
              </div>
              {device.voice.listening && (
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-aurora">
                  <span className="h-1.5 w-1.5 rounded-full bg-aurora gs-pulse" />
                  listening
                </span>
              )}
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-spec via-violet-spec to-aurora"
                style={{ width: `${Math.min(100, device.voice.rms * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-ink-mute">
              wake{" "}
              {device.voice.last_wake_at
                ? `${Math.max(0, Math.floor(Date.now() / 1000 - device.voice.last_wake_at))}s ago`
                : "—"}{" "}
              · speech{" "}
              {device.voice.last_speech_at
                ? `${Math.max(0, Math.floor(Date.now() / 1000 - device.voice.last_speech_at))}s ago`
                : "—"}
            </div>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}

function Tile({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "aurora" | "amber" | "coral";
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className={`mt-1 font-display text-base text-${tone}-spec`}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] uppercase tracking-widest text-ink-mute">
          {sub}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-1.5">
      <span className="text-ink-mute">{label}</span>
      <span className="font-mono text-xs text-ink">{value}</span>
    </li>
  );
}
