// P-BUY-22 Buyer Payments — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model (a Server
// Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page resolves
// the data (engagement + its `payment_records`) and passes it here; an unknown/absent/non-party engagement
// collapses to `notFound()` BY THE PAGE (byte-identical; Inv #11 / GI-12), so this view gets non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DataListTable` + `Money`/`formatDate`; kit `Card`/
// `Button`/`StatusChip`/`EmptyState`; `paymentStatusDisplay`. No new primitive.
//
// GOVERNANCE:
//  • Renders ONLY the frozen `payment_records` fields (Doc-2 §10.5): `amount`+`currency`, `paid_at`,
//    `method_note`, `status`. Nothing coined.
//  • MONEY BOUNDARY (DF-6 / R8): payment records are bookkeeping — the platform never holds/moves funds.
//    A standing note states this; there is NO pay/settle/escrow affordance. "Record"/"Confirm" are parked.
//  • `can_record_payments` (record) and `can_approve_payment` (confirm) are DISTINCT slugs (Doc-4F §F5.6 /
//    Doc-2 §7) — never collapsed. The record affordance gates on the former; the per-row confirm on the
//    latter. Confirm is offered ONLY on `recorded` rows (machine `recorded → confirmed`, no other edge).

import Link from "next/link";
import { Banknote, Info, Wallet } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DataListTable, type DataColumn } from "../../../_components/data-list-table";
import { Money, formatDate } from "../../../_components/format";
import { paymentStatusDisplay } from "../../../_components/state-display";
import { Callout } from "../../../_components/callout";
import type { PaymentRecordItem, PaymentsData } from "../../../_components/payment-view-models";

/** "Record payment" — a parked write (gated on `can_record_payments`); disabled this milestone. */
function RecordPaymentButton() {
  return (
    <Button type="button" size="sm" className="gap-1.5" disabled>
      <Wallet aria-hidden />
      Record payment
    </Button>
  );
}

function paymentColumns(canApprovePayment: boolean): DataColumn<PaymentRecordItem>[] {
  return [
    {
      // Amount is the row identity; the paid-on date rides underneath so the table stays 3 columns wide on
      // mobile (no horizontal scroll region to keyboard-trap) while keeping the date on every breakpoint.
      key: "amount",
      header: "Amount",
      render: (p) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">
            <Money value={p.amount} />
          </span>
          {p.paidAt ? (
            <span className="text-2xs text-muted-foreground">Paid {formatDate(p.paidAt)}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      hideOnMobile: true,
      render: (p) => <span className="text-muted-foreground">{p.methodNote ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => {
        const s = paymentStatusDisplay(p.status);
        return <StatusChip label={s.label} tone={s.tone} />;
      },
    },
    {
      key: "action",
      header: "Action",
      render: (p) => {
        // Confirm is valid ONLY on `recorded` (machine `recorded → confirmed`). Distinct slug gate.
        if (p.status !== "recorded") return <span className="text-muted-foreground">—</span>;
        if (!canApprovePayment) {
          return <span className="text-xs text-muted-foreground">Needs an approver</span>;
        }
        // Parked write: `ops.confirm_payment.v1` wires at the integration milestone.
        return (
          <Button type="button" variant="secondary" size="sm" disabled>
            Confirm
          </Button>
        );
      },
    },
  ];
}

export function PaymentsView({ data }: { data: PaymentsData }) {
  const isEmpty = data.items.length === 0;
  const columns = paymentColumns(Boolean(data.canApprovePayment));

  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/engagements" },
          {
            label: data.engagementRef ?? "Engagement",
            href: `/engagements/${data.engagementId}`,
          },
          { label: "Payments" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Payments"
        description="Recorded payments for this engagement — bookkeeping only."
        // The record affordance lives in the header when there ARE rows; when the list is empty it moves into
        // the empty state (with its parked-write hint) — so it never appears twice on one screen.
        actions={!isEmpty && data.canRecordPayments ? <RecordPaymentButton /> : undefined}
      />

      <div className="mt-2 flex flex-col gap-4">
        {/* Money boundary (DF-6 / R8): records only; the platform never holds or moves funds. */}
        <Callout icon={<Banknote aria-hidden />}>
          Payments are <span className="font-medium">records only</span>. The platform never holds,
          escrows, or moves funds — money is settled directly between the parties and logged here
          for reference.
        </Callout>

        {isEmpty ? (
          <EmptyState
            icon={<Wallet aria-hidden />}
            title="No payment records"
            description={
              data.canRecordPayments
                ? "Record a payment once one has been made off-platform between the parties."
                : "No payments have been recorded for this engagement yet."
            }
            action={
              data.canRecordPayments ? (
                <span className="flex flex-col items-center gap-1">
                  <RecordPaymentButton />
                  <span className="text-xs text-muted-foreground">
                    Recording connects in the integration phase.
                  </span>
                </span>
              ) : (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/engagements/${data.engagementId}`}>Back to engagement</Link>
                </Button>
              )
            }
            className="py-12"
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <DataListTable
                caption="Payment records for this engagement"
                columns={columns}
                rows={data.items}
                getRowKey={(p) => p.id}
                // Pin the Amount (identity) column: on narrow viewports the row scrolls horizontally, and
                // stickyFirstColumn makes DataListTable's scroll region keyboard-focusable (WCAG 2.1.1) —
                // the sanctioned pattern (same as the comparison matrix), so no shared component changes.
                stickyFirstColumn
                emptyState={
                  <div className="p-4">
                    <EmptyState title="No payment records" className="py-8" />
                  </div>
                }
              />
            </CardContent>
          </Card>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          Recording a payment and confirming it are separate permissions; a confirmation is a
          deliberate, recorded acknowledgement — not a transfer of money. Recording and confirming
          connect in the integration phase.
        </p>
      </div>
    </div>
  );
}
