// P-BUY-RFQ (RFQ create · P-BUY-07 · `T-WIZARD`) — host view. Pure function of its view-model (Server
// Component; no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route page seeds a blank draft;
// a client form surface wires values + the (audit-backed) `create_rfq`/`submit_rfq` writes at integration
// (Wave 4; PARKED behind the write-wiring milestone). PRESENTATION-ONLY.
//
// REUSE: shell `Breadcrumbs`; kit `Card`/`Button`/`FormField`/`EmptyState`/`ErrorState`; buyer `Textarea`/
// `Select`/`DescriptionList`; buyer-scoped `UploadArea` + `Callout`.
//
// GOVERNANCE: no real submit/mutation/upload/search/AI/matching (Board scope). The buyer sets routing
// BREADTH (`routing_mode`) + preference hints — never matching weights (R6); the engine decides who is
// invited. No money moves (R8 — payment is a stated preference). Draft is permissive (Doc-3 §1.2); the
// submit-required fields (budget / district / routing) are noted, never enforced client-side here.

import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { ErrorState } from "@/frontend/components/error-state";
import { Breadcrumbs } from "../../../_components/shell";
import { Callout } from "../callout";
import { UploadArea } from "./upload-area";
import { SubmitPreview } from "./submit-preview";
import { CommunicationSection } from "./communication-section";
import { TermsConditionsSection } from "./terms-conditions-section";
import {
  TitledCard,
  RequirementSection,
  TechnicalSection,
  DeliverySection,
  VendorSection,
  BudgetSection,
} from "./rfq-sections";
import type { RfqCreateData } from "./rfq-form-models";

/** Phase 8 — success page (presentation only; no RFQ is actually created this milestone). */
function SubmittedState() {
  return (
    <>
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
    </>
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
    <>
      {/* Owner directive 2026-07-07: crumb points back to the Buyer Dashboard (was "RFQs"). */}
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "New RFQ" }]}
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

      {/* Privacy affordance (owner-specified copy 2026-07-10 — trust_adoption_ladder §5.3). There is
          deliberately NO public/private option: RFQs are always private (Doc-3 §5.1 — distributed,
          never published), so the page states the guarantee instead of asking. */}
      <Callout icon={<Lock aria-hidden />} className="mb-6">
        <span className="font-medium text-foreground">Privacy by Design</span> — Your RFQ is never
        publicly published.
      </Callout>

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
      <div className="flex flex-col gap-4 pb-8">
        <RequirementSection form={form} />
        <TechnicalSection form={form} />
        <TitledCard title="Attachments">
          <UploadArea attachments={form.attachments} />
        </TitledCard>
        <TermsConditionsSection terms={form.termsAndConditions} />
        <DeliverySection form={form} />
        <VendorSection form={form} />
        <BudgetSection form={form} />
        <CommunicationSection form={form} />
      </div>

      {/* Phase 8 — submit action. Save Draft is a disabled placeholder; Submit opens a floating
          Review preview (Edit / Confirm) rather than submitting directly — still presentation-only. */}
      <SubmitPreview form={form} submitting={submitting} />
    </>
  );
}
