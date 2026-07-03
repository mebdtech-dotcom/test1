// Documents shared home — DocumentCollection (FE-DOC, the owner's Round-2 strategic abstraction).
// The section wrapper every documents grouping renders through (Generated documents · Engagement
// document records · Sourcing documents · Platform invoices), so FE-DOC-01/02/03 compose the same
// shell instead of re-authoring section chrome. Pure function of props (Server Component).
//
// EMPTY-STATE CONTRACTS (owner Round-2 MINOR-02): callers render ONE of the two variants via the
// kit `EmptyState` — *filtered-empty* ("No documents match the current filters" + a clear-filters
// action) when a presentation filter produced zero rows, *genuine-empty* (corpus-honest copy, e.g.
// "No engagement documents yet — they appear after an RFQ award creates an engagement") when the
// underlying set is empty. An empty section must never imply exclusion (Inv #11 / GI-12).

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";

export interface DocumentCollectionProps {
  /** Stable section id — becomes the heading id for `aria-labelledby`. */
  id: string;
  title: string;
  description?: string;
  /** Optional right-aligned toolbar slot (actions render disabled-honest per the visibility matrix). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DocumentCollection({
  id,
  title,
  description,
  toolbar,
  children,
  className,
}: DocumentCollectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className={cn("min-w-0", className)}>
      <Card>
        <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle id={headingId} className="text-sm font-semibold">
              {title}
            </CardTitle>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {toolbar ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{toolbar}</div>
          ) : null}
        </CardHeader>
        <CardContent className="p-4 pt-0">{children}</CardContent>
      </Card>
    </section>
  );
}
