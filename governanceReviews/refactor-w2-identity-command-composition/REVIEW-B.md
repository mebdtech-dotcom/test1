# REVIEW-B — Team-5 (Quality & Adversarial): M1 command-composition refactor (behavior side)

**Target:** `570e0b9` (`refactor/w2-identity-command-composition`) — "refactor(identity): extract
shared tenant write/create + user-audit composition (W2 2A/2B)".
**Baseline:** `de0d09c` (M1-conformance-gate-closed `wave` state; suite = 382 tests / 33 files).
**Isolation:** dedicated worktree, detached HEAD at `570e0b9848a8379e9565fb1c6fafda40bd2b4813`;
dedicated throwaway DB `ivendorz_refactor_tmp` on the running Postgres (`:5432`), `prisma migrate
deploy` applied all 10 migrations (incl. `identity_command_dedup`). Fresh `npm ci` + `prisma
generate` in the worktree (no shared `node_modules`).

## VERDICT: PASS — 0 BLOCKER / 0 MAJOR / 0 MINOR (behavior preserved; safe to merge to `wave`)

---

## 1. Primary proof — BEHAVIOR PRESERVATION

| Check | Result |
|---|---|
| Full suite `npx vitest run` @ `570e0b9` | **Test Files 33 passed (33) · Tests 382 passed (382) · 0 failed** — byte-identical to the `de0d09c` baseline count (382/33) |
| `tsc --noEmit` | **0 errors** |
| `eslint .` | **0 errors / 0 warnings** |
| Final post-sabotage confirmation run | 382/33 green again (my sabotage windows left zero residue; HEAD still `570e0b9`) |

Zero regression. The refactor changed no observable behavior across the entire M1 wired + slice
surface run against real PostgreSQL.

## 2. Dead-code / helper-usage check (extraction is REAL, no orphaned path)

**`buildUserAuditInput` (`_audit.ts`)** — imported and called by **all 16 modified command files**
(19 call sites: 14 single-use + `role-management.command.ts` ×3 + `deactivate-own-account.command.ts`
×2). Every USER-attributed identity audit write now assembles its `core.append_audit_record.v1`
input through the one helper. It is a pure argument-assembler (fills only the Invariant #5 actor
fields); the command still chooses action/entity/diff/org and still calls `deps.appendAuditRecord`
on its own tx (D7 rule 6 preserved). Module-private; never re-exported through `contracts/`.

**`runTenantWrite` / `runTenantCreate` (`command-dedup.ts`)** — all **5 refactored route-handlers**
route through them, and the pre-refactor inline compositions are GONE:

| Handler | Routes through |
|---|---|
| `create-delegation-grant.route-handler.ts` | `runTenantCreate` |
| `delegation-grant-lifecycle.route-handler.ts` | `runTenantWrite` ×3 |
| `membership-tenant.route-handler.ts` | `runTenantCreate` + `runTenantWrite` ×3 |
| `organization-tenant.route-handler.ts` | `runTenantWrite` ×3 |
| `role.route-handler.ts` | `runTenantCreate` + `runTenantWrite` ×3 |

Grep of the 5 handlers for `withActiveOrg|findStoredReplay|persistWireReplay|claimStoredReplay`
shows **no surviving inline write/create composition** — the handler bodies are literally
`return runTenant*(...)`. The single inline `withActiveOrg` remaining in `role.route-handler.ts`
(line 171) is the `list_roles` **READ**, which carries no dedup/audit and was never in extraction
scope. No orphaned pre-refactor code path silently bypasses the extraction; the helper is the sole
live path.

## 3. Sabotage discrimination — helpers are on the LIVE path for ALL callers

Each sabotage neuters a guard INSIDE a shared helper, then the suite is run; byte-clean restore is
verified against the HEAD blob hash (`git hash-object` == `git rev-parse HEAD:<path>`).

| # | Helper (file) | Guard neutered | Reddened | Isolation | Restore |
|---|---|---|---|---|---|
| S1 | `buildUserAuditInput` (`_audit.ts`) | `actorType: "user"` → `"system"` | **14 tests / 7 files**: delegation-grant-slice, membership-wire, organization-wire, role-wire, upsert-buyer-profile-slice, user-account-slice, workflow-settings-wire | broad — proves the audit assembler is live for a wide command set | `df6a49d…` ✓ |
| S2 | `runTenantWrite` (`command-dedup.ts`) | §6.6 org-context collapse forced always (`if (!ran.resolved \|\| true)`) → every write returns the 404 face | **27 tests / 4 files**: delegation-wire, membership-wire, organization-wire, role-wire | exactly the 4 write route-handlers | `773dc7e…` ✓ |
| S3 | `runTenantCreate` (`command-dedup.ts`) | persist-that-completes-the-§14.3-claim neutered (line 310) → 2nd same-key create can't resolve the stored winner | **5 tests / 3 files**: delegation-wire (CREATE + §14.3 race), membership-wire (INVITE + race), role-wire (CREATE_ROLE) — each fails with the exact fail-closed throw `command-dedup: claim lost but no stored record resolved … §14.3` at `command-dedup.ts:290` | create path only; organization-wire (no `runTenantCreate` create — org-create is the inline exception) stayed GREEN | `773dc7e…` ✓ |

All three helpers are provably on the live path for **multiple distinct callers** (not one). S2 and
S3 together partition cleanly (write vs create), and S3's green organization-wire confirms the
extraction boundary (org-create deliberately stays inline) is respected. Every sabotage was reverted
byte-clean; the working tree is clean and HEAD is unchanged.

## 4. No test weakened/deleted

`git diff de0d09c 570e0b9 -- tests` → **empty (0 lines)**. `git diff --name-only … -- '**/*.test.ts'
'**/*.test.tsx' tests/` → **empty**. Not one test file was touched — not even a mechanical import
update. The 382 tests are byte-identical to the baseline and all pass against the refactored code:
the strongest possible behavior-preservation signal (the tests exercise the handlers/commands only
through their public entry points, so the refactored internals are fully covered without edits).

## 5. Observations (non-blocking — OBS, no action implied)

- **OBS-1 (pre-existing test quirk, not a refactor defect):** the mandatory-`Idempotency-Key` → 400
  branch of `runTenantWrite` is not independently reddened by a targeted sabotage — the
  `update_role`/write missing-key tests assert only `status === 400`, and a stale `new Date()`
  arrival token yields the CAS-stale 400 on the same path, so the assertion holds either way. This is
  a baseline coverage characteristic (tests unchanged); it does not affect behavior preservation.
- **OBS-2 (scope/DRY, deliberate):** other active-org-shaped write handlers (`workflow-settings`,
  `update-user-2fa`, `update-user-profile`, `deactivate-own-account`, `set-user-account-status`,
  `organization-admin`, `restore-organization`, `accept-invitation`, `create-organization`) retain
  their own inline compositions and were NOT folded into the new helpers. These files are unchanged
  from `de0d09c` (behavior trivially preserved). The boundary is intentional and documented in the
  `command-dedup.ts` header (org-create is "the one exception"; user/self writes use a `null`-org
  scope; accept/restore do not use `withActiveOrg`). Future DRY opportunity only.

## Go/No-Go

**GO — merge the refactor to `wave/2-core-platform` (behavior side).** Behavior is preserved
(382/382, tsc 0, lint 0, zero test edits), the extraction is real and live for every caller
(sabotage-discriminated across write/create/audit), and no orphaned pre-refactor path survives.
