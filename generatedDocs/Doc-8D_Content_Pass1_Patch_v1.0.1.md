# Doc-8D — Content Pass-1 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8D_Content_v1.0_Pass1.md` (§0–§3) |
| Against | `Doc-8D_Content_Pass1_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-1 APPROVED; proceed to Content Pass-2 |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MINOR-1 — §3 soft-delete exclusion is query-layer → **FIXED**
§3's soft-delete bullet is rescoped to DB facts:
> **Soft-delete [DB facts only]:** assert (a) a soft-deleted row is **present, not hard-deleted** (`deleted_at` set, the row still exists in the table); (b) the **partial-unique** index permits a **replacement active row** with the same business key (`... WHERE deleted_at IS NULL`). The **default-query exclusion** (a soft-deleted row absent from routing/matching/search/default reads) is an **application-query / read-model** behavior asserted at the **query/contract layer (Doc-8C / the owning module's read-model)**, cross-referenced — **not** at the DB in 8D.

### MINOR-2 — §3 "IDs never reused" indirect → **FIXED**
§3's IDs bullet is restated:
> **IDs never reused [indirect].** Not a standalone per-table check (a negative over all generations is untestable); asserted **indirectly** via the contributing facts — **UUIDv7 generation** (`Doc-6A §3` / `Doc-4B`, globally unique time-ordered) **+ no-hard-delete of authoritative rows** (§3, so a used id's row is never removed/freed). 8D asserts those facts, not "never reused" directly.

### NITPICK-1 — §1 hardcoded 35 → **FIXED (applied)**
§1: the completeness check counts the **frozen Doc-6x tables dynamically**; "35 (`core` 5 + `identity` 9 + `marketplace` 21)" is the count **as of freeze**, growing as `6E…6K` freeze — not a literal in the check.

### REJECTED finding — upheld
"§2 catalog-introspection redundant with migration/Prisma" stays **REJECTED as false** — a migration can drift from the frozen DDL (missing partial-unique, wrong CHECK, money without currency) and codegen reflects the drift; the conformance test asserts realized-schema ≡ frozen-DDL, catching drift the migration cannot self-detect. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 2 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 soft-delete DB facts | MINOR | **CLOSED** — present-not-hard-deleted + partial-unique replacement; default-query exclusion → 8C/read-model |
| MINOR-2 IDs never reused indirect | MINOR | **CLOSED** — UUIDv7 + no-hard-delete; not standalone |
| NITPICK-1 dynamic count | NIT | **CLOSED** — counts frozen Doc-6x dynamically; 35 as-of-freeze |
| REJECTED (catalog redundant) | — | **Upheld false** |

No new defect. Re-verified the data-layer scope of soft-delete (DB facts vs query exclusion) and the indirect nature of "IDs never reused." **0 open BLOCKER/MAJOR/MINOR → Pass-1 APPROVED.**

*End of Content Pass-1 Patch v1.0.1 + Closure Check. Next: Content Pass-2 (§4–§7) — migration · the RLS positive/negative/cross-tenant byte-equivalence gate · cross-module integrity · conformance.*
