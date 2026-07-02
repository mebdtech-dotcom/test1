// P-BUY-15 Buyer Supplier Comparison — host view (`T-ANALYTICS`, Doc-7F · planning → PI §13). Pure function
// of its view-model (Server Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route
// page resolves the comparison via the wired `rfq.get_comparison_statement.v1` (Doc-4E §E8.6, GI-02) —
// PARKED until the M3 backend lands (Wave 4).
//
// REUSE: the canonical platform-shell `PageHeader` + `Breadcrumbs`, the comparison Summary/Table/Empty
// compositions (which themselves reuse the shared `DataListTable` + kit `Card`/`StatusChip`/`EmptyState`).
//
// GOVERNANCE (the comparison MOAT — most R6-sensitive buyer screen):
//  • R6 / Inv #12 — PURELY DESCRIPTIVE. No compare-to-winner, no recommended/best/lowest cue, no award
//    affordance (Award is the separate, deliberate P-BUY-17). Suppliers render in System order, never re-ranked.
//  • Inv #11 / GI-12 — VISIBILITY-GATED: `null` ⇒ not-found ≡ genuine absence (byte-identical; breadcrumb
//    shows only the `RFQs` ancestor). Empty suppliers ⇒ "awaiting responses" (never implies exclusion).

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader, Breadcrumbs } from "../../../_components/shell";
import { ComparisonSummary } from "./comparison-summary";
import { ComparisonTable } from "./comparison-table";
import { ComparisonEmpty } from "./comparison-empty";
import type { ComparisonData } from "./comparison-view-models";

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). Breadcrumb shows only the `RFQs` ancestor. */
function NotFoundState() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
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
    </div>
  );
}

export function ComparisonView({ data }: { data: ComparisonData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
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
      />
      {data.suppliers.length === 0 ? (
        <ComparisonEmpty />
      ) : (
        <div className="flex flex-col gap-4">
          <ComparisonSummary data={data} />
          <ComparisonTable suppliers={data.suppliers} />
        </div>
      )}
    </div>
  );
}
