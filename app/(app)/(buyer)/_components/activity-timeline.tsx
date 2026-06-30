// Buyer Workspace — recent-activity timeline (P-BUY-01, Doc-7F §9.1). A BUYER-SCOPED presentation
// composition of the existing kit `Card` + `EmptyState` (the shared Doc-7B `timeline` component remains a
// Doc-7B-owner item, §11.3). Pure function of props (Server Component, no hooks/fetch).
//
// GOVERNANCE: entries are sourced from the immutable M0 audit (read-only) and are NON-DISCLOSURE-SAFE —
// the timeline never surfaces an excluded/deferred party or any CRM/blacklist signal (Inv #11; §9.3).
// It renders only what the caller (a disclosed read) supplies; it infers and computes nothing.
//
// A11y: an ordered list (`<ol>`) under a labelled section; each entry's timestamp uses a `<time>` element.

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { formatInstant } from "./format";
import type { ActivityEntry } from "./view-models";

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {entries.length === 0 ? (
          <EmptyState title="No activity yet" className="py-8" />
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
