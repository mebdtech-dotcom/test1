# Doc-8D — Persistence, Migration & RLS Conformance Suite — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-8D_Structure_Proposal_v0.1` + `Doc-8D_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8D = the **defining suite** (Doc-8A allocation) for the RLS positive/negative/cross-tenant byte-equivalence gate (`CHK-8-024`, invariant #11) + immutability (`CHK-8-022`, invariant #8). Consumes the frozen **Doc-8B harness** by pointer |
| Document | **Doc-8D** — realizes `Doc-8A §6` + Appendix A **Band C** (`CHK-8-020…025`) as the suite proving the realized Doc-6 schema conforms |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §6` + Band C. **Oracle:** the realized Doc-6 schema (`Doc-6B core` · `Doc-6C identity` · `Doc-6D marketplace` FROZEN; `6E…6K` as they freeze) + `Doc-6A R5/§5/R8/§4/§6/R9/§11`; `Doc-2 §6/§0.4`; Invariant #8/#11. Consumes `Doc-8B` (incl. the DB-role/schema-reset path) by pointer |
| Authority | `Doc-8A` governs; the frozen Doc-6 schema + Doc-2 + CLAUDE.md §2 are the oracle. Doc-8D **coins nothing** — a red test = code/schema defect, or `[ESC-8-CORPUS]` (never weaken) |
| Contains | Structure only — D1 (schema-inventory-driven) + D2 (mandatory RLS byte-equivalence band) + D3 (execution-readiness), §0–§7, carried items. **No test code** — content passes realize the conventions |
| Program note | Doc-8D introduces **no table, column, constraint, RLS policy, or expected value**. On any gap: flag-and-halt → `[ESC-8-CORPUS]` (Board, additive patch at the owning Doc-6x) — never coin, never relax |

> **Governing rule:** realize, never re-decide. The Doc-6 schema is FROZEN; Doc-8D realizes *how each table/constraint/RLS-policy is proven conformant*. Every assertion is an oracle-by-pointer into the frozen Doc-6x DDL / Doc-2 / Doc-6A convention; no assertion stricter or looser than the realized schema (Doc-8A §3.3).

---

## Ratified decisions

- **D1 — Schema-inventory-driven (table-driven; provable coverage — the Doc-8C C1 precedent).** A **schema inventory** is **derived from the frozen Doc-6x realizations** (`Doc-6B/6C/6D`; `6E…6K` as they freeze) — every table, standard columns, constraints (PK/unique/partial-unique/CHECK), monetary columns, immutability triggers, RLS policies (tenancy class), cross-module bare-UUID refs, execution-readiness. Each applicable Band-C check runs over every row; the **completeness check asserts inventory ≡ the frozen Doc-6 DDL** (cross-checked against the `generated-contracts-registry/` Prisma output once code exists). Coverage provable against the frozen schema.
- **D2 — The RLS positive/negative/cross-tenant byte-equivalence band is MANDATORY (`DR-8-RLS`; defining for invariant #11).** Doc-8D **defines** the canonical byte-equivalence assertion (`CHK-8-024`); 8C composes at the contract surface, 8G at the UI, 8F at events. **8D's defining assertion is row/query-result byte-equivalence at the DB** (excluded vendor's RLS-governed SELECT/COUNT returns byte-identical result sets to a non-matched vendor's); the **canonical criterion (excluded ≡ non-matched) is single-sourced here** and applied per layer by composers. Testing the RLS **backstop** uses the **DB-role-switching** path (Doc-8B §3) — RLS denies when the app layer is bypassed.
- **D3 — Execution-readiness per frozen schema.** Schema-constraint / immutability / RLS conformance for `core`/`identity`/`marketplace` is **execution-ready now**. **Execution-deferred** (oracle frozen, owning schema pending): **grantee-row RLS** (`rfq_invitation_grantees`/`quotation_visibility` + quotation `controlling_organization_id`, M3/`Doc-6E`), **buyer-private CRM byte-equivalence** (`buyer_vendor_statuses`, M4/`Doc-6F`), and `6E…6K` schemas + migration code. Each flagged; **none silently dropped**.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8D's place (below Doc-8A; consumes Doc-8B incl. the DB-role/schema-reset path; the defining suite for #8/#11 that 8C/8E/8G reference/compose); realize-never-redecide; oracle = the frozen Doc-6 schema + Doc-2 + CLAUDE.md §2; freeze obligation — pass Appendix A **Band C** (+ Band A); never weaken (`[ESC-8-CORPUS]`).
- **Dependencies:** `Doc-8A §0/§6/Appendix A`; `Doc-8B`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Schema/RLS Inventory
- **Purpose:** the **schema inventory** (D1) — every frozen Doc-6x table with: table+namespace, standard columns, constraints (PK/unique/partial-unique-`WHERE deleted_at IS NULL`/CHECK), monetary columns (`NUMERIC`+currency), immutability triggers, soft-delete tuple, RLS policies (tenancy class: tenant-owned / shared / platform-owned / derived), cross-module bare-UUID refs, execution-readiness (D3). Derived from the frozen Doc-6x DDL; completeness check asserts inventory ≡ the frozen DDL.
- **Dependencies:** `Doc-6B/6C/6D` (+ `6E…6K`); `Doc-6A §3`. **Detail:** inventory schema + source-of-truth anchor.

## §2 — Schema-Constraint Conformance *(`CHK-8-020/021`)*
- **Purpose:** assert each table against its frozen DDL: standard columns (`id UUIDv7`, timestamp/actor/tenant/soft-delete tuples — `Doc-6A §3`); **partial-unique `... WHERE deleted_at IS NULL`** on every soft-deletable unique constraint (`Doc-6A R5/§5`, never `is_deleted`); CHECK constraints for enumerated state/currency (`Doc-6A §5`); **multi-currency** (`CHK-8-021`) — every monetary amount `NUMERIC` + explicit currency column, default `'BDT'` (`Doc-6A R9`/`Doc-2 §0.4`).
- **Dependencies:** `Doc-6A §3/§5/R5/R9`; `Doc-2 §0.4`. **Detail:** constraint assertion convention.

## §3 — Immutability Conformance *(`CHK-8-022`; defining for invariant #8)*
- **Purpose:** **8E references this** — assert Invariant #8 (`Doc-6A §6`): soft-deleted rows excluded from default/routing/matching/search; versioned tables immutable once a binding state is reached (write to a frozen version rejected by the trigger; revision = new row); append-only history rejects update/delete; IDs never reused; **column-scoped immutability** (the `Doc-6B CR4′` / `Doc-6D spec_documents` pattern). **Sole enumerated exception** — the `ai.*` cache TTL hard-delete (`Doc-5K R7`; `Doc-6K`). Execution-ready now for `core`/`identity`/`marketplace`.
- **Dependencies:** `Doc-6A §6`; Invariant #8; `Doc-6B CR4′`/`Doc-6D spec_documents`; `Doc-5K R7`. **Detail:** immutability assertion; #8 defining; ai-cache exception.

## §4 — Migration Conformance *(`CHK-8-023`)*
- **Purpose:** assert the migration discipline (`Doc-6A §11`): forward-only; expand-contract / non-destructive on authoritative tables (destructive only on the `ai.*` cache); seed-migration verification (registered `Doc-3 §12` POLICY keys + per-module role/permission seeds — `Doc-6B` 18 `core.*`, `Doc-6C` `identity.*`+45-slug/4-bundle, `Doc-6D` `marketplace.*`); Prisma-codegen integrity (`generated-contracts-registry/`, never hand-edited — CLAUDE.md §10). Execution against the realized migration sequence — deferred until the migrations exist as code (discipline + targets authored now).
- **Dependencies:** `Doc-6A §11`; `Doc-3 §12`; `Doc-2 §7`; CLAUDE.md §10. **Detail:** migration assertion convention.

## §5 — RLS Positive/Negative/Cross-Tenant Byte-Equivalence Gate *(`CHK-8-024`; MANDATORY; defining for invariant #11)*
- **Purpose:** the load-bearing security band (D2; `Doc-6A R8/§4`). **8E/8C/8G reference/compose.** Assert via the Doc-8B DB-role-switching path:
  - **Positive** — an authorized actor under the active org sees what the contract grants (tenant-owned anchored on `organization_id`; tri-actor Public/User/Admin — `Doc-6D`). *(Grantee-row anchors `rfq_invitation_grantees`/`quotation_visibility` + `controlling_organization_id` → M3/`Doc-6E`, **execution-deferred** — D3.)*
  - **Negative** — **8D asserts the RLS backstop denial** (query as the tenant DB role with the app layer bypassed; RLS must deny — CLAUDE.md §2). The **app-layer denial is Doc-8C's** actor-scope (the §8 seam, cross-ref); "both layers deny" = the system requirement, each owned.
  - **Cross-tenant** — org A's DB role can never read/list/count org B's tenant-owned rows (≥2-org fixture; no cross-schema ownership traversal in any RLS policy — `Doc-6A §4`).
  - **Non-disclosure byte-equivalence** (Invariant #11) — **8D's defining assertion = row/query-result byte-equivalence** (excluded vendor's RLS-governed SELECT/COUNT byte-identical to a non-matched vendor's). **Canonical criterion single-sourced here**; cross-layer observables composed: **8C** (contract responses + list counts), **8F** (no distinguishing notification/event), **8G** (UI). **Two facets, distinct readiness (D3):** **marketplace visibility** (publish-state, `Doc-6D` — ready) vs **buyer-private CRM exclusion** (`buyer_vendor_statuses`, M4/`Doc-6F` — deferred). Both authored now.
- **Dependencies:** `Doc-6A R8/§4`; `Doc-2 §6`; Invariant #11; `Doc-6C`/`Doc-6D` (RLS); `Doc-6E`/`Doc-6F` (D3 deferred); `Doc-8B §3` (DB-role path); Doc-8C §8 seam. **Detail:** four RLS assertions; data-layer byte-equivalence + per-layer composition; mandatory band.

## §6 — Cross-Module Integrity Conformance *(`CHK-8-025`)*
- **Purpose:** assert the **no-cross-schema-FK** rule (`Doc-6A §5`): cross-module references are bare UUID columns (`_id`, not `_ref`), service-validated, orphan-scan-reconciled; a cross-module FK or a cross-schema RLS ownership traversal is a defect; intra-schema FKs within an aggregate boundary permitted. (E.g. `Doc-6C delegation_grants` dual-party M2 bare-UUID; `Doc-6D` cross-module refs.)
- **Dependencies:** `Doc-6A §5`; `Doc-2 §0.3`. **Detail:** cross-module-by-UUID assertion.

## §7 — Conformance & Carried Items
- **Purpose:** self-check against Appendix A **Bands A + C**; **coverage attestation** (inventory ≡ frozen Doc-6 DDL; every applicable check per table; readiness flagged per D3, none dropped); carried register (`DR-8-RLS` **satisfied** — 8D is the byte-equivalence defining suite; `DR-8-HARNESS` consumed; `[ESC-8-CORPUS]` never-weaken; `[ESC-8-API]`/`[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/C); `Doc-6B/6C/6D`. **Detail:** attestation + coverage + readiness register.

