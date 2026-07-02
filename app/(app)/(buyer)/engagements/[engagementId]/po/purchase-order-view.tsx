// P-BUY-21 Buyer Purchase order — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model (a
// Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the data via the wired `ops.get_engagement_document.v1` (Doc-4F §F5.8, GI-02) and passes it
// here; an unknown/absent/non-party document collapses to `notFound()` BY THE PAGE (byte-identical;
// Inv #11 / GI-12), so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Ref` + `EngagementDocumentFileCard`
// (shared across PO / Challan / WCC); kit `Card`/`StatusChip`/`Button`. No new primitive.
//
// GOVERNANCE:
//  • Renders ONLY frozen-projected fields of `get_engagement_document.v1` (Doc-4F §F5.8): `human_ref`,
//    `version_no`, `is_active_revision`, `storage_ref`. NO PO line items / totals / terms are shown — the
//    PO body (`content_jsonb`) is dev-doc scope, not a projected read field, so none is fabricated.
//  • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): the active revision is shown; a PO is never overwritten;
//    a revise appends a new version with a mandatory `revision_reason`. Superseded versions are retained.
//  • `can_approve_po` is a DISTINCT slug (Doc-4F §F5.4 / Doc-2 §7) — NEVER collapsed into
//    `can_create_documents`. The approval affordance is gated on `canApprovePo` in PRESENTATION only; the
//    server enforces (`check_permission`) at wiring. It is disabled (no wiring this milestone).
//  • MONEY BOUNDARY (DF-6 / R8): a PO is a RECORD only — the platform never holds/moves funds. A standing
//    note states this; there is NO pay/settle/escrow affordance anywhere.
//  • The engagement→PO relationship has no enumeration read (`ESC-7G-ENG-03`); a PO is reached by its own
//    `document_id` only. The rendered-artifact file is a file-link off `storage_ref`, never inlined data.

import { Banknote, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../../_components/description-list";
import { EngagementDocumentFileCard } from "../../../_components/engagement-document-file-card";
import { Ref } from "../../../_components/format";
import type { PurchaseOrderData } from "../../../_components/purchase-order-view-models";

export function PurchaseOrderView({ data }: { data: PurchaseOrderData }) {
  const details: DescriptionItem[] = [
    { label: "Document reference", value: <Ref>{data.humanRef}</Ref> },
    // Versioned document (Inv #8): version_no + is_active_revision are the immutable stamps.
    { label: "Version", value: `v${data.versionNo}` },
  ];

  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/engagements" },
          {
            label: data.engagementRef ?? "Engagement",
            href: `/engagements/${data.engagementId}`,
          },
          { label: "Purchase order" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Purchase order"
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            {/* is_active_revision as a neutral presentation cue — the active revision vs a superseded one. */}
            <StatusChip
              label={data.isActiveRevision ? "Active revision" : "Superseded"}
              tone={data.isActiveRevision ? "success" : "neutral"}
            />
          </>
        }
      />

      <div className="mt-2 flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Purchase order details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={details} />
          </CardContent>
        </Card>

        {/* Rendered artifact: a file-link off `storage_ref` (BC-OPS-4-generated); the PO body itself
            (`content_jsonb`) is not a projected read field → never inlined. Shared across versioned docs. */}
        <EngagementDocumentFileCard storageRef={data.storageRef} documentNoun="purchase order" />

        {/* PO financial approval — gated on the DISTINCT `can_approve_po` slug (Doc-4F §F5.4 / Doc-2 §7),
            NEVER collapsed into `can_create_documents`. Presentation-only affordance; server enforces. */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Financial approval</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {data.canApprovePo ? (
              <>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
                  You can approve this purchase order for your organization. Approving is a
                  deliberate act and is recorded against this document.
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <p className="mr-auto text-xs text-muted-foreground">
                    Approval connects in the integration phase.
                  </p>
                  {/* Disabled: the audit-backed issue/approve write is PARKED (Wave 4). */}
                  <Button type="button" disabled>
                    Approve purchase order
                  </Button>
                </div>
              </>
            ) : (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
                Purchase order approval requires the purchase-order approval permission. Ask an
                administrator in your organization if you need it.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Money boundary (DF-6 / R8): a PO is a record only; the platform never holds or moves funds. */}
        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          <Banknote aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            A purchase order is a <span className="font-medium">record only</span>. The platform
            never holds, escrows, or moves funds — payments are settled directly between the parties
            and are tracked as records.
          </p>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          This purchase order is shared only between your organization and the awarded vendor.
        </p>
      </div>
    </div>
  );
}
