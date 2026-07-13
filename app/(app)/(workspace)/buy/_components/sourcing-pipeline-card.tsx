// Buyer Workspace — Sourcing Pipeline card (P-BUY-01 procurement widget, Doc-7F §9.1 `T-DASHBOARD`).
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
import { rfqStateDisplay } from "./state-display";
import type { RfqPipelineStage } from "./view-models";

export function SourcingPipelineCard({
  stages,
  viewAllHref,
}: {
  stages: RfqPipelineStage[];
  viewAllHref?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-sm font-semibold">Sourcing pipeline</CardTitle>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="rounded-sm text-xs text-iv-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all RFQs
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Stages render in the supplied (contract) order — the RFQ lifecycle funnel, left to right.
            The grid tops out at 6 columns and wraps gracefully to a second row for any additional
            stages the wired facet read supplies (no fixed stage count is assumed). */}
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {stages.map((stage) => {
            const s = rfqStateDisplay(stage.state);
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
          Your requests for quotation across their lifecycle.
        </p>
      </CardContent>
    </Card>
  );
}