---

## Open Carried Items

| ID | Item | Doc-8D handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8D consumes the Doc-8B harness (incl. DB-role/schema-reset path) | By pointer; re-authors nothing | **Consumed** |
| **DR-8-RLS** | The mandatory RLS positive/negative/cross-tenant byte-equivalence band | Doc-8D **is** the defining suite (§5, `CHK-8-024`); 8C/8E/8G compose | **Satisfied here** |
| **D3 execution-deferred set** | Grantee RLS (`Doc-6E`); buyer-private byte-equivalence (`Doc-6F`); `6E…6K`; migration code | Authored now (oracle frozen), pointer-bound, flagged deferred; scheduled as the owning Doc-6x freezes; no silent omission | **No (tracked)** |
| `[ESC-8-CORPUS]` | A test reveals a genuine schema/corpus defect | Flag-and-halt → Board additive patch at the owning Doc-6x; test never weakened | **Per-content: possible** |
| `[ESC-8-API]` / `[ESC-8-POLICY]` | Untestable surface / unregistered POLICY key | By pointer; named channel; never local | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines' **primary** assertions (contract = 8C; domain/invariant = 8E [8D defines #8/#11, 8E references]; integration/event = 8F; frontend/e2e = 8G) · coining any table/column/constraint/RLS-policy/expected value · changing any frozen Doc-6/Doc-2 declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · asserting contract-surface actor-scope as the primary check (8C; 8D asserts the RLS backstop) · asserting cross-layer observables (contract/comms/UI byte-equivalence — composed by 8C/8F/8G) · the implementation Code/migrations under test (downstream; D3 deferred).

---

## Provenance & status

- **Provenance:** first Doc-8D artifact, structure-frozen. Realizes `Doc-8A §6 + Band C`; consumes `Doc-8B`; oracle = the frozen Doc-6 schema (`6B/6C/6D`) + Doc-2 + CLAUDE.md §2. Independent Hard Review (1 MAJOR + 2 MINOR; 1 REJECTED) + Structure Patch + short re-review + Structure Freeze Audit PASS. No frozen document edited; nothing coined.
- **Status:** **FROZEN v1.0** — structure only. D1 (schema-inventory-driven), D2 (mandatory RLS byte-equivalence band, data-layer scope + per-layer composition), D3 (execution-readiness); section map §0–§7.
- **Next:** Doc-8D content passes, each through the Board loop.

*End of Doc-8D Canonical Structure **v1.0 FROZEN**. On any conflict, the frozen Doc-6 schema + Doc-2 + Doc-8A win; flag-and-halt — never weaken an assertion. Doc-8D is the defining suite for the RLS byte-equivalence gate (#11) + immutability (#8); schema-inventory-driven; consumes the Doc-8B harness; coins nothing.*
