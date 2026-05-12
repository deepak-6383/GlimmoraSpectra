"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  createWorkspace,
  getAnalytics,
  getOrg,
  inviteMember,
  type Analytics,
  type Organization,
} from "@/lib/platform";

export default function OrgDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const [org, setOrg] = useState<Organization | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsName, setWsName] = useState("");
  const [inviteId, setInviteId] = useState("");

  const refresh = useCallback(async () => {
    if (!slug) return;
    try {
      const o = await getOrg(slug);
      setOrg(o);
      try {
        setAnalytics(await getAnalytics(o.id));
      } catch {
        /* analytics is optional */
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreateWs = async () => {
    if (!org || !wsName.trim()) return;
    setBusy("ws");
    try {
      await createWorkspace(org.id, { name: wsName.trim(), kind: "dev" });
      setWsName("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleInvite = async () => {
    if (!org || !inviteId.trim()) return;
    setBusy("invite");
    try {
      await inviteMember(org.id, { user_id: inviteId.trim(), role: "member" });
      setInviteId("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  if (!org) {
    return (
      <Panel className="p-6 text-center text-sm text-ink-mute">
        Loading organization…
      </Panel>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Phase 6 · org"
        title={
          <>
            {org.name}{" "}
            <span className="gs-text-aurora">/ {org.slug}</span>
          </>
        }
        description={`Namespace ${org.memory_namespace} · ${org.workspaces.length} workspaces · ${org.members.length} members`}
        actions={
          <Link href="/app/platform">
            <Button variant="ghost" size="sm">
              <Icon name="arrow" className="h-3 w-3" /> All orgs
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7 p-5">
          <Badge tone="cyan">Workspaces</Badge>
          <ul className="mt-3 space-y-2">
            {org.workspaces.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3"
              >
                <div>
                  <div className="font-display text-sm">{w.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-mute">
                    {w.kind} · ns {w.memory_namespace}
                  </div>
                </div>
                {w.archived && <Badge tone="amber">archived</Badge>}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              placeholder="New workspace name"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-cyan-spec/60"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleCreateWs()}
              disabled={busy === "ws" || !wsName.trim()}
            >
              <Icon name="plus" className="h-4 w-4" /> Add
            </Button>
          </div>
        </Panel>

        <Panel className="lg:col-span-5 p-5">
          <Badge tone="violet">Members</Badge>
          <ul className="mt-3 space-y-2 max-h-72 overflow-auto pr-1">
            {org.members.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-mono">{m.user_id}</span>
                <Badge tone="cyan">{m.role}</Badge>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="Invite user_id"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-cyan-spec/60"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleInvite()}
              disabled={busy === "invite" || !inviteId.trim()}
            >
              Invite
            </Button>
          </div>
        </Panel>

        {analytics && (
          <Panel className="lg:col-span-12 p-5">
            <Badge tone="aurora">Snapshot</Badge>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Mini label="Plugins" value={String(analytics.plugins.total)} />
              <Mini label="Integrations" value={String(analytics.integrations.total)} />
              <Mini
                label="Seats"
                value={String(analytics.billing.subscription?.seats ?? 0)}
              />
              <Mini
                label="Quota records"
                value={String(analytics.quota.records.length)}
              />
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-mute">{label}</div>
      <div className="mt-1 font-display text-lg">{value}</div>
    </div>
  );
}
