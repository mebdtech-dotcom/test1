import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

// Root layout — App Router composition only (REPOSITORY_STRUCTURE §8).
// No business logic; per-surface layouts land with their owning Doc-7 wave.
export const metadata: Metadata = {
  title: "iVendorz",
  description: "Industrial Procurement Operating System for Bangladesh",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
