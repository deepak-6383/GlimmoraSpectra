"use client";

import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { CommandPalette } from "@/components/app-shell/command-palette";
import { AssistantDock } from "@/components/app-shell/assistant-dock";
import { useSidebar } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useSidebar((s) => s.collapsed);
  return (
    <div className="relative min-h-screen">
      <BgAura />
      <Sidebar />
      <div
        className={cn(
          "relative transition-[padding] duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
        )}
      >
        <Topbar />
        <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <CommandPalette />
      <AssistantDock />
    </div>
  );
}

function BgAura() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 h-[680px] w-[1100px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(140,92,255,0.35), rgba(88,227,255,0.18), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 gs-grid-bg opacity-40" />
    </div>
  );
}
