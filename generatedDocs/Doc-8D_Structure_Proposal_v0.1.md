# Doc-8D — Persistence, Migration & RLS Conformance Suite — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-8D artifact. Next: Independent Hard Review (Board) → Structure Patch → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-8D artifact) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8D is the **Persistence / Migration / RLS conformance suite** — the **defining suite** (Doc-8A allocation) for the **RLS positive/negative/cross-tenant byte-equivalence gate** (`CHK-8-024`, invariant #11) and **immutability** (`CHK-8-022`, invariant #8). Consumes the frozen **Doc-8B harness** by pointer |
| Document | **Doc-8D** — realizes `Doc-8A §6` + Appendix A **Band C** (`CHK-8-020…025`) as the suite that proves the realized Doc-6 schema conforms to the corpus |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §6` + Band C. **Oracle (the *what* under test):** the realized **Doc-6 schema** (`Doc-6B core` · `Doc-6C identity` · `Doc-6D marketplace` FROZEN; `Doc-6E…6K` as they freeze) + the conventions it realizes — `Doc-6A R5/§5` (constraints/partial-unique) · `R8/§4` (RLS) · `§6` (immutability) · `R9` (multi-currency) · `§11` (migration); `Doc-2 §6` (tenancy) / §0.4 (currency); **Invariant #11** (non-disclosure byte-equivalence) / **#8** (immutability). Consumes `Doc-8B` (runner/fixtures/seeding/clock-ID/mock-boundary/CI-gate, incl. the **schema-reset / DB-role-switching** path) by pointer |
| Authority | `Doc-8A` governs; the frozen Doc-6 schema + Doc-2 + CLAUDE.md §2 are the oracle. Doc-8D **coins nothing** and **asserts only the realized-schema + corpus-declared behavior** — a red test = code/schema defect, or `[ESC-8-CORPUS]` (a genuine corpus defect — never weaken the assertion) |
| Contains | Structure only — the ratified decisions (D1 schema-inventory-driven; D2 the mandatory RLS byte-equivalence band; D3 execution-readiness per frozen schema), the suite section map §0–§7, carried items. **No test code, no per-table cases** — those land in the content passes |
| Audience | Architecture Board · Security Architect (RLS) · DBA · QA/Test lead · Doc-8D content authors |
| Program note | Doc-8D introduces **no table, column, constraint, RLS policy, or expected value**. It asserts the frozen Doc-6 schema. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at the owning Doc-6x) — never coin, never relax |

> **Governing rule:** Doc-8D realizes, never re-decides. The Doc-6 schema is FROZEN; Doc-8D realizes *how each table/constraint/RLS-policy is proven conformant*. Every assertion is an oracle-by-pointer into the frozen Doc-6x DDL / Doc-2 / Doc-6A convention; no assertion stricter or looser than the realized schema (Doc-8A §3.3).

---

## Decisions proposed for ratification at structure freeze

- **D1 — Schema-inventory-driven (table-driven; provable coverage — the Doc-8C C1 precedent).** Doc-8D is not hand-written per table. A **schema inventory** is **derived from the frozen Doc-6x realizations** (`Doc-6B/6C/6D` now; `6E…6K` as they freeze) — every table, its standard columns, constraints (PK/unique/partial-unique/CHECK), monetary columns, immutability triggers, RLS policies, and cross-module bare-UUID references. Each applicable Band-C check runs **over every inventory row**. The **completeness check asserts inventory ≡ the frozen Doc-6 DDL** (no under/over-coverage). Coverage is provable against the frozen schema, never internally-consistent-only.
- **D2 — The RLS positive/negative/cross-tenant byte-equivalence band is MANDATORY (`DR-8-RLS`; the defining check for invariant #11).** Per the frozen Doc-8A allocation table, Doc-8D **defines** the canonical byte-equivalence assertion (`CHK-8-024`); Doc-8C composes it at the contract surface, Doc-8G at the UI. The band asserts all four: **positive** (authorized actor under the active org sees what the contract grants), **negative** (unauthorized blocked at the **app layer AND the RLS backstop** — both), **cross-tenant** (org A's DB role can never read/list/count org B's tenant-owned rows), and **non-disclosure byte-equivalence** (a blacklisted/excluded vendor's responses/counts/analytics/notifications/logs/errors are **byte-equivalent** to a non-matched vendor's). Testing the **RLS backstop** specifically requires the **DB-role-switching** harness path (Doc-8B §3 schema-reset opt-out) — assert RLS denies even when the app layer is bypassed.
- **D3 — Execution-readiness per frozen schema (the Doc-8C/8E precedent).** Schema-constraint / immutability / RLS conformance for the **frozen** schemas (`core`/`identity`/`marketplace`) is **execution-ready now** (the DDL exists). Facets whose owning schema is **not yet frozen** are **execution-deferred**: notably the **buyer-private CRM byte-equivalence** (`buyer_vendor_statuses` is M4 / `Doc-6F operations`, NOT FROZEN) — distinct from the **marketplace visibility** non-disclosure (`Doc-6D` publish-state, ready now). Each inventory row flagged ready/deferred; **none silently dropped**.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8D's place (below Doc-8A; consumes Doc-8B by pointer incl. the DB-role/schema-reset path; the **defining suite** for #8/#11 that 8C/8E/8G reference/compose); realize-never-redecide; oracle = the frozen Doc-6 schema + Doc-2 + CLAUDE.md §2; freeze obligation — pass Appendix A **Band C** (+ Band A) and clear any `[ESC-8-*]`; never weaken (`[ESC-8-CORPUS]`).
- **Dependencies:** `Doc-8A §0/§6/Appendix A`; `Doc-8B` (harness, schema-reset path); `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Schema/RLS Inventory
- **Purpose:** define the **schema inventory** (D1) — every frozen Doc-6x table with: table name + schema (namespace), standard columns, constraints (PK/unique/partial-unique-`WHERE deleted_at IS NULL`/CHECK), monetary columns (`NUMERIC`+currency), immutability triggers, soft-delete tuple, RLS policies (tenancy class: tenant-owned / shared / platform-owned / derived), cross-module bare-UUID refs, execution-readiness (D3). Derived from the frozen Doc-6x DDL (reference-never-restate); cross-checked against the `generated-contracts-registry/` Prisma output once code exists. The completeness check asserts inventory ≡ the frozen DDL.
- **Dependencies:** `Doc-6B/6C/6D` (+ `6E…6K`); `Doc-6A §3` (standard columns). **Detail:** inventory schema + source-of-truth anchor.

