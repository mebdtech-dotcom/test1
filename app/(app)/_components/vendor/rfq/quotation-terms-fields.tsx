// S4 Quote Authoring · Sections 2–4 — DELIVERY / WARRANTY / COMPLIANCE (companion §13.1 step rail).
// One focused section per step, bound to the frozen request fields by their EXACT names: `delivery_terms`
// (jsonb, required), `warranty_terms` (jsonb, optional [m-3]), `spec_compliance_declaration` (jsonb,
// required, per attached spec revision). Each jsonb's internal shape is dev-doc (Doc-4E Part4), so these
// render as free-form structured inputs — not invented sub-columns. `validity_period` is NOT a separate
// field — per Doc-4E Part4 (PB4-N1) it is embedded within `delivery_terms`, so it is noted inline, never
// added as its own field. Uncontrolled; native textarea interim ([ESC-7B-TEXTAREA]); disabled in the
// presentation phase. RSC-friendly.
import { FormField } from "@/frontend/components/form-field";
import { PresentationFormNote, vendorTextareaClass } from "../shared";

const TEXTAREA_CLASS = vendorTextareaClass("min-h-[120px]", { disabled: true });

export type QuotationTermSection = "delivery" | "warranty" | "compliance";

const SECTION: Record<
  QuotationTermSection,
  { id: string; name: string; label: string; required: boolean; description: string }
> = {
  delivery: {
    id: "delivery-terms",
    name: "delivery_terms",
    label: "Delivery terms",
    required: true,
    description: "Include your delivery schedule and the validity period for this quotation.",
  },
  warranty: {
    id: "warranty-terms",
    name: "warranty_terms",
    label: "Warranty terms",
    required: false,
    description: "Optional — describe any warranty you offer.",
  },
  compliance: {
    id: "spec-compliance",
    name: "spec_compliance_declaration",
    label: "Specification compliance",
    required: true,
    description:
      "Declare how your offer complies with each requirement in the attached specification.",
  },
};

export interface QuotationTermsFieldProps {
  section: QuotationTermSection;
  value?: string;
  /** Hide the per-form presentation note when several sections stack in ONE card (the group shows one). */
  showNote?: boolean;
}

export function QuotationTermsField({ section, value, showNote = true }: QuotationTermsFieldProps) {
  const cfg = SECTION[section];
  return (
    <form className="space-y-6" aria-label={cfg.label}>
      <FormField
        id={cfg.id}
        label={cfg.label}
        required={cfg.required}
        description={cfg.description}
      >
        <textarea
          id={cfg.id}
          name={cfg.name}
          defaultValue={value ?? ""}
          className={TEXTAREA_CLASS}
          disabled
        />
      </FormField>
      {showNote ? <PresentationFormNote /> : null}
    </form>
  );
}
