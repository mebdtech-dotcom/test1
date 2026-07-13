// P-BUY-23 Buyer Trade invoice review — host view (`T-DETAILS`, Doc-7F). Pure function of its view-model
// (a Server Component; no hooks, no fetch, no mutation — Content ≠ Presentation, Inv #9). The server page
// resolves the data and passes it here; an unknown/absent/non-party invoice collapses to `notFound()` BY
// THE PAGE (byte-identical; Inv #11 / GI-12), so this view always receives non-null data.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; shared `DescriptionList` + `Money`/`formatDate`/`Ref`; kit
// `Card`/`StatusChip`/`Button`; `tradeInvoiceStatusDisplay`. No new primitive.
//
// GOVERNANCE:
//  • Renders ONLY the frozen `trade_invoices` fields (Doc-2 §10.5): `human_ref`, `amount`+`currency`,
//    `status`, `due_date`. No invoice line items / totals-breakdown are projected → none fabricated.
//  • MONEY BOUNDARY (DF-6 / R8): a trade invoice is an inter-party RECORD — it is NOT a platform invoice
//    (M7 `billing.platform_invoices`) and the platform never holds/moves funds. `partially_paid`/`paid`
//    reflect payments recorded on the Payments surface (P-BUY-22), never a transfer here.
//  • The buyer's review transition is a `disputed` raise (`update_trade_invoice_status`; slug
//    `can_record_payments`) — there is NO "approved" status in the machine, so none is offered. The
//    affordance is presentation-only + disabled (write parked); `disputed` emits `DisputeRecorded` (Trust
//    input) at the server, never a locally-computed signal.

import Link from "next/link";
import { FileText, Info, ScrollText, TriangleAlert } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../../../_components/description-list";
import { Money, formatDate, Ref } from "../../../_components/format";
import { tradeInvoiceStatusDisplay } from "../../../_components/state-display";
import { Callout } from "../../../_components/callout";
import type { TradeInvoiceData } from "../../../_components/trade-invoice-view-models";

/** Statuses where a buyer can still raise a dispute (not on a terminal/already-disputed record). */
const DISPUTABLE = new Set<TradeInvoiceData["status"]>(["issued", "partially_paid"]);

export function TradeInvoiceView({ data }: { data: TradeInvoiceData }) {
  const status = tradeInvoiceStatusDisplay(data.status);
  const details: DescriptionItem[] = [
    { label: "Amount", value: <Money value={data.amount} /> },
    { label: "Due date", value: data.dueDate ? formatDate(data.dueDate) : "—" },
  ];

  const canDispute = data.canRecordPayments && DISPUTABLE.has(data.status);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Engagements", href: "/buy/engagements" },
          {
            label: data.engagementRef ?? "Engagement",
            href: `/buy/engagements/${data.engagementId}`,
          },
          { label: "Trade invoice" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Trade invoice"
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
          </>
        }
      />

      <div className="mt-2 flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Invoice details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DescriptionList items={details} />
          </CardContent>
        </Card>

        {/* Money boundary (DF-6 / R8): a trade invoice ≠ a platform invoice; the platform moves no funds. */}
        <Callout icon={<ScrollText aria-hidden />}>
          This is a <span className="font-medium">trade invoice</span> between your organization and
          the vendor — not a platform (subscription) invoice. The platform records it but never
          holds, escrows, or moves funds; payment progress reflects payments recorded separately.
        </Callout>

        {/* Review actions. Payment-driven statuses come from the Payments surface; the buyer's own review
            transition is a dispute (parked). No "approve" action exists in the machine. */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-semibold">Review</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 pt-0">
            {data.status === "disputed" ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-iv-amber-700" />
                This invoice is marked disputed. The dispute is on record with the engagement
                parties.
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                Payment progress (partially paid / paid) reflects payments recorded on the Payments
                page. If something is wrong with this invoice, you can raise a dispute for the
                parties to resolve.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button asChild variant="secondary" size="sm" className="mr-auto gap-1.5">
                <Link href={`/buy/engagements/${data.engagementId}/payments`}>
                  <FileText aria-hidden />
                  View payments
                </Link>
              </Button>
              {canDispute ? (
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Disputing connects in the integration phase.
                  </span>
                  {/* Parked write: `ops.update_trade_invoice_status.v1` (→ disputed) wires at integration. */}
                  <Button type="button" variant="outline" size="sm" disabled>
                    Raise dispute
                  </Button>
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="size-3.5 shrink-0" />
          This trade invoice is shared only between your organization and the vendor.
        </p>
      </div>
    </>
  );
}
