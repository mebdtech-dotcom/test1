// Performance card (P-VND-28) — `trust.get_performance_score.v1` (Doc-4G PassB Part3 §G6.5), public/
// no-slug. UNLIKE Trust Score, this read's public projection NEVER exposes a numeric score ("the
// numeric `score` is NOT exposed publicly" — §G6.5) — band/`level` + `rated` + `freeze_state` only.
// This is a frozen contract restriction, not a presentation choice, and the Board's 2026-07-03
// ruling explicitly does not cover Performance Score. Sub-threshold reports "Not Rated"
// (`rated=false`), never fabricated as 0. Read-only. RSC-friendly.
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import type { PerformanceScoreView } from "./types";

export interface PerformanceScoreCardProps {
  performance?: PerformanceScoreView;
}

export function PerformanceScoreCard({ performance }: PerformanceScoreCardProps) {
  const frozen = performance?.freeze_state === "frozen";
  const rated = performance?.rated === true;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {frozen ? (
          <StatusChip label="Suppressed while frozen" tone="neutral" />
        ) : rated ? (
          <>
            <p className="text-2xl font-semibold text-foreground">{performance?.level ?? "—"}</p>
            {performance?.performance_score_updated_at ? (
              <p className="text-xs text-muted-foreground">
                Last updated {performance.performance_score_updated_at}
              </p>
            ) : null}
          </>
        ) : (
          <StatusChip label="Not Rated" tone="neutral" />
        )}
        <p className="text-xs text-muted-foreground">
          Operational reliability — RFQ responsiveness and fulfillment history. Read-only; never a
          numeric score.
        </p>
      </CardContent>
    </Card>
  );
}
