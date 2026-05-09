"use client";

import { create } from "zustand";

type CommandPaletteState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
  toggleCollapsed: () => void;
};

export const useSidebar = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  setCollapsed: (v) => set({ collapsed: v }),
  setMobileOpen: (v) => set({ mobileOpen: v }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
}));

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;
};

type AssistantState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: AssistantMessage[];
  push: (m: Omit<AssistantMessage, "id" | "ts">) => void;
};

export const useAssistant = create<AssistantState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  messages: [
    {
      id: "boot-1",
      role: "system",
      content: "Spectra Core online. Cognitive layer engaged.",
      ts: Date.now() - 9_000,
    },
    {
      id: "boot-2",
      role: "assistant",
      content:
        "I'm Aurora — your Spectra cognitive companion. I see what you see, remember what matters, and act on your behalf. How can I augment your reality today?",
      ts: Date.now() - 4_000,
    },
  ],
  push: (m) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...m, id: Math.random().toString(36).slice(2), ts: Date.now() },
      ],
    })),
}));
