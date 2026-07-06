# Journeys — Admin Operations (M8)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File H — Admin Operations
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M8 Admin Operations (`admin` · Doc-4J — also the **authoritative event
catalog**)
**Journeys:** J-MOD · J-BAN · J-VQ · J-CATA · J-IMP · J-CMPL
**Legend/notation:** atlas §2 · **Actor journey composed:** `J-ADM` §7 (marketplace_ux.md — the
staff click-path over these lifecycles)

> **Authority stance.** Non-authoritative companion. States/enums resolve to **Doc-4J** and
> **Doc-2 §3**; the single governing pattern for every journey here is **"Admin decides, the
> owning module owns"** — M8 writes **no** owning-module authoritative table; every effect
> executes via the owning module's contract or event. Admin acts **ON targets by ID, never AS an
> organization** (no active-org). `(VendorBanned)` is the **sole** Admin §8 event. Admin never
> writes Trust/Performance/Tier scores, never makes matching/award decisions, never bypasses a
> module's domain (Red-Flag list). On any conflict the frozen corpus wins and this file is
> patched.

---

## H1. Moderation Case Lifecycle — `J-MOD`

**Breadcrumb:** Atlas ▸ Admin ▸ Moderation Case Lifecycle

| Ownership | |
|---|---|
| Owner Module | M8 Admin (BC-ADM moderation cases) |
| Participating Modules | target-owning modules execute effects (M2 content, M3 RFQs) |
| Authoritative Documents | Doc-4J (moderation cases — decisions `[approved]/[rejected]/[escalated]`); Doc-2 §5.4 (`moderate_rfq` leg) |
| Read-only References | Doc-7H (moderation console) |

**Actors:** Primary — staff User. ⚙ System — queue signals (reports, thresholds).

**Intent arc:** Signal → Review → Decision → Effect.
**Goal:** demand- and supply-side quality gates — cases decided in M8, effects executed by
owners.

**Entry:** a signal lands (user report, System flag, staff initiative) → case created.
**Exit:** case decided `[approved]`/`[rejected]` — or `[escalated]` upward.

```
signal → create case → assign → review → decide → [approved] / [rejected] / [escalated]
                                    └ effect executes in the owning module (by contract/event)
```

| ID | Step | Key actions (pattern · contract) | Decision (Doc-4J) | Outcome / governance |
|---|---|---|---|---|
| J-MOD-01 | Create | `create_moderation_case` | — | Target referenced **by ID** |
| J-MOD-02 | Assign | `assign_moderation_case` | — | Staff workload routing |
| J-MOD-03 | Review | case work (evidence, target read via services) | — | Reads via owning-module services only |
| J-MOD-04 | Decide | `decide_moderation_case` | `[approved]` / `[rejected]` / `[escalated]` | Decision recorded in M8 |
| J-MOD-05 | Effect | owning module executes (e.g. content takedown via M2 contracts; RFQ leg = `moderate_rfq`, RFQ `[submitted] → [under_review] → [matching]` or `→ [draft]`) | — | **M8 never writes the owning table** |

**Governance rails:** RFQ moderation is the demand-side gate inside the frozen RFQ machine
(`J-PROC-05`); escalation goes up the §7 authority order, never sideways into a bypass.
**Success:** ✔ decision + rationale recorded; ✔ effect attributable to an owning-module
instrument; ✔ escalations traceable.

**Related:** RFQ leg feeds J-MATCH entry · content targets J-PRD/J-SITE/J-PORT/J-REV (via
`trust.moderate_review.v1`) · complaint intake J-CMPL · composed by `J-ADM-01`.

---

## H2. Ban Lifecycle — `J-BAN`

**Breadcrumb:** Atlas ▸ Admin ▸ Ban Lifecycle

| Ownership | |
|---|---|
| Owner Module | M8 Admin (BC-ADM-2 Enforcement — the ban record) |
| Participating Modules | M2 Marketplace (executes profile effect from `(VendorBanned)`, seam M6-4) |
| Authoritative Documents | Doc-4J (ban lifecycle `[active] → [lifted] / [expired]`; `issue_ban`/`lift_ban`/`expire_ban`; emits `(VendorBanned)` — the sole Admin §8 event) |
| Read-only References | Doc-7H (enforcement console) |

