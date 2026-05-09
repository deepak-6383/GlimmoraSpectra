"use client";

import { motion } from "framer-motion";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { HoloOrb } from "@/components/fx/holo-orb";
import { ScanGrid } from "@/components/fx/scan-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/ui/stat";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.85, ease: "easeOut" as const },
};

export function PlatformSection() {
  return (
    <section id="platform" className="relative mx-auto mt-32 max-w-7xl px-5 sm:mt-40 sm:px-8">
      <SectionHeader
        eyebrow="Operating System"
        title={<>An intelligence layer <span className="gs-text-aurora">woven into perception.</span></>}
        subtitle="Spectra fuses spatial computing, agentic AI and memory augmentation into a single cinematic surface — designed for the human and ready for the enterprise."
      />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
        <FeaturePanel
          className="md:col-span-4"
          icon="eye"
          tone="cyan"
          title="Live vision intelligence"
          body="Object recognition, scene understanding and contextual annotation rendered into your field of view at 0.4ms latency."
        >
          <VisionMockup />
        </FeaturePanel>
        <FeaturePanel
          className="md:col-span-2"
          icon="brain"
          tone="violet"
          title="Infinite memory recall"
        >
          <MemoryMockup />
        </FeaturePanel>
        <FeaturePanel
          className="md:col-span-2"
          icon="agent"
          tone="aurora"
          title="Agentic autonomy"
        >
          <AgentsMockup />
        </FeaturePanel>
        <FeaturePanel
          className="md:col-span-4"
          icon="device"
          tone="cyan"
          title="The Spectra fabric"
          body="Edge-tuned silicon, optical waveguides and a privacy-first cognitive runtime. Engineered for an entire day of perception."
        >
          <DeviceMockup />
        </FeaturePanel>
      </div>
    </section>
  );
}

