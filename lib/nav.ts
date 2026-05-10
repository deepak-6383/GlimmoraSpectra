export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  group: "core" | "intelligence" | "operations" | "system";
};

export const NAV: NavItem[] = [
  { label: "Cognitive Hub", href: "/app/dashboard", icon: "sparkles", group: "core" },
  { label: "Live Pipeline", href: "/app/live", icon: "camera", badge: "live", group: "core" },
  { label: "Spatial AR", href: "/app/spatial", icon: "layers", badge: "phase 3", group: "core" },
  { label: "AI Console", href: "/app/console", icon: "wave", group: "core" },

  { label: "Cognition Layer", href: "/app/cognition", icon: "brain", badge: "phase 2", group: "intelligence" },
  { label: "Vision Intelligence", href: "/app/vision", icon: "eye", group: "intelligence" },
  { label: "Memory Engine", href: "/app/memory", icon: "brain", group: "intelligence" },
  { label: "Agentic Workspace", href: "/app/agents", icon: "agent", badge: "12", group: "intelligence" },

  { label: "Device Center", href: "/app/devices", icon: "device", group: "operations" },
  { label: "Lens · 3D Preview", href: "/app/lens", icon: "glasses", badge: "new", group: "operations" },
  { label: "Analytics", href: "/app/analytics", icon: "chart", group: "operations" },

  { label: "System Status", href: "/app/system", icon: "activity", group: "system" },
  { label: "Settings & Privacy", href: "/app/settings", icon: "lock", group: "system" },
];