## §2 — Schema-Constraint Conformance *(`CHK-8-020/021`)*
- **Purpose:** assert each table against its frozen DDL: standard columns present (`id UUIDv7`, timestamp/actor/tenant/soft-delete tuples — `Doc-6A §3`); **partial-unique `... WHERE deleted_at IS NULL`** on every soft-deletable unique constraint (`Doc-6A R5/§5` — never an `is_deleted` boolean); CHECK constraints for enumerated state/currency (`Doc-6A §5`); **multi-currency** (`CHK-8-021`) — every monetary amount is `NUMERIC` with an explicit adjacent currency column, default `'BDT'` (`Doc-6A R9`/`Doc-2 §0.4`). A column/constraint diverging from the frozen DDL is a defect.
- **Dependencies:** `Doc-6A §3/§5/R5/R9`; `Doc-2 §0.4`. **Detail:** constraint assertion convention.

## §3 — Immutability Conformance *(`CHK-8-022`; defining for invariant #8)*
- **Purpose:** **8E references this** — assert Invariant #8 at the data layer (`Doc-6A §6`): soft-deleted rows excluded from default/routing/matching/search queries; **versioned tables immutable once a binding state is reached** (a write to a frozen version rejected by the trigger; a revision is a new row); **append-only history** tables reject update/delete; IDs never reused; **column-scoped immutability** (the Doc-6B `CR4′` / Doc-6D `spec_documents` trigger pattern — business payload immutable, operational fields bounded). The **sole enumerated exception** — the regenerable `ai.*` cache permits TTL hard-delete (`Doc-5K R7`; `Doc-6K` when frozen) — asserted as legitimately destructible; no other authoritative table is. Execution-ready now for `core`/`identity`/`marketplace` (frozen triggers).
- **Dependencies:** `Doc-6A §6`; Invariant #8; `Doc-6B CR4′`/`Doc-6D spec_documents`; `Doc-5K R7`. **Detail:** immutability assertion; #8 defining; ai-cache exception.

