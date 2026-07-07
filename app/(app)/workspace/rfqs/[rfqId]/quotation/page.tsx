// S4 Quote Authoring (companion §13.1 → (app)/rfqs/[rfqId]/quotation). The quotation builder —
// single-scroll stacked-card document (owner reference format, 2026-07-06; all seven §13.1 sections
// retained) — bound to a fixed rfq_version_id snapshot resolved server-side from the grant (read =
// rfq.get_rfq.v1; the same grant-scoped snapshot + own-invitation reads the detail page uses feed the
// hero and buyer-parameters strip). Compose vs revise mode is resolved server-side (Invariant 5),
// never a client flag.
//
// PRESENTATION-ONLY: the builder's working-draft content now arrives through the RFQ WORKFLOW ADAPTER
// SEAM (`_components/rfq-workflow/adapters`) — own data only (draft lines, terms, the version-locked
// snapshot label, the numeric quota); an unknown id renders the workspace not-found (grant-scoped
// collapse, no existence leak). All actions remain disabled; draft persistence stays client-local-only
// pending [ESC-7G-Q-DRAFT]. At wiring the seam swaps to the GI-02 server data layer and this page does
// not change. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import { rfqWorkflowData } from "../../../../_components/rfq-workflow";
import { QuotationBuilder } from "../../../../_components/vendor/rfq";
import { VENDOR_SHELL_VM } from "../../../../_components/vendor/vendor-shell-vm";

export const metadata: Metadata = { title: "Author quotation" };

export default async function QuotationBuilderPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const [draft, quota, snapshot, quotation] = await Promise.all([
    rfqWorkflowData.vendor.getQuotationDraft(rfqId),
    rfqWorkflowData.vendor.getQuota(),
    rfqWorkflowData.vendor.getRfqSnapshot(rfqId),
    rfqWorkflowData.vendor.getOwnQuotation(rfqId),
  ]);
  if (!draft) notFound();

  // SYSTEM-MANAGED revision display (owner ruling 2026-07-07): Rev N = the count of already-submitted
  // immutable versions (frozen `current_version_no`); a never-submitted draft shows Rev 0.
  const revisionNo = quotation?.current_version_no ?? 0;

  // Contact defaults come from the shell identity source — the same single identity the workspace
  // shell renders, so the default follows the real signed-in user automatically at wiring.
  const shellUser = VENDOR_SHELL_VM.identity.user;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "RFQs & Quotations", href: "/workspace/rfqs" },
          { label: "RFQ detail", href: `/workspace/rfqs/${rfqId}` },
          { label: "Quotation" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Author quotation"
        description="Presentation only — saving and submitting connect in the integration phase."
        meta={<span className="font-mono text-xs text-muted-foreground">{rfqId}</span>}
      />
      <QuotationBuilder
        {...draft}
        quota={quota}
        rfq={snapshot ?? undefined}
        revisionNo={revisionNo}
        defaultContactPerson={shellUser.name}
        defaultContactNumber=""
      />
    </div>
  );
}
