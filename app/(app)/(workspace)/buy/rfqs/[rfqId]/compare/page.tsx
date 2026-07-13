// P-BUY-15 Buyer Supplier Comparison route (Doc-7F · `T-ANALYTICS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5).
//
// PRESENTATION-ONLY: binds the M3 read `rfq.get_comparison_statement.v1` (Doc-4E §E8.6) through the RFQ
// WORKFLOW ADAPTER SEAM (`_components/rfq-workflow/adapters`). The mock adapter resolves the id against
// the fixture universe: an unknown id → `null` → the byte-identical not-found (Inv #11 / GI-12); a known
// RFQ before its first quotation → `null` (the statement does not exist yet — genuine absence, never
// fabricated); a quoted RFQ → the System-ordered matrix rendered WITHOUT re-ranking (R6/GI-04).
//
// WIRING SEAM (Wave 4): swap the adapter export to the GI-02 server data layer — this page does not
// change. NOTE the wired read's first-open side effect (`quotations_received → buyer_reviewing`,
// Doc-4E §E8.6) is SERVER-owned; nothing here simulates it. The browser never calls a Doc-5 contract
// and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { rfqWorkflowData } from "../../../../../_components/rfq-workflow";
import { ComparisonView } from "../../../_components/comparison";

export const metadata = {
  title: "Comparison",
};

export default async function BuyerComparisonPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const data = await rfqWorkflowData.buyer.getComparison(rfqId);
  return <ComparisonView data={data} />;
}
