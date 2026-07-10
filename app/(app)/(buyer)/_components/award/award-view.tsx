// P-BUY-17 Buyer Award — host view (`T-WIZARD`, Doc-7F · planning → PI §13). Pure function of its view-model
// (Server Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route page seeds the
// state; the audit-backed `rfq.award_rfq.v1` (Doc-4E §E8.4) write is PARKED (Wave 4 · `can_award_rfq`).
//
// REUSE: shell `Breadcrumbs`; buyer `WizardStepper` (from rfq-create — the T-WIZARD chrome), `Money`/
// `formatDate`, `quotationStateDisplay`; kit `Card`/`Button`/`StatusChip`/`EmptyState`.
//
// GOVERNANCE (R6 / Inv #12): the buyer EXPLICITLY selects EXACTLY ONE shortlisted quotation (1:1) — no
// auto-winner, no recommended/best cue, no ranking; candidates in System order, never re-ranked. Award is
// IRREVERSIBLE (`shortlisted → closed_won`); split = reissue, never multi-award; above the org threshold it
// needs Director/Owner approval (server-enforced). No money moves here (R8) — the engagement opens post-award.

import Link from "next/link";
import { FileText, ShieldAlert, TriangleAlert } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { cn } from "@/frontend/lib/cn";
import { Breadcrumbs } from "../../../_components/shell";
import { WizardStepper } from "../rfq-create/wizard-stepper";
import { DescriptionList, type DescriptionItem } from "../description-list";
import { Money, formatDate } from "../format";
import { quotationStateDisplay } from "../state-display";
import { RADIO_INPUT_CLASS } from "../form-controls";
import { Callout } from "../callout";
import type { AwardData, AwardCandidate } from "./award-view-models";

const AWARD_STEPS = [
  { key: "select", label: "Select vendor" },
  { key: "confirm", label: "Review & confirm" },
];

