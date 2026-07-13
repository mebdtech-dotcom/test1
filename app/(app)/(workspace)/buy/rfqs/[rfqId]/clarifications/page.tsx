// P-BUY-16 Buyer Clarifications route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5).
//
// PRESENTATION-ONLY / PLACEHOLDER (Board-ruled 2026-07-01): the clarification THREAD is the M6-single-owned
// `conversation-thread` embedded component (Doc-7B §5 · Doc-5H), which is DEFERRED/not built — so this
// milestone renders the buyer-owned page host + a non-disclosure-safe placeholder region, NOT the messages.
// The page identity (humanRef) now resolves through the RFQ WORKFLOW ADAPTER SEAM: an unknown id → `null`
// → the byte-identical not-found in ClarificationsView (a non-participant collapses to NOT_FOUND
// server-side at wiring, §7.5).
//
// WIRING SEAM (later milestone): the thread mounts the M6 `conversation-thread` (disclosed-messages read,
// Doc-5H), participant-scoped. The browser never calls a Doc-5 contract and never sets
// `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { rfqWorkflowData } from "../../../../../_components/rfq-workflow";
import { ClarificationsView } from "../../../_components/clarifications";

export const metadata = {
  title: "Clarifications",
};

export default async function BuyerClarificationsPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const rfq = await rfqWorkflowData.buyer.getRfq(rfqId);
  return <ClarificationsView data={rfq ? { rfqId: rfq.id, humanRef: rfq.humanRef } : null} />;
}
