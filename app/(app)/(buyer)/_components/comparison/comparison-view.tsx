// P-BUY-15 Buyer Supplier Comparison — host view (`T-ANALYTICS`, Doc-7F · planning → PI §13). Pure function
// of its view-model (Server Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route
// page resolves the comparison via the wired `rfq.get_comparison_statement.v1` (Doc-4E §E8.6, GI-02) —
// PARKED until the M3 backend lands (Wave 4).
//
// REUSE: the canonical platform-shell `PageHeader` + `Breadcrumbs`, and the `ComparisonSummary`/
// `ComparisonTable`/`ComparisonEmpty` compositions — PROMOTED to the Doc-7B kit at
// `@/frontend/components/comparison` (Shared Platform Component Registry §4.2 CTO override —
// 2026-07-03). This host stays here as the buyer-scoped page adapter: it owns the route's data
// resolution and not-found handling; the kit owns the comparison presentation.
//
// GOVERNANCE (the comparison MOAT — most R6-sensitive buyer screen):
//  • R6 / Inv #12 — PURELY DESCRIPTIVE. No compare-to-winner, no recommended/best/lowest cue, no award
//    affordance (Award is the separate, deliberate P-BUY-17). Suppliers render in System order, never re-ranked.
//  • Inv #11 / GI-12 — VISIBILITY-GATED: `null` ⇒ not-found ≡ genuine absence (byte-identical; breadcrumb
//    shows only the `RFQs` ancestor). Empty suppliers ⇒ "awaiting responses" (never implies exclusion).
//  • COMPARE_SHEET_UX_FREEZE header v1.0 W-2.4 — the "Comparative Statement" affordance (≥ 2 disclosed
//    quotations, W-1 minimum): plain GET navigation to the CS print view, a DOCUMENT rendering of this
//    same statement. It carries no selection yet (the W-1 picker is WP-2 follow-on scope) → the CS
//    renders the full disclosed set (D1 conformance note).

import Link from "next/link";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader, Breadcrumbs } from "../../../_components/shell";
import {
  ComparisonSummary,
  ComparisonTable,
  ComparisonEmpty,
  type ComparisonData,
} from "@/frontend/components/comparison";

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). Breadcrumb shows only the `RFQs` ancestor. */
function NotFoundState() {
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">Comparison not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Comparison not found"
        description="This comparison doesn't exist or isn't available."
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

export function ComparisonView({ data }: { data: ComparisonData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: data.humanRef ?? "RFQ", href: `/rfqs/${data.rfqId}` },
          { label: "Comparison" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Supplier comparison"
        meta={<span className="text-xs text-muted-foreground">Descriptive · not ranked</span>}
        actions={
          data.suppliers.length >= 2 ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/rfqs/${data.rfqId}/comparative-statement`}>
                <Printer aria-hidden /> Comparative Statement
              </Link>
            </Button>
          ) : undefined
        }
      />
      {data.suppliers.length === 0 ? (
        <ComparisonEmpty />
      ) : (
        <div className="flex flex-col gap-4">
          <ComparisonSummary data={data} />
          <ComparisonTable suppliers={data.suppliers} />
        </div>
      )}
    </>
  );
}
