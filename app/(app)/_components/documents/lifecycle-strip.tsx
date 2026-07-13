// Documents shared home — LifecycleStrip (FE-DOC, owner finding MAJOR-01, adjudicated 2026-07-03).
//
// A permanent horizontal strip of the procurement document flow the owner specified:
// RFQ → Quotation → Purchase Order → Challan → Trade Invoice → Payment — six FROZEN entity names
// (M3 `rfqs`/`quotations`; M4 `purchase_orders`/`challans`/`trade_invoices`/`payment_records`).
// Each stage is a plain GET link that sets the surface's `?stage=` filter.
//
// ⚠ NAVIGATION, NOT STATE (the binding MAJOR-01 constraint): the corpus has per-aggregate state
// machines and NO global document lifecycle — this strip must NEVER render or compute a
// per-engagement/per-document "current stage", progress %, or completion cue. `activeStage` marks
// only WHICH FILTER IS SELECTED (aria-current), exactly like the P-BUY-19 status filter. Turning
// this into a business-state indicator is a review BLOCKER, not a styling choice.
//
// LOI and WCC are frozen kinds deliberately NOT in the strip (the owner's six-stage flow); they
// stay reachable via the Document Type facet and the per-engagement links. A Server Component;
// `basePath` keeps it mount-agnostic (buyer `/buy/documents`, vendor `/sell/documents`).

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";

/** The six stage FILTER keys — presentation handles over frozen entities (no coined state). */
export const DOCUMENT_STAGES = [
  { key: "rfq", label: "RFQ" },
  { key: "quotation", label: "Quotation" },
  { key: "po", label: "Purchase Order" },
  { key: "challan", label: "Challan" },
  { key: "trade_invoice", label: "Trade Invoice" },
  { key: "payment", label: "Payment" },
] as const;

export type DocumentStageKey = (typeof DOCUMENT_STAGES)[number]["key"];

export const DOCUMENT_STAGE_KEYS = DOCUMENT_STAGES.map((s) => s.key) as DocumentStageKey[];

export interface LifecycleStripProps {
  /** The hub route this strip filters (buyer `/buy/documents` · vendor `/sell/documents`). */
  basePath: string;
  /** The currently-selected stage FILTER (never a document's business state). */
  activeStage?: DocumentStageKey;
  className?: string;
}

export function LifecycleStrip({ basePath, activeStage, className }: LifecycleStripProps) {
  return (
    <nav
      aria-label="Filter documents by procurement stage"
      className={cn(
        "flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card px-2 py-2",
        className,
      )}
    >
      {DOCUMENT_STAGES.map((stage, i) => {
        const isActive = activeStage === stage.key;
        return (
          <span key={stage.key} className="flex shrink-0 items-center gap-1">
            {i > 0 ? (
              <ChevronRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
            <Button
              asChild
              size="sm"
              variant={isActive ? "secondary" : "ghost"}
              aria-current={isActive ? "page" : undefined}
            >
              <Link href={isActive ? basePath : `${basePath}?stage=${stage.key}`}>
                {stage.label}
              </Link>
            </Button>
          </span>
        );
      })}
    </nav>
  );
}
