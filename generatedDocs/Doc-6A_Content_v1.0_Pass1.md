# Doc-6A — Database Realization Metastandard — Content v1.0 **Pass-1** (§0–§4)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER→downgraded-MAJOR + 2 MAJOR + 3 MINOR + 2 NITPICK dispositioned; §Review Disposition). Realizes §0–§4 of `Doc-6A_Structure_v1.0_FROZEN`. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-6A_Structure_v1.0_FROZEN.md` §0 Document Control · §1 Scope & Partition · §2 Stack & Authority Binding · §3 Cross-Cutting Schema Conventions · §4 Tenancy & RLS Realization Model |
| Authority | `Doc-2 v1.0.3` (the *what*-authority); `Doc-5_Program_Governance_Note_v1.0 §1/§8`; the frozen corpus governs |
| Coins | **Nothing.** Every table/column/state/event/audit-action/POLICY-key bound to a Doc-2 pointer; conventions are physical-realization rules only |
| Templates | Illustrative convention templates use generic placeholders (`<schema>`, `<table>`, `<entity>_id`) — **no module table is authored here** (that is Doc-6B…6K) |

> **Reading rule.** Doc-6A is a metastandard: its content is the **normative realization conventions** every per-module schema document (Doc-6B…6K) MUST follow. It declares *how* to turn a Doc-2 entity into physical PostgreSQL + Prisma; it never declares *which* tables exist (Doc-2 §10) — that is realized per module. SQL/Prisma snippets are **generic convention patterns**, not module schema.

---

## §0 — Document Control, Precedence & Consistency Obligation

### §0.1 Precedence

Doc-6A sits in the Implementation-Contract layer of the corpus source-of-truth hierarchy (governance §3), below the architecture and beside Doc-5:

```
Master System Architecture  →  ADR Compendium  →  Doc-2 · Doc-3  →  Doc-4A (→ Doc-4B…4M)
   →  Implementation Contracts:  Doc-5 (API) · Doc-6 (DB) · Doc-7 (Frontend) · Doc-8 (Tests)
        →  Doc-6A (DB metastandard)  →  Doc-6B…6K (per-module schema)  →  Code
```

On any conflict, the higher rank governs and **Doc-2 is the binding *what*-authority** for everything Doc-6 persists. Doc-6A overrides nothing above it.

### §0.2 The three binding rules (normative)

1. **Realize, never re-decide.** Doc-2 fixed *what* is persisted (FROZEN — §2 aggregates, §3 entity catalog, §4 relationships, §5 state machines, §6 tenancy, §7 permissions, §8 events, §9 audit, §10 blueprint, §11 assumptions). Doc-6 realizes *how*. A Doc-6 document that adds, removes, renames, or re-types a Doc-2 element is **non-conformant** — flag-and-halt.
2. **Reference, never restate.** Every persisted element is bound to its Doc-2 anchor **by pointer**. Doc-6 does not copy the entity catalog; it realizes each entry where Doc-2 declares it (Doc-6x §-per-aggregate).

A Doc-6 document that adds, removes, renames, or re-types a Doc-2 element is **non-conformant** — **escalate as `[ESC-6-*]` via its named channel; never resolve locally (flag-and-halt).**
3. **Consistency, not conformance, to Doc-5.** Doc-6 MUST be consistent with the frozen Doc-5 API surface (every Doc-5x read/list/command persistable). **Doc-5A holds no conformance authority over Doc-6** (governance §8); the cross-check is surfaced as `[ESC-6-API]` only where a Doc-5 surface cannot map to a Doc-2 table.

### §0.3 The two freeze obligations every per-module document inherits

- **Appendix A.** Each Doc-6B…6K passes the `CHK-6-xxx` checklist (§Appendix A, assigned in Pass-3) before freeze.
- **Carried-marker closure.** Each `[ESC-6-*]` clears only via its named additive channel (Doc-2 / Doc-3 patch, human-approved) — never resolved locally.

