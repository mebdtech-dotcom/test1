// P-BUY-RFQ — the wizard FIELD SECTIONS. PRESENTATION-ONLY: fields render from `data.form` via `defaultValue`/
// `defaultChecked` (uncontrolled — no state, no onChange, no submit; a client form surface wires values at
// integration). Reuses the kit `Card`/`FormField` + the buyer `Textarea`/`Select` controls + `Badge`. The
// PINNED frozen fields (category, work_nature, scope_text, no_formal_spec, budget/currency, routing_mode) are
// labelled by intent; the rest are the dev-doc capture (see rfq-form-models.ts). No matching weight is set
// by the buyer (R6); no AI. COMMERCIAL terms (payment / incoterms / tax) are NOT here — the vendor defines
// them in its quotation (Board ruling 2026-07-01); the buyer states only optional budget GUIDANCE (R8).

import * as React from "react";
import { Info, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/frontend/primitives/tooltip";
import { Input } from "@/frontend/primitives/input";
import { FormField } from "@/frontend/components/form-field";
import { cn } from "@/frontend/lib/cn";
import { Textarea, Select, CheckboxRow } from "../form-controls";
import { ItemRequirementsTable } from "./item-requirements-table";
import { DescriptionList, type DescriptionItem } from "../description-list";
import {
  WORK_NATURE_OPTIONS,
  WORK_NATURE_LABEL,
  ROUTING_MODE_OPTIONS,
  FINANCIAL_TIER_OPTIONS,
  CONDITION_OPTIONS,
  DELIVERY_SITE_OPTIONS,
  URGENCY_OPTIONS,
  VENDOR_TYPE_OPTIONS,
} from "./rfq-options";
import type { RfqDraftForm } from "./rfq-form-models";

/** The single titled-card shell (a kit `Card` composition) reused by the form sections, the review
 *  summaries, and the host's Attachments/Review panels. `titleAs="h3"` nests review sub-cards under the
 *  "Review" `<h2>` for a correct heading outline. */
export function TitledCard({
  title,
  titleSuffix,
  children,
  contentClassName,
  titleAs,
}: {
  title: string;
  /** Optional content rendered inline after the title (e.g. a hover tips icon). */
  titleSuffix?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  titleAs?: "h2" | "h3";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-1.5 p-4">
        <CardTitle as={titleAs} className="text-sm font-semibold">
          {title}
        </CardTitle>
        {titleSuffix}
      </CardHeader>
      <CardContent className={cn("p-4 pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  titleSuffix,
  children,
}: {
  title: string;
  titleSuffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <TitledCard
      title={title}
      titleSuffix={titleSuffix}
      contentClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {children}
    </TitledCard>
  );
}

/** Small hover-only tips affordance — a kit `Tooltip` on an info icon (no click/dismiss state; pure
 *  hover/focus disclosure). Presentation-only guidance, no AI (Board scope). */
function TipsHint({ label, tips }: { label: string; tips: string[] }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Info aria-hidden className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left" side="right">
        <ul className="flex flex-col gap-1">
          {tips.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

// ── Phase 2 — Requirement details ─────────────────────────────────────────────────────────────────────
export function RequirementSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard
      title="Requirement details"
      titleSuffix={
        <TipsHint
          label="Tips for a strong RFQ"
          tips={[
            "Be specific about grade, dimensions, and tolerances — it gets you better-matched quotes.",
            "Attach drawings or a bill of quantities so vendors quote against the same scope.",
            "Set a realistic delivery date and a district so logistics can be priced.",
            "Vendors are matched by the routing engine — you choose the breadth, not the winner.",
          ]}
        />
      }
    >
      <FormField id="rfq-category" label="Category" required>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            defaultValue={form.categoryLabel}
            placeholder="Search category…"
            className="pl-9"
          />
        </div>
      </FormField>
      {/* A checkbox GROUP → fieldset/legend (not FormField, which wires a single label→control). */}
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-foreground">
          Request type
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
          {/* The asterisk is decorative (aria-hidden); convey "required" to AT for this group explicitly. */}
          <span className="sr-only">(required)</span>
        </legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pick all that apply (Product Supply / Service / Fabrication / Consulting).
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WORK_NATURE_OPTIONS.map((o) => (
            <CheckboxRow
              key={o.value}
              id={`rfq-wn-${o.value}`}
              label={o.label}
              defaultChecked={form.workNature?.includes(o.value)}
            />
          ))}
        </div>
      </fieldset>
      <ItemRequirementsTable rows={form.itemRows} />
    </SectionCard>
  );
}

// ── Phase 3 — Technical requirements ──────────────────────────────────────────────────────────────────
export function TechnicalSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Technical requirements">
      <FormField
        id="rfq-scope"
        label="Specifications"
        description="Describe the requirement — grade, dimensions, tolerances, scope of work. Required to submit."
        className="sm:col-span-2"
      >
        <Textarea
          rows={6}
          defaultValue={form.scopeText}
          placeholder="Specification, scope, and acceptance criteria…"
        />
      </FormField>
      <div className="sm:col-span-2">
        <CheckboxRow
          id="rfq-noformalspec"
          label="I don't have a formal specification document"
          defaultChecked={form.noFormalSpec}
        />
      </div>
      <FormField
        id="rfq-brand"
        label="Brand preference"
        inputProps={{
          defaultValue: form.brandPreference,
          placeholder: "Preferred brand (optional)",
        }}
      />
      <FormField
        id="rfq-altbrand"
        label="Alternative brand"
        inputProps={{ defaultValue: form.alternativeBrand, placeholder: "Acceptable alternative" }}
      />
      <FormField id="rfq-condition" label="Product condition">
        <Select
          options={CONDITION_OPTIONS}
          placeholder="Select condition"
          defaultValue={form.productCondition ?? ""}
        />
      </FormField>
      <FormField
        id="rfq-standards"
        label="Standards"
        inputProps={{ defaultValue: form.standards, placeholder: "e.g. ASTM A36, ISO 9001" }}
      />
      <FormField
        id="rfq-certs"
        label="Certifications"
        className="sm:col-span-2"
        inputProps={{
          defaultValue: form.certifications,
          placeholder: "e.g. EN 10204 3.1, mill test cert",
        }}
      />
    </SectionCard>
  );
}

