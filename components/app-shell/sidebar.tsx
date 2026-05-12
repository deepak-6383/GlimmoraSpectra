"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV } from "@/lib/nav";
import { Icon } from "@/components/ui/icon";
import { LogoMark } from "@/components/marketing/nav";
import { Badge } from "@/components/ui/badge";
import { useSidebar, useCommandPalette } from "@/lib/store";
import { cn } from "@/lib/cn";

const groupLabel: Record<string, string> = {
  core: "Core",
  intelligence: "Intelligence",
  operations: "Operations",
  system: "System",
};

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { toggle: toggleCmd } = useCommandPalette();

  const groups = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <LogoMark />
        {!collapsed && (
          <span className="font-display text-[15px] tracking-tight">
            Glimmora <span className="text-ink-mute">Spectra</span>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={toggleCmd}
        className={cn(
          "mx-3 mb-3 flex h-10 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left text-sm text-ink-mute transition hover:bg-white/[0.07]",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon name="search" className="h-4 w-4" />
        {!collapsed && (
          <>
            <span className="flex-1">Ask Aurora · search</span>
            <kbd className="hidden rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-ink-soft sm:inline">
              ⌘K
            </kbd>
          </>
        )}
      </button>

      <nav className="gs-scroll-thin flex-1 overflow-y-auto px-3 pb-4">
        {Object.entries(groups).map(([key, items]) => (
          <div key={key} className="mb-3">
            {!collapsed && (
              <p className="px-2 pt-2 pb-1 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-faint">
                {groupLabel[key]}
              </p>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-all",
                        active
                          ? "bg-white/[0.07] text-ink"
                          : "text-ink-soft hover:bg-white/[0.04] hover:text-ink",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-y-1 left-0 w-[3px] rounded-full"
                          style={{ background: "linear-gradient(180deg, #58e3ff, #8c5cff)" }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon
                        name={item.icon}
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-cyan-spec" : "text-ink-mute group-hover:text-ink-soft",
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <Badge
                              tone={item.badge === "live" ? "aurora" : "neutral"}
                              pulse={item.badge === "live"}
                              className="ml-1 shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div
          className={cn(
            "rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3",
            collapsed && "p-2",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className="relative h-9 w-9 flex-none rounded-xl"
              style={{
                background:
                  "conic-gradient(from 0deg, #58e3ff, #8c5cff, #c965ff, #6affc1)",
              }}
            >
              <div className="absolute inset-[2px] rounded-[10px] bg-deep" />
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-medium">
                MH
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">Mira Holloway</div>
                <div className="truncate text-[11px] text-ink-mute">
                  Spectra · Aurora L4
                </div>
              </div>
            )}
            {!collapsed && (
              <Icon name="chevronDown" className="h-4 w-4 text-ink-mute" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-white/[0.05] gs-glass",
          collapsed ? "w-[72px]" : "w-[260px]",
          "transition-[width] duration-300",
        )}
      >
        {content}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] gs-glass-strong border-r border-white/10 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
