import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Divider, SocialButton } from "@/components/auth/field";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

export const metadata = {
  title: "Sign in · Glimmora Spectra",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Authentication"
      title={<>Welcome back to <span className="gs-text-aurora">Spectra.</span></>}
      subtitle="Re-enter the cognitive layer. Aurora has been waiting."
      swap={{ label: "New here?", href: "/signup", cta: "Request access" }}
    >
      <form className="space-y-4">
        <Field
          label="Identity"
          icon="mail"
          placeholder="you@futurework.io"
          type="email"
          autoComplete="email"
        />
        <Field
          label="Cognitive key"
          icon="lock"
          placeholder="••••••••••••"
          type="password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-ink-mute">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.05] accent-cyan-spec"
            />
            Trust this device for 30 days
          </label>
          <Link
            href="#"
            className="text-cyan-spec/90 hover:text-cyan-spec underline-offset-4 hover:underline"
          >
            Lost your key?
          </Link>
        </div>

        <Button type="submit" variant="spectral" size="lg" className="w-full">
          Resume cognition
          <Icon name="arrow" className="h-4 w-4" />
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

        <p className="pt-4 text-center text-[11px] uppercase tracking-[0.25em] text-ink-faint">
          Protected by Aurora · zero-trust cognitive enclave
        </p>
      </form>
    </AuthShell>
  );
}
