import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CursorAura } from "@/components/cursor-aura";
import { _Safelist } from "@/components/_safelist";
import { ToastViewport } from "@/components/ui/toast";
import { ThemeProvider, themeBootstrapScript } from "@/components/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glimmora Spectra — AGI Intelligence for the Human Eye",
  description:
    "AGI-powered smart eyewear ecosystem. Vision intelligence, memory augmentation, agentic AI and spatial computing — for the augmented human.",
  applicationName: "Glimmora Spectra",
  keywords: [
    "AGI",
    "smart glasses",
    "spatial computing",
    "AI agents",
    "memory augmentation",
    "vision intelligence",
    "Glimmora",
    "Spectra",
  ],
  authors: [{ name: "Glimmora International" }],
};

export const viewport: Viewport = {
  // Dark by default; the inline bootstrap script may swap colorScheme on
  // first paint if the user previously chose light or follows system.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0f24" },
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        {/*
          No-FOUC theme init. Runs synchronously before React boots so
          first paint already carries the persisted theme. Safe inline —
          no user-provided content interpolated.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-screen text-ink relative">
        <ThemeProvider>
          <Providers>
            <CursorAura />
            <ToastViewport />
            {children}
            <_Safelist />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
