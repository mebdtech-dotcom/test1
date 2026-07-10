# TEAM-6 — Security Review · W2-IDN-7 · M1 Module Conformance Gate (RV-0160)

**Reviewer:** Team-6 (Security Review) — fresh-context, independent, hostile live probes.
**Pipeline position:** Dev → Review-A (PASS 0/0/0) → **(Review-B ∥ Team-6 = this)** → Board.
**Target:** code commit `e9ff0b8` (WP delta `1dc0edb..e9ff0b8`). Ran on the **MAIN tree + MAIN docker
Postgres (`localhost:5432/ivendorz`)**; HEAD at run = `e08a8a8` (= `e9ff0b8` + coordinator governance
markdown; code identical). Concurrent Review-B runs ISOLATED (`:5433` worktree) — no shared DB.
**Date:** 2026-07-10.

---

## VERDICT

**PASS — BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 0 · OBS 3 (all neutral).**

Absence-of-breach is the pass condition; every hostile probe proved absence. The permission-catalog
seed (the authz substrate) is firewalled at three independent app-layer layers plus the DB backstop.
No org-role path resolves either routing slug; the routing slugs are non-delegable; the 7 seeded
durations influence no governance signal and fail LOUD on a mistype; the seeds are migration-realized
and unreachable by a tenant DB role; and nothing emits an identity §8 event. Seed START == END exactly.

**13/13 live hostile probes green** (single targeted file, run twice; NOT the full suite — RV-0152 honored).

---

## Automatic-BLOCKER checklist — each PROBED-ABSENT

