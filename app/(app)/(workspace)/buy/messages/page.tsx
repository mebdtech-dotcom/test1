// Buyer sidebar IA (BX-04) — "Messages" (Communication group). RESERVED ROUTE, no contract yet: M6
// Communication today only exposes per-RFQ Clarification threads (`manage_clarification`, P-BUY-16,
// already built at `/buy/rfqs/[rfqId]/clarifications`) — there is no cross-RFQ unified inbox read in the
// frozen corpus. `ImplementationPendingView` reserves the destination without fabricating an inbox.
import { MessageSquare } from "lucide-react";
import { ImplementationPendingView } from "../_components/implementation-pending-view";

export const metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return (
    <ImplementationPendingView
      breadcrumb={[{ label: "Messages" }]}
      title="Messages"
      description="A unified inbox across your RFQ conversations. Today, messaging happens per RFQ from that RFQ's Clarifications tab."
      icon={<MessageSquare aria-hidden />}
    />
  );
}
