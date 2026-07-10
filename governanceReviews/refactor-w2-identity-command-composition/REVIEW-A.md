# Review-A — Architecture & Governance Gate

**Subject:** behavior-preserving refactor of M1 (identity) command composition
**Refactor commit:** `570e0b9` (branch `refactor/w2-identity-command-composition`)
**Baseline:** `de0d09c` (M1 conformance-gate-closed `wave` state — all 8 §C sub-domains + IDN-7)
**Diff scope:** `git diff de0d09c 570e0b9 -- src/modules/identity src/server/identity` — 23 files, +403/−720
**Reviewer:** Team-4 (Review-A) · read-only · Raise ≠ Accept
**Method:** static review of **committed** content only (`git show <sha>:<file>`); working tree NOT
consulted (concurrent session churning the branch, per coordinator directive). Test suite NOT run
(see Tests §5 + Team-6 note).

---

## VERDICT: 🟢 PASS — BLOCKER 0 · MAJOR 0 · MINOR 0

The extraction is **conformance-preserving**. It drops, weakens, or alters **no** invariant the
pre-refactor code satisfied. Every route-handler guard, every §B.6 dedup leg, and every D7 audited
write is reproduced verbatim; only duplicated composition boilerplate was consolidated into shared
helpers in the same layer. **Go for merge to `wave` (conformance side).**

| Concern | Result |
|---|---|
| 1. D7 audit atomicity (`_audit.ts`) | ✓ PASS |
| 2. §B.6 command-dedup semantics (`command-dedup.ts`) | ✓ PASS |
| 3. Route-handler guard preservation (5 handlers) | ✓ PASS |
| 4. Contracts / boundary / imports / signals / events | ✓ PASS |
| 5. No test weakened/deleted | ✓ PASS |

---

## What the refactor does (two extractions)

**2A — tenant-write/create composition → `src/server/identity/command-dedup.ts` (+207).** The five
active-org handlers each hand-rolled the same composition. Two shared functions now hold it once:
- `runTenantWrite(contractId, run, mapper, isOk, invalidKey, deps)` — the CAS/machine-covered write
  (replay-lookup only, no claim). Window key **hardcoded** to `COMMAND_DEDUP_WINDOW_KEY`.
- `runTenantCreate(contractId, windowKey, run, mapper, isOk, invalidInput, deps, validateSyntax?)` —
  the create (adds the §14.3 pre-execution claim + release-on-error). Window key **parameterized**.

**2B — user-attributed audit-input assembler → `src/modules/identity/application/commands/_audit.ts`
(+59).** `buildUserAuditInput(ctx, facts)` fills ONLY the four server-resolved actor fields
(`actorId`, `actorType:"user"`, `ipAddress`, `userAgent`); every audit-relevant decision
(`action`, `entityType`/`entityId`, `oldValue`/`newValue`, `organizationId`) stays with the command
and is passed explicitly. Replaces the inline object at ~19 call sites across 17 command files.

---

## 1. D7 audited-write pattern — PRESERVED ✓

Compared pre/post for all 17 audited-write commands. Every call is a mechanical substitution of the
inline actor-object for `buildUserAuditInput(ctx, {…})`, and in **every** case:

- **Atomicity intact.** The audit still executes on the command's **own transaction executor** — the
  second argument to `deps.appendAuditRecord(input, db)` / `(input, tx)` is unchanged. `buildUserAuditInput`
  touches only the *first* argument (the input object). A throw still rolls the write back (D7 rule 1).
- **No action invented / renamed / dropped.** Actions remain the frozen domain constants, verbatim:
  `OrganizationAuditAction.PROFILE_UPDATED`, `RoleAuditAction.UPDATED/CREATED`, `DelegationGrantAuditAction.
  ISSUED/REINSTATED`, `spec.action` (suspend/revoke), `MembershipAuditAction.ACCEPTED/REMOVED`,
  `UserAccountAuditAction.DEACTIVATED/TWO_FA_SETTINGS_UPDATED`, `WorkflowSettingsAuditAction.CHANGED`,
  `BuyerProfileAuditAction.CREATED/UPDATED`.
- **Actor fields byte-identical.** `actorId: ctx.userId` · `actorType:"user"` · `ipAddress: ctx.ipAddress ?? null`
  · `userAgent: ctx.userAgent ?? null` — same nullish-coalescing.
- **Varying `organizationId` preserved in `facts`** (not defaulted): `ctx.activeOrgId` (tenant writes),
  `row.organizationId` (accept-invitation), `membership.organizationId` (deactivate per-membership leg),
  and `null` (deactivate user-record leg — Doc-2 §9 CR2 platform-scoped). All carried through unchanged.
