"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  installPlugin,
  listMarketplace,
  listOrgs,
  type MarketplaceEntry,
  type Organization,
} from "@/lib/platform";

export default function MarketplacePage() {
  const [entries, setEntries] = useState<MarketplaceEntry[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<string>("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installedNote, setInstalledNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [{ entries }, { orgs }] = await Promise.all([
        listMarketplace(),
        listOrgs(),
      ]);
      setEntries(entries);
      setOrgs(orgs);
      if (!activeOrg && orgs.length > 0) setActiveOrg(orgs[0].id);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [activeOrg]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleInstall = async (entryId: string) => {
    if (!activeOrg) return;
    setBusy(entryId);
    try {
      await installPlugin(entryId, activeOrg);
      setInstalledNote(`Installed into ${orgs.find((o) => o.id === activeOrg)?.slug}`);
      setTimeout(() => setInstalledNote(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Phase 6 · marketplace"
        title={
          <>
            Spectra Marketplace, <span className="gs-text-aurora">extended.</span>
          </>
        }
        description="Verified, signed plugins from publishers. Install into any organization you administer."
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
      {installedNote && (
        <div className="mb-5 rounded-2xl border border-aurora/40 bg-aurora/10 p-4 text-sm text-aurora">
          {installedNote}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.length === 0 && (
          <Panel className="md:col-span-2 xl:col-span-3 p-6 text-center text-sm text-ink-mute">
            Marketplace is empty.
          </Panel>
        )}
        {entries.map((e) => (
          <MarketplaceCard
            key={e.id}
            entry={e}
            busy={busy === e.id}
            canInstall={!!activeOrg}
            onInstall={() => void handleInstall(e.id)}
          />
        ))}
      </div>
    </>
  );
}

function MarketplaceCard({
  entry,
  busy,
  canInstall,
  onInstall,
}: {
  entry: MarketplaceEntry;
  busy: boolean;
  canInstall: boolean;
  onInstall: () => void;
}) {
  const m = entry.manifest;
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {entry.featured && <Badge tone="violet">featured</Badge>}
            <Badge tone="cyan">v{m.version}</Badge>
          </div>
          <h3 className="mt-2 font-display text-lg">{m.name}</h3>
          <div className="text-[11px] text-ink-mute">{m.publisher}</div>
        </div>
        <div className="text-right text-xs text-ink-mute">
          <div>★ {entry.rating.toFixed(1)} ({entry.ratings_count})</div>
          <div>{entry.downloads.toLocaleString()} dl</div>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-soft line-clamp-3">{m.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {m.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-soft"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {m.capabilities.map((c) => (
          <span
            key={c}
            className="rounded-full border border-aurora/30 bg-aurora/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-aurora"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-ink-mute">
        <span>
          {entry.pricing?.model === "free"
            ? "Free"
            : entry.pricing?.monthly_usd
              ? `$${entry.pricing.monthly_usd}/mo`
              : "Custom"}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={onInstall}
          disabled={busy || !canInstall}
        >
          {busy ? "Installing…" : "Install"}
        </Button>
      </div>
    </Panel>
  );
}
