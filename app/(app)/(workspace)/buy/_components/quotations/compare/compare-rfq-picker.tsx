// Compare Quotes — the RFQ selector. SERVER Component (pure function of props).
//
// ────────────────────────────────────────────────────────────────────────────────────────────────
// WHY A PICKER AND NOT A CROSS-RFQ GRID
// ────────────────────────────────────────────────────────────────────────────────────────────────
// Comparison is ALWAYS scoped to one RFQ. Quotations answer different specifications, so laying two
// RFQs' quotes side by side is not a comparison — it is an invitation to read on price alone, one step
// from the cross-vendor leaderboard the corpus forbids everywhere (R6: comparison is descriptive and
// never recommends). The frozen `get_comparison_statement` read is likewise scoped to a single RFQ.
//
// So this page selects an RFQ and opens its EXISTING per-RFQ comparison in place. It needs no new
// comparison contract, and it duplicates no comparison UI — the workspace below the picker is the same
// built component the `/buy/rfqs/[rfqId]/compare` route renders.
//
// Selecting a different RFQ intentionally drops any `?sel=` from the URL: a selection is a set of
// quotation ids belonging to the previous RFQ and is meaningless against another one.
//
// GOVERNANCE: eligibility and its reason are SERVER facts (GI-10) — nothing here decides them. Options
// render in the server's order; the picker never re-ranks them, and an ineligible RFQ is shown with a
// plain reason rather than hidden (hiding it would read as "something happened to this RFQ").
//
// A11y: the selected option carries `aria-current="true"`; ineligible options are non-interactive with
// their reason as real text, not a title-attribute-only hint.

import Link from "next/link";
import { cn } from "@/frontend/lib/cn";
import { Ref } from "../../format";
import type { ComparableRfqOption } from "../org-quotation-view-models";

export function CompareRfqPicker({
  options,
  selectedRfqId,
}: {
  options: ComparableRfqOption[];
  selectedRfqId?: string;
}) {
  return (
    <section aria-labelledby="cq-picker-heading" className="flex flex-col gap-3">
      <h2 id="cq-picker-heading" className="text-sm font-semibold text-foreground">
        Select an RFQ
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <li key={option.rfqId} className="min-w-0">
            {option.eligible ? (
              <Link
                href={`/buy/quotations/compare?rfq=${encodeURIComponent(option.rfqId)}`}
                aria-current={option.rfqId === selectedRfqId ? "true" : undefined}
                className={cn(
                  "flex h-full min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-4 transition-colors duration-150 ease-iv-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  option.rfqId === selectedRfqId
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-accent/40",
                )}
              >
                <Ref>{option.humanRef}</Ref>
                <span className="line-clamp-2 text-sm font-medium text-foreground">
                  {option.title}
                </span>
                <span className="mt-auto pt-1 text-xs text-muted-foreground">
                  {option.quotationCount} quotations
                </span>
              </Link>
            ) : (
              <div
                aria-disabled="true"
                className="flex h-full min-w-0 flex-col gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 p-4"
              >
                <Ref>{option.humanRef}</Ref>
                <span className="line-clamp-2 text-sm font-medium text-muted-foreground">
                  {option.title}
                </span>
                <span className="mt-auto pt-1 text-xs text-muted-foreground">
                  {option.ineligibleReason}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
