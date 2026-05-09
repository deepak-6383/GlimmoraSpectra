"use client";

import { cn } from "@/lib/cn";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Variant = "primary" | "ghost" | "outline" | "spectral" | "subtle";
type Size = "sm" | "md" | "lg";

type Props = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: Variant;
  size?: Size;
};

const sizeMap: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-5 text-[15px] rounded-full",
  lg: "h-14 px-7 text-base rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", children, ...rest },
  ref,
) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-medium tracking-tight select-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-spec/60";

  const variants: Record<Variant, string> = {
    primary:
      "bg-white text-black hover:bg-white/90 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.45)]",
    spectral:
      "text-white border border-white/15 bg-[linear-gradient(135deg,#58e3ff_0%,#8c5cff_60%,#c965ff_100%)] hover:brightness-110 shadow-[0_18px_60px_-15px_rgba(140,92,255,0.55)]",
    ghost:
      "text-ink-soft hover:text-ink hover:bg-white/5 border border-transparent",
    outline:
      "text-ink border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25 backdrop-blur-md",
    subtle:
      "text-ink-soft bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07]",
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(base, sizeMap[size], variants[variant], className)}
      {...rest}
    >
      {variant === "spectral" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-50 blur-xl"
          style={{
            background:
              "linear-gradient(135deg,#58e3ff,#8c5cff,#c965ff)",
            zIndex: -1,
          }}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children as React.ReactNode}</span>
    </motion.button>
  );
});
