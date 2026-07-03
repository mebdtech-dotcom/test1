// Documents shared home — DocumentProcessTimeline (FE-DOC, owner finding MINOR-03). A compact,
// read-only chronological list of one engagement's DOCUMENT FACTS ("PO issued v1", "Payment
// recorded") — labels RESTATE seeded frozen facts (issued_at / recorded events), never a derived
// judgement, progress %, or stage claim (the MAJOR-01 navigation-not-state constraint applies
// here too). Entries arrive fully resolved: the CALLER formats the timestamp display string
// (surface-owned formatting — buyer `format.tsx` stays the buyer's single formatter; this
// component invents no label, kit-style). Visual pattern mirrors the buyer `ActivityTimeline`
// list core WITHOUT Card chrome — unification lives with the FE-SH-06 Timeline promotion
// candidate (promotion-watchlist), not a fork here.

import Link from "next/link";
import { cn } from "@/frontend/lib/cn";

export interface DocumentTimelineEntry {
  id: string;
  /** A frozen-fact label (e.g. "Challan issued · v2") — never a computed stage/progress claim. */
  label: string;
  /** ISO timestamp for the `<time dateTime>` attribute. */
  at: string;
  /** Caller-formatted display of `at` (surface-owned formatting). */
  atLabel: string;
  href?: string;
}

export interface DocumentProcessTimelineProps {
  /** Accessible name (e.g. "Document timeline for ENG-2026-000124"). */
  label: string;
  entries: DocumentTimelineEntry[];
  className?: string;
}

export function DocumentProcessTimeline({
  label,
  entries,
  className,
}: DocumentProcessTimelineProps) {
  if (entries.length === 0) return null;
  return (
    <ol aria-label={label} className={cn("flex flex-col gap-2", className)}>
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-iv-brand-400" />
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
              {entry.atLabel}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
