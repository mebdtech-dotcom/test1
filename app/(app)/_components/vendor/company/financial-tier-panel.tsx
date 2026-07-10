// S4 Financial Tier — DP6 enforced (Tier ≠ Plan). DECLARED tier (vendor-editable, A–E) and VERIFIED
// tier (M5/Trust-owned, READ-ONLY firewall) are physically separated panes; plan lives in a separate
// Billing node (disclaimer + link). Append-only tier history (Invariant 8). This is the FINANCIAL
// TIER signal — NOT the Trust/Performance score (no 0–100, no kit trust-badge, no `score`).
// Presentation-only: native select is the interim declared-tier control ([ESC-7B-SELECT] pending).
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FormField } from "@/frontend/components/form-field";
import { MatchingContextBanner } from "./matching-context-banner";
import { PresentationFormNote, VENDOR_SELECT_CLASS } from "../shared";
import { TierChip } from "./tier-chip";
import { TierHistoryList } from "./tier-history-list";
import type { FinancialTier, TierHistoryEntry, VendorProfileView } from "./types";

const TIERS: FinancialTier[] = ["A", "B", "C", "D", "E"];

export interface FinancialTierPanelProps {
  profile?: VendorProfileView;
  history?: TierHistoryEntry[];
  /** Billing route (DP6: plan is managed in a separate node). */
  billingHref?: string;
}

export function FinancialTierPanel({
  profile,
  history,
  billingHref = "/workspace/billing",
}: FinancialTierPanelProps) {
  return (
    <div className="space-y-6">
      <MatchingContextBanner />

      <div
        role="note"
        className="flex items-start gap-2 rounded-md border border-iv-warning-base bg-iv-warning-subtle px-3 py-2 text-sm text-iv-warning-text"
      >
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          Financial Tier is your capability size (A–E). It is <strong>not</strong> your subscription
          plan. Manage your plan in{" "}
          <Link href={billingHref} className="font-medium underline underline-offset-2">
            Billing
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declared tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TierChip tier={profile?.declared_tier} caption="declared" />
            <FormField
              id="declared-tier"
              label="Set your declared tier"
              description="You declare your financial capability size; Trust verifies it independently."
            >
              <select
                id="declared-tier"
                name="tier"
                defaultValue={profile?.declared_tier ?? ""}
                className={VENDOR_SELECT_CLASS}
              >
                <option value="">Select tier…</option>
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    Tier {tier}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <PresentationFormNote />
              <Button type="button" disabled>
                Update tier
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verified tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TierChip tier={profile?.verified_tier} caption="verified" readOnly />
            <p className="text-sm text-muted-foreground">
              Set by Trust after verification. This value is read-only — you cannot edit it.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tier history</CardTitle>
        </CardHeader>
        <CardContent>
          <TierHistoryList entries={history} />
        </CardContent>
      </Card>
    </div>
  );
}
