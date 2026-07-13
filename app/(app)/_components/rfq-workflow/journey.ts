// RFQ WORKFLOW — Journey model (presentation groupings over the FROZEN state machines).
//
// This module is the single place the frontend describes the end-to-end RFQ procurement journey
// (author → validate → route → quote → evaluate → award → post-award). It COINS NO STATE: every
// lifecycle token below is the verbatim frozen Doc-4M / Doc-2 §5.4/§5.5 set (imported from the kit),
// and a "journey stage" is a PRESENTATION GROUPING of frozen states — orientation and navigation
// only, never a lifecycle authority (the state chip renders the frozen token; the journey strip is
// navigation-not-state). Terminal non-award outcomes (`closed_lost`/`expired`/`cancelled`) are NOT
// forward stages — they are outcomes, modelled separately so no surface renders them as progress.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation,
// Inv #9). Server-derived data (counts, permitted actions) always arrives via the adapter layer
// (./adapters); nothing here computes or decides.

import type { RfqState, InvitationState, QuotationState } from "@/frontend/components/rfq";

/**
 * Presentation journey-stage keys. NOT lifecycle states — never render one as a state token, never
 * send one to a contract. Each groups one or more frozen Doc-4M RFQ states for orientation.
 */
export type RfqJourneyStageKey =
  "authoring" | "validation" | "routing" | "quoting" | "evaluation" | "award" | "post_award";

/** The acting side a stage chiefly belongs to (display copy only — authorization is server-side). */
export type JourneyActor = "buyer" | "vendor" | "system" | "buyer_and_vendor";

/** One presentation stage of the RFQ journey. */
export interface RfqJourneyStage {
  key: RfqJourneyStageKey;
  /** Short strip label. */
  label: string;
  /** One-line description used on orientation surfaces. */
  summary: string;
  /** Who chiefly acts here (copy only). */
  actor: JourneyActor;
  /** Owning module POINTER for the stage's data (One Module, One Owner — display copy only). */
  ownerModule: "M3 — RFQ" | "M4 — Operations" | "M6 — Communication";
  /** The frozen Doc-4M RFQ states this stage groups (verbatim tokens; no state is coined). */
  rfqStates: readonly RfqState[];
  /**
   * Primary buyer surface for an RFQ in this stage (route builder over the OPAQUE id — Inv #5).
   * Absent ⇒ the stage has no buyer-leg deep surface (e.g. system-only validation).
   */
  buyerHref?: (rfqId: string) => string;
  /** Primary vendor surface for this stage (the vendor leg is received-only — DP1/BE-1). */
  vendorHref?: (rfqId: string) => string;
}

/**
 * The canonical forward journey — ordered presentation stages over the frozen RFQ machine
 * (Doc-2 §5.4 · Doc-3 §1 · Doc-4E, consolidated in Doc-4M). Post-award continues in M4 via the
 * `RFQClosedWon` → engagement seam (Doc-4M M6-1); this model points there, it never merges the two
 * machines into one.
 */
export const RFQ_JOURNEY: readonly RfqJourneyStage[] = [
  {
    key: "authoring",
    label: "Draft",
    summary:
      "The buyer authors the request (versioned RFQ document) and, where the org uses the gate, routes it for internal approval.",
    actor: "buyer",
    ownerModule: "M3 — RFQ",
    rfqStates: ["draft", "pending_internal_approval"],
    buyerHref: (id) => `/buy/rfqs/${id}`,
  },
  {
    key: "validation",
    label: "Validation",
    summary:
      "Submitted to the platform; the moderation gate reviews it (Admin decides — DE-5). A reject returns the RFQ to draft.",
    actor: "system",
    ownerModule: "M3 — RFQ",
    rfqStates: ["submitted", "under_review"],
    buyerHref: (id) => `/buy/rfqs/${id}`,
  },
  {
    key: "routing",
    label: "Matching & invitations",
    summary:
      "The matching engine routes the RFQ and invitations are delivered; vendors accept or decline. Clarifications open on the M6 thread.",
    actor: "system",
    ownerModule: "M3 — RFQ",
    rfqStates: ["matching", "vendors_notified"],
    buyerHref: (id) => `/buy/rfqs/${id}/routing`,
    vendorHref: (id) => `/sell/rfqs/${id}`,
  },
  {
    key: "quoting",
    label: "Quotations",
    summary:
      "Invited vendors author and submit quotations (immutable versions — a revision is a new version, never an edit).",
    actor: "vendor",
    ownerModule: "M3 — RFQ",
    rfqStates: ["quotations_received"],
    buyerHref: (id) => `/buy/rfqs/${id}`,
    vendorHref: (id) => `/sell/rfqs/${id}/quotation`,
  },
  {
    key: "evaluation",
    label: "Comparison & evaluation",
    summary:
      "The System-generated comparison statement supports the buyer's technical and commercial evaluation. Decision support only — it never recommends (R6).",
    actor: "buyer",
    ownerModule: "M3 — RFQ",
    rfqStates: ["buyer_reviewing"],
    buyerHref: (id) => `/buy/rfqs/${id}/compare`,
  },
  {
    key: "award",
    label: "Shortlist & award",
    summary:
      "The buyer shortlists and explicitly awards exactly one quotation (no auto-winner — R6), or closes without award / reissues.",
    actor: "buyer",
    ownerModule: "M3 — RFQ",
    rfqStates: ["shortlisted"],
    buyerHref: (id) => `/buy/rfqs/${id}/award`,
  },
  {
    key: "post_award",
    label: "Post-award",
    summary:
      "`RFQClosedWon` hands off to Operations (M4): engagement, LOI/PO/challan/WCC document chain, trade invoices and payment records.",
    actor: "buyer_and_vendor",
    ownerModule: "M4 — Operations",
    rfqStates: ["closed_won"],
    buyerHref: () => `/buy/engagements`,
    vendorHref: () => `/sell/engagements`,
  },
] as const;

