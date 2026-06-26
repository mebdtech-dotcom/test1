# Doc-8D — Content Pass-1 (§0–§3) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8D_Content_v1.0_Pass1.md` (§0–§3) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board · Security Architect |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- Table counts — **verified**: `Doc-6B core` = **5**, `Doc-6C identity` = **9**, `Doc-6D marketplace` = **21** → **35 ready** (matches the frozen manifests).
- `Doc-6A §3/§5/§6/R5/R9/R3a` · `Doc-2 §0.4` · Invariant #8 · `Doc-6B CR4′` · `Doc-6D spec_documents`/`financial_tier_history` · `Doc-5K R7` · `Doc-8A §6` + bands A/C · `Doc-8B` (DB-role path) · CLAUDE.md §10 — all correctly invoked.

0 BLOCKER, 0 MAJOR. The schema-inventory + constraint + immutability altitude (catalog-introspection assertions, binding/choice tagging) is right. Two data-layer-scope precision defects, one count nit.

### MINOR-1 — §3 soft-delete "excluded from routing/matching/search/default queries" is an **application-query** behavior, not DB-enforced
§3 asserts a soft-deleted row is "excluded from default / routing / matching / search queries." But the DB does **not** auto-exclude — exclusion happens because the **application query** carries `WHERE deleted_at IS NULL` (or a read-model does). 8D (persistence) asserting routing/matching/search exclusion reaches into the **app/query layer** (8C / the owning module's read-model).
**Required fix:** §3 — scope 8D's soft-delete assertion to the **DB facts**: (a) a soft-deleted row is **present, not hard-deleted** (`deleted_at` set, row still exists); (b) the **partial-unique** permits a **replacement active row** with the same key. The **default-query exclusion** (routing/matching/search) is asserted at the **query/contract layer** (8C / the owning module's read-model), cross-referenced — not at the DB in 8D.

### MINOR-2 — §3 "IDs never reused" is a UUIDv7 **generation property**, not a per-table DB assertion
§3 lists "IDs never reused" as an immutability assertion. But this cannot be tested as a standalone per-table DB check (you cannot prove a negative over all generations); it is a **property of UUIDv7 generation** (globally unique, time-ordered) **plus** no-hard-delete (a deleted id's row is never removed, so its id is never free to reassign).
**Required fix:** §3 — state "IDs never reused" is asserted **indirectly** via the contributing facts (UUIDv7 generation — `Doc-6A §3`/`Doc-4B` — + no-hard-delete of authoritative rows — §3), **not** as a standalone testable check. Remove the implication of a direct per-table assertion.

### NITPICK-1 — §1's "35 tables ready" hardcodes a count that drifts as `6E…6K` freeze
§1 states "35 tables `ready` (5+9+21)." Correct now, but the completeness check is **parameterized over whatever Doc-6x is frozen at execution** — hardcoding 35 will drift as `6E…6K` freeze.
**Suggested fix:** §1 — state the count as the **current** frozen set (35 = `core` 5 + `identity` 9 + `marketplace` 21 **as of freeze**); the completeness check counts the frozen Doc-6x tables **dynamically**, not a literal 35.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§2 asserting standard columns/constraints via catalog introspection duplicates what the migration + Prisma already guarantee — if the migration made the column, it exists; testing is redundant."* | **REJECTED (false).** A migration creating a column does **not** prove the **frozen DDL's intent** is realized — a migration can **drift** from the frozen Doc-6x DDL (a renamed column, a **missing partial-unique predicate**, a wrong CHECK, a money column without its currency neighbor), and **codegen happily reflects the drift**. The conformance test asserts the **realized schema ≡ the frozen DDL** (the oracle), catching exactly the migration/schema drift the migration cannot self-detect — Doc-8D's core purpose (D1 completeness + §2). Not redundant. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §3 soft-delete exclusion is query-layer | MINOR | Pass-1 Patch — 8D asserts DB facts; default-query exclusion → 8C/read-model |
| MINOR-2 §3 "IDs never reused" indirect | MINOR | Pass-1 Patch — assert via UUIDv7 + no-hard-delete, not standalone |
| NITPICK-1 §1 hardcoded 35 | NIT | Pass-1 Patch — dynamic count; 35 as-of-freeze |

**Gate:** 2 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§4–§7).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited.*
