"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useAssistant } from "@/lib/store";
import { Waveform } from "@/components/fx/waveform";
import { HoloOrb } from "@/components/fx/holo-orb";

export function AssistantDock() {
  const { open, setOpen, messages, push } = useAssistant();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 99_999, behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    push({ role: "user", content: text });
    setDraft("");
    setTimeout(() => {
      push({
        role: "assistant",
        content: synthesise(text),
      });
    }, 720);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="fixed bottom-3 right-3 top-3 z-40 flex w-[min(420px,calc(100vw-1.5rem))] flex-col gs-panel gs-noise"
        >
          <header className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <HoloOrb size={36} />
              </div>
              <div>
                <div className="text-sm font-medium">Aurora</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-aurora">
                  cognition online
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
              aria-label="Close"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} text={m.content} />
            ))}
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-aurora gs-pulse" />
              <span className="text-[11px] uppercase tracking-widest text-ink-mute">
                listening · ambient
              </span>
              <Waveform bars={18} className="ml-auto !h-6 max-w-[140px]" />
            </div>
          </div>

          <div className="border-t border-white/[0.06] p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <Icon name="sparkles" className="h-4 w-4 text-cyan-spec" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Aurora to plan, recall, or act…"
                className="h-8 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={send}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"
                aria-label="Send"
              >
                <Icon name="send" className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "Brief me",
                "Plan tomorrow",
                "Recall whiteboard",
                "Translate live",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft(s)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-ink-soft hover:bg-white/[0.06]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Bubble({
  role,
  text,
}: {
  role: "user" | "assistant" | "system";
  text: string;
}) {
  if (role === "system") {
    return (
      <div className="text-center text-[10px] uppercase tracking-[0.3em] text-ink-faint">
        {text}
      </div>
    );
  }
  const isAi = role === "assistant";
  return (
    <div className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
      <div
        className={
          isAi
            ? "max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-gradient-to-br from-violet-spec/10 to-cyan-spec/10 px-3 py-2.5 text-sm text-ink-soft"
            : "max-w-[85%] rounded-2xl rounded-tr-sm border border-white/10 bg-white/[0.07] px-3 py-2.5 text-sm"
        }
      >
        {text}
      </div>
    </div>
  );
}

function synthesise(prompt: string) {
  const seed = prompt.toLowerCase();
  if (seed.includes("brief")) {
    return "Briefing: Mira will arrive at 14:00. Last interaction surfaced two open questions on quarterly forecasts and the new memory enclave policy. I've pulled three slides from your archive.";
  }
  if (seed.includes("plan")) {
    return "Tomorrow draft: 09:30 deep-work block on Aurora cognition spec. 11:00 Cedar review. 13:30 walk + voice memos. 15:00 Spectra Lens calibration. Shall I lock this in?";
  }
  if (seed.includes("recall") || seed.includes("memory") || seed.includes("whiteboard")) {
    return "Recall complete. I found 3 whiteboard captures matching your description. The most relevant is from Tuesday 11:42 with 9 nodes and orange arrows — opening it in Memory Engine.";
  }
  if (seed.includes("translate")) {
    return "Live translation enabled across French, Mandarin and Tamil. Subtitles will appear in your right peripheral overlay. Tap your temple twice to dismiss.";
  }
  return "Acknowledged. I'll synthesise that across vision, memory and agent traces. Stand by — first results in your console in a moment.";
}
