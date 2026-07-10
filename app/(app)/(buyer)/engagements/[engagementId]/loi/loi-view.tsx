// P-BUY-21 Buyer Letter of intent — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model (a
// Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the data bound to `ops.get_engagement_document.v1` (Doc-4F §F5.8 — a mock this milestone;
// the GI-02 wiring is PARKED to Wave 4) and passes it
// here; an unknown/absent/non-party document collapses to `notFound()` BY THE PAGE (byte-identical;
// Inv #11 / GI-12), so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Ref` + `EngagementDocumentFileCard`
// (shared across LOI / PO / Challan / WCC); kit `Card`/`StatusChip`. No new primitive.
//
// GOVERNANCE:
//  • Renders ONLY frozen-projected fields of `get_engagement_document.v1` (Doc-4F §F5.8): `human_ref`,
//    `version_no`, `is_active_revision`, `storage_ref`. NO LOI terms / commitments text is shown — the
//    LOI body (`content_jsonb`) is dev-doc scope, not a projected read field, so none is fabricated.
//  • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): the active revision is shown; an LOI is never
//    overwritten; a revise appends a new version with a mandatory `revision_reason`. Superseded versions
//    are retained.
//  • NO APPROVAL AFFORDANCE — deliberate divergence from the sibling PO view: the frozen validation
//    matrix's distinct approval slug (`can_approve_po`, Doc-4F §F5.4 / Doc-2 §7) applies to `doc_kind = po`
//    financial approval ONLY. No LOI approval slug exists, and rendering an approval section here would
//    coin one. Issue/revise sit behind `can_create_documents`, enforced server-side at wiring.
//  • MONEY BOUNDARY (DF-6 / R8): an LOI is a RECORD only — the platform never holds/moves funds. A
//    standing note states this; there is NO pay/settle/escrow affordance anywhere.
//  • The engagement→LOI relationship has no enumeration read (`ESC-7G-ENG-03`); an LOI is reached by its
//    own `document_id` only. The rendered-artifact file is a file-link off `storage_ref`, never inlined data.

import { Banknote, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../../_components/description-list";
import { EngagementDocumentFileCard } from "../../../_components/engagement-document-file-card";
import { Ref } from "../../../_components/format";
import { Callout } from "../../../_components/callout";
import type { LetterOfIntentData } from "../../../_components/loi-view-models";

export function LetterOfIntentView({ data }: { data: LetterOfIntentData }) {
  const details: DescriptionItem[] = [
    { label: "Document reference", value: <Ref>{data.humanRef}</Ref> },
    // Versioned document (Inv #8): version_no + is_active_revision are the immutable stamps.
    { label: "Version", value: `v${data.versionNo}` },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/engagements" },
          {
            label: data.engagementRef ?? "Engagement",
            href: `/engagements/${data.engagementId}`,
          },
          { label: "Letter of intent" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Letter of intent"
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
            <CardTitle className="text-sm font-semibold">Letter of intent details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={details} />
          </CardContent>
        </Card>

        {/* Rendered artifact: a file-link off `storage_ref` (BC-OPS-4-generated); the LOI body itself
            (`content_jsonb`) is not a projected read field → never inlined. Shared across versioned docs. */}
        <EngagementDocumentFileCard storageRef={data.storageRef} documentNoun="letter of intent" />

        {/* Money boundary (DF-6 / R8): an LOI is a record only; the platform never holds or moves funds. */}
        <Callout icon={<Banknote aria-hidden />}>
          A letter of intent is a <span className="font-medium">record only</span>. The platform
          never holds, escrows, or moves funds — payments are settled directly between the parties
          and are tracked as records.
        </Callout>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          This letter of intent is shared only between your organization and the awarded vendor.
        </p>
      </div>
    </>
  );
}
