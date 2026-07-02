// Platform invoice detail — P-ACC-21 (Doc-7E · T-DETAILS). SERVER COMPONENT (read-only). PRESENTATION-ONLY.
//
// FIELD DISCIPLINE (invent nothing):
//  • Everything maps to the frozen `get_platform_invoice` projection (§HB-5.4): human_ref, purpose,
//    amount, currency, status, and `payments:[{ gateway, gateway_ref, status }]`. The debtor
//    `organization_id` is an opaque ref (the active org).
//  • The invoice carries NO line_items — it is a single-purpose fee, so the "line-item table" is one row
//    (purpose → amount = total). No line items are coined.
//  • There is NO `file_ref` in the projection — the PDF download is DEFERRED (a disabled affordance,
//    flagged), never a fabricated link (RV-0076 discipline).
//  • Platform-fee invoice — never a trade invoice (`platform_invoices ≠ operations.trade_invoices`,
//    Doc-4I FIXED). No escrow, wallet, or settlement.
import { AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import {
  PURPOSE_LABEL,
  type InvoiceDetailData,
  type InvoiceStatus,
  type PaymentStatus,
} from "./invoice-detail-data";

const STATUS_META: Record<InvoiceStatus, { label: string; tone: StatusTone }> = {
  paid: { label: "Paid", tone: "success" },
  issued: { label: "Issued", tone: "info" },
  overdue: { label: "Overdue", tone: "warning" },
  void: { label: "Void", tone: "neutral" },
};

// Frozen `platform_payments` status enum (Doc-2:832) — full set, each chip-mapped.
const PAYMENT_META: Record<PaymentStatus, { label: string; tone: StatusTone }> = {
  initiated: { label: "Initiated", tone: "info" },
  succeeded: { label: "Succeeded", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
};

function formatAmount(n: number): string {
  return n.toLocaleString("en-US");
}

export function InvoiceDetail({ invoice }: { invoice: InvoiceDetailData }) {
  const amount = `${invoice.currency} ${formatAmount(invoice.amount)}`;
  return (
    <div className="max-w-3xl space-y-6">
      {/* Hero. */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-foreground">{invoice.humanRef}</span>
              <StatusChip
                label={STATUS_META[invoice.status].label}
                tone={STATUS_META[invoice.status].tone}
              />
            </div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{amount}</p>
            <p className="text-sm text-muted-foreground">
              {PURPOSE_LABEL[invoice.purpose]} · Billed to your organization
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Button type="button" variant="outline" disabled>
              <Download aria-hidden="true" />
              Download PDF
            </Button>
            <p className="text-xs text-muted-foreground">PDF isn’t available in this preview.</p>
          </div>
        </CardContent>
      </Card>

      {/* Summary — a single-purpose fee (no line items projected). */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Invoice summary</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">
                  Description
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-foreground">{PURPOSE_LABEL[invoice.purpose]} fee</td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">{amount}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Total
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-foreground">
                  {amount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Payments. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {invoice.payments.map((p) => (
                <li
                  key={p.gatewayRef}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{p.gateway}</span>
                    <span className="font-mono text-xs text-muted-foreground">{p.gatewayRef}</span>
                  </span>
                  <StatusChip
                    label={PAYMENT_META[p.status].label}
                    tone={PAYMENT_META[p.status].tone}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          This is an iVendorz platform invoice (a fee owed to iVendorz). It isn’t a trade invoice
          between you and a vendor.
        </p>
      </div>
    </div>
  );
}
