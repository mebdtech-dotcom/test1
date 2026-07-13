// E4 Engagement document detail (companion §13.3 → .../[engagementId]/documents/[documentId]). Read =
// ops.get_engagement_document.v1 + ops.get_generated_document.v1. Active revision + immutable superseded
// chain (Invariant 8); rendered artifact via file-link (storage_ref, file_ref only); share = grant/
// revoke to the engagement counterparty only; revise opens the E5 sheet (mandatory revision_reason).
// Presentation-only; renders genuine-empty until reads are wired. URL params are display/link only — no
// fetch here. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../../../_components/shell";
import { EngagementDocumentDetail } from "../../../../../../_components/vendor/engagements";

export const metadata: Metadata = { title: "Document detail" };

export default async function EngagementDocumentPage({
  params,
}: {
  params: Promise<{ engagementId: string; documentId: string }>;
}) {
  const { engagementId, documentId } = await params;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/sell/engagements" },
          { label: "Engagement detail", href: `/sell/engagements/${engagementId}` },
          { label: "Document" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Document detail"
        description="The active revision and its immutable version history."
        meta={<span className="font-mono text-xs text-muted-foreground">{documentId}</span>}
      />
      <EngagementDocumentDetail />
    </div>
  );
}
