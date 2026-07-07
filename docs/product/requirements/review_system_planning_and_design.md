<!--
Status:     v1.0-rc — adversarial review round COMPLETE (AR-01 folded); prototype
            (prototypes/review-system/) VISUALLY APPROVED by owner 2026-07-08; Surface 2
            card layout = Option A (testimonial). Next gate: Board packet for FE page-ID +
            milestone mints (governanceReviews/BOARD-PACKET-REVIEW-SYSTEM-FE-MINTS_v1.0.md).
            Authorizes NO build (backend wave-gated; FE page-IDs Board-only).
Authority:  NON-AUTHORITATIVE planning/design companion. PLANNING ONLY · wave-gated ·
            reorders no roadmap · coins nothing. On any conflict the frozen
            generatedDocs/ corpus wins (CLAUDE.md §7) and this document is patched to match.
            Sibling of buyer_planning_and_design.md and vendor_planning_and_design.md.
Produced:   2026-07-08. Pre-authoring plan adjudicated by the owner in two rounds
            (5 MAJOR + 11 MINOR + 8 NIT, all VALID and folded) — see §10 Disposition Log.
Scope:      All three rating lanes — public reviews (M5 BC-TRUST-5), admin ratings
            (M5, staff-only), private vendor ratings (M4 BC-OPS-1, buyer-private).
-->

# iVendorz Review System — Planning & Design (all three rating lanes)

> **Status:** NON-AUTHORITATIVE planning/design companion — **PLANNING ONLY · wave-gated ·
> reorders no roadmap · coins nothing.** The review system is **already fully frozen** in the
> corpus (Doc-2 §3.6/§10.6 · Doc-4G BC-TRUST-5 · Doc-5G · Doc-4F BC-OPS-1); this document
> realizes its UX/planning surface and binds every entity, contract, state, slug, and policy
> key **by pointer** (reference-never-restate). Any genuine gap is surfaced as an escalation
> pointer, never an invention. On any conflict with a frozen document: **Flag-and-Halt**
> (cite both sides, escalate — CLAUDE.md §11), never resolve locally. Backend realization is
> **roadmap-gated** (M5 = Wave 3; M8 moderation leg = Wave 5; current = Wave 2 per
> `generatedDocs/Build_Roadmap_v1.0.md`); this is planning ahead of those gates under the
> standing presentation-only parallel authorization ("parallelization, not reorder").

---

## 0. Front Matter

### 0.1 What this is

One cohesive planning/design package for the platform's three governed rating lanes: the
buyer→vendor **public reviews** pipeline (submit → moderate → publish → display → feed
Performance inputs), the staff-only **admin ratings** instrument, and the buyer-private
**private vendor ratings** in the M4 CRM. The corpus froze the mechanism; this package plans
the surfaces. As presiding author I apply the **Validate-Findings gate** (Valid? Applicable?
Best for the product? Consistent with the frozen corpus? — CLAUDE.md §13) to every review
finding; dispositions are recorded in §10.

### 0.2 Scope

- **In scope:** the three-lane model and firewall map; journey binding; five surface
  specifications (screens, flows, states, composition by kit name, per-surface conformance);
  kit/component plan; non-disclosure playbook; an illustrative page-ID/WBS proposal
  (non-authoritative, §7); a phased wave-gated build annex (informative, §8); open questions
  and escalations (§9).
- **Out of scope (by pointer only):** any change to a frozen mechanism/contract/state
  machine; the matching/routing engine; score computation (BC-TRUST-2/3); verification
  (BC-TRUST-1); fraud signals (BC-TRUST-4); all backend implementation (wave-gated, §8).

### 0.3 Authority pointers (all FROZEN; bound, never restated)

