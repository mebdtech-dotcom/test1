// S1 Quotation Home + S2 Invitation Inbox (companion §6.2 → (app)/rfqs). RECEIVED-ONLY: the inbox
// renders only invitations delivered to this vendor (read = rfq.list_invitations vendor leg); there is
// no browse/discovery of un-invited RFQs (DP1/BE-1).
//
// PRESENTATION-ONLY: data now arrives through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`) — the mock adapter serves the vendor fixture universe (own
// invitations / own quotations across their frozen states; ND-1..ND-8 safe by construction). The
// journey-bucket summary is adapter-supplied (own facts only — never client-computed, R7). At wiring
// the seam swaps to the GI-02 server data layer and this page does not change. Uses the platform
// shell PageHeader.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { rfqWorkflowData, RfqPipelineSummary } from "../../../_components/rfq-workflow";
import { InvitationInbox, QuotationHomeSummary } from "../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "RFQs & Quotations" };

export default async function RfqsPage() {
  const [items, quota, buckets] = await Promise.all([
    rfqWorkflowData.vendor.listInbox(),
    rfqWorkflowData.vendor.getQuota(),
    rfqWorkflowData.vendor.getPipelineSummary(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQs & Quotations"
        description="Invitations buyers have sent you, and the quotations you author in response."
      />
      <QuotationHomeSummary quota={quota} />
      <RfqPipelineSummary buckets={buckets} />
      <InvitationInbox items={items} />
    </div>
  );
}
