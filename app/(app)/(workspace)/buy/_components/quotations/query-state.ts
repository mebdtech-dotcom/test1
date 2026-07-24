// Buyer Workspace — Received Quotes URL query state (PURE; server-usable, no "use client").
//
// The list's durable view state lives in the URL (`?search=` · `?state=` · `?rfq=`) so a filtered view is
// linkable, bookmarkable and survives back/forward. This module is the single parser + filter, shared by
// the SERVER page (which renders the filtered rows) and the CLIENT filter bar (which writes the URL), so
// both always agree on what the query means.
//
// GOVERNANCE:
//  • Every URL value is VALIDATED against a server-supplied domain before use. An unknown state or an RFQ
//    id that is not in the buyer's own facet set falls back to "no filter" — a stale or hand-edited URL can
//    never silently render an empty list that reads as "you have no quotations" (or, worse, be used to
//    probe which RFQ ids exist). Client-side validation is UX only; the server read remains org-scoped and
//    visibility-gated regardless of what the URL asks for.
//  • Filtering NEVER re-orders. The contract-governed order is preserved by construction (`filter` keeps
//    input order) — the UI must never re-rank the matching set (R6 / GI-04).
//  • Filtering is a PRESENTATION narrowing of the already-disclosed page. It never changes the tile
//    figures, which stay server-computed over the whole org scope (R7).
//  • Nothing private is ever encoded here — only the three keys below are allowed in the URL (Inv #11).

import type { QuotationState } from "../view-models";
import type { BuyerOrgQuotationItem } from "./org-quotation-view-models";

/**
 * The buyer-visible frozen quotation states (Doc-4M §5.3), verbatim and in lifecycle order.
 * `draft` is deliberately ABSENT: a vendor's draft is vendor-private and is never disclosed to the buyer,
 * so it can be neither a row nor a filter option.
 */
export const BUYER_VISIBLE_QUOTATION_STATES: readonly QuotationState[] = [
  "submitted",
  "shortlisted",
  "selected",
  "not_selected",
  "withdrawn",
  "expired",
];

/** `"all"` = no state narrowing (the default). */
export type QuotationStateFilter = QuotationState | "all";

export interface ReceivedQuotesQuery {
  /** Free-text narrowing over already-disclosed display fields. Empty string = no search. */
  search: string;
  /** A frozen buyer-visible state, or `"all"`. */
  state: QuotationStateFilter;
  /** An opaque RFQ id from the server-supplied facet set, or `null` for all RFQs. */
  rfqId: string | null;
}

/** The no-filter query — also the safe fallback for any malformed input. */
export const EMPTY_RECEIVED_QUOTES_QUERY: ReceivedQuotesQuery = {
  search: "",
  state: "all",
  rfqId: null,
};

/** Defensive cap so a pathological URL cannot push an unbounded string through the filter. */
const MAX_SEARCH_LENGTH = 120;

/** Next.js hands a repeated query key through as `string[]`; take the first and ignore the rest. */
function firstParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Parse raw searchParams into a validated query.
 *
 * `knownRfqIds` is the SERVER-supplied facet set for this buyer org — an id outside it is discarded rather
 * than trusted, so the URL can never widen scope or be used to probe for foreign RFQ ids.
 */
export function parseReceivedQuotesQuery(
  params: { search?: string | string[]; state?: string | string[]; rfq?: string | string[] },
  knownRfqIds: readonly string[],
): ReceivedQuotesQuery {
  const rawSearch = firstParam(params.search) ?? "";
  const rawState = firstParam(params.state);
  const rawRfq = firstParam(params.rfq);

  const state: QuotationStateFilter =
    rawState !== undefined &&
    (BUYER_VISIBLE_QUOTATION_STATES as readonly string[]).includes(rawState)
      ? (rawState as QuotationState)
      : "all";

  const rfqId = rawRfq !== undefined && knownRfqIds.includes(rawRfq) ? rawRfq : null;

  return {
    search: rawSearch.trim().slice(0, MAX_SEARCH_LENGTH),
    state,
    rfqId,
  };
}

/** True when the query narrows the list at all — distinguishes "no results" from "nothing received". */
export function hasActiveFilters(query: ReceivedQuotesQuery): boolean {
  return query.search !== "" || query.state !== "all" || query.rfqId !== null;
}

/**
 * Narrow the delivered rows by the query, PRESERVING the contract-governed order (`filter` is order-stable
 * — the UI never re-ranks, R6 / GI-04). Search matches only fields already disclosed on the row.
 */
export function filterReceivedQuotes(
  items: readonly BuyerOrgQuotationItem[],
  query: ReceivedQuotesQuery,
): BuyerOrgQuotationItem[] {
  const needle = query.search.toLowerCase();
  return items.filter((item) => {
    if (query.state !== "all" && item.state !== query.state) return false;
    if (query.rfqId !== null && item.rfqId !== query.rfqId) return false;
    if (needle !== "") {
      const haystack = [item.vendorName, item.humanRef, item.rfqHumanRef, item.rfqTitle]
        .filter((part): part is string => typeof part === "string")
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

/**
 * Serialize a query back to a canonical query string (default values omitted, stable key order) so the
 * filter bar's writes are deterministic and a no-filter view has a clean URL.
 */
export function buildReceivedQuotesQueryString(query: ReceivedQuotesQuery): string {
  const next = new URLSearchParams();
  if (query.search !== "") next.set("search", query.search);
  if (query.state !== "all") next.set("state", query.state);
  if (query.rfqId !== null) next.set("rfq", query.rfqId);
  return next.toString();
}
