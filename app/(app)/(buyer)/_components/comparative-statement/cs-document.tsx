// Comparative Statement (CS) — document composer (WP-2; freeze §3, Visual-Approval-bound).
// Composes the fixed A4 sheet sequence from the view-model: Executive Summary page → item
// comparison pages (content-driven chunking, ~15–20 rows/page, repeating header, NEVER a shrunken
// font — freeze §3.2) → Final Approval page. Page count flexes with the item list and the
// computed "Page N of M" footers follow (owner Visual-Approval ruling).
//
// GOVERNANCE: pure presentation over adapter-computed facts (R7); evaluative sections render only
// from `buyerEvaluation` with visible provenance (R6, freeze §4.1). `null` → the byte-identical
// not-found ≡ genuine absence (Inv #11 / GI-12) — an unknown id and a pre-first-quotation RFQ are
// indistinguishable.

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader, Breadcrumbs } from "../../../_components/shell";
import { CsCompactHead, CsLetterheadBlock, CsSectionHeading, CsSheet } from "./cs-sheet";
import {
  CsBuyerEvaluationSummary,
  CsCommercialComparison,
  CsCommercialSummary,
  CsDeliveryComparison,
  CsExecutiveSummary,
  CsItemsTable,
  CsLowestLegend,
  CsRecommendationPanel,
  CsSignatures,
  CsTechnicalSummary,
  CsTitleAndMeta,
  CsVendorRoster,
} from "./cs-sections";
import { CsToolbar } from "./cs-toolbar";
import type { ComparativeStatementData } from "./cs-view-models";

/** Freeze §3.2: approximately 15–20 item rows per page; more items add pages, never shrink type. */
const ITEMS_PER_PAGE = 16;

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). Breadcrumb shows only the `RFQs` ancestor. */
function NotFoundState() {
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      <h1 className="sr-only">Comparative statement not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Comparative statement not found"
        description="This comparative statement doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

export function ComparativeStatementView({ data }: { data: ComparativeStatementData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }

  // Content-driven pagination: 1 (executive) + N item pages + 1 (final approval).
  const chunks: (typeof data.items)[] = [];
  for (let i = 0; i < data.items.length; i += ITEMS_PER_PAGE) {
    chunks.push(data.items.slice(i, i + ITEMS_PER_PAGE));
  }
  if (chunks.length === 0) chunks.push([]);
  const totalPages = chunks.length + 2;

  return (
    <div className="cs-scope mx-auto max-w-[1180px] p-4 sm:p-6">
      {/* Screen-only chrome — hidden in print (only the document sheets emit). */}
      <div className="cs-print-hidden">
        <Breadcrumbs
          items={[
            { label: "RFQs", href: "/rfqs" },
            { label: data.humanRef ?? "RFQ", href: `/rfqs/${data.rfqId}` },
            { label: "Comparative Statement" },
          ]}
          className="mb-4"
        />
        <PageHeader
          title="Comparative Statement"
          description="Official procurement document — fixed A4 layout, generated from the comparison."
          meta={
            <span className="text-xs text-muted-foreground">
              Draft Reference (official CS series pending governance) · evaluative content is
              buyer-authored
            </span>
          }
          actions={<CsToolbar rfqId={data.rfqId} />}
        />
      </div>

      <div className="cs-sheet-list flex flex-col gap-5">
        {/* -------- Page 1 · Executive Summary -------- */}
        <CsSheet pageNo={1} totalPages={totalPages}>
          <div className="cs-letterhead">
            <CsLetterheadBlock letterhead={data.letterhead} />
            <CsTitleAndMeta data={data} />
          </div>
          <hr className="cs-rule-strong" />
          <hr className="cs-rule-thin" />
          <div style={{ display: "flex", gap: "6mm", marginTop: "3.5mm" }}>
            <div style={{ flex: 1.15, display: "flex", flexDirection: "column", gap: "3.5mm" }}>
              <CsVendorRoster vendors={data.vendors} />
              {data.buyerEvaluation?.executiveSummary ? (
                <CsExecutiveSummary text={data.buyerEvaluation.executiveSummary} />
              ) : null}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5mm" }}>
              <CsCommercialSummary data={data} />
              <div style={{ marginTop: "auto" }}>
                <CsSignatures approvals={data.approvals} heading="Approval" />
              </div>
            </div>
          </div>
        </CsSheet>

        {/* -------- Item comparison pages (repeating header; totals on the last) -------- */}
        {chunks.map((chunk, ci) => {
          const isLast = ci === chunks.length - 1;
          const from = ci * ITEMS_PER_PAGE + 1;
          const to = ci * ITEMS_PER_PAGE + chunk.length;
          return (
            <CsSheet key={`items-${ci}`} pageNo={ci + 2} totalPages={totalPages}>
              <CsCompactHead letterheadName={data.letterhead.name} humanRef={data.humanRef} />
              <div style={{ marginTop: "2.5mm" }}>
                <CsSectionHeading bare>
                  Item Comparison Summary — Items {from}–{to}
                  {isLast ? " · Totals" : ""}
                </CsSectionHeading>
                <CsItemsTable data={data} items={chunk} withTotals={isLast} />
                <CsLowestLegend />
              </div>
            </CsSheet>
          );
        })}

        {/* -------- Final page · summaries, buyer evaluation, approval -------- */}
        <CsSheet pageNo={totalPages} totalPages={totalPages}>
          <CsCompactHead letterheadName={data.letterhead.name} humanRef={data.humanRef} />
          <div style={{ display: "flex", gap: "5mm", marginTop: "3mm" }}>
            <div style={{ flex: 0.95, display: "flex", flexDirection: "column", gap: "3mm" }}>
              <CsCommercialComparison data={data} />
              <CsTechnicalSummary data={data} />
              <CsDeliveryComparison data={data} />
            </div>
            <div style={{ flex: 1.25 }}>
              <CsBuyerEvaluationSummary data={data} />
            </div>
            <div style={{ flex: 1.1 }}>
              <CsRecommendationPanel data={data} />
            </div>
          </div>
          <div style={{ marginTop: "3mm" }}>
            <CsSignatures approvals={data.approvals} heading="Procurement Committee Approval" />
          </div>
        </CsSheet>
      </div>
    </div>
  );
}
