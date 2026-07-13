// Buyer Workspace — read-only timeline (Tier-2). A BUYER-SCOPED presentation composition of the existing
// kit `Card` + `EmptyState` (the shared Doc-7B `timeline` component remains a Doc-7B-owner item, §11.3).
// Reused for: dashboard recent activity (P-BUY-01, Doc-7F §9.1), RFQ lifecycle (P-BUY-08), and the
// quotation version history (P-BUY-14). `title`/`emptyLabel` are optional (defaulting to the dashboard
// "Recent activity" wording) so a caller can relabel without forking. Pure function of props (Server
// Component, no hooks/fetch).
//
// GOVERNANCE: entries are sourced from the immutable M0 audit / version history (read-only, Inv #8) and are
// NON-DISCLOSURE-SAFE — the timeline never surfaces an excluded/deferred party or any CRM/blacklist signal
// (Inv #11; §9.3). It renders only what the caller (a disclosed read) supplies; it infers/computes nothing.
//
// A11y: an ordered list (`<ol>`) under a labelled section; each entry's timestamp uses a `<time>` element.

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { formatInstant } from "./format";
import type { ActivityEntry } from "./view-models";

export function ActivityTimeline({
  entries,
  title = "Recent activity",
  emptyLabel = "No activity yet",
}: {
  entries: ActivityEntry[];
  title?: string;
  emptyLabel?: string;
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {entries.length === 0 ? (
          <EmptyState title={emptyLabel} className="py-8" />
        ) : (
          <ol className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-iv-brand-400"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  {entry.href ? (
                    <Link
                      href={entry.href}
                      className="truncate text-sm text-foreground underline-offset-2 hover:underline"
                    >
                      {entry.label}
                    </Link>
                  ) : (
                    <span className="truncate text-sm text-foreground">{entry.label}</span>
                  )}
                  <time dateTime={entry.at} className="text-xs text-muted-foreground">
                    {formatInstant(entry.at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
