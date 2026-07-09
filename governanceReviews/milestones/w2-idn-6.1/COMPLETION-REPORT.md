# COMPLETION REPORT — Agent M1 · W2-IDN-6.1

*Per `governanceReviews/AI-Completion-Report-Template.md` (RATIFIED v1.1).*

## 0. Header

- **Role / Work item:**    Agent M1 — Identity & Organization · `W2-IDN-6.1` (Wired API — User/Account §C4, 4 contracts + `display_name` realization) · packet: `governanceReviews/milestones/w2-idn-6.1/ACTIVATION-PACKET.md`
- **Outcome:**             COMPLETE
- **Checkpoint SHA:**      `ab41526` · branch: `wave/2-core-platform`

## 1. Summary

Wired the four frozen Doc-5C §4.1 User/Account contracts on their frozen routes/methods
(`PATCH` item + 3 named `POST` commands; never `PUT`), and realized `identity.users.display_name`
end-to-end exactly per the `Doc-2_Patch_v1.0.6`/`Doc-6C_Patch_v1.0.2` pair (forward-only migration ·
Prisma column · `get_user` §C3 projection completion · bounded `update_user_profile` wire field ·
anonymization-set membership). Three of the four writes are D7-atomic audited (2FA · deactivate ·
set-status); `update_user_profile` is UNAUDITED **by frozen declaration** (Doc-4C §C4 PassB:183
`Audit: no` — the packet's "audited atomic writes ×4" is a paraphrase the frozen text overrides; see
§8 call 1). User lifecycle edges are consumed from the IDN-5 `user.state-machine.ts`; authz denial
for the Admin contract is delegated to the wired `check_permission` (staff-space never via org
roles); zero events emitted. New 8C slice: 16 tests; full suite 278/25, zero regressions vs the
262/24 baseline.

## 2. Files changed

Added:
- `prisma/migrations/20260710090000_identity_users_display_name/migration.sql`
- `app/api/identity/users/[id]/route.ts`
- `app/api/identity/users/[id]/update_user_2fa_settings/route.ts`
- `app/api/identity/users/[id]/deactivate_own_account/route.ts`
- `app/api/identity/users/[id]/set_user_account_status/route.ts`
- `src/modules/identity/api/update-user-profile.handler.ts`
- `src/modules/identity/api/update-user-2fa-settings.handler.ts`
- `src/modules/identity/api/deactivate-own-account.handler.ts`
- `src/modules/identity/api/set-user-account-status.handler.ts`
- `src/modules/identity/application/commands/update-user-profile.command.ts`
- `src/modules/identity/application/commands/update-user-2fa-settings.command.ts`
- `src/modules/identity/application/commands/deactivate-own-account.command.ts`
- `src/modules/identity/application/commands/set-user-account-status.command.ts`
- `src/modules/identity/infrastructure/data/user-account.repository.ts`
- `src/server/context/user-self.ts` (self-user context seam — `app.user_id` only, no org)
- `src/server/context/staff-context.ts` (DC-3 fail-closed staff-principal port)
- `src/server/identity/update-user-profile.route-handler.ts`
- `src/server/identity/update-user-2fa-settings.route-handler.ts`
- `src/server/identity/deactivate-own-account.route-handler.ts`
- `src/server/identity/set-user-account-status.route-handler.ts`
- `tests/integration/user-account-slice.test.ts` (the 8C slice, 16 tests)

