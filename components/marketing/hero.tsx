"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ParticleField } from "@/components/fx/particle-field";
import { Waveform } from "@/components/fx/waveform";

const AgiCore = dynamic(
  () => import("@/components/agi-core").then((m) => m.AgiCore),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-full w-full">
        <div className="absolute inset-0 m-auto h-44 w-44 rounded-full bg-gradient-to-br from-cyan-spec/40 to-violet-spec/40 blur-3xl" />
      </div>
    ),
  },
);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-[680px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(140,92,255,0.18), transparent 60%)",
        }}
      />
      <ParticleField className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="relative z-10 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" as const }}
            >
              <Badge tone="cyan" pulse>
                Aurora cognition · v3
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05, ease: "easeOut" as const }}
              className="mt-5 font-display text-[clamp(2.4rem,6vw,5.4rem)] font-semibold leading-[0.98] tracking-tight"
            >
              <span className="gs-text-gradient">AGI for</span>
              <br />
              <span className="text-ink">the human eye.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
            >
              Glimmora Spectra is an AGI-native operating system woven into smart eyewear.
              It sees what you see, remembers what matters, and acts on your behalf — a
              cinematic intelligence layer for everyday perception.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/app/dashboard">
                <Button variant="spectral" size="lg">
                  Enter the Spectra
                  <Icon name="arrow" className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#platform">
                <Button variant="outline" size="lg">
                  <Icon name="play" className="h-4 w-4" />
                  Watch the experience
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.1 }}
              className="mt-10 grid max-w-xl grid-cols-3 gap-3 sm:gap-4"
            >
              {[
                { k: "Cognition", v: "0.4ms" },
                { k: "Vision FOV", v: "112°" },
                { k: "Memory", v: "∞ tokens" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="gs-glass rounded-2xl p-3.5 sm:p-4 gs-noise"
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink-mute">
                    {s.k}
                  </div>
                  <div className="mt-1 font-display text-lg sm:text-xl tracking-tight">
                    {s.v}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" as const }}
              className="relative aspect-square w-full max-w-[640px] mx-auto"
            >
              <div className="absolute inset-0 -z-10 rounded-full blur-[80px] opacity-60"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(140,92,255,0.45), rgba(88,227,255,0.25), transparent 70%)",
                }}
              />
              <AgiCore className="absolute inset-0" />

              <FloatingChip
                className="left-2 top-6 sm:left-4"
                icon="eye"
                title="Vision Layer"
                value="Active · 87 ROIs"
              />
              <FloatingChip
                className="right-0 top-1/3"
                icon="brain"
                title="Memory recall"
                value="14ms"
                tone="violet"
              />
              <FloatingChip
                className="left-2 bottom-10 sm:left-6"
                icon="agent"
                title="Agents online"
                value="12 / 24"
                tone="aurora"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9 }}
              className="gs-glass mx-auto mt-6 flex w-full max-w-[420px] items-center gap-3 rounded-full px-4 py-3"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-aurora opacity-75 gs-pulse" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora" />
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-ink-soft">
                Aurora listening
              </span>
              <Waveform bars={22} className="ml-auto !h-8 max-w-[180px]" />
            </motion.div>
          </div>
        </div>

        <Marquee />
      </div>
    </section>
  );
}

function FloatingChip({
  className,
  icon,
  title,
  value,
  tone = "cyan",
}: {
  className?: string;
  icon: string;
  title: string;
  value: string;
  tone?: "cyan" | "violet" | "aurora";
}) {
  const ring =
    tone === "violet"
      ? "ring-violet-spec/40"
      : tone === "aurora"
        ? "ring-aurora/40"
        : "ring-cyan-spec/40";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.7 }}
      className={`gs-glass-strong absolute hidden items-center gap-3 rounded-full px-3.5 py-2 text-sm ring-1 sm:flex ${ring} ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
        <Icon name={icon} className="h-3.5 w-3.5 text-white" />
      </span>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-widest text-ink-mute">{title}</div>
        <div className="text-[12px] font-medium">{value}</div>
      </div>
    </motion.div>
  );
}

function Marquee() {
  const items = [
    "MIT Cognitive Sciences",
    "Stanford HAI",
    "ETH Zürich Spatial",
    "ARC Institute",
    "Stripe Atlas",
    "OpenForge",
    "Antarctic Labs",
    "Helix Ventures",
  ];
  return (
    <div className="mt-24 sm:mt-28">
      <p className="mb-6 text-center text-[11px] uppercase tracking-[0.3em] text-ink-mute">
        Trusted in research, defense, and creative industries
      </p>
      <div className="relative overflow-hidden mask-x-fade">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-12 whitespace-nowrap">
          {[...items, ...items].map((it, i) => (
            <span
              key={i}
              className="font-display text-base text-ink-mute/80 tracking-tight"
            >
              {it}
            </span>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .mask-x-fade {
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
          }
        `}</style>
      </div>
    </div>
  );
}
