// PL-2 Lead Detail (companion §13.2 → (app)/leads/[leadId]). Read = ops.get_lead.v1 (own CRM fields +
// bare UUIDs + activities). Two panes: RFQ CONTEXT (navigation-only to the M3 surface, grant-scoped) and
// YOUR PIPELINE (stage advance + Mark won/lost + value/next-action). Below: append-only ACTIVITY and
// PRIVATE NOTES (note-typed activity fallback). won/lost is private CRM, never the RFQ award (R6).
// Non-owned/absent leadId → byte-identical not-found (BE-4). Presentation-only; sections render
// genuine-empty until the reads are wired. `leadId` is a URL param (display/link only) — no fetch here.
// Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import {
  LeadActivityLog,
  LeadPipelinePanel,
  LeadPrivateNotes,
  LeadRfqContext,
} from "../../../../_components/vendor/leads";

export const metadata: Metadata = { title: "Lead detail" };

export default async function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Leads & Pipeline", href: "/sell/leads" }, { label: "Lead detail" }]}
        className="mb-4"
      />
      <PageHeader
        title="Lead detail"
        description="Your private notes and pipeline for this received RFQ invitation."
        meta={<span className="font-mono text-xs text-muted-foreground">{leadId}</span>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LeadRfqContext />
        <LeadPipelinePanel />
      </div>

      <LeadActivityLog />
      <LeadPrivateNotes />
    </div>
  );
}
