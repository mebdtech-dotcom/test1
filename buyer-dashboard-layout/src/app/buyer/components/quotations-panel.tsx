import { Award } from "lucide-react";

import { IvChip } from "@/components/iv/iv-chip";
import { IvMoney } from "@/components/iv/iv-money";
import { IvNotFound } from "@/components/iv/iv-not-found";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuotationItem } from "../contracts";

export interface QuotationsPanelProps {
  items: QuotationItem[];
}

export function QuotationsPanel({ items }: QuotationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest quotations</CardTitle>
        <CardDescription>Most recent supplier responses.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <IvNotFound
            title="No quotations yet"
            description="Supplier responses to your RFQs will appear here."
          />
        ) : (
          items.map((q) => (
            <div
              key={q.id}
              className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                {q.supplier
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{q.supplier}</p>
                  {q.recommended ? (
                    <IvChip tone="amber" className="shrink-0">
                      <Award />
                      Recommended
                    </IvChip>
                  ) : null}
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {q.reference} · {q.ratingLabel}
                </p>
              </div>
              <IvMoney
                amount={q.amount.amount}
                currency={q.amount.currency}
                className="text-sm font-medium"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