### §0.4 Realization transport

Accessed via **Prisma** with the `multiSchema` feature (R3b — ratified). The physical database is **one** PostgreSQL database holding **ten schemas** (one per module — §2). No second database; no per-tenant database (multi-tenancy is row-level — §4, Doc-2 §6).

**PostgreSQL major version** (the corpus states "PostgreSQL 15+/Supabase" in the Doc-6A frozen structure §2) is a **Doc-6 program realization choice locked by the Supabase hosting platform — not a Doc-2 binding** (Doc-2 commits to no version; see §2.5 realization-choice attribution). Per-module documents inherit it; they do not re-decide it.

---

## §1 — Scope, Audience & the Doc-6 Program Partition

### §1.1 What Doc-6A governs

The **cross-cutting DB realization conventions** (§3–§12) and the **per-module freeze gate** (Appendix A). Doc-6A authors **no module schema** — every actual table is realized in Doc-6B…6K against these conventions.

### §1.2 Program partition (the 10-schema letter map — binding)

| Doc-6 doc | Schema | Doc-2 source | Owner module |
|---|---|---|---|
| Doc-6B | `core` | Doc-2 §10.1 | M0 Platform Core |
| Doc-6C | `identity` | Doc-2 §10.2 | M1 Identity & Org |
| Doc-6D | `marketplace` | Doc-2 §10.3 | M2 Marketplace |
| Doc-6E | `rfq` | Doc-2 §10.4 | M3 RFQ Engine |
| Doc-6F | `operations` | Doc-2 §10.5 | M4 Business Operations |
| Doc-6G | `trust` | Doc-2 §10.6 | M5 Trust & Verification |
| Doc-6H | `communication` | Doc-2 §10.7 | M6 Communication |
| Doc-6I | `billing` | Doc-2 §10.8 | M7 Monetization |
| Doc-6J | `admin` | Doc-2 §10.9 | M8 Admin Operations |
| Doc-6K | `ai` | Doc-2 §10.10 | M9 AI Layer |

### §1.3 Dependency boundary (binding)

- Each Doc-6x realizes **only its own schema's tables** (Doc-2 §10.x). It MUST NOT author a table in another module's schema.
- Cross-module references are **bare UUID columns** (§3.4, §5.3) — **never a cross-schema foreign key** (Doc-2 §0.3). The owning module's service validates the reference before save; the orphan-scan integrity job reconciles (§5.5).
- The `core` schema (Doc-6B) is consumed by every module (ID, outbox, audit, config — DR-6-CORE). Other documents **reference** `core.*` by pointer; they never re-author it.

### §1.4 Carried dependencies (registered by pointer)

`DR-6-CORE` (M0 owns outbox/audit/id/config) · `DR-6-API` (Doc-5 persistability cross-check) · `DR-6-STATE` (state machines realized as columns + enforcement) · `[ESC-6-SCHEMA]` · `[ESC-6-POLICY]` (incl. the open M1 `identity` namespace) · `[ESC-6-API]`. Full register in §13.

---

## §2 — DB Realization Stack & Authority Binding

### §2.1 Authority binding (normative)

| Concern | Authority | Role |
|---|---|---|
| *What* is persisted (entities, columns, relationships, states, tenancy, events, audit) | **Doc-2 v1.0.3** | **Binding.** Doc-6 realizes; never alters |
| *How* it is persisted (physical schema, Prisma, migrations, indexes, constraints, RLS) | **Doc-6 (this program)** | The realization decisions |
| API surface that the schema must support | **Doc-5 (frozen)** | **Consistency cross-check only** — not conformance (governance §8) |
| Lifecycle/state edges | **Doc-4M** (index) + **Doc-2 §5/§3** | Bound by pointer; realized as enumerated state columns + enforcement (§6, Pass-2) |
| Events / outbox / audit / ID ownership | **Doc-4B** (M0) | Consumed; realized in `core` (Doc-6B) |

