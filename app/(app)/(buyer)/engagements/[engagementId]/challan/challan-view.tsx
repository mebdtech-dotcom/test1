// P-BUY-24 Buyer Challan — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model (a Server
// Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page resolves
// the data via the wired `ops.get_engagement_document.v1` (Doc-4F §F5.8, GI-02) and passes it here; an
// unknown/absent/non-party document collapses to `notFound()` BY THE PAGE (byte-identical; Inv #11 /
// GI-12), so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Ref` + `EngagementDocumentFileCard`
// (shared across PO / Challan / WCC); kit `Card`/`StatusChip`. No new primitive. (Structurally mirrors the
// PO document detail minus the financial-approval card.)
//
// GOVERNANCE:
//  • Renders ONLY frozen-projected fields of `get_engagement_document.v1` (Doc-4F §F5.8): `human_ref`,
//    `version_no`, `is_active_revision`, `storage_ref`. The challan BODY (`content_jsonb` — delivery line
//    items / quantities) is dev-doc scope, NOT a projected read field, so none is fabricated.
//  • READ-ONLY: deliveries are recorded by the delivering party (`ops.record_delivery.v1`); there is NO
//    buyer write affordance here. `DeliveryRecorded` is a Trust input (server-side; UI computes no score).
//  • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): the active revision is shown; a challan is never
//    overwritten — a new delivery is a new version. Superseded versions are retained.
//  • A challan is a DELIVERY document — no money is involved (no DF-6 money surface applies here).

import { Info, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../../_components/description-list";
import { EngagementDocumentFileCard } from "../../../_components/engagement-document-file-card";
import { Ref } from "../../../_components/format";
import type { ChallanData } from "../../../_components/challan-view-models";

export function ChallanView({ data }: { data: ChallanData }) {
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
          { label: "Challan" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Delivery challan"
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
            <CardTitle className="text-sm font-semibold">Challan details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={details} />
          </CardContent>
        </Card>

        {/* Rendered artifact: a file-link off `storage_ref` (BC-OPS-4-generated); the challan body itself
            (`content_jsonb`) is not a projected read field → never inlined. Shared across versioned docs. */}
        <EngagementDocumentFileCard storageRef={data.storageRef} documentNoun="delivery challan" />

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Truck aria-hidden className="mt-0.5 size-3.5 shrink-0" />A delivery challan records a
          delivery against this engagement. It is recorded by the delivering party; each delivery is
          a new version and prior versions are kept.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          This challan is shared only between your organization and the vendor.
        </p>
      </div>
    </div>
  );
}
