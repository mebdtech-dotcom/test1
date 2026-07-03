import type { Metadata } from "next";
import { ChevronRight, ListChecks } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { IvMoney } from "@/components/iv/iv-money";
import { IvStat } from "@/components/iv/iv-stat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatusTone } from "../../contracts";

import { BuyerShell } from "../../components/buyer-shell";
import { mockBuyerDashboardAdapter } from "../../mock-adapter";

export const metadata: Metadata = {
  title: "Active Orders — iVendorz",
  description: "Purchase orders currently in progress.",
};

// TODO(api): replace with caller-supplied data bound to the governed purchase
// order contract (cursor-paginated). Tones/labels are caller-decided upstream.
const sampleOrders: Array<{
  id: string;
  reference: string;
  supplier: string;
  amount: { amount: string; currency: string };
  status: { label: string; tone: StatusTone };
}> = [
  {
    id: "po1",
    reference: "PO-2024-0148",
    supplier: "ABC Engineering Ltd.",
    amount: { amount: "2,45,000", currency: "BDT" },
    status: { label: "In transit", tone: "info" },
  },
  {
    id: "po2",
    reference: "PO-2024-0147",
    supplier: "Reliable Traders",
    amount: { amount: "1,85,000", currency: "BDT" },
    status: { label: "Processing", tone: "warning" },
  },
  {
    id: "po3",
    reference: "PO-2024-0146",
    supplier: "Techno Supplies",
    amount: { amount: "3,20,000", currency: "BDT" },
    status: { label: "Confirmed", tone: "success" },
  },
];

export default async function ActiveOrdersPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  return (
    <BuyerShell
      title="Active Orders"
      description="Purchase orders that are confirmed and currently in progress."
      breadcrumbs={[
        { label: "Buyer", href: "/buyer" },
        { label: "Purchase Orders" },
        { label: "Active Orders" },
      ]}
      activeNavId="po-active"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <IvStat label="Open POs" value="12" />
        <IvStat label="In transit" value="5" />
        <IvStat label="Committed value" value={<IvMoney amount="38,90,000" currency="BDT" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders in progress</CardTitle>
          <CardDescription>Track POs from confirmation through delivery.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {sampleOrders.map((order) => (
            <a
              key={order.id}
              href="#"
              className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3 transition-colors hover:bg-accent outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <ListChecks className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{order.supplier}</p>
                <p className="font-mono text-xs text-muted-foreground">{order.reference}</p>
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                <IvMoney amount={order.amount.amount} currency={order.amount.currency} />
              </span>
              <IvChip tone={order.status.tone}>{order.status.label}</IvChip>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </a>
          ))}
        </CardContent>
      </Card>
    </BuyerShell>
  );
}
