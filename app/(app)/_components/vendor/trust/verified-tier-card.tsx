// Verified Tier card (P-VND-28) — `trust.get_verified_tier.v1` (Doc-4G PassB Part1 §G4.8), public
// badge projection (band/status only, no internal basis). Trust-owned and READ-ONLY — distinct from
// the vendor's own DECLARED financial tier (Company Profile S4, M2-owned, editable; Invariant 10:
// Financial Tier ≠ Subscription Plan). Reuses the existing `TierChip` (Company Profile) rather than
// duplicating a second A–E chip. RSC-friendly.
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { TierChip } from "../company";
import type { VerifiedTierStatus, VerifiedTierView } from "./types";

const STATUS_LABEL: Record<VerifiedTierStatus, string> = {
  pending_verification: "Pending verification",
  verified: "Verified",
  suspended: "Suspended",
  expired: "Expired",
};

export interface VerifiedTierCardProps {
  tier?: VerifiedTierView;
}

export function VerifiedTierCard({ tier }: VerifiedTierCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verified Financial Tier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TierChip
          tier={tier?.tier}
          caption={tier?.status ? STATUS_LABEL[tier.status] : undefined}
          readOnly
        />
        {tier?.verified_at ? (
          <p className="text-xs text-muted-foreground">Verified {tier.verified_at}</p>
        ) : null}
        {tier?.next_review_at ? (
          <p className="text-xs text-muted-foreground">Next review {tier.next_review_at}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Trust-verified — distinct from the tier you declare in Company Profile.
        </p>
      </CardContent>
    </Card>
  );
}
