// P-BUY-06 Buyer RFQ list route (Doc-7F §3.1 · `T-LISTING`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY: binds the M3 read `list_rfqs` through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`) — the mock adapter serves the full-lifecycle fixture
// universe today; at wiring (Wave 4) the seam swaps to the GI-02 server data layer (own-org,
// cursor-paginated — GI-03) and this page does not change. The journey-bucket summary above the
// list is an adapter-supplied count set (documented unions of frozen states — never client-
// computed, R7). The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization`
// (Inv #5 / Doc-7C SR3).

import { rfqWorkflowData, RfqPipelineSummary } from "../../../_components/rfq-workflow";
import { RfqListView } from "./rfq-list-view";

export const metadata = {
  title: "RFQs",
};

export default async function BuyerRfqListPage() {
  const [data, buckets] = await Promise.all([
    rfqWorkflowData.buyer.listRfqs(),
    rfqWorkflowData.buyer.getPipelineSummary(),
  ]);
  return <RfqListView data={data} summary={<RfqPipelineSummary buckets={buckets} />} />;
}
