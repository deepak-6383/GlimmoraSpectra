"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type Toast = ToastInput & { id: string };

type ToastState = {
  toasts: Toast[];
  push: (t: ToastInput) => void;
  dismiss: (id: string) => void;
};

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const ttl = t.duration ?? 3500;
    if (ttl > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, ttl);
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function useToast() {
  return useToastStore((s) => s.push);
}

const TONE_CLASS: Record<ToastTone, string> = {
  info: "border-cyan-spec/30 bg-cyan-spec/10 text-cyan-spec",
  success: "border-aurora/30 bg-aurora/10 text-aurora",
  warning: "border-amber-spec/30 bg-amber-spec/10 text-amber-spec",
  error: "border-coral/30 bg-coral/10 text-coral",
};

const TONE_ICON: Record<ToastTone, string> = {
  info: "sparkles",
  success: "check",
  warning: "alert",
  error: "alert",
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-3 sm:top-5">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto w-full max-w-md rounded-2xl border gs-glass-strong px-4 py-3 shadow-[0_18px_60px_-25px_rgba(0,0,0,0.7)]",
              TONE_CLASS[t.tone ?? "info"],
            )}
            onClick={() => dismiss(t.id)}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-xl border border-current/30 bg-current/10">
                <Icon name={TONE_ICON[t.tone ?? "info"]} className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink">{t.title}</div>
                {t.description && (
                  <div className="mt-0.5 text-xs text-ink-soft">{t.description}</div>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(t.id);
                }}
                className="flex h-6 w-6 flex-none items-center justify-center rounded-lg text-ink-mute hover:text-ink"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Helper so non-React modules can dispatch a toast. */
export function dispatchToast(t: ToastInput) {
  useToastStore.getState().push(t);
}

/** Optional hook: register a global keyboard shortcut to dismiss all. */
export function useGlobalToastShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useToastStore.setState({ toasts: [] });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
