"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Waveform } from "@/components/fx/waveform";
import { ScanGrid } from "@/components/fx/scan-grid";
import { useToast } from "@/components/ui/toast";

const HoloOrb = dynamic(
  () => import("@/components/fx/holo-orb").then((m) => m.HoloOrb),
  { ssr: false },
);

type Msg = { id: string; role: "user" | "assistant" | "system"; text: string; ts: string };

const SEED: Msg[] = [
  { id: "s-1", role: "system", text: "Aurora cognition online · trust boundary nominal", ts: "20:42" },
  { id: "s-2", role: "assistant", text: "Welcome back, Mira. Your day has settled into rhythm. Ten things drifted past your awareness today; three deserve a second look. Ready when you are.", ts: "20:43" },
];

export default function ConsolePage() {
  return (
    <Suspense fallback={null}>
      <ConsoleInner />
    </Suspense>
  );
}

function ConsoleInner() {
  const sp = useSearchParams();
  const initial = sp?.get("prompt") ?? "";
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState(initial);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(true);
  const [boost, setBoost] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const onBoost = () => {
    setBoost((prev) => {
      const next = !prev;
      toast({
        title: next ? "Reasoning boosted" : "Reasoning · standard",
        description: next
          ? "Aurora will route to the deeper model. Replies may take a moment longer."
          : "Back to fast on-device reasoning.",
        tone: next ? "success" : "info",
      });
      return next;
    });
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99_999, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (initial) {
      setTimeout(() => send(initial), 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (text?: string) => {
    const t = (text ?? draft).trim();
    if (!t) return;
    const ts = nowts();
    setMessages((m) => [...m, { id: rid(), role: "user", text: t, ts }]);
    setDraft("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: rid(), role: "assistant", text: synthesise(t), ts: nowts() },
      ]);
      setThinking(false);
    }, 1100);
  };

  return (
    <>
      <PageHeader
        eyebrow="AI interaction console · live"
        title={<>Speak to <span className="gs-text-aurora">Aurora.</span></>}
        description="Voice, gesture and text — fused into a single cinematic conversation surface."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setListening((v) => !v)}>
              <Icon name={listening ? "mic" : "pause"} className="h-4 w-4" />
              {listening ? "Listening" : "Muted"}
            </Button>
            <Button
              variant={boost ? "outline" : "spectral"}
              size="sm"
              onClick={onBoost}
            >
              <Icon name="zap" className="h-4 w-4" />
              {boost ? "Boosted" : "Boost reasoning"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel className="relative overflow-hidden p-0">
            <div className="relative flex h-[calc(100vh-260px)] min-h-[600px] flex-col">
              <ScanGrid />

              <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                <div className="mx-auto max-w-3xl space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((m) => (
                      <Message key={m.id} m={m} />
                    ))}
                    {thinking && <ThinkingBubble />}
                  </AnimatePresence>
                </div>
              </div>

              <div className="relative border-t border-white/[0.06] bg-black/30 px-4 py-4 sm:px-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.04] px-3 py-2 transition focus-within:border-cyan-spec/50 focus-within:bg-white/[0.06]">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
                      aria-label="Toggle mic"
                      onClick={() => setListening((v) => !v)}
                    >
                      <Icon
                        name={listening ? "mic" : "pause"}
                        className={`h-4 w-4 ${listening ? "text-aurora" : "text-ink-mute"}`}
                      />
                    </button>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Ask, recall, plan, command…"
                      className="h-10 flex-1 bg-transparent text-[15px] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => send()}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-black"
                      aria-label="Send"
                    >
                      <Icon name="send" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Brief me on tomorrow",
                      "Recall the orange-arrow whiteboard",
                      "Translate the room",
                      "Summarise the last hour",
                      "What did I miss?",
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[12px] text-ink-soft transition hover:bg-white/[0.06]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <Panel className="relative overflow-hidden p-5 sm:p-7">
            <ScanGrid />
            <div className="relative flex flex-col items-center text-center">
              <Badge tone="aurora" pulse>
                cognition online
              </Badge>
              <div className="mt-4">
                <HoloOrb size={220} label={listening ? "LISTENING" : "STANDBY"} />
              </div>
              <div className="mt-4 flex w-full items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <span className={`h-1.5 w-1.5 rounded-full ${listening ? "bg-aurora gs-pulse" : "bg-ink-faint"}`} />
                <span className="text-[11px] uppercase tracking-[0.25em] text-ink-soft">
                  {listening ? "ambient · 0.4ms" : "standby"}
                </span>
                <Waveform bars={18} className="ml-auto !h-7 max-w-[140px]" active={listening} />
              </div>
              <p className="mt-4 text-xs text-ink-mute">
                Aurora is attending to your voice, gaze, and gesture in parallel.
              </p>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="font-display text-lg">Reasoning trace</h3>
            <ol className="mt-3 space-y-2 text-[12px] font-mono">
              {[
                ["intent.parse", "0.04ms", "cyan"],
                ["context.fetch · 14 mems", "0.21ms", "violet"],
                ["plan.draft · 3 paths", "0.34ms", "aurora"],
                ["policy.consent.check", "0.06ms", "amber"],
                ["respond.compose", "0.18ms", "fuchsia"],
              ].map(([s, t, c], i) => (
                <li
                  key={s as string}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink-soft">{s}</span>
                  </span>
                  <span className={`text-${c}-spec`}>{t}</span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-5">
            <h3 className="font-display text-lg">Sources</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                { l: "Memory · 48391", k: "vision", t: "cyan" },
                { l: "Calendar · Q4 review", k: "doc", t: "amber" },
                { l: "Cedar agent · synthesis", k: "agent", t: "violet" },
                { l: "Web · open verified", k: "globe", t: "aurora" },
              ].map((s) => (
                <li
                  key={s.l}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2"
                >
                  <span className={`h-1.5 w-1.5 rounded-full bg-${s.t}-spec`} />
                  <span className="flex-1 truncate">{s.l}</span>
                  <Icon name="arrowUpRight" className="h-3.5 w-3.5 text-ink-mute" />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Message({ m }: { m: Msg }) {
  if (m.role === "system") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center"
      >
        <span className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-ink-mute">
          {m.text} · {m.ts}
        </span>
      </motion.div>
    );
  }
  const isAi = m.role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
      className={`flex ${isAi ? "justify-start" : "justify-end"}`}
    >
      <div className="max-w-[85%]">
        <div className={`text-[10px] uppercase tracking-widest ${isAi ? "text-cyan-spec" : "text-ink-mute"} mb-1`}>
          {isAi ? "Aurora" : "You"} · {m.ts}
        </div>
        <div
          className={
            isAi
              ? "rounded-2xl rounded-tl-sm border border-white/10 bg-gradient-to-br from-violet-spec/10 to-cyan-spec/10 px-4 py-3 text-[15px] text-ink-soft leading-relaxed"
              : "rounded-2xl rounded-tr-sm border border-white/15 bg-white/[0.07] px-4 py-3 text-[15px]"
          }
        >
          {m.text}
        </div>
      </div>
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 self-start text-xs text-ink-mute w-fit"
    >
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-cyan-spec"
            style={{ animation: `gs-pulse 1.2s ${i * 0.15}s infinite` }}
          />
        ))}
      </span>
      Aurora is reasoning across 14 sources…
    </motion.div>
  );
}

