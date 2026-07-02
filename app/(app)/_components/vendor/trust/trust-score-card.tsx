// Trust Score card (P-VND-28) — `trust.get_trust_score.v1` (Doc-4G PassB Part2 §G5.3), public/no-slug.
// Board ruling 2026-07-03 (`ESC-7G-SCORE-DISPLAY`/`ESC-7B-TRUSTSCORE`) permits the numeric score on
// any public-facing surface; frozen-suppressed and absent-score states are handled explicitly, never
// fabricated. Explainability note is deliberately generic — the frozen corpus exposes no per-category
// breakdown on this read (individual verification records are Staff-Internal, Doc-4G Part1 §G4.8), so
// no granular "contributing factors" checklist is invented here (a real, flagged gap — see the
// milestone WP card). Read-only; no "Edit Trust Score" affordance can ever exist (System-actor-only
// computation). RSC-friendly.
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import type { TrustTier } from "@/frontend/embedded/trust-badge";
import { TrustScoreRing } from "./trust-score-ring";
import type { TrustScoreView } from "./types";

const BAND_LABEL: Record<TrustTier, string> = {
  unverified: "Unverified",
  low: "Building trust",
  medium: "Trusted",
  high: "Highly trusted",
  elite: "Elite",
};

export interface TrustScoreCardProps {
  trust?: TrustScoreView;
}

export function TrustScoreCard({ trust }: TrustScoreCardProps) {
  const frozen = trust?.freeze_state === "frozen";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trust Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <TrustScoreRing score={trust?.score} frozen={frozen} />
        <div className="space-y-1.5">
          {frozen ? (
            <StatusChip label="Suppressed while frozen" tone="neutral" />
          ) : trust?.band ? (
            <p className="text-sm font-medium text-foreground">{BAND_LABEL[trust.band]}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Signals pending verification.</p>
          )}
          {trust?.trust_score_updated_at ? (
            <p className="text-xs text-muted-foreground">
              Last updated {trust.trust_score_updated_at}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Reflects verified identity, operational reliability, reputation and platform compliance.
            Computed by the platform — you can never edit it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
