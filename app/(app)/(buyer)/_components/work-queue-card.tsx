// Buyer Workspace — work-queue widget (P-BUY-01 "needs your action" queues, Doc-7F §9.1).
//
// A BUYER-SCOPED, read-only dashboard mini-queue: a kit `Card` wrapping the shared `DataListTable`
// (Tier-2 per the Shared Platform Component Registry — the single table impl, reused by P-BUY-06 too,
// so the two never diverge). Pure function of props (Server Component, no hooks/fetch). It re-queries
// nothing and re-ranks nothing — rows render in the caller-supplied (governed contract) order (GI-04/R6).
//
// GOVERNANCE: `total`/count renders ONLY when the caller passes one (a client-computed total could leak
// an exclusion count — GI-12; Inv #11). The empty copy must never imply exclusion. Status cells use the
// kit `StatusChip` (text + tone, never colour alone — GI-06).

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { DataListTable, type DataColumn } from "./data-list-table";

/** Back-compat alias — the dashboard's queue columns are the shared `DataColumn`. */
export type QueueColumn<T> = DataColumn<T>;

export interface WorkQueueCardProps<T> {
  /** Queue title (rendered as the card title AND the table caption). */
  title: string;
  columns: QueueColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Empty-state copy (must never imply exclusion). */
  emptyMessage: string;
  /** Optional "view all" destination (opaque-id route). */
  viewAllHref?: string;
  /** Optional contract-provided total; rendered only if supplied (GI-12). */
  total?: number;
  /** Optional per-row destination (opaque-id route) — makes the row's ref keyboard-navigable. */
  getRowHref?: (row: T) => string | undefined;
}

export function WorkQueueCard<T>({
  title,
  columns,
  rows,
  getRowKey,
  emptyMessage,
  viewAllHref,
  total,
  getRowHref,
}: WorkQueueCardProps<T>) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-sm font-semibold">
          {title}
          {typeof total === "number" ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">{total}</span>
          ) : null}
        </CardTitle>
        {viewAllHref ? (
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link href={viewAllHref}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        <DataListTable
          caption={title}
          columns={columns}
          rows={rows}
          getRowKey={getRowKey}
          getRowHref={getRowHref}
          emptyState={
            <div className="p-4 pt-0">
              <EmptyState title={emptyMessage} className="py-8" />
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
