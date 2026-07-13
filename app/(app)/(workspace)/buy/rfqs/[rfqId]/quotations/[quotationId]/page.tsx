// P-BUY-14 Buyer Quotation detail route (Doc-7F §3.1/§4.2 · `T-DETAILS`). A Next.js SERVER COMPONENT in
// the `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
// The dynamic segments are the OPAQUE RFQ id + quotation id (UUIDs) — never human refs (Inv #5 / Doc-7F).
//
// PRESENTATION-ONLY: binds the M3 read `rfq.get_quotation.v1` (Doc-4E §E7.5) through the RFQ WORKFLOW
// ADAPTER SEAM (`_components/rfq-workflow/adapters`). The mock adapter resolves both ids against the
// fixture universe; an unknown pair resolves to `null` → the byte-identical not-found ≡ genuine-absence
// state (Inv #11 / GI-12) — exactly how the wired read collapses a non-disclosed id (§7.5).
//
// WIRING SEAM (Wave 4): swap the adapter export to the GI-02 server data layer, gated by the buyer's
// `quotation_visibility` grant; apply the POLICY `abuse.sealed_until_close` redaction server-side and
// pass `sealedUntilClose` for the UI to EXPLAIN. The browser never calls a Doc-5 contract and never sets
// `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { rfqWorkflowData } from "../../../../../../_components/rfq-workflow";
import { QuotationDetailView } from "./quotation-detail-view";

export const metadata = {
  title: "Quotation",
};

export default async function BuyerQuotationDetailPage({
  params,
}: {
  params: Promise<{ rfqId: string; quotationId: string }>;
}) {
  const { rfqId, quotationId } = await params;
  const data = await rfqWorkflowData.buyer.getQuotationDetail(rfqId, quotationId);
  return <QuotationDetailView data={data} />;
}
