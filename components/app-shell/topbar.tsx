"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useAssistant, useCommandPalette, useSidebar } from "@/lib/store";
import {
  useApiHealth,
  useSystemHealth,
} from "@/lib/system-health";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useEffect, useState } from "react";

export function Topbar() {
  const { setMobileOpen, toggleCollapsed } = useSidebar();
  const { toggle: toggleCmd } = useCommandPalette();
  const { setOpen } = useAssistant();
  const [time, setTime] = useState("");

  // start the global system-health poller (idempotent across mounts)
  useApiHealth({ intervalMs: 8000 });
  const { health, gatewayReachable } = useSystemHealth();

  useEffect(() => {
    const t = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    t();
    const id = setInterval(t, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.05] gs-glass">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] lg:hidden"
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] lg:inline-flex"
          aria-label="Toggle sidebar"
        >
          <Icon name="layers" className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleCmd}
          className="hidden flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left text-sm text-ink-mute transition hover:bg-white/[0.07] sm:flex sm:max-w-md"
        >
          <Icon name="search" className="h-4 w-4" />
          <span className="flex-1 truncate">
            Ask Aurora — “summarise yesterday's calls”
          </span>
          <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <SystemStatusPill
            time={time}
            up={health?.up_count ?? 0}
            total={health?.service_count ?? 0}
            overall={
              !gatewayReachable
                ? "down"
                : (health?.overall ?? "unknown")
            }
          />

          <ThemeToggle />

          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
            aria-label="Notifications"
          >
            <Icon name="bell" className="h-4 w-4 text-ink-soft" />
            <span className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-coral" />
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hidden h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 hover:bg-white/[0.07] md:inline-flex"
          >
            <Icon name="sparkles" className="h-4 w-4 text-cyan-spec" />
            <span className="text-sm">Aurora</span>
            <Badge tone="aurora" pulse>
              live
            </Badge>
          </button>
        </div>
      </div>
    </header>
  );
}

function SystemStatusPill({
  time,
  up,
  total,
  overall,
}: {
  time: string;
  up: number;
  total: number;
  overall: "operational" | "partial" | "down" | "unknown";
}) {
  const dotClass =
    overall === "operational"
      ? "bg-aurora gs-pulse"
      : overall === "partial"
        ? "bg-amber-spec gs-pulse"
        : overall === "down"
          ? "bg-coral"
          : "bg-ink-faint";
  const label =
    overall === "operational"
      ? `All systems · ${time}`
      : overall === "partial"
        ? `Partial · ${up}/${total} up`
        : overall === "down"
          ? "Backend unreachable"
          : "Checking…";
  const titleHint =
    overall === "down"
      ? "Cannot reach the gateway. The frontend works in demo mode; live AI is disabled."
      : overall === "partial"
        ? `${up} of ${total} services healthy. Click for details.`
        : "All upstream services reporting healthy.";

  return (
    <Link
      href="/app/system"
      title={titleHint}
      className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-widest text-ink-mute transition hover:bg-white/[0.07] sm:flex"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </Link>
  );
}
