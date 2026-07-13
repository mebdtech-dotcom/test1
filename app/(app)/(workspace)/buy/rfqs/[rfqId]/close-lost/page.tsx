// P-BUY-18 Buyer "Close RFQ as lost" route (Doc-7F · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): the audit-backed `rfq.close_lost_rfq` (Doc-4E §E8.5,
// `can_approve_vendor_selection` / `can_award_rfq`) write + the RFQ read are NOT wired (PARKED — Wave 4).
// A non-visible RFQ collapses to NOT_FOUND server-side (§7.5) → `data={null}` (byte-identical not-found).
// The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { CloseLostView } from "../../../_components/close-lost";
import { CLOSE_LOST_REASON_CODES, type CloseLostReasonCode } from "../../../_components/close-lost";

export const metadata = {
  title: "Close as lost",
};

export default async function BuyerCloseLostPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ step?: string; reason?: string; detail?: string }>;
}) {
  const { rfqId } = await params;
  const sp = await searchParams;
  const step = sp.step === "confirm" ? 1 : 0;
  // Reason carried in the query (native GET nav) — only accept a frozen POLICY code (Doc-4E §E8.5).
  const selectedReasonCode = CLOSE_LOST_REASON_CODES.includes(sp.reason as CloseLostReasonCode)
    ? (sp.reason as CloseLostReasonCode)
    : undefined;
  return (
    <CloseLostView
      data={{
        rfqId,
        humanRef: "RFQ-2026-000123",
        selectedReasonCode,
        reasonText: sp.detail,
        step,
      }}
    />
  );
}
