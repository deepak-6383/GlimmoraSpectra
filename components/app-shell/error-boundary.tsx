"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Last-line-of-defence boundary for client-side errors inside the app
 * shell. Catches render-phase crashes (e.g. a third-party module throws
 * during a route transition) and renders a calm cinematic recovery UI
 * instead of the white-screen-of-death.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    if (typeof window !== "undefined") {
      // surface to console for the live demo + future analytics endpoint
      // eslint-disable-next-line no-console
      console.error("[Spectra] app-shell crash:", error, info);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5 py-10">
        <div className="gs-panel max-w-xl p-6 sm:p-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-coral">
            cognitive interrupt
          </div>
          <h2 className="mt-3 font-display text-2xl text-ink">
            Aurora hit an unexpected branch.
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            The cognitive layer paused this surface to keep the rest of the
            platform stable. A fresh load usually resolves it.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 font-mono text-[11px] text-ink-mute">
            {this.state.error.message}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-ink hover:bg-white/[0.10]"
            >
              Try this surface again
            </button>
            <Link
              href="/app/dashboard"
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-ink hover:bg-white/[0.10]"
            >
              Return to Cognitive Hub
            </Link>
            <Link
              href="/app/system"
              className="rounded-full border border-cyan-spec/40 bg-cyan-spec/10 px-4 py-2 text-sm text-cyan-spec hover:bg-cyan-spec/15"
            >
              System status
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
