// Buyer sidebar IA (BX-04) — "Compare Quotes" (Quotations group). A Next.js SERVER COMPONENT: App Router
// composition only (REPOSITORY_STRUCTURE §8).
//
// ────────────────────────────────────────────────────────────────────────────────────────────────
// WHAT THIS PAGE IS — AND WHY IT NEEDS NO NEW CONTRACT
// ────────────────────────────────────────────────────────────────────────────────────────────────
// This is an RFQ SELECTOR that opens the EXISTING per-RFQ comparison in place. It is not a second
// comparison implementation: below the picker it mounts the very same built Comparison Workspace that
// `/buy/rfqs/[rfqId]/compare` renders (provider → gating initializer → workspace), so there is exactly
// one comparison surface in the product.
//
// Comparison stays scoped to ONE RFQ. A cross-RFQ grid is deliberately absent: quotations answer
// different specifications, so mixing them is not comparable and sits one step from the cross-vendor
// leaderboard the corpus forbids (R6 — comparison is descriptive and never recommends). Because the
// frozen `get_comparison_statement` read is already RFQ-scoped, this page needs NO new comparison
// contract — only the picker's option set, which comes through the adapter seam.
//
// The 2–5 selection is enforced by the SHARED pure `normalizeSelection` (MIN_COMPARE/MAX_COMPARE) — the
// same function the client provider uses, so the server and client never disagree about the displayed
// subset. Fewer than 2 valid ids falls back to the frozen default selection; more than 5 is capped.
//
// URL STATE: `?rfq=` (opaque RFQ id, validated against the server's own option set) and `?sel=` (the
// ephemeral 2–5 quotation selection). Both are presentation-only. Buyer-authored content — evaluation,
// recommendation, exclusion reasons, procurement purpose, signatory names — is NEVER serialized to the
// URL (Inv #11); it lives only in the workspace provider's session-local state.
//
// The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import type { ReactNode } from "react";
import { rfqWorkflowData } from "../../../../_components/rfq-workflow";
import { PageHeader } from "../../../../_components/shell";
import {
  buildWorkspaceData,
  defaultSelection,
  normalizeSelection,
  parseSelParam,
  toInitializeInput,
  ComparisonWorkspace,
  ComparisonWorkspaceInitializer,
  ComparisonWorkspaceStateProvider,
} from "../../_components/comparison-workspace";
import { CompareRfqPicker } from "../../_components/quotations/compare/compare-rfq-picker";
import {
  CompareNothingComparable,
  CompareNoRfqSelected,
  CompareNotEligible,
  CompareUnavailable,
  CompareQuotesError,
} from "../../_components/quotations/compare/compare-quotes-states";
import "../../_components/comparison-document/comparison-document.css";

export const metadata = {
  title: "Compare Quotes",
};

const PAGE_DESCRIPTION =
  "Pick an RFQ to lay its quotations side by side. Comparison is always within one RFQ — quotations answering different requests aren't comparable.";

/** Next.js hands a repeated query key through as `string[]`; take the first and ignore the rest. */
function firstParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CompareQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ rfq?: string | string[]; sel?: string | string[] }>;
}) {
  const { rfq, sel } = await searchParams;

  const options = await rfqWorkflowData.buyer.listComparableRfqs();
  // `null` = read failure / no authoritative integration — never rendered as "nothing to compare".
  if (!options) {
    return (
      <>
        <PageHeader title="Compare Quotes" description={PAGE_DESCRIPTION} />
        <CompareQuotesError />
      </>
    );
  }

  if (options.length === 0) {
    return (
      <>
        <PageHeader title="Compare Quotes" description={PAGE_DESCRIPTION} />
        <CompareNothingComparable />
      </>
    );
  }

  // Validate the requested RFQ against the SERVER's own option set. An unknown, stale or hand-edited id
  // degrades to "no RFQ selected" — it never reaches a read, so the URL cannot be used to probe for or
  // address an RFQ outside this buyer org's disclosed set.
  const requestedRfqId = firstParam(rfq);
  const selectedOption = options.find((option) => option.rfqId === requestedRfqId) ?? null;

  const shell = (body: ReactNode) => (
    <>
      <PageHeader title="Compare Quotes" description={PAGE_DESCRIPTION} />
      <div className="flex flex-col gap-6">
        <CompareRfqPicker options={options} selectedRfqId={selectedOption?.rfqId} />
        {body}
      </div>
    </>
  );

  if (!selectedOption) return shell(<CompareNoRfqSelected />);
  if (!selectedOption.eligible) {
    return shell(<CompareNotEligible reason={selectedOption.ineligibleReason} />);
  }

  const rfqId = selectedOption.rfqId;
  const comparison = await rfqWorkflowData.buyer.getComparison(rfqId);
  // Eligible per the option set but the comparison did not resolve (or has no disclosed suppliers) —
  // recoverable, and never papered over with a fabricated comparison.
  if (!comparison || comparison.suppliers.length === 0) return shell(<CompareUnavailable />);

  const disclosedIds = comparison.suppliers.map((s) => s.quotationId);
  // The shared 2–5 enforcement: unknown/duplicate ids dropped, System order restored, capped at
  // MAX_COMPARE, and a sub-minimum request falls back to the frozen default selection.
  const selectedIds = normalizeSelection(
    parseSelParam(sel),
    disclosedIds,
    defaultSelection(disclosedIds),
  );

  const statement = await rfqWorkflowData.buyer.getComparativeStatement(rfqId, selectedIds);
  if (!statement) return shell(<CompareUnavailable />);

  const data = buildWorkspaceData(rfqId, comparison, statement, selectedIds);

  return shell(
    // `key={rfqId}` remounts the workspace when the buyer switches RFQ, so no selection, evaluation or
    // note can bleed from one RFQ's comparison into another's.
    <ComparisonWorkspaceStateProvider key={rfqId} rfqId={rfqId}>
      <ComparisonWorkspaceInitializer input={toInitializeInput(data)}>
        <ComparisonWorkspace data={data} />
      </ComparisonWorkspaceInitializer>
    </ComparisonWorkspaceStateProvider>,
  );
}
