"use client";

/**
 * Phase 6 platform client — orgs, marketplace, plugins, billing,
 * integrations, analytics.
 */

import { authedFetch } from "./api";

// =============================================================
//  Types
// =============================================================

export type OrgRole = "owner" | "admin" | "billing" | "developer" | "member" | "guest";
export type PlanTier = "starter" | "growth" | "business" | "enterprise";

export type Workspace = {
  id: string;
  name: string;
  kind: "production" | "staging" | "dev" | "sandbox";
  archived: boolean;
  memory_namespace: string;
  tags: string[];
  created_at: number;
};

export type Member = {
  user_id: string;
  role: OrgRole;
  workspaces: string[];
  suspended: boolean;
  accepted_at: number | null;
};

export type Organization = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "trial" | "suspended" | "archived";
  plan_tier: string;
  domain: string | null;
  owner_user_id: string;
  created_at: number;
  memory_namespace: string;
  workspaces: Workspace[];
  members: Member[];
};

export type PluginCapability = string;

export type MarketplaceEntry = {
  id: string;
  manifest: {
    slug: string;
    name: string;
    version: string;
    publisher: string;
    description: string;
    capabilities: PluginCapability[];
    tags: string[];
    license: string;
  };
  download_url: string;
  icon_url: string | null;
  screenshots: string[];
  rating: number;
  ratings_count: number;
  downloads: number;
  featured: boolean;
  pricing: { model: string; monthly_usd?: number };
};

export type InstalledPlugin = {
  id: string;
  org_id: string;
  status: "installed" | "enabled" | "disabled" | "error" | "uninstalled";
  installed_at: number;
  enabled_at: number | null;
  last_error: string | null;
  manifest: MarketplaceEntry["manifest"] | null;
};

export type Plan = {
  tier: PlanTier;
  name: string;
  monthly_price_usd: number;
  included_seats: number;
  included_ai_calls: number;
  included_memory_mb: number;
  feature_flags: string[];
};

export type Subscription = {
  id: string;
  org_id: string;
  plan_tier: PlanTier;
  status: "trialing" | "active" | "past_due" | "cancelled" | "paused";
  seats: number;
  current_period_end: number;
};

export type Integration = {
  id: string;
  org_id: string;
  kind: string;
  status: "disconnected" | "connected" | "degraded" | "error";
  config_keys: string[];
  last_synced_at: number | null;
  error: string | null;
};

export type Analytics = {
  org: Organization;
  plugins: { total: number; by_status: Record<string, number> };
  integrations: { total: number; by_kind: Record<string, number> };
  quota: { quotas: Array<Record<string, unknown>>; records: Array<Record<string, unknown>> };
  billing: { subscription: Subscription | null; recent_events: Array<Record<string, unknown>> };
  generated_at: number;
};

// =============================================================
//  REST helpers
// =============================================================

async function _get<T>(path: string): Promise<T> {
  const r = await authedFetch(path);
  if (!r.ok) throw new Error(`platform ${r.status}: ${path}`);
  return r.json();
}

async function _send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await authedFetch(path, {
    method,
    headers: body !== undefined ? { "content-type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`platform ${r.status}: ${path}`);
  if (r.status === 204) return undefined as T;
  return r.json();
}

// ----- orgs -----
export async function listOrgs(): Promise<{ orgs: Organization[] }> {
  return _get("/v1/orgs");
}
export async function getOrg(idOrSlug: string): Promise<Organization> {
  return _get(`/v1/orgs/${idOrSlug}`);
}
export async function createOrg(body: { slug: string; name: string; domain?: string }): Promise<Organization> {
  return _send("POST", "/v1/orgs", body);
}
export async function inviteMember(orgId: string, body: { user_id: string; role?: OrgRole }) {
  return _send("POST", `/v1/orgs/${orgId}/members`, body);
}
export async function createWorkspace(orgId: string, body: { name: string; kind?: Workspace["kind"] }) {
  return _send("POST", `/v1/orgs/${orgId}/workspaces`, body);
}

// ----- marketplace -----
export async function listMarketplace(opts?: { tag?: string; publisher?: string }): Promise<{ entries: MarketplaceEntry[] }> {
  const q = new URLSearchParams();
  if (opts?.tag) q.set("tag", opts.tag);
  if (opts?.publisher) q.set("publisher", opts.publisher);
  const qs = q.toString();
  return _get(`/v1/marketplace/plugins${qs ? "?" + qs : ""}`);
}
export async function installPlugin(entryId: string, orgId: string) {
  return _send("POST", `/v1/marketplace/plugins/${entryId}/install?org_id=${orgId}`);
}
export async function ratePlugin(entryId: string, stars: number) {
  return _send("POST", `/v1/marketplace/plugins/${entryId}/rate`, { stars });
}

// ----- plugins -----
export async function listPlugins(orgId?: string): Promise<{ plugins: InstalledPlugin[] }> {
  return _get(`/v1/plugins${orgId ? `?org_id=${orgId}` : ""}`);
}
export async function enablePlugin(pluginId: string, orgId: string) {
  return _send("POST", `/v1/plugins/${pluginId}/enable?org_id=${orgId}`);
}
export async function disablePlugin(pluginId: string, orgId: string) {
  return _send("POST", `/v1/plugins/${pluginId}/disable?org_id=${orgId}`);
}
export async function uninstallPlugin(pluginId: string, orgId: string) {
  return _send("DELETE", `/v1/plugins/${pluginId}?org_id=${orgId}`);
}

// ----- billing -----
export async function listPlans(): Promise<{ plans: Plan[] }> {
  return _get("/v1/billing/plans");
}
export async function getBilling(orgId: string): Promise<{ subscription: Subscription | null; recent_events: unknown[] }> {
  return _get(`/v1/billing/orgs/${orgId}`);
}
export async function subscribe(orgId: string, plan_tier: PlanTier, seats: number = 5) {
  return _send("POST", `/v1/billing/orgs/${orgId}/subscribe`, { plan_tier, seats });
}
export async function changePlan(orgId: string, plan_tier: PlanTier) {
  return _send("POST", `/v1/billing/orgs/${orgId}/change-plan`, { plan_tier });
}
export async function getUsage(orgId: string): Promise<{ totals: Record<string, number> }> {
  return _get(`/v1/billing/orgs/${orgId}/usage`);
}

// ----- integrations -----
export async function listIntegrations(orgId: string): Promise<{ integrations: Integration[] }> {
  return _get(`/v1/integrations/orgs/${orgId}`);
}
export async function listIntegrationCatalog(): Promise<{ kinds: string[] }> {
  return _get("/v1/integrations/catalog");
}
export async function installIntegration(orgId: string, kind: string, config: Record<string, unknown> = {}) {
  return _send("POST", `/v1/integrations/orgs/${orgId}`, { kind, config });
}
export async function uninstallIntegration(orgId: string, id: string) {
  return _send("DELETE", `/v1/integrations/orgs/${orgId}/${id}`);
}

// ----- analytics -----
export async function getAnalytics(orgId: string): Promise<Analytics> {
  return _get(`/v1/analytics/orgs/${orgId}`);
}
