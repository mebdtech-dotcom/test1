// P-BUY-RFQ (RFQ create · P-BUY-07 · `T-WIZARD`) — host view. Pure function of its view-model (Server
// Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route page seeds a blank draft;
// a client form surface wires values + the (audit-backed) `create_rfq`/`submit_rfq` writes at integration
// (Wave 4; PARKED behind the write-wiring milestone). PRESENTATION-ONLY.
//
// REUSE: shell `Breadcrumbs`; kit `Card`/`Button`/`FormField`/`EmptyState`/`ErrorState`; buyer `Textarea`/
// `Select`/`DescriptionList`; buyer-scoped `WizardStepper` + `UploadArea`.
//
// GOVERNANCE: no real submit/mutation/upload/search/AI/matching (Board scope). The buyer sets routing
// BREADTH (`routing_mode`) + preference hints — never matching weights (R6); the engine decides who is
// invited. No money moves (R8 — payment is a stated preference). Draft is permissive (Doc-3 §1.2); the
// submit-required fields (budget / district / routing) are noted, never enforced client-side here.

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { ErrorState } from "@/frontend/components/error-state";
import { Breadcrumbs } from "../../../_components/shell";
import { WizardStepper } from "./wizard-stepper";
import { UploadArea } from "./upload-area";
import { SubmitPreview } from "./submit-preview";
import { CommunicationSection } from "./communication-section";
import {
  TitledCard,
  RequirementSection,
  TechnicalSection,
  DeliverySection,
  VendorSection,
  BudgetSection,
} from "./rfq-sections";
import { RFQ_WIZARD_STEPS } from "./rfq-options";
import type { RfqCreateData } from "./rfq-form-models";

/** Phase 8 — success page (presentation only; no RFQ is actually created this milestone). */
function SubmittedState() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 aria-hidden className="size-10 text-iv-success-base" />
          <h1 className="text-xl font-semibold text-foreground">Request submitted</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Your RFQ has been created as a draft. Once wired, it routes to matching vendors and
            you&rsquo;ll see quotations as they arrive.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/rfqs">Go to my RFQs</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/rfqs/new">Create another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RfqCreateView({ data }: { data: RfqCreateData }) {
  const submission = data.submission ?? "idle";

  if (submission === "success") {
    return <SubmittedState />;
  }

  const { form } = data;
  const submitting = submission === "submitting";

  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs
        items={[{ label: "RFQs", href: "/rfqs" }, { label: "New RFQ" }]}
        className="mb-4"
      />

      {/* Phase 1 — hero. FZ-03: font-bold to match the shell PageHeader's weight (was font-semibold)
          — this wizard hero keeps its own hand-rolled <header> (no actions slot) rather than routing
          through PageHeader. */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create a request for quotation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe what you need; the routing engine matches verified vendors and gathers
          quotations.
        </p>
      </header>

      {/* Phase 1 — progress indicator. Sticky below the shell topbar (h-14 = top-14), porting the
          reference prototype's sticky steps bar; scroll-spy/click-to-scroll is prototype-only JS
          flourish and intentionally left out (this stays a Server Component). */}
      <div className="sticky top-14 z-[var(--iv-z-sticky)] -mx-4 mb-6 border-b border-border bg-card/95 px-4 py-3 shadow-iv-xs backdrop-blur sm:-mx-6 sm:px-6">
        <WizardStepper steps={RFQ_WIZARD_STEPS} activeStep={data.activeStep ?? 0} />
      </div>

      {submission === "error" ? (
        <ErrorState
          errorClass="DEPENDENCY"
          message="We couldn’t submit your request just now. Your draft is safe — please try again."
          className="mb-6"
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/rfqs/new">Try again</Link>
            </Button>
          }
        />
      ) : null}

      {/* Single-column stacked section cards — the Review column is retired; Review now surfaces as a
          floating preview from the Submit action below (see SubmitPreview). */}
      <div className="mx-auto flex max-w-[var(--iv-content-max)] flex-col gap-4 pb-8">
        <RequirementSection form={form} />
        <TechnicalSection form={form} />
        <TitledCard title="Attachments">
          <UploadArea attachments={form.attachments} />
        </TitledCard>
        <DeliverySection form={form} />
        <VendorSection form={form} />
        <BudgetSection form={form} />
        <CommunicationSection form={form} />
      </div>

      {/* Phase 8 — submit action. Save Draft is a disabled placeholder; Submit opens a floating
          Review preview (Edit / Confirm) rather than submitting directly — still presentation-only. */}
      <SubmitPreview form={form} submitting={submitting} />
    </div>
  );
}
