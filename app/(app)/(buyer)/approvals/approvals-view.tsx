// P-BUY-12 Buyer Internal approval — host view (`T-MANAGEMENT`, Doc-7F). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the queue via `rfq.list_rfqs` (state=pending_internal_approval, own-org) and passes it here;
// the decisions `rfq.approve_rfq.v1` / `rfq.reject_internal_rfq.v1` (Doc-4E §E4.4) are PARKED.
//
// REUSE: canonical platform-shell `PageHeader`; shared `DataListTable` + `Money`/`formatDate`/`Ref`; kit
// `Card`/`Button`/`EmptyState`/`PaginationControl`.
//
// GOVERNANCE (load-bearing):
//  • NO AUTO-APPROVE (Doc-3 §1.2 FIXED): approval is always an explicit human act — no timeout/silence
//    path. A standing note states this.
//  • Decision = approve (→ submitted) / reject (→ draft); **reject REQUIRES a reason** (§E4.4). Both are
//    PARKED (disabled) and gated on `can_approve_rfq` — presentation only; the server enforces + applies
//    the Identity approval-chain step.
//  • Own-org queue only; genuine-empty ("nothing to approve") never implies exclusion. Cursor pagination
//    (GI-03), never re-ranked (GI-04). Rows link by OPAQUE id (Inv #5) to the RFQ (P-BUY-08).

import { Info, ShieldCheck } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { PageHeader } from "../../_components/shell";
import { DataListTable, type DataColumn } from "../_components/data-list-table";
import { Money, formatDate, Ref } from "../_components/format";
import { Callout } from "../_components/callout";
import type { ApprovalsData, ApprovalQueueItem } from "../_components/approvals-view-models";

function approvalColumns(canApproveRfq: boolean): DataColumn<ApprovalQueueItem>[] {
  return [
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
    { key: "value", header: "Value", numeric: true, render: (r) => <Money value={r.value} /> },
    {
      key: "submitted",
      header: "Submitted",
      numeric: true,
      hideOnMobile: true,
      render: (r) => (
        <span className="text-muted-foreground">
          {r.submittedAt ? formatDate(r.submittedAt) : "—"}
        </span>
      ),
    },
    {
      key: "decision",
      header: "Decision",
      render: () =>
        canApproveRfq ? (
          // Parked writes: approve_rfq / reject_internal_rfq (reject captures a mandatory reason at wiring).
          <span className="flex items-center justify-end gap-2">
            <Button type="button" size="sm" disabled>
              Approve
            </Button>
            <Button type="button" variant="outline" size="sm" disabled>
              Reject
            </Button>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Approval permission required</span>
        ),
    },
  ];
}

export function ApprovalsView({ data }: { data: ApprovalsData | null }) {
  const items = data?.items ?? [];
  const isEmpty = items.length === 0;
  const columns = approvalColumns(Boolean(data?.canApproveRfq));

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Review and decide RFQs awaiting your organization's internal approval."
      />

      <div className="mt-4 flex flex-col gap-4">
        {/* No auto-approve (Doc-3 §1.2): every decision is an explicit act; nothing is ever auto-approved. */}
        <Callout icon={<ShieldCheck aria-hidden />}>
          Approving or rejecting is a <span className="font-medium">deliberate act</span> — an RFQ
          is never approved automatically. Rejecting returns the RFQ to draft and requires a reason.
        </Callout>

        {isEmpty ? (
          <EmptyState
            icon={<ShieldCheck aria-hidden />}
            title="Nothing to approve"
            description="RFQs awaiting your internal approval will appear here."
            className="py-16"
          />
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <DataListTable
                  caption="RFQs awaiting internal approval"
                  columns={columns}
                  rows={items}
                  getRowKey={(r) => r.id}
                  getRowHref={(r) => `/rfqs/${r.id}`}
                  // Pin the RFQ (identity) column: the Decision cell holds two buttons, so a long title can
                  // overflow on narrow viewports; stickyFirstColumn makes DataListTable's scroll region
                  // keyboard-focusable (WCAG 2.1.1) — the sanctioned payments precedent, no kit change.
                  stickyFirstColumn
                  emptyState={
                    <div className="p-4">
                      <EmptyState title="Nothing to approve" className="py-8" />
                    </div>
                  }
                />
              </CardContent>
            </Card>
            {/* Cursor pagination (GI-03); the cursor handler attaches at the data-wiring milestone. */}
            <PaginationControl hasMore={Boolean(data?.nextCursor)} />
          </>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          Deciding connects in the integration phase; approval requires the approval permission and
          follows your organization&rsquo;s configured approval chain.
        </p>
      </div>
    </>
  );
}
