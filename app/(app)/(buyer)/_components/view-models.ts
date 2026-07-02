// Buyer Workspace (Surface F · Doc-7F) — PRESENTATION VIEW-MODELS.
//
// These are the typed props the buyer presentation components render from. They are NOT the frozen
// Doc-5E/5F contract DTOs — they are the presentation shape the server layer (Doc-7C SR5, GI-02) will
// MAP the wired Doc-5E/5F reads onto when backend wiring lands (Wave 4/5; PARKED today). They coin no
// contract: every field traces to a frozen contract field by intent, and the lifecycle state unions
// below are the VERBATIM frozen Doc-4M / Doc-2 §3.5 state sets quoted in `buyer_planning_and_design.md`
// (§3.2 / §5.2 / §5.3). No state is invented, renamed, or simplified.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

/**
 * RFQ lifecycle — the frozen Doc-4M RFQ state machine (verbatim, `buyer_planning_and_design.md` §3.2/§5.2).
 * The buyer authors transitions OUT of buyer-driven states only; System-driven states are observe-only.
 */
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

/**
 * Quotation lifecycle — frozen Doc-4M quotation states (verbatim, §5.3). The buyer authors none of these
 * directly (only `shortlisted`/`selected` indirectly via RFQ-level commands); the rest are vendor/System.
 */
export type QuotationState =
  "draft" | "submitted" | "withdrawn" | "shortlisted" | "selected" | "not_selected" | "expired";

/**
 * Engagement lifecycle — pinned to the CONTRACT AUTHORITY (Doc-4F §F5 / Doc-2 §3.5): `open → in_delivery
 * → completed → closed`. A dispute is a trade-invoice `→ disputed` status + `DisputeRecorded` event, NOT
 * an engagement state (Doc-4F §F5.5).
 *
 * CARRIED FLAG-AND-HALT (`buyer_planning_and_design.md` §0.1): Doc-4M's engagement row instead lists
 * `active/completed/disputed/terminated`. This union deliberately encodes ONLY the contract-authority set
 * and is **pending reconciliation** before any engagement-state→screen wiring is finalized. Do not add
 * `active`/`disputed`/`terminated` here without the Board reconciliation.
 */
export type EngagementState = "open" | "in_delivery" | "completed" | "closed";

/**
 * Payment-record status — the frozen `payment_records` machine (Doc-4F §F5.6 / Doc-2 §10.5): `recorded →
 * confirmed` and nothing else. A payment record is a RECORD ONLY — the platform never moves funds (DF-6).
 */
export type PaymentStatus = "recorded" | "confirmed";

/**
 * Trade-invoice status — the frozen `trade_invoices` machine (Doc-4F §F5.5 / Doc-2 §10.5):
 * `issued → partially_paid → paid | disputed | cancelled`. A trade invoice is an M4 inter-party record —
 * it is NOT `billing.platform_invoices` (M7), carries no funds (DF-6). There is NO "approved" status.
 */
export type TradeInvoiceStatus = "issued" | "partially_paid" | "paid" | "disputed" | "cancelled";

/**
 * Private-vendor link status — the frozen `private_vendor_records.link_status` column (Doc-4F §F4 /
 * Doc-2 §10.5): `none → suggested → linked`. This is the private↔public profile LINK state (link-not-merge,
 * ADR-003), buyer-private. NOT the buyer's CRM approval status (approved/conditional/blacklisted), which the
 * list read does NOT project and which stays undetectable to the vendor (Inv #11).
 */
export type PrivateVendorLinkStatus = "none" | "suggested" | "linked";

/** Private-vendor record lifecycle — `private_vendor_records.state` (Doc-2 §3.5): `active | archived`. */
export type PrivateVendorState = "active" | "archived";

/** Private-vendor record source — `private_vendor_records.source` (Doc-2 §10.5): how the record was added. */
export type PrivateVendorSource = "manual" | "email_list" | "excel";

