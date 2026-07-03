import { ChevronRight, FileText } from "lucide-react";

import { IvButton } from "@/components/iv/iv-button";
import { IvChip } from "@/components/iv/iv-chip";
import { IvNotFound } from "@/components/iv/iv-not-found";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RfqItem } from "../contracts";

export interface ActiveRfqsProps {
  items: RfqItem[];
}

export function ActiveRfqs({ items }: ActiveRfqsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active RFQs</CardTitle>
        <CardDescription>Open requests collecting quotations.</CardDescription>
        <CardAction>
          <IvButton variant="ghost" size="sm">
            View all
          </IvButton>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 ? (
          <IvNotFound
            title="No active RFQs"
            description="Open requests collecting quotations will appear here."
          />
        ) : (
          items.map((rfq) => (
            <a
              key={rfq.id}
              href="#"
              className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-3 transition-colors hover:bg-accent outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-muted text-muted-foreground"
                aria-hidden="true"
              >
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{rfq.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {rfq.reference} · {rfq.quoteCount} quotes · closes {rfq.closesLabel}
                </p>
              </div>
              <IvChip tone={rfq.stage.tone}>{rfq.stage.label}</IvChip>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}