**Actors:** Primary — staff User (enforcement authority). ⚙ System — `expire_ban` archival (from
`[lifted]` only).

**Intent arc:** Violation → Enforcement → Restoration → Archive.
**Goal:** platform-level enforcement whose effect is executed by the owning module, never by an
admin table-write.

**Entry:** an adjudicated violation (J-MOD/J-CMPL/J-FRD disposition).
**Exit:** ban `[lifted]` (profile restored via M2), later archived `[expired]`.

```
issue_ban → ban [active] + (VendorBanned) → M2: profile [active] → [banned] (public banner)
ban [active] → lift_ban → [lifted] → M2: [banned] → [active]
ban [lifted] → ⚙ expire_ban → [expired]   (archival of a lifted ban — expiry never ends a live ban)
```

| ID | Step | Key actions (pattern · contract) | Ban state (Doc-4J) | Outcome / governance |
|---|---|---|---|---|
| J-BAN-01 | Issue | `issue_ban` | `[active]` | Emits `(VendorBanned)` → seam M6-4; **M8 decides, M2 executes** the profile transition |
| J-BAN-02 | Effect | M2 consumer | — | Vendor profile `[active] → [banned]` (public banner; Doc-2 §5.3); excluded from routing/search |
| J-BAN-03 | Lift | `lift_ban` | `[active] → [lifted]` | M2 restores `[banned] → [active]` — restoration is the **lift** reflection |
| J-BAN-04 | Archive | ⚙ `expire_ban` (`expected_state = lifted`) | `[lifted] → [expired]` | **Expiry only from `[lifted]`** (Doc-4J: linear `active → lifted → expired`; expire-from-active is a forbidden-source STATE error) |

**Governance rails:** the ban record and the profile status are **two records in two modules** —
never conflated; ban rationale is staff-internal (non-disclosure beyond the public banner);
banned orgs keep the Basic-entitlement carve-out semantics of A-11 (J-SUB-05) by pointer.
**Success:** ✔ every profile `[banned]` traceable to a ban record + event; ✔ restoration
symmetric; ✔ zero direct M2 writes from M8.

**Related:** upstream dispositions J-MOD/J-CMPL/J-FRD · effect in J-CLM-06 · composed by
`J-ADM-04`.

---

## H3. Verification Queue Journey — `J-VQ`

**Breadcrumb:** Atlas ▸ Admin ▸ Verification Queue Journey

| Ownership | |
|---|---|
| Owner Module | M8 Admin (BC-ADM-5 `verification_tasks` — the queue) |
| Participating Modules | M5 Trust (owns the verification record + decision storage, seam M6-5) |
| Authoritative Documents | Doc-4J (verification tasks); Doc-2 §5.6 (the record machine it drives) |
| Read-only References | Doc-7H (verification workbench) |

**Actors:** Primary — staff User (reviewer).

**Intent arc:** Queue → Scrutiny → Decision → Handback.
**Goal:** the staff operational leg of J-VER — **M8 queues and decides; M5 owns**.

**Entry:** verification record `[requested]` (J-VER-01) surfaces as a task.
**Exit:** task decided; record transitioned by M5 (`[approved]`/`[rejected]`).