### §2.2 Schema-name alignment (R3a — binding)

Physical schema names equal the ten canonical namespaces (Doc-2 §0.3): `core`, `identity`, `marketplace`, `rfq`, `operations`, `trust`, `communication`, `billing`, `admin`, `ai`.

The API route registry explicitly **deferred** this decision so Doc-6 could make it: `Doc-5A_Content_v1.0_Pass10 §B.1` (explanatory text before the route-prefix table) states "the registry binds to the canonical namespace, **not** to physical storage naming, so a later Doc-6 schema-naming decision does not invalidate this registry." That deferral makes the choice **safe** (the frozen API routes stay valid whatever Doc-6 picks); it does **not** itself mandate the choice. Doc-6A **makes** the choice (R3a): physical schema names = the canonical namespaces. The API route prefix and the physical schema name are thereby **bound to coincide by this realization decision** — not by logical necessity; the binding is by canonical namespace, not by string identity.

### §2.3 One Prisma namespace per module (R3b — RATIFIED at freeze)

The Prisma schema declares `multiSchema` with each module's models tagged `@@schema("<namespace>")`. **One Prisma namespace per module** (Board-ratified 2026-06-26; CLAUDE.md §10 deferred-choice closed). Generic convention:

```prisma
// generic convention — NOT a module model
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["core","identity","marketplace","rfq","operations",
              "trust","communication","billing","admin","ai"]
}
generator client { provider = "prisma-client-js"; previewFeatures = ["multiSchema"] } // multiSchema = R3b ratified choice (§2.5)

model <Entity> {
  id  String  @id @db.Uuid           // UUIDv7 from core ID service (§3.2)
  // ...
  @@schema("<namespace>")            // exactly one per module
}
```

### §2.4 No domain element introduced (R2 — binding)

Physical-realization choices (index strategy, trigger-vs-service enforcement, partial-index predicate, Prisma attribute, column physical type) MUST NOT change domain meaning. A realization choice that would alter cardinality, nullability semantics, ownership, or lifecycle declared by Doc-2 is non-conformant.

### §2.5 Realization-choice attribution (binding — disambiguation rule)

Doc-6 introduces no *domain* element (R2), but it **does** make *physical* decisions — that is its job (the *how*). To keep the two unambiguous, every concrete physical specific in this metastandard that is **not** stated by Doc-2 is a **Doc-6 realization choice**, never implied as a Doc-2 binding. These include (non-exhaustive): the PostgreSQL major version (hosting-locked — §0.4); the `multiSchema` Prisma feature + one-namespace-per-module (R3b, Board-ratified); physical column types where Doc-2 names only the logical type (e.g. `char(3)` for an ISO-4217 currency code — §3.6); index/constraint naming patterns (e.g. `<table>_<cols>_live_uq` — §3.5); the RLS active-org mechanism (e.g. a per-transaction GUC — §4.2); trigger-vs-service enforcement placement. A Doc-6 realization choice is binding on Doc-6B…6K (consistency) but carries **no** Doc-2 authority and may be revised by an additive Doc-6 patch without touching the architecture. Anything Doc-2 *does* state (UUIDv7, soft-delete tuple, partial-unique behavior, `NUMERIC`+currency, `organization_id` anchor, no cross-schema FK) is a **Doc-2 binding**, realized verbatim.

---

## §3 — Cross-Cutting Schema Conventions *(authors no table)*

These conventions apply to **every** table realized in Doc-6B…6K, realizing Doc-2 §0.1/§0.2/§0.4.

### §3.1 Identity column (Doc-2 §0.1 — binding)

