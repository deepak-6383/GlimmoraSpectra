"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CameraFeed, type CameraFeedHandle } from "@/components/live/camera-feed";
import { VisionOverlays } from "@/components/live/overlays";
import {
  connectPlatformStream,
  connectVisionStream,
  useLiveStream,
} from "@/lib/live-stream";
import { getDevToken, interact, type VisionFramePayload } from "@/lib/api";

const DEVICE_ID = "lens-web-demo";

export default function LivePage() {
  const camRef = useRef<CameraFeedHandle | null>(null);
  const latestBlobRef = useRef<Blob | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "Brief me on what you see and what I should focus on next.",
  );

  const live = useLiveStream();

  // acquire dev token on mount
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

  // platform stream (kafka fanout)
  useEffect(() => {
    if (!token) return;
    return connectPlatformStream(token);
  }, [token]);

  // vision stream — start when camera is on AND token ready
  useEffect(() => {
    if (!token || !cameraOn) return;

    // capture frames to a ref so the WS interval can pull synchronously
    let raf = 0;
    const tick = async () => {
      const cam = camRef.current;
      if (cam?.isReady()) {
        const blob = await cam.capture(0.6);
        if (blob) latestBlobRef.current = blob;
      }
      raf = window.setTimeout(tick, 120) as unknown as number;
    };
    tick();

    const stop = connectVisionStream({
      deviceId: DEVICE_ID,
      token,
      getNextFrame: () => {
        const b = latestBlobRef.current;
        latestBlobRef.current = null;
        return b;
      },
      fps: 6,
    });
    return () => {
      window.clearTimeout(raf);
      stop();
    };
  }, [token, cameraOn]);

  const startInteract = useCallback(async () => {
    if (!prompt.trim()) return;
    const visionPayload: VisionFramePayload | null = live.latestFrame
      ? {
          frame_id: live.latestFrame.frame_id,
          device_id: live.latestFrame.device_id,
          detections: live.latestFrame.detections,
          text: live.latestFrame.text,
          faces: live.latestFrame.faces,
          scene_caption: live.latestFrame.scene_caption,
          metrics: live.latestFrame.metrics,
        }
      : null;

    live.startInteraction();
    try {
      for await (const event of interact({ prompt, vision: visionPayload })) {
        live.onInteractEvent(event);
      }
    } catch (e: any) {
      setError(`interact: ${e?.message ?? e}`);
    } finally {
      live.endInteraction();
    }
  }, [prompt, live]);

  return (
    <>
      <PageHeader
        eyebrow="Phase 1 · live cognition"
        title={<>The pipeline, <span className="gs-text-aurora">awake.</span></>}
        description="Camera → vision → memory → context → agents → response — streaming through Spectra in real time."
        actions={
          <>
            <Button
              variant={cameraOn ? "outline" : "spectral"}
              size="sm"
              onClick={() => setCameraOn((v) => !v)}
            >
              <Icon name={cameraOn ? "pause" : "camera"} className="h-4 w-4" />
              {cameraOn ? "Stop camera" : "Start camera"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => live.reset()}
              title="Reset live state"
            >
              <Icon name="refresh" className="h-4 w-4" /> Reset
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <Panel className="overflow-hidden p-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-black/60">
              <CameraFeed
                ref={camRef}
                active={cameraOn}
                onError={(e) => setError(`camera: ${e.message}`)}
                className="absolute inset-0"
              >
                <VisionOverlays frame={live.latestFrame} />
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 text-[11px]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      live.visionStatus === "live"
                        ? "bg-aurora gs-pulse"
                        : live.visionStatus === "connecting"
                          ? "bg-amber-spec gs-pulse"
                          : live.visionStatus === "error"
                            ? "bg-coral"
                            : "bg-ink-faint"
                    }`}
                  />
                  vision · {live.visionStatus}
                </div>
                <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full gs-glass-strong px-3 py-1.5 font-mono text-[11px]">
                  {live.framesProcessed} frames ·{" "}
                  {live.lastFrameLatencyMs?.toFixed(0) ?? "—"} ms
                </div>
                {live.latestFrame?.scene_caption && (
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-2xl gs-glass-strong px-4 py-2.5 text-[12px]">
                    <span className="text-cyan-spec">scene · </span>
                    {live.latestFrame.scene_caption}
                  </div>
                )}
              </CameraFeed>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <Badge tone="violet" pulse={live.replyStreaming}>
                Aurora · interact
              </Badge>
              <span className="text-[11px] uppercase tracking-widest text-ink-mute">
                {live.interactionCount} runs
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startInteract()}
                placeholder="Ask Aurora about what she sees…"
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none transition focus:border-cyan-spec/50 focus:bg-white/[0.06]"
              />
              <Button
                variant="spectral"
                onClick={startInteract}
                disabled={live.replyStreaming || !prompt.trim()}
              >
                <Icon name="sparkles" className="h-4 w-4" />
                {live.replyStreaming ? "thinking…" : "Ask"}
              </Button>
            </div>

            {live.contextText && (
              <pre className="mt-4 max-h-32 overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] text-ink-soft">
                {live.contextText}
              </pre>
            )}

            {live.reply && (
              <div className="mt-4 rounded-2xl border border-violet-spec/30 bg-gradient-to-br from-violet-spec/10 to-cyan-spec/10 p-4 text-[15px] leading-relaxed text-ink">
                {live.reply}
              </div>
            )}
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <Badge tone="aurora">Reasoning trace</Badge>
              <span className="text-[11px] uppercase tracking-widest text-ink-mute">
                last {live.agentTraces.length}
              </span>
            </div>
            <ul className="mt-4 space-y-1.5 font-mono text-[11px]">
              {live.agentTraces.length === 0 && (
                <li className="text-ink-mute">no events yet — ask Aurora a question</li>
              )}
              {live.agentTraces.slice(0, 24).map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-1.5"
                >
                  <span className="w-12 text-ink-faint">
                    {String(t.step).padStart(2, "0")}
                  </span>
                  <span className="text-cyan-spec">{t.agent}</span>
                  <span className="text-ink-mute">·</span>
                  <span className="text-violet-spec">{t.kind}</span>
                  <span className="ml-auto truncate text-ink-soft max-w-[60%]">
                    {summarisePayload(t.payload)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="cyan">Device telemetry</Badge>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  live.streamStatus === "live"
                    ? "bg-aurora gs-pulse"
                    : "bg-ink-faint"
                }`}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Mini
                label="Battery"
                value={
                  live.telemetry?.battery_pct != null
                    ? `${live.telemetry.battery_pct.toFixed(0)}%`
                    : "—"
                }
                tone="aurora"
              />
              <Mini
                label="Thermal"
                value={
                  live.telemetry?.thermal_c != null
                    ? `${live.telemetry.thermal_c.toFixed(1)}°C`
                    : "—"
                }
                tone="amber"
              />
              <Mini
                label="FPS"
                value={live.telemetry?.fps?.toFixed(1) ?? "—"}
                tone="cyan"
              />
              <Mini
                label="RSSI"
                value={
                  live.telemetry?.rssi != null
                    ? `${live.telemetry.rssi} dBm`
                    : "—"
                }
                tone="violet"
              />
            </div>
            <div className="mt-3 text-[11px] text-ink-mute">
              source · {live.telemetry?.device_id ?? "(no device yet — run the simulator)"}
            </div>
          </Panel>

          <Panel className="p-5">
            <Badge tone="violet">Memory recall</Badge>
            <h3 className="mt-3 font-display text-lg">Relevant episodes</h3>
            <ul className="mt-3 space-y-2">
              {live.memoryHits.length === 0 && (
                <li className="text-xs text-ink-mute">
                  the memory engine will surface relevant frames as Aurora reasons
                </li>
              )}
              {live.memoryHits.slice(0, 6).map((h, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 text-[11px] text-ink-mute">
                    <span className="text-violet-spec">m{i + 1}</span>
                    {h.score && <span>· {Number(h.score).toFixed(2)}</span>}
                    {h.payload?.kind && (
                      <span className="ml-auto rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest">
                        {h.payload.kind}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate font-medium">
                    {h.payload?.title || "(untitled)"}
                  </div>
                  {h.payload?.body && (
                    <div className="mt-1 line-clamp-2 text-xs text-ink-soft">
                      {h.payload.body}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <Badge tone="coral">Alerts</Badge>
            <h3 className="mt-3 font-display text-lg">Device + agents</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {live.alerts.length === 0 && (
                <li className="text-xs text-ink-mute">no alerts</li>
              )}
              {live.alerts.map((a, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-coral">
                    {a.severity} · {a.code}
                  </div>
                  <div className="mt-0.5 text-sm text-ink">{a.message}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "aurora" | "amber";
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">{label}</div>
      <div className={`mt-1 font-display text-lg text-${tone}-spec`}>{value}</div>
    </div>
  );
}

function summarisePayload(p: Record<string, any>): string {
  if (!p) return "";
  if (p.text) return String(p.text).slice(0, 120);
  if (p.plan) return `plan: ${(p.plan as string[]).slice(0, 2).join(" → ")}`;
  if (p.step) return String(p.step).slice(0, 120);
  if (p.output) return String(p.output).slice(0, 120);
  if (p.error) return `error: ${p.error}`;
  return JSON.stringify(p).slice(0, 120);
}
