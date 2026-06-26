# Doc-6A — Database Realization Metastandard — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the Doc-6 program |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6A_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied: 2 MAJOR + 3 MINOR + 2 NITPICK dispositioned, 1 MINOR rejected as false; authoring history + Review Disposition retained there). Freeze readiness certified by `Doc-6A_Structure_Freeze_Audit_v1.0.md` |
| Program | **Doc-6 — Database Realization** (persistence sibling of the Doc-5 API program) |
| Document | **Doc-6A** — the DB realization **metastandard**; governs Doc-6B…6K via the Appendix A `CHK-6-xxx` conformance checklist (the per-module freeze gate) |
| Realizes | `Doc-2_Domain_Model_And_Database_Blueprint` effective **v1.0.3** (§0 conventions · §2 aggregates · §3 entity catalog · §4 relationships · §5 state machines · §6 multi-tenancy · §7 permissions · §8 event ownership · §9 audit · §10 blueprint · §10.11 enforcement checklist · §11 assumptions) on PostgreSQL 15+/Supabase + Prisma `multiSchema` |
| Authority | `Doc-5_Program_Governance_Note_v1.0` (§1 purpose, §8 sibling-program rules); the frozen architecture corpus governs (Master Architecture · ADR Compendium · Doc-2 · Doc-3 · Doc-4A…4M). Doc-6 is an Implementation Contract layer (governance §3 hierarchy), below Doc-4, beside Doc-5 |
| Consistency obligation (not conformance) | Doc-6 contracts MUST be **consistent with the frozen Doc-5 API surface** (every Doc-5x read/write/list/idempotency contract must be persistable). **Doc-5A does NOT hold conformance authority over Doc-6** (governance §8); the *what*-authority is **Doc-2** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3 (+ `Doc-2_Patch_v1.0.3`), Doc-3 v1.0.2 (+ POLICY patches v1.0–v1.8), Doc-4A v1.0, Doc-4B v1.0 (M0 outbox/audit/ID owner — consumed), Doc-4L v1.0 (event-flow map), Doc-4M v1.0 (state-machine index), Doc-5A v1.0 (FROZEN — consistency cross-check) |
| Contains | Structure only — program partition, section map, ratified decisions (R-set), the Doc-6A section spine + Appendix A skeleton, carried dependencies. **No DDL, Prisma models, migrations, index lists, RLS bodies, or per-table schema** — those land in Doc-6A content passes + Doc-6B…6K |
| Audience | Architecture Board · Enterprise/DDD Architect · Security Architect (RLS) · Doc-6 content authors (human + AI) · AI Coding Supervisor · backend, DBA, QA |
| Program note | Doc-6 introduces **no module, ownership boundary, governance signal, state transition, permission slug, event, audit action, POLICY key, entity, column, or relationship**. It realizes existing Doc-2 declarations as physical persistence contracts. Any gap → **flag-and-halt** + human-approved additive patch; never coin, never resolve locally |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-2 fixed *what* is persisted (FROZEN). Doc-6 realizes *how* — physical PostgreSQL schema, Prisma models, migrations, indexes, constraints, RLS. Doc-6 re-decides nothing in Doc-2/3/4.
2. **Consistency is an obligation; conformance authority is Doc-2.** Doc-6 must be consistent with the frozen Doc-5 API surface and passes the Doc-6A **Appendix A** (`CHK-6-xxx`) checklist before any per-module freeze. It coins no table, column, entity, relationship, state, index name, event, audit action, or POLICY key.

## Decisions ratified at structure freeze (R-set)

