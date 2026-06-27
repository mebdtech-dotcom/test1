# FLAG-AND-HALT — `ESC-W0-MIGRATE-SCHEMAS` v1.0

| Field | Value |
|---|---|
| **Type** | FLAG-AND-HALT escalation (Raise ≠ Accept — CLAUDE.md §13) |
| **Raised by** | Wave 0 execution, WP-0.5 [W0-DB-001] |
| **Date** | 2026-06-27 |
| **Severity** | BLOCKER (gates the Wave 0 Exit Gate's "10 schemas migrate clean" clause) |
| **Status** | **RESOLVED — Board ruled R-a (2026-06-27).** Idempotent baseline migration authored; 10-schema probe enabled (harness/CI); Exit-Gate clause closed. |
| **Authority** | CLAUDE.md §7 (Authority Order), §8 (architecture-affecting → human approval), §11 (Flag-and-Halt); Build_Roadmap_v1.0.md §0 conflict rule |
| **Disposition rule** | Do **not** resolve locally. Wave 0 proceeds on all other items; the schema-creation step + its dependent assertions are parked until ruled. |

---

## 1. The conflict (cite both sources)

**Source A — the Wave 0 Exit Gate.** `Build_Roadmap_v1.0.md` §2 (Wave 0 block) states, verbatim:

> "repo green — skeleton compiles, **10 schemas migrate clean**, harness runs, CI merge-gate active."

and §9 (Milestone 1) restates the same condition ("…10 schemas migrate…"). This reads as: a
migration that creates the 10 module namespaces must apply cleanly at Wave 0.

**Source B — per-module migration ownership.** `Doc-6A_Content_v1.0_Pass3.md` §11.1 (binding, R10):

> "Each module **owns its schema's migrations** (One Module, One Owner); a migration touches **only
> its own schema** — never another module's tables."

And each per-module DB doc (Doc-6B…6K) places its own `CREATE SCHEMA <name>` as step 1 of *that
module's* first migration; only **`core` (Doc-6B)** and **`identity` (Doc-6C)** are frozen so far
(`Doc-8B_SERIES_FROZEN_v1.0.md`: *"Schema as of freeze: core (6B) + identity (6C); further schemas
attach as Doc-6D…6K freeze"*). There is therefore **no frozen migration at Wave 0 that creates
`marketplace…ai`.**

**The false-pass trap.** Prisma's `prisma migrate` emits DDL only for namespaces that carry a model
(`@@schema`). The Wave 0 schema has **zero models** (correct — spine only). So an auto-generated
migration is **empty**, and `prisma migrate deploy` would report success having created **zero**
schemas — the Exit Gate would pass *vacuously*. Any check that asserts "10 schemas exist" would then
fail, or be omitted (masking the gap).

## 2. Why this is escalated, not resolved locally

Authoring a `CREATE SCHEMA` migration at Wave 0 is a **cross-wave migration-sequencing decision**:
it pre-creates namespaces that the frozen corpus assigns to each module's own first migration
(Waves 2+). That is architecture-adjacent (CLAUDE.md §8 — "architecture-affecting changes require
human approval"). Per the Build Roadmap conflict rule (FLAG-AND-HALT) and CLAUDE.md §11, the
execution layer must **cite both sources and escalate** — never resolve locally.

## 3. Options for the Board (recommended, not decided here)

- **(R-a) Idempotent baseline migration — RECOMMENDED.** Author one forward-only, idempotent
  migration: `CREATE SCHEMA IF NOT EXISTS <ns>;` for the 10 **already-frozen** namespace names
  (the names are fixed in the `datasource.schemas` list — Doc-6A R3b; this coins nothing). `IF NOT
  EXISTS` keeps each module's later `CREATE SCHEMA` a safe no-op, so no Doc-6B…6K migration is
  contradicted. This satisfies the Exit Gate literally and lets the Doc-8B ephemeral test DB attach
  all namespaces. Residual: a *sequencing* deviation (schemas exist before their module's wave),
  mitigated by idempotency.
- **(R-b) Defer schema creation to per-module migrations.** Wave 0 creates **no** schemas; "10
  schemas migrate clean" is read as "the `multiSchema` config validates and the migration runner is
  wired," with actual creation deferred to each module's Wave-2+ migration. Matches Doc-6 literally;
  makes the Exit-Gate phrase aspirational and requires a one-line Build-Roadmap clarification patch.

## 4. What is parked until the ruling

- WP-0.5: the `CREATE SCHEMA` migration under `prisma/migrations/` (the config, generator
  relocation, `prisma validate`, and the gitignored client regeneration **proceed**; only the
  migration is held).
- WP-0.9: the harness smoke assertion that probes `information_schema.schemata` for the 10 names.
- WP-0.10: the CI `db:migrate` + 10-schema-probe gate.
- Wave 0 Exit Gate: the **"10 schemas migrate clean"** clause only.

All other Wave 0 work (skeleton, harness foundation, CI merge-gate, lint, secrets) is unaffected.

## 5. Requested action

A human-approved **additive patch** ruling **R-a** or **R-b** (never an edit to a frozen document).
On R-a: WP-0.5 authors the idempotent baseline migration and WP-0.9/0.10 enable the probe. On R-b:
the Build Roadmap receives a one-line additive clarification and the probe is dropped from Wave 0.

---

## 6. Resolution (Board ruling — R-a, 2026-06-27)

The Board approved **R-a**. Realized:
- `prisma/migrations/00000000000000_init_schemas/migration.sql` — forward-only, idempotent
  `CREATE SCHEMA IF NOT EXISTS` for the 10 frozen namespaces (coins no tables).
- `scripts/check-schemas.mjs` — the 10-schema probe (asserts all 10 exist after `migrate deploy`).
- CI unit job (`.github/workflows/ci.yml`) runs `db:migrate` → the probe (no longer parked).
- Verified locally against Postgres 16: `migrate deploy` exit 0; exactly 10 schemas present;
  re-apply idempotent ("No pending migrations"); probe fails (exit 1) if a namespace is dropped.

The Exit-Gate clause "10 schemas migrate clean" is **CLOSED**.

---

*Raised under Raise ≠ Accept (CLAUDE.md §13): a claim with a severity, adjudicated by the presiding
authority (Board, §7). Ruled R-a; resolved by additive realization (no frozen document edited).*
