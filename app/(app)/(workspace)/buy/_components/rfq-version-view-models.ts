// Buyer Workspace — RFQ version history (P-BUY-11) PRESENTATION VIEW-MODELS.
//
// The typed props the P-BUY-11 view renders from. NOT the frozen Doc-4E DTO — the presentation shape the
// server layer (Doc-7C SR5, GI-02) will MAP the wired `rfq.get_rfq_version.v1` read onto at wiring
// (Wave 4; PARKED today). It coins nothing:
//   • the version projection is the frozen §E4.8 set — `rfq_id`, `human_ref`, `state`, `current_version_no`,
//     and the "scope-appropriate version content"; NO per-version author/timestamp is enumerated by the
//     contract, so none is modelled here (a version is identified by its intrinsic `version_no` sequence);
//   • `state` is the verbatim frozen Doc-4M `RfqState` union (imported from `view-models.ts`);
//   • the content fields map by intent to the `get_rfq` body and are all OPTIONAL, so the not-found /
//     single-version render needs no fabricated value.
//
// GOVERNANCE: `rfq_versions` is immutable + append-only (Doc-2 §5.4; Invariant #8 — versioned, never
// overwritten). This surface is READ-ONLY; there is no version write/edit affordance.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

import type { RfqState, MoneyValue } from "./view-models";

/**
 * The scope-appropriate version CONTENT carried by a single `rfq.get_rfq_version.v1` read (§E4.8). These
 * fields map by intent to the `get_rfq` RFQ body; all OPTIONAL so an early/sparse version renders without a
 * fabricated value. Exact DTO field names bind at wiring.
 */
export interface RfqVersionContent {
  title?: string;
  /** RFQ scope/spec summary (display only). */
  summary?: string;
  category?: string;
  /** Budget/estimate the RFQ carried at this version. */
  value?: MoneyValue;
  /** Delivery location label (display only). */
  deliveryLocation?: string;
  /** ISO-8601 "needed by" date, formatted at the render site. */
  neededBy?: string;
}

/**
 * One immutable RFQ revision (`rfq_versions`, append-only — Inv #8). Identified by its intrinsic,
 * monotonic `versionNo` (the contract's `version_no`); the version chain's order IS this sequence — the UI
 * never re-ranks it (GI-04). No author/timestamp is modelled (the §E4.8 projection enumerates none).
 */
export interface RfqVersion {
  versionNo: number;
  content: RfqVersionContent;
}

/**
 * The P-BUY-11 view-model. `null` drives the not-found ≡ genuine-absence state (GI-12; byte-identical to a
 * real 404 — no copy/layout/timing tell). `versions` arrives in the contract's intrinsic version order;
 * `currentVersionNo` is the frozen §E4.8 field (the head revision). Presentation derives "is current" from
 * it and computes nothing else.
 */
export interface RfqVersionHistoryData {
  /** Opaque machine id (UUIDv7) — the route identifier; never a human ref (Inv #5). */
  id: string;
  /** Year-scoped human reference (e.g. `RFQ-2026-000123`) — DISPLAY ONLY. */
  humanRef: string;
  /** Current RFQ lifecycle state (frozen Doc-4M) — shown as context on the version-history header. */
  state: RfqState;
  /** The head revision number (frozen §E4.8 `current_version_no`). */
  currentVersionNo: number;
  /** The disclosed immutable revisions, in intrinsic version order (Inv #8). */
  versions: RfqVersion[];
}
