"use client";

import { GATEWAY, TENANT_ID, DEFAULT_USER } from "./config";

/**
 * Tiny REST client for the Phase 1 demo. Caches a dev-token in sessionStorage.
 */

const TOKEN_KEY = "spectra.token";

export async function getDevToken(opts?: {
  subject?: string;
  tenantId?: string;
  force?: boolean;
}): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("getDevToken is browser-only");
  }
  if (!opts?.force) {
    const cached = sessionStorage.getItem(TOKEN_KEY);
    if (cached) return cached;
  }
  const resp = await fetch(`${GATEWAY}/v1/auth/dev-token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subject: opts?.subject ?? DEFAULT_USER,
      tenant_id: opts?.tenantId ?? TENANT_ID,
      roles: ["member"],
    }),
  });
  if (!resp.ok) {
    throw new Error(`dev-token failed: ${resp.status}`);
  }
  const json = (await resp.json()) as { access_token: string };
  sessionStorage.setItem(TOKEN_KEY, json.access_token);
  return json.access_token;
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export type TokenBundle = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

/** POST /v1/auth/login — returns the token bundle and persists the access token. */
export async function login(email: string, password: string): Promise<TokenBundle> {
  const resp = await fetch(`${GATEWAY}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) {
    throw new Error(await safeError(resp));
  }
  const json = (await resp.json()) as TokenBundle;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, json.access_token);
  }
  return json;
}

/** POST /v1/auth/signup — creates the account and persists the token. */
export async function signup(opts: {
  email: string;
  password: string;
  tenantId?: string;
}): Promise<TokenBundle> {
  const resp = await fetch(`${GATEWAY}/v1/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: opts.email,
      password: opts.password,
      tenant_id: opts.tenantId ?? "acme",
    }),
  });
  if (!resp.ok) {
    throw new Error(await safeError(resp));
  }
  const json = (await resp.json()) as TokenBundle;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, json.access_token);
  }
  return json;
}

async function safeError(resp: Response): Promise<string> {
  try {
    const body = await resp.json();
    return body?.error?.message || body?.detail || `${resp.status} ${resp.statusText}`;
  } catch {
    return `${resp.status} ${resp.statusText}`;
  }
}

export async function authedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getDevToken();
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  headers.set("accept", headers.get("accept") ?? "application/json");
  return fetch(`${GATEWAY}${path}`, { ...init, headers });
}

export type VisionFramePayload = {
  frame_id: string | null;
  device_id: string | null;
  detections: { label: string; confidence: number; bbox: number[] }[];
  text: { text: string; confidence: number; bbox: number[] }[];
  faces: { bbox: number[] }[];
  scene_caption: string | null;
  metrics: Record<string, number>;
};

export type InteractEvent =
  | { kind: "vision"; ts: number; payload: VisionFramePayload }
  | {
      kind: "memory";
      ts: number;
      payload: { query: string; hits: { score: number; payload: any }[]; composed: string };
    }
  | { kind: "context"; ts: number; payload: { text: string } }
  | {
      kind: "agent";
      ts: number;
      payload: {
        step: number;
        agent: string;
        kind: "plan" | "delegate" | "tool" | "reply" | "error";
        payload: Record<string, any>;
      };
    }
  | { kind: "done"; ts: number; payload: { duration_ms: number } };

/**
 * Stream the unified Phase 1 interaction pipeline as NDJSON.
 */
export async function* interact(opts: {
  prompt: string;
  vision?: VisionFramePayload | null;
  consent?: string;
  signal?: AbortSignal;
}): AsyncGenerator<InteractEvent> {
  const resp = await authedFetch("/v1/agents/interact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      prompt: opts.prompt,
      consent: opts.consent ?? "private",
      vision: opts.vision ?? null,
    }),
    signal: opts.signal,
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`interact failed: ${resp.status}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as InteractEvent;
      } catch {
        // skip malformed lines; the stream remains valid overall
      }
    }
  }
  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer) as InteractEvent;
    } catch {
      /* noop */
    }
  }
}
