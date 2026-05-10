"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/ui/stat";
import { ScanGrid } from "@/components/fx/scan-grid";
import { useToast } from "@/components/ui/toast";

const devices = [
  {
    name: "Spectra Lens · v3 Aurora",
    serial: "SLX-3-A4-09182",
    status: "online",
    battery: 78,
    sync: "live",
    fw: "3.1.4",
    heat: 32,
    type: "primary",
  },
  {
    name: "Spectra Lens · v2 Pioneer",
    serial: "SLX-2-P-44120",
    status: "standby",
    battery: 41,
    sync: "12m ago",
    fw: "2.7.9",
    heat: 28,
    type: "secondary",
  },
  {
    name: "Spectra Studio · Hub",
    serial: "STH-EU-ZRH-04",
    status: "online",
    battery: 100,
    sync: "live",
    fw: "1.0.2",
    heat: 38,
    type: "hub",
  },
  {
    name: "Spectra Phantom · dev",
    serial: "SPH-DV-019",
    status: "offline",
    battery: 12,
    sync: "3h ago",
    fw: "0.9.0-dev",
    heat: 26,
    type: "dev",
  },
];

export default function DevicesPage() {
  const toast = useToast();
  const [syncing, setSyncing] = useState(false);

  const onSync = () => {
    if (syncing) return;
    setSyncing(true);
    toast({
      title: "Syncing fleet",
      description: "Re-handshaking 4 devices across the mesh.",
      tone: "info",
    });
    setTimeout(() => {
      setSyncing(false);
      toast({
        title: "Fleet in sync",
        description: "All devices report nominal · firmware up to date.",
        tone: "success",
      });
    }, 1500);
  };

  const onPair = () => {
    toast({
      title: "Pairing mode",
      description:
        "Hold a Spectra Lens within 30 cm of your phone — pairing handshake starting.",
      tone: "info",
    });
  };

  const onManage = (name: string) => {
    toast({
      title: `${name} · settings opened`,
      description: "Configure permissions, OTA cadence and privacy zones.",
      tone: "info",
    });
  };

  const onPower = (name: string, current: string) => {
    const next = current === "offline" ? "wake" : "sleep";
    toast({
      title: `${name} · ${next} signal sent`,
      description:
        next === "wake"
          ? "Device will resume in a few seconds."
          : "Device will enter low-power mode.",
      tone: "info",
    });
  };

  const onScheduleInstall = () => {
    toast({
      title: "Firmware update scheduled",
      description: "Tonight at 03:00 local · over Wi-Fi only.",
      tone: "success",
    });
  };

  const onReleaseNotes = () => {
    toast({
      title: "Release notes",
      description:
        "v3.2.0 · 4× faster gaze, low-light vision, new policy primitives.",
      tone: "info",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Device fleet"
        title={<>Your <span className="gs-text-aurora">Spectra fabric.</span></>}
        description="Connected devices, sync state, firmware and live telemetry — across the lens, the hub and the cognitive mesh."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={onSync} disabled={syncing}>
              <Icon
                name="refresh"
                className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />{" "}
              {syncing ? "Syncing…" : "Sync now"}
            </Button>
            <Button variant="spectral" size="sm" onClick={onPair}>
              <Icon name="plus" className="h-4 w-4" /> Pair device
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          {devices.map((d, idx) => (
            <motion.div
              key={d.serial}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
            >
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div
                    className="relative h-16 w-24 flex-none overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-spec/10 to-violet-spec/10"
                  >
                    <div className="absolute inset-0 gs-grid-bg opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        name={d.type === "hub" ? "cpu" : d.type === "dev" ? "settings" : "glasses"}
                        className="h-6 w-6 text-cyan-spec"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{d.name}</h3>
                      <Badge
                        tone={
                          d.status === "online"
                            ? "aurora"
                            : d.status === "standby"
                              ? "amber"
                              : "neutral"
                        }
                        pulse={d.status === "online"}
                      >
                        {d.status}
                      </Badge>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-mute">
                      {d.serial} · firmware {d.fw}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Mini label="Battery" value={`${d.battery}%`} icon="battery" tone={d.battery > 60 ? "aurora" : d.battery > 25 ? "amber" : "coral"} />
                      <Mini label="Sync" value={d.sync} icon="cloud" tone="cyan" />
                      <Mini label="Thermal" value={`${d.heat}°C`} icon="activity" tone={d.heat > 36 ? "amber" : "aurora"} />
                      <Mini label="Mesh" value="92%" icon="network" tone="violet" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => onManage(d.name)}>
                      <Icon name="settings" className="h-3.5 w-3.5" /> Manage
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPower(d.name, d.status)}
                    >
                      <Icon name="power" className="h-3.5 w-3.5" />{" "}
                      {d.status === "offline" ? "Wake" : "Sleep"}
                    </Button>
                  </div>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-5 space-y-5">
          <Panel className="relative overflow-hidden p-5 sm:p-7">
            <ScanGrid />
            <div className="relative">
              <Badge tone="cyan">Live telemetry</Badge>
              <h3 className="mt-3 font-display text-xl">Spectra Lens · v3</h3>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {[
                  { k: "Battery", v: "78% · 11h", spark: [40, 50, 60, 65, 60, 70, 78, 80, 78], tone: "aurora" },
                  { k: "Vision FOV", v: "112°", spark: [110, 111, 112, 112, 110, 112, 113, 112, 112], tone: "cyan" },
                  { k: "Latency", v: "0.4ms", spark: [9, 8, 6, 7, 6, 5, 5, 4, 4], tone: "violet" },
                  { k: "Frames", v: "42fps", spark: [38, 40, 42, 41, 42, 42, 41, 42, 42], tone: "amber" },
                ].map((m) => (
                  <div
                    key={m.k}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                      {m.k}
                    </div>
                    <div className="mt-1 font-display text-lg tracking-tight">
                      {m.v}
                    </div>
                    <Sparkline className={`text-${m.tone}-spec mt-1`} points={m.spark} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Network</h3>
              <Badge tone="aurora" pulse>
                healthy
              </Badge>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Wi-Fi · spectra-mesh", "5GHz · −42dBm", "wifi", "aurora"],
                ["Cellular · 5G SA", "fallback ready", "radio", "violet"],
                ["UWB · Spectra hub", "1.4m · paired", "compass", "cyan"],
                ["Cloud relay · EU-N", "12ms · TLS-1.3", "globe", "amber"],
              ].map(([l, r, i, t]) => (
                <li
                  key={l as string}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2.5"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-${t}-spec`}
                  >
                    <Icon name={i as string} className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">{l}</span>
                  <span className="font-mono text-[11px] text-ink-mute">{r}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Firmware</h3>
              <Badge tone="violet">3.1.4 → 3.2.0</Badge>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Aurora-cognition core update available. Includes 4× faster gaze inference,
              new policy primitives and improved low-light vision.
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[34%] bg-gradient-to-r from-cyan-spec to-violet-spec gs-shimmer" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-mute">
              <span>Verifying signature · 34%</span>
              <span>4m remaining</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="spectral" size="sm" onClick={onScheduleInstall}>
                <Icon name="download" className="h-3.5 w-3.5" /> Schedule install
              </Button>
              <Button variant="ghost" size="sm" onClick={onReleaseNotes}>
                Release notes
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-mute">
        <Icon name={icon} className={`h-3 w-3 text-${tone}-spec`} />
        {label}
      </div>
      <div className="mt-1 font-mono text-[12px] text-ink">{value}</div>
    </div>
  );
}
