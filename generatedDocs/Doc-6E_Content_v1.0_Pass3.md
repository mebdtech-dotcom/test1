# Doc-6E — M3 RFQ Engine (`rfq`) Schema Realization — Content v1.0 **Pass-3** (§3.5 Comparison · §4 State · §5 Firewalls · §6 Indexing · §7 Migration · §8 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (0 BLOCKER + 2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §3.5 + §4–§8 + Appendix A. Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | **Comparison** (`comparison_statements` — versioned buyer artifact); the **§4 state-machine** consolidation (§5.4 + §5.5; outbox-in-txn); the **§5 cross-module firewalls** (DD-MKT/OPS/TRUST/BILL + Invariant #11); the **§6 indexing**; the **§7 forward-only migration**; **§8 + Appendix A** (Doc-6A `CHK-6-001…093`, 37 checks) |
| Authority | `Doc-2 §5.4/§5.5/§8/§10.4/§10.11` (the *what*); `Doc-6A` (the *how* + Appendix A gate); `Doc-6B §4` (consumed); `Doc-4E/4L/4M` (events/state); `Doc-3 v1.1` (`rfq.*` POLICY); `Doc-5E` (read/list cross-check) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.4; physical specifics §2.5-tagged. Carried: `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-SCHEMA-RULES]` |
| DDL note | PostgreSQL 15+; Prisma `@@schema("rfq")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.5 — `rfq.comparison_statements` (versioned buyer artifact; buyer-only)
Realizes Doc-2 §10.4. In-module FKs → `rfqs` + `rfq_versions`; `organization_id` (buyer) tenant; **NO SD** (versioned). Buyer-only (never vendor — it ranks the quotations).

```sql
CREATE TABLE rfq.comparison_statements (
  id              uuid    NOT NULL,
  rfq_id          uuid    NOT NULL,                              -- [Doc-6A §5.2] in-module FK
  rfq_version_id  uuid    NOT NULL,                              -- [Doc-6A §5.2] in-module FK
  organization_id uuid    NOT NULL,                              -- [Doc-2 §10.4] bare UUID → M1 (buyer); RLS tenant anchor
  version_no      integer NOT NULL,                             -- [Doc-2 §10.4]
  matrix_jsonb    jsonb   NOT NULL,                             -- [Doc-2 §10.4] the comparison matrix (per-quotation columns)
  generated_at    timestamptz NOT NULL DEFAULT now(),           -- [Doc-2 §10.4]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.4] (NO SD — versioned)
  CONSTRAINT comparison_statements_pkey PRIMARY KEY (id),
  CONSTRAINT comparison_statements_rfq_fk     FOREIGN KEY (rfq_id) REFERENCES rfq.rfqs(id),
  CONSTRAINT comparison_statements_version_fk FOREIGN KEY (rfq_version_id) REFERENCES rfq.rfq_versions(id),
  CONSTRAINT comparison_statements_rfq_ver_no_uq UNIQUE (rfq_id, version_no)  -- [§2.5] one row per (rfq, comparison version)
);
CREATE INDEX comparison_statements_rfq_idx ON rfq.comparison_statements (rfq_id, version_no);  -- [§2.5]
```
- **Versioned (Doc-2 §10.4):** a regenerated comparison = a **new row** (`version_no++`); priors retained. **Buyer-only RLS** — `organization_id = active_org` OR admin; **no vendor policy** (a vendor must never see the buyer's cross-quotation comparison). **Prisma [§2.5]:** `ComparisonStatement`.

```sql
ALTER TABLE rfq.comparison_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY comparison_statements_buyer ON rfq.comparison_statements FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid);
```

## §4 — State Machine Realization (Doc-2 §5.4 · §5.5)
| Machine | Table | Realization | Transition owner |
|---|---|---|---|
| **RFQ §5.4** (13) | `rfqs.state` | enum (Pass-1) | service edges; `expired` = System timer (validity window in `core.system_configuration`); `closed_won`/`closed_lost` award |
| **Quotation §5.5** (6) | `quotations.state` | enum (Pass-2) | service edges; revise → new `quotation_version`; `expired` on rfq cancel/expire |

**Transition = outbox (Doc-2 §8, R6):** every transition Doc-2 §8 lists as an emitter writes the business row **+** a `core.outbox_events` row in **one transaction** (Doc-6B §3.2). Event slugs **bound to Doc-2 §8 / Doc-4L by pointer** (none coined): `VendorInvited` (fires **only** at `rfq_invitations.delivered` — Pass-1), RFQ submit/match/award transitions, quotation submit/select. **`closed_won` → engagement creation (M4) + performance inputs (M5)** are **consumer effects** of the award event (the consumers write in **their own** schemas — DD-OPS/DD-TRUST); M3 emits, never writes M4/M5. Quota consumption (M7) on quotation submit = service (DD-BILL). The routing/award **audit actions** = **`[ESC-RFQ-AUDIT]`** (bind nearest Doc-2 §9 by pointer; none invented). **Reflect-never-decide** N/A here (M3 *owns* its decisions — it is the engine).

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/TRUST/BILL + Invariant #11)
All cross-module refs = **bare UUID, no FK, service-validated, orphan-scan-reconciled** (Doc-2 §0.3 / Doc-6A §5.3/§5.5). No cross-schema JOIN/RLS-traversal.

| DD | Boundary | M3 realization |
|---|---|---|
| **DD-MKT** | M2 vendor/category/spec + matching attributes | `vendor_profile_id`/`category_id`/`spec_document_ids[]` bare UUID; matching reads `vendor_matching_attributes` **via service** (DD-2); M3 owns the gates + scoring, M2 owns the attributes |
| **DD-OPS** | M4 engagement | `closed_won` emits the award event; M4 creates the engagement (consumer; its own schema) |
| **DD-TRUST** | M5 performance inputs | award/response events feed M5 performance inputs (consumer); M3 writes none |
| **DD-BILL** | M7 quota | quotation submit consumes Controlling-Org quota via service; no `billing` read |
| **Invariant #11** | M4 blacklist | blacklist is M4's (`operations.buyer_vendor_statuses`); served to routing **only** via the CRM service; M3 **never reads/persists it**; gate-excluded vendors **never** written to `matching_results`; `rfq_routing_log` aggregate-only, no vendor policy → **blacklist undetectable (byte-equivalent)** |

No cross-module write; no cross-schema FK/JOIN/traversal.

## §6 — Indexing & Performance
Cursor-pagination composite sort-key indexes for the Doc-5E lists (`(organization_id, state)` rfqs; `(rfq_id, state)` invitations; `(controlling_organization_id)` quotations; `(rfq_version_id, confidence_score DESC)` matching); the grant-anchor `organization_id` indexes (Pass-1/2); the **one-active-quotation partial-unique** (`WHERE state IN ('draft','submitted') AND deleted_at IS NULL`); partial `WHERE deleted_at IS NULL` on SD tables. **Page size + throttle/validity windows** resolve from `rfq.*` POLICY (Doc-3 v1.1) — **never literals** (Doc-6A §10.2). No FTS in M3 (search is M2; matching is service, not FTS).

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.1 (CLEARED):** the 14 `rfq.*` keys are registered + seeded in `core.system_configuration` (M0-owned); M3 **reads** them, seeds none, coins none. No `rfq.*` patch needed.

**Forward-only order (Doc-6A §10/§11; R10):**
1. (assume `core`/`identity`/`marketplace` migrated) `CREATE SCHEMA rfq`.
2. Enums (`rfq_state`/`routing_mode`/`work_nature`/`invitation_state`/`grant_access_type`/`quotation_state`).
3. `rfqs` → `rfq_versions` → `rfq_invitations` → `rfq_invitation_grantees` → `rfq_document_grants` → `routing_rules` → `rfq_routing_log` → `matching_results` → `quotations` → `quotation_versions` → `quotation_visibility` → `comparison_statements`.
4. Functions + triggers (`rfq.rfq_versions_freeze_when_immutable`; `core.raise_immutable_violation` attachments on `rfq_routing_log` + `quotation_versions`).
5. Indexes (cursor/partial/anchor/one-active-quotation).
6. RLS enable + policies (all 12 tables).
7. Seeds: **none owned by M3** (POLICY seeded by M0; `routing_rules` = admin-runtime config unless a Doc-4E pointer declares a seed — none coined).

All migrations forward-only, idempotent; no destructive change to a frozen object.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to a Doc-2 §10.4 pointer or a §2.5 attribution. Carried register: **`[ESC-RFQ-AUDIT]`** (routing/award audit — bind nearest Doc-2 §9 by pointer) · **`[ESC-RFQ-SCHEMA-RULES]`** (routing-rule schema — bind via Doc-4E/Doc-5E or admin-runtime) · DD-MKT/OPS/TRUST/BILL · Invariant #11 (realized). `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.1).