- Every table has primary key `id` of type **UUIDv7** (`@db.Uuid`), generated by the **M0 Shared-Kernel ID service** (Doc-4B), not by a DB default that bypasses the kernel. Identifiers are immutable and never reused (Invariant #8).
- Prisma/physical convention: `id String @id @db.Uuid`.

### §3.2 Human reference (Doc-2 §0.1 — conditional)

- A `human_ref` column exists **only** where Doc-2 mandates a customer-facing reference (e.g., `ORG-2026-000001`, `RFQ-2026-000123`, `QTN-…`, `INV-…`, `DOC-…`). Format: `TYPE-YEAR-XXXXX`, monotonic, gap-tolerant, **year-scoped per entity type**, never reused.
- Generated by **`core.id_sequences`** (row-locked, concurrency-safe — Doc-2 §0.1; realized in Doc-6B). UUIDv7 remains the authoritative system identifier; `human_ref` is display/lookup only.
- A Doc-6x table that invents a `human_ref` where Doc-2 declares none is non-conformant.

### §3.3 Standard columns (Doc-2 §0.2 — binding tuples)

| Tuple | Columns | Applies to |
|---|---|---|
| Timestamps | `created_at timestamptz NOT NULL`, `updated_at timestamptz NOT NULL` | all tables |
| Actor stamps | `created_by uuid`, `updated_by uuid` (+ domain-specific `*_by` e.g. `approved_by`) | where Doc-2 declares an actor |
| Tenant boundary | `organization_id uuid NOT NULL` | every **tenant-owned** table (Doc-2 §6) |
| Soft delete | `deleted_at timestamptz`, `deleted_by uuid`, `delete_reason text` | every **soft-deletable** table |

- **Never** an `is_deleted` boolean — soft-delete state is the nullability of `deleted_at`.
- Actor columns store the acting `user_id` / `admin_id` / `System` sentinel per the Doc-2 actor model; auto-calculated signals are stamped under the **System** actor (governance firewall — Doc-2 §9 actor_type).

### §3.4 Column-suffix & naming conventions (Doc-2 §0.1–§0.4 — binding)

| Suffix / form | Meaning |
|---|---|
| `_id` | a UUID reference. **Same-schema** `_id` may carry an intra-aggregate FK (§5.2); **cross-module** `_id` is a bare UUID, no FK (§5.3) |
| `_at` | `timestamptz` |
| `_by` | actor reference (UUID or System sentinel) |
| `_jsonb` | a `jsonb` payload (e.g., `payload_jsonb`, `preferences_jsonb`) |
| `_history` | an append-only history/version table |
| (no `_ref` suffix) | cross-module references are **named for the target entity** (`vendor_profile_id`), not suffixed `_ref` (Doc-2 §0.3) |

- Enum values: **lowercase underscored** (`draft`, `pending`, `active`, `soft_deleted`) — Doc-2 §0.2. State/status columns named `state` / `status` / domain-specific (`claim_state`, `visibility`).
- Identifiers are `snake_case` at the physical layer; Prisma model field names map via `@map`/`@@map` where they differ from PG names.

### §3.5 Partial-unique-index rule (Doc-2 §0.2/§10.11 — binding)

Every unique constraint on a **soft-deletable** table is realized as a **partial unique index** scoped to live rows, so a soft-deleted row never blocks a new live one. Generic convention:

```sql
-- generic convention — NOT a module index
CREATE UNIQUE INDEX <table>_<cols>_live_uq
  ON <schema>.<table> (<cols>)
  WHERE deleted_at IS NULL;
```

The partial-unique **behavior** (`WHERE deleted_at IS NULL` on every soft-deletable unique constraint) is a **Doc-2 §0.2/§10.11 binding**; the index-**naming** pattern `<table>_<cols>_live_uq` is a **Doc-6A realization convention** (§2.5).

### §3.6 Multi-currency convention (Doc-2 §0.4 — binding)

Every monetary amount is `NUMERIC` paired with an **explicit adjacent currency column**, default `'BDT'`. No bare-amount money column; no implicit currency. Generic convention: `amount NUMERIC(<p>,<s>) NOT NULL`, `currency char(3) NOT NULL DEFAULT 'BDT'`. The `NUMERIC`+currency+default-BDT requirement is a **Doc-2 §0.4 binding**; the `char(3)` physical type (ISO-4217 codes are 3 chars) and per-field precision/scale are **Doc-6A realization choices** (§2.5; precision/scale chosen per Doc-2 §10.x).

### §3.7 JSONB discipline

`jsonb` columns hold **non-relational metadata / payloads** (e.g., outbox `payload_jsonb`, config values, denormalized snapshots — A-09) only where Doc-2 models a structured-but-non-queried blob. A `jsonb` column MUST NOT be used to smuggle a relationship Doc-2 models as a table/FK (that would evade §5).

---

## §4 — Tenancy & RLS Realization Model *(authors no table)*

Realizes Doc-2 §6 + §10.11. **Authorization lives in the app layer; RLS is the defense-in-depth backstop** (CLAUDE.md §2 — binding). RLS is never the primary authorization model.

### §4.1 Tenancy classes (Doc-2 §6 — binding)

| Class | Realization | RLS posture |
|---|---|---|
| **Tenant-owned** | carries `organization_id NOT NULL` | RLS ON; policy anchors on `organization_id = active org` |
| **Shared / reference** | platform-wide reference data (e.g., categories) | RLS read-open per Doc-2 §6; writes platform-staff only |
| **Platform-owned** | `core.*`, admin/staff tables; no tenant anchor | RLS by platform-staff scope, not org |
| **Derived / projection** | read-models, search projections, `ai.*` cache | RLS mirrors the source aggregate's tenancy; never a source of truth |

### §4.2 The `organization_id` anchor (binding)

Every tenant-owned table carries `organization_id`. The RLS policy restricts rows to the **server-validated active organization** (Invariant #5 — client-supplied org ID never trusted; the active-org claim is set by the app-layer guard, not by request input). Generic convention:

```sql
-- generic convention — NOT a module policy
ALTER TABLE <schema>.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY <table>_tenant_isolation ON <schema>.<table>
  USING (organization_id = current_setting('app.active_org')::uuid);
```

The **principle** — RLS isolates by the server-validated active org, never a client-supplied org ID — is a **Doc-2 §6 / Invariant #5 binding**. The specific **mechanism** shown (an `app.active_org` per-transaction GUC set by the app-layer org-context guard, never from request body/header) is a **Doc-6A realization choice** (§2.5); a per-module document may realize it via any equivalent server-set transaction context.

### §4.3 Materialized grantee-row anchors (Doc-2 §6/§10.4/§10.11 — binding)

Vendor-side / cross-party access **MUST NOT** be expressed as a cross-schema ownership traversal in an RLS policy (Doc-2 §6 prohibits it). Instead it anchors on **materialized rows** maintained by the owning service:

- `rfq_invitation_grantees` — per-organization access rows materialized at RFQ delivery time (Doc-2 §10.4).
- `quotation_visibility` — buyer-side quotation access grants.
- `controlling_organization_id` (on quotations / `delegation_grants`) — explicit party column for vendor-side RLS.
- On **delegation-grant revocation**, the owning service refreshes the materialized grantee rows (Doc-2 §10.11 item 9). Doc-6x realizes the grantee tables + the RLS policies that read them; the refresh is a service obligation realized in code.

### §4.4 Non-disclosure invariant (Invariant #11; Doc-2 §6/§10.4/§10.11 — binding)

A blacklisted/excluded vendor's API responses, counts, analytics, and logs MUST be **byte-equivalent** to a non-matched vendor's — exclusion is indistinguishable from non-match. Realization rules:

- `buyer_vendor_statuses` and `link_suggestions` content is **never** exposed in any vendor-facing surface, view, log, or error (enforced at routing/read — Doc-2 §6).
- A read denied by tenancy/scope collapses uniformly (no side-channel count/error that reveals existence — aligns with the API `NOT_FOUND` collapse).
- The non-disclosure obligation is tested (positive/negative/cross-tenant byte-equivalence) — that **test** is Doc-8's gate, not realized here, but the schema MUST make the test satisfiable (no leaking view/column).

### §4.5 RLS-as-backstop boundary (CLAUDE.md §2 — binding)

The app layer (`src/server/` guards — REPOSITORY_STRUCTURE) performs authorization; RLS catches mistakes. A Doc-6x MUST NOT place business authorization logic (role/permission resolution, delegation evaluation) **inside** an RLS policy as the primary gate — RLS expresses only tenant/grantee row-visibility. Permission resolution is the app layer's via Identity `check_permission` (Doc-4C), the single authorization authority.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent (Architecture Board / DDD / Security / API Governance). 19 anchors verified CORRECT (Doc-2 §0.1/§0.2/§0.3/§0.4/§6/§10.4/§10.11; CLAUDE.md §2/§5/§10; governance §8; Doc-5A Pass10 §B.1; the frozen structure R-set + partition). **No scope leak, no coined domain element** confirmed by reviewer.

| Finding | Sev | Disposition |
|---|---|---|
| **BLOCKER-1** "PostgreSQL 15+" stated as binding — not a Doc-2 commitment | BLOCKER → **MAJOR** (re-severitied: no coined element, no frozen-doc contradiction; the frozen structure §2 itself states "PostgreSQL 15+/Supabase") | **FIXED** — §0.4 reworded: version is a Doc-6 realization choice hosting-locked by Supabase, **not** a Doc-2 binding; new §2.5 attribution rule generalizes this. |
| **MAJOR-1** Doc-5A deferral quote used to *justify* (not just permit) the choice; "coincide by construction" | MAJOR | **FIXED** — §2.2 separates deferral-safety ("makes the choice safe") from the decision ("Doc-6A makes the choice, R3a"); "by construction" → "bound to coincide by this realization decision, not logical necessity." |
| **MAJOR-2** `previewFeatures=["multiSchema"]` unattributed | MAJOR | **ACK-VALID / clarified** — reviewer concluded legitimate ratified R3b choice, no change needed; added inline comment "multiSchema = R3b ratified choice (§2.5)." |
| **MINOR-1** Doc-5A anchor imprecise | MINOR | **FIXED** — cite now "§B.1 (explanatory text before the route-prefix table)." |
| **MINOR-2** `char(3)` currency type not in Doc-2 | MINOR | **ACK-VALID / attributed** — reviewer: legitimate ISO-4217 realization; §3.6 now splits Doc-2 binding (NUMERIC+currency+BDT) from Doc-6A choice (char(3), precision/scale). |
| **MINOR-3** index-naming pattern not in Doc-2 | MINOR | **ACK-VALID / attributed** — reviewer: "exactly the convention Doc-6A should define"; §3.5 now splits Doc-2 behavior from Doc-6A naming convention. |
| **NITPICK-1** "flag-and-halt" wording vs frozen "escalate as [ESC-6-*]" | NIT | **FIXED** — §0.2 rule now "escalate as `[ESC-6-*]` via its named channel; never resolve locally (flag-and-halt)." |
| **NITPICK-2** "coincide by construction" | NIT | **FIXED** — folded into MAJOR-1. |

**Root-cause fix:** new **§2.5 Realization-choice attribution** — every physical specific not stated by Doc-2 (version, `char(3)`, index names, RLS GUC, `multiSchema`) is explicitly a Doc-6 realization choice (binding on Doc-6B…6K, no Doc-2 authority), vs. Doc-2 bindings realized verbatim. Resolves BLOCKER-1 / MINOR-2 / MINOR-3 class at the source.

---

*End of Doc-6A Content Pass-1 (§0–§4) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the frozen structure; coins nothing; every convention bound to a Doc-2 pointer or attributed as a §2.5 realization choice. Generic templates only — no module table authored. Next: Pass-2 (§5–§9 — integrity/constraints · immutability/versioning · outbox · audit · POLICY/seed).*
