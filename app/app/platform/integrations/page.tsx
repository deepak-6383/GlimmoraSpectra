"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  installIntegration,
  listIntegrationCatalog,
  listIntegrations,
  listOrgs,
  uninstallIntegration,
  type Integration,
} from "@/lib/platform";

export default function IntegrationsPage() {
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [activeOrg, setActiveOrg] = useState<string>("");
  const [kinds, setKinds] = useState<string[]>([]);
  const [installed, setInstalled] = useState<Integration[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [{ orgs }, { kinds }] = await Promise.all([
        listOrgs(),
        listIntegrationCatalog(),
      ]);
      setOrgs(orgs.map((o) => ({ id: o.id, name: o.name })));
      setKinds(kinds);
      if (!activeOrg && orgs.length > 0) setActiveOrg(orgs[0].id);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [activeOrg]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!activeOrg) return;
    void (async () => {
      try {
        const r = await listIntegrations(activeOrg);
        setInstalled(r.integrations);
      } catch {
        /* tolerate */
      }
    })();
  }, [activeOrg, busy]);

  const handleInstall = async (kind: string) => {
    if (!activeOrg) return;
    setBusy(kind);
    try {
      await installIntegration(activeOrg, kind, {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleUninstall = async (id: string) => {
    if (!activeOrg) return;
    setBusy(id);
    try {
      await uninstallIntegration(activeOrg, id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Phase 6 · integrations"
        title={
          <>
            Plug Spectra into your <span className="gs-text-aurora">stack.</span>
          </>
        }
        description="Slack, Teams, Google Workspace, Outlook, CRMs and more. Install per org; surfaces as proactive context for the cognitive graph."
        actions={
          <select
            value={activeOrg}
            onChange={(e) => setActiveOrg(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink"
          >
            <option value="">Pick an org…</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-8 p-5">
          <Badge tone="cyan">Catalog</Badge>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => void handleInstall(k)}
                disabled={busy === k || !activeOrg}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-colors hover:border-cyan-spec/40 disabled:opacity-50"
              >
                <div className="font-mono text-xs uppercase tracking-widest text-ink">
                  {k.replace(/_/g, " ")}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-ink-mute">
                  {busy === k ? "installing…" : "click to install"}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-4 p-5">
          <Badge tone="violet">Installed</Badge>
          <div className="mt-3 space-y-2">
            {installed.length === 0 && (
              <div className="text-xs text-ink-mute">No integrations installed.</div>
            )}
            {installed.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3"
              >
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-ink">
                    {i.kind}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                    {i.status}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleUninstall(i.id)}
                  disabled={busy === i.id}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
