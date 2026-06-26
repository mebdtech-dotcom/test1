# Doc-6E — M3 RFQ Procurement Engine (`rfq`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `rfq` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6E_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 2 MAJOR + 2 MINOR + 1 NIT; history retained there). Certified by `Doc-6E_Structure_Freeze_Audit_v1.0.md` |
| Module | **M3 — RFQ Procurement Engine** (`rfq` schema). **The moat** — the governed matching/routing engine + quotation; the **first dual-sided (buyer + vendor) grant-row RLS** module + the **first DB bite of the blacklist-undetectable non-disclosure invariant** (#11) |
| Realizes | **Doc-2 §10.4** — **12 tables / 5 groupings** (2 ARs) as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4E (M3 contracts, consumed); Doc-3 v1.1 (`rfq.*` POLICY — registered, 14 keys); Doc-6B (`core` consumed); Doc-6C (`identity` by UUID); Doc-6D (`marketplace` by UUID + service); Doc-4L/4M (events/state) |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.1), Doc-4A v1.0, Doc-4E v1.0 (FROZEN), Doc-4L/4M v1.0, Doc-6A/6B/6C/6D v1.0 (FROZEN) |
| Contains | Structure only — section map, 12-table partition, ratified decisions (RQ-CR1–CR12), dual-sided grant-row RLS + non-disclosure model, 2 state machines, cross-module firewalls, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Invariant #4** (RFQ = state machine + control plane). **Invariant #11** (blacklist undetectable): `rfq_routing_log` no vendor-visible trace; `matching_results` only passed-every-gate vendors, **buyer-side-readable only**. M3 **reads `vendor_matching_attributes`** (M2) **via service**, owns the matching logic, **never** reads M4's blacklist (served via CRM service only). RLS = backstop (Doc-6A §4.5) |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.4 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions ratified at structure freeze (RQ-CR-set)

