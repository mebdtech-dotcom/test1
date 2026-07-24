"use client";

// Received Quotes — filter bar. The ONLY client component on the list: it writes the durable view state
// (`?search=` · `?state=` · `?rfq=`) and the SERVER re-renders the filtered rows. Nothing is filtered in
// the browser's own copy of the data, so what you see always matches what the server resolved.
//
// GOVERNANCE:
//  • The chip counts are the SERVER's per-state figures (R7) — this component displays them and counts
//    nothing itself.
//  • The RFQ options are the SERVER's facet set — the client invents no facet and can address no RFQ
//    outside its own org's disclosed set.
//  • Only the three allow-listed keys are ever written (`buildReceivedQuotesQueryString` rebuilds the
//    query from scratch), so no private or unrelated value can leak into the URL (Inv #11).
//  • Sorting is deliberately NOT offered: the contract order is authoritative and the UI never re-ranks
//    the matching set (R6 / GI-04).
//
// A11y: the search field is labelled; state chips are toggle buttons carrying `aria-pressed`; the RFQ
// filter is a native labelled `<select>` (keyboard- and screen-reader-native, and no new primitive is
// invented for it). Busy state is announced politely while the server round-trips.

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { cn } from "@/frontend/lib/cn";
import { quotationStateDisplay } from "../../state-display";
import type { QuotationState } from "../../view-models";
import type { QuotationRfqFacet } from "../org-quotation-view-models";
import {
  BUYER_VISIBLE_QUOTATION_STATES,
  buildReceivedQuotesQueryString,
  type ReceivedQuotesQuery,
} from "../query-state";

/** Debounce for the search field — long enough to avoid a round-trip per keystroke. */
const SEARCH_DEBOUNCE_MS = 300;

export function QuotationFilters({
  query,
  perStateCounts,
  rfqFacets,
  totalCount,
}: {
  query: ReceivedQuotesQuery;
  perStateCounts: Partial<Record<QuotationState, number>>;
  rfqFacets: QuotationRfqFacet[];
  /** Server-supplied total across the org scope — the "All" chip's count. */
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchDraft, setSearchDraft] = useState(query.search);

  // The URL is the source of truth: re-sync the draft whenever it changes underneath us (back/forward,
  // or a reset from an empty state). Comparing first keeps typing from being clobbered mid-flight.
  useEffect(() => {
    setSearchDraft(query.search);
  }, [query.search]);

  const commit = useCallback(
    (next: ReceivedQuotesQuery) => {
      const qs = buildReceivedQuotesQueryString(next);
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname],
  );

  // Debounced search commit. Skips when the draft already matches the URL, so a server round-trip or a
  // back/forward navigation can never bounce the value back and forth.
  useEffect(() => {
    if (searchDraft === query.search) return;
    const timer = setTimeout(() => {
      commit({ ...query, search: searchDraft.trim() });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchDraft, query, commit]);

  const states = BUYER_VISIBLE_QUOTATION_STATES.filter((s) => (perStateCounts[s] ?? 0) > 0);

  return (
    <div className="flex flex-col gap-3" data-pending={isPending ? "" : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            aria-label="Search received quotes by vendor, quotation reference or RFQ"
            placeholder="Search vendor, RFQ or reference"
            className="pl-8"
          />
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <label htmlFor="rq-rfq-filter" className="shrink-0 text-sm text-muted-foreground">
            RFQ
          </label>
          <select
            id="rq-rfq-filter"
            value={query.rfqId ?? ""}
            onChange={(e) =>
              commit({ ...query, rfqId: e.target.value === "" ? null : e.target.value })
            }
            className="h-9 min-w-0 max-w-[18rem] truncate rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All RFQs</option>
            {rfqFacets.map((facet) => (
              <option key={facet.rfqId} value={facet.rfqId}>
                {facet.humanRef} — {facet.title}
              </option>
            ))}
          </select>
        </div>

        {/* Polite busy hint — the table below is replaced by the server, not by client filtering. */}
        <span aria-live="polite" className="sr-only">
          {isPending ? "Updating received quotes" : ""}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by quotation state">
        <StateChip
          label="All"
          count={totalCount}
          pressed={query.state === "all"}
          onClick={() => commit({ ...query, state: "all" })}
        />
        {states.map((state) => (
          <StateChip
            key={state}
            label={quotationStateDisplay(state).label}
            count={perStateCounts[state] ?? 0}
            pressed={query.state === state}
            onClick={() => commit({ ...query, state })}
          />
        ))}
      </div>
    </div>
  );
}

/** A state toggle. `aria-pressed` carries selection to AT — never colour alone (GI-06). */
function StateChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ease-iv-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent",
      )}
    >
      {label}
      <span className={cn("tabular-nums", pressed ? "opacity-80" : "text-foreground/60")}>
        {count}
      </span>
    </button>
  );
}
