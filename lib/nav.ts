export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  group: "core" | "intelligence" | "operations" | "system";
};

export const NAV: NavItem[] = [
  { label: "Cognitive Hub", href: "/app/dashboard", icon: "sparkles", group: "core" },
  { label: "AI Console", href: "/app/console", icon: "wave", badge: "live", group: "core" },

  { label: "Vision Intelligence", href: "/app/vision", icon: "eye", group: "intelligence" },
  { label: "Memory Engine", href: "/app/memory", icon: "brain", group: "intelligence" },
  { label: "Agentic Workspace", href: "/app/agents", icon: "agent", badge: "12", group: "intelligence" },

  { label: "Device Center", href: "/app/devices", icon: "device", group: "operations" },
  { label: "Analytics", href: "/app/analytics", icon: "chart", group: "operations" },

  { label: "Settings & Privacy", href: "/app/settings", icon: "lock", group: "system" },
];
