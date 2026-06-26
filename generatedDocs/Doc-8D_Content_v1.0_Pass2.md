# Doc-8D — Persistence/Migration/RLS Conformance Suite — Content v1.0 **Pass-2 (§4–§7)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §4–§7 of `Doc-8D_Structure_v1.0_FROZEN`. Final Doc-8D content pass. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8D_Structure_v1.0_FROZEN` §4–§7: migration · RLS positive/negative/cross-tenant byte-equivalence gate · cross-module integrity · conformance |
| Authority | `Doc-8A §6` + bands A/C; oracle = the frozen Doc-6 schema + Doc-2 + `Doc-6A`; consumes `Doc-8B` (incl. DB-role/schema-reset path) by pointer |
| Coins | **Nothing.** Assertions oracle-by-pointer into the frozen DDL/RLS; snippets illustrative |
| Binding vs choice | Convention = **[binding]**; physical specific = **[Doc-8D choice]**. |

> **Scope of this pass:** migration conformance (§4, `CHK-8-023`), the **RLS positive/negative/cross-tenant byte-equivalence gate** (§5, `CHK-8-024` — the mandatory security band, the invariant-#11 defining check), cross-module integrity (§6, `CHK-8-025`), and Doc-8D's conformance attestation (§7). With Pass-1 (§0–§3) this completes Doc-8D content.

---

## §4 — Migration Conformance *(`CHK-8-023`)*

**[binding `Doc-6A §11`]** Assert the migration discipline Doc-6 delegates to Doc-8:

- **Forward-only:** the migration sequence is append-only and versioned; no migration is edited/reordered after application.
- **Expand-contract / non-destructive on authoritative tables [Invariant #8]:** a migration that **drops or destructively rewrites** an authoritative column/table **fails** the check; only **additive / expand-contract** changes are permitted on authoritative data. **Destructive permitted only on the `ai.*` cache** (`Doc-5K R7` — the sole exception).
- **Seed-migration verification:** the registered seeds land — `Doc-3 §12` POLICY keys (`Doc-6B` 18 `core.*`, `Doc-6C` `identity.*` (Doc-3 v1.9), `Doc-6D` `marketplace.*` (Doc-3 v1.2)) + the `Doc-2 §7` / per-module role/permission seeds (`Doc-6C` 45-slug + 4-bundle); the seed is **idempotent** (re-running yields no duplicate).
- **Prisma-codegen integrity:** the `generated-contracts-registry/` client is **current** (regenerating yields no diff) and **never hand-edited** (CLAUDE.md §10).

**Execution-readiness [D3]:** the migration sequence + seeds exist as **code** (NOT STARTED) — execution-deferred; the discipline + the seed targets (the registered keys/roles) are authored now and assertable against the realized seed once code lands.

```ts
// illustrative; convention [Doc-6A §11 binding]; non-destructive on authoritative; ai.* sole destructive exception
expectForwardOnly(migrations)
for (const m of migrations) expectNonDestructiveOnAuthoritative(m)   // drop/rewrite of authoritative col => red (Inv #8)
expectSeedsLanded(REGISTERED_POLICY_KEYS, ROLE_PERMISSION_SEEDS)     // Doc-3 §12 + Doc-2 §7 / Doc-6C 45-slug
expectCodegenClean()                                                // generated-contracts-registry no diff (CLAUDE.md §10)
```

## §5 — RLS Positive/Negative/Cross-Tenant Byte-Equivalence Gate *(`CHK-8-024`; MANDATORY; defining for invariant #11)*

**[binding `Doc-6A R8/§4` / Invariant #11 / CLAUDE.md §2]** The load-bearing security band. Asserted via the **Doc-8B §3 DB-role-switching** path (act as a tenant DB role, app layer bypassed). The ≥2-org fixture (Doc-8B §5) is the vehicle.

### §5.1 Positive
An authorized actor under the active org sees **exactly** what the contract grants, per tenancy class:
- **tenant-owned** anchored on `organization_id = active org` (`identity`, `marketplace` org-owned tables);
- **tri-actor** Public / User / Admin (`Doc-6D` marketplace — anonymous sees published-only; User sees own-org + published; Admin per policy);
- *(grantee-row anchors `rfq_invitation_grantees`/`quotation_visibility` + `controlling_organization_id` → M3/`Doc-6E`, **execution-deferred** — D3.)*

### §5.2 Negative — the RLS backstop *(8D's defining concern)*
Querying as the **tenant DB role with the app layer bypassed**, RLS **must deny** an unauthorized read/write. (The **app-layer denial is Doc-8C's** actor-scope — the §8 seam; "both deny" is the system requirement, each owned. 8D proves the **backstop**.)

### §5.3 Cross-tenant
Org A's DB role can **never** read/list/count org B's tenant-owned rows; **no RLS policy depends on cross-schema ownership traversal** (`Doc-6A §4`). The ≥2-org fixture drives it.

### §5.4 Non-disclosure byte-equivalence *(Invariant #11; the canonical criterion, single-sourced here)*
**8D's defining assertion is row/query-result byte-equivalence at the DB:** an excluded vendor's RLS-governed `SELECT`/`COUNT` returns **byte-identical result sets** to a non-matched vendor's — same rows, same counts, no distinguishing leak in the data the DB returns. The **canonical criterion (excluded ≡ non-matched) is single-sourced here**; cross-layer observables are **composed** at their layer (each invoking this criterion): **Doc-8C** (contract responses + list counts), **Doc-8F** (no distinguishing notification/event), **Doc-8G** (UI).

**Two facets, distinct readiness [D3]:**
- **Marketplace visibility** (`Doc-6D` publish-state) — **ready now**: an unpublished/hidden vendor profile is byte-equivalent (absent) in an anonymous/User query to a non-existent one.
- **Buyer-private CRM exclusion** (`buyer_vendor_statuses`, M4 / `Doc-6F`) — **execution-deferred**: a blacklisted vendor's query results are byte-identical to a non-matched vendor's; `buyer_vendor_statuses` content never observable in any vendor-facing query. Authored now; runs when `Doc-6F` freezes.

```sql
-- illustrative; convention [Doc-6A R8/§4 / Inv #11 binding]; DB-role-switching; row-visibility byte-equivalence
SET LOCAL ROLE tenant_org_A;  SET app.active_org = 'A';
-- §5.2 negative: RLS denies org-B rows even with app bypassed
SELECT assert_empty(`SELECT * FROM marketplace.<tenant_table> WHERE organization_id = 'B'`);
-- §5.3 cross-tenant: A cannot count B
SELECT assert_zero(`SELECT count(*) FROM <tenant_table> WHERE organization_id = 'B'`);
-- §5.4 byte-equivalence (marketplace visibility, ready): excluded ≡ non-matched result set
SELECT assert_byte_equal(query_as(excluded_vendor), query_as(nonmatched_vendor));   -- canonical criterion
-- buyer-private facet (Doc-6F): same criterion, execution-deferred until 6F freezes
```

## §6 — Cross-Module Integrity Conformance *(`CHK-8-025`)*

**[binding `Doc-6A §5` / `Doc-2 §0.3`]** Assert:
- **No cross-schema FK:** scan the frozen DDL for any foreign key crossing a schema boundary — **any is a defect**. Cross-module references are **bare UUID columns** (named `<entity>_id`, **not** `_ref`), validated by the owning module's service before save, reconciled by the **orphan-scan** integrity job (`Doc-2 §0.3/§10.11`). (E.g. `Doc-6C delegation_grants` dual-party M2 bare-UUID; `Doc-6D` cross-module refs.)
- **Intra-schema FKs** within an aggregate boundary are **permitted** (assert they stay within the schema).
- **No cross-schema RLS traversal** (re-asserts §5.3 from the policy-definition side — an RLS policy referencing another schema's table is a defect).

```ts
// illustrative; convention [Doc-6A §5 / Doc-2 §0.3 binding]
expectNoCrossSchemaFK(frozenDDL)                          // any cross-schema FK => red
expectCrossModuleRefsAreBareUUID(frozenDDL)               // <entity>_id, service-validated, orphan-scan
expectNoCrossSchemaRLSTraversal(frozenRLSPolicies)
```

## §7 — Conformance & Carried Items

**Doc-8D conformance attestation:**

| Band | Disposition |
|---|---|
| **A** — oracle-by-pointer | **realizes by design** — every assertion binds the frozen Doc-6x DDL / Doc-2 / Doc-6A by pointer; none stricter/looser; red = code/schema or `[ESC-8-CORPUS]`, never weakened |
| **C** — persistence/migration/RLS (`CHK-8-020…025`) | **realizes by design** — schema-constraint (§2) · immutability (§3, #8 defining) · migration (§4) · **RLS byte-equivalence gate (§5, #11 defining, MANDATORY)** · cross-module integrity (§6) |
| **B/D/E/F/G/H/I** | **N/A** — contract (8C) · invariant/firewall/state (8E — references 8D's #8/#11) · integration (8F) · frontend (8G) · harness (8B) |

**Coverage attestation [D1]:** inventory ≡ the frozen Doc-6 DDL (35 tables as of freeze: `core` 5 + `identity` 9 + `marketplace` 21; dynamic as `6E…6K` freeze); every applicable Band-C check per table; **execution-readiness flagged (D3)** — ready (`core`/`identity`/`marketplace` constraints, immutability, org/public RLS) vs deferred (grantee RLS → `Doc-6E`; buyer-private byte-equivalence → `Doc-6F`; migration code; `6E…6K`) — **none silently dropped**. **Authored-not-run**: the design + coverage are frozen now (oracle = frozen schema); per-assertion PASS/FAIL recorded at execution as each facet's enforcement freezes.

**Carried register [by pointer]:** `DR-8-HARNESS` **consumed** (Doc-8B, incl. DB-role path); `DR-8-RLS` **satisfied** (8D is the byte-equivalence defining suite — §5); `[ESC-8-CORPUS]` (genuine schema/corpus defect — flag-and-halt, **never weaken**); `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel). Doc-8D coins nothing.

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** `Doc-6A §11/§5/R8/§4`; `Doc-3 §12` + per-module POLICY patches; `Doc-2 §7/§0.3/§6`; Invariant #8/#11; `Doc-6C delegation_grants`/`Doc-6D` (RLS/refs); `Doc-6E`/`Doc-6F` (D3); `Doc-5K R7`; `Doc-8B §3/§5` (DB-role/≥2-org); `Doc-8C §8` (seam); CLAUDE.md §2/§10. **Nothing invented.**
- **Crown-jewel scope correct:** §5.4 byte-equivalence = **data-layer row visibility** (single-sourced criterion); cross-layer composed by 8C/8F/8G (the structure MAJOR-1 fix carried); negative = RLS backstop (8C owns app-layer — MINOR-1 seam).
- **Authored-not-run honesty:** §7 "realizes by design"; PASS/FAIL at execution; readiness flagged (D3), none dropped.
- **Coins nothing:** 0 new table/column/constraint/RLS-policy/expected value.
- **Open for review:** confirm the marketplace-visibility byte-equivalence facet is genuinely DB-RLS-enforceable now (publish-state in `Doc-6D` RLS) vs an app-query concern; confirm the seed-idempotency assertion (§4) matches the realized seed migrations.

*End of Content Pass-2 (§4–§7) — DRAFT. Realizes `Doc-8D_Structure_v1.0_FROZEN` §4–§7. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN.*
