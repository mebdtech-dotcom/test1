# Doc-6E — M3 RFQ Procurement Engine (`rfq`) Schema Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1 → effective v0.2** — Independent Hard Review applied (2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). For Structure Freeze Audit → FROZEN |
| Module | **M3 — RFQ Procurement Engine** (`rfq` schema) — **the moat**: the governed matching/routing engine + quotation. The **first dual-sided (buyer + vendor) grant-row RLS** module + the **first DB bite of the blacklist-undetectable non-disclosure invariant** (#11) |
| Realizes | **Doc-2 §10.4** — **12 tables / 5 aggregates** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4E (M3 contracts, consumed); Doc-3 v1.0.2 **+ v1.1 (`rfq.*` POLICY — registered, 14 keys)**; Doc-6B (`core` consumed); Doc-6C (`identity` by UUID); Doc-6D (`marketplace` by UUID + service); Doc-4L/4M (events/state) |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.1), Doc-4A v1.0, Doc-4E v1.0 (FROZEN), Doc-4L/4M, Doc-6A/6B/6C/6D v1.0 (FROZEN) |
| Contains | Structure only — section map, 12-table partition, ratified decisions (RQ-CR1–CR12), dual-sided grant-row RLS model, 2 state machines, non-disclosure realization, cross-module firewalls, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Invariant #4** (RFQ = state machine with a control plane: lifecycle/routing/throttling/sorting/scoring). **Invariant #11** (private exclusion stays private, forever — **blacklist undetectable**): `rfq_routing_log` stores **no** vendor-visible blacklist trace; `matching_results` holds **only** vendors that passed every gate. M3 **reads** `vendor_matching_attributes` (M2 derived) **via service**, owns the matching logic, **never** reads M4's blacklist table (served only via CRM service) |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.4 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed at structure freeze (RQ-CR-set)

