/**
 * Tailwind v4 only emits classes that appear as literal strings in source.
 * Several components compose class names dynamically (`bg-${tone}-spec`).
 * Listing each literal here forces Tailwind to emit them.
 *
 * This component is intentionally never rendered.
 */
export function _Safelist() {
  return (
    <div className="hidden">
      <div className="text-cyan-spec text-violet-spec text-fuchsia-spec text-aurora text-amber-spec text-coral text-electric" />
      <div className="bg-cyan-spec bg-violet-spec bg-fuchsia-spec bg-aurora bg-amber-spec bg-coral bg-electric" />
      <div className="border-cyan-spec border-violet-spec border-fuchsia-spec border-aurora border-amber-spec border-coral border-electric" />
      <div className="bg-cyan-spec/10 bg-violet-spec/10 bg-fuchsia-spec/10 bg-aurora/10 bg-amber-spec/10 bg-coral/10 bg-electric/10" />
      <div className="bg-cyan-spec/15 bg-violet-spec/15 bg-fuchsia-spec/15 bg-aurora/15 bg-amber-spec/15 bg-coral/15" />
      <div className="bg-cyan-spec/20 bg-violet-spec/20 bg-fuchsia-spec/20 bg-aurora/20 bg-amber-spec/20 bg-coral/20" />
      <div className="border-cyan-spec/30 border-violet-spec/30 border-fuchsia-spec/30 border-aurora/30 border-amber-spec/30 border-coral/30" />
      <div className="border-cyan-spec/50 border-violet-spec/50 border-fuchsia-spec/50 border-aurora/50 border-amber-spec/50 border-coral/50" />
      <div className="border-cyan-spec/60 border-violet-spec/60 border-fuchsia-spec/60 border-aurora/60 border-amber-spec/60 border-coral/60" />
      <div className="border-cyan-spec/70 border-violet-spec/70 border-fuchsia-spec/70 border-aurora/70 border-amber-spec/70 border-coral/70" />
      <div className="ring-cyan-spec/40 ring-violet-spec/40 ring-aurora/40 ring-amber-spec/40 ring-coral/40 ring-cyan-spec/25" />
      <div className="from-cyan-spec/40 from-violet-spec/40 from-aurora/40 from-amber-spec/40 from-coral/40" />
      <div className="to-cyan-spec/40 to-violet-spec/40 to-aurora/40 to-amber-spec/40 to-coral/40 to-electric/40 to-fuchsia-spec/40" />
      <div className="from-violet-spec/15 to-cyan-spec/10 from-aurora/15 from-cyan-spec/12" />
      <div className="text-ink text-ink-soft text-ink-mute text-ink-faint" />
      <div className="bg-ink bg-ink-soft bg-ink-mute" />
      <div className="bg-deep bg-void bg-abyss bg-graphite" />
    </div>
  );
}
