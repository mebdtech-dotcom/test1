// Buyer Workspace — Quotation detail (P-BUY-14) PRESENTATION VIEW-MODEL.
//
// The presentation shape the server layer (Doc-7C SR5, GI-02) MAPS the wired `rfq.get_quotation.v1`
// (Doc-4E §E7.5, T-DETAILS, VISIBILITY-GATED) read onto when backend wiring lands (Wave 4; PARKED today).
// It is NOT the frozen DTO and it coins nothing — every field traces by intent to the frozen quotation
// content set (Doc-4E §E7.1 request schema / Doc-2 §10.4 `quotations` + `quotation_versions`):
//
//   price_breakdown (jsonb) · delivery_terms (jsonb) · warranty_terms (jsonb, 0..1) ·
//   spec_compliance_declaration (jsonb) · attachments_refs (uuid[]) · plus identity
//   (human_ref "QTN-…", current_version_no, state).
//
// IMPORTANT — NO INVENTED FIELDS. The frozen contract pins those jsonb blobs' INTERNAL schema as
// "dev-doc" (Doc-2 §10.4), NOT in the corpus — so the surface PROJECTS each blob into generic
// label/value rows and the presentation renders them generically. We do NOT coin specific term keys
// (`incoterm`/`payment_term`/`freight`/`tax`/…) and we do NOT invent the `commercial_terms` or
// `technical_notes` fields the milestone brief anticipated — those are not frozen quotation fields;
// `spec_compliance_declaration` is the technical/compliance content (Doc-3 §8.1). See the M4 report.
//
// ──────────────────────────────────────────────────────────────────────────────────────────────────
// RENDERER CONTRACT (generic label/value projection) — binding for future maintainers (Board M4 MINOR-2)
// ──────────────────────────────────────────────────────────────────────────────────────────────────
// The term/price/compliance cards are GENERIC renderers over `QuotationTermRow`/`QuotationPriceLine`.
// Their inputs are ALREADY-RESOLVED, display-ready primitives:
//   • `label`  — a presentation string the SURFACE derived from the dev-doc jsonb (never a raw blob key).
//   • `value`  — a display-ready string (dates/money/units formatted UPSTREAM at the surface, GI-08).
//   • `amount` — a `{amount,currency}` pair rendered via the kit `CurrencyDisplay` (currency a prop).
//   • `id`     — a surface-minted stable key (React identity only; NOT a contract field).
// CONSEQUENCES (do NOT violate):
//   1. Do NOT add field-specific / special-case renderers (e.g. `if (label === "Incoterm") …`) inside the
//      components — that would re-couple presentation to an undocumented jsonb schema (the exact thing
//      this generic projection exists to avoid). Any shaping/branching belongs in the SURFACE projection.
//   2. Do NOT compute or re-derive business values client-side (no client totals/ratios; the contract
//      `total` is authoritative — R7 firewall / GI-12). Presentation renders; it never decides.
//   3. The cards must stay schema-agnostic: adding a new term key requires NO component change — the
//      surface simply projects another `{id,label,value}` row.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

import type { QuotationState, MoneyValue, ActivityEntry } from "./view-models";

/**
 * A generic label/value row projected from a quotation terms jsonb blob (`delivery_terms` /
 * `warranty_terms` / `spec_compliance_declaration`). The blob's internal schema is dev-doc (Doc-2 §10.4)
 * — NOT pinned in the frozen contract — so the surface resolves it to display-ready rows and the
 * presentation renders them without coining any specific term key. `value` is already display-formatted.
 */
export interface QuotationTermRow {
  /** Optional stable identity minted by the surface projection (like `QuotationAttachment.id`) — used as
   *  the React key so repeated/duplicate display labels from a dev-doc jsonb blob never collide. */
  id?: string;
  label: string;
  value: string;
}

/**
 * One priced line projected from `price_breakdown` (jsonb; internal schema dev-doc, Doc-2 §10.4). A label
 * + an optional money amount + an optional note (e.g. a quantity/unit string the projection provides). The
 * surface never re-computes anything — amounts and the total are contract-provided figures only.
 */
