"use client";

/**
 * Phase 1 frontend configuration.
 *
 * The browser cannot resolve docker DNS (`api-gateway:8080`); the live demo
 * always talks to localhost (or whatever NEXT_PUBLIC_GATEWAY points at).
 */

export const GATEWAY =
  process.env.NEXT_PUBLIC_GATEWAY ?? "http://localhost:8080";

export const VISION_BASE =
  process.env.NEXT_PUBLIC_VISION ?? "http://localhost:8084";

export const STREAM_BASE =
  process.env.NEXT_PUBLIC_STREAM ?? "http://localhost:8088";

export function wsUrl(httpBase: string, path: string): string {
  const u = new URL(path, httpBase);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  return u.toString();
}

export const TENANT_ID = "acme";
export const DEFAULT_USER = "mira";
