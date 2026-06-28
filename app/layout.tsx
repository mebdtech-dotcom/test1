import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { cn } from "@/shared/ui/lib/cn";

// iVendorz Design System fonts — Inter (UI/body) + JetBrains Mono (data/figures).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Root layout — App Router composition only (REPOSITORY_STRUCTURE §8).
// No business logic; per-surface layouts land with their owning Doc-7 wave.
export const metadata: Metadata = {
  title: {
    default: "iVendorz",
    template: "%s · iVendorz",
  },
  description: "Industrial Procurement Operating System for Bangladesh",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1726" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("bg-background", inter.variable, jetbrainsMono.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
