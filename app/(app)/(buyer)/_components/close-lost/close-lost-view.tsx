// P-BUY-18 Buyer "Close RFQ as lost" — host view (`T-DETAILS`, Doc-7F · planning → PI §13). Pure function
// of its view-model (Server Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route
// seeds state; the audit-backed `rfq.close_lost_rfq` (Doc-4E §E8.5, `can_approve_vendor_selection` /
// `can_award_rfq`) write is PARKED (Wave 4). Native GET form drives the optional confirm step — server
// navigation, no client state.
//
// REUSE: shell `Breadcrumbs` + `PageHeader`; kit `FormField`/`Card`/`Button`/`StatusChip`/`EmptyState`;
// buyer `Select`/`Textarea` (form-controls), `rfqStateDisplay`, `DescriptionList`.
//
// GOVERNANCE — NON-PENALIZING (Doc-3 §9.5 · Inv #11): closure is uniform and carries NO vendor-visible
// penalty. No "loser" language; no per-vendor outcome shown. `null` ⇒ not-found ≡ genuine absence
// (byte-identical; §7.5 / GI-12) — breadcrumb shows only the `RFQs` ancestor.

import Link from "next/link";
import { FileText, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { FormField } from "@/frontend/components/form-field";
import { Breadcrumbs, PageHeader } from "../../../_components/shell";
import { Select, Textarea } from "../form-controls";
import { DescriptionList, type DescriptionItem } from "../description-list";
import { rfqStateDisplay } from "../state-display";
import { Callout } from "../callout";
import {
  CLOSE_LOST_REASON_OPTIONS,
  type CloseLostData,
  type CloseLostReasonCode,
} from "./close-lost-view-models";

function reasonLabel(code?: CloseLostReasonCode): string | undefined {
  return CLOSE_LOST_REASON_OPTIONS.find((o) => o.value === code)?.label;
}

function Shell({
  humanRef,
  rfqId,
  children,
}: {
  humanRef?: string;
  rfqId: string;
  children: React.ReactNode;
}) {
  // The only source state for close_lost is `shortlisted` (Doc-4E §E8.5); label + tone both come from the
  // single state-display mapping (Content ≠ Presentation, Inv #9) — never re-asserted at the call site.
  const shortlisted = rfqStateDisplay("shortlisted");
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: humanRef ?? "RFQ", href: `/rfqs/${rfqId}` },
          { label: "Close as lost" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Close RFQ as lost"
        meta={<StatusChip label={shortlisted.label} tone={shortlisted.tone} />}
      />
      {children}
    </>
  );
}

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). Breadcrumb shows only the `RFQs` ancestor. */
function NotFoundState() {
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      {/* FZ-02: the in-view genuine-absence branch still needs a page heading; kept sr-only so the
          visual stays the minimal EmptyState card (its title renders as a <p>, not a heading). */}
      <h1 className="sr-only">RFQ not available</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="RFQ not available"
        description="This RFQ doesn't exist or isn't available to close."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

/** The uniform, non-penalizing closure note (Doc-3 §9.5) — shown on both steps. */
function NonPenalizingNote() {
  return (
    <Callout icon={<Info aria-hidden />}>
      Closing is uniform and carries no penalty to any vendor. Vendors are never told a buyer
      &ldquo;chose someone else&rdquo; — the reason you record here is for your own records.
    </Callout>
  );
}

export function CloseLostView({ data }: { data: CloseLostData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }

  const step = data.step ?? 0;
  const selectedLabel = reasonLabel(data.selectedReasonCode);

  // ── Step 1 — review & confirm the closure ───────────────────────────────────────────────────────────
  if (step === 1 && data.selectedReasonCode) {
    const summary: DescriptionItem[] = [
      { label: "Reason", value: selectedLabel ?? "—" },
      { label: "Detail", value: data.reasonText?.trim() ? data.reasonText : "—" },
    ];
    return (
      <Shell humanRef={data.humanRef} rfqId={data.rfqId}>
        <div className="flex max-w-2xl flex-col gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold">
                You are closing this RFQ as lost
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <DescriptionList items={summary} />
            </CardContent>
          </Card>

          <NonPenalizingNote />

          <Callout icon={<TriangleAlert aria-hidden />} tone="warning">
            Closing sets this RFQ to <span className="font-medium">Closed (lost)</span> and ends
            this sourcing round. To source again, reissue the RFQ.
          </Callout>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="mr-auto text-xs text-muted-foreground">
              Closing connects in the integration phase.
            </p>
            <Button asChild variant="secondary">
              <Link
                href={`/rfqs/${data.rfqId}/close-lost?reason=${data.selectedReasonCode}&detail=${encodeURIComponent(
                  data.reasonText ?? "",
                )}`}
              >
                Back
              </Link>
            </Button>
            <Button type="button" variant="destructive">
              Close as lost
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Step 0 — record the reason ──────────────────────────────────────────────────────────────────────
  // Native GET form: "Continue" submits `reason`/`detail` to `?step=confirm` — server navigation, no client
  // state. The detail field is always shown; it is REQUIRED only when the reason is "Other" (frozen rule).
  return (
    <Shell humanRef={data.humanRef} rfqId={data.rfqId}>
      <form
        method="get"
        action={`/rfqs/${data.rfqId}/close-lost`}
        className="flex max-w-2xl flex-col gap-5"
      >
        <input type="hidden" name="step" value="confirm" />

        <NonPenalizingNote />

        <FormField
          id="reason"
          label="Why are you closing this RFQ?"
          description="Recorded for your own records only."
          required
        >
          <Select
            name="reason"
            options={CLOSE_LOST_REASON_OPTIONS}
            placeholder="Select a reason"
            defaultValue={data.selectedReasonCode}
          />
        </FormField>

        <FormField
          id="detail"
          label="Reason detail"
          description="Required only if you choose &ldquo;Other&rdquo;."
        >
          <Textarea
            name="detail"
            placeholder="Add any detail for your records (optional unless the reason is Other)."
            defaultValue={data.reasonText}
          />
        </FormField>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="secondary">
            <Link href={`/rfqs/${data.rfqId}`}>Cancel</Link>
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Shell>
  );
}
