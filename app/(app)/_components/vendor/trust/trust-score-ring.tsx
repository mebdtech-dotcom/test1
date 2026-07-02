// Trust score-ring (P-VND-28 §4.1 "score-ring" requirement) — no dedicated kit primitive exists yet
// (page_templates.md §4.3/§5.3 list "score-ring / trust-badge" as interchangeable read-only signal
// components; Doc-7B fixes the inventory, not the code — the exact realization is feature-local,
// same posture as `TierChip` pending its own kit primitive). SVG-based, presentation-only: renders
// the score AS GIVEN, computes nothing. Frozen-suppressed and absent-score states never fabricate a
// ring fill. RSC-friendly.
const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface TrustScoreRingProps {
  /** The frozen `trust.get_trust_score.v1` score (0–100) — permitted per the Board ruling 2026-07-03. */
  score?: number;
  /** `freeze_state=frozen` — publication suppressed; never render a stale/fabricated ring. */
  frozen?: boolean;
}

export function TrustScoreRing({ score, frozen }: TrustScoreRingProps) {
  const hasScore = !frozen && typeof score === "number";
  const clamped = hasScore ? Math.max(0, Math.min(100, score as number)) : 0;
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={
        frozen
          ? "Trust score suppressed while frozen"
          : hasScore
            ? `Trust score ${score} out of 100`
            : "Trust score unavailable"
      }
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          className="fill-none stroke-border"
        />
        {hasScore ? (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="fill-none stroke-iv-brand-600"
          />
        ) : null}
      </svg>
      <span
        aria-hidden="true"
        className="absolute text-lg font-semibold tabular-nums text-foreground"
      >
        {frozen || !hasScore ? "—" : score}
      </span>
    </div>
  );
}