/**
 * Terminal non-award outcomes — frozen states that END the journey without reaching post-award.
 * Never rendered as forward progress; surfaces show the state chip plus, where permitted, the
 * `reissue_rfq` affordance (a NEW aggregate — the source RFQ is never mutated, Doc-5E §4.6).
 */
export const TERMINAL_RFQ_OUTCOMES: readonly RfqState[] = ["closed_lost", "expired", "cancelled"];

/** Resolve the journey stage a frozen RFQ state belongs to (`null` for terminal non-award outcomes). */
export function journeyStageForRfqState(state: RfqState): RfqJourneyStage | null {
  return RFQ_JOURNEY.find((stage) => stage.rfqStates.includes(state)) ?? null;
}

/**
 * One pipeline bucket for the buyer/vendor workflow summaries — a SERVER-SUPPLIED count over a
 * documented set of frozen states (the adapter's stand-in server derives it today; the wired
 * faceted read supplies it at integration — never client-computed, R7).
 */
export interface JourneyBucketCount {
  /** Stable bucket key (presentation grouping key — never a state token). */
  key: string;
  label: string;
  count: number;
  /** Optional destination for the bucket (a filtered list / stage surface). */
  href?: string;
}

/**
 * The VENDOR-LEG journey — presentation groupings over the vendor's OWN facts only (its invitation
 * state + its quotation state, both frozen Doc-4M sets). Received-only (DP1/BE-1): the vendor leg
 * begins at `delivered` and never sees buyer-internal stages; nothing here discloses a competitor
 * fact (ND-1..ND-8).
 */
export interface VendorJourneyStage {
  key: "invited" | "preparing" | "submitted" | "buyer_review" | "outcome" | "post_award";
  label: string;
  summary: string;
}

export const VENDOR_JOURNEY: readonly VendorJourneyStage[] = [
  {
    key: "invited",
    label: "Invitation",
    summary: "A delivered invitation awaiting your accept/decline response.",
  },
  {
    key: "preparing",
    label: "Preparing quotation",
    summary: "Invitation accepted; the quotation is being authored (draft).",
  },
  {
    key: "submitted",
    label: "Submitted",
    summary: "Quotation submitted — revisions create new immutable versions.",
  },
  {
    key: "buyer_review",
    label: "Buyer review",
    summary: "Your quotation is shortlisted with the buyer.",
  },
  {
    key: "outcome",
    label: "Outcome",
    summary: "Awarded or not selected (a non-penalizing, banded outcome).",
  },
  {
    key: "post_award",
    label: "Post-award",
    summary: "Won engagements continue in the M4 workspace (documents, delivery, completion).",
  },
] as const;

/**
 * Resolve the vendor journey stage from the vendor's OWN facts. Returns `null` when the journey
 * ended without an outcome (declined / expired / withdrawn) — surfaces show the chip, not progress.
 */
export function vendorJourneyStageFor(
  invitationState?: InvitationState,
  quotationState?: QuotationState,
): VendorJourneyStage | null {
  const find = (key: VendorJourneyStage["key"]) =>
    VENDOR_JOURNEY.find((s) => s.key === key) ?? null;
  if (quotationState === "selected") return find("post_award");
  if (quotationState === "not_selected") return find("outcome");
  if (quotationState === "shortlisted") return find("buyer_review");
  if (quotationState === "submitted") return find("submitted");
  if (quotationState === "withdrawn" || quotationState === "expired") return null;
  if (invitationState === "accepted") return find("preparing");
  if (invitationState === "delivered") return find("invited");
  return null;
}

/**
 * Buyer pipeline buckets — each bucket is a documented UNION OF FROZEN STATES (nothing else).
 * The per-state funnel remains `SourcingPipelineCard` (P-BUY-01); these coarser journey buckets
 * serve the RFQ workspace list header.
 */
export const BUYER_PIPELINE_BUCKETS: readonly {
  key: string;
  label: string;
  states: readonly RfqState[];
}[] = [
  { key: "drafting", label: "Drafting", states: ["draft"] },
  // Split out from "Drafting" (rfq-workflow.md review MINOR-02): the approval gate is a distinct
  // buyer workflow moment (it feeds the /approvals queue); still a pure frozen-state union.
  {
    key: "internal_approval",
    label: "Awaiting internal approval",
    states: ["pending_internal_approval"],
  },
  { key: "validation", label: "In validation", states: ["submitted", "under_review"] },
  { key: "routing", label: "Matching & invited", states: ["matching", "vendors_notified"] },
  { key: "quoting", label: "Quotes received", states: ["quotations_received"] },
  { key: "evaluation", label: "In evaluation", states: ["buyer_reviewing"] },
  { key: "award", label: "At award", states: ["shortlisted"] },
  { key: "post_award", label: "Awarded", states: ["closed_won"] },
  { key: "closed", label: "Closed without award", states: ["closed_lost", "expired", "cancelled"] },
] as const;