Modified:
- `prisma/schema.prisma` (`User.displayName` 1:1 with the migration; regenerated client — never hand-edited)
- `src/modules/identity/domain/audit-actions.ts` (additive: `USER_ENTITY_TYPE` + `UserAccountAuditAction` ×4, all `[ESC-IDN-AUDIT]`-channel serializations of Doc-4C-authored interim pointers)
- `src/modules/identity/contracts/types.ts` (additive §C4 DTOs; `UserView.displayName` projection completion)
- `src/modules/identity/contracts/services.ts` (additive §C4 facades + mapper re-exports; existing exports unbroken)
- `src/modules/identity/application/queries/get-user.query.ts` (projection completion; RV-0148 `ESC-IDN-DISPLAYNAME` comment resolved)
- `src/modules/identity/infrastructure/data/authz.repository.ts` (`getUserRow` selects `display_name`)
- `src/server/context/index.ts` · `src/server/identity/index.ts` (barrel additions)
- `src/shared/http/index.ts` (additive: `parseIfMatchTimestamp` — the Doc-5C §4.3 If-Match carriage, platform-wide wire mechanics; see §10)
- `tests/integration/identity-check-permission.test.ts` (the RV-0148 `get_user` key-set pin updated to the now-complete frozen §C3 projection — ruling-realization of the display_name patch pair, not a regression mask)

Deleted: None.

## 3. Contracts changed

`src/modules/identity/contracts/{types,services}.ts` — **additive only**, all within M1:
- New DTOs/outcomes for the 4 §C4 contracts (`UpdateUserProfile*`, `UpdateUser2faSettings*`,
  `DeactivateOwnAccount*`, `SetUserAccountStatus*`, shared `UserAccountError`).
- New facades `updateUserProfile` · `updateUser2faSettings` · `deactivateOwnAccount` ·
  `setUserAccountStatus` + their context/deps type re-exports + the 4 wire mappers +
  `userAccountInvalidInput` + `validateSetUserAccountStatusInput`.
- Public constants: `DISPLAY_NAME_MAX_LENGTH` ([realization convention], see §8 call 6) and
  `SET_USER_ACCOUNT_STATUS_SLUG` (= the frozen Doc-2 §7 `staff_super_admin`, DC-3 interim binding).
- `UserView` gains `displayName` (the frozen §C3 PassB:117 projection, now complete).
Consumed (never edited): `@/modules/core/contracts` (`appendAuditRecord` — type-imported in M1,
concrete injected at the composition edge, D7 rule 4).

## 4. Migrations

- `20260710090000_identity_users_display_name` — exactly the Doc-6C_Patch_v1.0.2 DDL
  (`ALTER TABLE identity.users ADD COLUMN display_name text;`). Forward-only (Invariant 8); the
  shipped `identity_init`/`identity_authz` migrations untouched; no RLS/index/constraint/enum/seed
  change. Applied clean (`prisma migrate deploy`: "All migrations have been successfully applied");
  re-applied clean under the test bootstrap ("No pending migrations"). `check-no-cross-schema-fk`
  clean (7 files); `check-schemas` all 10 present.

## 5. Events

**Zero — audited only, per frozen truth** (M1 emits no §8 event; `[DC-1]` held — no identity event
built, none needed by any of the four wires; the deactivate cross-module cascade legs remain
out-of-wire and DC-1-blocked, only the in-module membership leg is in-transaction).

## 6. Tests

- Bands: **8C** (new `tests/integration/user-account-slice.test.ts`, 16 tests, real PostgreSQL via
  `docker compose up -d db`) + full-suite regression. Environment: local ephemeral DB (WP-1.9 CI parked).
- **Baseline delta:** full suite **278 tests / 25 files** vs dispatch baseline **262/24** — zero
  regressions; +16 new tests (1 new file); 1 existing assertion updated (the RV-0148 `get_user`
  DTO-shape pin — superseded by the owner's Option A ruling; the updated pin asserts the FULL frozen
  §C3 projection and would FAIL if `displayName` were dropped again).