export function VisionShowcase() {
  return (
    <section id="vision" className="relative mx-auto mt-32 max-w-7xl px-5 sm:mt-40 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <Badge tone="cyan">Vision Intelligence</Badge>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-tight tracking-tight">
            Perception, <span className="gs-text-gradient">decoded in realtime.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Spectra resolves objects, materials, language, gesture, gaze and spatial geometry into
            a unified semantic field. AI annotations float seamlessly inside your vision —
            cinematic, contextual, never noisy.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              { i: "scan", t: "Multi-modal scene parsing", d: "Object · text · spatial layout · biometrics" },
              { i: "languages", t: "Live translation overlays", d: "76 languages · ambient or focal" },
              { i: "shieldCheck", t: "On-device inference first", d: "Cloud-only when explicitly granted" },
            ].map((f) => (
              <li key={f.t} className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Icon name={f.i} className="h-4 w-4 text-cyan-spec" />
                </span>
                <div>
                  <div className="text-sm font-medium">{f.t}</div>
                  <div className="text-sm text-ink-mute">{f.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-deep to-graphite gs-shadow-soft"
        >
          <ScanGrid />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(88,227,255,0.18),transparent_70%)]" />

          <FOVMarker className="left-[18%] top-[24%]" label="Person" conf="0.98" />
          <FOVMarker className="left-[54%] top-[36%]" label="Espresso · Lavazza" conf="0.91" tone="violet" />
          <FOVMarker className="left-[34%] top-[60%]" label="MacBook · M5" conf="0.94" tone="aurora" />
          <FOVMarker className="left-[70%] top-[64%]" label="Distance · 1.2m" conf="0.99" tone="amber" />

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl gs-glass-strong px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Icon name="radar" className="h-4 w-4 text-cyan-spec" />
              <span>Cognition pipeline</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-aurora gs-blink" />
              42fps · 87% on-device
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function MemorySection() {
  const events = [
    { t: "08:14", title: "Morning standup · Aurora summarised in 32s", tone: "cyan" as const },
    { t: "11:02", title: "Notebook captured · 14 stickies, OCR'd", tone: "violet" as const },
    { t: "13:48", title: "Lunch with Mira · context graphed", tone: "aurora" as const },
    { t: "16:21", title: "Whiteboard distilled into 9 action items", tone: "amber" as const },
  ];
  return (
    <section id="memory" className="relative mx-auto mt-32 max-w-7xl px-5 sm:mt-40 sm:px-8">
      <SectionHeader
        eyebrow="Memory Engine"
        title={<>Recall <span className="gs-text-aurora">anything you've ever seen.</span></>}
        subtitle="Spectra weaves your day into a queryable timeline. Ask it. Search it. Replay it. Privacy-first — yours alone unless you decide otherwise."
        align="center"
      />
      <motion.div {...fadeUp} className="mt-12">
        <Panel className="p-5 sm:p-8">
          <div className="flex flex-col items-stretch gap-6 lg:flex-row">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink-mute">
                <Icon name="search" className="h-3.5 w-3.5" />
                Semantic recall
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm">
                <span className="text-ink-mute">/ </span>
                <span className="text-ink">that diagram from Tuesday with the four quadrants and the orange arrows</span>
                <span className="ml-1 inline-block h-4 w-px bg-cyan-spec gs-caret align-middle" />
              </div>

              <div className="mt-4 space-y-2">
                {events.map((e) => (
                  <div
                    key={e.t}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm"
                  >
                    <span className="font-mono text-[11px] text-ink-mute w-12">{e.t}</span>
                    <Badge tone={e.tone}>{e.tone}</Badge>
                    <span className="truncate text-ink-soft">{e.title}</span>
                    <Icon name="arrowUpRight" className="ml-auto h-4 w-4 text-ink-mute" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-spec/15 via-deep to-cyan-spec/10 p-6">
              <ScanGrid />
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.25em] text-ink-mute">
                  Memory graph
                </div>
                <div className="mt-2 font-display text-xl">12,847 events · 24h</div>
                <Sparkline
                  className="text-violet-spec"
                  points={[12, 18, 22, 17, 28, 30, 26, 34, 38, 31, 42, 48, 44, 52, 58]}
                />
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                  {[
                    { l: "Faces", v: 86, t: "cyan" },
                    { l: "Places", v: 42, t: "aurora" },
                    { l: "Objects", v: 1820, t: "violet" },
                  ].map((m) => (
                    <div
                      key={m.l}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="uppercase tracking-widest text-ink-mute">
                        {m.l}
                      </div>
                      <div className="mt-1 font-display text-lg">
                        {m.v.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </motion.div>
    </section>
  );
}

export function AgentsSection() {
  return (
    <section id="agents" className="relative mx-auto mt-32 max-w-7xl px-5 sm:mt-40 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <motion.div {...fadeUp} className="lg:col-span-5">
          <Badge tone="violet">Agentic AI</Badge>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,3.4rem)] font-semibold tracking-tight leading-tight">
            A <span className="gs-text-gradient">workforce of cognition</span> at the edge of your vision.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Spectra agents observe, decide, and act — orchestrating calendars,
            documents, devices and the physical world. Composable. Auditable.
            Always under your control.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app/agents">
              <Button variant="spectral">
                Explore agents
                <Icon name="arrow" className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/console">
              <Button variant="outline">Open console</Button>
            </Link>
          </div>
        </motion.div>

        <div className="lg:col-span-7">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Icon name="workflow" className="h-4 w-4 text-violet-spec" />
                </span>
                <div>
                  <div className="text-sm font-medium">Aurora orchestrator</div>
                  <div className="text-xs text-ink-mute">12 agents · 3 active flows</div>
                </div>
              </div>
              <Badge tone="aurora" pulse>
                Streaming
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <AgentCard name="Meridian" role="Travel & Logistics" status="Negotiating · 3 vendors" />
              <AgentCard name="Cedar" role="Research Copilot" status="Synthesising 14 sources" tone="violet" />
              <AgentCard name="Finch" role="Scheduling" status="Held Mon 14:00 · Mira" tone="aurora" />
              <AgentCard name="Vesper" role="Vision Curator" status="Indexed 248 frames" tone="amber" />
            </div>

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/30 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-mute">
                <Icon name="branch" className="h-3.5 w-3.5" />
                Live trace
              </div>
              <div className="mt-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                <p><span className="text-cyan-spec">aurora.observe</span>(meeting:&quot;Q4 review&quot;) →</p>
                <p className="pl-3"><span className="text-violet-spec">cedar.summarise</span>(transcript) → <span className="text-aurora">9 actions</span></p>
                <p className="pl-6"><span className="text-amber-spec">finch.schedule</span>(&quot;Mira&quot;, &quot;14:00 Mon&quot;) → <span className="text-aurora">held</span></p>
                <p className="pl-9"><span className="text-coral">meridian.book</span>(&quot;ZRH→SFO&quot;, dates) → <span className="text-cyan-spec">3 options</span></p>
                <p className="pl-3 text-ink-mute">// awaiting your confirmation in Spectra console <span className="gs-caret">▌</span></p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

export function EnterpriseSection() {
  return (
    <section id="enterprise" className="relative mx-auto mt-32 max-w-7xl px-5 sm:mt-40 sm:px-8">
      <SectionHeader
        eyebrow="Enterprise"
        title={<>Built for the <span className="gs-text-aurora">augmented organization.</span></>}
        subtitle="Deploy Spectra across thousands of devices with cognitive observability, granular permissions and zero-trust memory governance."
        align="center"
      />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          {
            icon: "shieldCheck",
            title: "Cognitive Trust Boundary",
            body: "On-device first inference, encrypted memory enclaves, signed agent actions and reversible automation.",
          },
          {
            icon: "network",
            title: "Spectra Mesh",
            body: "Devices, fleets and tenants federated through a low-latency cognitive control plane.",
          },
          {
            icon: "chart",
            title: "Observability for cognition",
            body: "Trace every thought, intervention and inference with model-level explainability and audit replay.",
          },
        ].map((c) => (
          <motion.div key={c.title} {...fadeUp}>
            <Panel className="p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Icon name={c.icon} className="h-5 w-5 text-cyan-spec" />
              </span>
              <h3 className="mt-5 font-display text-xl">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="relative mx-auto mt-32 max-w-7xl px-5 sm:mt-40 sm:px-8">
      <motion.div {...fadeUp} className="relative overflow-hidden rounded-[36px] border border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, rgba(140,92,255,0.45), transparent 70%), linear-gradient(180deg, #0a0b14, #03040a)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px gs-holo-line"
        />
        <div className="grid grid-cols-1 items-center gap-10 px-6 py-14 sm:px-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <Badge tone="violet" pulse>
              Limited cohort · Spring '26
            </Badge>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-tight">
              <span className="gs-text-gradient">Step into</span>
              <br />
              the augmented century.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Apply for early access to the Spectra cognitive platform and receive
              your developer pair, on-site calibration and white-glove onboarding.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button variant="spectral" size="lg">
                  Request access
                  <Icon name="arrow" className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/dashboard">
                <Button variant="outline" size="lg">
                  Live demo
                  <Icon name="arrowUpRight" className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <HoloOrb size={300} label="SPECTRA / CORE" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------- helpers -------------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      {...fadeUp}
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

function FeaturePanel({
  className = "",
  icon,
  tone,
  title,
  body,
  children,
}: {
  className?: string;
  icon: string;
  tone: "cyan" | "violet" | "aurora";
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  const ringTone =
    tone === "violet"
      ? "text-violet-spec"
      : tone === "aurora"
        ? "text-aurora"
        : "text-cyan-spec";
  return (
    <motion.div {...fadeUp} className={className}>
      <Panel className="relative h-full overflow-hidden p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon name={icon} className={`h-5 w-5 ${ringTone}`} />
          </span>
          <h3 className="font-display text-xl tracking-tight">{title}</h3>
        </div>
        {body && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{body}</p>
        )}
        <div className="mt-6">{children}</div>
      </Panel>
    </motion.div>
  );
}

function VisionMockup() {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black/50">
      <ScanGrid />
      <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_50%,rgba(88,227,255,0.18),transparent_70%)]" />
      <FOVMarker className="left-[18%] top-[28%]" label="Subject · Mira" conf="0.97" />
      <FOVMarker className="left-[55%] top-[42%]" label="Surface · oak" conf="0.88" tone="aurora" />
      <FOVMarker className="left-[36%] top-[68%]" label="Document · invoice" conf="0.93" tone="violet" />
    </div>
  );
}

function MemoryMockup() {
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-spec/15 to-deep p-4">
      <div className="text-[11px] uppercase tracking-widest text-ink-mute">last 24h</div>
      <Sparkline
        className="text-violet-spec mt-2"
        points={[8, 14, 11, 22, 18, 25, 30, 28, 36, 32, 40, 48, 42, 51, 60]}
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-ink-soft">12,847 events</span>
        <span className="text-aurora">+8.2%</span>
      </div>
    </div>
  );
}

function AgentsMockup() {
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-aurora/15 to-deep p-4">
      <div className="text-[11px] uppercase tracking-widest text-ink-mute">orchestration</div>
      <ul className="mt-2 space-y-2 text-xs">
        {[
          ["meridian", "booking ZRH → SFO", "aurora"],
          ["cedar", "synthesising 14 docs", "violet"],
          ["finch", "scheduled · Mon 14:00", "amber"],
        ].map(([n, s, t]) => (
          <li key={n} className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.05] px-2.5 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full bg-${t}-spec`} />
            <span className="font-medium">{n}</span>
            <span className="text-ink-mute">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DeviceMockup() {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-spec/12 via-deep to-violet-spec/15 p-6">
      <ScanGrid />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 320 96" className="w-[80%] max-w-[420px]" fill="none">
          <defs>
            <linearGradient id="lensG" x1="0" x2="1">
              <stop offset="0%" stopColor="#58e3ff" />
              <stop offset="100%" stopColor="#8c5cff" />
            </linearGradient>
          </defs>
          <path
            d="M14 48 H30 a36 36 0 0 1 36 -34 h60 a18 18 0 0 1 36 0 h60 a36 36 0 0 1 36 34 h14"
            stroke="url(#lensG)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
          <ellipse cx="96" cy="48" rx="42" ry="24" stroke="url(#lensG)" strokeWidth="1.6" fill="rgba(88,227,255,0.06)" />
          <ellipse cx="224" cy="48" rx="42" ry="24" stroke="url(#lensG)" strokeWidth="1.6" fill="rgba(140,92,255,0.07)" />
          <circle cx="96" cy="48" r="3" fill="#58e3ff" />
          <circle cx="224" cy="48" r="3" fill="#c965ff" />
        </svg>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl gs-glass-strong px-3 py-2 text-[11px]">
        <span className="text-ink-soft">Spectra Lens · v3 Aurora</span>
        <span className="text-aurora">Battery 14h · Optical waveguide HD</span>
      </div>
    </div>
  );
}

function FOVMarker({
  className = "",
  label,
  conf,
  tone = "cyan",
}: {
  className?: string;
  label: string;
  conf: string;
  tone?: "cyan" | "violet" | "aurora" | "amber";
}) {
  const colorMap = {
    cyan: "border-cyan-spec/70 text-cyan-spec",
    violet: "border-violet-spec/70 text-violet-spec",
    aurora: "border-aurora/70 text-aurora",
    amber: "border-amber-spec/70 text-amber-spec",
  };
  return (
    <div className={`absolute ${className}`}>
      <div className={`h-12 w-12 rounded-md border ${colorMap[tone]}`}>
        <div className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-current" />
        <div className="absolute -top-1 -right-1 h-2 w-2 border-t border-r border-current" />
        <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b border-l border-current" />
        <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-current" />
      </div>
      <div className="absolute left-14 top-0 whitespace-nowrap rounded-md gs-glass-strong px-2 py-1 text-[10px] font-mono">
        <span className={colorMap[tone].split(" ")[1]}>{label}</span>
        <span className="ml-1 text-ink-mute">· {conf}</span>
      </div>
    </div>
  );
}

function AgentCard({
  name,
  role,
  status,
  tone = "cyan",
}: {
  name: string;
  role: string;
  status: string;
  tone?: "cyan" | "violet" | "aurora" | "amber";
}) {
  const dot =
    tone === "violet"
      ? "bg-violet-spec"
      : tone === "aurora"
        ? "bg-aurora"
        : tone === "amber"
          ? "bg-amber-spec"
          : "bg-cyan-spec";
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm">
        <span className={`h-1.5 w-1.5 rounded-full ${dot} gs-pulse`} />
        <span className="font-medium">{name}</span>
        <span className="text-ink-mute">· {role}</span>
      </div>
      <div className="mt-2 text-xs text-ink-soft">{status}</div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full w-2/3 ${dot} gs-shimmer`} />
      </div>
    </div>
  );
}
