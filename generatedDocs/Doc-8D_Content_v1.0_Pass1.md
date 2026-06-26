# Doc-8D — Persistence/Migration/RLS Conformance Suite — Content v1.0 **Pass-1 (§0–§3)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§3 of `Doc-8D_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8D_Structure_v1.0_FROZEN` §0–§3: control · schema/RLS inventory · schema-constraint · immutability |
| Authority | `Doc-8A §6` + bands A/C; oracle = the frozen Doc-6 schema (`6B/6C/6D`) + Doc-2 + Doc-6A; consumes `Doc-8B` by pointer |
| Coins | **Nothing.** Inventory derived from frozen Doc-6x DDL; assertions oracle-by-pointer; snippets illustrative |
| Binding vs choice | Convention tracing to the frozen DDL/Doc-6A = **[binding]**; physical specific (inventory columns, helper names) = **[Doc-8D choice]**. SQL illustrates; the convention binds. |

> **Scope of this pass:** control/precedence + Bands A/C gate (§0), the frozen-DDL-sourced schema/RLS inventory (§1), schema-constraint conformance (§2), and immutability conformance (§3, the invariant-#8 defining check 8E references). §4–§7 (migration, the RLS byte-equivalence gate, cross-module integrity, conformance) land in Pass-2.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding

Doc-8D sits at: `… → Doc-8A → (Doc-8B harness) → **Doc-8D** → asserts the frozen Doc-6 schema`. It **realizes** `Doc-8A §6` and **passes Appendix A Bands A + C** (`CHK-8-001…003`; `CHK-8-020…025`) before content freeze. Realize-never-redecide: every assertion is an **oracle-by-pointer** into the frozen Doc-6x DDL / Doc-2 / Doc-6A convention; **no assertion stricter or looser** than the realized schema (`Doc-8A §3.3`). A red test = code/schema defect, or `[ESC-8-CORPUS]` (a genuine schema/corpus defect — flag-and-halt) — **never weaken** (`Doc-8A §3.4`). Doc-8D is the **defining suite for invariant #8 (immutability, §3) and #11 (byte-equivalence, Pass-2 §5)**; 8E references, 8C/8G compose. Consumes the **Doc-8B** harness (incl. the DB-role/schema-reset path) by pointer. Coins nothing.

## §1 — Scope & the Schema/RLS Inventory

**[D1 binding]** The suite's spine is the **schema inventory** — **derived from the frozen Doc-6x DDL** (`Doc-6B core`, `Doc-6C identity`, `Doc-6D marketplace`; `6E…6K` as they freeze), **never hand-maintained**. Row schema **[Doc-8D choice — columns; values [binding] from the frozen DDL]**:

| Field | Source |
|---|---|
| `table`, `namespace` | the frozen Doc-6x DDL (schema = canonical namespace — `Doc-6A R3a`) |
| `standard_columns` | `id UUIDv7` + timestamp/actor/tenant/soft-delete tuples present per the table's frozen DDL (`Doc-6A §3`) |
| `constraints` | PK / unique / **partial-unique `WHERE deleted_at IS NULL`** / CHECK (from the frozen DDL) |
| `monetary_columns` | `NUMERIC` + adjacent currency column (`Doc-6A R9`) — empty where none |
| `immutability` | the column-scoped trigger(s) (`Doc-6B CR4′` / `Doc-6D spec_documents` pattern) / append-only / versioned / soft-delete |
| `rls` | tenancy class (tenant-owned / shared / platform-owned / derived) + the policy anchor (`organization_id` / grantee-row / publish-state / platform-staff) |
| `xmodule_refs` | bare-UUID cross-module references (`_id`, validated by service — `Doc-6A §5`) |
| `execution` | `ready` (frozen schema) \| `deferred` (owning Doc-6x pending — D3) |

The **completeness check** asserts **inventory ≡ the frozen Doc-6 DDL** (every frozen table has exactly one row; none invented), cross-checked against the `generated-contracts-registry/` Prisma output once code exists. As of freeze: `core` (5 tables) + `identity` (9) + `marketplace` (21) = **35 tables `ready`**; `6E…6K` rows added + the grantee/buyer-private RLS facets flagged `deferred` (D3).

## §2 — Schema-Constraint Conformance *(`CHK-8-020/021`)*

**[binding the frozen DDL + `Doc-6A §3/§5/R5/R9`]** Each table is asserted against its frozen DDL:

- **Standard columns:** `id uuid` (UUIDv7) PK; the timestamp tuple (`created_at`/`updated_at`); actor stamps where the table declares; the tenant column (`organization_id` on tenant-owned); the soft-delete tuple where soft-deletable — **present exactly as the frozen DDL declares** (`Doc-6A §3`). A missing/extra standard column is a defect.
- **Partial-unique (`Doc-6A R5/§5`):** every unique constraint on a soft-deletable table is realized as a **partial unique index `... WHERE deleted_at IS NULL`** — **never an `is_deleted` boolean**. The check asserts the partial predicate exists (a plain unique on a soft-deletable table is a defect).
- **CHECK constraints:** enumerated state/currency CHECKs present per the frozen DDL (`Doc-6A §5`).
- **Multi-currency (`CHK-8-021`; `Doc-6A R9`/`Doc-2 §0.4`):** every monetary amount is `NUMERIC` with an **explicit adjacent currency column**, default `'BDT'` — no implicit currency, no money without its currency neighbor.

```sql
-- illustrative; convention [Doc-6A §3/§5/R5/R9 binding]; assert against the frozen DDL via catalog introspection
-- partial-unique on soft-deletable: WHERE deleted_at IS NULL  (never is_deleted)
-- monetary: every NUMERIC amount has an adjacent currency column DEFAULT 'BDT'
SELECT assert_partial_unique(table, cols) WHERE soft_deletable(table);     -- [Doc-6A R5]
SELECT assert_currency_neighbor(table, amount_col) FOR EACH monetary_col;  -- [Doc-6A R9 / Doc-2 §0.4]
```

## §3 — Immutability Conformance *(`CHK-8-022`; defining for invariant #8)*

**[binding Invariant #8 / `Doc-6A §6`]** **8E references this defining check.** Per table flagged immutable/versioned/append-only/soft-delete in the inventory:

- **Soft-delete exclusion:** a soft-deleted row (`deleted_at` set) is **excluded** from default / routing / matching / search queries (assert the row vanishes from the default-scoped read, remains in an explicit-include read).
- **Versioned immutability:** a write to a **frozen version** is **rejected** by the trigger (a new revision is a **new row**, not an in-place edit) — e.g. `Doc-6D spec_documents` column-scoped immutability.
- **Append-only history:** an UPDATE or DELETE on an append-only/history table is **rejected** (e.g. `Doc-6D financial_tier_history`, audit).
- **Column-scoped immutability (`Doc-6B CR4′` pattern):** the **business payload** columns are immutable; **bounded operational fields** may update (e.g. `core.outbox_events` status forward-only; `core.audit_records` archive flag) — assert the immutable columns reject UPDATE, the operational ones permit it within bounds.
- **IDs never reused; no hard-delete of authoritative rows.** **Sole enumerated exception:** the regenerable `ai.*` cache permits TTL hard-delete (`Doc-5K R7`; `Doc-6K` when frozen) — asserted as legitimately destructible.

```sql
-- illustrative; convention [Doc-6A §6 / Invariant #8 binding]; immutable cols reject UPDATE, append-only rejects DELETE
SELECT assert_update_rejected(table, immutable_cols);          -- versioned / column-scoped (CR4′)
SELECT assert_delete_rejected(table) WHERE append_only(table); -- history/audit (Doc-6A §6)
SELECT assert_excluded_from_default_read(table, soft_deleted_row);
-- ai.* TTL hard-delete is the SOLE permitted destructive op (Doc-5K R7) — asserted legitimate, not a violation
```

Execution-ready now for `core`/`identity`/`marketplace` (frozen triggers); `ai.*` exception deferred to `Doc-6K`.

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** the frozen Doc-6x DDL (`6B/6C/6D`); `Doc-6A §3/§5/§6/R5/R9/R3a`; `Doc-2 §0.4`; Invariant #8; `Doc-6B CR4′`/`Doc-6D spec_documents`/`financial_tier_history`; `Doc-5K R7`; `Doc-8A §6/§3.x` + bands A/C; `Doc-8B`; CLAUDE.md §10. **Nothing invented.**
- **Inventory frozen-sourced:** §1 derives from the frozen DDL; completeness ≡ frozen DDL (35 tables ready: 5+9+21).
- **#8 defining check here; 8E references:** §3 is the canonical immutability assertion.
- **Coins nothing; binding/choice tagged:** 0 new table/column/constraint/RLS-policy/expected value; SQL illustrative.
- **Open for review:** confirm the `core`/`identity`/`marketplace` table counts (5/9/21) against the frozen manifests; confirm the column-scoped (CR4′) immutable-vs-operational split is asserted per the frozen trigger definition, not an invented column list.

*End of Content Pass-1 (§0–§3) — DRAFT. Realizes `Doc-8D_Structure_v1.0_FROZEN` §0–§3. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7).*
