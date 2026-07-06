# Promotion Watchlist — shared-component promotions (FE-SH)

**FE Program Management v1.0** · Non-authoritative. **Owner (maintains): Architecture Board** —
state transitions are ruled at Board close only. The kit is the **frozen foundation**: extend,
never duplicate; every promotion is Board-gated and enters the kit as `[ESC-7B-…]`.

## Promotion lifecycle (no stage skipping — prevents duplicate-component accumulation)

```
Candidate → Approved (Board) → Extracted → Migrated → Old-removed → Closed
                 (+ Rejected / Deferred at any pre-Extracted stage)
```

| Stage | Requirement |
|---|---|
| **Approved** | all 4 criteria: ① used in ≥2 surfaces/workspaces · ② cited in ≥2 approved reviews (RV refs) · ③ byte-equivalence plan · ④ Board approval + `[ESC-7B-*]` registration |
| **Extracted** | component lands at its new home; consumers untouched |
| **Migrated** | all consumers repointed; **byte-equivalence proof per consumer** (RV-0038 precedent) |
| **Old-removed** | duplicate copies deleted; **grep-verified zero references** |
| **Closed** | Review Team 5 (B-lane) regression pass + row finalized |

## Watchlist

| Candidate | Reason | Current consumers | Owner (Mnt) | Review refs | Target | Cost | State |
|---|---|---|---|---|---|---|---|
| FE-SH-01 `DataListTable` | buyer/vendor/admin parallel table stacks; `AdminQueueTable` alone has 19 consumers. **FE-DOC escalation 2026-07-03:** documents hub incoming in BOTH workspaces (FE-DOC-02/03) — promotion decision requested via `BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md` item 3 (approve-with-extraction before FE-DOC-02/03, or explicit deferral; fallback = buyer-side use + shared `document-table-spec.ts`, no third copy ever). **2026-07-03 CTO override:** extracted to `src/frontend/components/data-list-table.tsx` ahead of the Board's "approve-with-extraction" ruling, specifically to unblock the Comparison Table promotion (below) — buyer-local file is now a re-export shim, zero behavior change, 12 consumers unaffected. `AdminQueueTable` (admin's own copy) NOT touched — still a separate implementation | buyer shared · vendor shared · admin (AdminQueueTable) | Kit owner | RV-0013 (canonical admin queue) · freeze-report OBS · FE-DOC packet item 3 | FE-CLN-03 (Migrated/Old-removed stages — direct consumer repoint + shim removal — still pending) | L | **Extracted** (2026-07-03, CTO override — WP card `governanceReviews/milestones/fe-sh-01-shared-kit-promotion/`; Board "Approved" gate + admin-copy merge still open) |
| FE-SH-02 `WorkspaceTabs` | vendor M8 extraction proved the shape; buyer tab wrappers similar | vendor/shared · buyer RFQ detail tabs | Kit owner | Team-3 M8 pass (byte-identical) · RV-0075 | FE-CLN-03 | M | Candidate |
| FE-SH-03 `DescriptionList` | buyer + vendor + public keep parallel copies | vendor/shared · buyer `_components` · public microsite | Kit owner | Team-3 M8 pass · RV-0022/0031 detail pages | FE-CLN-03 | M | Candidate |
| FE-SH-04 `PresentationFormNote` | presentation-only form notice duplicated across admin/vendor | vendor/shared · admin editors | Kit owner | RV-0029 (promotion OBS) | FE-CLN-03 | S | Candidate |
| FE-SH-05 Status components (`state-display`/`StatusChip`) | frozen Doc-4M token chips consumed by every surface. **2026-07-03 CTO override:** `quotationStateDisplay` alone extracted to `src/frontend/components/quotation-state-display.ts` (needed by the Comparison Table); the other 7 domain mappings (RFQ/engagement/payment/invoice/vendor-link/buyer-vendor/invitation) stay buyer-scoped, no 2nd-workspace need yet | all four surfaces | Kit owner | RV-0064 (additive state-display) · RV-0070 | FE-CLN-03 | M | **Partially Extracted** (2026-07-03, `quotationStateDisplay` slice only — WP card `governanceReviews/milestones/fe-sh-01-shared-kit-promotion/`) |
| FE-SH-06 `ActivityTimeline` | shared lifecycle timeline (buyer activity, routing log) | buyer shared (P-BUY-10/13) | Kit owner | RV-0056 · RV-0064 | FE-CLN-03 | S | Candidate |
| **FE-SH-07** `SealedMarker` (proposed ID — owner ratification pending) | inline sealed-until-close cell marker, governance-sensitive copy (Doc-3 §10.1) | buyer quotation detail · buyer comparison matrix | Kit owner | this WP card | — | S | **Extracted** (2026-07-03, CTO override — `src/frontend/components/sealed-marker.tsx`) |
| **FE-SH-08** Comparison/RFQ card composition (proposed ID — owner ratification pending) | `ComparisonTable`/`Summary`/`Empty`/builders (P-BUY-15) + new `RfqCard` (extracted from vendor `InvitationRow`, S2) | buyer comparison page · vendor RFQ inbox | Kit owner | this WP card | — | M | **Extracted** (2026-07-03, CTO override — `src/frontend/components/comparison/` + `src/frontend/components/rfq/`) |
| `Callout` (buyer inline dup ~10×) | FZ-05 freeze finding — extract before F2-Z closes | buyer surface (inline copies) | Team-2 → Kit owner | `BUYER_FRONTEND_FREEZE_REPORT_v1.0.md` FZ-05 | FE-CLN-01 | S | Candidate |
| `EngagementDocumentFileCard` | already extracted at rule-of-three (PO/Challan/WCC) — watch for cross-surface need | buyer engagement docs | Team-2 | RV-0038 (byte-equivalence proof) | — | S | Deferred (single-surface today) |
| `PipelineCard` (generic over `SourcingPipelineCard`/`EngagementPipelineCard`) | 2 structurally-parallel lifecycle-funnel widgets (RFQ + engagement); rule-of-three not yet met | buyer dashboard (both cards) | Team-2 | RV-0070 (Sourcing) · RV-0113 B#1 (Engagement, promotion-candidate flagged) | — | S | Deferred (2 instances only — extract if a 3rd funnel widget appears) |
| `RadioRow` consolidation | FZ-04 — hand-rolled radios across buyer/account forms | buyer + account forms | Kit owner | freeze report FZ-04 · RV-0036/0066 (OBS) | FE-DS-06 | S | Candidate |
| `EngagementDocumentDetail` composition | WP-1 Review-A OBS (2026-07-06): LOI is the FOURTH near-verbatim engagement-document `T-DETAILS` view (PO/Challan/WCC/LOI — Breadcrumbs + PageHeader + details `DescriptionList` + `EngagementDocumentFileCard` + money `Callout` + party-scope note); rule-of-three crossed for the whole view shape (the PO's approval section stays a per-kind slot — `can_approve_po` is po-only) | buyer engagement docs (4 views) | Team-2 | WP-1 Review-A round 1 OBS · RV-0022/0038 lineage | next touch on any of the 4 views | S | Candidate |

## Reuse Register — shipped shared packages (point here before building navigation UI)

| Package | Home | Surfaces served | Provenance |
|---|---|---|---|
| **Navigation / Industrial Category Explorer** (FE-PUB-09) | `src/frontend/navigation/` — MegaMenu family · CategoryTree family · Taxonomy/MenuState providers · taxonomy-index · icon-registry · overlay v1 · `taxonomy.v1.json` (GENERATED — `scripts/generate-taxonomy-seed.mjs`, never hand-edit) | public header Explorer · mobile drawer · `/categories` inline + A–Z · category-landing sidebar tree · **future pickers** (buyer RFQ single-select, vendor onboarding multi-select, admin browser — `CategoryTree selectable` groundwork shipped, adoption in their own milestones) | MEGA_MENU package APPROVED 2026-07-03 (+ Approval Addenda); ONE renderer, many surfaces — never fork traversal, never hardcode categories |

FE-DS watch items (kit-owner scope, Board-gated): kit `FormField role="alert"` (FZ-09) · undefined
tokens `--iv-reading-max` / `--iv-form-max` (RV-0030/0087 OBS) · kit `Select` gap (RV-0029 OBS) ·
kit `Switch` gap (RV-0034 flag) — all → **FE-DS-06/FE-DS-07** scoping.