- **Discrimination highlights** (how each key test fails under a wrong implementation):
  - *Frozen-unaudited discrimination:* PROFILE test asserts **zero** `user` audit rows — fails if a
    builder "helpfully" audits the profile edit (which would require an invented action).
  - *display_name bound:* max accepted / max+1 rejected / explicit-null rejected — fails under an
    unbounded field, an off-by-one bound, or absent-null conflation (Doc-4A §9.2).
  - *get_user projection:* both the slice and the updated pin fail if `displayName` is not projected
    (or if an auth-mechanism field leaks into the DTO key set).
  - *Anonymization:* asserts all six `USER_ANONYMIZATION_FIELDS` nulled AND that the audit payload
    contains none of the seeded personal strings — fails on partial anonymization or a
    redaction-defeating audit serialization.
  - *Membership consequences:* active/invited → `removed` (audited, user-attributed), `pending`
    untouched — fails if an illegal `pending → removed` edge is hand-rolled or removals go unaudited.
  - *Last-Owner:* sole active Owner → 422 + NOTHING written/audited — fails open under a fabricated
    never-block facts path (`UnresolvableOwnerRoleError` posture inherited from IDN-5).
  - *Staff-space firewall (RV-0147 B8):* a tenant member with a **forged** `role_permissions` row
    mapping `staff_super_admin` still gets 403 through the wired `check_permission` — flips to allow
    under a space-blind resolution or a shadow staff check honoring org roles.
  - *DC-3 fail-closed:* without an injected staff context, every caller (incl. the would-be admin)
    is denied — fails if the production resolver ever fabricates staffness.
  - *Rollback direction (both audited paths):* sabotaged `appendAuditRecord` → status/settings write
    rolls back, zero audit rows — fails under a split-transaction (non-D7) wiring.
  - *Idempotency (natural):* terminal deactivate replay → 404 with exactly ONE departure audit;
    same-state suspend replay → 409 `identity_user_status_conflict` with ONE audit; stale If-Match →
    409 with no write/no audit — each fails under a non-CAS write or a machine bypass.
  - *Non-disclosure:* foreign-target vs absent-target 404 bodies **byte-identical** (minus
    `reference_id`) — fails if the self-scope leg discloses existence.
  - *Prohibited inputs (server-context wins):* the 2FA audit's `organization_id` equals the
    server-resolved active org and `actor_id` the session subject although NO input can name either
    (typed surface carries no org/actor field; route mappers map declared keys only); row
    attribution (`updated_by`) server-set.
- tsc / ESLint / Prettier: green. `check-structure` / `check-no-cross-schema-fk` /
  `check-no-secrets` / `check-schemas`: green.

### As-built route/method table vs Doc-5C §4.1 (reviewer cross-derivation)

| # | Contract (verbatim) | Doc-5C §4.1 frozen | As-built | Success | Audited |
|---|---|---|---|---|---|
| 1 | `identity.update_user_profile.v1` | `PATCH /identity/users/{id}` | `PATCH /api/identity/users/[id]` | 200 | **NO (frozen §C4)** |
| 2 | `identity.update_user_2fa_settings.v1` | `POST /identity/users/{id}/update_user_2fa_settings` | `POST /api/identity/users/[id]/update_user_2fa_settings` | 200 | yes (`user_2fa_settings_updated`) |
| 3 | `identity.deactivate_own_account.v1` | `POST /identity/users/{id}/deactivate_own_account` | `POST /api/identity/users/[id]/deactivate_own_account` | 200 | yes (`user_account_deactivated` + per-membership `membership_removed`) |
| 4 | `identity.set_user_account_status.v1` | `POST /identity/users/{id}/set_user_account_status` | `POST /api/identity/users/[id]/set_user_account_status` | 200 | yes (`user_account_suspended` / `user_account_reinstated`) |

(The `/api` prefix is the established house realization — same as the delivered
`app/api/identity/buyer_profiles` D7 route. Error legs realized per Doc-5A §6.2: 400 VALIDATION ·
403 AUTHORIZATION (contract 4 only — its frozen register authors `identity_user_forbidden`) ·
404 NOT_FOUND/collapse · 409 CONFLICT · 422 BUSINESS (contract 3, `identity_user_last_owner_block`)
· 401 = the DC-4 transport auth-boundary. Optimistic token carried on `If-Match` per Doc-5C §4.3.)

### Discrimination statement per guard/leg (build-side summary)

- **User machine (consumed, never rebuilt):** `active ⇄ suspended` (set-status) and
  `active|suspended → soft_deleted` (deactivate) via `canTransitionUser` only; the same-state and
  terminal-source probes prove no hand-rolled edge exists.
