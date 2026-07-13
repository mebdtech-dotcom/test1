// Buyer Workspace — DescriptionList (Tier-2 per the Shared Platform Component Registry). The single
// definition-list (`<dl>`/`<dt>`/`<dd>`) renderer reused by the RFQ detail meta (P-BUY-08) and the
// quotation detail section cards (P-BUY-14) — so the two never diverge. Pure function of props (Server
// Component, no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). It renders only the rows the
// caller supplies and computes nothing.
//
// A11y: a semantic `<dl>` with paired `<dt>`/`<dd>`; the label/value pairing is conveyed structurally
// (never by layout alone). Rows divide with `divide-y` for scannability.

import * as React from "react";
import { cn } from "@/frontend/lib/cn";

export interface DescriptionItem {
  /** Optional stable identity. Curated lists (e.g. P-BUY-08) have unique labels and can omit it; consumers
   *  that map GENERIC contract-projected rows (e.g. P-BUY-14 term cards from dev-doc jsonb) should pass it
   *  so repeated labels never produce colliding React keys. */
  id?: string;
  /** Term label (`<dt>`). */
  label: string;
  /** Already-resolved presentation value (`<dd>`). */
  value: React.ReactNode;
}

export function DescriptionList({
  items,
  className,
}: {
  items: DescriptionItem[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((item, index) => (
        // Stable id when supplied; otherwise the index guarantees a unique key for this render-only,
        // never-client-reordered list (so duplicate projected labels cannot collide).
        <div key={item.id ?? index} className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-4">
          <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
          <dd className="text-sm text-foreground sm:col-span-2">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
