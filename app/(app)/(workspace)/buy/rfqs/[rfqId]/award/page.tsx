// P-BUY-17 Buyer Award route (Doc-7F · `T-WIZARD`). A Next.js SERVER COMPONENT in the `(app)/(buyer)` group
// (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The dynamic segment is the
// OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY: the audit-backed `rfq.award_rfq.v1` (Doc-4E §E8.4, `can_award_rfq`) write stays
// PARKED (Wave 4); the SHORTLIST READ now arrives through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`). The mock adapter resolves the id against the fixture universe:
// unknown id → `null` → byte-identical not-found; a known RFQ with no shortlist → the honest
// "shortlist first" empty (candidates: []); a shortlisted RFQ → candidates in System-persisted order,
// NEVER re-ranked and with NO pre-selected winner (R6/GI-04). Selection is carried in the query (native
// GET nav from the select step); the org award-threshold notice is adapter-supplied (server-enforced at
// wiring). The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 /
// Doc-7C SR3).

import { rfqWorkflowData } from "../../../../../_components/rfq-workflow";
import { AwardView } from "../../../_components/award";

export const metadata = {
  title: "Award",
};

export default async function BuyerAwardPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ step?: string; sel?: string }>;
}) {
  const { rfqId } = await params;
  const sp = await searchParams;
  const shortlist = await rfqWorkflowData.buyer.getAwardShortlist(rfqId);
  if (!shortlist) return <AwardView data={null} />;

  const step = sp.step === "confirm" ? 1 : 0;
  // Selection carried in the query (native GET nav from the select step) — no default winner (R6).
  const selectedQuotationId = shortlist.candidates.some((c) => c.quotationId === sp.sel)
    ? sp.sel
    : undefined;
  return (
    <AwardView
      data={{
        ...shortlist,
        rfqId,
        selectedQuotationId,
        step,
      }}
    />
  );
}
