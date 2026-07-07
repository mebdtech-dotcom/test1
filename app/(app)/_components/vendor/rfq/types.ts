// Typed presentation props for the Vendor RFQ & Quotation Workspace (Milestone 5 — the moat;
// companion §6 + §13.1). ZERO CONTRACT INVENTION: every field/enum/state is a REAL frozen value
// (Doc-2 §10.4, Doc-4E PassB Part4, Doc-4M, Doc-5E/5I). All optional → genuine-empty in the
// presentation phase. Byte-equivalence (Invariant 11 / GR11 / CHK-7-040) is load-bearing here:
// these views carry ONLY own/received data — never a competitor count, rank, score, match
// confidence, or "why-not-invited" signal (ND-1..ND-8).
//
// State tokens are Doc-4M ONLY (DP3 — "the contract decides state; the kit decides presentation").
// The displayed string is a localized human label derived from the token by the surface; the kit
// invents nothing (§7.1). Window sub-state is NOT a Doc-4M token — it is a UI-derived sibling chip
// ([ESC-7B-WINDOW-CHIP], pending) and is typed/commented as such below.

/** RFQ lifecycle — frozen Doc-4M / Doc-2 §5.4 (full set; the vendor sees the `vendors_notified`→ subset). */
export type RfqState =
  | "draft"
  | "pending_internal_approval"
  | "submitted"
  | "under_review"
  | "matching"
  | "vendors_notified"
  | "quotations_received"
  | "buyer_reviewing"
  | "shortlisted"
  | "closed_won"
  | "closed_lost"
  | "expired"
  | "cancelled";

/** RFQ Invitation lifecycle — frozen Doc-4M / Doc-2 §3.4 (vendor-visible entry state = `delivered`). */
export type InvitationState =
  "draft" | "selected" | "deferred" | "delivered" | "accepted" | "declined" | "expired";

/** Quotation lifecycle — frozen Doc-4M / Doc-2 §5.5. There is NO `revised` state: revisions are
 *  immutable versions within `submitted` (§6.4). `selected`/`not_selected` reach only from `shortlisted`. */
export type QuotationState =
  "draft" | "submitted" | "withdrawn" | "shortlisted" | "selected" | "not_selected" | "expired";

/** Vendor capability matrix flags — frozen Invariant 1 (work_nature values; Doc-2 §10.4). */
export type WorkNature = "supply" | "service" | "fabricate" | "consult";

/** Window sub-state — a UI-DERIVED affordance ([ESC-7B-WINDOW-CHIP], pending; companion §7.1 Inv 4).
 *  NOT a Doc-4M state: it is a second independent chip orthogonal to the RFQ state. */
export type WindowState = "open" | "open_late" | "closed";

/** Optional urgency tier for an OPEN window (companion §7.1: warning <24h, danger <2h). Caller/server-
 *  supplied — never computed on the client (no live clock in the presentation phase). */
export type WindowUrgency = "normal" | "soon" | "imminent";

/** A resolved file reference (storage_ref → signed URL + display name by integration). Used for
 *  granted RFQ documents (spec_document_ids) and quotation attachments (attachments_refs : uuid[]). */
export interface FileRefView {
  href?: string;
  name?: string;
}

/** One row of the received-only Invitation Inbox (S2). Combines the vendor-entitled RFQ display with
 *  the invitation + window chips. Received-only: the row exists ONLY because an invitation was
 *  delivered to this vendor (DP1/BE-1) — there is no browse/discovery of un-invited RFQs. */
export interface InboxItemView {
  /** rfq_invitations.rfq_id — used only to link to the detail route. */
  rfq_id: string;
  /** RFQ human_ref (e.g. "RFQ-2026-000481") — frozen. */
  rfq_human_ref?: string;
  /** Short display descriptor, projected from the RFQ version content_jsonb / scope_text by
   *  integration — NOT a standalone frozen column. */
  rfq_summary?: string;
  /** RFQ state token (Doc-4M). */
  rfq_state?: RfqState;
  /** Window sub-state chip (UI-derived). */
  window_state?: WindowState;
  /** Server-formatted window deadline label (Asia/Dhaka / BST) — no client clock. */
  window_deadline_label?: string;
  window_urgency?: WindowUrgency;
  /** Invitation state token (Doc-4M; vendor-visible entry = `delivered`). */
  invitation_state?: InvitationState;
  /** Own quotation state on this RFQ (Doc-4M `QuotationState`) — visibility-gated: present only
   *  when the vendor has actually started/submitted a quotation here (P-VND-17, page_inventory).
   *  Own-record fact only; never a competitor's state (ND-2/ND-3). */
  quotation_state?: QuotationState;
  /** Own-record fact only (§6.6 / ND-4): this vendor has an unread clarification message on its OWN
   *  thread — never an exclusion / "not matched" signal. */
  unread_clarification?: boolean;
}

