"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stat } from "@/components/ui/stat";
import { AreaChart, BarChart, DonutChart } from "@/components/ui/chart";
import { useToast } from "@/components/ui/toast";

const FILTERS = ["last 24h", "7 days", "30 days", "all time"] as const;

export default function AnalyticsPage() {
  const router = useRouter();
  const toast = useToast();
  const [filterIdx, setFilterIdx] = useState(0);

  const onFilters = () => {
    const next = (filterIdx + 1) % FILTERS.length;
    setFilterIdx(next);
    toast({
      title: `Window · ${FILTERS[next]}`,
      description: "Charts will refresh on the next data tick.",
      tone: "info",
    });
  };

  const onExport = () => {
    if (typeof window === "undefined") return;
    const csv =
      "metric,value,delta\n" +
      "active_devices,4211,+212\n" +
      "inferences_per_s,189400,+4.1%\n" +
      "memory_tb,1284,+18\n" +
      "agent_actions_per_day,2310000,+11.4%\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spectra-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Snapshot exported",
      description: "Top-line metrics packaged as CSV.",
      tone: "success",
    });
  };

  const onAskAurora = () => {
    router.push(
      "/app/console?prompt=" +
        encodeURIComponent(
          "Summarise the cognitive analytics — anomalies, trends, what should I look at?",
        ),
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Enterprise analytics"
        title={<>Cognitive observability, <span className="gs-text-gradient">at fleet scale.</span></>}
        description="Trace every inference, agent action and memory event across thousands of devices and tenants."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={onFilters}>
              <Icon name="filter" className="h-4 w-4" /> {FILTERS[filterIdx]}
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Icon name="download" className="h-4 w-4" /> Export
            </Button>
            <Button variant="spectral" size="sm" onClick={onAskAurora}>
              <Icon name="sparkles" className="h-4 w-4" /> Ask Aurora
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <Stat label="Active devices" value={4211} delta="+212" tone="cyan" spark={[3000, 3120, 3220, 3300, 3400, 3500, 3650, 3800, 3870, 3920, 4010, 4080, 4150, 4180, 4211]} />
        <Stat label="Inferences / s" value={189_400} delta="+4.1%" tone="violet" spark={[120, 130, 145, 150, 142, 152, 160, 158, 165, 170, 172, 178, 182, 186, 189]} />
        <Stat label="Memory · TB ingested" value={1284} suffix=" TB" delta="+18" tone="aurora" spark={[920, 945, 980, 1010, 1042, 1080, 1112, 1148, 1175, 1200, 1224, 1240, 1256, 1272, 1284]} />
        <Stat label="Agent actions / day" value={2_310_000} delta="+11.4%" tone="amber" spark={[1.4, 1.55, 1.6, 1.7, 1.8, 1.85, 1.95, 2.0, 2.05, 2.12, 2.18, 2.22, 2.26, 2.29, 2.31].map((v) => v * 1_000_000)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-8"
        >
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="cyan">Cognition stream</Badge>
                <h3 className="mt-3 font-display text-xl">Inference latency · 24h</h3>
              </div>
              <div className="hidden gap-3 text-xs sm:flex">
                <Legend color="#58e3ff" label="On-device" />
                <Legend color="#8c5cff" label="Edge" />
                <Legend color="#c965ff" label="Sovereign cloud" />
              </div>
            </div>
            <div className="mt-4 h-64">
              <AreaChart
                series={[
                  { name: "ondevice", color: "#58e3ff", data: [10, 9, 11, 9, 10, 9, 8, 9, 8, 7, 8, 7, 7, 6, 6, 7, 7, 6, 6, 7, 6, 5, 6, 5] },
                  { name: "edge", color: "#8c5cff", data: [22, 20, 23, 21, 19, 22, 19, 18, 19, 17, 18, 16, 17, 18, 16, 15, 17, 15, 16, 14, 15, 13, 14, 13] },
                  { name: "cloud", color: "#c965ff", data: [44, 42, 40, 39, 41, 38, 36, 35, 34, 32, 33, 32, 30, 31, 28, 29, 27, 26, 27, 25, 24, 23, 24, 22] },
                ]}
              />
            </div>
          </Panel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="lg:col-span-4"
        >
          <Panel className="p-5 sm:p-7">
            <Badge tone="violet">Compute distribution</Badge>
            <h3 className="mt-3 font-display text-xl">Where Aurora runs</h3>
            <div className="mx-auto mt-4 max-w-[220px]">
              <DonutChart
                segments={[
                  { l: "On-device", v: 64, c: "#58e3ff" },
                  { l: "Edge mesh", v: 23, c: "#8c5cff" },
                  { l: "Sovereign cloud", v: 13, c: "#c965ff" },
                ]}
              />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["On-device", "64%", "#58e3ff"],
                ["Edge mesh", "23%", "#8c5cff"],
                ["Sovereign cloud", "13%", "#c965ff"],
              ].map(([l, v, c]) => (
                <li
                  key={l as string}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-3 rounded" style={{ background: c as string }} />
                    {l}
                  </span>
                  <span className="font-mono text-xs">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="aurora">Agent activity</Badge>
                <h3 className="mt-3 font-display text-xl">Top flows · last 7 days</h3>
              </div>
            </div>
            <div className="mt-4">
              <BarChart
                data={[
                  { l: "Cedar", v: 4820 },
                  { l: "Meridian", v: 3210 },
                  { l: "Finch", v: 2740 },
                  { l: "Atlas", v: 2510 },
                  { l: "Vesper", v: 1820 },
                  { l: "Ember", v: 1230 },
                  { l: "Nova", v: 980 },
                  { l: "Other", v: 620 },
                ]}
                color="#58e3ff"
              />
            </div>
          </Panel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="lg:col-span-5"
        >
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge>Geographic mesh</Badge>
                <h3 className="mt-3 font-display text-xl">Tenant footprint</h3>
              </div>
              <Icon name="globe" className="h-5 w-5 text-cyan-spec" />
            </div>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                { region: "Europe · Zürich", n: 1842, p: 92, c: "#58e3ff" },
                { region: "North America · SF", n: 1240, p: 78, c: "#8c5cff" },
                { region: "Asia · Singapore", n: 716, p: 64, c: "#6affc1" },
                { region: "Middle East · Dubai", n: 312, p: 38, c: "#ffba6a" },
                { region: "South America · São Paulo", n: 101, p: 22, c: "#ff7a8d" },
              ].map((r) => (
                <li
                  key={r.region}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span>{r.region}</span>
                    <span className="font-mono text-[11px] text-ink-mute">
                      {r.n.toLocaleString()} devices
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.p}%`,
                        background: r.c,
                        boxShadow: `0 0 14px ${r.c}66`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="lg:col-span-12"
        >
          <Panel className="p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge tone="amber">Cognition events</Badge>
                <h3 className="mt-3 font-display text-xl">Live audit stream</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-aurora gs-pulse" />
                3,212 events / minute · all signed
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-ink-mute">
                  <tr className="border-b border-white/[0.05]">
                    <th className="py-2 px-3 text-left font-medium">Time</th>
                    <th className="py-2 px-3 text-left font-medium">Tenant</th>
                    <th className="py-2 px-3 text-left font-medium">Agent</th>
                    <th className="py-2 px-3 text-left font-medium">Event</th>
                    <th className="py-2 px-3 text-right font-medium">Latency</th>
                    <th className="py-2 px-3 text-right font-medium">Trust</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[12px]">
                  {[
                    ["20:48:12", "acme.spectra", "cedar", "memory.write episode#48391", "1.4ms", "local"],
                    ["20:48:10", "spectra.eu", "meridian", "policy.consent.granted", "0.7ms", "signed"],
                    ["20:48:08", "north-orbit", "vesper", "vision.detect 14 ROIs", "0.4ms", "local"],
                    ["20:48:05", "axiom.lab", "finch", "calendar.hold mira 14:00", "12ms", "edge"],
                    ["20:47:59", "spectra.eu", "atlas", "graph.link 84 nodes", "3.2ms", "edge"],
                    ["20:47:55", "acme.spectra", "ember", "consent.deny biometrics", "0.9ms", "local"],
                  ].map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025]"
                    >
                      <td className="px-3 py-2 text-ink-mute">{row[0]}</td>
                      <td className="px-3 py-2 text-cyan-spec">{row[1]}</td>
                      <td className="px-3 py-2 text-violet-spec">{row[2]}</td>
                      <td className="px-3 py-2 text-ink-soft">{row[3]}</td>
                      <td className="px-3 py-2 text-right text-aurora">{row[4]}</td>
                      <td className="px-3 py-2 text-right text-amber-spec">{row[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </motion.div>
      </div>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-ink-mute">
      <span className="h-1.5 w-3 rounded" style={{ background: color }} />
      {label}
    </div>
  );
}
