import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Dashboard — iVendorz",
  description: "Overview of sourcing activity: RFQs, quotations, approvals, and supplier activity.",
};

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
