<!--
  Doc-type: Board decision packet (decision-prep only — NOT a ruling, NOT a patch)
  Subject:  Buyer Frontend Contract Gaps — six ESC-class absences behind the BX-04 reserved routes
  Produced: 2026-07-06 (owner-directed intake, buyer_journey_v1.0.md next-actions ruling)
  Raise ≠ Accept: every entry is a RAISED item; the Board evaluates each against the §13
  Validate-Findings gate. AI does not author corpus patches — patch instruments follow rulings.
-->

# BOARD PACKET — Buyer Frontend Contract Gaps v1.0

**Track:** Buyer (Team-2) · **Packet date:** 2026-07-06 · **Prepared for:** Human Architecture
Board / Owner · **Prepared by:** FE program session (intake authoring only)

## Purpose

Open the dedicated Board intake the owner directed for the six reserved buyer sidebar surfaces
(`buyer_journey_v1.0.md` Part C / Decision Register): each was route-reserved at BX-04 with a
recorded "no frozen read exists" rationale in its `page.tsx` header, and each needs an **additive
contract** (or a product ruling first) before any build. The owner's standing rule applies:
**resolve each item individually through intake — the frozen journey documents are never edited in
place** (status changes land in the buyer journey Decision Register only).

## Status

- Six net-new handles registered 2026-07-06 in `esc_registry.md` §"Buyer Frontend Contract Gaps":
  `ESC-BUY-QUOTES-LIST` · `ESC-BUY-PO-LIST` · `ESC-BUY-MSG-INBOX` · `ESC-BUY-REPORTS` ·
  `ESC-BUY-SAVED-VENDORS` · `ESC-BUY-SPEC-LIB`.
- Adjacencies checked and **not** re-registered: `ESC-7G-Q-DRAFT` (vendor-side quotation draft),
  `ESC-7G-ENG-03` (per-engagement document enumeration), and the two frozen favorites forms
  (`marketplace.catalog_favorites` product/category per the FE-BUY-10 owner ruling;
  `operations.vendor_favorites` CRM-side) — none covers these gaps.
- **Opening this intake does not imply Board acceptance; each ESC remains unresolved until
  individually ratified.**

## How to use this packet (Raise ≠ Accept)

Per CLAUDE.md §13, each entry is adjudicated against the four questions — Valid? · Applicable? ·
Best for the product? · Consistent with the frozen corpus? — before any disposition. A ruling
produces (a) a Decision-record row below, (b) where accepted, a named additive patch instrument
(Doc-5x/Doc-4x, authored via the human patch channel), and (c) a status pointer in the buyer
journey Decision Register. Rejection with cause is a complete outcome.

## Authority-order primer (§7)

Every item touches rank-0 frozen contract surfaces (Doc-5D/5E/5F/5H) or module ownership
(`ESC-BUY-SPEC-LIB`), so **every ruling here is human-only**: AI sessions may prepare instruments
after a ruling, never decide one. Product-first items (`ESC-BUY-SAVED-VENDORS`,
`ESC-BUY-SPEC-LIB`) additionally need the owner's product decision before the contract question is
even posed.

## Summary table

| # | Item | Recommended disposition | Unblocks / affects |
|---|---|---|---|
| 1 | `ESC-BUY-QUOTES-LIST` — cross-RFQ quotations list read | Additive Doc-5E buyer-org list read (cursor-paginated, visibility-gated per R5; contract order authoritative per R6/GI-04) | `/quotations` "Received Quotes" |
| 2 | `ESC-BUY-PO-LIST` — cross-engagement PO list read | Additive Doc-5F roll-up read over `purchase_orders` (party-scoped, active-revision projection) | `/purchase-orders` Active/History |
| 3 | `ESC-BUY-MSG-INBOX` — unified M6 inbox read | Additive Doc-5H cross-thread inbox read (non-disclosure-bound; no excluded-party inference) | `/messages` |
| 4 | `ESC-BUY-REPORTS` — org-wide reporting reads | Additive Doc-5E/5F aggregate reads; KPI candidates = buyer_journey §A.6 (time-to-first-quote, quotes/RFQ, comparison time, cycle time, award rate — buyer-org-scoped, never vendor-facing) | `/reports` |
| 5 | `ESC-BUY-SAVED-VENDORS` — vendor-saving concept | **Product decision first** (is a third save-form wanted next to catalog favorites + CRM?); if yes, ownership ruling (M2 vs M4) then additive patch | `/saved-vendors` |
| 6 | `ESC-BUY-SPEC-LIB` — buyer spec library concept | **Product decision first**; module-ownership ruling required (buyer sourcing-reference library has no owning module today) | `/spec-library` |

## Full entries

### 1 · `ESC-BUY-QUOTES-LIST`
- **Gap:** quotations exist only per-RFQ (`list_quotations_for_rfq`) or per-document
  (`get_quotation`); no buyer-org-wide "all received quotes" aggregate read exists.
