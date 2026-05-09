import Link from "next/link";
import { LogoMark } from "./nav";

export function MarketingFooter() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/[0.06]">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(140,92,255,0.45), rgba(88,227,255,0.25), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="font-display text-base">
                Glimmora <span className="text-ink-mute">Spectra</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-mute">
              An AGI-native operating system for the human eye. Vision intelligence,
              memory augmentation, and autonomous agents — woven through the fabric
              of everyday perception.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-ink-faint">
              Glimmora International © {new Date().getFullYear()}
            </p>
          </div>
          <FooterCol
            title="Platform"
            links={[
              { label: "Cognitive Hub", href: "/app/dashboard" },
              { label: "Vision Intelligence", href: "/app/vision" },
              { label: "Memory Engine", href: "/app/memory" },
              { label: "Agentic Workspace", href: "/app/agents" },
            ]}
          />
          <FooterCol
            title="Enterprise"
            links={[
              { label: "Analytics", href: "/app/analytics" },
              { label: "Devices", href: "/app/devices" },
              { label: "Compliance", href: "/app/settings" },
              { label: "Console", href: "/app/console" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { label: "Sign in", href: "/login" },
              { label: "Get access", href: "/signup" },
              { label: "Status", href: "#" },
              { label: "Press kit", href: "#" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-faint">
            Designed in starlight. Engineered for the next century.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            v1.0.0 · spectra-core / aurora-cognition
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-mute">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
