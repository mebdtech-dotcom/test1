// P-BUY-RFQ (RFQ create, P-BUY-07 · `T-WIZARD`) — PRESENTATION FORM VIEW-MODEL.
//
// The presentation form the buyer fills; the server layer (Doc-7C SR5, GI-02) MAPS it onto the frozen
// `rfq.create_rfq.v1` / `rfq.submit_rfq.v1` commands (Doc-4E §E4.1/§E4.3) when wiring lands (Wave 4; PARKED).
// PRESENTATION-ONLY: no fetch, no mutation, no submit, no business logic (Content ≠ Presentation, Inv #9).
//
// ─ GROUNDING (no invented FROZEN fields) ─────────────────────────────────────────────────────────────
// PINNED `create_rfq` request fields (Doc-4E §E4.1 / Doc-2 §10.4) — modeled here by their EXACT frozen
// names + enums:
//   • `category_id` (uuid)           • `work_nature[]` ⊆ {supply,service,fabricate,consult} (set, no dup)
//   • `estimated_value` (numeric)    • `currency` <BDT>          • `routing_mode` <4 enum>
//   • `scope_text` (text)            • `delivery_geography` (jsonb — dev-doc shape) • `no_formal_spec` (bool)
//   • `spec_document_ids[]` (uuid[]) — the attached spec docs.
// DEV-DOC CAPTURE (NOT frozen create_rfq fields — the surface serializes these into `scope_text` /
// `delivery_geography` / `rfq_versions.content_jsonb`, whose internal schema is "dev-doc scope", exactly
// like the quotation jsonb blobs in P-BUY-14): item/quantity/unit, brand/alt-brand/condition/standards/
// certifications, delivery district/date, payment preference / incoterms / tax, and the granular vendor
// preferences. These are buyer-facing presentation fields, not coined contract fields. Where a granular
// vendor preference overlaps a frozen concept it points, never coins: routing breadth = `routing_mode`;
// "Financial Tier" = the frozen A–E tier (Doc-2). The buyer NEVER sets matching weights (the engine
// decides — R6); these are routing/preference hints only.
//
// GOVERNANCE: draft is permissive (Doc-3 §1.2 — no submission FIXED-set enforced at create); `estimated_value`
// /`delivery_geography`/`routing_mode` are required only at SUBMIT (rendered as such, never wired here). The
// matching engine is never bypassed; no auto-winner/recommendation; AI is absent (Board scope).

// ── Frozen enums (verbatim — Doc-4E §E4.1 / Doc-2 §10.4) ──────────────────────────────────────────────

/** `work_nature` — the frozen capability set (Inv #1: a matrix of flags, never a single label). 1..4, no dup. */
export type WorkNature = "supply" | "service" | "fabricate" | "consult";

/** `routing_mode` — how broadly the (governed) engine may route. The buyer sets breadth; the engine matches. */
export type RoutingMode =
  "approved_only" | "approved_conditional" | "approved_open" | "open_market";

/** `currency` — frozen <BDT> at create (Doc-2 §0.4 multi-currency-ready; only BDT today). */
export type RfqCurrency = "BDT";

/** Frozen Financial Tier (Doc-2 §Governance signals) — a capability tier (A best … E), NOT a subscription
 *  plan (Inv #10). A vendor-preference HINT only; never a matching weight the buyer controls (R6). */
export type FinancialTier = "A" | "B" | "C" | "D" | "E";

// ── The presentation form (every field optional — a draft is permissive, Doc-3 §1.2) ─────────────────

/** One attachment row in the presentation upload list (`spec_document_ids[]` at wiring; ESC-7-API/upload).
 *  PRESENTATION-ONLY — no real file handling; `status` drives the validation-state UI. */
export interface RfqAttachment {
  id: string;
  name: string;
  sizeLabel?: string;
  /** Presentation validation state (no real upload occurs this milestone). */
  status?: "ready" | "too-large" | "unsupported";
}

/** One line of the Item Requirements List (Request type section) — dev-doc capture, repeatable version
 *  of the single item/quantity/unit fields below. Serializes into `content_jsonb` at wiring. */
export interface RfqItemRow {
  id: string;
  itemName: string;
  size: string;
  quantity: string;
  unit: string;
  /** Optional rich per-line description (owner directive 2026-07-07: bold + 3 colors, multiline;
   *  HTML from the kit RichNoteEditor; dev-doc capture with the row into `content_jsonb`). */
  description?: string;
}

