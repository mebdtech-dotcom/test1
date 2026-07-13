// E2 + E3 Engagement detail (companion §13.3 → (app)/engagements/[engagementId]). Read =
// ops.get_engagement.v1 (8 fields; no rfq_id projected — [ESC-7G-ENG-01]). Overview (status / award
// value / buyer) stacked with the Documents set (per-kind enumeration escalation-gated [ESC-7G-ENG-03];
// derived reconciliation; persistent money-boundary banner). Non-party → byte-identical not-found.
// Presentation-only; sections render genuine-empty until reads are wired. `engagementId` is a URL param
// (display/link only) — no fetch here. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import {
  EngagementDocuments,
  EngagementOverview,
} from "../../../../_components/vendor/engagements";

export const metadata: Metadata = { title: "Engagement detail" };

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/sell/engagements" },
          { label: "Engagement detail" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Engagement detail"
        description="Your post-award documents and off-platform finance records for this engagement."
        meta={<span className="font-mono text-xs text-muted-foreground">{engagementId}</span>}
      />

      <EngagementOverview />

      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">Documents</h2>
        <EngagementDocuments />
      </div>
    </div>
  );
}