## Appendix A — Doc-6E Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | CHK-6-001 | PASS | every table `id uuid` PK (UUIDv7, M0) |
| | CHK-6-002 | PASS | two `human_ref` (`rfqs` RFQ-…, `quotations` QTN-…) via `core.allocate_human_ref`; prefixes Doc-2 §0.1-given |
| | CHK-6-003 | PASS | `created_at`/`updated_at` where mutable; append-only/version tables omit `updated_at` by design; actor stamps present |
| | CHK-6-004 | PASS | soft-delete tuple on `rfqs`/`quotations`/`routing_rules`; **no `is_deleted`**; grants/versions/log/derived correctly **no SD** |
| | CHK-6-005 | PASS | **one-active-quotation partial-unique** (§10.11 #7); soft-delete partials; grant uniques |
| **B** | CHK-6-010 | PASS | physical `rfq` namespace; one Prisma `@@schema("rfq")` |
| | CHK-6-011 | PASS | **no cross-schema FK** — vendor/category/spec/org/user all bare UUID + `spec_document_ids[]` |
| | CHK-6-012 | PASS | cross-module refs entity-named, service-validated, orphan-scan (§5) |
| | CHK-6-013 | PASS | no cross-schema JOIN/RLS-traversal; vendor RLS = **intra-schema** grant-row EXISTS only (§10.11 #9) |
| **C** | CHK-6-020 | PASS | RLS on every table; tenant anchors server-set (`app.active_org`), fail-closed |
| | CHK-6-021 | PASS | **materialized grant anchors** (`rfq_invitation_grantees`/`rfq_document_grants`/`quotation_visibility`) + party columns; **refresh-on-revocation** (hard DELETE, audited) |
| | CHK-6-022 | **PASS — IN-SCOPE (first real)** | **blacklist undetectable**: gate-excluded never written to `matching_results`; `rfq_routing_log` aggregate-only + **no vendor policy**; routing/matching/comparison buyer-side-only → byte-equivalent |
| | CHK-6-023 | PASS | authz app-layer (Doc-4E); RLS = backstop |
| **D** | CHK-6-030 | PASS | no hard-DELETE of authoritative rows; grant DELETE = revocation (audited, by design — not authoritative content) |
| | CHK-6-031 | PASS | `rfq_versions.is_immutable` (conditional trigger) + `quotation_versions` (full append-only); new row per revision |
| | CHK-6-032 | PASS | `matching_results` regenerable; `rfq_routing_log` INSERT-only; scores/snapshots under System |
| | CHK-6-033 | **N/A** | no `ai.*` cache; `matching_results` rebuild = derived-projection refresh, not the enumerated TTL hard-delete |
| **E** | CHK-6-040 | PASS | transitions emit `core.outbox_events` in one txn (§4) |
| | CHK-6-041 | PASS | **no event coined**; bound to Doc-2 §8/Doc-4L; `closed_won` consumer effects (M4/M5) in their own schemas |
| | CHK-6-042 | PASS | audit via `core.audit_records` (M0); append-only, immutable (incl. grant-removal audit) |
| | CHK-6-043 | **PASS-with-carry** | audited-action coverage per Doc-2 §9; routing/award gap = **`[ESC-RFQ-AUDIT]`** (no action coined) |
| **F** | CHK-6-050 | PASS | `rfqs.estimated_value` + currency; `quotation_versions.currency` (R9/§0.4); no bare-amount money column |
| **G** | CHK-6-060 | PASS | reads `core.system_configuration`; 14 `rfq.*` keys seeded (Doc-3 v1.1); **no key/default coined** |
| | CHK-6-061 | PASS | page-size + throttle/validity windows resolve from POLICY keys, never literals (§6) |
| | CHK-6-062 | **N/A** | no role/permission seed in M3 (that is M1 §7) |
| **H** | CHK-6-070 | PASS | Doc-5E reads/lists persistable (rfq list/detail, invitations, quotations, comparison, matching) |
| | CHK-6-071 | PASS | each list has a deterministic composite sort-key index (§6) |
| | CHK-6-072 | PASS | idempotency-dedup persisted where Doc-5E declares (`rfq.idempotency_dedup_window`) |
| | CHK-6-073 | PASS | no non-persistable Doc-5E surface → no `[ESC-6-API]` raised |
| **I** | CHK-6-080 | PASS | **nothing coined** — every table/column/state/enum traces to Doc-2 §10.4/§5.4/§5.5; `routing_rules` schema **not** invented (`[ESC-RFQ-SCHEMA-RULES]`) |
| | CHK-6-081 | PASS | every physical specific (GUC/index/trigger/fn names, flat geography, `rule_definition_jsonb`, enum-array work_nature, FTS-absence) §2.5-attributed |
| | CHK-6-082 | PASS | `[ESC-*]` raised via named channels (RFQ-AUDIT/SCHEMA-RULES); none resolved locally |
| | CHK-6-083 | PASS | no Doc-2 decision re-opened |
| **J** | CHK-6-090 | PASS | every model extends the B.1 base + B.2 type catalog; no parallel base/type convention |
| | CHK-6-091 | PASS | **coins no shared enum**; reuses B.3 (`actor_type`/`currency`/outbox `status`) by pointer; M3 enums module-owned |
| | CHK-6-092 | PASS | B.4 naming registry followed (`*_fk`/`*_uq`/`*_idx`; `<table>_<cols>_<kind>`) |
| | CHK-6-093 | PASS | B.5 conventions (multi-schema ownership, cross-module-by-UUID, forward-only migration) realized as written |

**37/37 — 0 FAIL.** N/A: CHK-6-033 (no ai cache), CHK-6-062 (no role seed) — justified by shape/ownership. PASS-with-carry: CHK-6-043 (`[ESC-RFQ-AUDIT]`). **CHK-6-022 is the headline: the first real in-scope byte-equivalence pass — the blacklist-undetectable invariant realized in the DB.**

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent. Verified CORRECT: `comparison_statements` columns (Doc-2 §10.4), buyer-only RLS, the §4 outbox-in-txn rule, the §5 firewalls (esp. Invariant #11), event-slug-binding-by-pointer, the 37/37 Appendix A, coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **CMP-VENDOR** `comparison_statements` left vendor-readable would leak the buyer's cross-quotation ranking | MAJOR | **FIXED** — §3.5: buyer-`organization_id` OR admin only; **no vendor policy**. Consistent with `matching_results`/`rfq_routing_log`. |
| **EVT-SLUG** `closed_won`/`VendorInvited`/quotation events asserted but unbound | MAJOR | **CONFIRMED bound-by-pointer** — §4: slugs bound to Doc-2 §8 / Doc-4L; consumer effects (M4 engagement, M5 performance) in their own schemas; none coined. |
| **MIG-ORDER** migration creates `rfq_routing_log.applied_filter_ref` → `routing_rules` before `routing_rules` | MINOR | **CONFIRMED safe** — `applied_filter_ref` is a **bare UUID, no FK** (a soft reference to a rule id); no ordering constraint. §7 still orders `routing_rules` before the log for clarity. |
| **CMP-VER** `comparison_statements` versioned but no immutability of priors | MINOR | **CONFIRMED by-design** — versioned = new row per regen; priors are historical rows (no SD); not asserted immutable by Doc-2 (regenerable buyer artifact). No trigger needed. |
| **AUDIT-CARRY** `[ESC-RFQ-AUDIT]` scope | NIT | **CONFIRMED** — routing/award audit actions bind to nearest Doc-2 §9 by pointer at audit time; CHK-6-043 PASS-with-carry; none invented. |

**Net:** 0 BLOCKER; 2 MAJOR (comparison vendor-leak fixed; event-slug binding confirmed) + 2 MINOR + 1 NIT applied/confirmed. The comparison-leak finding completes the buyer-side-only triad (matching/routing-log/comparison) protecting the moat's intel. DDL valid; 37/37 Appendix A; CHK-6-022 in-scope PASS. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6E Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `rfq` realization: Comparison (versioned, buyer-only), the §4 state consolidation (outbox-in-txn; event slugs bound to Doc-2 §8/Doc-4L; M3 owns its decisions), the §5 firewalls (DD-MKT/OPS/TRUST/BILL + the blacklist-undetectable Invariant #11), §6 indexing, §7 forward-only migration, and §8 + Appendix A (37/37, 0 FAIL — incl. the first real in-scope CHK-6-022 byte-equivalence). Coins nothing; carried `[ESC-RFQ-AUDIT]` · `[ESC-RFQ-SCHEMA-RULES]`. Next: Content Hard Review (cross-pass, full §0–§8 + Appendix A) → Content Freeze Audit → `Doc-6E_SERIES_FROZEN`.*
