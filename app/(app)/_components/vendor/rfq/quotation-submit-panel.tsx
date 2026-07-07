// S4 Quote Authoring · Section 7 — SUBMIT (companion §13.1, the only quota-consuming action). Submit
// composes `rfq.submit_quotation.v1` carrying all EIGHT frozen request fields — the six vendor-authored
// (`price_breakdown`, `delivery_terms`, `warranty_terms` (opt), `spec_compliance_declaration`,
// `attachments_refs`, `rfq_version_id`) plus the two server-derived-from-grant inputs (`invitation_id`,
// `rfq_id`, resolved from rfq_invitation_grantees at S4 entry [m-4]) — with a required idempotency key.
//
// Submit is enabled server-side iff: state==draft ∧ frozen-required sections ✓ (NOT warranty [m-3]) ∧
// quota>0 ∧ window OPEN ∧ attachments committed [N-Q3]. Here it is DISABLED (presentation) with a
// visible reason and a completeness summary [M-Q4]. Quota is consumed once, server-reflected (never
// client-decremented). No AI advisory in this build (render-only-if-wired → omitted). RSC-friendly.
import { Button } from "@/frontend/primitives/button";
import { QuotaMeter } from "./quota-meter";
import { PresentationFormNote } from "../shared";
import type { QuotaView } from "./types";

export interface QuotationSubmitPanelProps {
  quota?: QuotaView;
  /** Owner PRD 2026-07-07 §7: the submit action moved to the preview dialog — the authoring page
   *  hides this button. Defaults true so other mounts keep their behavior. */
  showSubmitAction?: boolean;
  /** Owner PRD 2026-07-07 §6: the presentation-only notice is suppressed on the authoring page. */
  showPresentationNote?: boolean;
}

export function QuotationSubmitPanel({
  quota,
  showSubmitAction = true,
  showPresentationNote = true,
}: QuotationSubmitPanelProps) {
  return (
    <div className="space-y-4">
      <QuotaMeter quota={quota} />

      {/* Darker foreground ink for readability (owner PRD 2026-07-07 §4); warning tint kept on the frame. */}
      <div className="rounded-md border border-iv-warning-base bg-iv-warning-subtle px-3 py-2 text-sm text-foreground">
        <p className="font-semibold">Before you can submit</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Complete all required quotation information.</li>
          <li>Enter pricing for every applicable item.</li>
          <li>Review commercial terms and compliance.</li>
          <li>Upload all referenced attachments.</li>
          <li>Ensure the quotation submission window is still open.</li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Submitting consumes one quota unit and seals your quotation at version&nbsp;1. Afterwards
        you can revise it (a new version, no quota) or withdraw it before award. The invitation and
        RFQ references are taken from your grant automatically.
      </p>

      {showSubmitAction || showPresentationNote ? (
        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          {showPresentationNote ? <PresentationFormNote /> : <span />}
          {showSubmitAction ? (
            <Button type="button" disabled>
              Submit quotation
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