## §4 — Migration Conformance *(`CHK-8-023`)*
- **Purpose:** assert the migration discipline Doc-6 delegates to Doc-8 (`Doc-6A §11`): **forward-only** sequencing; **expand-contract / non-destructive on authoritative tables** (a migration dropping/destructively-rewriting an authoritative column fails — Invariant #8; destructive permitted **only** on the `ai.*` cache); **seed-migration** verification (the registered `Doc-3 §12` POLICY keys + the Doc-2 §7 / per-module role/permission seeds land — `Doc-6B` 18 `core.*`, `Doc-6C` `identity.*` + 45-slug/4-bundle, `Doc-6D` `marketplace.*`); **Prisma-codegen integrity** (the `generated-contracts-registry/` client current, never hand-edited — CLAUDE.md §10). Execution against the realized migration sequence (deferred until the migrations exist as code; the discipline + targets are authored now).
- **Dependencies:** `Doc-6A §11`; `Doc-3 §12`; `Doc-2 §7`; CLAUDE.md §10. **Detail:** migration assertion convention.

## §5 — RLS Positive/Negative/Cross-Tenant Byte-Equivalence Gate *(`CHK-8-024`; MANDATORY; defining for invariant #11)*
- **Purpose:** the load-bearing security band (D2; `Doc-6A R8/§4`). **8E/8C/8G reference/compose this.** Assert, using the Doc-8B DB-role-switching path:
  - **Positive** — an authorized actor under the active org sees exactly what the contract grants (per tenancy class: tenant-owned anchored on `organization_id`; materialized grantee-row anchors `rfq_invitation_grantees`/`quotation_visibility`; tri-actor Public/User/Admin — `Doc-6D`).
  - **Negative** — an unauthorized actor blocked at the **app layer AND the RLS backstop** (both; RLS asserted by bypassing the app and querying as the tenant DB role — CLAUDE.md §2 RLS-as-backstop).
  - **Cross-tenant** — org A's DB role can never read/list/count org B's tenant-owned rows (the ≥2-org fixture; no cross-schema ownership traversal in any RLS policy — `Doc-6A §4`).
  - **Non-disclosure byte-equivalence** (Invariant #11) — excluded ≡ non-matched, **byte-identical** responses/counts/analytics/notifications/logs/errors. **Two facets, distinct readiness (D3):** **marketplace visibility** (publish-state, `Doc-6D` — ready now) and **buyer-private CRM exclusion** (`buyer_vendor_statuses`, M4/`Doc-6F` — execution-deferred until 6F freezes). Both authored now.
- **Dependencies:** `Doc-6A R8/§4`; `Doc-2 §6`; Invariant #11; `Doc-6C`/`Doc-6D` (RLS realizations); `Doc-6F` (buyer-private — D3 deferred); `Doc-8B §3` (DB-role path). **Detail:** the four RLS assertions; two byte-equivalence facets; mandatory band.

## §6 — Cross-Module Integrity Conformance *(`CHK-8-025`)*
- **Purpose:** assert the **no-cross-schema-FK** rule (`Doc-6A §5`): cross-module references are bare UUID columns (named for the target entity, `_id` not `_ref`), validated by the owning module's service, reconciled by the orphan-scan integrity job; a schema with a cross-module foreign key, or a cross-schema RLS ownership traversal, is a defect. Intra-schema FKs within an aggregate boundary permitted. (E.g. `Doc-6C delegation_grants` dual-party M2 bare-UUID; `Doc-6D` cross-module refs.)
- **Dependencies:** `Doc-6A §5`; `Doc-2 §0.3`. **Detail:** cross-module-by-UUID assertion.

## §7 — Conformance & Carried Items
- **Purpose:** Doc-8D's self-check against Appendix A **Bands A + C**; the **coverage attestation** (inventory ≡ frozen Doc-6 DDL; every applicable check per table; readiness flagged per D3, none dropped); the carried register (`DR-8-RLS` **satisfied** — Doc-8D is the byte-equivalence defining suite; `DR-8-HARNESS` consumed; `[ESC-8-CORPUS]` never-weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/C); `Doc-6B/6C/6D`. **Detail:** attestation + coverage + readiness register.

---

## Open Carried Items

| ID | Item | Doc-8D handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8D consumes the Doc-8B harness (incl. DB-role/schema-reset path) | By pointer; re-authors nothing | **Consumed** |
| **DR-8-RLS** | The mandatory RLS positive/negative/cross-tenant byte-equivalence band | Doc-8D **is** the defining suite (§5, `CHK-8-024`); 8C/8E/8G compose | **Satisfied here** |
| **D3 execution-deferred set** | Facets whose owning Doc-6x is not yet frozen (notably buyer-private CRM byte-equivalence → `Doc-6F`; migration code; `6E…6K` schemas) | Authored now (oracle = the invariant/convention, frozen), pointer-bound, flagged deferred; scheduled as the owning Doc-6x freezes; no silent omission | **No (tracked)** |
| `[ESC-8-CORPUS]` | A test reveals a genuine schema/corpus defect | Flag-and-halt → Board additive patch at the owning Doc-6x; test never weakened | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | Untestable surface / unregistered POLICY key | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C; domain/invariant = 8E [8D defines #8/#11, 8E references]; integration/event = 8F; frontend/e2e = 8G) · coining any table/column/constraint/RLS-policy/expected value · changing any frozen Doc-6/Doc-2 declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · asserting contract-surface actor-scope as the primary check (that is 8C; 8D asserts the **RLS backstop**) · the implementation Code/migrations under test (downstream; D3 execution-deferred).

---

## Provenance & next steps

- **Provenance:** first Doc-8D artifact. Realizes `Doc-8A §6 + Band C`; consumes `Doc-8B`; oracle = the frozen Doc-6 schema (`6B/6C/6D`) + Doc-2 + CLAUDE.md §2. No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. D1 (schema-inventory-driven), D2 (mandatory RLS byte-equivalence band), D3 (execution-readiness per frozen schema); section map §0–§7; carried items registered.
- **Next in the lifecycle (Board loop):** Independent Hard Review → Structure Patch → short re-review → Structure Freeze Audit → `Doc-8D_Structure_v1.0_FROZEN` → Doc-8D content passes. Oracle-rich now (3 schemas frozen incl. the marketplace public/anonymous + first-org-anchor RLS); the buyer-private CRM byte-equivalence facet awaits `Doc-6F`.

*End of Doc-8D Canonical Structure **Proposal v0.1** — structure only. On any conflict, the frozen Doc-6 schema + Doc-2 + Doc-8A win; flag-and-halt — never weaken an assertion. Doc-8D is the defining suite for the RLS byte-equivalence gate (#11) + immutability (#8); schema-inventory-driven; consumes the Doc-8B harness; coins nothing. Next: Independent Hard Review.*
