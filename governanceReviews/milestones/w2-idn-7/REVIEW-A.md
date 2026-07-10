# REVIEW-A — W2-IDN-7 · M1 Module Conformance Gate (RV-0160)

**Reviewer:** Review-A (Team-4: Architecture & Governance Conformance) — fresh-context, independent.
**Pipeline position:** Dev → **Review-A (this)** → (Review-B ∥ Team-6) → Board.
**Target:** code commit `e9ff0b8` (WP delta `1dc0edb..e9ff0b8`); suite run at HEAD `0fec606` (code identical).
**Date:** 2026-07-10.

## VERDICT

**PASS (0/0/0 → hand to Review-B ∥ Team-6).**

BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 0 · OBS 3 (all neutral, non-blocking; coordinator/record notes).

Every frozen anchor was re-read verbatim and independently re-derived. The Doc-6C patch is genuinely
pre-authorized and safe to register. The catalog grows 43→45 = 36 tenant + 9 staff with the routing
pair on ZERO bundles (Inv #2 held, per-slug discriminating). The 7 POLICY keys are Doc-3 v1.9 §3
verbatim. The `durationToMs` canonicalization is byte-identical behavior-preserving with the
window-clock split correctly preserved. Suite 381/33 green, tsc 0. All 8 judgment calls CONCUR.

---

## Findings table

**None.** Zero BLOCKER / MAJOR / MINOR / NIT raised. (OBS list at the end — neutral, no action implied.)

Every candidate finding was run through the Validate-Findings 4-gate (valid? applicable? best-for-product?
consistent-with-corpus?) and none survived as a defect against the WP delta.

---

## Independent re-derivations

### 1. Doc-6C_Patch_v1.0.3 verdict (highest scrutiny) — AUTHORIZED, ADDITIVE, SAFE TO REGISTER

| Test | Result | Anchor (re-read verbatim) |
|---|---|---|
| Pre-authorization REAL? | **YES** | `Doc-2_Patch_v1.0.8.md:57-58` §4(a): "Carried realization (NOT executed by this fold): (a) identity catalog-seed migration + Doc-6C count-assertion overlay (§5.1 / CHK-6-062: 43 → 45; precedent `Doc-6C_Patch_v1.0.1`) at **W2-IDN-7**". Plus `BOARD-DECISION-RFQ-SLUG_v1.0.md:3` "✅ APPROVED — owner/Architecture Board ruling, 2026-07-10" + `:52-54` (names W2-IDN-7 + the overlay). Plus `00_AUTHORITY_MAP.md:122` records the carry. |
| Additive only (no base edit)? | **YES** | `git diff --name-only e5225c8~1 e9ff0b8` → no `Doc-6C_Content_Pass1/2/3` / frozen base in delta; only `Doc-6C_Patch_v1.0.3.md` **A**dded. |
| Coins nothing? | **YES** | Slugs originate in Doc-2 §7 as patched v1.0.8 (`:22`); patch §2 states "the two new slugs are Doc-2 v1.0.8's, not coined here". |
| Precedent = same mechanism? | **YES** | `Doc-6C_Patch_v1.0.1.md` read in full — identical class ("Editorial count correction — additive patch. No schema, DDL, RLS, semantic, state, event, or contract change"). |
| Safe to register in `00_AUTHORITY_MAP.md`? | **YES** | Confirmed currently UNregistered (series row `:117` still v1.0.1; no v1.0.3 patch-chain row) — coordinator correctly HELD it (Raise≠Accept). Well-formed + authorized + additive + arithmetic-correct ⇒ registration is safe. See OBS-2 re: reconciling the stale series-row header. |

### 2. Recount: 45 = **36 tenant + 9 staff** (the +2 are STAFF)

- `Doc-6C_Patch_v1.0.1` established the effective baseline **43 = 36 tenant + 7 staff** (correcting the
  base Doc-6C's propagated "45/38/7" error).
- `Doc-2_Patch_v1.0.8` adds exactly two **staff** slugs (`staff` catalog 7→9); tenant unchanged at 36.
- ∴ **45 = 36 tenant + 9 staff.** The base Doc-6C §3.5 prose "45 (38 tenant + 7 staff)" —
  confirmed verbatim at `Doc-6C_Content_v1.0_Pass2.md:74` — is **stale on the breakdown** (real 36/9, not 38/7).
- Cross-checks: base seed migration `20260709130000` enumerates 36 tenant (`:36-71`) + 7 staff (`:73-79`) = 43;
  routing-slug migration `20260710160000` adds 2 staff → 45. 8E test pins `toHaveLength(45)`/`(36)`/`(9)`.
- **The Doc-6C_Patch_v1.0.3 arithmetic is CORRECT.** T6-OBS-3 characterization is accurate.

### 3. The 7 POLICY keys — verbatim-match table (migration vs Doc-3 v1.9 §3)

| # | Key (`key` column) | Value | Type | Doc-3 v1.9 §3 |
|---|---|---|---|---|
| 1 | `identity.command_dedup_window` | `"24h"` | duration | ✓ row 1 (24h, duration) |
| 2 | `identity.user_update_dedup_window` | `"24h"` | duration | ✓ row 2 (24h, duration) |
| 3 | `identity.membership_invite_dedup_window` | `"24h"` | duration | ✓ row 3 (24h, duration) |
| 4 | `identity.membership_invite_expiry_window` | `"14d"` | duration | ✓ row 4 (14d, duration) |
| 5 | `identity.delegation_validity_default` | `"365d"` | duration | ✓ row 5 (365d, duration) |
| 6 | `identity.delegation_expiry_sweep_cadence` | `"1h"` | duration | ✓ row 6 (1h, duration) |
| 7 | `identity.ownership_succession_reminder_cadence` | `"7d"` | duration | ✓ row 7 (7d, duration) |

- **All 7 verbatim. Zero coined.** Board confirmed the 7-key union (Doc-3 v1.9 Status line + §3.1).
- Key-form resolution proven end-to-end: seeded `key` = `identity.<name>`; consumers pass
  `core.system_configuration.identity.<name>`; `system-configuration.service.ts:22/49` strips the
  `core.system_configuration.` prefix → resolves the seeded row. The policy-keys test (c) exercises the
  real consumer constants (`COMMAND_DEDUP_WINDOW_KEY` etc.).
- Deterministic UUIDv4 PKs `1de77a17-0901-4000-8000-00000000000{1..7}` (valid v4: 3rd group `4xxx`, 4th `8xxx`);
  idempotent `ON CONFLICT (key)`.

### 4. `policyDurationToMs` — byte-identical-throw proof

From `git show e5225c8` the three removed inline parsers threw, and the unified
`policyDurationToMs(value, contextLabel)` (`${contextLabel} value is not an interpretable duration (W2-IDN-7 seed).`)
reproduces each **byte-for-byte** via the site's label:

| Site | Former throw | Context label → unified throw | Match |
|---|---|---|---|
| `create-delegation-grant.command.ts:193` | `identity.delegation_validity_default value is not an interpretable duration (W2-IDN-7 seed).` | `"identity.delegation_validity_default"` | ✓ identical |
| `expire-invitations.command.ts:70` | `identity.membership_invite_expiry_window value is not an interpretable duration (W2-IDN-7 seed).` | `"identity.membership_invite_expiry_window"` | ✓ identical |
| `command-dedup.repository.ts:101/139` | `command-dedup window POLICY value is not an interpretable duration (W2-IDN-7 seed).` | `"command-dedup window POLICY"` | ✓ identical |

Parse arms identical (`value*1000` for finite number; `/^(\d+)\s*([smhd])$/`; `{s:1e3,m:6e4,h:3.6e6,d:8.64e7}`).
`tests/unit/policy-duration.test.ts` pins all arms, the 5 seeded values, whitespace tolerance, and the three
verbatim throw strings (`:51-63`). **Behavior-preserving confirmed.**

- **Window-clock split PRESERVED (not forced):** `findCommandDedupRecord` uses `deps.now?.() ?? new Date()`
  (JS clock); `claimCommandDedupRecord` uses SQL `now()` in the atomic upsert-guard. The refactor changed only
  `windowToMs(...)` → `policyDurationToMs(..., label)`; both clock sources untouched. Production caller
  `src/server/identity/command-dedup.ts:77,109` injects only `{ configValueQuery }`, never `{ now }`. CONCUR.
- **M0 `parseDurationMs` untouched + not imported:** `outbox-policy.ts:62` (M0) not in delta; M1's value-object
  does not import it. No cross-module unification.

### 5. Routing-slugs on ZERO bundles — Invariant #2 confirmation

- Migration `20260710160000` INSERTs only into `identity.permissions` (2 rows, `space='staff'`); **no**
  `role_permissions` INSERT (by construction).
- 8E test `identity-permission-catalog-seed.test.ts:159-172` `it.each(ROUTING_SLUGS)` asserts per-slug
  `space==='staff'` AND `rolePermission.count({ permissionId }) === 0`; plus the aggregate guard `:187-195`
  (`staff`-space → bundle mapping count = 0). A routing slug wrongly bundled reddens a per-slug case.
- Consistent with the base catalog seed's Inv #2 firewall (7 base staff slugs also on zero bundles).
  **Inv #2 firewall intact + discriminating-tested.**

---

## The 8 judgment-call adjudications

| # | Call | Ruling | Basis |
|---|---|---|---|
| 1 | Routing-slug seed-PKs = deterministic UUIDv4 (existing 43 keep `gen_random_uuid()`) | **CONCUR** | `BOARD-PACKET-SEED-PK-UUID_v1.0.md:64-72` Option A forward-binds W2-IDN-7; verified the base migration `20260709130000` uses `gen_random_uuid()` for all 43 → the builder's factual claim is **TRUE**; grandfather is harmless (natural key = `slug`, idempotent). |
| 2 | Window-clock NOT unified; parser unified | **CONCUR** | Packet §1(c)/§4 STOP-on-behavior-change; production caller injects only `{configValueQuery}` (never `{now}`); unifying the clock is an observable change. Split preserved byte-identically. |
| 3 | Authored `Doc-6C_Patch_v1.0.3.md` | **CONCUR** | Pre-authorized (Doc-2 v1.0.8 §4(a) + Board decision + authority-map:122); additive; coins nothing; correctly did NOT self-register (coordinator lane). |
| 4 | Created `src/modules/identity/README.md` | **CONCUR** | Packet §4 CODE ("README (module) — update per §10 DoD"); reference-never-restate honored (points to Doc-4C/5C/6C/2/4M; no copied frozen content). |
| 5 | POLICY-key test re-seeds in `beforeAll` (idempotent) | **CONCUR** | Order-independence vs sibling suites that `deleteMany` these keys; re-applies the REAL migration SQL; idempotent `ON CONFLICT`; no consumer behavior change. |
| 6 | Shared helper home = `domain/value-objects/`, re-exported via `contracts/` | **CONCUR** | Pure value interpretation, layer-legal (app+infra depend inward on domain); NOT `src/shared` (avoids coupling M0's `parseDurationMs`); test-access via `contracts` boundary. |
| 7 | Sweep-cadence binding (RV-0149 OBS-7) NOT implemented | **CONCUR** | Out of packet §1 scope (a–d); behavior change; Inngest cron is registration-fixed. Verified no cron-binding in the delta (no `inngest/` touch). Correctly carried, not silently actioned. |
| 8 | Error marker `(W2-IDN-7 seed)` preserved verbatim | **CONCUR** | Behavior-preserving; guarantees byte-identical throws; the `/not an interpretable duration/` test regex unaffected. |

---

## Whole-surface stale-count grep (classified)

Grepped `src/modules/identity/**`, `tests/**`, `src/server/**` for `43`, `38`, `38 tenant`, `38/7`,
`7 staff`, and count-adjacent digits. **No stale survivor.**

| Hit | Classification |
|---|---|
| `src/modules/identity/README.md:42` "45 slugs = 36 tenant + 9 staff" | ✅ correct |
| `src/modules/identity/application/queries/list-permissions.query.ts:13` "45 slugs — 36 tenant + 9 staff" | ✅ correct (the 43→45 comment fix) |
| `tests/integration/identity-permission-catalog-seed.test.ts:12-17` "45 = 36+9 … base 43 (36+7) … '45/38' propagated error … stale '45 (38/7)'" | ✅ correct (history + explicitly labels the stale value) |
| `tests/integration/identity-permission-catalog-seed.test.ts:230` "43 base upserted + 2 routing → still 45" | ✅ correct (43 = the base seed count) |
| `tests/integration/role-wire-slice.test.ts:204` "all 45 slugs; tenant→36, staff→9" | ✅ correct |
| `…tenant audit leg` / `Doc-2 §7 slug binding` / `staff-space firewall` / `6.2 tenant composition` (src/server) | ⚪ unrelated (ADR-021 audit context / specific slug refs / WP numbers — not counts) |

Fix-the-class discipline (RV-0158) satisfied — the enumerated comment fix left no `43`/`38 tenant`/`38/7`/`7 staff`
survivor anywhere in the M1 surface.

---

## Governance lenses (Review-A standard)

- **Scope (One Module, One Owner):** ✅ delta is M1 backend + the authorized Doc-6C overlay only; no M2–M9 surface.
- **Contracts additive-only:** ✅ one re-export (`policyDurationToMs`, `services.ts:46`); nothing existing broken (tsc/suite green).
- **Governance-signal firewall (Inv #6):** ✅ nothing writes Trust/Performance/Financial-Tier/Capacity/Buyer-Vendor-Status;
  the 7 POLICY keys are operational tunables (Doc-3 v1.9 §6 — no signal impact).
- **`[DC-1]` zero events:** ✅ DATA migrations only; no outbox write.
- **No cross-module DB access:** ✅ the policy-key seed writes to `core.system_configuration` — the frozen Doc-6C §5/§6
  realization mechanism (a migration into the M0-owned store, same as `core_init`), NOT app-layer cross-module table
  access; live consumers read via the M0 `core.config_value_query.v1` contract.
- **Red-Flag scan:** ✅ CLEAR — no new module · no ownership change · no cross-module FK · no ADR override ·
  **no frozen base-doc edit** (verified via `git diff --name-only`).

---

## Surfaced close-blockers — surfaced NOT decided (verified)

- `ESC-WIRE-FIELD-CASING` 🟥 — surfaced (report §8 + README `:51`); not re-cased. ✅
- Realize-vs-defer on §C11 `default_routing_mode`/`buyer_courtesy_options` + `ESC-IDN-ORG-PROFILE-FIELDS` — surfaced;
  **no column realized** (`prisma/schema.prisma` not in delta), no bound coined. ✅
- Provisioning locus (RV-0159 OBS-1) — surfaced; no provisioning contract built. ✅
- Non-gating ESC queue (`2FA-RECOVERY`/`PREF-KEYS`/`LIST-PAGESIZE`/`INVITE-ACCOUNT`/`CTX-SUSPENDED-DOWNSTREAM`) —
  surfaced with fail-closed interims. ✅
- RV-0149 OBS-7 sweep-cadence — **CARRIED not actioned** (verified no cron binding in delta). ✅ CONCUR (packet gap correctly declared).

---

## Suite + delta + type-check

- **Suite: `npm test` (vitest run) → 33 files PASSED / 381 tests PASSED, exit 0, zero failures.** Matches the
  381/33 target exactly (dispatch baseline 368/31 → +13 tests / +2 files, zero regressions). New/updated suites green:
  `identity-permission-catalog-seed` (13), `identity-policy-keys-seed` (4), `policy-duration` (7), `role-wire-slice` (10).
- **Discriminating tests verified by reading:** catalog-45 length pin; routing-slug-not-on-bundle (`it.each` per-slug);
  POLICY-key resolution equals the seeded row (value+type) via the M0 contract; `policyDurationToMs` byte-identical throws.
- **`tsc --noEmit` → exit 0, 0 errors** (independently confirms the report's tsc claim, even with the out-of-scope FE dirt present).
- **14-file delta confirmed** (`git diff --stat 1dc0edb e9ff0b8`): exactly 14 files, all in-scope M1 backend + the
  authorized `Doc-6C_Patch_v1.0.3.md`. **NO external `app/**` or `src/frontend/**` file in the delta** (the ~40 dirty
  working-tree files are all FE/governance and were NOT staged — external-sweep governance check PASSES). HEAD delta
  `1dc0edb..0fec606` adds only coordinator governance files (tracker + the two milestone docs).

---

## Notes for Team-6 (security — pre-flag = YES; they run the hostile probes, not me)

The catalog seed is the authz substrate; a mis-seeded staff slug on a bundle is an Inv #2 breach vector. Suggested probes:

1. **Staff-space firewall:** confirm no org-role path (Owner/Director/Manager/Officer, org-scoped `role_permissions`)
   resolves `staff_can_view_routing`/`staff_can_manage_routing` via `check_permission` (RV-0147 firewall — a tenant
   row mapping a `staff_*` slug must resolve DENY). The seed guarantees zero bundle rows; probe the resolution path.
2. **Non-delegability:** confirm `create_delegation_grant` rejects the routing slugs (staff-space → `FORBIDDEN`,
   the `staff_space` reason branch) — a staff slug must never reach a representative org.
3. **POLICY-key firewall / fail-loud:** confirm the 7 seeded `identity.*` durations influence no governance signal
   and that a mis-typed/uninterpretable value fails loud (throws) rather than defaulting a window.

---

## OBS (neutral; no action implied; non-blocking)

- **OBS-1 (record):** `BOARD-PACKET-SEED-PK-UUID_v1.0.md:29-30` characterizes the existing W2-IDN-2 catalog-seed PKs
  as "format-v4 literals (hand-authored)", but migration `20260709130000` uses `gen_random_uuid()` for the 43 permission
  rows. The builder's comment/judgment-call-1 (existing 43 use `gen_random_uuid()`) is **factually correct**; the Board
  packet's premise was imprecise. Immaterial — Option A is forward-only and re-keys nothing, and the new seeds correctly
  use deterministic v4. No conflict to Flag-and-Halt (the ruling's outcome is implemented regardless of the premise).
- **OBS-2 (coordinator lane):** the Doc-6C series row in `00_AUTHORITY_MAP.md:117` header is stale at "v1.0.1" and its
  effective list omits the already-registered `Doc-6C_Patch_v1.0.2` (`:120`). When registering v1.0.3, the coordinator
  should reconcile the series-row header (v1.0.1 → v1.0.3) and the effective/patch-chain list. Pre-existing bookkeeping,
  outside the WP delta.
- **OBS-3 (report-only):** COMPLETION-REPORT §1 typo — "Full suite 381/31→381/33" should read "368/31→381/33"
  (the dispatch baseline is 368/31, correctly stated in §6). No code impact.

---

*Raise ≠ Accept: these findings/observations are raised for the author/Board to adjudicate; Review-A does not implement.
Board closes; Review-A never self-approves. Next gate: Review-B ∥ Team-6, then Board.*