function nowts() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function rid() {
  return Math.random().toString(36).slice(2);
}

function synthesise(prompt: string) {
  const seed = prompt.toLowerCase();
  if (seed.includes("brief"))
    return "Tomorrow opens calmly. 09:30 deep-work block on the cognition spec, 11:00 Cedar review (paper distilled to 3 slides), 13:30 outdoor walk, 15:00 Spectra Lens calibration. Two soft rituals: hydrate after standup, and a 2-minute breathing reset before Cedar.";
  if (seed.includes("orange") || seed.includes("whiteboard") || seed.includes("recall"))
    return "Found it: Tuesday 11:42, Spectra Studio Zürich. Nine-node graph annotated in fuchsia and orange — the consent boundary diagram. Indexed as memory#48391. Opening replay on your right peripheral and pinning a stillshot.";
  if (seed.includes("translate"))
    return "Live translation enabled. French and Mandarin overlaid on the right of your field, English on the left. The current speaker is at 96% intelligibility. Tap your right temple twice to pin a phrase.";
  if (seed.includes("summar") || seed.includes("hour"))
    return "Last hour: 312 tokens of conversation, 14 memories captured, 3 documents OCR'd, 2 agent flows touched the network (Finch held a slot, Meridian scouted three fares). No anomalies.";
  if (seed.includes("miss"))
    return "Three quiet things: Cedar drafted an addendum on consent surfaces that you should glance at; Mira left a voice memo at 17:08 about the lakes-house weekend; the EU compliance group released v2.1 of the trust charter. Want me to summarise any of them?";
  return "Acknowledged. Synthesising across vision, memory and agent traces — first results streaming in your console now. I'll annotate uncertainties in dim cyan and require your confirmation before any external action.";
}
