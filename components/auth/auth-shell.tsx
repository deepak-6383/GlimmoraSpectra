"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LogoMark } from "@/components/marketing/nav";
import { ParticleField } from "@/components/fx/particle-field";
import { HoloOrb } from "@/components/fx/holo-orb";
import { ScanGrid } from "@/components/fx/scan-grid";

export function AuthShell({
  title,
  eyebrow,
  subtitle,
  children,
  swap,
}: {
  title: React.ReactNode;
  eyebrow: string;
  subtitle: string;
  children: React.ReactNode;
  swap: { label: string; href: string; cta: string };
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleField className="absolute inset-0 -z-10 h-full w-full opacity-60" />

      <div className="absolute left-5 top-5 sm:left-8 sm:top-8 z-20">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display text-[15px] tracking-tight">
            Glimmora <span className="text-ink-mute">Spectra</span>
          </span>
        </Link>
      </div>
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8 z-20 text-sm text-ink-mute">
        <span className="hidden sm:inline">{swap.label} </span>
        <Link href={swap.href} className="text-ink underline-offset-4 hover:underline">
          {swap.cta}
        </Link>
      </div>

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
        <div className="relative hidden lg:col-span-6 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 30% 50%, rgba(140,92,255,0.25), transparent 70%), radial-gradient(70% 70% at 80% 70%, rgba(88,227,255,0.22), transparent 70%)",
            }}
          />
          <ScanGrid className="opacity-60" />
          <div className="relative m-auto flex flex-col items-center px-12">
            <HoloOrb size={340} label="AURORA / COGNITION" />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9 }}
              className="mt-12 max-w-md text-center text-sm uppercase tracking-[0.3em] text-ink-mute"
            >
              The augmented century begins behind a single pair of lenses.
            </motion.p>
          </div>
        </div>

        <div className="relative col-span-1 flex items-center justify-center px-6 py-24 sm:px-10 lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-ink-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-aurora gs-pulse" />
                {eyebrow}
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm text-ink-soft">{subtitle}</p>
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
