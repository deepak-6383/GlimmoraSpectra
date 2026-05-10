import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CursorAura } from "@/components/cursor-aura";
import { _Safelist } from "@/components/_safelist";
import { ToastViewport } from "@/components/ui/toast";

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
  themeColor: "#eef1f8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-ink relative overflow-x-hidden">
        <Providers>
          <CursorAura />
          <ToastViewport />
          {children}
          <_Safelist />
        </Providers>
      </body>
    </html>
  );
}