- **Multi-site commands** (`role-management` ×3, `deactivate-own-account` ×2) each rewrite every site
  identically — no site missed, no drift between siblings.

`_audit.ts` is USER-attribution only; admin/system writes are out of its scope and untouched (none in
this diff). No BLOCKER/MAJOR/MINOR.

## 2. §B.6 command-dedup semantics — PRESERVED ✓

`runTenantWrite` and `runTenantCreate` are **verbatim liftings** of the four/three duplicated
compositions. Leg-by-leg diff against the originals:

- **Replay lookup** — `findStoredReplay(scope, windowKey, tx)` before execution; a hit returns the
  stored wire (no re-execution). Unchanged.
- **Pre-execution claim (create only)** — `claimStoredReplay` → on `"lost"`, re-read the winner and
  return it WITHOUT executing; the unreachable branch still **fails closed** with the identical
  `Error("command-dedup: claim lost but no stored record resolved …")`. Unchanged.
- **Persist / release** — success-only persist on the **same tx** (§14.3 joint rule); error-outcome
  release; thrown-failure rollback. Gated on `isOk(outcome)` (= the originals' `outcome.ok`) and
  `key !== undefined`. Unchanged.
- **POLICY-window resolution** — still via M0 `core.config_value_query.v1`: `configValueQuery` remains
  bound inside `findStoredReplay`/`claimStoredReplay` (unchanged helpers); **no literal fallback**
  introduced. No window-clock change.
- **Window-key mapping verified per call site (no swap, no weakening):**
  | Handler command | Window key (pre & post) | Path |
  |---|---|---|
  | set_membership_status / remove_member / revoke_invitation | `COMMAND_DEDUP_WINDOW_KEY` | `runTenantWrite` (hardcode) |
  | update_role / set_role_permissions / delete_role | `COMMAND_DEDUP_WINDOW_KEY` | `runTenantWrite` (hardcode) |
  | update_org_profile / transfer_ownership / soft_delete_org | `COMMAND_DEDUP_WINDOW_KEY` | `runTenantWrite` (hardcode) |
  | suspend / reinstate / revoke delegation | `COMMAND_DEDUP_WINDOW_KEY` | `runTenantWrite` (hardcode) |
  | invite_member | `MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY` | `runTenantCreate` (param) |
  | create_role | `COMMAND_DEDUP_WINDOW_KEY` | `runTenantCreate` (param) |
  | create_delegation_grant | `COMMAND_DEDUP_WINDOW_KEY` | `runTenantCreate` (param) |

  `runTenantWrite` hardcoding `COMMAND_DEDUP_WINDOW_KEY` is safe **because every non-create tenant
  write used exactly that key pre-refactor** (verified across all 4 handlers). The one longer-window
  key (`MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY`) belongs to a create and is correctly passed via the
  `windowKey` parameter. Both are real exported contract consts (`contracts/services.ts:512`, `:911`) —
  distinct values, not invented.

No dedup weakening. No BLOCKER/MAJOR/MINOR.

## 3. Route-handler guard preservation — PRESERVED ✓

Traced each slimmed handler's guards **into** the extracted helper; every guard **moved**, none was
removed. Guard-order is identical:

`session → 401 (authChallengeResponse)` → `Idempotency-Key === null → 400` (per-domain token passed
as `invalidKey`/`invalidInput`: `membershipInvalidInput` / `roleInvalidInput` / `orgInvalidInput` /
`delegationInvalidInput`) → `ensureProvisioned(session)` → `withActiveOrg` → §B.6 legs → command →
wire map → §6.6 `mapper(null)` 404 collapse on unresolved context.

- **Invariant #5 (server-validated active-org; client org id never trusted)** — context is resolved
  **only** through `withActiveOrg(session, …)`; `ctx.activeOrgId` comes from the resolved `context`,
  never from wire input. Preserved in both helpers.
- **Non-disclosure / §6.6 collapse** — unresolved membership → `mapper(null)` (the 404 face), identical
  pre/post. No 404-vs-403 leak introduced.
- **Syntax-first ordering (Doc-4A §11.2)** — invite (`validateInviteMemberInput`) and create_role
  (`validateCreateRoleInput`) still validate **before** the key leg (passed as `validateSyntax`);
  create_delegation_grant correctly **omits** it (command owns validation) — matching baseline exactly.
- **Optimistic concurrency (updated_at CAS / ETag semantics)** — enforced inside the commands (which
  are unchanged); handlers pass `updatedAt`/input straight through. `reinstate` still reshapes input to
  `{ delegationGrantId, updatedAt }` identically. Not weakened.
- **Reads untouched** — `handleListPermissions` / `handleListRoles` (incl. the per-read fail-closed
  pagination reject with each read's own frozen VALIDATION token, RV-0157 F1) are **not** part of the
  extraction and are byte-identical.

On **authz (`check_permission`)**: the handlers never held permission checks inline at baseline — authz
is enforced within the module commands (validate → authorize → write → audit). The refactor does not
touch the commands' authorize step; the injected `run` closure still invokes the same command with the
same deps. No authz guard was dropped or relocated. See Team-6 note.

No BLOCKER/MAJOR/MINOR.

## 4. Contracts / boundary / imports / signals / events — CLEAN ✓

- **`contracts/` untouched** — zero files under any `contracts/` changed (name-only diff confirms the
  23 files are all `application/commands/*`, `command-dedup.ts`, or `*.route-handler.ts`).
- **Imports legal.** `command-dedup.ts` (in `src/server/identity/`) adds `authChallengeResponse`
  (`@/shared/http`), `ensureProvisioned`/`AuthSession` (`@/server/auth`), `withActiveOrg`
  (`@/server/context`), and `COMMAND_DEDUP_WINDOW_KEY` (identity's own `contracts/`). All of these were
  **already imported by the route handlers** it absorbs — same app-layer, no new boundary crossed.
  Cross-module use of `configValueQuery` stays via `@/modules/core/contracts` (legal). `_audit.ts`
  imports **only the type** `AppendAuditRecordInput` from `@/modules/core/contracts` — type-only,
  via `contracts/` (legal per REPOSITORY_STRUCTURE §9).
- **No relocated business logic (§9).** `runTenantWrite`/`runTenantCreate` are HTTP wire-composition
  (session/provision/transaction/replay/persist), not domain rules — the same responsibility the
  handlers already held in this exact directory at baseline. Domain decisions remain in the module.
  `_audit.ts` is a pure application-layer assembler (owns no state; the application layer's mandate).
  Module-PRIVATE: `_audit.ts` follows the existing `_validation.ts` convention, is imported solely by
  sibling `*.command.ts`, and is never re-exported through `contracts/`.
- **No governance-signal write (Inv #6)** — identity module; no Trust/Performance/Financial-Tier/
  Capacity/Buyer-Status field appears anywhere in the diff.
- **`[DC-1]` zero events** — no emitter added; every handler header's "Zero §8 events" holds.
- **No cross-module DB access, no cross-schema SQL, no FK across schemas.**
- **Reference-never-restate** — no coined enum/state/slug/action/POLICY-key; every token used is a
  pre-existing frozen constant, verbatim.

No BLOCKER/MAJOR/MINOR.

## 5. No test weakened/deleted — CONFIRMED ✓

`git diff --name-only de0d09c 570e0b9` returns **exactly 23 files, none under `tests/`**. Because the
refactor changed **no public symbol** (all exported handler/command names + signatures preserved;
`_audit.ts` is private; `runTenantWrite`/`runTenantCreate` are *additive* exports; no prior export of
`command-dedup.ts` was removed — only local, non-exported `handleTenant*`/`handleLifecycle` helpers
were inlined away), the wire-slice integration suites
(`tests/integration/{delegation,membership,role}-wire-slice.test.ts`) reference the unchanged public
handlers and need no edits. No assertion was touched, softened, or removed. This is the expected
footprint of a truly behavior-preserving refactor.

---

## Go / No-Go

**GO — merge the refactor to `wave` (conformance side).** No invariant regressed; the extraction is
behavior-identical by construction across all 23 files.

## Security-sensitive flag (Team-6 follow-up — advisory, not a finding)

1. **No dropped/weakened authz guard found.** Nothing here requires a security block.
2. **Empirical confirmation recommended.** Review-A is static; I did not run the suite (working tree is
   being churned by a concurrent session). The behavior-preservation claim rests on line-by-line
   equivalence. Recommend the adversarial lane run the three identity wire-slice suites + the full
   identity integration set **green on a quiet tree** to close the loop empirically (RV-0152 concurrency
   rule).
3. **OBS (maintainability, non-blocking).** `runTenantWrite`/`runTenantCreate` now bind `deps`
   structurally and take the domain's `invalidInput` token + (for create) `windowKey` as arguments, so
   a future call site could pass a wrong token/window without a type error. All 7 current call sites are
   correct (verified above); worth a lightweight guard/test if more domains adopt these helpers.

---

*Team-4 raises; the author / presiding authority (§7) evaluates and rules. Board closes.*
