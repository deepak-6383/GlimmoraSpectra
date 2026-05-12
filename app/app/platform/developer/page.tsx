"use client";

import { PageHeader } from "@/components/app-shell/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function DeveloperPortalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Phase 6 · developer portal"
        title={
          <>
            Build on Spectra, <span className="gs-text-aurora">your way.</span>
          </>
        }
        description="Two official SDKs, a signed-plugin pipeline, OpenAPI for every service. Ship enterprise extensions in hours, not weeks."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <Badge tone="cyan">Python SDK</Badge>
          <h3 className="mt-3 font-display text-lg">glimmora-spectra</h3>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-ink-soft">
{`pip install glimmora-spectra

from glimmora_spectra import SpectraClient

async with SpectraClient(
    base_url="https://api.glimmora.example.com",
    api_key="sk_live_...",
) as client:
    async for ev in client.agents.interact(prompt="status?"):
        print(ev)`}
          </pre>
        </Panel>

        <Panel className="p-5">
          <Badge tone="violet">TypeScript SDK</Badge>
          <h3 className="mt-3 font-display text-lg">@glimmora/spectra</h3>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-ink-soft">
{`npm install @glimmora/spectra

import { SpectraClient } from "@glimmora/spectra";

const client = new SpectraClient({
  baseUrl: "https://api.glimmora.example.com",
  apiKey: "sk_live_...",
});

const state = await client.agi.state();`}
          </pre>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <Badge tone="aurora">Plugin authoring</Badge>
          <p className="mt-3 text-sm text-ink-soft">
            Implement the <code className="font-mono">Plugin</code> Protocol, declare
            your capabilities in a <code className="font-mono">PluginManifest</code>,
            sign with your publisher key, then publish to the marketplace.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-ink-soft">
{`from glimmora_core.platform import (
    PluginManifest, PluginCapability, sign_manifest
)

manifest = PluginManifest(
    name="standup-helper",
    version="1.0.0",
    publisher="acme",
    description="Daily standup summariser",
    capabilities=(
        PluginCapability.CALL_AGENT,
        PluginCapability.SEND_NOTIFICATION,
        PluginCapability.SUBSCRIBE_EVENTS,
    ),
    tags=("daily", "standup"),
)

sig = sign_manifest(manifest, private_key_b64=PUB_KEY, key_id="acme")
# POST signed bundle to /v1/marketplace/plugins`}
          </pre>
        </Panel>

        <Panel className="p-5">
          <Badge tone="cyan">OpenAPI</Badge>
          <p className="mt-3 text-sm text-ink-soft">
            Every service publishes <code className="font-mono">/openapi.json</code>{" "}
            in non-prod. Aggregate them into a single explorer or feed them to
            client-generation tools.
          </p>
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block"
          >
            <Button variant="outline" size="sm">
              <Icon name="link" className="h-4 w-4" /> Open the schema
            </Button>
          </a>
        </Panel>

        <Panel className="p-5">
          <Badge tone="violet">API keys</Badge>
          <p className="mt-3 text-sm text-ink-soft">
            Issue per-workspace API keys with scoped permissions. Each key is
            tracked through the audit logger and rate-limited at the gateway.
          </p>
          <Button variant="primary" size="sm" className="mt-3">
            <Icon name="plus" className="h-4 w-4" /> Generate new key
          </Button>
        </Panel>
      </div>
    </>
  );
}
