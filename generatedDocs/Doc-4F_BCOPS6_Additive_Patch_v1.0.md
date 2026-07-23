# Doc-4F Additive Patch v1.0 (PATCH-4F-BCOPS6-01) — BC-OPS-6 Vendor Buyer Relationships

> **Reconcile note (2026-07-23).** Carried from `fe/account-referral-nav` to `main` in the D2-08
> forward-PR. Its authority patch (Vendor Buyer Relationship) is **Doc-2 v1.0.10** on main
> (renumbered from branch v1.0.9 per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md`;
> main's v1.0.9 is the Communication Audit patch). Every `Doc-2 v1.0.10` reference below is that
> renumber; PATCH-D2-08 and this patch's own `PATCH-4F-BCOPS6-01` id are unchanged.

> **FOLDED — the authoritative additive overlay establishing BC-OPS-6** (owner/Board APPROVED
> FOR FOLD 2026-07-19, after the full review chain below; §13 gate at fold: BLOCKER 0 ·
> MAJOR 0 · MINOR 0). Registered in `generatedDocs/00_AUTHORITY_MAP.md`.
> **Review chain:** Team-4 Review-A (RA-01 BLOCKER · RA-02..05 MAJOR · RA-06..11 MINOR ·
> RA-12 NIT) → all dispositions Board-ratified (RA-01 = Option (a); RA-04 = Option (i),
> carried as `ESC-IDN-ORG-DISPLAY-LABEL`; RA-11 = normative-completeness condition) → v1.1
> corrections → same-agent focused verification (RA-01→12 ALL CLOSED; NF-01..05 raised →
> applied in v1.2) → Doc-4E dependency FOLDED as
> `generatedDocs/Doc-4E_VendorInvited_Payload_Additive_Patch_v1.0.md` (PATCH-4E-VIP-01) →
> owner 7-point pointer re-verification PASS (0·0·0). Authoring record:
> `governanceReviews/Doc-4F_BCOPS6_BuyerRelationships_Additive_Patch_PROPOSAL.md` (v1.2).
> **Dependency posture (Board-ruled, retained):** `ESC-IDN-ORG-DISPLAY-LABEL` = OPEN — gates
> buyer-name resolution and server-side name search ONLY; does not block aggregate, contract,
> stage, provenance, activity, summary, UUID-based list, or system-consumer implementation.
>
> **Grade (RA-11 condition, Board-worded):** an **additive patch-grade contract overlay**
> inheriting the frozen §H conventions by pointer — not a standalone Part. It is nonetheless
> **normatively complete**: every contract-specific difference involving authorization, state,
> errors, idempotency, audit, pagination, projection fields, and event payloads is settled in
> this patch. Implementation may elaborate mechanics but may not decide missing behavior;
> "hardening at realization" is never permission to invent semantics during coding.

| Field | Value |
|---|---|
| **Patches** | Doc-4F (Business Operations Engine) — additive overlay on the FROZEN set: `Doc-4F_Structure_v1.0_FROZEN.md` (**§F1/§F3/§F4/§F5/§F6/§F8/§F9/§F10/§F15** additive rows — NF-02: the full amendment surface) + a new contract section (**§F16 — BC-OPS-6**). No frozen base file edited; no existing BC/contract/aggregate changed. |
| **Class** | **New bounded context + contract set — additive.** BC-OPS-6 (contexts 5→**6**) owning the Doc-2 v1.0.10 Vendor Buyer Relationship aggregate (M4 aggregates 7→**8**); 9 contracts (3 commands · 3 queries · 3 System consumers). No new event, no new slug, no new POLICY key, no new audit action (all bound to Doc-2 v1.0.10 / Doc-3 registrations by pointer). |
| **Domain authority** | **Doc-2 v1.0.10** (`generatedDocs/Doc-2_Patch_v1.0.10_VendorBuyerRelationship.md`, PATCH-D2-08, FOLDED 2026-07-19) — the aggregate, tables, stage set, provenance model, slug, audit rows, and consumer declarations this patch realizes. Per Doc-4A §20.1/§20.2 the domain change preceded this contract patch. |
| **Authorized by** | Owner rulings 2026-07-19: G1 (structural amendment: BC-OPS-6, 7→8) · G2 (tier mapping Option A) · train order (T3 after T1 fold; T2 resolved-by-confirmation Option A). Trail: `governanceReviews/VendorBuyerRelationship_Domain_Patch_Train_PROPOSAL_v1.0.md` (v1.2) |
| **Conforms To** | Architecture v1.0 FINAL, ADR Compendium v1, **Doc-2 v1.0.10**, Doc-3 v1.0.2 (+ POLICY registration patches v1.0–v1.11), Doc-4A v1.0, Doc-4B/4C/4D/4E v1.0, Doc-4F Structure + Pass-A + Pass-B Parts 1–5 (all FROZEN) |
| **Status** | **PROPOSED — human/Board approval required to fold** |

---

## Part I — Structure overlay (additive rows on `Doc-4F_Structure_v1.0_FROZEN.md`)

**S-1 · §F3 (Bounded Context Landscape, after the BC-OPS-5 bullet :53) — append:**

```
- **BC-OPS-6 — Vendor Buyer Relationships** (Vendor Buyer Relationship aggregate): the
  vendor-side private buyer-axis CRM — one relationship record per known buyer organization,
  with server-authored provenance history and a vendor-managed stage — tenant-owned (vendor's
  controlling org), never buyer-visible. *(Buyer-axis complement of BC-OPS-3's
  transaction-axis Vendor Lead; sibling aggregates, no FK — Doc-2 v1.0.10.)*
```

**S-2 · §F5 (Aggregate Inventory, after the Finance Record bullet :83) — append:**

```
- **Vendor Buyer Relationship** — root `vendor_buyer_relationships`; children
  `vendor_buyer_relationship_provenance` (append-only), `vendor_buyer_relationship_activities`
  (append-only); VO RelationshipStage/ProvenanceTier → **BC-OPS-6**. (Doc-2 v1.0.10)
```

**S-3 · §F10 (Event Consumption Map) — append three consumer declarations:**

```
- **`VendorInvited`** — (additionally to the two consumers at :144) a THIRD independent,
  idempotent consumer: **BC-OPS-6** upserts the buyer relationship (create-or-raise provenance
  to `rfq_participation`; dedup on invitation_id). RFQ owns the event; Operations owns the
  relationship effect.
- **`RFQClosedWon`** — (additionally to BC-OPS-2 at :143) a second independent, idempotent
  consumer: **BC-OPS-6** raises relationship provenance to `engagement`.
- **`EngagementCompleted`** — (produced by BC-OPS-2, §F11 :154; consumed by Trust) —
  additionally consumed **in-module** by **BC-OPS-6** to raise provenance to
  `awarded_customer`. Single-authorship holds: Operations owns both the event and this
  consuming effect on its own entity; the consumer is independent of Trust's and idempotent.
```

**S-4 · §F15 (Structure Summary :193) — counts amended:** "5 bounded contexts … 7 aggregates"
reads, per this patch, "**6** bounded contexts (… · BC-OPS-6 Vendor Buyer Relationships) owning
"**8** aggregates (Doc-2 v1.0.10)". No other §F15 sentence changes.

**S-5 · §F1/§F4/§F5-purpose/§F6 (RA-02) — consistency rows:**
- §F1 owned-aggregates list (:30): append "**Vendor Buyer Relationship**" to the enumeration.
- §F4 context responsibilities (after :67): append — "**BC-OPS-6 Vendor Buyer Relationships** —
  *purpose:* the vendor's private buyer-axis relationship record (provenance evidence +
  vendor-managed stage); *ownership:* `vendor_buyer_relationships`
  (+`vendor_buyer_relationship_provenance`, `vendor_buyer_relationship_activities`);
  *services:* relationship management, audited stage changes, activity logging, provenance
  seeding (event consumers), own-facts summary; *dependencies:* Identity (org context,
  `buyer_organization_id` reference — DF-1), RFQ (consumes `VendorInvited`/`RFQClosedWon` —
  DF-3), in-module BC-OPS-2 (`EngagementCompleted`)."
- §F5 purpose sentence (:75): "the seven Module-4 aggregates" reads, per this patch, "the
  **eight** Module-4 aggregates (Doc-2 v1.0.10)".
- §F6 domain-service inventory (:92): append "vendor buyer-relationship service (BC-OPS-6 —
  relationship/stage/activity management + provenance seeding + own-facts summary)".

**S-6 · §F8 (Ownership Matrix, RA-02) — append to the owned ledger (:119) and tenancy list (:121):**

```
- Owned: `vendor_buyer_relationships` (+`vendor_buyer_relationship_provenance`,
  `vendor_buyer_relationship_activities`) → BC-OPS-6 (Doc-2 v1.0.10 §2/§3.5/§10.5).
- Tenancy class: tenant-owned (vendor controlling org), NEVER buyer-visible; never feeds
  routing/matching/scores (Doc-2 v1.0.10 §10.5 rule 6); `buyer_organization_id` referenced by
  bare UUID only.
```

**S-7 · §F9 (Context Interaction Map, RA-02/RA-08) — append:**

```
- Internal: BC-OPS-6 consumes the in-module `EngagementCompleted` event (BC-OPS-2 emitter,
  §F11) for provenance seeding; the BC-OPS-6 summary read performs DECLARED in-module
  aggregate reads (own-org COUNTs) over sibling-context rows — own `vendor_leads` (BC-OPS-3)
  and own vendor-party `engagements` (BC-OPS-2) — read-only, same schema, no ownership
  crossing, no mutation path. Additionally (NF-01): the BC-OPS-6 completion consumer performs
  a DECLARED read of the own-module `engagements` row's party columns
  (`buyer_organization_id`, `vendor_controlling_org_id`) to resolve the relationship pair —
  read-only, same schema, §F16.6 binding 3.
- Entry points (module boundary in), additional: `VendorInvited` (RFQ → BC-OPS-6 provenance
  upsert — third independent consumer), `RFQClosedWon` (RFQ → BC-OPS-6 provenance upsert —
  second independent consumer).
```

---

## Part II — §F16 BC-OPS-6 contract set (additive patch-grade overlay — Grade block governs)

**Frozen scope (mirrors the Part-3 pattern).** BC-OPS-6 owns the **Vendor Buyer Relationship**
aggregate only (`vendor_buyer_relationships` + two append-only children — Doc-2 v1.0.10). It
**emits zero domain events** and consumes `VendorInvited`, `RFQClosedWon`,
`EngagementCompleted` (System actor; idempotent; own-effect-only). The sole slug is
**`can_manage_buyer_relationships`** (Doc-2 v1.0.10 §7). Audit binds the **Doc-2 v1.0.10 §9
"Vendor Buyer Relationships" domain row** (enumerated — unlike BC-OPS-3's `[ESC-OPS-AUDIT]`
era); wire serialization tokens are the train's **T5** patch (never invented in code). POLICY
binds the **registered** `operations.idempotency_dedup_window` and
`operations.list_page_size_max` (Doc-3 patch v1.4; per T2 Option A this patch carries the note
extending v1.4's illustrative list-read enumeration to include `list_buyer_relationships`).
It owns **no** RFQ/quotation/matching/routing/award (DF-3), **no** vendor/marketplace data
(DF-2), **no** score (DF-4), and is **never buyer-visible** (Doc-2 v1.0.10 §10.5 firewall rule).

### §H6 — Part-6 hardening conventions

**H6.0 — Inheritance.** H.1 (nine-stage validation), H.2 (type vocabulary), and H.4 (error
model, `ops_*` codes, REFERENCE≠DEPENDENCY, NOT_FOUND collapse) of
`Doc-4F_PassB_Part3_BC-OPS-3_FROZEN.md` §H apply verbatim by pointer. The Part-3 12-section
record grammar applies **where instantiated** — per the Grade block, this overlay compresses
records without losing normative completeness (NF-04). Deltas below.

- **H6.3 — Authorization.** Three-layer check per Part-3 H.3; scope = the **vendor controlling
  organization** (`controlling_organization_id`) of the target row; delegation §6B eligible.
  Sole slug **`can_manage_buyer_relationships`** (O,D,M,F — Doc-2 v1.0.10 §7); reads bind the
  same slug (no separate read slug; the BC-OPS-3 :26 pattern).
- **H6.5 — State & derived value.** `stage ∈ {new, developing, active, dormant, archived}`;
  transitions **any governed stage → any governed stage**, vendor-managed, every change
  audited, **no automatic or mandatory progression** (Doc-2 v1.0.10 §3.5). `customer`, `won`,
  `qualified`, `rfq_participant` are forbidden values (absent from the enum by construction).
  **`effective_provenance` is a derived monotone value, NOT a state machine** — max over the
  provenance history; never decays; recomputed on observation append only. Concurrency on
  stage: optimistic `expected_stage`; lost race → `CONFLICT`.
- **H6.6 — Audit.** Every mutation binds the Doc-2 v1.0.10 §9 Vendor-Buyer-Relationships row —
  relationship created (user | system), provenance recorded (server-authored), stage changed,
  activity logged; attribution per that row (System for event consumers; User attribution for
  manual creation); same-transaction via Doc-4B `core.append_audit_record.v1`. Serialization
  tokens = **T5** (carried; no token invented here). Reads not audited.
- **H6.7 — Events.** BC-OPS-6 **emits none**. Consumes the three §F10 (S-3) events —
  own-effect-only, independent of every co-consumer, idempotent per H6.8.
- **H6.8 — Idempotency & provenance identity.** Mutations: `Idempotency: required`, window =
  `operations.idempotency_dedup_window` (registered). System consumers: inherently idempotent —
  dedup on event identity **plus** the Doc-2 v1.0.10 **provenance-observation identity**
  *(relationship, source, authoritative source reference)*: repeated processing of the same
  authoritative fact appends **no** duplicate observation, recomputes nothing, audits nothing.
  Duplicate manual create of the same UNIQUE pair → **idempotent return of the existing
  record** (no new provenance row, no duplicate audit; never `CONFLICT` — the P-03/§14.6
  no-op convention).
- **H6.9 — Tenancy, non-disclosure & provenance-write authority.** Tenant-owned by the vendor
  controlling org; RLS-scoped; non-owned reference → `NOT_FOUND` collapse. `buyer_organization_id`
  is a **bare UUID** (DF-1; never a window into Identity data; display-name resolution is a
  presentation concern via owning-module reads). **Never buyer-visible; never feeds
  routing/matching/scores** (Doc-2 v1.0.10 §10.5 rule 6). **Provenance-write authority (v1.0.10
  §10.5 rule 1):** no contract in this Part accepts a provenance value as input — manual-create
  writes `manual_or_imported` server-side; the 21.5 consumers write the verified tiers; the
  `conversation` tier is **structurally unreachable** until the train's T4b consumer exists.
- **H6.10 — Field source (Doc-2 v1.0.10 §10.5).** All schemas bind the three patched tables'
  columns; **no domain column introduced**. The projected activity `created_at` (NF-05) is the
  server-assigned standard row timestamp per platform convention — not a coined domain field;
  its wire/DDL shape is pinned at the T5/Doc-6 realization.

### §F16.1 — `ops.create_buyer_relationship.v1` — Manual relationship creation (21.4 Command)

- **Request:** `buyer_organization_id : uuid : required : the buyer org this vendor records
  (bare UUID, DF-1)`.
- **Response:** `buyer_relationship_id : uuid (1)` · `stage : enum<new|developing|active|dormant|archived> (1)`
  · `effective_provenance : enum<…five tiers…> (1)` · `reference_id : uuid (1)`.
- **Validation (H.1):** 1 SYNTAX presence/type → `VALIDATION` · 2 CONTEXT User + vendor
  controlling org → `AUTHORIZATION` · 3 AUTHZ `can_manage_buyer_relationships` →
  `AUTHORIZATION` · 4 SCOPE active org = row tenant (creation: the active org IS the tenant) ·
  5 DELEGATION §6B where representative · 6 STATE existing row for the UNIQUE pair →
  **idempotent no-op return of existing** (never an error) · 7 REFERENCE
  `buyer_organization_id` resolution — **failure collapses to `NOT_FOUND`** (RA-05, see
  Error Boundary below); Identity transiently unavailable → `DEPENDENCY`.
- **Server writes (never caller-supplied):** `stage = new` (v1.0.10 rule 4 — the flow never asks
  for a stage); **first creation only** appends one `manual_or_imported` provenance observation
  (H6.9); `effective_provenance` derived.
- **Audit:** relationship created (user — manual entry); User attribution; same tx.
- **Errors:** `VALIDATION` · `AUTHORIZATION` · `NOT_FOUND` (see boundary) · `DEPENDENCY`
  (Identity transient, retryable true) · `SYSTEM`.
- **Error Boundary (RA-05, Board-ruled 2026-07-19):** buyer-organization existence is treated
  as a **protected fact** for this audience (Doc-4A default: "if uncertain, treat as
  protected"). Resolution failure collapses to `NOT_FOUND`, and the contract does **not**
  distinguish: nonexistent buyer organization · inaccessible buyer organization · disallowed
  organization type · cross-tenant protected reference. The create surface is therefore not an
  org-existence oracle. `Timing-Uniformity`: the indistinguishable cases respond uniformly.
  `DEPENDENCY` remains distinct (transient infrastructure, no existence information).
- **Idempotency:** H6.8 — duplicate pair returns the existing record.

### §F16.2 — `ops.update_buyer_relationship_stage.v1` — Vendor-managed stage change (21.4 Command)

- **Request:** `buyer_relationship_id : uuid : required` · `expected_stage : enum<…5…> :
  required : optimistic-concurrency assertion` · `target_stage : enum<…5…> : required`.
- **Response:** `buyer_relationship_id : uuid (1)` · `stage : enum<…5…> (1)` ·
  `reference_id : uuid (1)`.
- **Validation:** 1 SYNTAX stages ∈ the five-value enum (forbidden values fail here by
  construction) → `VALIDATION` · 2–5 as H6.3 (scope fail → `NOT_FOUND` collapse) · 6 STATE:
  any→any is legal (H6.5), so the state check is record-exists + **concurrency sub-check**
  `expected_stage` = current → `CONFLICT` on mismatch · 7–9 none.
- **Same-stage rule (RA-06, Board-ruled 2026-07-19):** `target_stage == current_stage` (with a
  matching `expected_stage`) is a **successful idempotent no-op** — the current state returns,
  **no audit row** is written, and **no timestamp changes** solely because of the no-op.
  "Every change audited" (Doc-2 v1.0.10) is satisfied: a no-op is not a change.
- **UX note (non-normative here):** the wire contract is a single deterministic command; the
  explicit-confirmation step is presentation, owned by the design plan.
  **Stage never touches provenance** (H6.5).
- **Audit:** stage changed (real transitions only, per the same-stage rule); User attribution;
  old/new stage in the §9 mapping (tokens = T5).
- **Errors:** `VALIDATION` · `AUTHORIZATION` · `NOT_FOUND` (collapse) · `CONFLICT` (retryable
  true — re-read then retry) · `SYSTEM`.
- **Idempotency:** `Idempotency: required` + registered window; replayed applied transition
  returns the same stage, no duplicate audit.

### §F16.3 — `ops.add_buyer_relationship_activity.v1` — Log activity (21.4 Command)

Mirrors `ops.add_lead_activity.v1` (Part-3 §F6.3) with the Part-6 bindings: request
`buyer_relationship_id : uuid : required` + `activity_jsonb : jsonb : required` (`actor_user_id`
captured server-side); response `activity_id, buyer_relationship_id, reference_id`; append-only
child, no parent-stage restriction (an activity may be logged in any stage, `archived`
included); slug/scope/collapse per H6.3/H6.9; audit = activity logged; errors
`VALIDATION`/`AUTHORIZATION`/`NOT_FOUND`/`SYSTEM`; `Idempotency: required`.

### §F16.4 — `ops.get_buyer_relationship.v1` · `ops.list_buyer_relationships.v1` — Reads (21.3 Query)

- **`get` request:** `buyer_relationship_id : uuid (1, required)`.
  **Response:** `relationship : object{ buyer_relationship_id, buyer_organization_id, stage,
  effective_provenance, last_verified_interaction : object{ source, observed_at } }` ·
  `provenance : list<object{ source, source_reference_id, observed_at }>` (append-only
  history, read-only — D4) · `activities : list<object{ activity_id, activity_jsonb,
  actor_user_id, created_at }>` (RA-10: `created_at` server-assigned at append) ·
  `reference_id`.
- **`list` request:** `filter : object{ stage?, effective_provenance? } (0..1; allowlisted
  fields only, Doc-4A §9.6)` · `page_size : numeric (0..1)` bounded by
  **`operations.list_page_size_max`** (registered; T2 note: this read joins v1.4's
  illustrative enumeration) · `page_token : string (0..1)`.
  **Response:** `items : list<object{ buyer_relationship_id, buyer_organization_id, stage,
  effective_provenance, last_verified_interaction : object{ source, observed_at } }>` ·
  `next_page_token : string (0..1)` · **no totals** · `reference_id`.
- **Derived sort field (RA-03; Doc-4A §10.8 declared-derivation):**
  `last_verified_interaction` = the provenance observation with the greatest `observed_at`
  (in-aggregate derivation; **adapter/projection-supplied, never derived in the browser**).
- **Ordering (RA-03, Board-ruled):** default and sole v1 sort =
  `last_verified_interaction_at DESC, buyer_relationship_id DESC` — the identifier tiebreaker
  is **mandatory** for cursor stability (total order, Doc-4A §9.6). Naming equivalence
  (NF-03): `last_verified_interaction_at ≡ last_verified_interaction.observed_at`. The maximum
  is taken over **all** provenance observations — a `manual_or_imported` observation can be
  the latest interaction; the field name follows the design plan's ruled label and the
  derivation is deterministic as defined.
- **Archived default (RA-03):** rows with `stage = archived` are **excluded by default**;
  `filter.stage = archived` returns them (v1.0.10 reversibility). Deterministic in both
  directions.
- **Buyer display identity & name search (RA-04, Board-ruled Option (i) — CARRIED):** rows
  carry the bare `buyer_organization_id` only; readable buyer identity and server-side
  buyer-name search depend on the **Identity display-label seam carried as
  `ESC-IDN-ORG-DISPLAY-LABEL`** (vendor-safe bounded projection `{organization_id,
  display_name}`; exclusions per the registry row). **Before the seam exists:** rows render
  only governed available identity; buyer-name search is absent or honestly disabled — never
  simulated client-side. **After the seam folds:** `list_buyer_relationships` gains a governed
  name-search parameter executing server-side through the approved seam/projection; the
  frontend never fetches-all-and-filters. This is a **carried dependency, not a design
  downgrade** (Option (ii) rejected by the Board).
- **Authorization/scope:** H6.3; get on non-owned row → `NOT_FOUND` collapse; list RLS-scoped
  to own controlling org only. **Non-disclosure:** the surface exposes only the vendor's own
  records + own-participation facts; provenance rows reference source facts by bare UUID —
  never a window into RFQ/engagement/thread data (H6.9).
- **Errors:** `VALIDATION` (bad filter field / page_size bound, stage 9 POLICY) ·
  `AUTHORIZATION` · `NOT_FOUND` · `SYSTEM`. **Idempotency:** not-applicable (pure query).

### §F16.5 — `ops.get_buyer_relationship_summary.v1` — Own-facts KPI read (21.3 Query)

- **Request:** none beyond context.
- **Response:** `summary : object{ buyers : integer, awarded_customers : integer,
  rfqs_received : integer, engagements : integer }` · `reference_id`. The four design-plan KPI
  own-facts — adapter-supplied so the FE never client-computes (R7).
- **Pinned semantics (RA-07, Board-ruled 2026-07-19; window = LIFETIME unless stated,
  explicitly intentional):**
  - `buyers` = count of **non-archived** Vendor Buyer Relationship rows (own org).
  - `awarded_customers` = count of **non-archived** rows whose
    `effective_provenance = awarded_customer`.
  - `rfqs_received` = lifetime count of **distinct `rfq_id`** represented by the vendor org's
    own Vendor Lead facts (multi-profile controlling orgs never double-count an RFQ).
  - `engagements` = lifetime count of `engagements` rows where the vendor organization is an
    **authoritative party** (`vendor_controlling_org_id` = caller) — never the buyer-party
    match.
  - Historical variants (e.g. counting archived awarded customers) require a **separately
    named metric** in a future patch — the working-CRM summary stays non-archived-default.
- **Derivation (in-module only; the §F9 declared internal-read seam — S-7):** `buyers` +
  `awarded_customers` over own BC-OPS-6 rows; `rfqs_received` over the caller org's own
  `vendor_leads` (BC-OPS-3 rows, module-own, declared read); `engagements` over the caller
  org's own vendor-party rows (BC-OPS-2, module-own, declared read). **No cross-module read;
  counts are own-record positive facts only** — no exclusion universe is countable through
  this surface, and no other org's existence is inferable.
- **Authorization:** H6.3 (`can_manage_buyer_relationships`); own-org only.
- **Errors:** `AUTHORIZATION` · `SYSTEM`. **Idempotency:** not-applicable.

### §F16.6 — System consumers (21.5; `Response: none`) — the provenance seeding seam

Three contracts, one record (the Part-3 §F6.1 grammar; each: System actor, no tenant
slug/scope, own-effect-only, **create-or-raise** semantics):

| Contract | Consumes (producer) | Tier written | Dedup key |
|---|---|---|---|
| `ops.upsert_relationship_on_invitation.v1` | `VendorInvited` (RFQ; fires only at `delivered`) | `rfq_participation` | event identity + `invitation_id` |
| `ops.upsert_relationship_on_award.v1` | `RFQClosedWon` (RFQ) | `engagement` | event identity + `rfq_id` |
| `ops.upsert_relationship_on_completion.v1` | `EngagementCompleted` (BC-OPS-2, in-module) | `awarded_customer` | event identity + `engagement_id` |

**Per-event field bindings (RA-01/RA-09 — each consumer binds its own event's frozen
authority VERBATIM; no normalization assumed):**

1. **`ops.upsert_relationship_on_invitation.v1`** — fields per the **folded authoritative
   payload declaration `generatedDocs/Doc-4E_VendorInvited_Payload_Additive_Patch_v1.0.md`
   (PATCH-4E-VIP-01)**: `event_ref`, `invitation_id`, `rfq_id`, `vendor_profile_id`,
   `controlling_organization_id`, `buyer_organization_id` — all **`always`** (producer MUST
   populate; no absence path). The RA-01 dependency is **SATISFIED** (folded 2026-07-19); the
   consumer is implementable. No Identity/RFQ lookup fallback exists or is licensed (folded
   patch §2.3); a post-fold event missing the field is malformed → the governed DLQ posture
   (§16.6 shared record, SYNTAX stage).
2. **`ops.upsert_relationship_on_award.v1`** — fields per the frozen `RFQClosedWon` consumer
   authority (`Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md:53-55`): including
   `buyer_organization_id` and **`vendor_controlling_org_id`** (that event's verbatim field
   name — bound as-is, mapped to the row's `controlling_organization_id` server-side; the
   mapping is stated here, not invented at coding time).
3. **`ops.upsert_relationship_on_completion.v1`** — the thin `EngagementCompleted` payload
   carries the engagement reference (Part-2:133); the consumer resolves both parties
   **in-module from its own `operations.engagements` row** (`buyer_organization_id`,
   `vendor_controlling_org_id` — Doc-2 :780): a declared same-schema read, no cross-module
   fetch, no payload expansion.

**Shared record:** *Behavior* = resolve-or-create the relationship row for (controlling org,
buyer org) — creation enters at `stage = new`; append one provenance observation per the
**observation identity** (H6.8 — replays and co-delivered duplicates append nothing);
recompute `effective_provenance` = max (monotone — a weaker later event never downgrades,
v1.0.10). *Stage is never touched by a consumer* (H6.5). *Validation* = SYNTAX (malformed →
DLQ per outbox POLICY) · CONTEXT (System actor) · STATE (existing observation → idempotent
no-op) · REFERENCE/DEPENDENCY per H.4. *Audit* = relationship created (system) where a row is
created; provenance recorded (server-authored — System) on each appended observation; same tx.
*Errors* = `VALIDATION` · `REFERENCE` · `DEPENDENCY` · `SYSTEM` (no tenant caller — no
disclosure surface). **G2 Option A is normative here:** award evidences `engagement`;
completion evidences `awarded_customer`. **The `conversation` consumer is deliberately absent**
— authored only in the train's **T4b** follow-on after M6 mints
`commercial_conversation_started` (owner correction 2026-07-19).

---

## Appendix A — BC-OPS-6 Contract Register

| § | Contract-ID(s) | Template | Owned entity (Doc-2 v1.0.10) | Actor | Emits | Consumes | Audit (§9 v1.0.10) |
|---|---|---|---|---|---|---|---|
| §F16.1 | `ops.create_buyer_relationship.v1` | 21.4 | `vendor_buyer_relationships` (+1st provenance row) | User | none | none | relationship created (user) + provenance recorded |
| §F16.2 | `ops.update_buyer_relationship_stage.v1` | 21.4 | `vendor_buyer_relationships` | User | none | none | stage changed |
| §F16.3 | `ops.add_buyer_relationship_activity.v1` | 21.4 | `vendor_buyer_relationship_activities` | User | none | none | activity logged |
| §F16.4 | `ops.get_buyer_relationship.v1` · `ops.list_buyer_relationships.v1` | 21.3 | Vendor Buyer Relationship | User | none | none | none (read) |
| §F16.5 | `ops.get_buyer_relationship_summary.v1` | 21.3 | (own-facts read) | User | none | none | none (read) |
| §F16.6 | `ops.upsert_relationship_on_invitation.v1` · `…_on_award.v1` · `…_on_completion.v1` | 21.5 | `vendor_buyer_relationships` (+`_provenance`) | System | none | `VendorInvited` · `RFQClosedWon` · `EngagementCompleted` | relationship created (system) / provenance recorded |

**Part-6 invariants (held):** BC-OPS-6 owns exactly one aggregate; emits zero events; consumes
exactly three (all pre-existing — none coined); one slug (`can_manage_buyer_relationships`,
v1.0.10 — none invented); audit rows enumerated (v1.0.10 §9 — none invented; tokens = T5); both
POLICY keys pre-registered (none invented); **no contract accepts provenance as input**;
stage never touches provenance and vice versa; buyer-side undetectability (Inv #11 symmetric)
and the governance-signal firewall hold on every surface; Vendor Lead untouched — sibling, no
FK.

## Appendix B — Carried (not resolved here)

- **Doc-4E `VendorInvited` payload patch — ✅ SATISFIED (RA-01 Option (a))** — FOLDED
  2026-07-19 as `generatedDocs/Doc-4E_VendorInvited_Payload_Additive_Patch_v1.0.md`
  (PATCH-4E-VIP-01, Authority-Map-registered); no longer carried.
- **`ESC-IDN-ORG-DISPLAY-LABEL` (RA-04 Option (i)) — Identity lane, registry-registered** —
  the vendor-safe bounded org display projection `{organization_id, display_name}` (exclusion
  list per the registry row) that buyer display identity and governed server-side name search
  bind to. A carried dependency, not a design downgrade; the list contract's name-search
  parameter mounts only when it folds. Generalizes the pre-existing narrow instance
  `ESC-7G-ENG-02` (engagement-scope buyer-org display name).
- **T4b** — `ops.upsert_relationship_on_conversation.v1` + the §F10 consumer declaration:
  authored only after M6 mints `commercial_conversation_started` (Doc-4H/Doc-2 §8 lane).
- **T5** — audit-token serialization patch (D7 pattern; entity_type/action strings/old-new
  mapping for the v1.0.10 §9 row).
- **Import** — the governed-import command + its Doc-3 POLICY keys (registered with that
  contract patch per the v1.4 minimal-registration rule); design plan gate 6.
- **T2 note (Option A, owner 2026-07-19)** — recorded here as the carrier:
  `operations.list_page_size_max`'s illustrative enumeration in Doc-3 patch v1.4 extends to
  include `list_buyer_relationships`; no new key registered.

---

*Additive patch proposal; no frozen base file edited. Realizes Doc-2 v1.0.10 per Doc-4A
§20.1/§20.2 (domain first, contracts after). Folding requires explicit owner/Board approval;
review per §13 (Review-A architecture/governance lens recommended before fold).*
