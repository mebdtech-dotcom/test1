// PL-1 Pipeline — RETIRED INDEX (Cluster #1 merge · Team-1 build order F1/F3/F4 · closure record §2).
// The Leadboard folded into the RFQ workspace as the Pipeline lens; `/sell/leads` now 308-redirects to
// `/sell/rfqs?view=board` (`next.config.ts`), so this page is normally SHADOWED and never rendered. It
// is kept (labels de-collided from "Leadboard" → "Pipeline", F4) as a graceful fallback should the
// redirect ever be removed, and because ONLY the index destination retires — the per-lead detail route
// (`/sell/leads/[leadId]`) is unaffected and stays live (F3). Presentation-only; renders genuine-empty
// until the reads are wired. Uses the shell PageHeader.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { LeadBoard, LeadList, LeadPipeline } from "../../../_components/vendor/leads";

export const metadata: Metadata = { title: "Pipeline" };

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description="Your private pipeline of RFQ invitations you've received, on a stage board. Leads appear automatically — you don't create them."
      />
      {/* Board opens first (VX-03) — the kanban is the focus; List stays available as a tab. */}
      <LeadPipeline list={<LeadList />} board={<LeadBoard />} defaultView="board" />
    </div>
  );
}