function Shell({
  humanRef,
  rfqId,
  step,
  children,
}: {
  humanRef?: string;
  rfqId: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: humanRef ?? "RFQ", href: `/rfqs/${rfqId}` },
          { label: "Award" },
        ]}
        className="mb-4"
      />
      <header className="mb-6">
        {/* FZ-03: font-bold to match the shell PageHeader's weight (was font-semibold) — this hero
            keeps its own hand-rolled <header> (a description with an embedded Link, no actions slot)
            rather than routing through PageHeader, whose `description` prop is a plain string. */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Award RFQ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose one vendor to award. Awarding is a deliberate, final act — not a ranking.{" "}
          <Link
            href={`/rfqs/${rfqId}/compare`}
            className="rounded-sm text-iv-brand-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Review the comparison
          </Link>
          .
        </p>
      </header>
      <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-iv-xs">
        <WizardStepper steps={AWARD_STEPS} activeStep={step} />
      </div>
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
      <h1 className="sr-only">Award not available</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Award not available"
        description="This RFQ doesn't exist or isn't available to award."
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

/** One shortlisted candidate as a radio-selectable card (explicit single choice — 1:1). */
function CandidateCard({ c, checked }: { c: AwardCandidate; checked: boolean }) {
  const s = quotationStateDisplay(c.state);
  return (
    <label
      htmlFor={`award-${c.quotationId}`}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 has-[:checked]:border-iv-brand-600 has-[:checked]:ring-1 has-[:checked]:ring-iv-brand-600"
    >
      {/* FZ-04: shared RADIO_INPUT_CLASS (form-controls.tsx) — this card is already the label, so the
          RadioRow component (which owns its own <label>) can't nest here without invalid HTML; the
          underlying input styling stays consistent with every other radio in the buyer surface. */}
      <input
        type="radio"
        id={`award-${c.quotationId}`}
        name="sel"
        value={c.quotationId}
        defaultChecked={checked}
        className={cn("mt-1", RADIO_INPUT_CLASS)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-foreground">{c.vendorName}</span>
          <StatusChip label={s.label} tone={s.tone} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
          <span className="text-foreground">
            <Money value={c.amount} />
          </span>
          {c.delivery ? <span>{c.delivery}</span> : null}
          {c.validUntil ? <span>Valid until {formatDate(c.validUntil)}</span> : null}
        </div>
      </div>
    </label>
  );
}

export function AwardView({ data }: { data: AwardData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }

  const step = data.step ?? 0;

  if (data.candidates.length === 0) {
    // Visibility-gated: award has nothing to act on until the buyer shortlists (never implies exclusion).
    return (
      <Shell humanRef={data.humanRef} rfqId={data.rfqId} step={0}>
        <EmptyState
          title="No shortlisted quotations to award"
          description="Shortlist the quotations you want to consider first — you award one of your shortlist."
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href={`/rfqs/${data.rfqId}`}>Back to RFQ</Link>
            </Button>
          }
          className="py-12"
        />
      </Shell>
    );
  }

  const selected = data.candidates.find((c) => c.quotationId === data.selectedQuotationId);

  // ── Step 1 — review & confirm the single award ──────────────────────────────────────────────────────
  if (step === 1 && selected) {
    const summary: DescriptionItem[] = [
      { label: "Vendor", value: selected.vendorName },
      { label: "Award value", value: <Money value={selected.amount} /> },
      { label: "Delivery", value: selected.delivery ?? "—" },
    ];
    return (
      <Shell humanRef={data.humanRef} rfqId={data.rfqId} step={1}>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold">You are awarding</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <DescriptionList items={summary} />
            </CardContent>
          </Card>

          {data.aboveThreshold ? (
            <Callout icon={<ShieldAlert aria-hidden />}>
              This award value is above your organization&rsquo;s threshold — a Director or Owner
              must approve it before it takes effect.
            </Callout>
          ) : null}

          <Callout icon={<TriangleAlert aria-hidden />} tone="warning">
            Awarding is <span className="font-medium">final</span> and awards exactly one vendor
            (1:1) — it can&rsquo;t be changed. To source from more than one vendor, reissue the RFQ.
            An engagement opens automatically once you award.
          </Callout>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="mr-auto text-xs text-muted-foreground">
              Awarding connects in the integration phase.
            </p>
            <Button asChild variant="secondary">
              <Link href={`/rfqs/${data.rfqId}/award?sel=${data.selectedQuotationId}`}>Back</Link>
            </Button>
            <Button type="button">Confirm award</Button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Step 0 — select exactly one shortlisted vendor ──────────────────────────────────────────────────
  // Native GET form: "Continue" submits the chosen radio to `?step=confirm&sel=<id>` — server navigation, no
  // client state. NO vendor is pre-selected (R6 — no default winner). The radios are a labelled group.
  return (
    <Shell humanRef={data.humanRef} rfqId={data.rfqId} step={0}>
      <form method="get" action={`/rfqs/${data.rfqId}/award`} className="flex flex-col gap-3">
        <input type="hidden" name="step" value="confirm" />
        <fieldset className="flex flex-col gap-3">
          {/* FZ-08: required indicator, mirroring the sibling checkbox-group's pattern
              (rfq-sections.tsx Request-type fieldset) — asterisk decorative + explicit sr-only text. */}
          <legend className="text-sm font-medium text-foreground">
            Choose one vendor to award
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </legend>
          <p className="text-sm text-muted-foreground">
            Shown in the order provided — not ranked; there is no recommended winner.
          </p>
          {data.candidates.map((c) => (
            <CandidateCard
              key={c.quotationId}
              c={c}
              checked={c.quotationId === data.selectedQuotationId}
            />
          ))}
        </fieldset>
        <div className="sticky bottom-0 z-10 mt-1 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur">
          <p className="mr-auto text-xs text-muted-foreground">
            One vendor is awarded (1:1). This can&rsquo;t be undone.
          </p>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Shell>
  );
}
