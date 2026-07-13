// Buyer Workspace — RFQ list (P-BUY-06) + RFQ detail (P-BUY-08) PRESENTATION VIEW-MODELS.
//
// Presentation shapes the server layer (Doc-7C SR5, GI-02) MAPS the wired Doc-5E reads (`list_rfqs`,
// `get_rfq`) onto when backend wiring lands (Wave 4; PARKED today). They are NOT the frozen Doc-5E DTOs
// and they coin nothing: the `RfqState` lifecycle union is the verbatim frozen Doc-4M set (imported from
// `view-models.ts`); the content fields below map by intent to `get_rfq` fields and are all OPTIONAL so
// the not-found/empty render needs no fabricated value. Exact DTO field names bind at wiring.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

import type {
  RfqState,
  QuotationState,
  MoneyValue,
  ActivityEntry,
  RoutingMode,
} from "./view-models";
import type { WorkNature } from "./rfq-create/rfq-form-models";

/** One RFQ row in the P-BUY-06 list. `humanRef` is a display label; routes carry the opaque `id`. */
export interface RfqListItem {
  id: string;
  humanRef: string;
  title: string;
  state: RfqState;
  /** Budget/estimate the contract carries on the RFQ. */
  value?: MoneyValue;
  /** Category label, if the contract provides one (display only). */
  category?: string;
  /** ISO-8601 last-updated instant, formatted at the render site. */
  updatedAt: string;
}

/**
 * The P-BUY-06 list view-model. `null` drives the first-run empty state (the "Create RFQ" CTA per the
 * §II.6 contract-empty row). Cursor pagination only (GI-03) — `nextCursor` is opaque; offset/page-number
 * pagers are forbidden. `total` renders only if the contract provides it (GI-12).
 */
export interface RfqListData {
  items: RfqListItem[];
  /** Opaque forward cursor (GI-03); absent/null ⇒ last page. */
  nextCursor?: string | null;
  /** Contract-provided total (optional; never client-computed). */
  total?: number;
}

/**
 * A Doc-4M-permitted RFQ lifecycle action for the P-BUY-08 toolbar. The SERVER derives the permitted set
 * (GI-10 — "offer only permitted transitions"); the presentation renders them and decides nothing. These
 * are buyer-driven RFQ-lifecycle transitions only (`submit_rfq` / `cancel_rfq` / `reissue_rfq`). NOTE:
 * the underlying writes are audit-backed and PARKED behind `ESC-W2-AUDIT-RLS` + the write-wiring
 * milestone — this milestone renders the affordances (presentation), it does not wire the write.
 */
export interface RfqLifecycleAction {
  /** Frozen buyer command bound by pointer (Doc-5E) — never a coined slug. */
  key: "submit_rfq" | "cancel_rfq" | "reissue_rfq";
  /** Display label derived by the surface from the command. */
  label: string;
  /** Presentation emphasis: `primary` for the state's main action, `danger` for cancel. */
  emphasis?: "primary" | "danger" | "default";
}

/**
 * The P-BUY-08 detail view-model. `null` drives the not-found ≡ genuine-absence state (GI-12; byte-
 * identical to a real 404 — no copy/layout/timing tell). Content fields are optional and map by intent
 * to `get_rfq`. The `lifecycle` timeline is the read-only Doc-4M/audit history; `permittedActions` is the
 * server-derived GI-10 set (presentation renders, never decides).
 */
export interface RfqDetailData {
  id: string;
  humanRef: string;
  title: string;
  state: RfqState;
  value?: MoneyValue;
  /** RFQ scope/spec summary the contract carries (display only). */
  summary?: string;
  category?: string;
  /**
   * Requested work nature — the frozen capability SET (Inv #1: a matrix of
   * {supply,service,fabricate,consult}, NEVER a single label). Maps by intent to `get_rfq` `work_nature[]`.
   */
  workNature?: WorkNature[];
  /**
   * Routing breadth — the frozen `rfqs.routing_mode` (Doc-2 §10.4). Observe-only context (the buyer set the
   * breadth at authoring; the engine decides who is invited — R6). NOT a governance signal.
   */
  routingMode?: RoutingMode;
  /** Current immutable revision number (frozen `current_version_no`; Inv #8). Cross-links to P-BUY-11. */
  currentVersionNo?: number;
  /** Delivery location label (display only). */
  deliveryLocation?: string;
  /** ISO-8601 "needed by" date, formatted at the render site. */
  neededBy?: string;
  createdAt: string;
  updatedAt: string;
  /** Read-only lifecycle/audit timeline (reuses the shared ActivityEntry shape). */
  lifecycle: ActivityEntry[];
  /** Doc-4M-permitted buyer actions for the current state (GI-10; server-derived). */
  permittedActions: RfqLifecycleAction[];
  /**
   * The P-BUY-09 Quotations tab data (`list_quotations_for_rfq`). At wiring this is an INDEPENDENTLY
   * streamed read (its own Suspense boundary — §11.4). `null`/absent ⇒ the tab renders its
   * visibility-gated contract-empty state ("awaiting vendor responses"). Optional so the not-found and
   * Overview-only renders need no quotation data.
   */
  quotations?: QuotationListData | null;
}

/**
 * One quotation row in the P-BUY-09 list (`list_quotations_for_rfq`, T-LISTING). The buyer sees each
 * DISCLOSED quotation's real values (Doc-3 §9.1). `quotationStateDisplay` maps the frozen state to a
 * neutral label/tone — `not_selected`/`withdrawn` are uniform and NON-PENALIZING (Doc-3 §8.3/§9.5); a
 * vendor never learns it "lost". Routes use the OPAQUE quotation id.
 */
export interface QuotationListItem {
  id: string;
  /** Vendor display name as the contract discloses it. */
  vendorName: string;
  state: QuotationState;
  /** Quoted amount disclosed to the buyer (Doc-3 §9.1). */
  amount?: MoneyValue;
  /** Quotation validity window end (ISO-8601), formatted at the render site. */
  validUntil?: string;
  /** ISO-8601 submission instant of this (immutable) version (Inv #8), formatted at the render site. */
  submittedAt?: string;
}

/**
 * The P-BUY-09 list view-model. VISIBILITY-GATED: the server returns only DISCLOSED quotations (outside
 * the buyer's `quotation_visibility` scope collapses to NOT_FOUND server-side — never a client 404). The
 * UI renders rows in the caller-supplied governed order and NEVER re-ranks the matching set (R6/GI-04).
 * Cursor pagination only (GI-03); `total` renders only if the contract provides it — a client-computed
 * total could leak a count of withheld quotes (GI-12).
 */
export interface QuotationListData {
  items: QuotationListItem[];
  nextCursor?: string | null;
  total?: number;
}