/** Vendor-entitled RFQ snapshot for the detail (S3) — read = `rfq.get_rfq.v1`, grant-scoped via
 *  rfq_invitation_grantees ([ESC-7G-Q-01] CLOSED, B-1). Binds frozen rfq.rfqs / rfq_versions fields,
 *  PLUS the dev-doc-capture requirement detail the buyer wizard serializes into those fields (see
 *  block below) — all optional. Carries NOTHING about other vendors or the matching decision
 *  (ND-1..ND-6), and NOTHING about buyer routing/targeting preferences or commercial guidance
 *  (excluded by design — see the dev-doc-capture block below). */
export interface RfqSnapshotView {
  rfq_id: string;
  human_ref?: string;
  /** Resolved display name for the frozen `buyer_org_id` (resolved by integration — same pattern as
   *  `category_label`; added 2026-07-07, owner directive). Grant-scoped: an invited vendor
   *  legitimately sees the client's identity — ND rules cover competitor/matching info, not this. */
  buyer_org_name?: string;
  /** Display descriptor projected from content_jsonb / scope_text (not a standalone frozen column). */
  summary?: string;
  state?: RfqState;
  /** Frozen rfq.rfqs.scope_text. */
  scope_text?: string;
  /** Frozen work_nature[] (Invariant 1). */
  work_nature?: WorkNature[];
  /** Resolved display name for the frozen category_id (resolved by integration; category owned by M2/M8). */
  category_label?: string;
  /** Frozen estimated_value + currency (BDT default; multi-currency-ready). */
  estimated_value?: number;
  currency?: string;
  /** Frozen delivery_geography. */
  delivery_geography?: string;
  /** Frozen no_formal_spec flag. */
  no_formal_spec?: boolean;
  /** Granted documents — resolved spec_document_ids (tap-to-download; file_ref only, §7.6). */
  granted_documents?: FileRefView[];
  /** Locked snapshot version the quotation binds to (rfq_versions; frozen rfq_version_id / current_version_no). */
  version_locked_label?: string;
  /** Window chip inputs (UI-derived). */
  window_state?: WindowState;
  window_deadline_label?: string;
  window_urgency?: WindowUrgency;

  // ── Dev-doc capture (NOT standalone frozen columns — serialized by the buyer wizard into
  // scope_text / delivery_geography / rfq_versions.content_jsonb by integration; mirrors
  // RfqDraftForm 1:1, buyer module's rfq-form-models.ts). Shown here because a vendor genuinely
  // needs this detail to quote — this is the requirement CONTENT, not a targeting/routing signal.
  //
  // EXCLUDED BY DESIGN: the buyer wizard's "Vendor preferences" section (routing_mode,
  // preferredVendor, verifiedOnly, manufacturerOrImporter, financialTier, acceptAlternatives) and
  // "Budget & priority" guidance fields (budget/urgency/specialInstructions) are buyer-side
  // routing/targeting inputs and commercial guidance — never surfaced to the vendor here, per the
  // non-disclosure convention (ND-1..ND-8) that withholds matching-engine breadth/targeting
  // criteria the same way competitor counts/ranks/match-confidence are withheld. `estimated_value`
  // + `currency` above is the one exception: it is ALREADY a frozen create_rfq field and already shown.

  /** Item identification — dev-doc capture (mirrors RfqDraftForm.itemName/quantity/unit). */
  item_name?: string;
  quantity?: string;
  unit?: string;

