import { cn } from "@/lib/cn";

/**
 * Decorative HUD-style scan grid overlay used inside hero/vision panels.
 */
export function ScanGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 gs-grid-bg opacity-60" />
      <div
        className="gs-scan absolute left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(88,227,255,0.65) 50%, transparent 100%)",
          boxShadow: "0 0 16px rgba(88,227,255,0.65)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px gs-holo-line" />
      <div className="absolute inset-x-0 bottom-0 h-px gs-holo-line" />
    </div>
  );
}
