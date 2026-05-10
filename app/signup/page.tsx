"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Divider, SocialButton } from "@/components/auth/field";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { signup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const tenantId = String(form.get("tenant_id") || "acme").trim() || "acme";
    const consent = form.get("consent");

    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Email and a cognitive key are required.",
        tone: "warning",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Cognitive key too short",
        description: "Use at least 8 characters.",
        tone: "warning",
      });
      return;
    }
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please accept the Cognitive Trust Charter.",
        tone: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      await signup({ email, password, tenantId });
      toast({
        title: "Welcome to the augmented century",
        description: "Aurora is now bound to your eyes.",
        tone: "success",
      });
      router.push("/app/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "signup failed";
      toast({
        title: "Sign-up failed",
        description: message,
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Spring cohort 2026"
      title={
        <>
          Step <span className="gs-text-gradient">into the augmented century.</span>
        </>
      }
      subtitle="Apply for early access. White-glove onboarding, paired developer kit and on-site calibration."
      swap={{ label: "Returning?", href: "/login", cta: "Sign in" }}
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" icon="user" placeholder="Mira Holloway" autoComplete="name" name="full_name" />
          <Field label="Workspace" icon="globe" placeholder="acme.spectra" name="tenant_id" defaultValue="acme" />
        </div>
        <Field
          label="Identity"
          icon="mail"
          placeholder="you@futurework.io"
          type="email"
          autoComplete="email"
          name="email"
          required
        />
        <Field
          label="Create cognitive key"
          icon="lock"
          placeholder="A passphrase or 8+ characters"
          type="password"
          name="password"
          required
          hint="Stored in a per-device hardware enclave. Never transmitted in plain text."
        />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink-mute">
            Pair your hardware
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {[
              { l: "Spectra Lens · v3", k: "lens" },
              { l: "Spectra Studio", k: "studio" },
              { l: "Decide later", k: "later" },
            ].map((o, i) => (
              <label
                key={o.k}
                className="flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-center transition hover:bg-white/[0.05] has-[:checked]:border-cyan-spec/60 has-[:checked]:bg-cyan-spec/10 has-[:checked]:text-cyan-spec"
              >
                <input
                  type="radio"
                  name="device"
                  value={o.k}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                {o.l}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-ink-mute">
          <input
            type="checkbox"
            defaultChecked
            name="consent"
            className="mt-0.5 h-3.5 w-3.5 accent-cyan-spec"
          />
          <span>
            I agree to Glimmora&apos;s{" "}
            <a className="text-ink underline underline-offset-4">Cognitive Trust Charter</a>{" "}
            and consent to private on-device intelligence.
          </span>
        </label>

        <Button
          type="submit"
          variant="spectral"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Requesting…" : "Request access"}
          <Icon name={submitting ? "loader" : "arrow"} className={`h-4 w-4 ${submitting ? "animate-spin" : ""}`} />
        </Button>

        <Divider>or continue with</Divider>

        <div className="flex gap-3">
          <SocialButton
            label="Passkey"
            icon={<Icon name="fingerprint" className="h-4 w-4 text-cyan-spec" />}
          />
          <SocialButton
            label="SSO"
            icon={<Icon name="shieldCheck" className="h-4 w-4 text-violet-spec" />}
          />
        </div>

        <p className="pt-4 text-center text-[11px] uppercase tracking-[0.25em] text-ink-faint">
          Applications reviewed within 24h
        </p>
      </form>
    </AuthShell>
  );
}
