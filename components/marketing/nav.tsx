"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Vision", href: "#vision" },
  { label: "Memory", href: "#memory" },
  { label: "Agents", href: "#agents" },
  { label: "Enterprise", href: "#enterprise" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 transition-all duration-500",
        scrolled ? "pt-2" : "pt-4",
      )}
    >
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" as const }}
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full px-3 sm:px-4 py-2 transition-all",
          scrolled ? "gs-glass-strong" : "gs-glass",
        )}
      >
        <Link href="/" className="flex items-center gap-2 px-2">
          <LogoMark />
          <span className="hidden font-display text-[15px] tracking-tight sm:block">
            Glimmora <span className="text-ink-mute">Spectra</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-4 py-2 text-sm text-ink-soft transition hover:bg-white/5 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/app/dashboard">
            <Button variant="spectral" size="sm">
              Launch Spectra
              <Icon name="arrow" className="h-4 w-4" />
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ink lg:hidden"
          >
            <Icon name={open ? "x" : "menu"} className="h-4 w-4" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-3 right-3 top-[64px] gs-panel p-3 lg:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base text-ink-soft hover:bg-white/5 hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 flex gap-2 px-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button variant="spectral" size="sm" className="w-full">
                    Get access
                  </Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10",
        className,
      )}
      style={{
        background:
          "conic-gradient(from 0deg, #58e3ff, #8c5cff, #c965ff, #6affc1, #58e3ff)",
      }}
    >
      <div className="absolute inset-[2px] rounded-[10px] bg-void" />
      <svg
        viewBox="0 0 24 24"
        className="relative h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#58e3ff" />
            <stop offset="100%" stopColor="#c965ff" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="3.2" stroke="url(#lg)" />
        <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="url(#lg)" />
        <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="url(#lg)" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="url(#lg)" transform="rotate(120 12 12)" />
      </svg>
    </div>
  );
}
