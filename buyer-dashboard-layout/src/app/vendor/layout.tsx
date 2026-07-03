import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Dashboard — iVendorz",
  description:
    "Your digital showcase and business portal: company profile, portfolios, RFQ leads, and buyer inquiries.",
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
