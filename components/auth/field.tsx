"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: string;
  trailing?: React.ReactNode;
  defaultValue?: string;
  hint?: string;
  className?: string;
  autoComplete?: string;
  name?: string;
  required?: boolean;
};

export function Field({
  label,
  type = "text",
  placeholder,
  icon,
  trailing,
  defaultValue,
  hint,
  className,
  autoComplete,
  name,
  required,
}: Props) {
  const id = useId();
  const [focus, setFocus] = useState(false);
  const [reveal, setReveal] = useState(false);
  const inputType = type === "password" && reveal ? "text" : type;

  return (
    <label htmlFor={id} className={cn("block", className)}>
      <span className="mb-2 block text-[12px] uppercase tracking-[0.2em] text-ink-mute">
        {label}
      </span>
      <div
        className={cn(
          "relative flex h-12 items-center gap-2 rounded-xl border bg-white/[0.04] px-3 transition-all",
          focus
            ? "border-cyan-spec/60 ring-2 ring-cyan-spec/25 bg-white/[0.06]"
            : "border-white/10 hover:border-white/20",
        )}
      >
        {icon && (
          <Icon
            name={icon}
            className={cn(
              "h-4 w-4 transition-colors",
              focus ? "text-cyan-spec" : "text-ink-mute",
            )}
          />
        )}
        <input
          id={id}
          type={inputType}
          name={name}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="h-full w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint outline-none"
        />
        {type === "password" ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="rounded-lg px-2 py-1 text-[11px] uppercase tracking-widest text-ink-mute hover:text-ink"
          >
            {reveal ? "Hide" : "Show"}
          </button>
        ) : (
          trailing
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-ink-mute">{hint}</p>}
    </label>
  );
}

export function Divider({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 gs-divider" />
      {children && (
        <span className="text-[11px] uppercase tracking-[0.25em] text-ink-mute">
          {children}
        </span>
      )}
      <div className="h-px flex-1 gs-divider" />
    </div>
  );
}

export function SocialButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