```
record [requested] → queue_verification_task → assign → review evidence →
decide_verification_task → M5: trust.decide_verification.v1 → [approved]/[rejected]
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-VQ-01 | Queue | `queue_verification_task` | Task references the Trust record by ID |
| J-VQ-02 | Assign | `assign_verification_task` (drives `trust.assign_verification.v1` → record `[in_review]`) | Workload routing |
| J-VQ-03 | Review | evidence scrutiny; correction loop → record `[in_review] → [requested]` | Requests more info via the record's own edge |
| J-VQ-04 | Decide | `decide_verification_task` → `trust.decide_verification.v1` | **Decision stored in Trust** (`verification_decisions`); *Admin decides, Trust owns* (seam M6-5) |
| J-VQ-05 | Handback | approval reflects via seam M6-8 (claim `[verified]`) | M8 touches neither the Trust record nor the M2 claim directly |

**Governance rails:** staff never edit scores or records — only decisions flow; reviewer identity
is never disclosed to the vendor (J-VER rails); queue metrics are ops-internal.
**Success:** ✔ every decision lands in Trust storage; ✔ zero M8 writes to `trust.*` aggregates;
✔ correction loops ride the record's frozen edges.

**Related:** operational leg of J-VER (and J-TIER for tier-type tasks) · composed by `J-ADM-02`.

---

## H4. Category Management Journey — `J-CATA`

**Breadcrumb:** Atlas ▸ Admin ▸ Category Management Journey

| Ownership | |
|---|---|
| Owner Module | M8 Admin (category catalog governance) |
| Participating Modules | M2 (assignments live there, → J-CAT; discovery facets read the catalog) |
| Authoritative Documents | Doc-4J (category management); Doc-2 §3 (categories) |
| Read-only References | Taxonomy Content v1.0 (productSpec; 794-node tree, Board-amended) — seed source |

**Actors:** Primary — staff User (taxonomy governor).

**Intent arc:** Structure → Curation → Evolution.
**Goal:** govern the taxonomy the marketplace hangs on — vendors assign into it (J-CAT), never
define it.

**Entry:** taxonomy need (seed import, proposal from J-CAT-02, gap analysis).
**Exit:** catalog updated; discovery facets and assignment targets refreshed.

```
create/update category → set_category_status → catalog live → assignments follow (J-CAT) → periodic curation
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-CATA-01 | Author | `create_category` / `update_category` | Tree edits are additive/curated — never silent deletion of in-use nodes |
| J-CATA-02 | Status | `set_category_status` | Activation gates what J-CAT-02 can target |
| J-CATA-03 | Adjudicate proposals | review vendor proposals (`[proposed]` assignments) | Approval flips assignment `[proposed] → [active]` in M2 by contract |
| J-CATA-04 | Curate | merges/renames per taxonomy governance | Mapping continuity preserved (751-row verified mapping discipline) |

