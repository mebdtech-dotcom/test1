// PL-1 Pipeline (companion §13.2 → (app)/leads). The vendor's private CRM of RECEIVED RFQ invitations
// (read = ops.list_leads.v1, cursor, no totals). RECEIVED-ONLY: leads are created out-of-wire on the
// VendorInvited event — the vendor never self-creates one (no add affordance). Presentation-only;
// renders genuine-empty (one canonical, byte-equivalent copy) until the reads are wired. List is the
// default view; Board is a desktop convenience with non-numeric column links. Uses the shell PageHeader.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { LeadBoard, LeadList, LeadPipeline } from "../../../_components/vendor/leads";

export const metadata: Metadata = { title: "Leads & Pipeline" };

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & Pipeline"
        description="Your private CRM of RFQ invitations you've received. Leads appear automatically — you don't create them."
      />
      <LeadPipeline list={<LeadList />} board={<LeadBoard />} />
    </div>
  );
}