export interface RfqDraftForm {
  // Phase 2 — Requirement details
  // (Industry removed — modern marketplace UX (Alibaba/IndiaMART/Amazon Business) goes straight to a
  // searchable category picker rather than an industry-first funnel.)
  /** `category_id` (the picker's value is the opaque category id; the label is display). */
  categoryId?: string;
  categoryLabel?: string;
  /** `work_nature[]` — the frozen set (Request Type). */
  workNature?: WorkNature[];
  /** Dev-doc capture → serialized into scope_text/content_jsonb. */
  itemName?: string;
  quantity?: string;
  unit?: string;
  /** Repeatable line items (Item Requirements List) — the multi-row version of the above. */
  itemRows?: RfqItemRow[];

  // Phase 3 — Technical requirements (dev-doc capture; `scope_text` is the frozen free-text home)
  /** `scope_text` — the specification editor (the one frozen text field; min length enforced at submit). */
  scopeText?: string;
  /** `no_formal_spec` (frozen bool) — the buyer attaches no formal spec. */
  noFormalSpec?: boolean;
  brandPreference?: string;
  alternativeBrand?: string;
  productCondition?: string;
  standards?: string;
  certifications?: string;

  // Phase 4 — Attachments (`spec_document_ids[]` at wiring; presentation-only here)
  attachments?: RfqAttachment[];

  // Phase 4 — Terms & conditions (dev-doc capture; serializes into `content_jsonb` at wiring). NOT a
  // frozen `create_rfq`/`submit_rfq` field (no such field is pinned in Doc-4E §E4.1) — a buyer-facing
  // presentation list of conditions vendors must accept to quote, ordered.
  termsAndConditions?: string[];

  // Delivery requirements (`delivery_geography` jsonb + dev-doc capture). NOTE: payment terms / incoterms /
  // tax are NOT here — they are COMMERCIAL terms the vendor defines in its quotation (Board ruling 2026-07-01),
  // not what the buyer requests. The buyer describes the NEED; the vendor defines how/under what terms it supplies.
  deliveryLocation?: string;
  district?: string;
  deliveryDate?: string;
  /** Delivery site kind — Factory / Warehouse / Site (dev-doc capture). */
  deliverySite?: string;
  /** Free-text delivery instructions (dev-doc capture). */
  deliveryInstructions?: string;

  // Vendor preferences (`routing_mode` frozen + dev-doc preference hints; never matching weights, R6)
  routingMode?: RoutingMode;
  preferredVendor?: string;
  verifiedOnly?: boolean;
  manufacturerOrImporter?: string;
  /** Preferred vendor classification — the frozen Financial Tier A–E hint (Inv #10 ≠ plan). Optional. */
  financialTier?: FinancialTier;
  acceptAlternatives?: boolean;

  // Budget & priority (OPTIONAL — commercial GUIDANCE, not commercial terms). `estimated_value` + `currency`<BDT>
  // (no currency selector — BDT only at create); urgency + notes are dev-doc capture.
  budget?: string;
  currency?: RfqCurrency;
  urgency?: string;
  specialInstructions?: string;

  // Communication preferences (dev-doc capture). PLATFORM MESSAGES ARE ALWAYS ON — the system of record /
  // audit trail (M6, delivery-only); the off-platform channels below are OPTIONAL and buyer-controlled. The
  // platform stays the communication record for RFQs, clarifications, and dispute resolution (Board ruling).
  // A WhatsApp number is shared only with vendors who RECEIVE this RFQ (non-disclosure). No real comms wired.
  contactPhone?: boolean;
  contactWhatsapp?: boolean;
  contactEmail?: boolean;
  whatsappAllow?: boolean;
  whatsappUseAccount?: boolean;
  whatsappNumber?: string;
  preferredContactTime?: string;
  /** Per-RFQ contact person (owner directive 2026-07-07) — the named person + number the buyer
   *  designates for THIS RFQ (dev-doc capture, serialized with the other communication fields).
   *  Shared only with vendors who receive this RFQ (non-disclosure). */
  contactPersonName?: string;
  contactPersonNumber?: string;
}

/** Submission states for Phase 8 (presentation only — NO real submit occurs this milestone). */
export type RfqSubmissionState = "idle" | "submitting" | "success" | "error";

/** The complete P-BUY-RFQ view-model. `form` seeds field values (empty by default — a blank draft). */
export interface RfqCreateData {
  form: RfqDraftForm;
  /** Which wizard step is active (0-based) — presentation state. */
  activeStep?: number;
  /** Drives the Phase-8 submission-state UI (success/error pages, loading). Default `idle`. */
  submission?: RfqSubmissionState;
}