  /** Technical detail — dev-doc capture (mirrors RfqDraftForm brandPreference/alternativeBrand/
   *  productCondition/standards/certifications). */
  brand_preference?: string;
  alternative_brand?: string;
  product_condition?: string;
  standards?: string;
  certifications?: string;

  /** Delivery detail — dev-doc capture (mirrors RfqDraftForm deliveryLocation/district/deliveryDate/
   *  deliverySite/deliveryInstructions). `delivery_date_label` is server-formatted (Asia/Dhaka / BST),
   *  no client clock — follows the `window_deadline_label` pattern. */
  delivery_location?: string;
  delivery_district?: string;
  delivery_date_label?: string;
  delivery_site?: string;
  delivery_instructions?: string;

  /** Communication preference — dev-doc capture (mirrors RfqDraftForm contactPhone/contactWhatsapp/
   *  contactEmail/preferredContactTime). Platform messages are always-on (M6 system of record) and
   *  are not listed here as a "channel"; these are the OPTIONAL off-platform channels the buyer opted
   *  into, shared only with vendors who receive this RFQ (non-disclosure). */
  preferred_contact_channels?: ("platform" | "phone" | "whatsapp" | "email")[];
  preferred_contact_time_label?: string;
  /** Contact VALUES for the opted-in channels above — completes the declared RfqDraftForm mirror
   *  (contactPhone/contactWhatsapp/contactEmail; added 2026-07-07, owner RFQ-details directive).
   *  Shared only with granted vendors, same non-disclosure scope as the channels list. */
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_email?: string;
  /** Per-RFQ contact person the buyer designates at RFQ creation (mirrors RfqDraftForm
   *  contactPersonName; owner directive 2026-07-07). Shown to granted vendors on authoring
   *  surfaces ONLY — NEVER rendered on the vendor's offer document (owner rule). */
  contact_person?: string;
}

/** The vendor's own invitation on an RFQ (S3 right pane) — frozen rfq_invitations fields. */
export interface InvitationView {
  id: string;
  rfq_id: string;
  state?: InvitationState;
  delivered_at?: string;
  responded_at?: string;
}

/** One immutable quotation version (S5 history) — frozen rfq.quotation_versions. Current vs superseded
 *  is shown via a chip; superseded versions are kept (Invariant 8 / DP11), never overwritten or deleted. */
export interface QuotationVersionView {
  version_no: number;
  /** Derived: the highest version_no is current; others are superseded. */
  is_current?: boolean;
  /** Frozen supersedes_version_no. */
  supersedes_version_no?: number;
  created_at?: string;
}

/** The vendor's own quotation on an RFQ (S5) — frozen rfq.quotations fields. */
export interface QuotationView {
  id: string;
  /** Assigned on successful submit (frozen response: human_ref "QTN-…"). */
  human_ref?: string;
  rfq_id: string;
  state?: QuotationState;
  current_version_no?: number;
  versions?: QuotationVersionView[];
}

/** Quotation-submission quota — Doc-5I `monthly_rfq_limit` entitlement, resolved server-side
 *  (billing.resolve_entitlements.v1, out-of-wire). NUMERIC only — NEVER a plan name (Invariant 10 /
 *  DP6). Distinct from the catalog publish allowance and from delivery accounting (three-instrument
 *  identity, Doc-3 §4.1.1). One unit is consumed at SUBMIT only. */
export interface QuotaView {
  used?: number;
  limit?: number;
  /** Server-formatted reset date label ("Resets …"); no client clock. */
  resets_label?: string;
}

/** One price-breakdown line — a COMPANION presentation shape (§13.1) over the frozen `price_breakdown`
 *  jsonb field. The jsonb internal schema is dev-doc (Doc-4E Part4), NOT a frozen column set; these
 *  sub-fields are display structure only. Amounts are BDT (currency stored per value field). */
export interface PriceBreakdownLine {
  description?: string;
  qty?: number;
  unit_amount?: number;
  amount?: number;
}

/** Quotation engagement hand-off target for a WON outcome (S9). Navigation only — no cross-module
 *  write (DP10); the engagement is owned by M4. */
export interface EngagementHandoffView {
  href?: string;
  /** Buyer-set acceptance deadline, read-only from M4 (server-formatted; no client clock). */
  acceptance_deadline_label?: string;
}
