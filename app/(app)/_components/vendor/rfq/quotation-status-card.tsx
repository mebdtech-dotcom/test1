// S5 Quotation Detail + immutable version history (companion §6.2/§6.7), surfaced on the RFQ detail as
// "Your quotation". Shows the vendor's OWN quotation state (Doc-4M), its human_ref (QTN-…), and the
// immutable version chain. Revise (new immutable version, no quota) and Withdraw (`submitted →
// withdrawn`, pre-award, terminal) are surfaced as pre-award-only actions — disabled in the
// presentation phase. Own standing only: NO rank, NO competitor existence (ND-2/ND-3). Renders a
// genuine-empty "no quotation yet" with a CTA when none exists. Presentation-only; RSC-friendly.
//
// FE-VEN-06 delta (P-VND-20 — withdraw = zero penalty): Withdraw now reads as the more consequential
// action (destructive-toned label on the existing outline variant, mirroring the FE-VEN-05 P-VND-16
// decline treatment, RV-0101) and states its consequence explicitly — withdrawing this quotation
// carries no penalty and does not affect standing on other RFQs — via `aria-describedby`, instead of
// leaving the milestone-defining "zero penalty" fact unstated near the action itself.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { QuotationStateChip } from "./state-chips";
import { QuotationVersionTimeline } from "./quotation-version-timeline";
import { QuotationOutcomePanel } from "./quotation-outcome-panel";
import type { EngagementHandoffView, QuotationView } from "./types";

export interface QuotationStatusCardProps {
  rfqId: string;
  quotation?: QuotationView;
  engagement?: EngagementHandoffView;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function QuotationStatusCard({
  rfqId,
  quotation,
  engagement,
  basePath = "/sell",
}: QuotationStatusCardProps) {
  if (!quotation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your quotation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <EmptyState
            title="No quotation yet"
            description="You haven't started a quotation for this RFQ. Begin one while the window is open."
          />
          <Button asChild>
            <Link href={`${basePath}/rfqs/${rfqId}/quotation`}>Start quotation →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Revise/Withdraw are pre-award only (submitted / shortlisted) — companion §6.4/§6.7.
  const preAward = quotation.state === "submitted" || quotation.state === "shortlisted";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Your quotation</CardTitle>
          <QuotationStateChip state={quotation.state} />
        </CardHeader>
        <CardContent className="space-y-4">
          {quotation.human_ref ? (
            <p className="font-mono text-sm text-muted-foreground">{quotation.human_ref}</p>
          ) : null}

          {quotation.versions && quotation.versions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Version history
              </p>
              <QuotationVersionTimeline versions={quotation.versions} />
            </div>
          ) : null}

          {preAward ? (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" size="sm" disabled>
                Revise
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                aria-describedby="quotation-withdraw-note"
                disabled
              >
                Withdraw
              </Button>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Revisions create a new version — earlier versions are kept and never deleted.
          </p>
          {preAward ? (
            <p id="quotation-withdraw-note" className="text-xs text-muted-foreground">
              Withdrawing is permanent for this quotation. It carries no score penalty and does not
              affect your standing on other RFQs.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <QuotationOutcomePanel state={quotation.state} engagement={engagement} basePath={basePath} />
    </div>
  );
}
