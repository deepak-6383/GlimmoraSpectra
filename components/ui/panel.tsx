import { cn } from "@/lib/cn";
import { forwardRef } from "react";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: "cyan" | "violet" | "none";
  density?: "soft" | "strong";
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, glow = "none", density = "soft", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "gs-panel gs-noise gs-shadow-soft",
        density === "strong" ? "gs-glass-strong" : "",
        glow === "cyan" && "gs-glow-cyan",
        glow === "violet" && "gs-glow-violet",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