// ── Delivery requirements ─────────────────────────────────────────────────────────────────────────────
export function DeliverySection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Delivery requirements">
      <FormField
        id="rfq-location"
        label="Delivery location"
        inputProps={{ defaultValue: form.deliveryLocation, placeholder: "Site / address" }}
      />
      {/* FZ-06: `required` (asterisk + aria-required) — the frozen submission FIXED-set marks
          `delivery_geography` required at submit (rfq-form-models.ts:23-24), same convention as
          Category/Request type; draft itself stays permissive (Doc-3 §1.2), never enforced here. */}
      <FormField
        id="rfq-district"
        label="Delivery district"
        description="At least a district is required to submit."
        required
        inputProps={{ defaultValue: form.district, placeholder: "e.g. Gazipur" }}
      />
      <FormField
        id="rfq-date"
        label="Required delivery date"
        inputProps={{ defaultValue: form.deliveryDate, type: "date" }}
      />
      <FormField id="rfq-site" label="Delivery site">
        <Select
          options={DELIVERY_SITE_OPTIONS}
          placeholder="Factory / Warehouse / Site"
          defaultValue={form.deliverySite ?? ""}
        />
      </FormField>
      <FormField id="rfq-instructions" label="Delivery instructions" className="sm:col-span-2">
        <Textarea
          rows={3}
          defaultValue={form.deliveryInstructions}
          placeholder="Access, unloading, timing, packaging…"
        />
      </FormField>
    </SectionCard>
  );
}

// ── Budget & priority (OPTIONAL — commercial GUIDANCE, not commercial terms; payment/incoterms/tax live
//    on the VENDOR quotation, Board ruling 2026-07-01) ────────────────────────────────────────────────
export function BudgetSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Budget & priority (optional)">
      {/* Made fully optional in the wizard (no asterisk/required marker) per product direction — the
          frozen submission FIXED-set (rfq-form-models.ts) still lists `estimated_value` as a backend
          submit-time field, but the buyer is never forced to state a budget figure client-side. */}
      <FormField
        id="rfq-budget"
        label="Estimated budget (BDT)"
        description="Optional guidance for vendors. No currency selector: BDT at create."
        inputProps={{
          defaultValue: form.budget,
          type: "number",
          inputMode: "decimal",
          min: 0,
          placeholder: "e.g. 1,800,000",
        }}
      />
      <FormField id="rfq-urgency" label="Urgency">
        <Select
          options={URGENCY_OPTIONS}
          placeholder="Standard"
          defaultValue={form.urgency ?? ""}
        />
      </FormField>
      <FormField id="rfq-special" label="Special instructions" className="sm:col-span-2">
        <Textarea
          rows={3}
          defaultValue={form.specialInstructions}
          placeholder="Anything else vendors should know — not commercial terms (those come in the quote)…"
        />
      </FormField>
    </SectionCard>
  );
}

// ── Phase 6 — Vendor preferences ──────────────────────────────────────────────────────────────────────
export function VendorSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Vendor preferences">
      {/* FZ-06: `required` (asterisk + aria-required) — `routing_mode` is in the frozen submission
          FIXED-set (rfq-form-models.ts:23-24), previously not flagged at all; draft itself stays
          permissive (Doc-3 §1.2), never enforced here. */}
      <FormField
        id="rfq-routing"
        label="Routing"
        description="How broadly to route this RFQ. The matching engine still decides who is invited. Routing preferences affect vendor matching only. They never make an RFQ public."
        className="sm:col-span-2"
        required
      >
        <Select
          options={ROUTING_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Select routing breadth"
          defaultValue={form.routingMode ?? ""}
        />
      </FormField>
      <FormField
        id="rfq-prefvendor"
        label="Preferred vendor"
        description="Search your network (presentation only — search connects later)."
        inputProps={{ defaultValue: form.preferredVendor, placeholder: "Search vendors…" }}
      />
      <FormField id="rfq-vendortype" label="Vendor type">
        <Select
          options={VENDOR_TYPE_OPTIONS}
          placeholder="Any"
          defaultValue={form.manufacturerOrImporter ?? ""}
        />
      </FormField>
      <FormField
        id="rfq-tier"
        label="Preferred vendor classification"
        description="Optional — preferred Financial Tier (a capability tier, not a plan)."
      >
        <Select
          options={FINANCIAL_TIER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Any tier"
          defaultValue={form.financialTier ?? ""}
        />
      </FormField>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <CheckboxRow
          id="rfq-verified"
          label="Verified vendors only"
          defaultChecked={form.verifiedOnly}
        />
        <CheckboxRow
          id="rfq-acceptalt"
          label="Accept alternative products / brands"
          defaultChecked={form.acceptAlternatives}
        />
      </div>
    </SectionCard>
  );
}