| Concern | Pointer |
|---|---|
| Domain model, columns, tenancy, soft-delete | Doc-2 §3.6 (trust entities) · §10.5 (`operations`) · §10.6 (`trust` — `public_reviews`, `admin_ratings` columns) · §5 (aggregates) · §7 (permission catalog) · §9 (audit actions) |
| Public-review + admin-rating contracts | `generatedDocs/Doc-4G_PassB_Part5_BC-TRUST-5_Reviews_Admin_Ratings_v1.0.md` (§H rails · §G8.1–§G8.5) + `Doc-4G_PassB_Part5_Patch_v1.0.md` (two-step publish F4G-PB5-MA2; staff-slug and visibility hardenings) |
| Wired HTTP realization (M5) | Doc-5G (`Doc-5G_Content_v1.0_Pass1.md` §2.5 inventory #27–34 · `Doc-5G_Content_v1.0_Pass3.md` §7) |
| Private CRM rating contract | `generatedDocs/Doc-4F_PassB_Part1_BC-OPS-1_Buyer_Private_CRM_v1.0.md` §F4.4 (`ops.set_private_vendor_rating.v1`) |
| Performance-score feed | BC-TRUST-3 `trust.ingest_performance_input.v1` (sole writer of `performance_inputs`, F4G-M2); Buyer Feedback component weight per `ADR_Compendium_v1.md` (performance components table) |
| Journeys | `docs/product/journeys/journeys_trust.md` §B5 (**J-REV**) · J-PSC (consumption) · `docs/product/journeys/JOURNEY_ATLAS.md` (FE ownership: Doc-7F author · Doc-7D read) · J-ADM-01 (moderation leg composition) |
| Frontend realization / kit / shell | Doc-7A (R1–R12) · Doc-7B (kit/tokens) · Doc-7C (shell/data layer) · Doc-7D (public surfaces; Pass2 Patch binds the published-reviews public view) · Doc-7F (buyer workspace) |
| POLICY keys | Doc-3 §12.2 via `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust.md` — `trust.idempotency_dedup_window` · `trust.list_page_size_max` (transport-only; must not influence any governance signal) |
| Audited-write implementation pattern | `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` (D7 canonical — binding for every Wave-3+ review write) |

> **State-machine authority note (load-bearing — prevents a future mis-grounding).**
> Doc-4M is the corpus's general lifecycle index, but **Doc-4M does not contain the Public
> Review machine**. The review lifecycle's authority is **Doc-2 §3.6/§10.6 + Doc-4G Part5
> §H.5/§G8** (realized in Doc-5G Pass3 §7). Implement and design from those anchors, never
> from Doc-4M.

### 0.4 How to read

1. **§1 Design principles** and **§2 the three-lane model** are foundational — read first.
2. **§3** binds the frozen journeys by pointer. **§4** holds the five surface
   specifications (the core). **§5–§6** are the shared component plan and the
   non-disclosure playbook.
3. **§7** is an illustrative, non-authoritative page-ID/WBS proposal (Board-gated).
   **§8** is the wave-gated build annex (informative only). **§9** consolidates open
   questions/escalations. **§10** is the disposition log.

### 0.5 Terminology (one voice across this document)

- **Public reviews** — the buyer→vendor post-award review lane (`trust.public_reviews`).
  Always this phrase; never "review display," "vendor reviews," or "ratings" alone.
- **Vendor public microsite** — the anonymous public vendor surface (`app/(public)/vendors/[slug]`,
  P-PUB-13, Doc-7D). Never "vendor public profile."
- **Surface specification** — a per-screen section of §4, named **Surface 1 … Surface 5**.
- **Lane PUB / Lane ADM / Lane CRM** — the three rating lanes (§2). Textual labels only.
- **Band** = qualitative governance-signal label; rating values (1–5) in Lane PUB are frozen
  content fields, not governance bands.

---

## 1. Design Principles

- **DP-R1 — Derived-statistics freeze (binding).** *No aggregate rating, average score,
  star-average, review-count-derived score, recommendation percentage, or any other derived
  review statistic may be displayed on any surface unless explicitly authorized by future
  corpus guidance (Board channel). Only individual `published` reviews and their frozen
  fields render.* The corpus defines no aggregation formula, weighting, rounding, or
  publication rule for a derived value; rendering one would coin behavior (Golden Rule 10;
  CLAUDE.md §11 reference-never-restate). See §9(a).
- **DP-R2 — Content ≠ Presentation, applied independently (Invariant #9)** to each of:
  **Review Body** (content — owned by the frozen `body` field), **Rating Value** (content —
  frozen `rating` 1–5), **Display Placement** (presentation — this package's concern), and
  **Sorting** (presentation — §4 Surface 2 ordering rule).
- **DP-R3 — Projection boundary (binding).** *Presentation consumes ONLY the Marketplace
  public projection (DG-2); it MUST NOT query or import Trust-owned entities/reads directly.*
  (Doc-4G Part5 §H.7/§G8.5; Doc-2 §10.6 "Marketplace displays via service — never table
  access.")
- **DP-R4 — Only `published` is public.** Non-published states (`submitted` / `approved` /
  `rejected` / `removed`) never render on any public surface; a non-published review is a
  `NOT_FOUND` on the public read (Doc-4G Part5 §G8.5). Presentation must not undermine the
  protected-fact collapses of §H.4 (see §6).
- **DP-R5 — Lanes never merge (Doc-4G §H.9a).** Public reviews, admin ratings, and private
  CRM ratings are separate authorities with separate visibility laws; no surface co-locates
  them as comparable values, and no surface lets one lane's value imply another's.
- **DP-R6 — No score is mutated by any review step.** Publication only *feeds inputs*
  (Path B via BC-TRUST-3; Doc-4G §H.9b/c). No surface presents a review action as changing
  any score, and no surface reveals formula, weighting, percentile, or ranking effect
  (ADR performance-visibility ladder; Doc-4A §7.5).
- **DP-R7 — Frozen vocabulary only.** The five review statuses, the contract slugs, the
  permission slugs (`can_submit_review`, `can_manage_private_vendors`, `staff_can_verify`,
  `staff_super_admin`), audit actions, and POLICY keys are bound by pointer; this package
  and every downstream build coin none.

---

## 2. The Three-Lane Model and Firewall Map

| | **Lane PUB — public reviews** | **Lane ADM — admin ratings** | **Lane CRM — private vendor ratings** |
|---|---|---|---|
| Owner | M5 Trust (BC-TRUST-5, `public_reviews` AR) | M5 Trust (BC-TRUST-5, `admin_ratings` AR) | M4 Operations (BC-OPS-1, child of Private Vendor Record AR) |
| Author | Buyer User (post-award, engagement-gated) | Platform staff | Buyer org member |
| Visibility | Public **after `published` only**, via Marketplace service projection (DG-2) | **Staff-only** — never tenant-visible, never public, never exposed externally; non-staff access collapses to `NOT_FOUND` | **Owning buyer org only** |
| Lifecycle | `submitted → approved → published \| rejected \| removed` (Doc-2 §3.6/§10.6; Doc-4G §H.5) | simple — set/update + soft delete, no multi-state machine (Doc-4G §H.5) | simple (Doc-2 §10.5) |
| Feeds a score? | **Only** on publish, as an approved input via BC-TRUST-3 (Path B, Buyer Feedback) — never a direct mutation | **Never** — internal signal only | **Never** — "never feeds any score" (Doc-4F §F4.4, DG-4) |
| Events | **None** — state + §9 audit only (Doc-4G §H.7) | None | None (Doc-4F Part1) |

**Never-cross rules (each grounded, each binding on every surface in §4):**

1. Lanes never merge or co-display as comparable values (Doc-4G §H.9a; DP-R5).
2. Presentation consumes only the Marketplace public projection for Lane PUB; it must not
   query or import Trust-owned entities/reads directly (DP-R3).
3. **Lane CRM is never exported, never searchable outside the owning tenant, never shown
   outside the tenant, and never feeds any score** (Doc-4F §F4.4; Doc-2 §10.5 tenant-owned
   "never disclosed"; ADR-007 R3.3 non-disclosure).
4. Lane ADM never renders outside staff surfaces; its existence is itself a protected fact
   (`NOT_FOUND` collapse — Doc-4G Part5 Patch, §G8.5).
5. No paid plan/entitlement/flag gates or influences any review/rating (Doc-4G §H.9e, DG-7).
6. Reviews are informational signals only — never matching/routing/ranking/evaluation
   inputs (Doc-4G §H.9g; procurement moat).

---

## 3. Journey Binding (authoritative by pointer; diagrams not duplicated here)

| Journey step | Contract (frozen) | Bound in this package at |
|---|---|---|
| **J-REV-01 Submit** | `trust.submit_review.v1` | Surface 1 |
| **J-REV-02 Moderate** | `trust.moderate_review.v1` | Surface 3 |
| **J-REV-03 Publish** | `trust.publish_review.v1` (feeds `performance_inputs` Buyer Feedback → J-PSC) | Surface 3 |
| **J-REV-04 Remove** | `trust.remove_review.v1` | Surface 3 |
| **J-REV-05 Display** | Marketplace service read of `published` reviews (`trust.get_review.v1` / `trust.list_reviews.v1`) | Surface 2 |
| Admin-rating instrument | `trust.set_admin_rating.v1` · `trust.list_admin_ratings.v1` | Surface 5 |
| Private CRM rating (BC-OPS-1) | `ops.set_private_vendor_rating.v1` | Surface 4 |

Authority: `docs/product/journeys/journeys_trust.md` §B5 (J-REV, frozen Journey Atlas v1.0);
J-PSC consumes published-review inputs; the moderation leg is composed by J-ADM-01;
FE ownership per the Atlas registry: **Doc-7F (author) · Doc-7D (read)**. The journey
diagrams and step tables live there and are **not duplicated** into this package.

---

## 4. Surface Specifications

| Surface | Lane | Audience | Owner (module) |
|---|---|---|---|
| 1 — Buyer review submission | PUB | Buyer org members | M5 contracts (authoring UX per Doc-7F) |
| 2 — Public reviews display | PUB | Anonymous / public | M2 projection over M5 (Doc-7D) |
| 3 — Moderation queue + case detail | PUB | Platform staff | M5 contracts, Admin actor |
| 4 — Private CRM ratings | CRM | Owning buyer org only | M4 |
| 5 — Admin ratings | ADM | Platform staff only | M5 |

Every surface below composes the frozen kit (Doc-7B) and the shared four-state pattern
(loading / empty / error / success) per the platform cross-cutting UX system; states cite
the frozen status vocabulary only.

### Surface 1 — Buyer review submission (Lane PUB)

- **Purpose:** author a post-award public review of a vendor, anchored to a real engagement
  — "never drive-by ratings" (J-REV intent arc).
- **Entry:** from the engagement context in the buyer workspace (Doc-7F) — the engagement
  detail surface offers "Write a review" only when the frozen gate can hold: the engagement
  is the caller-org's and post-award (`trust.submit_review.v1` stages 7–8).
- **Form (frozen request shape, nothing added):** `rating` (required, 1–5 — `RatingStars`
  input, §5) · `body` (optional, `text`) · vendor + engagement bound from context (never
  free-picked); `author_organization_id` is server-set, never a form field.
- **One-review rule (UX law):** if a review already exists for the engagement, the surface
  is **view-only** — the submission affordance is not rendered and no second submission
  path exists in the UI. (The frozen contract enforces this as a `BUSINESS` error; the UI
  must not rely on the error as its primary UX.)
- **After submit:** the `submitted` status renders **from the submit response itself**
  (`trust.submit_review.v1` returns `status = submitted` + `public_review_id`) as a one-time
  confirmation with moderation-pending messaging — never any moderation internals (queue
  position, moderator identity). **Grounding caveat (adversarial-review finding, §10):** the
  frozen BC-TRUST-5 contract set has **no author-scoped read** — `get_review`/`list_reviews`
  are public, `published`-only, authorization-none. There is therefore **no frozen way for an
  author to re-fetch their review's later moderation status** (moved to approved/published/
  rejected). The UI must not imply a "my reviews" tracker backed by a contract that does not
  exist; if the product wants authors to track moderation status, that is a genuine gap —
  see §9(e), not something to build against.
- **Error surface:** honors the frozen error boundary — an engagement outside the caller's
  org surfaces as **not found** (never "not authorized," which would confirm the engagement
  exists); `rating` out of 1–5 and non-post-award are inline validation messages.
- **Composition:** kit `card`, `RatingStars` (input mode), `textarea` (native — no kit
  primitive exists), `button`, `status-chip` (frozen statuses only), `EmptyState`.
- **Conformance:** binds `trust.submit_review.v1` request/response by pointer ·
  `can_submit_review` (O,D,M) is the only gate surfaced · no coined field, no draft state,
  no local persistence (§8 Phase-P guardrails).

### Surface 2 — Public reviews display (Lane PUB)

- **Purpose:** render `published` reviews on the **vendor public microsite** (P-PUB-13,
  Doc-7D) — the corpus already binds this view (Doc-7D Pass2 Patch: public published-reviews
  view over `get_review`/`list_reviews`, published-only).
- **Placement:** a **section + anchor** within the owner-ruled one-page microsite HYBRID IA
  (a new section, not a new sub-route) — flagged as design decision §9(c) because the
  microsite section set was owner-adjudicated before reviews existed as a section.
- **Data path:** strictly the Marketplace public projection (DP-R3). Fields rendered are
  exactly the frozen public read shape: `rating`, `body`, published timestamp — plus the
  vendor context already on the page. **No author identity is rendered unless the frozen
  public read shape carries it — it does not; the public response shape is `rating`, `body`,
  `vendor_profile_id`, published timestamp only.**
- **No derived statistics (DP-R1):** no average, no count-as-score, no distribution bars,
  no "% recommend." A plain chronological list of individual published reviews. The section
  header may state the plain count of listed reviews **only if** adjudicated as
  non-derived presentation (§9(a) covers this question; until ruled, no count renders).
- **Ordering (presentation-owned):** the corpus freezes no sort — `list_reviews` delegates
  to Doc-4A §9.6 allowlisted filter+sort fields. This package sets **newest-published-first**
  as the presentation default and labels it presentation (DP-R2); any wire-level sort field
  used must be allowlisted per Doc-4A §9.6.
- **Empty state:** honest — "No published reviews yet." Never fabricated placeholders
  (the microsite's existing honest-placeholder discipline).
- **Composition:** microsite section shell (existing pattern in
  `app/(public)/_components/microsite/`), `ReviewCard` (§5), `RatingStars` (display mode),
  pagination per `trust.list_page_size_max` semantics (pointer).
- **Card layout — APPROVED (owner visual approval, 2026-07-08): Option A — spacious
  "testimonial" card.** Two layouts were prototyped (`prototypes/review-system/`, Surface 2
  Option A vs Option B); the owner selected **Option A**: a neutral verified-engagement
  medallion + stars + "Verified engagement" on one row, monospace published date, prominent
  body. The medallion is a **neutral provenance marker, never author identity** (no author
  field exists in the frozen public read shape). *Load more* pagination only — no total count
  rendered (the listing-count question stays open, §9(a)).
- **Conformance:** published-only · projection-only · zero workspace imports (public
  surface discipline) · no derived statistic · no moderation metadata rendered
  (`moderated_by`/`moderated_at` are not public fields).

### Surface 3 — Moderation queue + case detail (Lane PUB, staff)

- **Purpose:** the staff leg of J-REV — moderate (`approve`/`reject`), publish, remove.
- **Placement — two options, presented strictly neutrally; this package makes NO
  recommendation and implies no implementation preference; placement is a Board decision
  (§9(d)):**
  - **Option A:** new dedicated admin pages (queue + case detail) for review moderation.
  - **Option B:** a face/filter of the existing generic moderation pages (P-ADM-02 queue ·
    P-ADM-03 case detail).
  Either option reuses the shared `AdminQueueTable`
  (`app/(app)/_components/admin/admin-queue-table.tsx`, already 7+ consumers) — the table
  decides nothing; row actions route to the case detail where commands act.
- **Case detail actions (frozen contracts only):**
  - **Moderate** — `trust.moderate_review.v1`: decision `approve`/`reject`;
    **`moderation_note` is required on reject** (frozen BUSINESS rule); source state
    `submitted` only — the UI offers moderation only on `submitted` rows.
  - **Publish** — `trust.publish_review.v1`: from `approved` only. The UI communicates the
    frozen two-step semantics honestly: publish succeeds atomically with its audit; the
    Buyer-Feedback input ingestion is a separate retryable step — a transient ingestion
    failure renders as "published; input ingestion retrying," never as a failed publish.
  - **Remove** — `trust.remove_review.v1`: hidden soft-delete; the UI presents removal as
    hiding, never erasing (Invariant #8).
- **Concurrency:** all three mutations carry `expected_revision`; a lost race surfaces as a
  "review changed — reload" conflict pattern, distinct from an illegal-state error.
- **Authority display:** actions gate on the staff family (`staff_can_verify` /
  `staff_super_admin` per role seed — pointer); a future dedicated moderation slug is
  carried `[ESC-TRUST-SLUG]`, not invented.
- **Composition:** `AdminQueueTable` consumer + case-detail layout per the existing
  moderation case pattern; `status-chip` frozen tokens; `RatingStars` display mode;
  moderation-note field required-on-reject.
- **Conformance:** no coined queue states (queue rows are just reviews in `submitted`;
  publishable rows are reviews in `approved`) · no bulk-moderation invention · reads of
  non-published reviews here are staff-context only, never routed to public components.

### Surface 4 — Private CRM ratings activation (Lane CRM)

- **Purpose:** specify the activation of the **already-built, parked** Ratings card in the
  buyer CRM record detail (`app/(app)/(buyer)/crm/[recordId]/crm-detail-view.tsx`,
  Ratings card, currently disabled pending `ops.set_private_vendor_rating.v1`).
- **Spec:** enable the "Add rating" affordance as a presentation-only interaction (mock
  adapter; §8 Phase-P guardrails — no mock persistence): `score` (numeric) + `comment`,
  per the frozen Doc-4F §F4.4 request shape; gate rendered on `can_manage_private_vendors`.
  The `[ESC-OPS-POLICY]` score-bound marker stays open — the input renders without a
  numeric-bound claim until that resolves.
- **Non-disclosure (verbatim, binding):** Lane CRM ratings are **never exported, never
  searchable outside the owning tenant, never shown outside the tenant** — and never feed
  any score (DG-4). No vendor-facing surface, public surface, or staff tenant-view renders
  them.
- **Composition:** existing card + `EmptyState`; numeric score input follows the frozen
  field shape (it is a private score, not a Lane-PUB 1–5 star rating — do not reuse
  `RatingStars` semantics unless the resolved `[ESC-OPS-POLICY]` bound matches; until then
  a plain numeric input per the existing view-model).
- **Conformance:** BC-OPS-1 pointer-bound · buyer-private only · zero linkage to Lane PUB
  or Lane ADM · wiring stays Wave-5 (§8).

### Surface 5 — Admin ratings staff surface (Lane ADM)

- **Purpose:** the staff-only set/list instrument for internal vendor ratings.
- **Semantics:** `trust.set_admin_rating.v1` is an **upsert** (create/update + soft delete;
  simple lifecycle, no multi-state machine); `rated_by` is server-set staff attribution;
  reads via `trust.list_admin_ratings.v1` (`staff_can_verify`).
- **Visibility clarification (binding):** on this surface, **"display" means staff-internal
  rendering only** — it never implies public or tenant visibility. Admin ratings are
  internal-only, never tenant-visible, never public, never exposed externally; non-staff
  access collapses to `NOT_FOUND`, and no non-staff surface may even reveal that an admin
  rating exists.
- **Audit note:** admin-rating set is not separately enumerated in Doc-2 §9 — carried
  `[ESC-TRUST-AUDIT]` (interim: nearest §9 action by pointer; no action invented). The
  build annex (§8) inherits this marker.
- **Placement:** a staff surface in the admin area (illustrative page proposal §7);
  composition per the admin detail patterns; `status-chip` not used for lifecycle (simple
  lifecycle — no states to chip).
- **Conformance:** separate instrument from public reviews, never merged (H.9a) ·
  internal signal only, mutates no score (H.9b) · staff-only reads/writes.

---

## 5. Kit / Component Plan

**Proposed additive kit components (presentation-only; naming follows kit conventions;
additions land via the kit owner, never by side-building):**

- **`RatingStars`** — governed 1–5 star component with `input` and `display` modes;
  display mode renders a frozen `rating` value of an individual review only (DP-R1: never
  an aggregate). Keyboard/a11y complete in input mode.
- **`ReviewCard`** — one published review: `RatingStars` (display) + `body` + published
  timestamp. No author identity (not in the public read shape), no moderation metadata,
  no derived statistics.

**Reused as-is:** `card`, `badge`, `status-chip` (tokens = the five frozen review statuses
only — `submitted / approved / published / rejected / removed`; coin no chip), `EmptyState`,
`AdminQueueTable` (Surface 3), `skeleton` (loading), `tabs`/section shells per surface
context. Native `<textarea>` remains exempt-native (no kit primitive exists).

**Display-discipline precedent:** the governed score-display family
(`app/(app)/_components/vendor/trust/`, esp. `types.ts`) is the pattern for any
review-adjacent governed display — expose exactly what the frozen read shape carries,
never fabricate (e.g., absence renders as "Not rated," never as 0).

---

## 6. Non-Disclosure Playbook (what each viewer class can ever see)

| Viewer class | Lane PUB | Lane ADM | Lane CRM |
|---|---|---|---|
| Anonymous / public | `published` reviews only (rating, body, published timestamp) via projection | **nothing — existence itself protected** | **nothing** |
| Buyer org (author) | own review's status **only from the one-time submit response** (no frozen author-scoped re-read exists — §9(e)); other orgs' reviews only when `published` | nothing | own org's ratings only |
| Vendor (subject) | `published` reviews about them (same public shape) | **nothing — never learns one exists** | **nothing — never learns one exists** |
| Platform staff | full lifecycle (queue, moderation, notes) | full (set/list) | **nothing tenant-scoped surfaced by default** — CRM is tenant-owned data (support access is a platform-policy matter outside this package) |

**Collapse rules presentation must never undermine (Doc-4G §H.4/§7.5):**

- Submitting against an engagement outside the caller's org → renders as **not found**,
  never as "no permission."
- A non-published review on a public read → **not found**; public components never receive
  non-published rows to "hide" client-side — they are never fetched.
- Any non-staff touch of an admin rating → **not found**; no UI hints (badges, counts,
  tooltips) that imply an admin rating exists.
- No surface reveals score formulas, weights, percentiles, ranking effects, or moderation
  queue internals (DP-R6).

---

## 7. Page-ID + WBS Impact Proposal

> **Non-authority banner (binding):** *The identifiers in this section are illustrative
> planning proposals. They reserve nothing. Only the Board may mint page IDs, update the
> page universe, or mint FE-\* milestones.* (Page universe = 151 per
> `scripts/verify-fe-wbs-coverage.mjs`; new FE-\* IDs are Board-only per
> `project-management/fe-program-wbs.md`.)

| Proposed surface | Illustrative placement | Universe impact |
|---|---|---|
| Surface 1 — buyer review submission | a face of the existing engagement detail surface (Doc-7F) **or** a new `P-BUY-*` page — the CS precedent (WP-1 "second face, no new page ID") suggests a face may suffice | 0 or +1 BUY |
| Surface 2 — public reviews section | a section + anchor of existing P-PUB-13 (vendor public microsite) — likely **no new page ID** | 0 |
| Surface 3 — moderation queue + case | Option A: +2 `P-ADM-*` (queue, case) · Option B: 0 (face of P-ADM-02/03) — **Board decision, §9(d)** | 0 or +2 ADM |
| Surface 5 — admin ratings staff surface | +1 `P-ADM-*` (or a face of an existing vendor-admin detail) | 0 or +1 ADM |
| Surface 4 — CRM ratings | existing CRM record detail (built) — no new page | 0 |

**Candidate FE-\* milestones (Board mint required), per the owner's Buyer → Vendor → RFQ →
Admin implementation order:** buyer authoring (Team-2 / FE-BUY track) · public display
(Team-1 / FE-PUB track) · staff legs (Admin dev ownership currently **UNASSIGNED** —
flagged for the Board alongside the placement decision).

---

## 8. Phased Build Annex (wave-gated; informative only — authorizes nothing)

| Phase | Wave gate | Scope |
|---|---|---|
| **P — presentation-only FE** | Now, only after this package + Board mints (§7) are approved | Surfaces 1–5 with mock adapters |
| **W3 — M5 backend** | Wave 3 (`Build_Roadmap_v1.0.md` §4) | `trust.public_reviews` + `trust.admin_ratings` tables; the seven BC-TRUST-5 contracts; two-step publish → BC-TRUST-3 ingestion (Path B); every write copies the D7 audited-write pattern (`REFERENCE_Audited_Write_Pattern_v1.0.md`); audit actions bound: "review submit" · "moderation decision" · "publish" · "remove" (Doc-2 §9 Reviews) + `[ESC-TRUST-AUDIT]` for admin-rating set |
| **W5 — staff + CRM wiring** | Wave 5 | M8 moderation actor surface wiring (Admin invokes the Trust-owned contracts — M8 owns no review record); M4 `ops.set_private_vendor_rating.v1` wiring un-parks Surface 4 |

**Phase-P guardrails (binding):** *no mock persistence · no fake moderation flows · no
simulated publish/state transitions · no new workflow states — presentation only,
static/mock adapter only.* Prototype behavior must never emulate the business state
machine; a mock adapter returns fixed frozen-shape data, it does not transition.

Current wave = **Wave 2 (M0 → M1)**; Wave-2 "Blocked work" explicitly blocks all Wave-3+
module work, and the roadmap's Definition of Ready requires dependencies gated green —
nothing in this package changes that.

---

## 9. Open Questions & Escalations (esc_registry.md stays authoritative; all OPEN, none resolved here)

**Carried corpus markers (bound, not re-explained):**

| Marker | Where it binds in this package |
|---|---|
| `[ESC-TRUST-SLUG]` | Surfaces 3 & 5 — staff family (`staff_can_verify`/`staff_super_admin`) is today's authority; a dedicated moderation/admin-rating slug is future-additive |
| `[ESC-TRUST-AUDIT]` | Surface 5 / §8 W3 — admin-rating set has no separately-enumerated Doc-2 §9 action |
| `[ESC-OPS-POLICY]` | Surface 4 — private-rating score bound unregistered |
| `[ESC-TRUST-POLICY]` | historical note only — the trust wire keys were registered by Doc-3 Policy Patch v1.3 (Doc-5G records the marker as resolved at wire level); cited for traceability, nothing carried forward |

**Design decisions surfaced by this package (candidates for adjudication; no ESC row is
minted by this package — each mints only if adjudicated a genuine gap through its channel):**

- **(a) Aggregate-rating authorization.** Interim-prohibited by DP-R1 (binding). Any future
  aggregate/average/count display requires corpus guidance via the Board channel. Includes
  the narrow sub-question of whether a plain listed-review count is "derived."
- **(b) Vendor reply to reviews.** Absent from the corpus (no contract exists — absence,
  not prohibition). Pure product decision; this package specs no reply surface.
- **(c) Microsite placement.** The reviews section extends the owner-ruled one-page
  microsite HYBRID IA (section + anchor). Owner sign-off requested as part of this
  package's approval.
- **(d) Moderation queue placement.** Option A (new pages) vs Option B (face of
  P-ADM-02/03) — presented without recommendation (§4 Surface 3); **Board decision**,
  together with Admin dev-ownership assignment.
- **(e) Author read of own review status (genuine gap — adversarial-review finding).**
  The frozen BC-TRUST-5 contract set provides **no author-scoped read**: an author org can
  see its review's status only via the one-time `submit_review` response; the public reads
  are `published`-only. If the product wants authors to track their review through
  moderation (pending → approved/rejected/published), that read capability **does not exist**
  and would be an additive contract — a Doc-4G/Doc-5G additive-patch question for the API
  Governance Board, **not** a coinable UI. Interim: Surface 1 shows the one-time submit
  confirmation only. No ESC minted here; adjudicate whether this is a real product need
  first (Validate-Findings gate).

---

## 10. Disposition Log (fixed schema)

| Finding | Severity | Decision | Resolution | Owner | Status |
|---|---|---|---|---|---|
| Pre-R1 MAJOR-01 aggregate display undefined → freeze needed | MAJOR | VALID | DP-R1 binding statement; §9(a) | owner → package | FOLDED |
| Pre-R1 MAJOR-02 projection boundary wording | MAJOR | VALID | DP-R3 binding statement; §2 rule 2 | owner → package | FOLDED |
| Pre-R1 MAJOR-03 page-ID non-authority banner | MAJOR | VALID | §7 banner | owner → package | FOLDED |
| Pre-R1 MAJOR-04 moderation-queue neutrality | MAJOR | VALID | Surface 3 + §9(d): no recommendation, Board decides | owner → package | FOLDED |
| Pre-R1 MAJOR-05 Phase-P guardrails | MAJOR | VALID | §8 binding guardrails | owner → package | FOLDED |
| Pre-R1 MINOR-01…09 (Content≠Presentation independence; lane labels textual; journey pointer-only; one-review view-only UX; ordering rule; ADM display≠visibility; CRM non-disclosure triplet; wave table; fixed log schema) | MINOR ×9 | VALID | folded at DP-R2, §2, §3, Surface 1/2/5, §8, §10 | owner → package | FOLDED |
| Pre-R1 NIT-01…04 + Pre-R2 NIT-01…04 (canonical phrasing; "surface specifications"; naming style; timeline; heading rename; microsite naming; grouped steps; section order) | NIT ×8 | VALID | folded throughout | owner → package | FOLDED |
| Pre-R2 MINOR-01 package success criteria | MINOR | VALID | plan-level acceptance criteria (mirrored in Appendix A) | owner → package | FOLDED |
| Pre-R2 MINOR-02 surface summary table | MINOR | VALID | §4 opening table | owner → package | FOLDED |
| AR-01 §6 matrix + Surface 1 imply an author read of own review's *current* moderation status, but BC-TRUST-5 has no author-scoped read (`get_review`/`list_reviews` are public/`published`-only/authz-none); submit response returns `status=submitted` only | MAJOR | VALID (verified against Doc-4G Part5 §G8.1/§G8.5) | Surface 1 "After submit" + §6 matrix row tightened to the one-time submit-response confirmation; genuine gap surfaced as §9(e) (additive-contract question, no coin) | Review pass → author | FOLDED |
| AR — Doc-4M-not-review-authority claim (§0.3 note) | OBS | CONFIRMED | verified: Doc-4M_FROZEN_v1.0.md carries no Public Review machine — note stands | Review pass | NO CHANGE |
| AR — lifecycle string, two-step publish (F4G-PB5-MA2), remove-source-state, `list_reviews` sort-allowlisting, staff-slug, page IDs (P-PUB-13/P-ADM-02/03), universe=151 | OBS | CONFIRMED | all verified verbatim against frozen sources; no defect | Review pass | NO CHANGE |
| Prototype (all 5 surfaces) — mockup-first Visual Approval gate | — | **APPROVED** | Owner visual approval **2026-07-08** (`prototypes/review-system/`); UX/visual direction confirmed. Design sign-off only — authorizes NO build (backend wave-gated; FE page-IDs Board-only) | owner | APPROVED |
| Surface 2 card layout — Option A (testimonial) vs Option B (compact feed) | — | **RESOLVED** | Owner selected **Option A — testimonial**; folded into the Surface 2 spec. (Distinct from the still-open §9(d) moderation-queue placement A/B.) | owner | CLOSED |
| Next gate — FE page-ID + milestone mints | — | IN PROGRESS | Board packet drafted at `governanceReviews/BOARD-PACKET-REVIEW-SYSTEM-FE-MINTS_v1.0.md` (requests the mints; carries the open §9(c)/(d) + Admin-ownership decisions) | package → Board | OPEN (human Board) |

---

## Appendix A — Conformance Verification Log

Package acceptance criteria (all must check green before the package is presented for
owner/Board disposition):

- [x] All five surfaces specified (§4).
- [x] All three lanes firewalled with never-cross rules stated per lane (§2).
- [x] Every authority pointer resolves (pointer audit — results below).
- [x] No new business rule, contract, slug, state, enum, or derived value introduced.
- [x] No implementation artifacts (code, pages, schema, migrations) authored.

**Pointer-audit results (2026-07-08): ALL GREEN.** Programmatic grep of every cited anchor
against the repository: 19/19 cited files exist (frozen docs, journeys, repo assets,
registries); 10/10 contract slugs verified frozen (`trust.submit_review.v1` ·
`moderate_review` · `publish_review` · `remove_review` · `set_admin_rating` · `get_review` ·
`list_reviews` · `list_admin_ratings` · `ingest_performance_input` ·
`ops.set_private_vendor_rating.v1`) — and a reverse scan of this package confirms it cites
**only** those ten (zero coined slugs); 4/4 permission slugs, the five-token status enum,
4/4 carried `[ESC-…]` markers, 2/2 POLICY keys, F4G-PB5-MA2/F4G-M2/F4G-M3 + DG-2/4/7
anchors, both Doc-2 §9 review audit actions, J-REV-01…05/J-PSC/J-ADM-01 and
P-PUB-13/P-ADM-02/P-ADM-03 IDs, the Doc-7D Pass2 Patch `list_reviews` binding, and the
151-page universe (`verify-fe-wbs-coverage.mjs`) all verified.
