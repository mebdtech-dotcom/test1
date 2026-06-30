// ResultsGrid (Doc-7B kit, App tier; promoted from the Public surface after M2.2). PRESENTATION-ONLY
// responsive results container: a grid of result cards + a contract empty state + an optional footer
// slot (e.g. cursor pagination). ONE canonical implementation for every listing surface (Search will
// build on this, not a public-local copy).
//
// GOVERNANCE: `count` drives the empty branch — it is the number of items the surface passed, NEVER a
// fabricated/client-computed total (GI-03). An empty result renders the contract empty state, byte-
// identical to genuine absence (Invariant #11; GI-05/GI-12) — it never hints at a filtered-out vendor.
import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { EmptyState } from "./empty-state";
import { cn } from "../lib/cn";

export interface ResultsGridProps {
  /** The result cards. */
  children: ReactNode;
  /** Number of items rendered (drives the empty branch). NOT a total — no count is displayed. */
  count: number;
  /** Grid column classes; defaults to a card-friendly responsive grid. */
  columnsClassName?: string;
  /** Empty-state node the surface supplies; defaults to a neutral "no results" state. */
  empty?: ReactNode;
  /** Footer slot — e.g. <PaginationControl/>. Only rendered when there are results. */
  footer?: ReactNode;
  className?: string;
}

export function ResultsGrid({
  children,
  count,
  columnsClassName = "grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
  empty,
  footer,
  className,
}: ResultsGridProps) {
  if (count === 0) {
    return (
      <div className={className}>
        {empty ?? (
          <EmptyState
            icon={<SearchX aria-hidden="true" />}
            title="No results to show"
            description="Try a different category or broaden your filters."
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className={cn("grid", columnsClassName)}>{children}</div>
      {footer ? <div>{footer}</div> : null}
    </div>
  );
}
