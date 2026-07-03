import { Check, X } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { IvMoney } from "@/components/iv/iv-money";
import { IvNotFound } from "@/components/iv/iv-not-found";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApprovalItem } from "../contracts";

export interface ApprovalQueueProps {
  items: ApprovalItem[];
}

export function ApprovalQueue({ items }: ApprovalQueueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval queue</CardTitle>
        <CardDescription>Requisitions waiting on your decision.</CardDescription>
        <CardAction>
          <IvButton variant="ghost" size="sm">
            View all
          </IvButton>
        </CardAction>
      </CardHeader>
      {items.length === 0 ? (
        <CardContent>
          <IvNotFound
            title="Nothing to approve"
            description="Requisitions that need your decision will appear here."
          />
        </CardContent>
      ) : (
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Requisition</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{row.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.reference}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.requester}</TableCell>
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
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2">
                      <IvButton size="sm" variant="ghost" aria-label={`Reject ${row.reference}`}>
                        <X className="size-4" />
                      </IvButton>
                      <IvButton size="sm" aria-label={`Approve ${row.reference}`}>
                        <Check className="size-4" />
                      </IvButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
