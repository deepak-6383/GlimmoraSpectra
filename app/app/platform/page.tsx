"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  createOrg,
  getAnalytics,
  listOrgs,
  type Analytics,
  type Organization,
} from "@/lib/platform";

export default function PlatformOverviewPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, Analytics>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { orgs } = await listOrgs();
      setOrgs(orgs);
      const next: Record<string, Analytics> = {};
      for (const o of orgs.slice(0, 6)) {
        try {
          next[o.id] = await getAnalytics(o.id);
        } catch {
          /* tolerate */
        }
      }
      setAnalytics(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async () => {
    if (!newSlug.trim() || !newName.trim()) return;
    setBusy("create");
    try {
      await createOrg({ slug: newSlug.trim(), name: newName.trim() });
      setNewSlug("");
      setNewName("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const totalOrgs = orgs.length;
  const totalSeats = useMemo(
    () =>
      Object.values(analytics).reduce(
        (acc, a) => acc + (a.billing?.subscription?.seats ?? 0),
        0,
      ),
    [analytics],
  );
  const totalPlugins = useMemo(
    () => Object.values(analytics).reduce((acc, a) => acc + a.plugins.total, 0),
    [analytics],
  );
  const totalIntegrations = useMemo(
    () =>
      Object.values(analytics).reduce((acc, a) => acc + a.integrations.total, 0),
    [analytics],
  );

  return (
    <>
      <PageHeader
        eyebrow="Phase 6 · enterprise platform"
        title={
          <>
            One control plane, <span className="gs-text-aurora">every org.</span>
          </>
        }
        description="Multi-tenant cognition, plugin marketplace, billing, integrations and analytics — at platform scale."
        actions={
          <div className="flex gap-2">
            <Link href="/app/platform/marketplace">
              <Button variant="outline" size="sm">
                <Icon name="sparkles" className="h-4 w-4" /> Marketplace
              </Button>
            </Link>
            <Link href="/app/platform/billing">
              <Button variant="outline" size="sm">
                <Icon name="chart" className="h-4 w-4" /> Billing
              </Button>
            </Link>
            <Link href="/app/platform/integrations">
              <Button variant="outline" size="sm">
                <Icon name="network" className="h-4 w-4" /> Integrations
              </Button>
            </Link>
            <Link href="/app/platform/developer">
              <Button variant="primary" size="sm">
                <Icon name="agent" className="h-4 w-4" /> Developer portal
              </Button>
            </Link>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Organizations" value={String(totalOrgs)} />
        <Stat label="Seats in use" value={String(totalSeats)} />
        <Stat label="Plugins installed" value={String(totalPlugins)} />
        <Stat label="Integrations live" value={String(totalIntegrations)} />
      </div>

      <Panel className="mb-5 p-5">
        <Badge tone="cyan">New organization</Badge>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="slug (lowercase, e.g. 'acme')"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-cyan-spec/60"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Display name (e.g. 'Acme Robotics')"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-cyan-spec/60"
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleCreate()}
            disabled={busy === "create" || !newSlug.trim() || !newName.trim()}
          >
            <Icon name="plus" className="h-4 w-4" /> Create
          </Button>
        </div>
      </Panel>

      <div className="space-y-4">
        {orgs.length === 0 && (
          <Panel className="p-6 text-center text-sm text-ink-mute">
            No organizations yet — create your first one above.
          </Panel>
        )}
        {orgs.map((o) => (
          <OrgCard key={o.id} org={o} analytics={analytics[o.id]} />
        ))}
      </div>
    </>
  );
}

// =============================================================
//  Pieces
// =============================================================

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Panel className="p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </Panel>
  );
}

function OrgCard({ org, analytics }: { org: Organization; analytics?: Analytics }) {
  const sub = analytics?.billing?.subscription;
  const planTone =
    sub?.plan_tier === "enterprise"
      ? "violet"
      : sub?.plan_tier === "business"
        ? "aurora"
        : sub?.plan_tier === "growth"
          ? "cyan"
          : "amber";
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="cyan">{org.slug}</Badge>
            <h3 className="font-display text-lg">{org.name}</h3>
            {sub && (
              <Badge tone={planTone as "violet" | "aurora" | "cyan" | "amber"}>
                {sub.plan_tier}
              </Badge>
            )}
          </div>
          <div className="mt-1 text-xs text-ink-mute">
            {org.workspaces.length} workspace · {org.members.length} member
            {org.members.length === 1 ? "" : "s"} · ns{" "}
            <span className="font-mono">{org.memory_namespace}</span>
          </div>
        </div>
        <Link href={`/app/platform/orgs/${org.slug}`}>
          <Button variant="ghost" size="sm">
            Open <Icon name="arrow" className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {analytics && (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Mini label="Plugins" value={String(analytics.plugins.total)} />
          <Mini
            label="Integrations"
            value={String(analytics.integrations.total)}
          />
          <Mini
            label="Seats"
            value={String(sub?.seats ?? 0)}
          />
          <Mini
            label="Quota records"
            value={String(analytics.quota.records.length)}
          />
        </div>
      )}
    </Panel>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className="mt-1 font-display text-lg">{value}</div>
    </div>
  );
}
