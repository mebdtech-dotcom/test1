// P-BUY-12 Buyer Internal approval route (Doc-7F · `T-MANAGEMENT`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): the queue read `rfq.list_rfqs` (state=pending_internal_approval,
// own-org) and the decision writes `rfq.approve_rfq.v1` / `rfq.reject_internal_rfq.v1` (Doc-4E §E4.4) are
// NOT wired today (PARKED — Wave 4). A realistic mock stands in. NO auto-approve exists (Doc-3 §1.2). The
// browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { ApprovalsView } from "./approvals-view";
import type { ApprovalQueueItem, ApprovalsData } from "../_components/approvals-view-models";

export const metadata = {
  title: "Approvals",
};

// Realistic industrial-procurement MOCK — RFQs pending internal approval (own-org). Year-scoped human refs
// (Inv #5); values BDT. In System-persisted order (never re-ranked, GI-04).
const MOCK_PENDING: ApprovalQueueItem[] = [
  {
    id: "rfq_31",
    humanRef: "RFQ-2026-000131",
    title: "MS plate & structural steel — Line 3 expansion",
    value: { amount: 4200000, currency: "BDT" },
    submittedAt: "2026-07-02",
  },
  {
    id: "rfq_29",
    humanRef: "RFQ-2026-000129",
    title: "VFD drives & motor spares (annual)",
    value: { amount: 1850000, currency: "BDT" },
    submittedAt: "2026-07-01",
  },
  {
    id: "rfq_27",
    humanRef: "RFQ-2026-000127",
    title: "Boiler feedwater pump overhaul service",
    value: { amount: 960000, currency: "BDT" },
    submittedAt: "2026-06-30",
  },
];

export default function BuyerApprovalsPage() {
  // canApproveRfq mirrors the Doc-2 §7 slug (server-enforced at wiring). Presentation-only.
  const data: ApprovalsData = { items: MOCK_PENDING, canApproveRfq: true };
  return <ApprovalsView data={data} />;
}