- **Frozen anchors (verified):** Doc-5E §2 read set; `app/(app)/(buyer)/quotations/page.tsx`
  header (BX-04 recorded absence); Doc-5E R5 (`quotation_visibility` server gating), R6/GI-04
  (contract order authoritative — an aggregate read must carry its own governed order).
- **Recommended disposition:** additive Doc-5E patch minting a buyer-leg cross-RFQ list read;
  visibility gating identical to the per-RFQ read; no ranking semantics.
- **Interim (binding now):** `ImplementationPendingView` reservation stands; no projection built.

### 2 · `ESC-BUY-PO-LIST`
- **Gap:** the PO is a per-engagement versioned child document (P-BUY-21,
  `get_engagement_document`); no cross-engagement "all my purchase orders" list read exists.
- **Frozen anchors (verified):** Doc-4F §F5.4/§F5.8 (BC-OPS-2 FROZEN);
  `purchase-orders/page.tsx` header; `ESC-7G-ENG-03` (the *per-engagement enumeration* gap —
  adjacent, distinct scope, stays separately registered).
- **Recommended disposition:** additive Doc-5F patch — party-scoped roll-up over
  `purchase_orders` active revisions; `?status` facets defined by the contract, not the client.
- **Interim (binding now):** reservation stands; `?status=active|history` varies copy only.

### 3 · `ESC-BUY-MSG-INBOX`
- **Gap:** M6 exposes only per-RFQ clarification threads (`manage_clarification`, P-BUY-16); no
  unified cross-RFQ inbox read.
- **Frozen anchors (verified):** Doc-5H thread reads; `messages/page.tsx` header; Inv #11 /
  GI-05 (an inbox read must be non-disclosure-bound — counts and previews can leak neither
  exclusion nor CRM facts).
- **Recommended disposition:** additive Doc-5H cross-thread inbox read, disclosure-collapsed rows.
- **Interim (binding now):** reservation stands; messaging remains per-RFQ.

### 4 · `ESC-BUY-REPORTS`
- **Gap:** no org-wide procurement reporting reads; the only analytics-tagged buyer surface is the
  per-RFQ comparison statement (P-BUY-15). R7 forbids client-computed figures, so no report page
  is renderable without contract reads.
- **Frozen anchors (verified):** `reports/page.tsx` header (R7 note); Doc-5E R7;
  `buyer_journey_v1.0.md` §A.6 (proposed, explicitly non-authoritative KPI definitions).
- **Recommended disposition:** additive Doc-5E/5F aggregate reads scoped buyer-org-only; the §A.6
  KPI candidates enter as the read wish-list — each figure a contract projection, never a vendor-
  facing signal.
- **Interim (binding now):** reservation stands; no figures fabricated anywhere.

### 5 · `ESC-BUY-SAVED-VENDORS`
- **Gap:** no vendor-saving read/concept. Distinct from P-BUY-05 Favorites (frozen
  `catalog_favorites`, **product/category only** per the FE-BUY-10 owner ruling) and from the
  buyer-private CRM (Inv #11 — relationship tracking, not a "saved" list).
- **Frozen anchors (verified):** `saved-vendors/page.tsx` header; FE-BUY-10 ruling (WBS row,
  RV-0117); BC-OPS-1 / BC-MKT-7 frozen forms.
- **Recommended disposition:** **product decision first** — whether a third save-form should exist
  at all; if yes, an ownership ruling (M2 discovery bookmark vs M4 private list — the choice
  carries Inv #11 exposure implications), then the additive patch.
- **Interim (binding now):** reservation stands; neither existing surface is repurposed.

### 6 · `ESC-BUY-SPEC-LIB`
- **Gap:** a buyer-facing specification library (saved/reference specs for sourcing) has no corpus
  concept; the only spec library is the vendor's own catalog spec surface (P-VND-09).
- **Frozen anchors (verified):** `spec-library/page.tsx` header; FE-VEN-04 (vendor surface built,
  workspace-boundary rule).
- **Recommended disposition:** **product decision first**, then a module-ownership ruling (no
  module owns a buyer sourcing-reference library today — Red-Flag territory if assumed), then the
  additive patch.
- **Interim (binding now):** reservation stands; the vendor page never crosses the boundary.

## Decision record (Board fills)

| # | Handle | Ruling (accept / reject / defer, with cause) | Patch instrument (if accepted) | Date |
|---|---|---|---|---|
| 1 | `ESC-BUY-QUOTES-LIST` | — | — | — |
| 2 | `ESC-BUY-PO-LIST` | — | — | — |
| 3 | `ESC-BUY-MSG-INBOX` | — | — | — |
| 4 | `ESC-BUY-REPORTS` | — | — | — |
| 5 | `ESC-BUY-SAVED-VENDORS` | — | — | — |
| 6 | `ESC-BUY-SPEC-LIB` | — | — | — |

---

*Non-authoritative decision-prep. Conforms upward; coins nothing; on any conflict the frozen
corpus wins (CLAUDE.md §7/§11). Registry rows: `esc_registry.md` §"Buyer Frontend Contract Gaps
(buyer_journey_v1.0 intake, 2026-07-06)".*
