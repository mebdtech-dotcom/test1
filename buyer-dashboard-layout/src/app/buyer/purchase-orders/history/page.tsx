import type { Metadata } from "next";
import { Download, History } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { IvMoney } from "@/components/iv/iv-money";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatusTone } from "../../contracts";

import { BuyerShell } from "../../components/buyer-shell";
import { mockBuyerDashboardAdapter } from "../../mock-adapter";

export const metadata: Metadata = {
  title: "Order History — iVendorz",
  description: "Completed and closed purchase orders.",
};

// TODO(api): replace with caller-supplied data bound to the governed purchase
// order history contract (cursor-paginated). Tones/labels are decided upstream.
const sampleHistory: Array<{
  id: string;
  reference: string;
  supplier: string;
  dateLabel: string;
  amount: { amount: string; currency: string };
  status: { label: string; tone: StatusTone };
}> = [
  {
    id: "h1",
    reference: "PO-2024-0142",
    supplier: "ABC Engineering Ltd.",
    dateLabel: "12 May 2024",
    amount: { amount: "4,10,000", currency: "BDT" },
    status: { label: "Delivered", tone: "success" },
  },
  {
    id: "h2",
    reference: "PO-2024-0139",
    supplier: "Reliable Traders",
    dateLabel: "28 Apr 2024",
    amount: { amount: "95,000", currency: "BDT" },
    status: { label: "Delivered", tone: "success" },
  },
  {
    id: "h3",
    reference: "PO-2024-0131",
    supplier: "Techno Supplies",
    dateLabel: "15 Apr 2024",
    amount: { amount: "2,75,000", currency: "BDT" },
    status: { label: "Cancelled", tone: "destructive" },
  },
];

export default async function OrderHistoryPage() {
  const shell = await mockBuyerDashboardAdapter.getShellContext();

  return (
    <BuyerShell
      title="Order History"
      description="A record of your completed and closed purchase orders."
      breadcrumbs={[
        { label: "Buyer", href: "/buyer" },
        { label: "Purchase Orders" },
        { label: "Order History" },
      ]}
      activeNavId="po-history"
      user={shell.user}
      navBadges={shell.navBadges}
      notificationsLabel={shell.notificationsLabel}
      actions={
        <IvButton size="sm" variant="secondary" className="gap-1.5">
          <Download className="size-4" />
          Export
        </IvButton>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Past orders</CardTitle>
          <CardDescription>Closed purchase orders, most recent first.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO No.</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.reference}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">{row.dateLabel}</TableCell>
                    <TableCell className="text-right">
                      <IvMoney
                        amount={row.amount.amount}
                        currency={row.amount.currency}
                        className="justify-end"
                      />
                    </TableCell>
                    <TableCell>
                      <IvChip tone={row.status.tone}>{row.status.label}</IvChip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </BuyerShell>
  );
}
