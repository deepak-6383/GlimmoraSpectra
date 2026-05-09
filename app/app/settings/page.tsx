"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const SECTIONS = [
  { k: "profile", l: "Profile", i: "user" },
  { k: "ai", l: "AI permissions", i: "sparkles" },
  { k: "privacy", l: "Privacy & memory", i: "shieldCheck" },
  { k: "appearance", l: "Appearance", i: "moon" },
  { k: "audio", l: "Voice & audio", i: "headphones" },
  { k: "security", l: "Security", i: "lock" },
];

export default function SettingsPage() {
  const [section, setSection] = useState(SECTIONS[0].k);

  return (
    <>
      <PageHeader
        eyebrow="Settings & privacy"
        title={<>Your cognitive <span className="gs-text-aurora">trust boundary.</span></>}
        description="Tune Aurora's behaviour, decide what is remembered, what is cloud-eligible, and what stays local to your lens."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Panel className="p-2">
            <ul>
              {SECTIONS.map((s) => (
                <li key={s.k}>
                  <button
                    type="button"
                    onClick={() => setSection(s.k)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      section === s.k
                        ? "bg-white/[0.06] text-ink"
                        : "text-ink-soft hover:bg-white/[0.04] hover:text-ink"
                    }`}
                  >
                    <Icon
                      name={s.i}
                      className={`h-4 w-4 ${
                        section === s.k ? "text-cyan-spec" : "text-ink-mute"
                      }`}
                    />
                    {s.l}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="mt-5 p-5">
            <Badge tone="aurora" pulse>Trust boundary</Badge>
            <h3 className="mt-3 font-display text-lg">All systems honoured</h3>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-aurora" /> 0 unauthorised inferences</li>
              <li className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-aurora" /> 12 explicit consents today</li>
              <li className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-aurora" /> Memory enclave verified</li>
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-9 space-y-5">
          {section === "profile" && <ProfileSection />}
          {section === "ai" && <AISection />}
          {section === "privacy" && <PrivacySection />}
          {section === "appearance" && <AppearanceSection />}
          {section === "audio" && <AudioSection />}
          {section === "security" && <SecuritySection />}
        </div>
      </div>
    </>
  );
}

function SectionPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
    >
      <Panel className="p-5 sm:p-7">
        <Badge>{eyebrow}</Badge>
        <h2 className="mt-3 font-display text-2xl tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </Panel>
    </motion.div>
  );
}

function ProfileSection() {
  return (
    <SectionPanel
      eyebrow="Profile"
      title="Identity"
      description="The face Aurora knows you by, across every device and every tenant."
    >
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <div
          className="relative h-24 w-24 flex-none rounded-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, #58e3ff, #8c5cff, #c965ff, #6affc1)",
          }}
        >
          <div className="absolute inset-[3px] rounded-[20px] bg-deep flex items-center justify-center font-display text-2xl">
            MH
          </div>
        </div>
        <div className="flex-1 space-y-4 w-full">
          <Row label="Name" value="Mira Holloway" />
          <Row label="Identity" value="mira@spectra.io" />
          <Row label="Tenant" value="acme.spectra · Aurora L4" />
          <Row label="Locale" value="English (UK) · Zürich" />
          <Row label="Pronouns" value="she / her" />
        </div>
      </div>
    </SectionPanel>
  );
}

function AISection() {
  return (
    <SectionPanel
      eyebrow="AI permissions"
      title="What Aurora may do"
      description="Granular control over inference, autonomy, and reach. Every change is signed and reversible."
    >
      <div className="space-y-3">
        <Toggle label="Ambient listening" desc="Always-on micro-context capture for proactive assistance." defaultChecked />
        <Toggle label="Vision indexing" desc="Continuously index your field of view into memory." defaultChecked />
        <Toggle label="Autonomous booking" desc="Allow Meridian to confirm low-risk transactions on your behalf." defaultChecked={false} />
        <Toggle label="Cloud reasoning" desc="Route complex prompts to sovereign cloud when needed." defaultChecked />
        <Toggle label="Memory sharing across team" desc="Share work-tagged memories with your tenant teammates." defaultChecked={false} />
        <Toggle label="Biometric overlays" desc="Enable health & emotion read-out on lens HUD." defaultChecked={false} />
      </div>
    </SectionPanel>
  );
}

function PrivacySection() {
  return (
    <SectionPanel
      eyebrow="Privacy & memory"
      title="Memory governance"
      description="Decide what is remembered, what is purged, and what never leaves the lens."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { k: "Default privacy class", v: "private", t: "aurora" },
          { k: "Data residency", v: "EU · Zürich", t: "cyan" },
          { k: "Retention policy", v: "365 days", t: "violet" },
          { k: "Cloud-eligible classes", v: "work · public", t: "amber" },
        ].map((p) => (
          <div
            key={p.k}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
          >
            <div className="text-[10px] uppercase tracking-widest text-ink-mute">
              {p.k}
            </div>
            <div className={`mt-1 font-mono text-sm text-${p.t}-spec`}>{p.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <Toggle label="Privacy zones" desc="Auto-blur recording near home, schools, and clinics." defaultChecked />
        <Toggle label="Bystander consent" desc="Pause indexing when unrecognised faces are present." defaultChecked />
        <Toggle label="On-device only mode" desc="Disable all cloud egress for 24h." defaultChecked={false} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Icon name="download" className="h-3.5 w-3.5" /> Export memories
        </Button>
        <Button variant="ghost" size="sm" className="text-coral">
          <Icon name="trash" className="h-3.5 w-3.5" /> Forget everything
        </Button>
      </div>
    </SectionPanel>
  );
}

function AppearanceSection() {
  return (
    <SectionPanel
      eyebrow="Appearance"
      title="Cinematic surfaces"
      description="Tune the texture of your cognitive environment."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { l: "Aurora Dark", from: "#03040a", to: "#161433", default: true },
          { l: "Spectral Bloom", from: "#0a0017", to: "#3b0a4a" },
          { l: "Glacier", from: "#031022", to: "#0a3550" },
        ].map((th) => (
          <label
            key={th.l}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.025] p-4 has-[:checked]:border-cyan-spec/60 has-[:checked]:ring-2 has-[:checked]:ring-cyan-spec/25"
          >
            <input type="radio" name="theme" defaultChecked={th.default} className="sr-only" />
            <div
              className="aspect-[4/3] w-full rounded-xl border border-white/10"
              style={{ background: `linear-gradient(135deg, ${th.from}, ${th.to})` }}
            />
            <div className="mt-3 text-sm font-medium">{th.l}</div>
          </label>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <Toggle label="Reduce motion" desc="Honour OS-level reduced motion across all surfaces." defaultChecked={false} />
        <Toggle label="Cinematic transitions" desc="Use full GPU motion when available." defaultChecked />
      </div>
    </SectionPanel>
  );
}

function AudioSection() {
  return (
    <SectionPanel
      eyebrow="Voice & audio"
      title="Aurora's voice"
      description="Personality, language, ambient cues."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { l: "Aurora · soft", desc: "Calm, breathy, low warmth", default: true },
          { l: "Aurora · prime", desc: "Crisp, neutral, professional" },
          { l: "Aurora · cinema", desc: "Deep, resonant, narrative" },
        ].map((v) => (
          <label
            key={v.l}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.025] p-4 has-[:checked]:border-violet-spec/60 has-[:checked]:bg-violet-spec/10"
          >
            <input type="radio" name="voice" defaultChecked={v.default} className="sr-only" />
            <div className="text-sm font-medium">{v.l}</div>
            <div className="mt-1 text-xs text-ink-mute">{v.desc}</div>
          </label>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <Toggle label="Spatial audio cues" desc="Locate notifications in 3D space across the soundstage." defaultChecked />
        <Toggle label="Whisper mode" desc="Aurora replies sub-vocally via bone conduction." defaultChecked={false} />
      </div>
    </SectionPanel>
  );
}

function SecuritySection() {
  return (
    <SectionPanel
      eyebrow="Security"
      title="Authentication"
      description="Hardware-bound passkeys, signed agent actions, zero-trust enclaves."
    >
      <div className="space-y-3">
        <Row label="Passkey · Spectra Lens" value="Bound · last used 12m ago" tone="aurora" />
        <Row label="Passkey · MacBook" value="Bound · last used 2h ago" tone="cyan" />
        <Row label="SSO · acme.spectra" value="okta · 2FA enforced" tone="violet" />
        <Row label="Recovery key" value="•••• •••• •••• 7Q9X" tone="amber" />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Icon name="fingerprint" className="h-3.5 w-3.5" /> Add passkey
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="refresh" className="h-3.5 w-3.5" /> Rotate recovery key
        </Button>
        <Button variant="ghost" size="sm" className="text-coral">
          <Icon name="alert" className="h-3.5 w-3.5" /> Sign out everywhere
        </Button>
      </div>
    </SectionPanel>
  );
}

function Row({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "cyan" | "violet" | "aurora" | "amber";
}) {
  const cls =
    tone === "cyan"
      ? "text-cyan-spec"
      : tone === "violet"
        ? "text-violet-spec"
        : tone === "aurora"
          ? "text-aurora"
          : tone === "amber"
            ? "text-amber-spec"
            : "text-ink";
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
      <span className="text-sm text-ink-mute">{label}</span>
      <span className={`font-mono text-sm ${cls}`}>{value}</span>
    </div>
  );
}

function Toggle({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <label className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:bg-white/[0.05]">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-ink-mute">{desc}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 flex-none rounded-full border transition-all ${
          on
            ? "border-cyan-spec/50 bg-cyan-spec/25 shadow-[0_0_18px_rgba(88,227,255,0.35)]"
            : "border-white/10 bg-white/[0.04]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
