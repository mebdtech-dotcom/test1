// P-BUY-20 Buyer Engagement detail — view-model. PRESENTATION-ONLY.
//
// Grounds STRICTLY in the FROZEN read `ops.get_engagement.v1` (Doc-4F §F5.8). Its response projects:
//   engagement : { engagement_id, human_ref, status, buyer_organization_id, vendor_profile_id,
//                   vendor_controlling_org_id, award_value_snapshot, currency }
// This view-model carries ONLY the fields the buyer detail SURFACES — it invents nothing and coins no
// field the contract does not return (Content ≠ Presentation, Inv #9):
//   • `award_value_snapshot` + `currency` → one `awardValue` MoneyValue (currency-DRIVEN; BDT never assumed,
//     Doc-2 §0.4). This is a RECORDED value only — the platform never holds/moves funds (DF-6 / R8).
//   • the counterparty is projected as OPAQUE party ids only (`vendor_profile_id` / `vendor_controlling_
//     org_id`); NO display name is in this projection, so none is coined. The vendor is shown as an id/ref
//     with a neutral label; a display-name gap is the `ESC-7G-ENG-02` class (registered handle).
// Deliberately NOT surfaced (projected but not buyer-meaningful on this screen): `buyer_organization_id`
// (the viewer's own active org — implicit context) and `vendor_controlling_org_id` (redundant with the
// profile ref for display). Omitting a projected field is a presentation choice; coining one is not.
//
// NOT projected by this read (so NOT rendered as data — interim only, by pointer):
//   • `rfq_id` → the engagement→RFQ link is `ESC-7G-ENG-01` ("[pending projection]").
//   • an engagement document LIST → `ESC-7G-ENG-03` (only single-doc `get_engagement_document` exists;
//     no `list_engagement_documents` for the BC-OPS-2 record set) → a per-document EXISTENCE indicator
//     stays ungrounded. The Documents card (FE-BUY-07; +LOI at WP-1) still links to the 6 fixed
//     document-kind routes (P-BUY-21..25 + the LOI face of P-BUY-21) as plain navigation, derived from
//     `id` alone — no enumeration, no coined field.
//
// GOVERNANCE: party-scoped — a non-party caller collapses to NOT_FOUND (Doc-4F §F5.8 V4 / H.9), rendered
// BYTE-IDENTICAL to genuine absence (Inv #11 / GI-12) via `notFound()`. `engagement_id` is OPAQUE (Inv #5).

import type { EngagementState, MoneyValue } from "./view-models";

export interface EngagementDetailData {
  /** `engagement_id` — opaque routing id (Inv #5). */
  id: string;
  /** `human_ref` — year-scoped display ref (e.g. `ENG-2026-000118`). Display-only. */
  humanRef: string;
  /** `status` — frozen contract-authority enum (open | in_delivery | completed | closed). */
  state: EngagementState;
  /** `award_value_snapshot` + `currency` as one value — a RECORDED figure only (DF-6, no funds move). */
  awardValue?: MoneyValue;
  /** `vendor_profile_id` — the counterparty as an OPAQUE ref; no display name is projected (ESC-7G-ENG-02). */
  vendorProfileRef: string;
}
