import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Root Layout — App Router composition only (REPOSITORY_STRUCTURE §8).
 * Wires iVendorz design system fonts (Inter + JetBrains Mono).
 * No business logic; per-surface layouts land with their owning Doc-7 wave.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--iv-font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--iv-font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "iVendorz — Industrial Procurement OS for Bangladesh",
    template: "%s | iVendorz",
  },
  description:
    "iVendorz is the Industrial Procurement Operating System for Bangladesh — connecting buyers and vendors through structured RFQ, verified vendor discovery, and post-award workflow.",
  keywords: [
    "industrial procurement",
    "B2B marketplace",
    "RFQ platform",
    "vendor management",
    "Bangladesh",
    "EPC procurement",
    "industrial suppliers",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://ivendorz.com"),
  icons: {
    icon: "/brand/ivendorz-logo-s.svg",
    shortcut: "/brand/ivendorz-logo-s.svg",
    apple: "/brand/ivendorz-logo-s.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "iVendorz",
    title: "iVendorz — Industrial Procurement OS for Bangladesh",
    description:
      "Connect with verified industrial vendors. Post RFQs, compare quotations, and manage the full procurement lifecycle on one platform.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