| Auto-BLOCKER vector | Result | Evidence |
|---|---|---|
| **Org-context bypass** (client org id trusted?) | **ABSENT** | `checkPermission` resolves on the SERVER-validated `organizationId` (never a client assertion — query header `check-permission.query.ts:42-44`); `resolveGrantedTenantSlugs` is org-anchored on `(role_id ∧ (org=active ∨ NULL))`. `createDelegationGrant` uses `ctx.activeOrgId` from the active-org guard. Probe 1/2 drove real resolutions through the server anchor. |
| **Cross-tenant data leak** | **ABSENT** | Probe 4: config store not tenant-readable (grant + staff-only RLS); catalog is global REFERENCE data (no tenant anchor to leak across); `role_permissions` cross-org read denied (`authz-rls-backstop` existing) + cross-org WRITE denied (my INSERT probe → RLS reject). |
| **Privilege escalation** | **ABSENT** | Probe 1: staff routing slugs NEVER resolve through any org role (Owner/Director/Manager/Officer + a forged custom mapping) → all `deny/staff_space_firewall`. Probe 2: routing slugs non-delegable → `FORBIDDEN`. |
| **Governance-signal firewall breach (Inv #6)** | **ABSENT** | Probe 3: the 7 keys are operational `duration` tunables; the M0 result surface is EXACTLY `{value, valueType}` (no Trust/Performance/Financial-Tier/Capacity/Buyer-Vendor-Status field); nothing in this WP writes any signal. |
| **Raw-SQL / cross-module DB bypass** | **ABSENT** | Seeds are the frozen Doc-6C §5/§6 realization migrations into the M0-owned store; live consumers read via `core.config_value_query.v1` (contract), never raw `core` SQL from M1. No cross-module FK/table access in the delta. |
| **Buyer↔vendor money surface** | **ABSENT** | This WP = permission catalog + operational durations only. No escrow/wallet/settlement/price surface touched. |
| **Red-Flag Checklist** | **CLEAR** | No new module · no ownership change · no governance-signal change · no cross-module DB/FK · no ADR override · no FROZEN base-doc edit (the Doc-6C overlay is an additive patch). |

---

## The 5 probes — LIVE evidence

### PROBE 1 — Staff-space firewall (the core Invariant #2 probe) — **DENY (all paths)**

Drove the LIVE `check_permission` (via the M1 contract) against the two routing slugs through **every**
org-role path, including a **hostile forgery**:

- **POSITIVE CONTROL (false-negative guard):** the same custom role, checked for a real TENANT slug
  (`can_view_rfq`), resolves `allow/membership` — the resolution machinery is live, so the DENYs below
  are a real firewall, not a broken fixture.
- **FORGED custom-role mapping:** with `role_permissions` rows explicitly mapping the org role → BOTH
  routing slugs (one org-anchored, one NULL/system-bundle-anchored — the DB admits this, no space CHECK),
  `check_permission` for `staff_can_view_routing` AND `staff_can_manage_routing` → **`{deny, none, staff_space_firewall}`** each.
  The policy denies at `space === 'staff'` BEFORE any grant lookup (`permission-resolution.policy.ts:115`),
  and the repo tenant-space filter (`authz.repository.ts:154`) never admits a staff slug to the granted set — two independent layers.
- **EVERY seeded bundle:** a member bound to each of Owner / Director / Manager / Officer (live role ids
  `9314983e… / 6d327740… / f6856d97… / f276bdf9…`, all holding 0 staff slugs) → both routing slugs DENY / `staff_space_firewall`.
- **DB corroboration:** `SELECT count(*) FROM role_permissions JOIN permissions WHERE space='staff'` = **0**
  (ALL 9 staff slugs, ALL bundles — not just the 2 routing slugs). A single resolve would have been a BLOCKER; **zero.**

### PROBE 2 — Non-delegable staff slug — **FORBIDDEN, no write**

Drove the LIVE `create_delegation_grant` from a controlling org whose member holds `can_manage_delegations`,
with the M2 vendor-control port affirming control (so the command reaches the permission-set gate):

- `["staff_can_view_routing"]` and `["staff_can_manage_routing"]` each → **`{AUTHORIZATION, identity_delegation_forbidden, "a staff-space slug is not delegable"}`**
  (`delegation-grant.policy.ts:67-68` → command `:179-180`).
- Mixed set `["can_manage_delegations", "staff_can_manage_routing"]` (a HELD tenant slug + a staff slug)
  → still `FORBIDDEN` (per-slug firewall fires; staff-space is checked before ⊆-held).
- `delegation_grants` rows written for the controlling org after all attempts = **0** (rejected before the write/audit leg).

### PROBE 3 — POLICY-seed safety (firewall · fail-loud · M0-contract-only) — **PASS**

- **Firewall / read-only-via-contract:** each of the 7 `identity.*` keys resolves via
  `core.config_value_query.v1` (full reference form `core.system_configuration.identity.<name>`) →
  `valueType='duration'`, and the result object's keys are **exactly `["value","valueType"]`** — no
  governance-signal field can ride along (Inv #6). Values fed through the interpreter → finite positive ms.
- **Fail-loud:** `policyDurationToMs` THROWS `/not an interpretable duration/` for every uninterpretable
  input probed — `"not-a-duration"`, `""`, `"24x"`, `"abc"`, `"12 months"`, `null`, `undefined`, `{}`, `NaN` —
  never a silent fallback window (`policy-duration.ts:52`).
- **Absent key = loud REFERENCE error:** an unregistered key throws `core_config_key_not_found`
  (`system-configuration.service.ts:57-61`) — never a default.
- **Signal firewall (static):** the 7 keys are Doc-3 v1.9 operational tunables; no code path feeds them into
  Trust/Performance/Financial-Tier/Capacity/Buyer-Vendor-Status.

### PROBE 4 — Seed-realization & RLS backstop (restricted `ivendorz_test_rls`, NOBYPASSRLS) — **fail-closed**

Asserted through the Doc-8B §5 DB-role-switch (role is `NOBYPASSRLS`, non-super, non-owner — RLS genuinely enforces):

- **Config store:** a tenant DB role reading `core.system_configuration` → **rejected** (`permission denied` —
  no table grant; and the only RLS policy is staff-only). The seeded durations are unreadable to a tenant;
  the sole read path is the M0 service on the privileged app connection.
- **Catalog:** `identity.permissions` is read-open REFERENCE data (returns the global 45 rows; no per-tenant
  column ⇒ no cross-tenant leak shape exists — Doc-6C §6.2a).
- **HOSTILE catalog inject:** a non-staff tenant role INSERTing a forged `staff_forged_probe` slug →
  **rejected by `permissions_staff_write` WITH CHECK** (`row-level security` violation). Never persisted (verified 0 rows).
- **HOSTILE bundle inject:** a tenant INSERTing a staff-slug `role_permissions` row anchored to ANOTHER org →
  **rejected by `role_permissions_insert` WITH CHECK** (org-anchor). Seeds are migration-realized (DATA
  migrations, no DDL, no app-layer cross-module write path a tenant could exploit).

### PROBE 5 — [DC-1] zero identity §8 events — **0, stable**

- `core.outbox_events` filtered to identity-domain event names
  (`identity|delegation|permission|membership|organization|routing|role_|user_|ownership|invite`) = **0**,
  stable across the entire probe window (START 0 → END 0). The two seed migrations are pure DATA inserts
  (no outbox write); `create_delegation_grant` emits zero §8 events (only an audit row, and the probe path
  rejected before even that). M1 emits no §8 events (frozen truth).
- **RV-0152 handling:** the outbox TOTAL is noisy (4643 → 4758 during my window) from an EXTERNAL process
  writing M0 test fixtures (`test.w2core2.* / test.w2core3.* / test.wp18.synthetic_outbox_fixture`) on the
  main DB. Treated as suspect external mutation and SCOPED the [DC-1] metric to identity-domain events (0,
  stable) — the total-count delta is not attributable to this WP and is not used as the metric.

---

## Gate roll-up

| Severity | Count | Gating? |
|---|---|---|
| BLOCKER | 0 | — |
| MAJOR | 0 | — |
| MINOR | 0 | — |
| NITPICK | 0 | — |
| OBS | 3 | No |

**Freeze/merge gate: PASS (0/0/0).**

---

## Seed START / END accounting (seed START == END)

| Metric | START | END | Δ |
|---|---|---|---|
| `identity.permissions` total / tenant / staff | 45 / 36 / 9 | 45 / 36 / 9 | 0 |
| staff-space slugs on ANY role bundle (Inv #2) | 0 | 0 | 0 |
| routing-slug PKs (`…001` view / `…002` manage), space | staff / staff | staff / staff | unchanged |
| `core.system_configuration` `identity.*` keys | 7 (24h·24h·24h·14d·365d·1h·7d) | 7 (same) | 0 |
| identity-domain `outbox_events` | 0 | 0 | 0 |
| my fixture residue (orgs / users / roles) | — | 0 / 0 / 0 | swept |
| forged `staff_forged_probe` catalog slug | absent | absent (RLS-rejected + rolled back) | 0 |
| temporary probe file `tests/integration/_team6-probe.test.ts` | — | DELETED | tree restored |

- All probe fixtures used a dedicated `…0000000f6…` UUID namespace and were swept in teardown.
- `ivendorz_test_rls` is a STANDING harness fixture (present at START [I4]; idempotently ensured by the
  standard global-setup) — not my residue.
- HEAD unchanged (`e08a8a8`); my only tree write (the probe file) was deleted.

---

## For the coordinator — quiet-tree 3× green reconciliation

1. **Active concurrent tree churn (heads-up, not a finding).** During my window the MAIN working tree was
   actively mutated by concurrent sessions — it grew from ~11 to ~60 uncommitted files, now including FIVE
   `src/server/identity/*.route-handler.ts` files (the "runTenantWrite" maintainability-refactor 2A,
   EXTRACTION-ONLY) plus dozens of `app/**` FE files. All are uncommitted, NOT in `e9ff0b8`, and orthogonal:
   my probe import graph is `src/modules/identity/**` + `src/server/context` + `src/modules/core/contracts`
   + `tests/_harness` — it never loads the churning `src/server/identity/*` route-handler layer, and the DB
   seed state (what the probes actually assert) verified START == END. The quiet-tree 3× green run should be
   taken on a settled tree; my seed-substrate verdict is independent of that code churn.
2. **[DC-1] outbox is being written by an external M0-fixture process on the main DB** (`test.w2core*` /
   `test.wp18.*`). Non-identity, non-gating; identity events stayed 0. If the 3× green reconciliation counts
   outbox rows, scope to identity-domain event names (as I did) — the raw total is externally noisy.
3. **Single targeted probe file only** was run (deleted after) — no full suite executed on the shared tree
   during the concurrent-review window (RV-0152 respected).

---

## OBS (neutral; no action implied; non-blocking)

- **OBS-1 (record — access-model asymmetry, correct):** `core.system_configuration` has NO read-open RLS
  policy (only `system_configuration_platform_staff FOR ALL USING is_platform_staff IS TRUE`) and the
  restricted tenant role holds no grant on it — so a tenant DB role cannot read the seeded durations at all
  (privilege + RLS, defense-in-depth), stricter than the read-open `identity.permissions` catalog. Both are
  correct: config is service-mediated (M0 contract), the catalog is global reference data. Documented for the record.
- **OBS-2 (record — RLS is not space-aware on `role_permissions` writes, BY DESIGN):** the
  `role_permissions_insert` WITH CHECK gates on the ORG anchor only, not the slug's space — so at the DB
  level a tenant could admit a `role_permissions` row mapping their OWN role → a staff slug under their OWN
  org anchor. This is admitted by RLS but fully NEUTRALIZED by the app-layer firewall (Probe 1 proved a
  forged staff→role mapping still resolves DENY). This matches the frozen Doc-6C §6.2a division of labor
  ("app-layer authz is PRIMARY … RLS is the row-visibility backstop"). Not a defect — the primary firewall holds.
- **OBS-3 (coordinator lane — concurrent churn):** see the reconciliation note above; the tree was actively
  mutated by concurrent FE + backend-refactor sessions during the probe window. Immaterial to the seed
  authz-substrate verdict; flagged so the quiet-tree run is taken on a settled tree.

---

*Raise ≠ Accept: these results/observations are raised for the Board to adjudicate; Team-6 does not
implement and does not self-approve. Absence-of-breach proven across all 5 probes. Next gate: Board
(after Review-B ∥ Team-6 both land + the quiet-tree 3× green reconciliation).*
