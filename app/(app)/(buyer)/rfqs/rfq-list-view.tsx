// P-BUY-06 Buyer RFQ list — PRESENTATION (`T-LISTING`, Doc-7F §3.1/§10 Section 2). Pure function of its
// view-model (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The
// server page resolves the data via the Doc-7C wired data layer (`list_rfqs`, GI-02) and passes it here.
//
// REUSE: the canonical platform-shell `PageHeader` owns the page `<h1>` (one shell, every workspace);
// the shared `DataListTable` renders the rows; the kit `PaginationControl` does cursor pagination.
//
// State plan (§II.6): `null`/empty → contract-empty drives the first-RFQ "Create RFQ" CTA. Cursor
// pagination only (GI-03) — opaque cursor, no offset/page numbers, `total` only if contract-provided.
//
// GOVERNANCE: rows render in the caller-supplied (governed contract) order — never re-ranked (GI-04/R6).
// `humanRef` is a DISPLAY label; rows link by OPAQUE id (Inv #5 own-org). Terminal/expired RFQs are shown
// as a Doc-4M status chip, never hidden. Row write-actions are NOT offered here; the row links to the
// detail host (P-BUY-08) where Doc-4M-permitted actions surface (GI-10).

import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../_components/shell";
import { DataListTable, type DataColumn } from "../_components/data-list-table";
import { ListToolbar } from "../_components/list-toolbar";
import { formatDate, Money, Ref } from "../_components/format";
import { rfqStateDisplay } from "../_components/state-display";
import type { RfqListData, RfqListItem } from "../_components/rfq-view-models";

const RFQ_COLUMNS: DataColumn<RfqListItem>[] = [
  {
    key: "rfq",
    header: "RFQ",
    render: (r) => (
      <span className="flex flex-col">
        <span className="truncate font-medium text-foreground">{r.title}</span>
        <Ref>{r.humanRef}</Ref>
      </span>
    ),
  },
  {
    key: "category",
    header: "Category",
    hideOnMobile: true,
    render: (r) => <span className="text-muted-foreground">{r.category ?? "—"}</span>,
  },
  {
    key: "state",
    header: "Status",
    render: (r) => {
      const s = rfqStateDisplay(r.state);
      return <StatusChip label={s.label} tone={s.tone} />;
    },
  },
  { key: "value", header: "Value", numeric: true, render: (r) => <Money value={r.value} /> },
  {
    key: "updated",
    header: "Updated",
    numeric: true,
    hideOnMobile: true,
    render: (r) => <span className="text-muted-foreground">{formatDate(r.updatedAt)}</span>,
  },
];

function NewRfqButton() {
  return (
    <Button asChild size="sm" className="gap-1.5">
      <Link href="/rfqs/new">
        <Plus aria-hidden />
        New RFQ
      </Link>
    </Button>
  );
}

export function RfqListView({
  data,
  summary,
}: {
  data: RfqListData | null;
  /** Optional workflow summary slot (e.g. the adapter-supplied journey-bucket counts), rendered
   *  between the header and the list. Pure composition — the view renders it verbatim. */
  summary?: React.ReactNode;
}) {
  const items = data?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Description second sentence = privacy subtext (trust_adoption_ladder §5.3). Wording is
          VENDOR-SCOPED (Review-A RA-F1): an absolute "only your org + invited vendors" claim would
          deny the frozen moderation stage / staff visibility — never overpromise past the corpus. */}
      <PageHeader
        title="RFQs"
        description="Author, track and manage your organization's requests for quotation. Your RFQs are never public — no vendor can see them except those invited to quote."
        actions={<NewRfqButton />}
      />

      {summary && !isEmpty ? <div className="mb-4">{summary}</div> : null}

      {isEmpty ? (
        <EmptyState
          icon={<FileText aria-hidden />}
          title="No RFQs yet"
          description="Create your first RFQ to start sourcing from verified industrial vendors."
          action={<NewRfqButton />}
          className="py-16"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ListToolbar searchLabel="Search RFQs" />
          <Card>
            <CardContent className="p-0">
              <DataListTable
                caption="RFQs"
                columns={RFQ_COLUMNS}
                rows={items}
                getRowKey={(r) => r.id}
                getRowHref={(r) => `/rfqs/${r.id}`}
                emptyState={
                  <div className="p-4">
                    <EmptyState title="No RFQs match" className="py-8" />
                  </div>
                }
              />
            </CardContent>
          </Card>
          {/* Cursor pagination (GI-03); the cursor handlers attach at the data-wiring milestone. */}
          <PaginationControl
            hasMore={Boolean(data?.nextCursor)}
            label={typeof data?.total === "number" ? `${data.total} total` : undefined}
          />
        </div>
      )}
    </>
  );
}