export interface QuotationPriceLine {
  /** Optional stable identity minted by the surface projection (like `QuotationAttachment.id`) — used as
   *  the React key so two same-labelled price lines (a dev-doc jsonb blob has no unique-label guarantee)
   *  never collide. */
  id?: string;
  label: string;
  amount?: MoneyValue;
  /** Optional quantity/unit note exactly as the projection supplies it (display only). */
  note?: string;
}

/**
 * The pricing projection. `total` is the CONTRACT-PROVIDED figure — NEVER client-summed from the lines
 * (R7 firewall; a client-computed total could also leak a count of withheld items, GI-12). Absent ⇒ no
 * total row is shown.
 */
export interface QuotationPricing {
  lines: QuotationPriceLine[];
  total?: MoneyValue;
}

/**
 * A resolved attachment descriptor — the surface resolves each `attachments_refs` uuid to a signed URL
 * (Doc-7B BR10 / Doc-2 §9; the kit embeds no blob, only the link). `href` absent ⇒ not yet resolvable;
 * it renders as a non-interactive row (never a fabricated link).
 */
export interface QuotationAttachment {
  id: string;
  name: string;
  href?: string;
  sizeLabel?: string;
}

/**
 * The P-BUY-14 quotation-detail view-model. `null` drives the not-found ≡ genuine-absence state (the
 * `get_quotation` read collapses an out-of-`quotation_visibility` id to NOT_FOUND server-side, §7.5 — the
 * UI renders a byte-identical 404 with no copy/layout/timing tell; Inv #11 / GI-12). Content fields are
 * optional so the not-found / sealed / unwired renders need no fabricated value. The buyer sees each
 * DISCLOSED quotation's real values (Doc-3 §9.1); `not_selected`/`withdrawn` render NON-PENALIZINGLY
 * (Doc-3 §8.3/§9.5). This is READ-ONLY — there is NO compare / award / reject / shortlist / clarify
 * affordance here (those are later, audit-gated milestones; R6 / Inv #12).
 */
export interface QuotationDetailData {
  id: string;
  /** Opaque RFQ id this quotation answers — the back/breadcrumb route; never a leaf ref when not-visible. */
  rfqId: string;
  /** Year-scoped human ref ("QTN-2026-000123") — DISPLAY ONLY; routes carry the opaque id. */
  humanRef: string;
  /** Vendor display name as the disclosed projection carries it. */
  vendorName: string;
  state: QuotationState;
  /** Immutable version number of this read (Inv #8 — versions are never overwritten, Doc-2 §5.5). */
  versionNo?: number;
  /** Headline quoted amount disclosed to the buyer (Doc-3 §9.1). Withheld when `sealedUntilClose`. */
  amount?: MoneyValue;
  /** Quotation validity window end (ISO-8601), formatted at the render site. */
  validUntil?: string;
  /** ISO-8601 submission instant of this immutable version (Inv #8), formatted at the render site. */
  submittedAt?: string;
  /** `price_breakdown` projection. `null`/absent ⇒ not provided (or sealed — see `sealedUntilClose`). */
  pricing?: QuotationPricing | null;
  /** `delivery_terms` projection (generic rows). */
  delivery?: QuotationTermRow[];
  /** `warranty_terms` projection (nullable in the contract, 0..1 — absent ⇒ "no warranty terms"). */
  warranty?: QuotationTermRow[];
  /** `spec_compliance_declaration` projection — the spec-compliance/technical content (Doc-3 §8.1). */
  compliance?: QuotationTermRow[];
  /** `attachments_refs` resolved to file descriptors (signed URLs by the surface). */
  attachments?: QuotationAttachment[];
  /** Read-only immutable version history (Inv #8) — reuses the shared `ActivityEntry` shape. */
  history?: ActivityEntry[];
  /**
   * Buyer-facing SEALED-UNTIL-CLOSE hint (Doc-3 §10.1 / §12.2 `abuse.sealed_until_close`, per RFQ cell).
   * When the cell is sealed AND the quotation window is OPEN, the `get_quotation` BUYER projection OMITS
   * price breakdowns + protected commercial terms (anti-farming). The SERVER sets this flag from POLICY;
   * the presentation renders it ONLY to EXPLAIN the redaction (so an absent price reads as "withheld until
   * window close", never as "the vendor under-quoted"). It is a presentation hint, not a coined contract
   * field — and it decides nothing.
   */
  sealedUntilClose?: boolean;
}
