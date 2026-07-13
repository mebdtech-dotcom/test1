// Buyer Workspace — Callout (Tier-2 presentation composition, FZ-05/FZ-11 freeze remediation).
//
// The same structural info-callout (bordered box + leading icon + body text) was hand-authored inline
// in ~8 buyer views with only the icon and copy differing, plus a second amber "warning" variant
// duplicated across 2 of them (FZ-11). Extracted here as ONE component with a `tone` prop rather than
// N near-identical `<div>` blocks. NOT a new kit primitive — a buyer-scoped Tier-2 composition of the
// existing kit tokens (`bg-secondary`/`bg-iv-amber-50`), mirroring the `KpiStatCard`/`SourcingPipelineCard`
// promotion-candidate pattern (extract at the narrowest scope, never fork the frozen kit).
//
// PRESENTATION-ONLY: no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/cn";

export interface CalloutProps {
  /** A lucide icon element (decorative — the caller passes `aria-hidden`). */
  icon: ReactNode;
  /** `info` (neutral, `bg-secondary`) — the default. `warning` (amber, `bg-iv-amber-50`) — FZ-11. */
  tone?: "info" | "warning";
  children: ReactNode;
  className?: string;
}

export function Callout({ icon, tone = "info", children, className }: CalloutProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-border p-3 text-sm",
        tone === "warning"
          ? "bg-iv-amber-50 text-foreground"
          : "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 size-4 shrink-0 [&_svg]:size-4",
          tone === "warning" ? "text-iv-amber-700" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <p>{children}</p>
    </div>
  );
}
