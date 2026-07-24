// Received Quotes — the listing table. SERVER Component (pure function of props).
//
// GOVERNANCE:
//  • Rows render in the caller-supplied CONTRACT-GOVERNED order and are never re-ranked or re-sorted
//    (R6 / GI-04). There is no sort control, no "best value" column, no winner emphasis and no
//    lowest-price highlight — a cross-RFQ list is exactly where a vendor leaderboard would creep in.
//  • `not_selected` / `withdrawn` render uniformly and NON-PENALIZINGLY (Doc-3 §8.3/§9.5) — the chip
//    tone comes from the shared frozen-state mapping, never from a judgement made here.
//  • An absent amount renders as "not provided", never as zero (a fabricated 0 would be a false
//    commercial claim). No total is summed across rows — a client-computed total could also leak the
//    size of the withheld set (R7 / GI-12).
//  • Rows link by OPAQUE id into the already-built per-RFQ surfaces (P-BUY-14 detail, P-BUY-15
//    comparison) — this aggregate accelerates navigation, it does not replace those pages.
//
// A11y: semantic table via the shared `DataListTable` (sr-only caption, `scope="col"` headers). The
// expiring-soon cue pairs an icon + text with the colour, never colour alone (GI-06).

import Link from "next/link";
import { Clock } from "lucide-react";
import { StatusChip } from "@/frontend/components/status-chip";
import { DataListTable, type DataColumn } from "../../data-list-table";
import { Money, Ref, formatDate } from "../../format";
import { quotationStateDisplay } from "../../state-display";
import type { BuyerOrgQuotationItem } from "../org-quotation-view-models";

const COLUMNS: DataColumn<BuyerOrgQuotationItem>[] = [
  {
    key: "quotation",
    header: "Quotation",
    render: (q) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-foreground">{q.vendorName}</span>
        {q.humanRef ? <Ref>{q.humanRef}</Ref> : null}
      </span>
    ),
  },
  {
    key: "rfq",
    header: "RFQ",
    hideOnMobile: true,
    render: (q) => (
      <span className="flex min-w-0 flex-col">
        <Link
          href={`/buy/rfqs/${q.rfqId}`}
          className="truncate text-foreground underline-offset-2 hover:underline"
        >
          {q.rfqTitle}
        </Link>
        <Ref>{q.rfqHumanRef}</Ref>
      </span>
    ),
  },
  {
    key: "state",
    header: "Status",
    render: (q) => {
      const s = quotationStateDisplay(q.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  {
    key: "amount",
    header: "Quoted price",
    numeric: true,
    render: (q) =>
      q.amount ? (
        <Money value={q.amount} />
      ) : (
        // Honest absence — never a fabricated zero.
        <span className="text-muted-foreground">Not provided</span>
      ),
  },
  {
    key: "validUntil",
    header: "Valid until",
    numeric: true,
    hideOnMobile: true,
    render: (q) => (
      <span className="flex flex-col items-end">
        <span className="text-muted-foreground">
          {q.validUntil ? formatDate(q.validUntil) : "—"}
        </span>
        {q.expiringSoon ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-2xs font-medium text-iv-warning-muted dark:text-iv-warning-text">
            <Clock aria-hidden className="size-3" />
            Expiring soon
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: "received",
    header: "Received",
    numeric: true,
    hideOnMobile: true,
    render: (q) => (
      <span className="text-muted-foreground">
        {q.submittedAt ? formatDate(q.submittedAt) : "—"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    numeric: true,
    render: (q) =>
      // Compare is offered only when the SERVER says this RFQ has enough disclosed quotations to
      // compare (GI-10) — the client never decides eligibility.
      q.comparable ? (
        <Link
          href={`/buy/quotations/compare?rfq=${encodeURIComponent(q.rfqId)}`}
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Compare
          <span className="sr-only"> quotations for {q.rfqHumanRef}</span>
        </Link>
      ) : null,
  },
];

export function ReceivedQuotesTable({
  rows,
  emptyState,
}: {
  rows: BuyerOrgQuotationItem[];
  emptyState: React.ReactNode;
}) {
  return (
    <DataListTable
      caption="Received quotations"
      columns={COLUMNS}
      rows={rows}
      getRowKey={(q) => q.id}
      getRowHref={(q) => `/buy/rfqs/${q.rfqId}/quotations/${q.id}`}
      emptyState={emptyState}
    />
  );
}
