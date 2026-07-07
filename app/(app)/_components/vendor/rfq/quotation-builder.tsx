// S4 Quote Authoring (compose) — the quotation builder (companion §13.1), bound to a FIXED
// `rfq_version_id` snapshot (read = `rfq.get_rfq.v1`, grant-scoped [B-1]). The navy hero card was
// REMOVED (owner 2026-07-07); the former hero-band facts survive: locked version + window chip +
// deadline render in the RFQ-details grid, the Doc-5I quota + the [m-4] "references resolved from
// your grant" note render in the submit panel. Draft persistence is client-local-only pending
// [ESC-7G-Q-DRAFT] — surfaced as an honest "saved on this device" note, NOT a server-persisted note.
//
// Owner functional spec delta (2026-07-06): the static section cards are replaced by the INTERACTIVE
// QuotationWorkbench (client) — amendable item rows with undo + amber tracking, live row totals,
// AIT/VAT/grand-total math, currency select, condition groups + device-local reusable sets, buyer
// read-only conditions, submission info, live preview. All seven §13.1 sections remain present.
// Contract gaps are registered intake (ESC-QTN-AMEND / -TERMS-GROUPS / -CONDITION-SETS /
// -SUBMIT-INFO / -CURRENCY-LIST — see esc_registry.md); nothing here wires a server write and
// submit stays disabled. This file stays a Server Component: hero + parameters strip render on the
// server; only the workbench is client.
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { WindowStateChip } from "./window-state-chip";
import { QuotationWorkbench } from "./quotation-workbench";
import { RfqQuickActions } from "./rfq-quick-actions";
import type {
  PriceBreakdownLine,
  FileRefView,
  QuotaView,
  RfqSnapshotView,
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
  /** The vendor-entitled RFQ snapshot (rfq.get_rfq.v1, already granted) — RFQ details + parameters strip. */
  rfq?: RfqSnapshotView;
  /** SYSTEM-MANAGED revision display (owner ruling 2026-07-07): count of already-submitted immutable
   *  versions (frozen `current_version_no`); a never-submitted draft is Rev 0. Read-only. */
  revisionNo?: number;
  /** Contact defaults from the shell identity source (the signed-in user when wired). */
  defaultContactPerson?: string;
  defaultContactNumber?: string;
}

export function QuotationBuilder({
  versionLockedLabel,
  quota,
  lines,
  currency = "BDT",
  deliveryTerms,
  warrantyTerms,
  specComplianceDeclaration,
  attachments,
  rfq,
  revisionNo,
  defaultContactPerson,
  defaultContactNumber,
}: QuotationBuilderProps) {
  const parameterBlocks = [
    { label: "Brand preference", value: rfq?.brand_preference },
    { label: "Standards required", value: rfq?.standards },
    { label: "Site location", value: rfq?.delivery_location ?? rfq?.delivery_geography },
    { label: "Certifications", value: rfq?.certifications },
  ] as const;

  // Vendor-visible urgency = the UI-derived window urgency label (companion §7.1). The buyer's
  // INTERNAL priority guidance is ND-excluded by design (types.ts non-disclosure block) — never shown.
  const priorityLabel = rfq?.window_urgency
    ? (
        {
          normal: "Standard",
          soon: "High — window closing soon",
          imminent: "Urgent — window closing imminently",
        } as const
      )[rfq.window_urgency]
    : undefined;

  // RFQ Details rows (owner directive 2026-07-07). Every value binds an existing granted snapshot
  // field; Buyer / Contact person render genuine-empty until the wired grant read carries them —
  // never fabricated. "Remaining time" = the window chip (live countdown deferred — no client clock).
  const rfqDetailRows: { label: string; value: ReactNode }[] = [
    {
      label: "RFQ number",
      value: rfq?.human_ref ? <span className="font-mono">{rfq.human_ref}</span> : undefined,
    },
    { label: "RFQ title", value: rfq?.summary },
    { label: "Buyer", value: rfq?.buyer_org_name },
    { label: "Plant", value: rfq?.delivery_site ?? rfq?.delivery_location },
    { label: "Contact person", value: rfq?.contact_person },
    { label: "Phone", value: rfq?.contact_phone ?? rfq?.contact_whatsapp },
    { label: "Email", value: rfq?.contact_email },
    { label: "Deadline", value: rfq?.window_deadline_label },
    { label: "Priority", value: priorityLabel },
    {
      label: "Remaining time",
      value: rfq?.window_state ? (
        <WindowStateChip
          state={rfq.window_state}
          deadlineLabel={rfq.window_deadline_label}
          urgency={rfq.window_urgency}
        />
      ) : undefined,
    },
    { label: "Version locked", value: versionLockedLabel },
  ];

  return (
    <div className="space-y-6">
      {/* RFQ details (owner directive 2026-07-07) — granted snapshot facts + quick actions.
          The navy hero card was REMOVED per owner 2026-07-07; its load-bearing facts survive
          elsewhere: quota + grant note render in the submit panel, deadline/remaining time render
          here, and the locked-version fact moved into this grid. */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">RFQ details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {rfqDetailRows.map((row) => (
              <div key={row.label}>
                <dt className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {row.value ?? <span className="font-normal text-muted-foreground">—</span>}
                </dd>
              </div>
            ))}
          </dl>
          {rfq?.rfq_id ? <RfqQuickActions rfqId={rfq.rfq_id} /> : null}
        </CardContent>
      </Card>

      {/* Buyer parameters strip — existing granted snapshot fields only */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Buyer requirements &amp; parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {parameterBlocks.map((block) => (
            <div key={block.label}>
              <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                {block.label}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {block.value ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interactive workbench — items/pricing, terms + sets, compliance, attachments, submit, preview */}
      <QuotationWorkbench
        rfq={rfq}
        lines={lines}
        currency={currency}
        deliveryTerms={deliveryTerms}
        warrantyTerms={warrantyTerms}
        specComplianceDeclaration={specComplianceDeclaration}
        attachments={attachments}
        quota={quota}
        revisionNo={revisionNo}
        defaultContactPerson={defaultContactPerson}
        defaultContactNumber={defaultContactNumber}
      />
    </div>
  );
}
