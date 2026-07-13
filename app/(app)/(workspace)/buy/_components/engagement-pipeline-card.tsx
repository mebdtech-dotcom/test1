// Buyer Workspace — Engagement Pipeline card (P-BUY-01 procurement widget, FE-BUY-08, Doc-7F §9.1
// `T-DASHBOARD`). The identical shape and governance posture as `SourcingPipelineCard` (BX-01/RV-0070) —
// a second lifecycle-funnel widget, this one over the post-award engagement lifecycle. Kept as a separate
// component (2 instances doesn't meet the "rule of three" for a shared generic card) rather than modifying
// the already-approved `SourcingPipelineCard`.
//
// A BUYER-SCOPED presentation composition of the existing kit `Card` + `StatusChip` — NOT a new shared kit
// primitive and NOT a design-token change (the frozen kit/tokens are untouched). Pure function of props
// (Server Component; no hooks/fetch — Content ≠ Presentation, Inv #9).
//
// GOVERNANCE: the stage counts are WIRED aggregate reads supplied by the caller — never client-computed
// (R7 firewall) and never re-ranked (rendered in the caller/contract order, GI-04). Counts carry NO
// excluded/blacklist figure (Inv #11); this is an observe-only funnel — it decides/recommends nothing (R6).

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { engagementStateDisplay } from "./state-display";
import type { EngagementPipelineStage } from "./view-models";

export function EngagementPipelineCard({
  stages,
  viewAllHref,
}: {
  stages: EngagementPipelineStage[];
  viewAllHref?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-sm font-semibold">Engagement pipeline</CardTitle>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="rounded-sm text-xs text-iv-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all engagements
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Stages render in the supplied (contract) order — the engagement lifecycle funnel, left to
            right. The grid tops out at 4 columns and wraps gracefully to a second row for any additional
            stages the wired facet read supplies (no fixed stage count is assumed). */}
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stages.map((stage) => {
            const s = engagementStateDisplay(stage.state);
            return (
              <li
                key={stage.state}
                className="flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <StatusChip label={s.label} tone={s.tone} />
                <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {stage.count}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Your post-award engagements across their lifecycle.
        </p>
      </CardContent>
    </Card>
  );
}
