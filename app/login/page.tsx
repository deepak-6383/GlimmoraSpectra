"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Divider, SocialButton } from "@/components/auth/field";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { getDevToken, login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Enter your email and cognitive key to continue.",
        tone: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast({
        title: "Welcome back to Spectra",
        description: "Aurora has been waiting.",
        tone: "success",
      });
      router.push("/app/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "auth failed";
      toast({
        title: "Sign-in failed",
        description: message,
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function tryDevToken() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await getDevToken({ force: true });
      toast({
        title: "Dev session granted",
        description: "Booting straight into the cognitive layer.",
        tone: "success",
      });
      router.push("/app/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Dev token unavailable",
        description: err instanceof Error ? err.message : String(err),
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Authentication"
      title={
        <>
          Welcome back to <span className="gs-text-aurora">Spectra.</span>
        </>
      }
      subtitle="Re-enter the cognitive layer. Aurora has been waiting."
      swap={{ label: "New here?", href: "/signup", cta: "Request access" }}
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          label="Identity"
          icon="mail"
          placeholder="you@futurework.io"
          type="email"
          autoComplete="email"
          name="email"
        />
        <Field
          label="Cognitive key"
          icon="lock"
          placeholder="••••••••••••"
          type="password"
          autoComplete="current-password"
          name="password"
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-ink-mute">
            <input
              type="checkbox"
              defaultChecked
              name="remember"
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.05] accent-cyan-spec"
            />
            Trust this device for 30 days
          </label>
          <Link
            href="/signup"
            className="text-cyan-spec/90 hover:text-cyan-spec underline-offset-4 hover:underline"
          >
            Lost your key?
          </Link>
        </div>

        <Button
          type="submit"
          variant="spectral"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Resuming…" : "Resume cognition"}
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
          <SocialButton
            label="Spectra Lens"
            icon={<Icon name="glasses" className="h-4 w-4 text-aurora" />}
          />
        </div>

        <button
          type="button"
          onClick={tryDevToken}
          disabled={submitting}
          className="w-full pt-2 text-center text-[11px] uppercase tracking-[0.25em] text-ink-faint underline-offset-4 hover:text-ink-soft hover:underline disabled:opacity-60"
        >
          Skip sign-in · enter as dev guest
        </button>
      </form>
    </AuthShell>
  );
}
