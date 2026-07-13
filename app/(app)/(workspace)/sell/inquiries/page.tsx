// Vendor Workspace — Buyer Inquiries (VX-01 nav destination). Reserved in the redesigned sidebar
// but not yet built: no frozen contract exists today for a pre-RFQ buyer-inquiry stream distinct
// from the RFQ invitation inbox (`/sell/rfqs`) or the RFQ-scoped Clarifications feature. Scoped
// as its own future milestone rather than folded into an existing surface, since the mockup treats
// it as a distinct concept. `ImplementationPendingView` discloses the gap; no fake inquiry rows.
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { ImplementationPendingView } from "../../../_components/vendor/implementation-pending-view";

export const metadata: Metadata = { title: "Buyer Inquiries" };

export default function BuyerInquiriesPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Buyer Inquiries" }]}
      title="Buyer Inquiries"
      description="A stream of pre-RFQ buyer inquiries, distinct from your RFQ invitation inbox and per-RFQ clarifications."
      icon={<MessageSquare aria-hidden />}
    />
  );
}
