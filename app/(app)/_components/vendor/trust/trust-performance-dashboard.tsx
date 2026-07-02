// P-VND-28 Trust & Performance dashboard (T-DASHBOARD). Composes the three read-only governance
// signals declared by the screen spec: Trust Score (ring), Performance (stat-card), Verified
// Financial Tier (badge) — plus the frozen kit `embedded/trust-badge` as the compact header summary.
// No action exists anywhere on this page (read-only; "Admin decides, Trust owns" — §4 firewall). No
// exclusion/blacklist signal, no matching/ranking data (Invariant #11 / procurement moat). RSC-friendly.
import { EmptyState } from "@/frontend/components/empty-state";
import { TrustBadge } from "@/frontend/embedded/trust-badge";
import { PerformanceScoreCard } from "./performance-score-card";
import { TrustScoreCard } from "./trust-score-card";
import { VerifiedTierCard } from "./verified-tier-card";
import type { PerformanceScoreView, TrustScoreView, VerifiedTierView } from "./types";

export interface TrustPerformanceDashboardProps {
  trust?: TrustScoreView;
  performance?: PerformanceScoreView;
  verifiedTier?: VerifiedTierView;
}

export function TrustPerformanceDashboard({
  trust,
  performance,
  verifiedTier,
}: TrustPerformanceDashboardProps) {
  if (!trust && !performance && !verifiedTier) {
    return (
      <EmptyState
        title="Signals pending verification"
        description="Your trust, performance and verified-tier signals appear here once verification begins."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <TrustBadge
          tier={trust?.band}
          score={trust?.freeze_state === "frozen" ? undefined : trust?.score}
          verified={verifiedTier?.status === "verified"}
        />
        <p className="text-sm text-muted-foreground">Read-only — Admin decides, Trust owns.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TrustScoreCard trust={trust} />
        <PerformanceScoreCard performance={performance} />
        <VerifiedTierCard tier={verifiedTier} />
      </div>
    </div>
  );
}
