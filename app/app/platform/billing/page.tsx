"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  changePlan,
  getBilling,
  getUsage,
  listOrgs,
  listPlans,
  type Plan,
  type PlanTier,
  type Subscription,
} from "@/lib/platform";

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [activeOrg, setActiveOrg] = useState<string>("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [{ plans }, { orgs }] = await Promise.all([listPlans(), listOrgs()]);
      setPlans(plans);
      setOrgs(orgs.map((o) => ({ id: o.id, name: o.name, slug: o.slug })));
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
        const [b, u] = await Promise.all([getBilling(activeOrg), getUsage(activeOrg)]);
        setSubscription(b.subscription);
        setUsage(u.totals);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [activeOrg]);

  const handleChangePlan = async (tier: PlanTier) => {
    if (!activeOrg) return;
    setBusy(tier);
    try {
      await changePlan(activeOrg, tier);
      const b = await getBilling(activeOrg);
      setSubscription(b.subscription);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Phase 6 · billing"
        title={
          <>
            Plans, seats, and <span className="gs-text-aurora">usage.</span>
          </>
        }
        description="Per-org subscriptions, included caps, and metered AI consumption. Pick a plan that scales with the org."
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
        <div className="lg:col-span-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <PlanCard
              key={p.tier}
              plan={p}
              active={subscription?.plan_tier === p.tier}
              busy={busy === p.tier}
              onSelect={() => void handleChangePlan(p.tier)}
              disabled={!activeOrg}
            />
          ))}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Panel className="p-5">
            <Badge tone="cyan">Current subscription</Badge>
            {subscription ? (
              <>
                <div className="mt-3 font-display text-2xl uppercase">
                  {subscription.plan_tier}
                </div>
                <div className="text-xs text-ink-mute">
                  Status: {subscription.status} · {subscription.seats} seats
                </div>
                <div className="mt-3 text-xs">
                  Period ends{" "}
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="mt-3 text-xs text-ink-mute">No subscription yet.</div>
            )}
          </Panel>

          <Panel className="p-5">
            <Badge tone="violet">Usage this period</Badge>
            <div className="mt-3 space-y-2">
              {Object.keys(usage).length === 0 && (
                <div className="text-xs text-ink-mute">No usage recorded yet.</div>
              )}
              {Object.entries(usage).map(([metric, value]) => (
                <div key={metric} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{metric}</span>
                  <span className="text-ink-soft">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function PlanCard({
  plan,
  active,
  busy,
  onSelect,
  disabled,
}: {
  plan: Plan;
  active: boolean;
  busy: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <Panel
      className={`flex flex-col p-5 ${active ? "ring-2 ring-cyan-spec/60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <Badge tone={active ? "cyan" : "neutral"}>{plan.tier}</Badge>
        {active && <span className="text-[10px] uppercase tracking-widest text-cyan-spec">current</span>}
      </div>
      <h3 className="mt-3 font-display text-lg">{plan.name}</h3>
      <div className="mt-1 text-2xl font-display">
        {plan.monthly_price_usd === 0 ? (
          plan.tier === "enterprise" ? "Custom" : "Free"
        ) : (
          <>
            ${plan.monthly_price_usd}
            <span className="text-xs text-ink-mute">/mo</span>
          </>
        )}
      </div>

      <ul className="mt-3 space-y-1.5 text-xs text-ink-soft">
        <li>{plan.included_seats.toLocaleString()} seats</li>
        <li>{plan.included_ai_calls.toLocaleString()} AI calls / mo</li>
        <li>{(plan.included_memory_mb / 1024).toFixed(1)} GB memory</li>
        {plan.feature_flags.slice(0, 4).map((f) => (
          <li key={f}>· {f}</li>
        ))}
      </ul>

      <Button
        variant={active ? "ghost" : "primary"}
        size="sm"
        onClick={onSelect}
        disabled={busy || disabled || active}
        className="mt-auto"
      >
        {active ? "Current" : busy ? "Switching…" : "Switch plan"}
      </Button>
    </Panel>
  );
}