/**
 * Buyer→vendor CRM status — the frozen `buyer_vendor_statuses.status` (Doc-4F §F4.5 / Doc-2 §10.5):
 * `approved | conditional | blacklisted`, plus `none` (no open status; the read returns `none` after clear).
 * This is BUYER-PRIVATE and firewalled (M4): the owning buyer sees it on their own CRM detail, but it NEVER
 * leaks to the vendor or another buyer, NEVER mutates platform-wide scores, and a blacklist is undetectable
 * to the vendor (Inv #11 / §7.5). Its only cross-module egress is the internal RFQ-routing read (§F4.8).
 */
export type BuyerVendorStatus = "approved" | "conditional" | "blacklisted" | "none";

/** A monetary value pair — `{ amount, currency }`, BDT default at the render site only (GI-08; Doc-2 §0.4). */
export interface MoneyValue {
  amount: number;
  /** ISO 4217 code carried by the same contract value field; never assumed away from BDT elsewhere. */
  currency?: string;
}

/** One RFQ row in the dashboard "RFQs by state" work queue. `humanRef` is a display label; routes use opaque UUID. */
export interface RfqQueueRow {
  /** Opaque machine id (UUIDv7) — the route identifier; never a human ref. */
  id: string;
  /** Year-scoped human reference (e.g. `RFQ-2026-000123`) — DISPLAY ONLY. */
  humanRef: string;
  title: string;
  state: RfqState;
  /** Optional budget/estimate value the contract carries on the RFQ. */
  value?: MoneyValue;
  /** ISO-8601 instant of the last update (formatted at the render site). */
  updatedAt: string;
}

/** One quotation row in the "quotations awaiting review" queue. Buyer reads disclosed quotations only. */
export interface QuotationQueueRow {
  id: string;
  /** The RFQ this quotation answers (opaque id for routing). */
  rfqId: string;
  /** Vendor display name as the contract discloses it. */
  vendorName: string;
  state: QuotationState;
  /** Quoted amount the contract discloses to the buyer (Doc-3 §9.1). */
  amount?: MoneyValue;
  /** Quotation validity window end (ISO-8601), formatted at the render site. */
  validUntil?: string;
}

/** One engagement row in the "engagements needing action" queue. State is the pinned contract-authority set. */
export interface EngagementQueueRow {
  id: string;
  humanRef: string;
  /** Counterparty (awarded vendor) display name. */
  vendorName: string;
  state: EngagementState;
  value?: MoneyValue;
  updatedAt: string;
}

/** One recent-activity entry sourced from the immutable M0 audit timeline (read-only, non-disclosure-safe). */
export interface ActivityEntry {
  id: string;
  /** Human-readable activity label derived from the disclosed audit row (never an excluded/CRM signal). */
  label: string;
  /** ISO-8601 instant, formatted at the render site. */
  at: string;
  /** Optional related-entity deep link (opaque-id route). */
  href?: string;
}

/**
 * The four P-BUY-01 KPI figures (§9.1). Every figure is a WIRED READ — never client-computed — and the
 * counts respect non-disclosure: NO excluded/blacklist count is ever represented here (Inv #11; GI-12).
 * Fields are optional so the first-run / not-yet-wired state renders without any fabricated number.
 */
export interface BuyerDashboardKpis {
  /** Spend (Metric) — `{ amount, currency }`, BDT default. */
  spend?: MoneyValue;
  /** Active RFQs (Metric/Status) — count of in-flight RFQs. */
  activeRfqCount?: number;
  /** Awaiting MY approval (Status + count) — the surfacer into the P-BUY-12 approval queue. */
  awaitingMyApprovalCount?: number;
  /** Win rate (Trend) — a contract-provided ratio in [0,1]; no client computation. */
  winRate?: number;
}

/**
 * The complete P-BUY-01 view-model. `null` (or all-empty) drives the first-run empty state (single
 * "Create RFQ" CTA, §9.1). Populated, it drives the KPI band + the three work queues + recent activity.
 */
export interface BuyerDashboardViewModel {
  kpis: BuyerDashboardKpis;
  rfqQueue: RfqQueueRow[];
  quotationQueue: QuotationQueueRow[];
  engagementQueue: EngagementQueueRow[];
  recentActivity: ActivityEntry[];
}
