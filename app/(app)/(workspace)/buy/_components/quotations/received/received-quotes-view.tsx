// Received Quotes — page composition. SERVER Component: a pure function of the resolved snapshot, the
// validated query and the server-filtered rows. It owns no state and performs no fetch (Inv #9).
//
// The populated branch composes: server-computed tiles → the client filter bar → the governed-order table.
// The two empty branches are chosen by CAUSE, never by row count alone (see `received-quotes-states`).

import { Card, CardContent } from "@/frontend/primitives/card";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../../../../_components/shell";
import { QuotationSummaryTiles } from "./quotation-summary-tiles";
import { QuotationFilters } from "./quotation-filters";
import { ReceivedQuotesTable } from "./received-quotes-table";
import { ReceivedQuotesFirstRun, ReceivedQuotesNoMatches } from "./received-quotes-states";
import type {
  BuyerOrgQuotationListData,
  BuyerOrgQuotationItem,
} from "../org-quotation-view-models";
import { hasActiveFilters, type ReceivedQuotesQuery } from "../query-state";

export function ReceivedQuotesView({
  data,
  query,
  rows,
}: {
  data: BuyerOrgQuotationListData;
  query: ReceivedQuotesQuery;
  /** Server-filtered rows, still in the contract-governed order. */
  rows: BuyerOrgQuotationItem[];
}) {
  // Genuine emptiness is a property of the ORG SCOPE (the unfiltered read), never of the filtered view.
  const receivedNothing = data.items.length === 0;
  const filtered = hasActiveFilters(query);

  return (
    <>
      <PageHeader
        title="Received Quotes"
        description="Every quotation vendors have submitted across your organization's RFQs, in one place. Disclosed quotations only — nothing here is ranked."
      />

      {receivedNothing ? (
        <ReceivedQuotesFirstRun />
      ) : (
        <div className="flex flex-col gap-4">
          <QuotationSummaryTiles counts={data.stateCounts} />

          <QuotationFilters
            query={query}
            perStateCounts={data.perStateCounts}
            rfqFacets={data.rfqFacets}
            totalCount={data.total ?? data.items.length}
          />

          <Card>
            <CardContent className="p-0">
              <ReceivedQuotesTable
                rows={rows}
                emptyState={
                  <div className="p-4">
                    {/* Only reachable with filters applied — the unfiltered set is non-empty here. */}
                    {filtered ? <ReceivedQuotesNoMatches /> : <ReceivedQuotesFirstRun />}
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Cursor pagination (GI-03) — opaque cursor; the total renders only if the contract gives one. */}
          <PaginationControl
            hasMore={Boolean(data.nextCursor)}
            label={typeof data.total === "number" ? `${data.total} total` : undefined}
          />
        </div>
      )}
    </>
  );
}
