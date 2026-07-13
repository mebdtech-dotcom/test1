// P-BUY-RFQ — option lists + wizard steps for the RFQ create form. FROZEN enums are reproduced VERBATIM
// (Doc-4E §E4.1 / Doc-2 §10.4) with presentation labels; DEV-DOC/presentation lists (units, conditions,
// incoterms, …) are real-world option sets the surface serializes into `scope_text`/`content_jsonb` — they
// coin no FROZEN contract enum. Presentation-only.

import type { WorkNature, RoutingMode, FinancialTier } from "./rfq-form-models";

export interface Option<T extends string = string> {
  value: T;
  label: string;
  /** Optional helper shown under the option (e.g. routing-mode breadth). */
  hint?: string;
}

// ── FROZEN (verbatim) ────────────────────────────────────────────────────────────────────────────────

/** `work_nature` ⊆ {supply,service,fabricate,consult} (Inv #1 capability matrix; pick 1..4). Presentation
 *  labels only — the underlying frozen enum values are unchanged. */
export const WORK_NATURE_OPTIONS: Option<WorkNature>[] = [
  { value: "supply", label: "Product Supply", hint: "Provide / deliver goods" },
  { value: "service", label: "Service / Contract Work", hint: "Perform a service" },
  { value: "fabricate", label: "Custom Fabrication", hint: "Build / fabricate to spec" },
  { value: "consult", label: "Engineering & Consulting", hint: "Advisory / consulting" },
];

/** `work_nature` value → presentation label, derived from `WORK_NATURE_OPTIONS` (single source; no drift).
 *  Reused by any surface that renders the capability set as labels (e.g. the RFQ detail Overview chips). */
export const WORK_NATURE_LABEL: Record<WorkNature, string> = Object.fromEntries(
  WORK_NATURE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<WorkNature, string>;

/** `routing_mode` — buyer sets the breadth; the governed engine still matches/routes (R6). */
export const ROUTING_MODE_OPTIONS: Option<RoutingMode>[] = [
  {
    value: "approved_only",
    label: "Approved vendors only",
    hint: "Route only to your approved vendors",
  },
  {
    value: "approved_conditional",
    label: "Approved + conditional",
    hint: "Approved vendors plus conditional matches",
  },
  {
    value: "approved_open",
    label: "Approved + open",
    hint: "Approved vendors plus the open network",
  },
  { value: "open_market", label: "Open market", hint: "Route across the whole verified network" },
];

/** Frozen Financial Tier A–E (capability tier, NOT a subscription plan — Inv #10). A preference hint only. */
export const FINANCIAL_TIER_OPTIONS: Option<FinancialTier>[] = [
  { value: "A", label: "Tier A" },
  { value: "B", label: "Tier B" },
  { value: "C", label: "Tier C" },
  { value: "D", label: "Tier D" },
  { value: "E", label: "Tier E" },
];

// ── DEV-DOC / presentation lists (real-world option sets; not frozen contract enums) ──────────────────

/** Units of measure — presentation list (serialized into the dev-doc content). */
export const UNIT_OPTIONS: Option[] = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "ton", label: "Metric tons (t)" },
  { value: "m", label: "Metres (m)" },
  { value: "sqm", label: "Square metres (m²)" },
  { value: "litre", label: "Litres (L)" },
  { value: "set", label: "Sets" },
  { value: "lot", label: "Lot" },
];

/** Product condition — presentation list. */
export const CONDITION_OPTIONS: Option[] = [
  { value: "new", label: "New" },
  { value: "refurbished", label: "Refurbished" },
  { value: "used", label: "Used" },
];

// NOTE (Board ruling 2026-07-01): payment terms, incoterms, and tax are COMMERCIAL terms the VENDOR defines
// in its quotation — NOT what the buyer requests. They were removed from the RFQ create form (the buyer
// describes the need; the vendor defines how/under what terms it supplies). Do not re-add them here.

/** Delivery site kind — presentation list (dev-doc capture). */
export const DELIVERY_SITE_OPTIONS: Option[] = [
  { value: "factory", label: "Factory" },
  { value: "warehouse", label: "Warehouse" },
  { value: "site", label: "Project site" },
];

/** Urgency — presentation guidance only; helps vendors prepare, never a matching weight (R6). */
export const URGENCY_OPTIONS: Option[] = [
  { value: "standard", label: "Standard" },
  { value: "urgent", label: "Urgent" },
  { value: "critical", label: "Critical" },
];

/** Preferred contact time — presentation list (optional buyer preference). */
export const CONTACT_TIME_OPTIONS: Option[] = [
  { value: "anytime", label: "Anytime" },
  { value: "business", label: "Business hours" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

/** Vendor type preference — presentation list (a routing/preference hint, not a matching weight). */
export const VENDOR_TYPE_OPTIONS: Option[] = [
  { value: "any", label: "Any" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "importer", label: "Importer" },
  { value: "distributor", label: "Distributor" },
];

// ── Wizard steps (the progress indicator) ────────────────────────────────────────────────────────────

export interface WizardStep {
  key: string;
  label: string;
}

// Collapsed to 3 stages (was 8) — the page itself is a single long scroll, never paginated; this is a
// progress ORIENTATION only, grouping the section cards below into 3 legible stages instead of one per
// card.
export const RFQ_WIZARD_STEPS: WizardStep[] = [
  { key: "requirement", label: "Requirement details" },
  { key: "delivery", label: "Delivery & vendors" },
  { key: "review", label: "Review & submit" },
];
