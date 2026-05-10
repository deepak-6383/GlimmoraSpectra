"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sparkline } from "@/components/ui/stat";
import { useApiHealth, useSystemHealth, type ServiceHealth } from "@/lib/system-health";
import { GATEWAY } from "@/lib/config";

export default function SystemPage() {
  // make sure the poller is running for this page even if the user landed
  // here directly (the topbar usually starts it)
  useApiHealth({ intervalMs: 5000 });
  const { health, loading, error, lastFetchedAt, gatewayReachable } =
    useSystemHealth();

  // keep the last 24 latency samples per service for tiny sparklines
  const [history, setHistory] = useState<Record<string, number[]>>({});
  useEffect(() => {
    if (!health) return;
    setHistory((prev) => {
      const next: Record<string, number[]> = { ...prev };
      for (const s of health.services) {
        const arr = next[s.name] ?? [];
        next[s.name] = [...arr, s.latency_ms].slice(-24);
      }
      return next;
    });
  }, [health]);

  const services = health?.services ?? [];
  const overall =
    !gatewayReachable
      ? "down"
      : (health?.overall ?? "unknown");

  const overallTone = useMemo(() => {
    if (overall === "operational") return "aurora" as const;
    if (overall === "partial") return "amber" as const;
    if (overall === "down") return "coral" as const;
    return "neutral" as const;
  }, [overall]);

  const overallLabel = useMemo(() => {
    if (overall === "operational") return "All systems operational";
    if (overall === "partial") return "Partial outage";
    if (overall === "down") return "Backend unreachable";
    return "Checking…";
  }, [overall]);

  return (
    <>
      <PageHeader
        eyebrow="Platform health"
        title={
          <>
            System status, <span className="gs-text-aurora">live.</span>
          </>
        }
        description="Real-time aggregate from /v1/system/health · pings every upstream service in parallel and caches for 3 seconds."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Icon name="refresh" className="h-4 w-4" /> Force refresh
          </Button>
        }
      />

      {/* OVERALL CARD */}
      <Panel className="relative overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border ${
                overall === "operational"
                  ? "border-aurora/40 bg-aurora/15"
                  : overall === "partial"
                    ? "border-amber-spec/40 bg-amber-spec/15"
                    : overall === "down"
                      ? "border-coral/40 bg-coral/15"
                      : "border-white/10 bg-white/[0.05]"
              }`}
            >
              <Icon
                name={
                  overall === "down"
                    ? "alert"
                    : overall === "partial"
                      ? "alert"
                      : "shieldCheck"
                }
                className={`h-6 w-6 ${
                  overall === "operational"
                    ? "text-aurora"
                    : overall === "partial"
                      ? "text-amber-spec"
                      : overall === "down"
                        ? "text-coral"
                        : "text-ink-mute"
                }`}
              />
              {overall === "operational" && (
                <span className="absolute inset-0 rounded-2xl border border-aurora/50 gs-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge tone={overallTone} pulse={overall === "operational"}>
                  {overall}
                </Badge>
                {loading && (
                  <span className="text-[10px] uppercase tracking-widest text-ink-mute">
                    refreshing
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-xl tracking-tight">
                {overallLabel}
              </h2>
              <p className="text-xs text-ink-mute">
                {health
                  ? `${health.up_count} of ${health.service_count} services healthy`
                  : gatewayReachable
                    ? "no health snapshot yet"
                    : `gateway unreachable at ${GATEWAY}`}
                {lastFetchedAt && (
                  <>
                    <span className="mx-1.5 text-ink-faint">·</span>
                    last check{" "}
                    {Math.max(
                      0,
                      Math.round((Date.now() - lastFetchedAt) / 1000),
                    )}
                    s ago
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <Tile label="Up" value={String(health?.up_count ?? 0)} tone="aurora" />
            <Tile
              label="Total"
              value={String(health?.service_count ?? 0)}
              tone="cyan"
            />
            <Tile
              label="P50 latency"
              value={`${p50(services).toFixed(0)}ms`}
              tone="violet"
            />
          </div>
        </div>

        {error && !gatewayReachable && (
          <div className="mt-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
            <div className="font-medium">Cannot reach the gateway</div>
            <div className="mt-1 text-xs text-coral/85">
              {error}. Check that <code>{GATEWAY}</code> is reachable and that
              CORS allows this origin. The frontend will continue to work in
              demo mode for surfaces that have local fallbacks.
            </div>
          </div>
        )}
      </Panel>

      {/* SERVICE GRID */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {services.length === 0 && !error ? (
          <Panel className="p-6 text-center text-sm text-ink-mute">
            Waiting for the first health snapshot…
          </Panel>
        ) : (
          services.map((s) => (
            <ServiceCard
              key={s.name}
              service={s}
              history={history[s.name] ?? []}
            />
          ))
        )}
      </div>

      {/* GATEWAY METADATA */}
      <Panel className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <div>
            <Badge tone="cyan">Gateway</Badge>
            <h3 className="mt-2 font-display text-lg">api-gateway</h3>
          </div>
          <span className="text-[11px] uppercase tracking-widest text-ink-mute">
            {GATEWAY}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Mini label="Version" value={health?.gateway?.version ?? "—"} />
          <Mini label="Env" value={health?.gateway?.env ?? "—"} />
          <Mini
            label="Reachable"
            value={gatewayReachable ? "yes" : "no"}
            tone={gatewayReachable ? "aurora" : "coral"}
          />
          <Mini
            label="Poll cadence"
            value={
              typeof document !== "undefined" && document.hidden ? "30s" : "5s"
            }
          />
        </div>
      </Panel>
    </>
  );
}

// =============================================================
//  Sub-components
// =============================================================

function ServiceCard({
  service,
  history,
}: {
  service: ServiceHealth;
  history: number[];
}) {
  const tone =
    service.status === "up"
      ? "aurora"
      : service.status === "degraded"
        ? "amber"
        : "coral";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Panel className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  service.status === "up"
                    ? "bg-aurora gs-pulse"
                    : service.status === "degraded"
                      ? "bg-amber-spec gs-pulse"
                      : "bg-coral"
                }`}
              />
              <h4 className="font-display text-base text-ink">
                {service.name}
              </h4>
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-ink-mute">
              {service.url}
            </div>
          </div>
          <Badge tone={tone}>{service.status}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Mini
            label="Latency"
            value={`${service.latency_ms.toFixed(0)}ms`}
            tone="cyan"
          />
          <Mini
            label="HTTP"
            value={
              service.status === "up"
                ? "200"
                : service.http_code != null
                  ? String(service.http_code)
                  : "—"
            }
          />
          <Mini
            label="Window"
            value={
              history.length > 0
                ? `${Math.min(...history).toFixed(0)}–${Math.max(...history).toFixed(0)}ms`
                : "—"
            }
          />
        </div>

        {history.length > 1 && (
          <div className="mt-4">
            <Sparkline
              points={history}
              className={
                service.status === "up"
                  ? "text-aurora"
                  : service.status === "degraded"
                    ? "text-amber-spec"
                    : "text-coral"
              }
            />
          </div>
        )}

        {service.error && (
          <div className="mt-3 rounded-xl border border-coral/30 bg-coral/10 p-2 font-mono text-[11px] text-coral">
            {service.error}
          </div>
        )}
      </Panel>
    </motion.div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "aurora";
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className={`mt-1 font-display text-base text-${tone}-spec`}>
        {value}
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: string;
  tone?: "cyan" | "violet" | "aurora" | "amber" | "coral";
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className={`mt-0.5 font-mono text-[12px] text-${tone}-spec`}>
        {value}
      </div>
    </div>
  );
}

function p50(services: ServiceHealth[]): number {
  if (!services.length) return 0;
  const ups = services.filter((s) => s.status === "up").map((s) => s.latency_ms);
  if (!ups.length) return 0;
  ups.sort((a, b) => a - b);
  return ups[Math.floor(ups.length / 2)];
}
