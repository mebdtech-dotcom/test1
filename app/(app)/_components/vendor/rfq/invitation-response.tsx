// S3 RFQ Detail — YOUR INVITATION pane (companion §6.3/§6.5). The vendor accepts or declines the
// invitation (`delivered → {accepted | declined}` via `respond_to_invitation`) and starts a quotation.
// Decline is permanent FOR THIS INVITATION only — the vendor can still be invited to other RFQs and
// there is NO score penalty (firewall; non-leaking copy, §6.5). All actions are disabled in the
// presentation phase. The "Accept invitation & start quotation" CTA links to S4 (the same navigation
// the previous "Start quotation" link provided); one quota unit is used only at SUBMIT.
// Presentation-only; RSC-friendly.
//
// FE-VEN-05 delta (clearer respond/decline affordances): Decline reads as the more consequential
// action (outline + destructive-toned label, matching the kit's existing outline/destructive
// vocabulary — no new variant), and `aria-describedby` ties it directly to the no-penalty consequence
// note so the causal link ("declining does X") is announced together, not just visually adjacent.
//
// Invitation-hero redesign delta (owner reference design): the card now leads with a navy hero
// (eyebrow + RFQ title + human_ref badge), a three-block summary strip (district / urgency /
// request type) and a single-line item-requirements table. Every value binds an EXISTING
// `RfqSnapshotView` field already granted to this vendor via `rfq.get_rfq.v1` — passed down from the
// page's existing read, no new fetch and no coined field. The buyer's routing/priority guidance
// stays ND-excluded: "urgency" here is the delivery-date requirement, never the buyer's internal
// priority. The h2 outline entry remains "Your invitation" (the eyebrow), unchanged.
import Link from "next/link";
import { Factory, Package } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { InvitationStateChip } from "./state-chips";
import { QuotaMeter } from "./quota-meter";
import { PresentationFormNote } from "../shared";
import type { InvitationView, QuotaView, RfqSnapshotView, WorkNature } from "./types";

const WORK_NATURE_LABEL: Record<WorkNature, string> = {
  supply: "Supply",
  service: "Service",
  fabricate: "Fabricate",
  consult: "Consult",
};

export interface InvitationResponseProps {
  rfqId: string;
  invitation?: InvitationView;
  quota?: QuotaView;
  /** True once the vendor has a quotation on this RFQ — the CTA becomes "Resume" (companion §6.5 B). */
  hasQuotation?: boolean;
  /** The vendor-entitled RFQ snapshot the page already fetched (rfq.get_rfq.v1) — hero/strip/table data. */
  rfq?: RfqSnapshotView;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function InvitationResponse({
  rfqId,
  invitation,
  quota,
  hasQuotation,
  rfq,
  basePath = "/sell",
}: InvitationResponseProps) {
  const responded =
    invitation?.state === "accepted" ||
    invitation?.state === "declined" ||
    invitation?.state === "expired";

  const quantityLine = [rfq?.quantity, rfq?.unit].filter(Boolean).join(" ") || undefined;
  const hasItemLine = Boolean(rfq?.item_name || rfq?.standards || quantityLine);
  const lineCount = hasItemLine ? 1 : 0;

  const requestType =
    rfq?.work_nature && rfq.work_nature.length > 0
      ? rfq.work_nature.map((w) => WORK_NATURE_LABEL[w]).join(" · ")
      : undefined;

  const ctaLabel = hasQuotation
    ? "Resume quotation →"
    : responded
      ? "Start quotation →"
      : "Accept invitation & start quotation";

  return (
    <Card className="overflow-hidden">
      {/* 1 · Navy hero */}
      <div className="bg-iv-navy-900 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/10"
            >
              <Factory className="size-5 text-iv-amber-400" />
            </span>
            <div className="min-w-0 space-y-1.5">
              <h2 className="text-2xs font-semibold uppercase leading-none tracking-wide text-iv-navy-200">
                Your invitation
              </h2>
              <p className="text-xl font-semibold leading-snug tracking-tight text-white">
                {rfq?.summary ?? "RFQ invitation"}
              </p>
              <p className="text-sm text-iv-navy-200">
                You have been invited to quote on this RFQ.
                {invitation?.delivered_at ? <> Delivered {invitation.delivered_at}.</> : null}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {rfq?.human_ref ? <Badge variant="amber">{rfq.human_ref}</Badge> : null}
            <InvitationStateChip state={invitation?.state} />
          </div>
        </div>
      </div>

      {/* 2 · Summary strip */}
      <div className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
        {(
          [
            { label: "Project district", value: rfq?.delivery_district ?? rfq?.delivery_geography },
            { label: "Urgency requirement", value: rfq?.delivery_date_label },
            { label: "Request type selected", value: requestType },
          ] as const
        ).map((block) => (
          <div key={block.label} className="bg-card p-4">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {block.label}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {block.value ?? <span className="text-muted-foreground">—</span>}
            </p>
          </div>
        ))}
      </div>

      {/* 3 · Item requirements */}
      <div className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Package aria-hidden="true" className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold leading-none">Item requirements</h3>
          <Badge variant="neutral">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </Badge>
        </div>

        {hasItemLine ? (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Item requirements</caption>
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    #
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Item name / dimensions
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Required size specification
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Required quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2 text-muted-foreground">1</td>
                  <td className="px-3 py-2 text-foreground">{rfq?.item_name ?? "—"}</td>
                  <td className="px-3 py-2 text-foreground">{rfq?.standards ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{quantityLine ?? "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No item lines shared"
            description="The item requirements the buyer shares for this RFQ appear here."
          />
        )}
      </div>

      {/* 4 · Decline-consequence notice + 5 · Actions */}
      <div className="space-y-4 p-6 pt-0">
        <p
          id="invitation-decline-note"
          className="rounded-md border border-iv-amber-100 bg-iv-amber-50 px-4 py-3 text-sm text-iv-amber-700"
        >
          Declining is permanent for this invitation. You can still be invited to other RFQs, and it
          carries no score penalty.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          {!responded ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              aria-describedby="invitation-decline-note"
              disabled
            >
              Decline invitation
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          <Button asChild>
            <Link href={`${basePath}/rfqs/${rfqId}/quotation`}>{ctaLabel}</Link>
          </Button>
        </div>

        <QuotaMeter quota={quota} />

        <PresentationFormNote />
      </div>
    </Card>
  );
}
