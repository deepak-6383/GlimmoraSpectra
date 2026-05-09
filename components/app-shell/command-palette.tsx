"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useCommandPalette } from "@/lib/store";
import { NAV } from "@/lib/nav";

type Action = {
  id: string;
  label: string;
  hint?: string;
  href?: string;
  icon: string;
  group: "Navigate" | "Aurora" | "Quick action";
};

const SUGGESTIONS: Action[] = [
  { id: "ask-summary", label: "Summarise the last 24 hours of memory", icon: "sparkles", group: "Aurora" },
  { id: "ask-tasks", label: "What are my five most pressing tasks?", icon: "target", group: "Aurora" },
  { id: "ask-people", label: "Brief me before my meeting with Mira", icon: "users", group: "Aurora" },
  { id: "scan-now", label: "Scan environment for action items", icon: "scan", group: "Quick action" },
  { id: "translate", label: "Toggle live translation overlay", icon: "languages", group: "Quick action" },
  { id: "memory-replay", label: "Replay yesterday afternoon", icon: "history", group: "Quick action" },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const navActions: Action[] = useMemo(
    () =>
      NAV.map((n) => ({
        id: `nav-${n.href}`,
        label: n.label,
        href: n.href,
        icon: n.icon,
        group: "Navigate" as const,
      })),
    [],
  );

  const all = [...navActions, ...SUGGESTIONS];
  const filtered = query
    ? all.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : all;

  const grouped = filtered.reduce<Record<string, Action[]>>((acc, a) => {
    (acc[a.group] ||= []).push(a);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[10vh]"
        >
          <motion.div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: -16, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" as const }}
            className="relative w-full max-w-2xl gs-panel gs-noise overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <Icon name="sparkles" className="h-5 w-5 text-cyan-spec" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Aurora or jump anywhere…"
                className="h-9 flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint outline-none"
              />
              <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                Esc
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {Object.keys(grouped).length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-ink-mute">
                  No matches. Try a different prompt.
                </div>
              )}
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-2">
                  <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                    {group}
                  </p>
                  {items.map((a) => {
                    const inner = (
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.05]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                          <Icon name={a.icon} className="h-4 w-4 text-cyan-spec" />
                        </span>
                        <span className="flex-1 text-sm">{a.label}</span>
                        {a.hint && (
                          <span className="text-xs text-ink-mute">{a.hint}</span>
                        )}
                        <Icon name="arrow" className="h-4 w-4 text-ink-mute" />
                      </div>
                    );
                    return a.href ? (
                      <Link
                        key={a.id}
                        href={a.href}
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          if (a.group === "Aurora" || a.group === "Quick action") {
                            router.push("/app/console?prompt=" + encodeURIComponent(a.label));
                          }
                        }}
                        className="block w-full text-left"
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-[11px] text-ink-mute">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-white/10 bg-white/[0.05] px-1 font-mono">↵</kbd>
                  open
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-white/10 bg-white/[0.05] px-1 font-mono">↑↓</kbd>
                  navigate
                </span>
              </div>
              <span className="font-mono uppercase tracking-widest">
                aurora.cognition · v3
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
