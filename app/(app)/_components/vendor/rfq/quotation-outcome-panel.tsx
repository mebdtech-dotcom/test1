// S9 Outcome / Award hand-off (companion §6.5 F / §6.7). Renders the vendor's OWN quotation outcome
// after the buyer closes the RFQ. Firewall-correct: NO rank, NO comparison, NO "why not selected"
// reason (ND-2/ND-3/ND-6). Only renders for an outcome state (selected / not_selected / expired).
//
// - selected (won): enriched hand-off — a concrete next step + any buyer-set acceptance deadline read
//   read-only from M4, and a primary CTA into the M4 engagement (navigation only — no cross-module
//   write, DP10).
// - not_selected (lost): firewall-correct zero-reason copy + a GENERIC "Strengthen your profile" CTA
//   that is decoupled from this RFQ (byte-equivalence-safe).
// - expired: neutral, terminal.
// Presentation-only; RSC-friendly.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { QuotationStateChip } from "./state-chips";
import type { EngagementHandoffView, QuotationState } from "./types";

export interface QuotationOutcomePanelProps {
  state?: QuotationState;
  engagement?: EngagementHandoffView;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function QuotationOutcomePanel({
  state,
  engagement,
  basePath = "/sell",
}: QuotationOutcomePanelProps) {
  if (state !== "selected" && state !== "not_selected" && state !== "expired") return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Outcome</CardTitle>
        <QuotationStateChip state={state} />
      </CardHeader>
      <CardContent className="space-y-3">
        {state === "selected" ? (
          <>
            <p className="text-sm text-foreground">
              Your quotation was selected. The next step is to open the engagement to proceed.
            </p>
            {engagement?.acceptance_deadline_label ? (
              <p className="text-sm text-muted-foreground">
                Acceptance deadline: {engagement.acceptance_deadline_label}
              </p>
            ) : null}
            <Button asChild>
              <Link href={engagement?.href ?? `${basePath}/engagements`}>Open engagement</Link>
            </Button>
          </>
        ) : null}

        {state === "not_selected" ? (
          <>
            <p className="text-sm text-foreground">This RFQ has been closed.</p>
            <Button asChild variant="outline">
              <Link href={`${basePath}/company`}>Strengthen your profile</Link>
            </Button>
          </>
        ) : null}

        {state === "expired" ? (
          <p className="text-sm text-muted-foreground">
            The quotation window for this RFQ has closed.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
