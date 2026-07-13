// P-BUY-25 Buyer WCC (Work Completion Certificate) — host view (`T-DETAILS`, Doc-7F). Pure function of its
// view-model (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The
// server page resolves the data via the wired `ops.get_engagement_document.v1` (Doc-4F §F5.8, GI-02) and
// passes it here; an unknown/absent/non-party document collapses to `notFound()` BY THE PAGE
// (byte-identical; Inv #11 / GI-12), so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Ref` + the shared
// `EngagementDocumentFileCard` (now shared by PO / Challan / WCC); kit `StatusChip`. No new primitive.
//
// GOVERNANCE:
//  • Renders ONLY frozen-projected fields of `get_engagement_document.v1` (Doc-4F §F5.8): `human_ref`,
//    `version_no`, `is_active_revision`, `storage_ref`. The WCC BODY (`content_jsonb`) is dev-doc scope,
//    NOT a projected read field, so none is fabricated.
//  • READ-ONLY: a WCC is issued by the certifying party (`ops.issue_engagement_document.v1` doc_kind=wcc);
//    there is NO buyer write affordance here. `WorkCompletionIssued` is a Trust input (server-side; the UI
//    computes no score).
//  • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): the active revision is shown; a WCC is never overwritten
//    — a revise appends a new version. Superseded versions are retained.
//  • A WCC is non-financial — no money surface applies here.

import { BadgeCheck, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../../_components/description-list";
import { EngagementDocumentFileCard } from "../../../_components/engagement-document-file-card";
import { Ref } from "../../../_components/format";
import type { WccData } from "../../../_components/wcc-view-models";

export function WccView({ data }: { data: WccData }) {
  const details: DescriptionItem[] = [
    { label: "Document reference", value: <Ref>{data.humanRef}</Ref> },
    // Versioned document (Inv #8): version_no + is_active_revision are the immutable stamps.
    { label: "Version", value: `v${data.versionNo}` },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/buy/engagements" },
          {
            label: data.engagementRef ?? "Engagement",
            href: `/buy/engagements/${data.engagementId}`,
          },
          { label: "Work completion" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Work completion certificate"
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
            <CardTitle className="text-sm font-semibold">Certificate details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={details} />
          </CardContent>
        </Card>

        {/* Rendered artifact card (shared across versioned engagement documents). The WCC body
            (`content_jsonb`) is not a projected read field → never inlined. */}
        <EngagementDocumentFileCard
          storageRef={data.storageRef}
          documentNoun="work completion certificate"
        />

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <BadgeCheck aria-hidden className="mt-0.5 size-3.5 shrink-0" />A work completion
          certificate records that work under this engagement was completed. It is issued by the
          certifying party; a revise appends a new version and prior versions are kept.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          This certificate is shared only between your organization and the vendor.
        </p>
      </div>
    </>
  );
}
