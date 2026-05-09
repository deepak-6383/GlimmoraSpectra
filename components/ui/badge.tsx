import { cn } from "@/lib/cn";

type Tone = "cyan" | "violet" | "aurora" | "amber" | "coral" | "neutral";

const tones: Record<Tone, string> = {
  cyan: "text-cyan-spec border-cyan-spec/30 bg-cyan-spec/10",
  violet: "text-violet-spec border-violet-spec/30 bg-violet-spec/10",
  aurora: "text-aurora border-aurora/30 bg-aurora/10",
  amber: "text-amber-spec border-amber-spec/30 bg-amber-spec/10",
  coral: "text-coral border-coral/30 bg-coral/10",
  neutral: "text-ink-soft border-white/10 bg-white/[0.04]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  pulse,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {pulse && (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-current opacity-70 gs-pulse" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