- **R1 — Doc-6 program shape: a metastandard + 10 per-module schema realizations.** Doc-6 = **Doc-6A** (this DB realization metastandard) + **Doc-6B…6K** (one schema-realization document per Doc-2 §10.x module, letter map B=M0…K=M9), each staged-freeze and gated at freeze by Appendix A. Mirrors the Doc-5 program (5A + 5B…5K); preserves **One Module, One Owner** (Invariant #7) at the persistence layer — each module owns its schema; no document authors another module's tables.
- **R2 — Realize-never-redecide; Doc-2 is the *what*-authority.** Every table, column, relationship, state machine, tenancy class, event, and audit action realized in Doc-6 traces **verbatim by pointer** to its Doc-2 declaration (§2/§3/§4/§5/§6/§8/§9/§10). Doc-6 coins **nothing** in the domain. The only *new* decisions are physical realization choices (index strategy, trigger vs. service enforcement, partial-index predicates, Prisma model attributes), which MUST NOT change domain meaning. Gaps → `[ESC-6-*]`, escalated, never invented.
- **R3 — Physical schema names = the canonical namespaces; one Prisma namespace per module.** Two decisions: **(a)** realize Doc-2 §0.3 "one PostgreSQL schema per module" with physical schema names equal to the ten canonical namespaces — `core`, `identity`, `marketplace`, `rfq`, `operations`, `trust`, `communication`, `billing`, `admin`, `ai` — the deferred Doc-6 schema-naming decision the API route registry left open (`Doc-5A_Content_v1.0_Pass10 §B.1` — "the registry binds to the canonical namespace, not to physical storage naming, so a later Doc-6 schema-naming decision does not invalidate this registry"); **no foreign key crosses a schema boundary** (Doc-2 §0.3); cross-module references are bare UUID columns named for the target entity (e.g., `vendor_profile_id`), validated by the owning module's service and reconciled by the orphan-scan integrity job. **(b)** **one Prisma namespace per module** (via `multiSchema`) — the CLAUDE.md §10 deferred implementation choice — **RATIFIED at this Structure Freeze (Board, 2026-06-26).** Both (a) and (b) are binding from freeze.
- **R4 — Consistency with the frozen Doc-5 API surface (not conformance to Doc-5A).** Every frozen `Doc-5x` contract (read/list/create/command/idempotency/pagination) MUST be persistable: cursor-pagination contracts (`Doc-5A §8`) require deterministic sort-key indexes; idempotency-dedup contracts require the dedup persistence the `Doc-3 §12.2` `*.idempotency_dedup_window` keys reference; list page-size bounds map to `*.list_page_size_max`. **Doc-5A has no conformance authority over Doc-6** (governance §8) — the binding *what*-authority is Doc-2; Doc-5 consistency is a cross-check surfaced as `[ESC-6-API]` only when a Doc-5 surface cannot be persisted by a Doc-2-declared table (flag-and-halt, never local).
- **R5 — Standard-column contract (Doc-2 §0.1/§0.2).** Every table realizes: `id UUIDv7` PK (M0 ID service — Doc-4B); `human_ref` only where Doc-2 mandates a customer-facing reference (year-scoped, gap-tolerant, from `core.id_sequences`); the timestamp tuple (`created_at`, `updated_at`); actor stamps (`created_by`/`updated_by` where Doc-2 declares); `organization_id` on every tenant-owned table (Doc-2 §6); the soft-delete tuple (`deleted_at`, `deleted_by`, `delete_reason`) on soft-deletable tables, **never an `is_deleted` boolean**. Every unique constraint on a soft-deletable table is a **partial unique index `... WHERE deleted_at IS NULL`** (Doc-2 §0.2/§10.11). No column coined beyond Doc-2.
- **R6 — Outbox transactionality (Doc-2 §8/§10.1; M0-owned).** Realize `core.outbox_events` (owned by M0 — Doc-4B) and the binding rule: a business write and its event insert occur in **one transaction** (atomic write + emit). Doc-6 specifies the outbox table, the transactional contract every Doc-2 §8 state-transition emitter honors (Doc-4L flow map), and the dispatch-status columns. **No event coined**; consumer effects persist in the consuming module's own schema, never a cross-schema write.
- **R7 — Immutability & versioning realization (Invariant #8; Doc-2 §0.2/§5).** Nothing authoritative is overwritten or hard-deleted: versioned tables (`rfq_versions`, `quotation_versions`, `template_versions`, `spec_documents`) and append-only history (`financial_tier_history`, `trust_score_history`, `performance_score_history`, audit) are realized with DB-level immutability enforcement (trigger/constraint) once a binding state is reached; IDs are never reused. **Sole exception:** the regenerable `ai.*` derived-artifact cache, where TTL **hard-delete is legitimate and not append-only** (`Doc-5K R7`; `Doc-3_Policy_Key_Registration_Patch_v1.8_AI` `ai.<bc>.ttl_seconds`) — disposable projections, not authoritative records. The exception is enumerated, not general.
- **R8 — RLS as a defense-in-depth backstop, never the authorization model (CLAUDE.md §2; Doc-2 §6/§10.11).** Realize Row-Level Security on every **tenant-owned** table, anchored on `organization_id = active org`; vendor-side access anchors on **materialized grantee rows** (`rfq_invitation_grantees`, `quotation_visibility`) and explicit party columns (`controlling_organization_id` on quotations/delegation_grants), service-maintained and refreshed on delegation-grant revocation. **RLS policies MUST NOT depend on cross-schema ownership traversal** (Doc-2 §6). The **non-disclosure invariant** (Invariant #11) is realized so a blacklisted/excluded vendor's responses, counts, analytics, and logs are byte-equivalent to a non-matched vendor's — `buyer_vendor_statuses` and `link_suggestions` content never exposed in any vendor-facing surface, view, log, or error. **Authorization remains app-layer** (RLS is the backstop, not the model); the positive/negative/cross-tenant RLS test obligation is **Doc-8's** gate (by pointer).
- **R9 — Multi-currency storage (Doc-2 §0.4).** Every monetary amount is `NUMERIC` with an **explicit adjacent currency column**, default `'BDT'`. No implicit currency assumption; conversions explicit and out of the DB's authority.
- **R10 — Migration strategy: forward-only, per-module ownership, non-destructive on authoritative tables.** Forward-only versioned migrations; each module owns its schema's migrations (One Module, One Owner); no migration drops or destructively rewrites an authoritative table (Invariant #8 — additive/expand-contract only; destructive operations only on the regenerable `ai.*` cache per R7). Seed strategy covers Doc-3 §12 POLICY keys (R11) and role/permission seeds (Doc-2 §7 / A-08). Prisma codegen output lands in `generated-contracts-registry/` (GENERATED, gitignored, never hand-edited — CLAUDE.md §10).
- **R11 — POLICY configuration & registry persistence (Doc-3 §12; M0-owned).** Realize `core.system_configuration` holding every registered POLICY key (the additive `Doc-3 §12.2` registrations v1.0–v1.8 — **nine** registered namespaces: `core` (v1.0) · `rfq` (v1.1) · `marketplace` (v1.2) · `trust` (v1.3) · `operations` (v1.4) · `communication` (v1.5) · `billing` (v1.6) · `admin` (v1.7) · `ai` (v1.8); **M1 `identity` registered none**). Owned by M0; read by all modules via the config service. **No POLICY key coined** (Doc-3 owns the registry); Doc-6 realizes storage + seed of already-registered keys only. Whether any module (e.g. `identity`) needs an additional wire-referenced POLICY key is a **per-module content cross-check**, resolved only via an additive `Doc-3 §12.2` patch under `[ESC-6-POLICY]` — never coined here.
- **R12 — Out-of-DB boundary (the persistence analog of Doc-5's out-of-wire fence).** The DB stores **references only** for artifacts owned by other infrastructure: file blobs live in Supabase Storage (Doc-2 §9 — document versions referenced by ID, no blobs; the DB holds `file_ref`/path columns, never binary); full-text search is Postgres FTS now / Meilisearch future (the search index is a disposable projection, not authoritative — search follows aggregate ownership); Realtime is a transport, not a table. **No out-of-DB artifact is an authoritative Doc-6 table.** Flag-and-halt if one is proposed as such.

## The Doc-6 program partition (the structural spine)

> The Doc-6 program realizes **10 module schemas** (Doc-2 §10.1–§10.10), one per-module document, governed by this metastandard (Doc-6A) + the cross-cutting §10.11 enforcement checklist. Letter map mirrors Doc-5 (B=M0…K=M9). Each per-module document realizes exactly one schema; no document authors another module's tables.

| Doc-6 document | Module / schema | Doc-2 source | Realizes |
|---|---|---|---|
| **Doc-6A** (this doc) | — (metastandard) | Doc-2 §0, §6, §8, §9, §10.11; §11 | Cross-cutting DB realization conventions + the `CHK-6-xxx` freeze gate |
| **Doc-6B** | M0 `core` | Doc-2 §10.1 | `outbox_events`, `audit_records`, `id_sequences`, `system_configuration`, feature flags, file refs |
| **Doc-6C** | M1 `identity` | Doc-2 §10.2 | users, organizations, memberships, roles, permissions, delegation_grants |
| **Doc-6D** | M2 `marketplace` | Doc-2 §10.3 | vendor profiles, microsites, products, projects, categories, ads, favorites |
| **Doc-6E** | M3 `rfq` | Doc-2 §10.4 | rfqs, rfq_versions, invitations + grantees, quotations + versions + visibility, comparison |
| **Doc-6F** | M4 `operations` | Doc-2 §10.5 | post-award docs, trade_invoices, finance records, private_vendor_records (CRM) |
| **Doc-6G** | M5 `trust` | Doc-2 §10.6 | trust/performance score tables + history, verification_records/decisions, financial_tier_history, fraud signals |
| **Doc-6H** | M6 `communication` | Doc-2 §10.7 | threads + participants, messages, notifications, delivery logs |
| **Doc-6I** | M7 `billing` | Doc-2 §10.8 | plans, subscriptions, entitlements, quotas, lead credits, platform_invoices |
| **Doc-6J** | M8 `admin` | Doc-2 §10.9 | moderation_cases, ban_actions, suggestion/link tables, import_jobs, verification_tasks, outreach |
| **Doc-6K** | M9 `ai` | Doc-2 §10.10 | regenerable derived-artifact cache (TTL hard-delete — R7 exception); owns no authoritative data |

*This document (Doc-6A) authors no module schema. §3–§12 are cross-cutting realization conventions; per-module tables are realized in Doc-6B…6K against these conventions.*

---

## §0 — Document Control, Precedence & Consistency Obligation
- **Purpose:** Doc-6A's precedence (Master Architecture → ADR → Doc-2 · Doc-3 → Doc-4A…4M → **Doc-6A → Doc-6B…6K** → Code; Implementation Contract layer, beside Doc-5 — governance §3); realize-never-redecide; the **consistency-with-Doc-5** obligation (not conformance — Doc-2 is the *what*-authority); flag-and-halt on any gap. State up front the two freeze obligations every per-module doc inherits: pass Appendix A (`CHK-6-xxx`) and clear any `[ESC-6-*]` via its named channel (additive Doc-2/Doc-3 patch, human-approved).
- **Dependencies:** `Doc-5_Program_Governance_Note_v1.0 §1` (program purpose) + `§8` (sibling-program freeze ordering — load-bearing); `§3` (corpus source-of-truth rank — indirect); `Doc-2 §0`. **Detail:** short, normative.

## §1 — Scope, Audience & the Doc-6 Program Partition
- **Purpose:** what Doc-6A governs (cross-cutting DB realization conventions + the per-module freeze gate) and does not (no module schema authored here — that is Doc-6B…6K); carry the program partition table (the 10-schema letter map); the dependency boundary (Doc-6A realizes Doc-2 conventions; each Doc-6x realizes only its own §10.x schema; cross-module references by bare UUID only — never a cross-schema FK or a foreign module's table in the wrong document). Register carried cross-cutting dependencies (`DR-6-*`) and `[ESC-6-*]` markers by pointer.
- **Dependencies:** `Doc-2 §0.3/§10`; governance §1. **Detail:** scope + program partition + carried-dependency table.

## §2 — DB Realization Stack & Authority Binding
- **Purpose:** fix the persistence transport (PostgreSQL 15+/Supabase; Prisma ORM with `multiSchema` — R3) and the authority binding: **Doc-2 = the *what*** (binding); **Doc-6 = the *how*** (this program); **Doc-5 = a consistency cross-check** (not conformance — R4). Declare the schema-name alignment (physical schema = canonical namespace — R3a) and the ratified one-Prisma-namespace-per-module (R3b). State that Doc-6 introduces no domain element (R2) and that physical choices never change domain meaning.
- **Dependencies:** `Doc-2 §0.3/§0.4`; `Doc-5A_Content_v1.0_Pass10 §B.1` (schema-naming deferral); CLAUDE.md §2/§10 (Prisma, RLS-as-backstop). **Detail:** stack + authority statement; the schema-naming decision.

## §3 — Cross-Cutting Schema Conventions *(mechanism only — authors no table)*
- **Purpose:** realize the standard-column contract (R5) + naming conventions every Doc-6x table inherits: `id UUIDv7` PK; `human_ref` placement rule (Doc-2 §0.1 — only where a customer-facing reference is mandated); the timestamp/actor/tenant/soft-delete tuples; column-suffix conventions (`_id`/`_at`/`_by`/`_jsonb`; `_ref` NOT used for cross-module references — the column names the entity; `_history` for append-only); enum-value convention (lowercase underscored — Doc-2 §0.2); the partial-unique-index rule (`WHERE deleted_at IS NULL`). **No table instantiated here** — the convention layer §3–§12 + Doc-6B…6K depend on.
- **Dependencies:** `Doc-2 §0.1/§0.2/§0.4`; `Doc-4B` (ID service, human_ref sequences). **Detail:** convention declaration; no table.

## §4 — Tenancy & RLS Realization Model *(mechanism only — authors no table)*
- **Purpose:** realize the multi-tenancy mapping (Doc-2 §6) + RLS-as-backstop (R8): the four tenancy classes (tenant-owned / shared / platform-owned / derived) and each one's RLS posture; the `organization_id` anchor for tenant-owned tables; the **materialized grantee-row** anchors for vendor-side access (`rfq_invitation_grantees`, `quotation_visibility`, `controlling_organization_id`) + their service-maintained refresh-on-revocation rule; the prohibition on cross-schema ownership traversal in any RLS policy; the **non-disclosure invariant** realization (byte-equivalent responses; `buyer_vendor_statuses`/`link_suggestions` never exposed); and the load-bearing statement that **authorization is app-layer, RLS is the backstop**. The positive/negative/cross-tenant RLS test obligation is **Doc-8's** gate (by pointer).
- **Dependencies:** `Doc-2 §6/§10.4/§10.11`; CLAUDE.md §2; `Doc-4C` (app-layer authz root). **Detail:** tenancy + RLS convention; non-disclosure load-bearing.

## §5 — Integrity & Constraint Realization *(mechanism only)*
- **Purpose:** realize keys/constraints: PK (`id`), unique + partial-unique indexes (R5), CHECK constraints for enumerated state/currency, and the **no-cross-schema-FK** rule (Doc-2 §0.3) — cross-module references are bare UUID columns validated by the owning module's service before save and reconciled by the periodic orphan-scan integrity job (Doc-2 §0.3/§10.11). Intra-schema FKs permitted within a module's aggregate boundary. Concurrency safety (optimistic-concurrency columns, row-locked sequences — Doc-2 §10.11) by pointer.
- **Dependencies:** `Doc-2 §0.3/§4/§10.11`. **Detail:** constraint convention; cross-module-by-UUID load-bearing.

## §6 — Immutability, Soft-Delete & Versioning Realization *(mechanism only)*
- **Purpose:** realize Invariant #8 at the DB layer (R7): soft-delete semantics (tuple + partial-unique + exclusion from routing/matching/search/default queries); versioned tables (immutable once a binding state is reached — trigger/constraint; new row per revision); append-only history; IDs never reused. State the **enumerated exception**: the regenerable `ai.*` cache permits TTL hard-delete (Doc-5K R7) — disposable projection, not authoritative. No general hard-delete.
- **Dependencies:** `Doc-2 §0.2/§5`; `Doc-5K R7`; `Doc-3_Policy_Key_Registration_Patch_v1.8_AI` (`ai.<bc>.ttl_seconds`). **Detail:** immutability/versioning convention; ai-cache exception enumerated.

## §7 — Outbox & Event-Persistence Realization *(M0-owned table; convention)*
- **Purpose:** realize `core.outbox_events` (R6) + the transactional write-plus-emit contract: business write + event insert in one transaction; dispatch-status lifecycle columns (`pending → dispatched → archived`); the §8 emitter obligation (every Doc-2 §8 state-transition emitter inserts an outbox row in the same transaction); consumer effects persist in the consuming module's own schema (no cross-schema write). Bind the event set + flow by pointer (Doc-2 §8 / Doc-4J catalog / Doc-4L flow map). No event coined.
- **Dependencies:** `Doc-2 §8/§10.1`; `Doc-4B` (outbox owner); `Doc-4L` (flow map). **Detail:** outbox table + transactional convention.

## §8 — Audit Persistence Realization *(M0-owned table; convention)*
- **Purpose:** realize `core.audit_records` (Doc-2 §9): the immutable audit table (fields `audit_id, actor_id, actor_type[User|Admin|System|AI Agent], organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent`); redaction-of-sensitive-fields realized as a **new audit event** (never an in-place edit); document versions referenced by ID (no blobs — R12); the per-domain "MUST audit" action set bound by pointer (Doc-2 §9). No audit action coined.
- **Dependencies:** `Doc-2 §9`; `Doc-4B` (audit owner). **Detail:** audit table + immutability convention.

## §9 — POLICY Configuration & Seed Realization *(M0-owned table; convention)*
- **Purpose:** realize `core.system_configuration` (R11) holding every registered POLICY key (the `Doc-3 §12.2` additive registrations v1.0–v1.8 — **nine** registered namespaces `core`/`rfq`/`marketplace`/`trust`/`operations`/`communication`/`billing`/`admin`/`ai`; **M1 `identity` registered none** — per-module cross-check via `[ESC-6-POLICY]`, never coined); the read path (config service, M0-owned, read by all modules); the **seed** of the already-registered keys + role/permission seeds (Doc-2 §7 / A-08). No POLICY key coined.
- **Dependencies:** `Doc-3 §12` + POLICY patches v1.0–v1.8; `Doc-2 §7`; A-08. **Detail:** config table + seed convention.

## §10 — Indexing, Pagination & Performance Realization *(mechanism only)*
- **Purpose:** realize the index strategy that makes the frozen Doc-5 API surface persistable (R4): deterministic sort-key indexes for every cursor-paginated `Doc-5x` list (`Doc-5A §8`); idempotency-dedup persistence for the `*.idempotency_dedup_window` keys; FTS indexes for Postgres-FTS reads (search follows aggregate ownership — R12); the matching/denormalization realization (A-09) by pointer. Page-size bounds map to `*.list_page_size_max` (Doc-3 §12) — never a literal. Surface `[ESC-6-API]` only where a Doc-5 surface cannot be persisted by a Doc-2 table (flag-and-halt).
- **Dependencies:** `Doc-5A §8` (pagination); `Doc-3 §12` (page-size/dedup keys); `Doc-2 §10` (per-module indexes); A-09. **Detail:** index/pagination convention; Doc-5 consistency cross-check.

## §11 — Migration Strategy & Codegen *(mechanism only)*
- **Purpose:** realize R10 — forward-only versioned migrations; per-module migration ownership (One Module, One Owner); expand-contract / non-destructive on authoritative tables (destructive only on the `ai.*` cache — R7); seed migrations (POLICY keys §9, role seeds); Prisma codegen → `generated-contracts-registry/` (GENERATED, gitignored, never hand-edited — CLAUDE.md §10); the `multiSchema` migration layout (R3). The migration test/CI obligation is Doc-8's (by pointer).
- **Dependencies:** CLAUDE.md §10; `Doc-2 §10.11`; Prisma `multiSchema`. **Detail:** migration + codegen convention.

## §12 — Out-of-DB Boundary
- **Purpose:** declare R12 — the DB stores references only for file blobs (Supabase Storage; `file_ref`/path columns, no binary — Doc-2 §9), external search indexes (Meilisearch future; the index is a disposable projection, not an authoritative table — FTS now), and Realtime (a transport, not a table). **No out-of-DB artifact is an authoritative Doc-6 table.** Flag-and-halt if one is proposed as such.
- **Dependencies:** `Doc-2 §9`; CLAUDE.md §2 (Storage/Search/Realtime). **Detail:** boundary statement only — no table.

## §13 — Conformance & Carried Items
- **Purpose:** Doc-6A's self-check against Appendix A (the per-module freeze gate it defines for Doc-6B…6K); the carried-items register (`DR-6-*` + `[ESC-6-*]`) by pointer; the statement that Doc-6A coins nothing and authors no table. Name the per-module freeze obligation: each Doc-6x passes Appendix A and clears its `[ESC-6-*]` via a named additive channel (Doc-2/Doc-3 patch, human-approved) — never locally.
- **Dependencies:** Appendix A; `Doc-2 §10.11`. **Detail:** attestation + carried-item register.

## Appendix A — Doc-6 DB Realization Conformance Checklist (`CHK-6-xxx`) — the per-module freeze gate
- **Purpose:** the checklist every Doc-6B…6K passes before freeze (the DB-program analog of Doc-5A Appendix A). Bands (check IDs assigned at content):
  - **Standard-column band** — every table has `id UUIDv7`; `human_ref` only where Doc-2 mandates; timestamp/actor/tenant/soft-delete tuples per Doc-2; no `is_deleted` boolean; partial-unique `WHERE deleted_at IS NULL` on every soft-deletable unique constraint (R5).
  - **Schema-isolation band** — physical schema = canonical namespace; **no cross-schema FK**; cross-module references bare UUID + service-validated (R3); intra-schema FKs within aggregate boundary only.
  - **Tenancy/RLS band** — RLS on every tenant-owned table anchored on `organization_id`; materialized grantee-row anchors; no cross-schema ownership traversal; non-disclosure byte-equivalence; authorization app-layer / RLS backstop (R8).
  - **Immutability band** — versioned/append-only/soft-delete realized; no authoritative hard-delete; `ai.*` TTL hard-delete exception enumerated (R7).
  - **Outbox/audit band** — `core.outbox_events` transactional write+emit; `core.audit_records` immutable; redaction-as-new-event; no blobs (R6/§8/R12).
  - **Multi-currency band** — every monetary amount `NUMERIC` + explicit currency column, default BDT (R9).
  - **POLICY/seed band** — `core.system_configuration` realized; all registered keys (v1.0–v1.8) seeded; no key coined (R11).
  - **Doc-5 consistency band** — every frozen Doc-5x read/list/command persistable; cursor-sort indexes present; idempotency-dedup persisted; page-size bounds via POLICY key (R4).
  - **Realize-never-redecide band** — no table/column/relationship/state/event/audit action coined; every element traces to a Doc-2 pointer; gaps are `[ESC-6-*]`, escalated (R2).
- **Dependencies:** all R-set; `Doc-2 §10.11`; `Doc-5A §8`. **Detail:** checklist table (check IDs + per-band pass/fail at content).

---

## Open Carried Items (resolved only via named channels, never here)

| ID | Item | Doc-6A handling | Freeze gate? |
|---|---|---|---|
| **DR-6-CORE** | M0 owns `outbox_events` / `audit_records` / `id_sequences` / `system_configuration` — consumed by all modules | Realized in Doc-6B; other Doc-6x reference by pointer, never re-author (R6/R8/R11); One Module, One Owner | **No** |
| **DR-6-API** | Doc-5 API surface must be persistable | Consistency cross-check (R4); `[ESC-6-API]` only where a Doc-5 surface cannot map to a Doc-2 table — flag-and-halt | **No** (per-module cross-check at content) |
| **DR-6-STATE** | State machines (Doc-4M / Doc-2 §5) realized as enumerated state columns + CHECK/transition enforcement | Bound by pointer; enforcement service+DB (R2/R5); no edge coined | **No** |
| `[ESC-6-SCHEMA]` | Any physical realization need not covered by a Doc-2 declaration | Bound by pointer to the nearest Doc-2 §10/§10.11 item; interim; channel = additive Doc-2 patch (human-approved); never invented | **Per-module: possible** |
| `[ESC-6-POLICY]` | Any persistence need referencing an unregistered POLICY key (incl. the open **M1 `identity`** namespace — no v1.x patch registered any `identity.*` key) | Referenced by intended name by pointer; resolved via additive `Doc-3 §12.2` patch (precedent v1.0–v1.8); never coined; identity registration confirmed/declined as a Doc-6C content cross-check | **Per-module: possible** |
| `[ESC-6-API]` | A frozen Doc-5x surface not persistable by any Doc-2 table | Flag-and-halt; escalate to Board for additive Doc-2 patch; never resolved locally (governance §8) | **Per-module: possible** |

## Fences / Out of scope

Authoring any module's actual tables/DDL/Prisma models (Doc-6B…6K content) · any other infrastructure layer (API = Doc-5; Frontend = Doc-7; Tests = Doc-8) · resolving `DR-6-*` / `[ESC-6-*]` (named channels only) · coining any table, column, entity, relationship, state, index name, event, audit action, or POLICY key · changing any Doc-2 declaration, module ownership, governance signal, or invariant · giving any out-of-DB artifact (blob, external search index, realtime channel) an authoritative table (R12) · introducing any cross-schema foreign key or cross-module table access (R3) · placing authorization logic in RLS as the model rather than the backstop (R8) · the RLS/migration **test** obligation (Doc-8).

---

*End of Doc-6A Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes `Doc-6A_Structure_Proposal_v0.1.md` (v0.2); certified by `Doc-6A_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and the frozen corpus win; flag-and-halt. Doc-6 realizes Doc-2 on PostgreSQL/Supabase + Prisma `multiSchema`; consistent with the frozen Doc-5 surface; coins nothing. Program shape: Doc-6A metastandard + Doc-6B…6K per-module schema realizations (B=M0…K=M9). R3(b) one-Prisma-namespace-per-module ratified at freeze. Next: Doc-6A content passes → Doc-6B (M0 `core`).*