- **RQ-CR1 — 12 tables / 5 groupings (Doc-2 §10.4), coin nothing.** Two ARs — RFQ (+5 children: `rfq_versions`/`rfq_invitations`/`rfq_invitation_grantees`/`rfq_document_grants`/`rfq_routing_log`) and Quotation (+2: `quotation_versions`/`quotation_visibility`) — plus `routing_rules` (platform config), `matching_results` (derived), `comparison_statements` (versioned buyer artifact). A 13th table is non-conformant.
- **RQ-CR2 — Dual-sided grant-row RLS (Doc-2 §6/§10.11 #9) — the defining realization.** **RLS never depends on cross-schema ownership traversal.** Buyer side = `organization_id` tenant anchor (`rfqs`/`rfq_versions`/`comparison_statements`/`rfq_routing_log`). Vendor side = **materialized grant rows** written at delivery by the RFQ Service: `rfq_invitation_grantees` (`organization_id = active org`), `rfq_document_grants`, `quotation_visibility`; + explicit party columns (`quotations.controlling_organization_id`). **The grant path covers the RFQ + its children** — invited vendors read `rfqs`/`rfq_versions`/granted `spec_documents` via the grant rows (intra-schema `EXISTS`). Child-table pattern, not an org-ID array (auditability/revocation/queryability/RLS-friendliness — Doc-2 §10.4).
- **RQ-CR3 — Non-disclosure / blacklist-undetectable (Invariant #11; Doc-2 §10.11 #5) — first DB bite.** `matching_results` contains **only** vendors that passed **every** gate (blacklist/category/capability/work-nature/verification/tier) — **gate-excluded never written**; read = buyer/compliance only, **never vendor**. `rfq_routing_log` records aggregate `pipeline_counts_jsonb` only — **never** a vendor-visible blacklist trace. Byte-equivalence (CHK-6-022, **in-scope**). Blacklist is **M4's** (`operations.buyer_vendor_statuses`); served to routing **only** via CRM service; M3 never reads/persists it.
- **RQ-CR4 — RFQ state machine §5.4 (Invariant #4 control plane).** `state` enum + CHECK (13): `draft/pending_internal_approval/submitted/under_review/matching/vendors_notified/quotations_received/buyer_reviewing/shortlisted/closed_won/closed_lost/expired/cancelled`. Transitions service/event; `expired` = System timer (validity window in `core.system_configuration`, Doc-3 v1.1); `closed_won` emits engagement (M4) + performance inputs (M5) via outbox; `cancelled` audited-reason. `routing_mode` enum (`approved_only/approved_conditional/approved_open/open_market`).
- **RQ-CR5 — Quotation state machine §5.5 + one-active partial-unique (Doc-2 §10.11 #7).** `state` enum + CHECK (6): `draft/submitted/withdrawn/selected/not_selected/expired`. **`partial UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted') AND deleted_at IS NULL`**. Submission consumes Controlling-Org quota (M7, service); a **decline** is an `rfq_invitations` state, not a quotation state.
- **RQ-CR6 — Version immutability (Doc-2 §10.11 #6).** `rfq_versions.is_immutable` set on first quotation → UPDATE rejected once set (trigger). `quotation_versions` immutable (`supersedes_version_no`). `comparison_statements` versioned. New row per revision, never overwrite.
- **RQ-CR7 — The routing/matching engine (Invariant #4).** `routing_rules` (definitions; **params from `core.system_configuration`** — Doc-3 v1.1; platform config — **admin/System read only**). `rfq_routing_log` (append-only; **buyer + compliance read only, never vendor**; anchors on `rfqs.organization_id` OR admin). `matching_results` (**derived/regenerable per rfq_version**; `confidence_score`, `breakdown_jsonb`, `formula_version`; **read = buyer-of-rfq OR compliance/admin, NEVER vendor**). M3 reads `vendor_matching_attributes` (M2) **via service** (DD-2), runs gates + scoring, writes `matching_results`. M3 owns matching; M2 owns attributes.
- **RQ-CR8 — Cross-module bare-UUID; in-module binding FKs (Doc-2 §0.3).** Bare UUID, no cross-schema FK: `vendor_profile_id`/`category_id`/`spec_document_ids[]` (M2), `organization_id`/`creator_user_id`/`approver_user_id`/`submitting_user_id`/`controlling_organization_id`/grantee `organization_id` (M1). In-module FKs: children→`rfqs`; grantees→`rfq_invitations`; doc-grants→`rfqs`+`rfq_invitations`; `matching_results`→`rfqs`; `quotations`→`rfqs`; **`quotation_versions.rfq_version_id`→`rfq_versions` (binding)**; `quotation_visibility`→`quotations`; `comparison_statements`→`rfqs`+`rfq_versions`.
- **RQ-CR9 — `human_ref` carriers + value/array contracts.** `rfqs` (`RFQ-…`) + `quotations` (`QTN-…`) via `core.allocate_human_ref`. `work_nature[]` CHECK ⊆ {supply,service,fabricate,consult}. `estimated_value NUMERIC NOT NULL` at submit + `currency DEFAULT 'BDT'` (R9; A-05). `spec_document_ids uuid[]` (bare-UUID array → M2).
- **RQ-CR10 — POLICY: registered (Doc-3 v1.1); `[ESC-6-POLICY]` CLEARED.** 14 `rfq.*` keys (incl. `idempotency_dedup_window`, `list_page_size_max`, `quote_window_min`/`_days`, `max_extensions`, `approval_*`, allowance/dormancy days, `edit_clock_reset`, `geography_required`, `category_min_level`, `min_scope_chars`, `reissue_won_block_days`) — read from `core.system_configuration`, never literals. No new patch.
- **RQ-CR11 — Grant refresh-on-revocation (Doc-2 §10.11 #9).** Delegation-grant revocation (M1 event) removes the representative's grantee/doc-grant/visibility rows; **removals audited**. M3 consumes M1 delegation events (Doc-4L); the grant tables are the vendor-side RLS substrate, rebuilt on those events — never a cross-schema read.
- **RQ-CR12 — Indexing + carried DD.** Cursor-pagination sort-key indexes (Band H) for Doc-5E lists; `matching_results` per-`rfq_version`; partial `WHERE deleted_at IS NULL`. Carried: DD-MKT (vendor/category/spec by UUID + matching via service), DD-OPS (engagement on `closed_won`), DD-TRUST (performance inputs), DD-BILL (quota), **`[ESC-RFQ-AUDIT]`** (routing/award audit vs Doc-2 §9).

## The `rfq` schema partition (the structural spine)

| Doc-2 §10.4 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `rfqs` | RFQ (AR) | buyer `organization_id`; shared via grantees | YES (archive) | **§5.4** | §3.1 |
| `rfq_versions` | ↳ | buyer OR vendor-grantee OR admin (inherits grants) | NO (immutable once quoted) | `is_immutable` | §3.1 |
| `rfq_invitations` | ↳ | buyer head row; vendor via grantees | NO (state-tracked) | invitation state | §3.1 |
| `rfq_invitation_grantees` | ↳ | **vendor-side anchor** (`organization_id = active org`) | NO (revocation-removed, audited) | access_type | §3.1 |
| `rfq_document_grants` | ↳ | vendor-side anchor (buyer-uploaded docs) | NO (revocation/expiry-removed) | — | §3.1 |
| `rfq_routing_log` | ↳ | buyer + compliance only, **never vendor** | NO (append-only) | — | §3.1 |
| `routing_rules` | Routing (config) | platform; admin/System read | YES | — | §3.2 |
| `matching_results` | Matching (derived) | buyer-of-rfq + compliance, **never vendor** | NO (regenerable) | — | §3.3 |
| `quotations` | Quotation (AR) | vendor `controlling_organization_id`; buyer via `quotation_visibility` | YES (draft discard) | **§5.5** | §3.4 |
| `quotation_versions` | ↳ | as quotation (`rfq_version_id` binding FK) | NO (immutable) | — | §3.4 |
| `quotation_visibility` | ↳ | grant row (buyer-side read) | NO | — | §3.4 |
| `comparison_statements` | Comparison | buyer `organization_id` | NO (versioned) | `version_no` | §3.5 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4E → Doc-6A → Doc-6B/6C/6D → **Doc-6E** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-MKT/OPS/TRUST/BILL, `[ESC-RFQ-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.1). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.4`; `Doc-4E §E0`.

## §1 — Scope & the `rfq` Table Partition
Governs 12 tables / not (vendor attributes/matching inputs = M2; blacklist = M4; quota = M7; engagement/performance = M4/M5 — by UUID/event/service). Control plane (#4); non-disclosure (#11) load-bearing. **Deps:** `Doc-2 §2/§10.4`; `Doc-4E §E2`; `Doc-6A §1`.

## §2 — Dual-Sided Grant-Row Tenancy & RLS Realization Model *(load-bearing — the moat's RLS)*
Buyer `organization_id` anchor; vendor-side materialized grantee/visibility rows (`= active org`) + party columns; grant path covers RFQ + children; **never** cross-schema traversal (§10.11 #9); refresh-on-revocation (RQ-CR11). Derived/log/config = buyer/compliance/admin only, never vendor. Non-disclosure (#11): gate-excluded never written; no log trace; byte-equivalence (CHK-6-022, in-scope). RLS = backstop; authz app-layer (Doc-4E). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.4/§10.11`; `Doc-6A §4`; `Doc-4E`.

## §3 — Per-Aggregate Realization
§3.1 RFQ + 5 children · §3.2 Routing (config; admin/System) · §3.3 Matching (derived; reads M2 via service; gate-excluded never written; buyer/compliance read) · §3.4 Quotation + 2 children (§5.5; one-active partial-unique; `rfq_version_id` binding FK) · §3.5 Comparison (versioned). **Deps:** `Doc-2 §5.4/§5.5/§10.4`; `Doc-4E`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization (Doc-2 §5.4 · §5.5)
The 2 machines (RFQ 13-state control plane + Quotation 6-state); enum + CHECK; simple edges → service; timer (`expired`) → System (Doc-3 v1.1 keys); cross-module effects (`closed_won`→engagement/performance, quota) → outbox/event consumers (DR-6-STATE); transitions → `core.outbox_events` in one txn (Doc-2 §8). **Deps:** `Doc-2 §5.4/§5.5/§8`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/TRUST/BILL)
Bare-UUID + service + event: vendor attributes/matching inputs via M2 service (DD-2; M3 owns matching); blacklist via M4 CRM service only (never read/persisted — #11); engagement (M4) + performance (M5) on `closed_won`; quota (M7) via service. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8/§10.11`; `Doc-4E §E0`; `Doc-4L`; `Doc-6A §5.3/§5.5/§7`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5E lists; `matching_results` per-`rfq_version`; partial `WHERE deleted_at IS NULL`; the one-active-quotation partial-unique; page-size/throttle via `rfq.*` POLICY, never literals. **Deps:** `Doc-5E`; `Doc-6A §10/§12`; `Doc-3 v1.1`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → rfqs → versions → invitations → grantees/doc-grants → routing_rules/log → matching_results → quotations → quotation_versions/visibility → comparison → in-FKs → indexes → triggers → RLS); POLICY = Doc-3 v1.1 (CLEARED, 14 keys). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.1`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C dual-sided grant-row + CHK-6-022 byte-equivalence in-scope; Band D version immutability; Band E outbox; CHK-6-002 two human_refs); carried register (DD-MKT/OPS/TRUST/BILL, `[ESC-RFQ-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.4`.

## Appendix A — Doc-6E Conformance Attestation (Doc-6A `CHK-6-001…093`)
Per-check PASS / N/A-with-reason (content pass). Highlights: **Band C PASS** (dual-sided grant-row RLS; **CHK-6-022 byte-equivalence IN-SCOPE** — blacklist undetectable; CHK-6-021 materialized grantee anchors + refresh-on-revocation) · Band D PASS (CHK-6-031 `rfq_versions.is_immutable`/`quotation_versions`; CHK-6-032 `matching_results` regenerable/`rfq_routing_log` append-only) · Band E PASS (CHK-6-040 transition+outbox; CHK-6-041 events Doc-2 §8/4L; `[ESC-RFQ-AUDIT]` at 043) · CHK-6-002 PASS (two human_refs) · CHK-6-005 PASS (one-active-quotation partial-unique) · CHK-6-050 PASS (`estimated_value`+currency). **Deps:** `Doc-6A Appendix A`; `Doc-5E`.

---

## Open Carried Items
| ID | Item | Doc-6E handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / 2 machines / Doc-5E persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-OPS / DD-TRUST / DD-BILL | vendor/category/spec + matching via service / engagement / performance / quota | bare UUID + service + event; no authority | No |
| **Invariant #11 (non-disclosure)** | blacklist undetectable | gate-excluded never written; no log trace; byte-equivalence; matching buyer-side-only | **Load-bearing (in-scope CHK-6-022)** |
| **`[ESC-RFQ-AUDIT]`** | routing/award audit actions vs Doc-2 §9 | bind nearest §9 by pointer; additive Doc-2 §9; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `rfq.*` keys | **CLEARED** — Doc-3 v1.1 (14 keys) | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5E gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`rfq` table · vendor-attribute/matching-input calculation (M2 via service) · blacklist authority/storage/trace (M4; never read or persisted) · quota/entitlement (M7) · engagement/performance (M4/M5; event consumers) · coining any element · a cross-schema FK · cross-schema RLS traversal · writing a gate-excluded vendor into `matching_results` · any vendor-visible blacklist trace · a vendor-readable `matching_results`/`rfq_routing_log`/`routing_rules` row · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6E Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 2 MAJOR + 2 MINOR + 1 NIT applied); certified by `Doc-6E_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6E realizes the 12 `rfq` tables verbatim from Doc-2 §10.4 against frozen Doc-6A — the moat: first dual-sided buyer/vendor grant-row RLS + the blacklist-undetectable non-disclosure invariant's first DB bite; 2 state machines; reads vendor matching-attributes via service, owns the matching logic; coins nothing. Carried: Invariant #11 (load-bearing) + `[ESC-RFQ-AUDIT]`. Next: content passes → Content Hard Review → Content Freeze Audit → `Doc-6E_SERIES_FROZEN`.*
