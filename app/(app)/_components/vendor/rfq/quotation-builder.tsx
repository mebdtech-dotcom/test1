// S4 Quote Authoring (compose) — the staged builder (companion §13.1), bound to a FIXED `rfq_version_id`
// snapshot (read = `rfq.get_rfq.v1`, grant-scoped [B-1]). The header band shows: the locked version,
// the window chip (live countdown deferred — no client clock), the Doc-5I quota, and a note that the
// frozen-required `invitation_id` + `rfq_id` are resolved server-side from the grant (not vendor-typed
// [m-4]). Draft persistence is client-local-only pending [ESC-7G-Q-DRAFT] — surfaced as an honest
// "saved on this device" note, NOT a server-persisted guarantee. The seven sections compose into the
// step rail. Server component; passes server-rendered sections through the client step wrapper.
import { Card, CardContent } from "@/frontend/primitives/card";
import { WindowStateChip } from "./window-state-chip";
import { QuotaMeter } from "./quota-meter";
import { QuotationBuilderSteps } from "./quotation-builder-steps";
import { PriceBreakdownTable } from "./price-breakdown-table";
import { QuotationTermsField } from "./quotation-terms-fields";
import { QuotationAttachments } from "./quotation-attachments";
import { QuotationPreview } from "./quotation-preview";
import { QuotationSubmitPanel } from "./quotation-submit-panel";
import type {
  PriceBreakdownLine,
  FileRefView,
  QuotaView,
  WindowState,
  WindowUrgency,
} from "./types";

export interface QuotationBuilderProps {
  rfqHumanRef?: string;
  versionLockedLabel?: string;
  windowState?: WindowState;
  windowDeadlineLabel?: string;
  windowUrgency?: WindowUrgency;
  quota?: QuotaView;
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  attachments?: FileRefView[];
}

export function QuotationBuilder({
  rfqHumanRef,
  versionLockedLabel,
  windowState,
  windowDeadlineLabel,
  windowUrgency,
  quota,
  lines,
  currency = "BDT",
  subtotal,
  deliveryTerms,
  warrantyTerms,
  specComplianceDeclaration,
  attachments,
}: QuotationBuilderProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Quoting {rfqHumanRef ?? "this RFQ"}
              </p>
              {versionLockedLabel ? (
                <p className="text-xs text-muted-foreground">
                  Version locked: {versionLockedLabel}
                </p>
              ) : null}
            </div>
            <WindowStateChip
              state={windowState}
              deadlineLabel={windowDeadlineLabel}
              urgency={windowUrgency}
            />
          </div>
          <QuotaMeter quota={quota} />
          <p className="text-xs text-muted-foreground">
            Your invitation and RFQ references are taken from your grant automatically — you do not
            enter them. Drafts are kept on this device until you submit.
          </p>
        </CardContent>
      </Card>

      <QuotationBuilderSteps
        ariaLabel="Quotation steps"
        steps={[
          {
            value: "price",
            label: "1 · Price",
            content: <PriceBreakdownTable lines={lines} currency={currency} subtotal={subtotal} />,
          },
          {
            value: "delivery",
            label: "2 · Delivery",
            content: <QuotationTermsField section="delivery" value={deliveryTerms} />,
          },
          {
            value: "warranty",
            label: "3 · Warranty",
            content: <QuotationTermsField section="warranty" value={warrantyTerms} />,
          },
          {
            value: "compliance",
            label: "4 · Compliance",
            content: <QuotationTermsField section="compliance" value={specComplianceDeclaration} />,
          },
          {
            value: "attachments",
            label: "5 · Attachments",
            content: <QuotationAttachments attachments={attachments} />,
          },
          {
            value: "preview",
            label: "6 · Preview",
            content: (
              <QuotationPreview
                lines={lines}
                currency={currency}
                subtotal={subtotal}
                deliveryTerms={deliveryTerms}
                warrantyTerms={warrantyTerms}
                specComplianceDeclaration={specComplianceDeclaration}
              />
            ),
          },
          {
            value: "submit",
            label: "7 · Submit",
            content: <QuotationSubmitPanel quota={quota} />,
          },
        ]}
      />
    </div>
  );
}
