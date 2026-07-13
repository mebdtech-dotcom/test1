// P-BUY-09 Buyer RFQ-detail — Quotations tab (`T-LISTING`, Doc-7F §3.1/§4.2/§10 Section 2). The list of
// received quotations for one RFQ. PRESENTATION-ONLY: a pure function of its view-model (Server Component;
// no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The detail host page resolves the quotation
// set via the wired `list_quotations_for_rfq` (GI-02) — an INDEPENDENTLY streamed read (§11.4) — and
// passes it here; PARKED until the M3 backend lands.
//
// REUSE: the shared buyer `DataListTable` (the single listing table), the kit `StatusChip`/`EmptyState`/
// `PaginationControl`, and the shared `Money`/`quotationStateDisplay`.
//
// GOVERNANCE (load-bearing):
//  • Rows render in the caller-supplied GOVERNED order — the UI NEVER re-ranks the matching set (R6/GI-04).
//  • VISIBILITY-GATED: the server returns only DISCLOSED quotations (out-of-scope → NOT_FOUND server-side,
//    never a client 404). An empty list reads as "awaiting vendor responses" — it must NEVER imply a
//    vendor was excluded/deferred (Inv #11 / GI-12); no client count of withheld quotes.
//  • The buyer sees each disclosed quotation's REAL values (Doc-3 §9.1). `not_selected`/`withdrawn` render
//    uniformly and NON-PENALIZINGLY (Doc-3 §8.3/§9.5).
//  • "Compare quotations" CTA per COMPARE_SHEET_UX_FREEZE header v1.0 W-2.1 (the freeze superseded this
//    file's earlier no-Compare deferral): visible when ≥ 1 disclosed quotation exists; at exactly 1 it
//    opens the single-column statement view (W-6). Plain GET navigation to P-BUY-15 — still NO
//    "recommended"/winner cue anywhere here (R6 / Inv #12). Rows open the quotation detail (P-BUY-14).

import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { DataListTable, type DataColumn } from "../../_components/data-list-table";
import { Money, formatDate } from "../../_components/format";
import { quotationStateDisplay } from "../../_components/state-display";
import type { QuotationListData, QuotationListItem } from "../../_components/rfq-view-models";

function columns(): DataColumn<QuotationListItem>[] {
  return [
    {
      key: "vendor",
      header: "Vendor",
      render: (q) => <span className="truncate font-medium text-foreground">{q.vendorName}</span>,
    },
    {
      key: "state",
      header: "Status",
      render: (q) => {
        const s = quotationStateDisplay(q.state);
        return <StatusChip label={s.label} tone={s.tone} />;
      },
    },
    { key: "amount", header: "Amount", numeric: true, render: (q) => <Money value={q.amount} /> },
    {
      key: "valid",
      header: "Valid until",
      numeric: true,
      hideOnMobile: true,
      render: (q) => (
        <span className="text-muted-foreground">
          {q.validUntil ? formatDate(q.validUntil) : "—"}
        </span>
      ),
    },
    {
      key: "submitted",
      header: "Received",
      numeric: true,
      hideOnMobile: true,
      render: (q) => (
        <span className="text-muted-foreground">
          {q.submittedAt ? formatDate(q.submittedAt) : "—"}
        </span>
      ),
    },
  ];
}

export function QuotationsTab({ data, rfqId }: { data: QuotationListData | null; rfqId: string }) {
  const items = data?.items ?? [];

  if (items.length === 0) {
    // Visibility-gated contract-empty — must read as "awaiting responses", never imply exclusion (Inv #11).
    return (
      <EmptyState
        title="No quotations yet"
        description="Awaiting vendor responses to this RFQ."
        className="py-12"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* W-2.1 primary CTA — the comparison surface is the freeze-ruled destination for evaluation. */}
      <div className="flex justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/buy/rfqs/${rfqId}/compare`}>
            <Scale aria-hidden /> Compare quotations
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataListTable
            caption="Quotations received"
            columns={columns()}
            rows={items}
            getRowKey={(q) => q.id}
            getRowHref={(q) => `/buy/rfqs/${rfqId}/quotations/${q.id}`}
            emptyState={
              <div className="p-4">
                <EmptyState title="No quotations match" className="py-8" />
              </div>
            }
          />
        </CardContent>
      </Card>
      {/* Cursor pagination (GI-03); handlers attach at the data-wiring milestone. */}
      <PaginationControl
        hasMore={Boolean(data?.nextCursor)}
        label={typeof data?.total === "number" ? `${data.total} total` : undefined}
      />
    </div>
  );
}