- **RQ-CR1 — 12 tables / 5 groupings (Doc-2 §10.4), coin nothing.** Two true aggregate roots — RFQ (AR, +5 children: `rfq_versions`/`rfq_invitations`/`rfq_invitation_grantees`/`rfq_document_grants`/`rfq_routing_log`) and Quotation (AR, +2 children: `quotation_versions`/`quotation_visibility`) — plus `routing_rules` (platform config), `matching_results` (derived projection), `comparison_statements` (versioned buyer artifact). A 13th table is non-conformant. *(RQ-HR-3: "groupings" not "aggregates" — only RFQ + Quotation are ARs.)*
- **RQ-CR2 — Dual-sided grant-row RLS (Doc-2 §6/§10.11 #9) — the defining realization.** **RLS never depends on cross-schema ownership traversal.** Buyer side = `organization_id` tenant anchor (`rfqs`/`rfq_versions`/`comparison_statements`/`rfq_routing_log`). Vendor side = **materialized grant rows** written at delivery by the RFQ Service: `rfq_invitation_grantees` (`organization_id = active org` — the vendor-side anchor), `rfq_document_grants` (buyer-uploaded spec-doc access), `quotation_visibility` (buyer-side quotation read). Plus **explicit party columns** (`quotations.controlling_organization_id` = vendor-side anchor + quota attribution). No org-ID array (child-table pattern: auditability/revocation/queryability/RLS-friendliness — Doc-2 §10.4).
- **RQ-CR3 — Non-disclosure / blacklist-undetectable (Invariant #11; Doc-2 §10.11 #5) — first DB bite.** `matching_results` contains **only** vendors that passed **every** gate (blacklist, category, capability, work-nature, verification, tier) — **gate-excluded vendors are never written**. `rfq_routing_log` records `pipeline_counts_jsonb` (aggregate per-step in/out) but **never** a vendor-visible blacklist trace. A blacklisted vendor's RFQ-side responses/counts/logs are **byte-equivalent** to a non-matched vendor's (CHK-6-022 — **in-scope here**, unlike M2). The blacklist is **M4's** (`operations.buyer_vendor_statuses`); served to routing **only** via the CRM service; M3 never reads it, never persists its trace.
- **RQ-CR4 — RFQ state machine §5.4 (Invariant #4 — the control plane).** `state` enum + CHECK: `draft/pending_internal_approval/submitted/under_review/matching/vendors_notified/quotations_received/buyer_reviewing/shortlisted/closed_won/closed_lost/expired/cancelled`. Transitions service/event-driven; `expired` = System timer (validity window in `core.system_configuration`, Doc-3 v1.1); `closed_won` emits engagement-creation (M4) + performance-inputs (M5) via outbox (Doc-2 §8); `cancelled` audited-reason. `routing_mode` enum (`approved_only/approved_conditional/approved_open/open_market`).
- **RQ-CR5 — Quotation state machine §5.5 + one-active-per-vendor partial-unique (Doc-2 §10.11 #7).** `state` enum + CHECK: `draft/submitted/withdrawn/selected/not_selected/expired`. **`partial UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted') AND deleted_at IS NULL`** — one active quotation per vendor per RFQ (present before any quotation endpoint ships). Submission consumes Controlling-Org quota (M7, via service); a formal **decline** is an `rfq_invitations` state, **not** a quotation state.
- **RQ-CR6 — Version immutability (Doc-2 §10.11 #6).** `rfq_versions.is_immutable` set on first quotation against that version → **UPDATE rejected once set** (trigger). `quotation_versions` immutable (append-only revisions; `supersedes_version_no`). `comparison_statements` versioned (`version_no`, `matrix_jsonb`). New row per revision, never overwrite.
- **RQ-CR7 — The routing/matching engine (Invariant #4 control plane).** `routing_rules` (rule definitions; **parameters resolve from `core.system_configuration`** — Doc-3 v1.1, never literals; **platform-owned config — read = admin/System only, never buyer/vendor**, RQ-HR-5). `rfq_routing_log` (append-only; **buyer + compliance read only, never vendor**; `pipeline_counts_jsonb` per-step in/out; RLS anchors on the parent `rfqs.organization_id` OR admin). `matching_results` (**derived/regenerable per rfq_version**; `confidence_score`, `breakdown_jsonb` tier/capacity/performance/trust/geography, `formula_version`; **RLS read = buyer-of-parent-rfq OR compliance/admin, NEVER vendor** — it exposes the scored passed-gate competitor set; RQ-HR-1). M3 **reads `vendor_matching_attributes`** (M2 derived read-model) **via service** (DD-2), runs the gates + scoring, writes `matching_results`. M3 owns the matching logic; M2 owns the attributes.
- **RQ-CR8 — Cross-module bare-UUID; in-module binding FKs (Doc-2 §0.3).** Bare UUID, no cross-schema FK: `vendor_profile_id`/`category_id`/`spec_document_ids[]` (M2), `organization_id`/`creator_user_id`/`approver_user_id`/`submitting_user_id`/`controlling_organization_id`/grantee `organization_id` (M1). **In-module FKs:** children→`rfqs`; `rfq_invitation_grantees`→`rfq_invitations`; `rfq_document_grants`→`rfqs`+`rfq_invitations`; `matching_results`→`rfqs`; `quotations`→`rfqs`; **`quotation_versions.rfq_version_id`→`rfq_versions` (the binding in-module FK)**; `quotation_visibility`→`quotations`; `comparison_statements`→`rfqs`+`rfq_versions`.
- **RQ-CR9 — `human_ref` carriers + value/array contracts.** Two carriers via `core.allocate_human_ref`: `rfqs` (`RFQ-…`) + `quotations` (`QTN-…`). `work_nature[]` with **CHECK ⊆ {supply,service,fabricate,consult}** (matches the M2 capability matrix). `estimated_value NUMERIC NOT NULL` at submit + `currency DEFAULT 'BDT'` (R9 — multi-currency; the tier gate is undefined without it, A-05). `spec_document_ids uuid[]` (bare-UUID array → M2).
- **RQ-CR10 — POLICY: registered (Doc-3 v1.1); `[ESC-6-POLICY]` CLEARED.** 14 `rfq.*` keys (`idempotency_dedup_window`, `list_page_size_max`, `quote_window_min`/`_days`, `max_extensions`, `approval_*`, `decision/review_allowance_days`, `draft_dormancy_days`, `edit_clock_reset`, `geography_required`, `category_min_level`, `min_scope_chars`, `reissue_won_block_days`) — throttle/validity/routing windows read from `core.system_configuration`, never literals. No new patch.
- **RQ-CR11 — Grant refresh-on-revocation (Doc-2 §10.11 #9).** Delegation-grant revocation (M1 event) removes the representative's `rfq_invitation_grantees` + `rfq_document_grants` + `quotation_visibility` rows; **removals audited**. M3 consumes M1 delegation events (Doc-4L); the grant tables are the vendor-side RLS substrate, rebuilt on those events — never a cross-schema read.
- **RQ-CR12 — Indexing + carried DD.** Cursor-pagination sort-key indexes (Band H) for the Doc-5E lists; `matching_results` per-`rfq_version` index; partial indexes `WHERE deleted_at IS NULL`. Carried: DD-MKT (vendor/category/spec by UUID + matching read-model via service), DD-OPS (engagement on `closed_won`), DD-TRUST (performance inputs), DD-BILL (quota), **possible `[ESC-RFQ-AUDIT]`** (routing/award audit actions vs Doc-2 §9 — confirm at content).

## The `rfq` schema partition (the structural spine)

| Doc-2 §10.4 table | Aggregate | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `rfqs` | RFQ (AR) | buyer `organization_id`; shared post-distribution via grantees | YES (archive) | **§5.4** | §3.1 |
| `rfq_versions` | ↳ | inherits rfq grants | NO (immutable once quoted) | `is_immutable` | §3.1 |
| `rfq_invitations` | ↳ | buyer head row; vendor side via grantees | NO (state-tracked) | invitation state | §3.1 |
| `rfq_invitation_grantees` | ↳ | **vendor-side anchor** (`organization_id = active org`) | NO (revocation-removed, audited) | access_type | §3.1 |
| `rfq_document_grants` | ↳ | vendor-side anchor (buyer-uploaded docs) | NO (revocation/expiry-removed) | — | §3.1 |
| `rfq_routing_log` | ↳ | buyer + compliance only | NO (append-only) | — | §3.1 |
| `routing_rules` | Routing (config) | platform-owned | YES | — | §3.2 |
| `matching_results` | Matching (derived) | buyer-of-rfq + compliance read, **never vendor** (derived per rfq_version) | NO (regenerable) | — | §3.3 |
| `quotations` | Quotation (AR) | vendor `controlling_organization_id`; buyer via `quotation_visibility` | YES (draft discard) | **§5.5** | §3.4 |
| `quotation_versions` | ↳ | as quotation (`rfq_version_id` binding FK) | NO (immutable) | — | §3.4 |
| `quotation_visibility` | ↳ | grant row (buyer-side read) | NO | — | §3.4 |
| `comparison_statements` | Comparison | buyer `organization_id` | NO (versioned) | `version_no` | §3.5 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4E → Doc-6A → Doc-6B/6C/6D → **Doc-6E** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried gates: DD-MKT/OPS/TRUST/BILL, possible `[ESC-RFQ-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.1). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.4`; `Doc-4E §E0`.

## §1 — Scope & the `rfq` Table Partition
What Doc-6E governs (12 tables) / not (vendor attributes/matching inputs = M2; blacklist = M4; quota = M7; engagement/performance = M4/M5 — referenced by UUID/event/service, never realized). The control plane (Invariant #4); the non-disclosure invariant (#11) load-bearing. **Deps:** `Doc-2 §2/§10.4`; `Doc-4E §E2`; `Doc-6A §1`.

## §2 — Dual-Sided Grant-Row Tenancy & RLS Realization Model *(load-bearing — the moat's RLS)*
The first buyer+vendor two-sided record RLS: buyer `organization_id` anchor; vendor-side **materialized grantee/visibility rows** (`organization_id = active org`) + explicit party columns (`quotations.controlling_organization_id`); **never** cross-schema ownership traversal (Doc-2 §10.11 #9). Grant rows written at delivery by the RFQ Service; refresh-on-revocation (RQ-CR11). Compliance/admin read. **The grant path covers the RFQ *and its children* (RQ-HR-2):** an invited vendor reads `rfqs` + `rfq_versions` + the granted `spec_documents` via the `rfq_invitation_grantees` / `rfq_document_grants` rows on the parent RFQ (intra-schema `EXISTS`) — so `rfq`/`rfq_versions` read = buyer-org OR vendor-grantee OR admin; `quotations` read = vendor `controlling_organization_id` OR buyer via `quotation_visibility` OR admin. **The derived/log/config tables are buyer/compliance-only — never vendor** (`matching_results`/`rfq_routing_log`/`routing_rules`; RQ-HR-1/HR-5). **Non-disclosure (Invariant #11):** gate-excluded vendors never written to `matching_results`; no blacklist trace in `rfq_routing_log`; byte-equivalence (CHK-6-022, in-scope). RLS = backstop (Doc-6A §4.5); authz app-layer (Doc-4E). RLS tests = Doc-8. **Deps:** `Doc-2 §6/§10.4/§10.11`; `Doc-6A §4`; `Doc-4E`.

## §3 — Per-Aggregate Realization
§3.1 RFQ + 5 children (§5.4 state, control plane, human_ref RFQ-…, work_nature[] CHECK, estimated_value+currency, version immutability, grant rows, routing log) · §3.2 Routing (`routing_rules` config; params from `core.system_configuration`; admin/System-read) · §3.3 Matching (`matching_results` derived; reads M2 via service; gate-excluded never written; **buyer/compliance-read, never vendor**) · §3.4 Quotation + 2 children (§5.5 state, one-active partial-unique, human_ref QTN-…, `rfq_version_id` binding FK, quotation_visibility grants) · §3.5 Comparison (versioned). **Deps:** `Doc-2 §5.4/§5.5/§10.4`; `Doc-4E`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization (Doc-2 §5.4 · §5.5)
The 2 machines — RFQ §5.4 (13 states; control plane) + Quotation §5.5 (6 states); enum + CHECK; simple edges → service; timer edges (`expired` validity window) → System (Doc-3 v1.1 keys); cross-module effects (`closed_won`→engagement/performance, quota) → outbox/event consumers (DR-6-STATE); transitions → `core.outbox_events` in one txn (Doc-2 §8). **Deps:** `Doc-2 §5.4/§5.5/§8`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/TRUST/BILL)
Bare-UUID + service + event pattern: vendor attributes/matching inputs via M2 service (DD-2; M3 owns matching, M2 owns attributes); blacklist served **only** via M4 CRM service (never read/persisted — Invariant #11); engagement (M4) + performance inputs (M5) emitted on `closed_won`; quota (M7) via service. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8/§10.11`; `Doc-4E §E0`; `Doc-4L`; `Doc-6A §5.3/§5.5/§7`.

## §6 — Indexing & Performance
Cursor-pagination sort-key indexes (Band H) for Doc-5E lists; `matching_results` per-`rfq_version`; partial `WHERE deleted_at IS NULL`; the one-active-quotation partial-unique; page-size/throttle via `rfq.*` POLICY (Doc-3 v1.1), never literals. **Deps:** `Doc-5E`; `Doc-6A §10/§12`; `Doc-3 v1.1`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → rfqs → versions → invitations → grantees/doc-grants → routing_rules/routing_log → matching_results → quotations → quotation_versions/visibility → comparison → in-FKs → indexes → triggers → RLS); POLICY = Doc-3 v1.1 (CLEARED, 14 keys). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.1`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C dual-sided grant-row + **CHK-6-022 byte-equivalence in-scope**; Band D version immutability; Band E outbox; CHK-6-002 two human_refs); carried register (DD-MKT/OPS/TRUST/BILL, `[ESC-RFQ-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.4`.

## Appendix A — Doc-6E Conformance Attestation map (Doc-6A `CHK-6-001…093`)
Per-check PASS / N/A-with-reason (content pass). Highlights: **Band C PASS** (dual-sided grant-row RLS; **CHK-6-022 byte-equivalence IN-SCOPE** — blacklist undetectable; CHK-6-021 materialized grantee anchors + refresh-on-revocation) · Band D PASS (CHK-6-031 `rfq_versions.is_immutable` + `quotation_versions`; CHK-6-032 `matching_results` regenerable/`rfq_routing_log` append-only) · Band E PASS (CHK-6-040 transition+outbox; CHK-6-041 events Doc-2 §8/4L; `[ESC-RFQ-AUDIT]` possible at 043) · CHK-6-002 PASS (two human_refs) · CHK-6-005 PASS (one-active-quotation partial-unique) · CHK-6-050 PASS (`estimated_value`+currency). **Deps:** `Doc-6A Appendix A`; `Doc-5E`.

---

## Open Carried Items
| ID | Item | Doc-6E handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / 2 machines / Doc-5E persistable | by pointer / enum+CHECK+service/event / Band H | No |
| DD-MKT | vendor/category/spec by UUID; matching attributes via service | bare UUID + service (DD-2); M3 owns matching | No |
| DD-OPS / DD-TRUST / DD-BILL | engagement on `closed_won` / performance inputs / quota | emit/consume events; service; no authority | No |
| **Invariant #11 (non-disclosure)** | blacklist undetectable | gate-excluded never written; no routing-log trace; byte-equivalence | **Load-bearing (in-scope CHK-6-022)** |
| **`[ESC-RFQ-AUDIT]`** | routing/award audit actions vs Doc-2 §9 | bind nearest §9 by pointer; additive Doc-2 §9; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `rfq.*` keys | **CLEARED** — Doc-3 v1.1 (14 keys) | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5E gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`rfq` table · vendor attributes/matching-input calculation (M2 read-only via service) · blacklist authority/storage/trace (M4; **never read or persisted**) · quota/entitlement (M7) · engagement/performance (M4/M5; event consumers) · coining any element · a cross-schema FK · cross-schema RLS traversal · writing a gate-excluded vendor into `matching_results` · any vendor-visible blacklist trace · DDL/Prisma/migration bodies (content passes).

---

## Review Disposition (Independent Hard Review — Structure)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Field-traced to Doc-2 §10.4/§5.4/§5.5/§10.11. Verified CORRECT: 12-table set (no 13th; comparison/routing/matching all present), state sets §5.4 (13) / §5.5 (6) verbatim, one-active-quotation partial-unique (§10.11 #7), `is_immutable`-on-first-quotation (§10.11 #6), two `human_ref` carriers, `work_nature[]` ⊆ {supply,service,fabricate,consult}, `estimated_value`+currency (A-05), the materialized grant-row anchor pattern (§10.11 #9), the 14 `rfq.*` POLICY keys (Doc-3 v1.1 → `[ESC-6-POLICY]` CLEARED), the non-disclosure realization (gate-excluded never written; no routing-log blacklist trace), cross-module bare-UUID + in-module binding FKs, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **RQ-HR-1** `matching_results` RLS audience unspecified — risk of vendor-readable scored competitor set (the passed-gate vendor list + confidence scores) | MAJOR | **FIXED** — RQ-CR7/§3.3/partition: read = buyer-of-parent-rfq OR compliance/admin, **never vendor** (intra-schema `EXISTS rfqs`). |
| **RQ-HR-2** child read-path under the grant model left implicit ("inherits rfq grants") — invited vendors must read `rfq_versions` + granted `spec_documents` via the grant rows | MAJOR | **FIXED** — §2: grant path explicitly covers RFQ + children (`rfq`/`rfq_versions` read = buyer OR vendor-grantee OR admin; `quotations` = controlling-org OR `quotation_visibility` OR admin). |
| **RQ-HR-3** "5 aggregates" mislabels config/derived/versioned-artifact as ARs | MINOR | **FIXED** — RQ-CR1: "5 groupings" (2 ARs + config + derived + versioned artifact). |
| **RQ-HR-4** `closed_won`→engagement/performance + `VendorInvited`(at delivered) event slugs unbound | MINOR | **CONFIRMED content-bind** — §4/§5: bind to Doc-2 §8 / Doc-4L by pointer at content; none coined. |
| **RQ-HR-5** `routing_rules`/`rfq_routing_log` read audience not stated | NIT | **FIXED** — RQ-CR7: `routing_rules` admin/System-read; `rfq_routing_log` buyer+compliance, never vendor. |

**Net:** 2 MAJOR (matching-results vendor-leak, child grant-read path) + 2 MINOR (aggregate wording, event-slug binding) + 1 NIT fixed/confirmed. The vendor-leak finding is the load-bearing one — the moat's competitive intel must stay buyer-side. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6E Structure Proposal v0.1 (effective v0.2 — Independent Hard Review applied). For Independent Hard Review (field-trace every anchor to Doc-2 §10.4/§5.4/§5.5/§10.11) → Structure Freeze Audit → FROZEN. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6E realizes the 12 `rfq` tables verbatim from Doc-2 §10.4 against frozen Doc-6A; the moat — dual-sided buyer/vendor grant-row RLS + the blacklist-undetectable non-disclosure invariant's first DB bite; 2 state machines; reads vendor matching-attributes via service, owns the matching logic; coins nothing. Next: Independent Hard Review.*