- **Self-scope leg:** SYNTAX(uuid) → self-compare → §6.6 404 collapse; proven byte-equivalent to absence.
- **Admin-state leg:** affirmative = server-derived staff basis (DC-3 port, production fail-closed);
  negative = delegated to `check_permission` (staff-space firewall) — no shadow authz, proven by the
  forged-row probe; command re-checks `isPlatformStaff !== true` fail-closed (defense-in-depth).
- **Last-Owner leg:** per-org facts via the IDN-5 FOR-UPDATE resolver inside the SAME transaction as
  the guarded write (RV-0150 T6-F1 serialization contract honored).
- **Audit-atomicity legs:** tenant leg (2FA — org-anchored, `withActiveOrg`) and staff-GUC leg
  (deactivate per the frozen Doc-6C §6.2a "DELETE-anonymize = System/staff" line; set-status per the
  admin leg of the ADR-021 policy) — both rollback-proven; attribution `user`/`admin`, never
  `system`, on all caller-driven writes.

## 7. Self-review

- Self-check gates: `/ivendorz-security`-equivalent run manually (skill unavailable in this context):
  - **Org context:** no client-supplied org anywhere; active org server-resolved
    (`withActiveOrg`/`resolveActiveOrg`); self ops carry NO org authorization; Admin op carries no
    org context; every GUC transaction-local. PASS.
  - **RLS:** app-layer checks primary (explicit anchors in every repository statement); RLS legs
    used as realized (self leg / tenant audit leg / the frozen §6.2a staff legs); `is_platform_staff`
    never client-inferred (DC-3 resolver fail-closed; tests inject explicitly). PASS.
  - **Privacy/non-disclosure:** cross-user/absent collapse byte-identical 404; anonymization audit
    redaction-safe (field NAMES only); `get_user` personal-data-minimized; no auth-mechanism field
    on any surface (DC-4). PASS.
  - **Cross-module:** only `@/modules/core/contracts` consumed (type-import + edge injection); no
    cross-schema SQL (raw SQL = `set_config` GUCs + the pre-existing module-own FOR-UPDATE); no
    cross-module FK (checker clean). PASS.
- Red-Flag scan (CLAUDE.md checklist): **CLEAR** (no new module/ownership/signal change; no
  cross-module DB access; contracts-only imports; no workflow-owned state; no ADR override; no
  frozen doc modified).