**Governance rails:** taxonomy is Content; menus/facets are Presentation (Invariant #9 — the
MEGA_MENU package overlays, never redefines); category structure never encodes capability —
the 4-flag matrix stays authoritative for matching (Invariant #1).
**Success:** ✔ catalog changes audited; ✔ assignments never orphaned silently; ✔ presentation
overlays untouched by catalog edits.

**Related:** vendor-side J-CAT · discovery `J-GST-02/03` · composed by `J-ADM-03`.

---

## H5. Import Job Journey — `J-IMP`

**Breadcrumb:** Atlas ▸ Admin ▸ Import Job Journey

| Ownership | |
|---|---|
| Owner Module | M8 Admin (import jobs) |
| Participating Modules | M2 (seeded vendor records land via event/service — e.g. `vendor_claim_records` `source excel/admin`) |
| Authoritative Documents | Doc-4J (import jobs; processing = ⚙ System out-of-wire); Doc-2 §3 (`vendor_claim_records`) |
| Read-only References | Doc-7H (import console) |

**Actors:** Primary — staff User (submits). ⚙ System — processing worker.

**Intent arc:** Bulk → Validate → Land → Reconcile.
**Goal:** bulk supply-side seeding (the classic Excel vendor book) — async, validated, and
landed via owning-module paths.

**Entry:** a prepared import file; staff authority.
**Exit:** job completed with a reconciliation report; seeded records live (→ J-CLM-01).

```
submit_import_job → ⚙ out-of-wire processing (validate → stage → land via M2 event/service) → report → seeded records → J-CLM
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-IMP-01 | Submit | `submit_import_job` (async) | Job record created; staff attribution |
| J-IMP-02 | Process | ⚙ System worker (validation, dedup, staging) | Out-of-wire — no synchronous writes (`J-ADM-05`) |
| J-IMP-03 | Land | rows land through M2 event/service (**never direct table writes**) | Seeded profiles get `[seeded]` claim state + `vendor_claim_records` provenance |
| J-IMP-04 | Reconcile | job report (accepted/rejected rows) | Rejects actionable, never silently dropped |

**Governance rails:** import provenance (`source excel/admin`) is permanent; imported records are
claims-in-waiting — trust and verification standing start at zero (J-VER earns it); job state
detail resolves to Doc-4J (states not enumerated here — **do not coin**).
**Success:** ✔ every row accounted; ✔ landing via owning module; ✔ provenance preserved into
J-CLM.

**Related:** downstream J-CLM-01 (seeded → invited) · composed by `J-ADM-05`.

---

## H6. Complaint & Fraud Investigation Journey — `J-CMPL`

**Breadcrumb:** Atlas ▸ Admin ▸ Complaint & Fraud Investigation Journey

| Ownership | |
|---|---|
| Owner Module | M8 Admin (intake + investigation ops) |
| Participating Modules | M5 Trust (owns fraud signals, → J-FRD); M6 (support intake channel, → J-TKT); enforcement via J-BAN |
| Authoritative Documents | Doc-4J (staff triage, BC-ADM-3); Doc-4G BC-TRUST-4 (signal ownership) |
| Read-only References | Doc-7H |

**Actors:** Primary — staff User (investigator). Supporting — complainant (via support/report
channels).

**Intent arc:** Complaint → Triage → Investigation → Disposition.
**Goal:** the staff ops leg wrapping J-FRD — complaints become signals; signals become governed
consequences.

**Entry:** a complaint (support ticket J-TKT, report, or internal detection).
**Exit:** disposition — signal actioned/dismissed (J-FRD), possibly enforcement (J-BAN) or
moderation (J-MOD).

```
intake (ticket/report) → triage (BC-ADM-3) → open/attach fraud signal (J-FRD) → investigate →
disposition: action (→ J-BAN / J-VER-07 / J-MOD) | dismiss
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-CMPL-01 | Intake | complaint arrives (J-TKT escalation, report) | Recorded with target by ID |
| J-CMPL-02 | Triage | staff triage (BC-ADM-3 suggestion/link triage patterns) | **Non-disclosure** — staff-internal (`J-ADM-07`) |
| J-CMPL-03 | Signal | `trust.create_fraud_signal.v1` / attach to existing (J-FRD-01) | Signal owned by M5 from birth |
| J-CMPL-04 | Investigate | evidence via owning-module services (engagement chain J-DOC, records) | Reads only; full-chain evidence discipline (J-DSP-02) |
| J-CMPL-05 | Disposition | J-FRD-03/04 (action/dismiss) → consequences via J-BAN / J-VER-07 / J-MOD | Consequence always a governed instrument; complainant informed via J-NTF/J-TKT without disclosure of internals |

**Governance rails:** investigations never surface to the accused or the market (byte-equivalence
+ "never fraud" display rule); complainants get outcomes, not case files; **no admin "lead
distribution" or analogous ungoverned instrument exists in Doc-4J** (see ledger below).
**Success:** ✔ every complaint dispositioned; ✔ signal custody with M5; ✔ consequences
attributable and governed.

**Related:** intake J-TKT · signal custody J-FRD · consequences J-BAN, J-VER-07, J-MOD ·
composed by `J-ADM-01/07`.

---

## Not Covered (File H ledger)

| Item | Why | Pointer |
|---|---|---|
| Admin Lead Distribution | **Not ratified** — Doc-4J has no lead entity/function; leads are created only by seam M6-2 (`(VendorInvited)` at `[delivered]`) | **ESC-JRN-LEAD-DIST** (atlas §8) |
| Plan / identity ops legs (`activate_plan`, `suspend/reinstate_organization\|user`) | Narrated where they land: J-SUB (plans), J-SUC-03 (org status) — the staff click-path is `J-ADM-06` | Files A/G |
| Analytics review | Read-only dashboards (PostHog + console reads) — no lifecycle, nothing to govern beyond display rules | Doc-7H |
| Content-moderation detail per content type | Case pattern (J-MOD) + owning-module effect covers all types; per-type procedure is ops documentation, not journey architecture | Doc-4J |
| Routing-rule governance detail | `manage_routing_rule`/`assist_routing` narrated in J-MATCH-06 (Stage-gated) | Doc-4E Part3 |
| Import job state enumeration | Owned by Doc-4J; not restated to avoid coinage | Doc-4J |

*Cross-links:* actor journey [`../marketplace_ux.md`](../marketplace_ux.md) §7 (`J-ADM`) ·
registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-H.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*
