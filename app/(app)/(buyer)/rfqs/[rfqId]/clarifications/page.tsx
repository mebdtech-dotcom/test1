// P-BUY-16 Buyer Clarifications route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5).
//
// PRESENTATION-ONLY / PLACEHOLDER (Board-ruled 2026-07-01): the clarification THREAD is the M6-single-owned
// `conversation-thread` embedded component (Doc-7B §5 · Doc-5H), which is DEFERRED/not built — so this
// milestone renders the buyer-owned page host + a non-disclosure-safe placeholder region, NOT the messages.
//
// WIRING SEAM (later milestone): the thread mounts the M6 `conversation-thread` (disclosed-messages read,
// Doc-5H), participant-scoped; a non-participant collapses to NOT_FOUND server-side (§7.5) → `data={null}`
// (the byte-identical not-found in ClarificationsView). The browser never calls a Doc-5 contract and never
// sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).
//
// PRESENTATION FIXTURE (BX-03/FE-BUY-04): `humanRef` mirrors the same "RFQ-2026-000123" fixture used on
// the parent RFQ detail (BX-02) and its quotation (P-BUY-14), so the breadcrumb shows the real reference
// instead of the generic fallback — a coherent fixture across the RFQ → Quotation → Clarifications flow.

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
  return <ClarificationsView data={{ rfqId, humanRef: "RFQ-2026-000123" }} />;
}
