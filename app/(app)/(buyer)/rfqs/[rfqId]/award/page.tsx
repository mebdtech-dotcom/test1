// P-BUY-17 Buyer Award route (Doc-7F · `T-WIZARD`). A Next.js SERVER COMPONENT in the `(app)/(buyer)` group
// (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The dynamic segment is the
// OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY: the audit-backed `rfq.award_rfq.v1` (Doc-4E §E8.4, `can_award_rfq`) write + the
// shortlist read are NOT wired (PARKED — Wave 4). The MOCK_SHORTLIST below (FE-BUY-06) mirrors the same two
// "RFQ-2026-000123" vendors/amounts already seeded on the RFQ detail (BX-02), quotation detail (FE-BUY-04),
// and comparison (FE-BUY-05) fixtures, now progressed `submitted → shortlisted` (a real Doc-4M transition —
// not a coined state) for a coherent RFQ → Quotations → Comparison → Award fixture universe. A non-visible
// RFQ collapses to NOT_FOUND server-side (§7.5) → `data={null}` (byte-identical not-found in AwardView). The
// browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { AwardView } from "../../../_components/award";
import type { AwardCandidate } from "../../../_components/award";

export const metadata = {
  title: "Award",
};

// Realistic industrial-procurement MOCK (page-standards: "mock data realistic") — the shortlisted set the
// wired `rfq.get_quotation`/shortlist read supplies at integration. In System-persisted order, NEVER
// re-ranked (R6). Presentation-only: no vendor is pre-selected (no default winner — R6).
const MOCK_SHORTLIST: AwardCandidate[] = [
  {
    quotationId: "q-1",
    vendorName: "Meghna Industrial Supplies Ltd.",
    state: "shortlisted",
    amount: { amount: 2695000, currency: "BDT" },
    delivery: "6 weeks from PO",
    validUntil: "2026-07-15",
  },
  {
    quotationId: "q-2",
    vendorName: "Padma Engineering Works",
    state: "shortlisted",
    amount: { amount: 2810000, currency: "BDT" },
    delivery: "4 weeks from PO",
    validUntil: "2026-07-10",
  },
];

export default async function BuyerAwardPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ step?: string; sel?: string }>;
}) {
  const { rfqId } = await params;
  const sp = await searchParams;
  const step = sp.step === "confirm" ? 1 : 0;
  // Selection carried in the query (native GET nav from the select step) — no default winner (R6).
  const selectedQuotationId = MOCK_SHORTLIST.some((c) => c.quotationId === sp.sel)
    ? sp.sel
    : undefined;
  return (
    <AwardView
      data={{
        rfqId,
        humanRef: "RFQ-2026-000123",
        candidates: MOCK_SHORTLIST,
        selectedQuotationId,
        // Above the org award-threshold ⇒ Director/Owner approval notice (mock; server-enforced at wiring).
        aboveThreshold: true,
        step,
      }}
    />
  );
}