// NOTE: `CommunicationSection` moved to `./communication-section.tsx` (CLIENT — the WhatsApp contact
// block reveals only while its checkbox is checked, a local UI toggle no longer expressible as a
// server-rendered, uncontrolled section).

// ── Phase 7 — Review (read-only summary cards) ────────────────────────────────────────────────────────
function dash(v?: string) {
  return v && v.length > 0 ? v : "—";
}

export function ReviewSection({ form }: { form: RfqDraftForm }) {
  const requirement: DescriptionItem[] = [
    { label: "Category", value: dash(form.categoryLabel) },
    {
      label: "Request type",
      value:
        form.workNature && form.workNature.length > 0
          ? form.workNature.map((w) => WORK_NATURE_LABEL[w]).join(", ")
          : "—",
    },
    {
      label: "Items",
      value: (() => {
        const rows = (form.itemRows ?? []).filter((r) => r.itemName.trim().length > 0);
        return rows.length === 0
          ? "—"
          : `${rows.length} item${rows.length === 1 ? "" : "s"} listed`;
      })(),
    },
  ];
  const specs: DescriptionItem[] = [
    { label: "Specification", value: dash(form.scopeText) },
    { label: "Brand", value: dash(form.brandPreference) },
    { label: "Condition", value: dash(form.productCondition) },
    { label: "Standards", value: dash(form.standards) },
  ];
  const delivery: DescriptionItem[] = [
    { label: "Location", value: dash(form.deliveryLocation) },
    { label: "District", value: dash(form.district) },
    { label: "Needed by", value: dash(form.deliveryDate) },
    { label: "Site", value: dash(form.deliverySite) },
  ];
  const vendor: DescriptionItem[] = [
    { label: "Routing", value: dash(form.routingMode) },
    { label: "Vendor type", value: dash(form.manufacturerOrImporter) },
    { label: "Classification", value: dash(form.financialTier) },
    { label: "Verified only", value: form.verifiedOnly ? "Yes" : "No" },
    { label: "Accept alternatives", value: form.acceptAlternatives ? "Yes" : "No" },
  ];
  const budget: DescriptionItem[] = [
    { label: "Estimated budget", value: form.budget ? `${form.budget} BDT` : "—" },
    { label: "Urgency", value: dash(form.urgency) },
  ];
  const communication: DescriptionItem[] = [
    {
      label: "Channels",
      value: [
        "Platform",
        form.contactPhone && "Phone",
        form.contactWhatsapp && "WhatsApp",
        form.contactEmail && "Email",
      ]
        .filter(Boolean)
        .join(", "),
    },
    { label: "WhatsApp", value: form.whatsappAllow ? "Allowed" : "Not allowed" },
    { label: "Contact time", value: dash(form.preferredContactTime) },
  ];
  const fileCount = form.attachments?.length ?? 0;
  const termsCount = (form.termsAndConditions ?? []).filter((t) => t.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <SummaryCard title="Requirement" items={requirement} />
      <SummaryCard title="Specifications" items={specs} />
      <TitledCard title="Files" titleAs="h3">
        <p className="text-sm text-muted-foreground">
          {fileCount === 0
            ? "No attachments"
            : fileCount === 1
              ? "1 file attached"
              : `${fileCount} files attached`}
        </p>
      </TitledCard>
      <TitledCard title="Terms & conditions" titleAs="h3">
        <p className="text-sm text-muted-foreground">
          {termsCount === 0
            ? "No conditions added"
            : `${termsCount} condition${termsCount === 1 ? "" : "s"}`}
        </p>
      </TitledCard>
      <SummaryCard title="Delivery" items={delivery} />
      <SummaryCard title="Vendor preferences" items={vendor} />
      <SummaryCard title="Budget & priority" items={budget} />
      <SummaryCard title="Communication" items={communication} />
    </div>
  );
}

function SummaryCard({ title, items }: { title: string; items: DescriptionItem[] }) {
  // h3 — these summaries nest under the host's "Review" <h2> (correct heading outline).
  return (
    <TitledCard title={title} titleAs="h3">
      <DescriptionList items={items} />
    </TitledCard>
  );
}