- Standing-charter Never-list: no violation.
- tsc / lint / prettier: green. Full suite green (278/25).
- **Self-severity of residuals** (§13 ladder by pointer; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 ·
  MINOR 0 · NIT 1 · OBS 3 —
  - NIT-1: a stale Prisma engine artifact `generated-contracts-registry/prisma/query_engine-windows.dll.node.old-*`
    remains (gitignored; Windows file-lock workaround during `prisma generate` — delete when no
    node process holds it).
  - OBS-1: a departed user's still-live Supabase session lazily RE-provisions a fresh identity on
    the next authenticated touch (pre-existing house behavior of `ensureProvisioned`-on-every-route;
    not changed here; future-watch for the auth/session teardown story).
  - OBS-2: the D7 buyer-profile route (6.7) uses `POST` + body `updated_at` while Doc-5C freezes
    `PATCH` + `If-Match` — 6.1 realized the frozen carriage; the 6.7 "verify under full M1 gate" row
    should reconcile it.
  - OBS-3: `identity.module.ts` composition-root maps only the D7 surfaces (untouched — not in the
    packet's §4 list; the contracts facade is the consumed surface).

## 8. Open questions / ESC

- `ESC-IDN-DISPLAYNAME` — **RESOLVED consumed:** all 4 patch-pair legs realized; the RV-0148
  `get_user` comment anchor removed; registry row closes on this WP per Doc-6C_Patch_v1.0.2 §3.
- `[ESC-IDN-AUDIT]` — 4 new interim serialization tokens on the channel
  (`user_2fa_settings_updated` · `user_account_deactivated` · `user_account_suspended` ·
  `user_account_reinstated`), each bound to a documented Doc-2 §9 NEAR-POINTER that Doc-4C §C4
  itself authors/directs (Platform security-sensitive family; §9 preamble redaction rule /
  "audit redaction (event)"; the §C4-verbatim Domain Platform pointer). **Zero invented actions;
  no Flag-and-Halt needed** — every needed action had a §C4-authored interim binding.
- `[DC-1]` — held: zero identity events; no wire needed one.
- `[DC-3]` — carried: the staff-principal channel is realized as the fail-closed injectable port
  (`src/server/context/staff-context.ts`); the Admin wire is live-but-unreachable in production
  until the DC-3 staff roster/channel lands (single replacement point).
- `[DC-5]` — **no POLICY key read this WP**: no business value on this sub-domain needs one, and the
  §B.6 Idempotency-Key replay-cache (the only consumer of the dedup windows here) is the
  packet-adjudicated **IDN-6.5 carry, not 6.1** ("No further carries" §1). No literal fallback
  introduced anywhere.
- **NEW (needs a Board/channel handle):** `recovery_method : enum : optional` (Doc-4C §C4
  PassB:192) declares an enum with **no source pointer and no value set anywhere in the corpus**
  (checked Doc-2 §10.2 `two_fa`). Realized FAIL-CLOSED (a supplied value → VALIDATION reject) per
  Doc-4A §9.4 escalate-never-coin. Requires an additive value-set registration before the field is
  usable. Proposed channel: the Doc-4C patch channel (suggest handle `ESC-IDN-2FA-RECOVERY`).

- **Judgment-call log** (each FOR Review-A adjudication, never self-ratified):
  1. **`update_user_profile` NOT audited.** Frozen re-read: Doc-4C §C4 PassB:183 "Audit (§B.8):
     **no** — profile/preference edits are operational, not a Doc-2 §9 MUST-audit action" + §C12.3's
     ESC coverage list omitting user-profile change. The packet §1 ("4 contracts as audited atomic
     writes") and playbook §5 header ("all commands audited") are paraphrases; Doc-5C §4.5's "every
     mutation is audited" binds §C12.3 **by pointer** ("bound by pointer, not restated"), and
     Doc-4C outranks Doc-5C. Not Flag-and-Halt: the higher frozen text is explicit and auditing
     would force an invented action (the actual halt condition).
  2. **Optimistic token on `If-Match`.** Doc-5C §4.3 verbatim: "Updates declaring `Concurrency:
     optimistic` carry **`If-Match`** with `updated_at`". §C4's `updated_at : required` request
     field is realized with this frozen carriage (route parses the header into the typed input).
     Not Flag-and-Halt: Doc-5C owns the wire carriage (Doc-5A §9).
  3. **`recovery_method` fail-closed** (above) — RV-0148 MAJOR-2 `resource_scope_unsupported`
     precedent: never silently widen (open enum) or silently drop a declared field.
  4. **In-module membership consequences realized as legal `→ removed` edges** (active/suspended/
     invited; `pending` left — no §5.2 edge exists). §C4 authors "in-module membership consequences
     only" without enumerating; the machine constrains the realization; removals audited with the
     ENUMERATED §9 "membership remove" action. Not Flag-and-Halt: no frozen text contradicted; the
     machine is consumed, not extended.
  5. **Anonymization set = email · phone · display_name · two_fa_jsonb · preferences_jsonb ·
     auth_user_id** (exported `USER_ANONYMIZATION_FIELDS`). Doc-2 §10.2 "anonymize on departure" +
     Patch v1.0.6 ("with the rest of the user's personal fields"); `auth_user_id` included as the
     person's auth-account linkage (DC-4) — severing it makes departure terminal for the record.
     Audit payload carries field NAMES only (recording values would defeat the §14.3 redaction).
  6. **`DISPLAY_NAME_MAX_LENGTH = 120`** — [realization convention] per Doc-5C §0.4 (the frozen
     token is `bounded` with no named corpus bound and no registered POLICY key; the patch pair says
     "bound per the Doc-4A validation conventions, realized at W2-IDN-6.1"). Named constant on the
     contracts face; a future POLICY-key additive may supersede.
  7. **Audited-self-op context legs:** 2FA runs inside `withActiveOrg` because the ADR-021 tenant
     audit leg mechanically requires the org anchor for a `'user'`-attributed row (audit context per
     D7 rule 8, NOT an authorization gate; no-membership ⇒ fail-closed 404 rather than an unaudited
     write). Deactivate runs under the staff-GUC leg because the frozen Doc-6C §6.2a line
     "(INSERT at provisioning / DELETE-anonymize = System/staff)" names that mechanism for exactly
     this write (the WP-1.3 provisioning precedent); attribution stays `user`.
  8. **Non-staff deny = 403 `identity_user_forbidden`** (not the 404 collapse): the frozen §C4
     register authors the AUTHORIZATION row for this contract; the deny discloses only the caller's
     own lack of staff authority (target resolved only after the staff gate).
  9. **Idempotency-Key header not required at the wire** — the §B.6 replay-cache store is the
     packet-adjudicated IDN-6.5 carry (and no frozen Doc-6C table exists to back it); natural
     idempotency (CAS + machine legality + terminal collapse) realized and tested. Raised for
     Review-A visibility as a knowing partial of Doc-5A §9 pending the 6.5 carry.
  10. **RV-0148 test pin updated** (`identity-check-permission.test.ts` `get_user` key set): the old
      pin encoded the pre-ruling omission; the new pin encodes the frozen §C3 projection —
      ruling-realization (the RV-0149→6.5 "update the pin" precedent), not a regression mask.
  11. **Path `{id}` realized as `input.targetUserId`** validated in the commands (SYNTAX → scope),
      so the Doc-4A §11.2 category order holds end-to-end (a malformed id is 400 before the 404
      collapse; a non-staff caller's malformed request is 400 before the 403).

## 9. Checkpoint

- `ab41526` — `feat(identity): W2-IDN-6.1 §C4 user/account wired API (4 contracts) + display_name
  end-to-end realization [checkpoint]` — bounds the ENTIRE WP delivery (migration + Prisma + domain
  constants + contracts + repository + 4 commands + 4 mappers + 2 context seams + 4 compositions +
  4 routes + shared If-Match helper + 8C slice + the pin update). Only W2-IDN-6.1 files staged
  (coordinator's tracker/template edits excluded).

## 10. Packet gaps

Files read beyond the packet's §2/§3/§4 lists (minimum needed; for Team-8 packet maintenance):
- `prisma/migrations/20260630090000_audit_context_append_policy/migration.sql` +
  `…identity_init/migration.sql` + `…core_init/migration.sql` — the ADR-021 audit-INSERT policy and
  `users` RLS legs are load-bearing for WHERE each audited write can run; the packet cited the D7
  reference but not the policy DDL.
- `src/modules/identity/application/commands/provision-identity.command.ts` (+ grep of the System
  timers) — the frozen Doc-6C §6.2a staff-GUC precedent the deactivate transaction follows.
- `src/modules/identity/domain/policies/last-owner-protection.policy.ts` +
  `src/modules/identity/infrastructure/data/membership-lifecycle.repository.ts` — the §C4 Last-Owner
  guard + RV-0150 T6-F1 serialization resolver the deactivate command consumes (packet §4 listed the
  state machine + audit-actions but not the guard pair).
- `src/server/auth/provisioning.ts` · `src/server/context/active-org.ts` ·
  `src/server/context/with-active-org.ts` — the concrete composition seams behind the §4 pointer
  "src/server/authz + src/server/context (consume)".
- `src/shared/http/index.ts` (+ **edited additively**: `parseIfMatchTimestamp`) and `src/shared/db`
  — the Doc-5A wire envelope home; the If-Match carriage is cross-module wire mechanics and had no
  packeted home (flagging the edit explicitly for Review-A).
- `src/modules/identity/domain/policies/permission-resolution.policy.ts` +
  `application/queries/check-permission.query.ts` — required to bind the RV-0147 B8 staff-space leg
  without shadow authz.
- Doc-5C Pass-1 §2/§3 + Doc-2 §7 staff-slug paragraph + the `identity_catalog_seed` migration —
  route inventory context, actor-type determination (§3.2), and the `staff_super_admin` catalog
  binding (the packet named "Doc-5C §C4 routes"; the §3 context model and §3.2 admin-basis rule were
  necessary to realize the Admin leg).
- `tests/integration/membership-org-lifecycle-slice.test.ts` (+ greps of the delegation slice) —
  the house 8C fixture/assert shape.

## 11. Readiness

- **Next gate:** Review-A at `ab41526` · **Team-6 pre-flag: YES** — security surfaces:
  account-takeover/lockout (`set_user_account_status` staff gate + the DC-3 fail-closed port + the
  RV-0147 B8 forged-row leg), personal-data anonymization (`deactivate_own_account` — the
  redaction-safe audit + the six-field set + terminal replay), and the 2FA-settings surface (DC-4
  settings-only; fail-closed recovery_method). All three carry live discriminating probes in the 8C
  slice for T6 to extend.
- **Blocked on:** nothing.
- **Suggested next work item:** `W2-IDN-6.2` (Organization sub-domain — consumes the same D7/If-Match
  /context patterns; its packet already carries the RV-0150 serialization-contract obligation).

## 12. Carries emitted (outbound)

| Target | Obligation | Class |
|---|---|---|
| Board / Doc-4C patch channel | Register the `recovery_method` enum value set (no corpus source exists); until then the field is fail-closed VALIDATION-rejected (suggest `ESC-IDN-2FA-RECOVERY`) | binding — Board action |
| `W2-IDN-6.5` packet | §B.6 Idempotency-Key replay-cache (already the adjudicated carry) should note 6.1's wires as consumers once the store lands (retro-fit the header requirement across §4 wires) | fold-in |
| `W2-IDN-6.7` (buyer-profile verify under full M1 gate) | Reconcile the D7 route with the frozen Doc-5C carriage: `PATCH /identity/buyer_profiles` + `If-Match` (as-built: `POST` + body `updated_at`) — 6.1 realized the frozen form; 6.7's verification row owns the delta | fold-in |
| DC-3 resolution WP (staff channel) | Replace exactly `src/server/context/staff-context.ts`'s production resolver; the Admin wire + tests are already live behind the port | future-watch |
| Auth/session teardown (future) | Departed-user live session lazily re-provisions a fresh identity (`ensureProvisioned` on every route — pre-existing) — decide sign-out/inviteless posture | future-watch |
| Team-8 hygiene | Delete the gitignored stale `query_engine-windows.dll.node.old-*` artifact when unlocked | fold-in |

## Frozen Authority Checklist

Before execution, the assignee confirms:

☑ All cited documents are frozen. (Doc-4C §C3/§C4 PassB · Doc-2 v1.0.6 patch + Doc-6C v1.0.2 patch
  · Doc-5C Pass-1/Pass-2 · Doc-5A Pass-3 §6 · Doc-4A Pass-3 §9/§11 · Doc-2 §9/§10.2 — all located
  via `CORPUS_INDEX.md`.)
☑ Every cited section has been re-read verbatim. (Including the two places where the verbatim text
  overrode the packet's own paraphrase — §8 calls 1 and 2.)
☑ No draft document is treated as authority. (Playbook/tracker consumed as WP definitions only;
  frozen text governed every conformance decision.)
☑ Any uncertainty results in Flag-and-Halt. (None reached the halt bar: every needed audit action
  had a Doc-4C-authored §9 near-pointer; the one genuine corpus gap — the `recovery_method` enum —
  is realized fail-closed and escalated in §8/§12 rather than resolved locally.)
