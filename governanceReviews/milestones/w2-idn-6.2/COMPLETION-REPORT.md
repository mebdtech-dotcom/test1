# COMPLETION REPORT — Agent M1 · W2-IDN-6.2

## 0. Header
- **Role / Work item:**    Agent M1 — Identity & Organization · `W2-IDN-6.2` (Wired API · Organization, §4 — 7 contracts) · packet: `governanceReviews/milestones/w2-idn-6.2/ACTIVATION-PACKET.md`
- **Outcome:**             COMPLETE
- **Checkpoint SHA:**      `aec1562` (implementation + the 4 authorized RV-0153 folds) · branch: `wave/2-core-platform`

## 1. Summary
All seven Doc-5C §4.1 Organization contracts (rows 5–11) are wired on their frozen routes as audited, §B.6-deduped writes: create (bootstrap, 201+Location, pre-execution claim), update-profile (the one §C5 `Concurrency: optimistic` contract — If-Match/ETag), transfer-ownership and admin-recover-ownership (the two frozen-text-derived §5.5-guarded commands, each passing its OWN transaction to the RV-0150 FOR-UPDATE resolver), soft-delete (ADR-012 DELETE; in-module membership cascade only — every cross-module leg [DC-1] out-of-wire), restore (dual-leg Owner/Admin with marker-scoped un-cascade + §5.1 slug regeneration), and set-organization-status (Admin 21.6, deny-by-construction non-staff leg). The IDN-5 org machine is consumed, never rebuilt; the four RV-0153 B-fold NITs landed. New 8C+8E slice (15 tests incl. two discriminating race probes); full suite 319/27 with zero regressions vs the 301/26 baseline.

## 2. Files changed
Added:
- `src/modules/identity/infrastructure/data/organization-lifecycle.repository.ts`
- `src/modules/identity/application/commands/create-organization.command.ts`
- `src/modules/identity/application/commands/update-organization-profile.command.ts`
- `src/modules/identity/application/commands/transfer-ownership.command.ts`
- `src/modules/identity/application/commands/soft-delete-organization.command.ts`
- `src/modules/identity/application/commands/restore-organization.command.ts`
- `src/modules/identity/application/commands/set-organization-status.command.ts`
- `src/modules/identity/application/commands/admin-recover-ownership.command.ts`
- `src/modules/identity/api/organization.handler.ts`
- `src/server/identity/create-organization.route-handler.ts`
- `src/server/identity/organization-tenant.route-handler.ts`
- `src/server/identity/organization-admin.route-handler.ts`
- `src/server/identity/restore-organization.route-handler.ts`
- `app/api/identity/organizations/route.ts`
- `app/api/identity/organizations/[id]/route.ts`
- `app/api/identity/organizations/[id]/transfer_ownership/route.ts`
- `app/api/identity/organizations/[id]/restore_organization/route.ts`
- `app/api/identity/organizations/[id]/set_organization_status/route.ts`
- `app/api/identity/organizations/[id]/admin_recover_ownership/route.ts`
- `tests/integration/organization-wire-slice.test.ts`

Modified:
- `src/modules/identity/contracts/types.ts` (additive §C5 DTO block)
- `src/modules/identity/contracts/services.ts` (additive §C5 facades/re-exports; existing exports unbroken)
- `src/modules/identity/domain/audit-actions.ts` (additive Organization token block)
- `src/modules/identity/infrastructure/data/membership-lifecycle.repository.ts` (additive: shared `findOwnerSystemBundleRole` + shared `lockActiveOwnerRows` + `resolveOwnershipRecoveryFacts`; `resolveOwnerRemovalFacts` behavior unchanged — same lock statement, now shared)
- `src/server/identity/index.ts` (additive exports)
- `src/modules/identity/infrastructure/data/delegation-grant.repository.ts` (fold NIT-1)
- `src/modules/identity/domain/state-machines/delegation-grant.state-machine.ts` (fold NIT-2)
- `tests/integration/delegation-wire-slice.test.ts` (folds NIT-3 + NIT-4)

Deleted: none.

## 3. Contracts changed
`src/modules/identity/contracts/{types,services}.ts` — ADDITIVE ONLY (M1-owned):
- 7 new input/result/outcome DTO families + `OrganizationError` (frozen §C5 register codes by pointer).
- 7 new facades (`createOrganization` · `updateOrganizationProfile` · `transferOwnership` · `softDeleteOrganization` · `restoreOrganization` · `setOrganizationStatusService` · `adminRecoverOwnership`) + context/deps type re-exports + wire-mapper re-exports (One-Owner: M1's `api/`).
- Frozen slug bindings face-exported: `TRANSFER_OWNERSHIP_SLUG = can_transfer_ownership` · `DELETE_ORGANIZATION_SLUG = can_delete_organization` (Doc-2 §7, Owner-only) · `SET_ORGANIZATION_STATUS_SLUG` / `ADMIN_RECOVER_OWNERSHIP_SLUG = staff_super_admin` (DC-3 interim, §C5-authored).
- Realized bounds face-exported (RV-0152 NIT-B3 symmetry): `ORG_NAME_MAX_LENGTH` · `SUCCESSION_REASON_MAX_LENGTH` · `DELETE_REASON_MAX_LENGTH` · `ORG_ADMIN_REASON_MAX_LENGTH` — [realization convention]s, no corpus bound exists.
- `resolveOwnershipRecoveryFacts` added to the documented resolver face (same RV-0150 lock statement — the recovery leg of the SAME contract).
Consumed only: `@/modules/core/contracts` (`appendAuditRecord`, `allocateHumanReference`, `configValueQuery` via the §B.6 store) — never edited.

## 4. Migrations
None. Zero migration files; all tables pre-exist (Doc-6C). The packet's "NO migration expected" held — the §C5 fields with no frozen column (`org_type`/`address`/`contact_info`/`brand_assets_ref`) were FAIL-CLOSED, not realized (judgment call 8), so the Flag-and-Halt condition never triggered.

## 5. Events
Zero (frozen truth for this module: M0/M1 emit no §8 events — Doc-2 §8; every §C5 contract states `Events: none`). No outbox write anywhere in the diff. The soft-delete/restore/status cross-module cascade legs (M2 vendor profile, M3 RFQs) are OUT-OF-WIRE and [DC-1]-blocked (Doc-5C §7.4) — no identity event, no cross-module call, no cross-schema write; only the in-module `identity.memberships` cascade leg is realized.

## 6. Tests
Bands: **8C** (registers · envelope · idempotency/replay incl. the create claim · actor-scope · non-disclosure byte-collapse · prohibited fields) + **8E** (org machine edges through the wire, rejected-status-unchanged · §5.5 guards discriminating-tested incl. the two RV-0150 concurrency race shapes) — `tests/integration/organization-wire-slice.test.ts`, 15 tests, real PostgreSQL (`docker compose up -d db`), composition surfaces only.
- New slice: **15/15 PASS** (first run). Folded delegation slice: **18/18 PASS** (was 15 — +3 NIT-4 parameterized revoke legs).
- **Baseline delta:** full suite **319 tests / 27 files** vs dispatch baseline **301/26** — delta = +18 tests (+15 new slice, +3 NIT-4 rows), +1 file; **zero regressions**. Eight full-suite runs: six ALL-PASS including **3 consecutive ALL-PASS (runs 6–8)**; two runs showed exactly 1 failure = the pre-acknowledged WI-CAS-FLAKE (`outbox-dispatch-hardening.test.ts` CAS-race reproduction, the standing W2-CORE-4 fold-in; run 1's failure identified by name, run 3's by identical count-1 signature). No W2-IDN-6.2 path failed in any identified run.
- **Discrimination highlights:**
  - *Transfer race probe:* transfer(A→B) fired concurrently with deactivate(B). Without the FOR-UPDATE serialization both legs read compatible pre-facts (B not an owner; B holds an active membership) and both commit — the org's sole Owner would be a departed user. The probe asserts NOT-both-ok plus the post-state invariant (≥1 live active Owner whose user is `active`) — a serialization removal turns it red.
  - *Recovery race probe:* two concurrent recoveries on one orphaned org (no org-row CAS exists to discriminate them — the recovery never touches the org row). Without the lock both read `actingActiveOwnerCount = 0` and both commit (double recovery). The probe asserts exactly `[200, 422]`, the loser's code = `identity_org_recovery_invalid`, and exactly ONE recovered Owner + ONE recovery audit row.
  - *Create claim:* two racing same-key creates → byte-equal envelopes (incl. `reference_id`), exactly one org/audit/human_ref — removing the claim leg re-opens RV-0153 F2's double-commit and reddens the byte-equality.
  - *Matrix idiom:* every illegal wire edge asserts the status column unchanged after the 409/404 (restore-on-active, suspend-on-suspended, delete-on-soft-deleted).
  - *D7 rollback:* a throwing audit facade inside the tenant tx must roll the org write back (name unchanged, zero audit rows) — an audit-decoupled write turns it red.
  - *Marker-scoped un-cascade:* a pre-existing SD membership (different `delete_reason`) must SURVIVE restore untouched — a blanket un-delete turns it red.

## 7. Self-review
- Self-check (/ivendorz-security-equivalent, manual sweep): org context server-resolved everywhere (`withActiveOrg` / bootstrap `resolveSelfUser` / DC-3 staff port; client org id never trusted — path `{id}` is checked against the resolved context, never adopted); RLS backstop legs documented per surface (tenant GUCs / frozen §6.2a bootstrap + restore staff-GUC mechanism, attribution never System); non-disclosure byte-collapse tested on update/transfer/restore probes; no governance-signal read/write; no cross-module table access, import, or FK (org repo + membership repo touch `identity.*` only; M0 consumed via contracts).
- Red-Flag scan (CLAUDE.md checklist): **CLEAR** — no new module, no ownership change, no signal touch, no cross-module DB access, no event, no frozen-doc edit, workflows own no state.
- Standing-charter Never-list: no violation.
- tsc: green · ESLint (WP surface: `src/modules/identity/**`, `src/server/identity/**`, `app/api/identity/organizations/**`, both touched test files): green · Prettier: green (WP surface). NOTE: full-tree `eslint .` currently CRASHES on the pre-existing external working-tree state (`app/template.tsx` deleted in the tree by parallel frontend work — out of this WP's scope, untouched per packet §5); `scripts/check-structure.mjs` / `check-no-cross-schema-fk.mjs` / `check-no-secrets.mjs` green; `check-schemas.mjs` fails env-gated (`DIRECT_URL` unset in a bare shell — pre-existing, same class RV-0153 recorded plainly).
- **Self-severity of residuals** (CLAUDE.md §13 by pointer; Raise ≠ Accept): BLOCKER 0 · MAJOR 0 · MINOR 0 · NIT 0 · OBS 3 — (1) `identity_org_quota_exceeded` and `identity_org_last_owner_block` are register-faithful but unreachable in-wire today (§8 calls 9/15); (2) full-suite reproducibility rides the known WI-CAS-FLAKE (see §6); (3) a committed soft-delete destroys the caller's own active-org context, so a later same-key §9.3 replay collapses to 404 (§8 call 12 — the ratified 6.1 deactivate terminal-collapse class).

## 8. Open questions / ESC
ESC dispositions (cited, none raised new):
- **`ESC-WIRE-FIELD-CASING` (🟥 owner-pending) — CARRIED as instructed:** all seven `result` payloads built in the ratified house shape (camelCase — the 6.1/6.5 wires); reviewers treat as carried, not new. Conditional casing sweep lands with the owner's ruling.
- **`[ESC-IDN-AUDIT]`** — 3 of the 8 new tokens are §C5-AUTHORED near-pointers (`organization_profile_updated` PassB:263 · `organization_suspended`/`organization_reinstated` PassB:320); the other 5 bind ENUMERATED Doc-2 §9 Organization actions ("create" · "ownership change/succession" ×2 · "soft delete/restore" ×2). Zero invented.
- **`[ESC-IDN-SLUG]`** — carried on `update_organization_profile` (frozen interim Owner/Director authority; the D7 buyer-profile realization reused — no slug coined).
- **`[DC-1]`** — held: zero identity events; cascade strictly in-module; cross-module legs unbuilt.
- **`[DC-5]`** — `identity.command_dedup_window` read via the M0 config service (unseeded until IDN-7; test-scoped seed per the IDN-4 precedent).
- **Board-channel candidate (not an ESC yet):** §C5's `org_type` / `address` / `contact_info` / `brand_assets_ref` request fields have NO realized `identity.organizations` column (Doc-2 §10.2 / Doc-6C §3.2 verbatim — checked against the Prisma schema); realized FAIL-CLOSED (VALIDATION reject on supply). One additive Doc-2 §10.2 + Doc-6C patch would realize them — same class as the 6.7 `approval_settings` deferral and `ESC-IDN-PREF-KEYS`.

**Judgment-call log** (every call FOR Review-A adjudication; none self-ratified):
1. **Guarded set = {`transfer_ownership`, `admin_recover_ownership`} — the packet's four-name candidate list dissolves to TWO under verbatim re-read.** Re-read: §C5 validation matrices PassB:273 (transfer: "BUSINESS (Last Owner Protection … §5.5)") and :330 (recovery: "BUSINESS (recovery only where no active Owner can act, §5.5; result satisfies Last Owner Protection)") vs :287 (soft-delete BUSINESS = "cascade preconditions" — no §5.5 pointer) and :316 (set-status BUSINESS = "reason recorded" — no §5.5 pointer); Master Architecture §5.5's succession trigger is "an owner ACCOUNT becomes disabled" (org suspension disables the org, not an owner account); Doc-2 §5.1's cascade itself soft-deletes Owner memberships by frozen mandate, so the ≥1-Owner guard reads on live orgs, not org termination. Not Flag-and-Halt: the packet itself instructs "confirm the exact guarded set from the frozen text"; no corpus conflict — a packet paraphrase dissolved (the packet's own predicted class).
2. **Soft-delete/set-status concurrency posture (the boundary note for call 1):** soft-delete's membership cascade UPDATEs the very rows the RV-0150 resolvers lock FOR UPDATE, so it serializes against transfer/recovery/deactivate on row locks + the org-row CAS; set-status writes only the org row (CAS-guarded) and no membership. Neither needs the resolver. Documented in the soft-delete command header.
3. **Transfer "reassigns the Owner role" realized as a role MOVE:** nominee's membership → the seeded Owner bundle; the acting membership — when itself Owner-bound — takes the nominee's former role; a non-Owner-bound actor (custom role holding the slug) keeps its role. Re-read: §C5 State Effects PassB:275 verbatim ("reassigns the Owner role on `memberships`"); least-coining total realization (no demotion rule invented; no orphan role state). Not F&H: the frozen text names the effect, not the mechanism.
4. **Transfer advances the ORG row's concurrency token (attribute-less aggregate-root touch, CAS on `updated_at`):** makes the frozen response `updated_at : timestamp : always` truthful, realizes the register's `identity_org_update_conflict` losing-write leg (Doc-5A §9.4), and serializes transfer against org-row mutations (e.g. a racing soft-delete). Re-read: PassB:271/272/274. Not F&H: no business column changes; the aggregate root is the org.
5. **Post-lock fact re-reads in transfer:** every fact the succession decision consumes is (re)resolved AFTER `resolveOwnerRemovalFacts` takes the lock — a pre-lock nominee read can go stale while the command blocks on a concurrent departure's lock (the departing nominee's row is NOT in the locked set, but the departure command takes the same lock before writing, so the post-lock re-read is serialized). This is the T6-F1 contract applied strictly ("facts resolved AND guarded write applied within ONE transaction"), surfaced explicitly because the naïve read-then-lock order re-opens the race. The recovery resolver reads its nominee inside the resolver (post-lock) by construction.
6. **`updated_at` carriage per contract (the packet's binding instruction + RV-0153 call-1):** If-Match/ETag ONLY on `update_organization_profile` (the sole §C5 `Concurrency: optimistic` declaration — §B.6 PassB:262 "optimistic on `updated_at`"); the other five `updated_at : required` fields ride the request BODY (§C9 model). Disclosed divergence: the 6.1 §C4 wires carried all four via If-Match — the 6.2 packet instruction ("check each contract's verbatim declaration, never assume") governs here; the 6.1 shape stands as reviewed, unreopened.
7. **Stale-token error class per register (never a blanket):** register authors CONFLICT → stale/losing → that code, 409 + `ETag` (`identity_org_update_conflict` on update/transfer/soft-delete; `identity_org_status_conflict` on set-status — grounded in Doc-5A §9.4/§9.5); register authors NO CONFLICT → stale → in-register VALIDATION 400 (restore, recovery — the RV-0149/RV-0153-call-1 ratified posture); a LOSING concurrent restore → in-register STATE 409 + `ETag` (the 6.5 losing-write leg discipline). Machine-illegal edges NEVER carry `ETag` (RV-0152 call-13).
8. **Deferred §C5 fields FAIL-CLOSED (`org_type`/`address`/`contact_info` on create; `address`/`contact_info`/`brand_assets_ref` on update):** no frozen `identity.organizations` column exists (Doc-2 §10.2/Doc-6C verbatim; Prisma schema checked); realizing one needs a migration — the packet's halt condition. Chosen posture: VALIDATION-reject a SUPPLIED value (escalate-never-widen, the RV-0152 F1 doctrine) rather than the 6.7 silent-omit (silently dropping a supplied VO fabricates success). Not F&H: nothing was built against the corpus; the fields are deferred exactly like `approval_settings`, with the Board-channel candidate in §8.
9. **Per-user org-count cap NOT enforced:** the frozen POLICY leg is conditional ("if configured `[DC-5]`") and Doc-3 v1.9 §5 explicitly registers NO such key ("not coined here") — the conditional resolves to absent; `identity_org_quota_exceeded` is unreachable until a follow-up additive registers the key. Never a literal cap.
10. **`is_personal_org` never client-honored:** `true` + live personal org → the frozen duplicate-personal-org guard (`identity_org_personal_exists`, CONFLICT 409); `true` otherwise → VALIDATION reject ("server-set … not client-trusted" — PassB:242; the wire never mints a personal org; only Solo-Trader auto-create does).
11. **Soft-delete cascade vehicle = the SD tuple with a stable marker (`organization soft delete cascade (Doc-2 §5.1)` in `delete_reason`), membership `state` untouched; ONE org-level audit row carrying the cascade count.** Re-read: Doc-2 §5.2 defines NO soft-deleted membership state (the cascade is not a §5.2 transition — no enumerated per-membership audit action applies; contrast the 6.1 departure's `→ removed` legal edges, which were audited per row); §C5 Audit PassB:291 declares ONE action ("soft delete/restore") with Mutation-Scope naming both tables. `delete_reason` is Doc-2 §0.2 free text (the 6.1 `DEPARTURE_DELETE_REASON` precedent) — no enum coined.
12. **Restore semantics:** (a) un-cascade is MARKER-SCOPED — only rows the org-delete cascade SD-marked are revived; pre-existing SD rows survive (tested); grounded in §C5 AI-notes PassB:308 "restore reactivates only the org + in-module rows". (b) Self-leg authority resolves the caller's ACTIVE-state membership ADMITTING cascade-marked rows + `resolveGrantedTenantSlugs` (`can_delete_organization`) — the frozen contract grants the Owner of a soft-deleted org restore authority, and the live-rows-only `check_permission` root can never affirm it; realized over the SAME org-anchored substrate the root uses (the 6.5 in-module AUTHZ precedent), scoped to this single contract — not a parallel authorization model. (c) Slug regeneration = re-derivation from the never-reused `human_ref` (canonical lowercase; org-id-tail suffix if even that is live-held — unreachable today); `slug_regenerated` truthful. (d) A committed soft-delete removes the caller's live membership, so a later same-key §9.3 replay of the DELETE collapses to 404 — the ratified 6.1 deactivate terminal-collapse class (non-disclosure of a destroyed context beats replay fidelity).
13. **`set_organization_status` resolves LIVE rows only** — a soft-deleted target yields the frozen 404, not STATE: the machine's `soft_deleted → active` edge exists but belongs to the RESTORE command ("each transition is its named command", Doc-5C §4.2); admitting it here would let the status command realize another command's transition.
14. **Recovery nominee legs (the frozen "membership creatable/active" REFERENCE leg):** nominee user missing → `identity_user_not_found` (REFERENCE); nominee user non-active → `identity_org_recovery_invalid` (an owner who cannot act cannot satisfy §5.5's result clause in substance); ACTIVE membership → role reassigned to the Owner bundle; NO live membership → an ACTIVE Owner membership CREATED (the WP-1.3 founding-membership class — frozen precedent for creating a membership `active` outside the §5.2 invite flow); any other membership shape (invited/pending/suspended/removed) → `recovery_invalid` fail-closed. The decision flows through `evaluateOwnershipSuccession` (facts: nominee-eligible, resulting count 1).
15. **`identity_org_last_owner_block` (transfer) is defensively realized but unreachable in-wire today:** with an active nominee the swap always leaves ≥1 active Owner, so the succession policy cannot fail on the count. The guard + register row are retained fail-closed (a future realization change re-arms them); the frozen register is a superset the wire need not exhaust (the quota_exceeded class).
16. **§B.6 shapes per contract:** REQUIRED-field `idempotencyKey` deps on every NEW composition (the 6.5 model — RV-0153 OBS-2 honored; only the pre-existing 6.1 retro-fits keep `?`). Claim leg on CREATE only (RV-0153 F2 — no CAS/machine coverage); the tenant trio persist in-tx (the 6.5 lifecycle shape); the admin pair + restore persist post-commit under `withUserSelfContext`/own-tx — duplicate-safe by machine/precondition (re-execution → same-state 409 / recovery_invalid 422 / restore-not-soft-deleted 409; the 6.1 admin logged-call class). Dedup scopes: create/restore/set-status/recover org = `null` (bootstrap/no-org-context legs — the 6.1 admin org-less precedent); update/transfer/soft-delete org = the resolved active org.
17. **`resolveOwnershipRecoveryFacts` added as the recovery leg of the documented RV-0150 resolver face** — the SAME `lockActiveOwnerRows` statement (extracted, verbatim WHERE), so all three §5.5 fact resolvers serialize on ONE lock set; not a new pattern, an extension of the contract the resolver docstring + contracts face already document (both updated).
18. **AUTHZ (category 3) before SCOPE (category 4)** in the three tenant commands, per the frozen §C5 matrices/Doc-4A §11.2 — a non-privileged caller probing a foreign `{id}` receives 403 (its OWN permission gap; disclosure-safe), a privileged one 404 (byte-identical to nonexistent).
19. **Bootstrap/restore staff-GUC transactions:** create runs in a composition-owned tx with the frozen Doc-6C §6.2a provisioning leg (`app.is_platform_staff='true'` transaction-local — a NEW org can satisfy no tenant WITH CHECK before existing; the WP-1.3 mechanism); restore likewise (a soft-deleted org has no resolvable tenant context; the 6.1 deactivate mechanism). MECHANISM, not attribution — audit rows stay User-attributed (self legs) / Admin-attributed (admin legs); never System.
20. **Org name/reason bounds** (`ORG_NAME_MAX_LENGTH = 200`, reason/reason_code bounds = 500) — [realization convention]s, face-exported (RV-0152 NIT-B3/call-6 class; no corpus bound or POLICY key exists; `length-bounded` is the frozen constraint's own word).

## 9. Checkpoint
- `aec1562` — `feat(identity): W2-IDN-6.2 org wired API (7 §C5 contracts) + RV-0150 serialization on transfer/recovery + RV-0153 B-folds [checkpoint]` — bounds the full implementation (28 files: 20 added, 8 modified) + the four authorized fold touches. ONLY W2-IDN-6.2 files; coordinator governance files and the external frontend/motion working-tree changes untouched.
- (This report + the activation packet land in a follow-up record commit — the 6.1 `f14cb6f` precedent.)

## 10. Packet gaps
Files read beyond the packet's §2–§4 lists (each needed, none contradicted the packet):
- `generatedDocs/Doc-4M_Patch_v1.0.1.md` — named in packet §2 row 3 by title; read verbatim (org rows as patched).
- `prisma/schema.prisma` (Organization/Membership models) + `prisma/migrations/20260709130000_identity_catalog_seed/migration.sql` — required to verify the deferred-field column absence (call 8) and the seeded bundle slug composition (Owner-only `can_transfer_ownership`/`can_delete_organization`; org_id NULL rows).
- `src/modules/identity/infrastructure/data/{authz,buyer-profile,user-account}.repository.ts` + `src/modules/identity/application/commands/{set-user-account-status,suspend-revoke-delegation-grant,provision-identity,upsert-buyer-profile}.command.ts` + `src/server/context/*` + `src/shared/http/index.ts` + `src/modules/identity/api/{update-user-profile,set-user-account-status,create-delegation-grant}.handler.ts` + `app/api/identity/users/[id]/**` + `tests/integration/user-account-slice.test.ts` — the house precedents the packet cites by class ("the 6.1 composition set", "the 6.5 primitives"); the concrete file set is wider than §4's summary lines. Suggest future §4 rows name the context/authz seam files explicitly.
- Doc-4C §C4 rows (PassB:165–227) — needed to ground the If-Match divergence call (call 6) against the 6.1 declarations.
Packet §2 row 4's "§7.4 (DC-1 cascade)" resolves to **Doc-5C Pass2 §7.4**, not a playbook §7.4 (the playbook has no §7.4) — read as intended; note for Team-8 pointer hygiene.

## 11. Readiness
- **Next gate:** Review-A at `aec1562` (+ the record commit). **Team-6: YES** — pre-flagged surfaces: ownership transfer + admin recovery (org-takeover), org suspension (lockout), Last-Owner under concurrency (the §5.5 law), the restore self-leg authority over cascade-marked memberships, and the bootstrap/restore staff-GUC transactions.
- **Blocked on:** nothing. (`ESC-WIRE-FIELD-CASING` is owner-gated program-wide; carried, non-blocking per the packet.)
- **Suggested next work item:** W2-IDN-6.3 (Membership) — it consumes the same resolver contract and inherits binding carries below.

## 12. Carries emitted (outbound)
| Target | Obligation | Class |
|---|---|---|
| **W2-IDN-6.3 packet §1** | The §5.5-guarded MEMBERSHIP commands (`remove_member`; `set_membership_status` suspend-leg) must pass their OWN tx to `resolveOwnerRemovalFacts` and re-read facts POST-lock (call 5's stale-pre-lock-read lesson) + one discriminating race probe per class | binding packet carry |
| **W2-IDN-6.6 packet §1** | Suspended-org live-path denial (RV-0150 OBS-B1): 6.2 realizes only the `active ⇄ suspended` TRANSITION; `resolveActiveOrg` still resolves a suspended org as active context (exercised in the 6.2 DELETE-from-suspended test) — the enforcement leg is 6.6's | binding packet carry |
| **W2-IDN-6.6/6.7 verify rows** | Conditional casing sweep on the 6.2 faces if `ESC-WIRE-FIELD-CASING` resolves Option A (7 new `result` payloads to sweep) | fold-in (conditional) |
| **W2-IDN-7** | `identity.command_dedup_window` seed (test-scoped today) — existing carry, endorsed; plus the window-clock unification carry (RV-0153 OBS-Δ3) now also touches the 6.2 stores | fold-in |
| **Board channel** | Additive Doc-2 §10.2 + Doc-6C candidate: `org_type`/`address`/`contact_info`/`brand_assets_ref` organizations columns (the §C5 deferred fields — currently fail-closed 400 on supply); one patch un-defers all four | channel item |
| **Coordinator quiet-tree note** | Full-tree `eslint .` crashes on the external `app/template.tsx` deletion (parallel frontend work, out of 6.2 scope); WP-surface ESLint green — resolve with that workstream | checkpoint note |
| **Future-watch** | `identity_org_quota_exceeded` + `identity_org_last_owner_block` register rows unreachable in-wire (calls 9/15) — re-arm when the POLICY key registers / realization changes | future-watch |

## Appendix A — As-built route table (vs Doc-5C §4.1/§2.2, for cross-derivation)

| # | Contract (verbatim id) | Method · Path (as built) | Success | Actor / context | `updated_at` carriage | Stale/losing leg | Illegal-edge leg | §B.6 |
|---|---|---|---|---|---|---|---|---|
| 5 | `identity.create_organization.v1` | `POST /identity/organizations` | `201` + `Location` | User · bootstrap (no org context) | n/a (no field) | n/a | n/a | required key · **claim leg** · scope org=null |
| 6 | `identity.update_organization_profile.v1` | `PATCH /identity/organizations/{id}` | `200` | User · active-org (Owner/Director interim, `[ESC-IDN-SLUG]`) | **`If-Match`** (the ONE §C5 `Concurrency: optimistic`) | `identity_org_update_conflict` CONFLICT 409 + `ETag` | n/a (no §5.1 transition) | required key · in-tx persist · scope org=active |
| 7 | `identity.transfer_ownership.v1` | `POST /identity/organizations/{id}/transfer_ownership` | `200` | User (Owner, `can_transfer_ownership`) · active-org · **§5.5-GUARDED** | body field (required) | `identity_org_update_conflict` CONFLICT 409 + `ETag` (org-row CAS) | n/a | required key · in-tx persist · scope org=active |
| 8 | `identity.soft_delete_organization.v1` | `DELETE /identity/organizations/{id}` | `200` | User (Owner, `can_delete_organization`) · active-org | body field (required) | `identity_org_update_conflict` CONFLICT 409 + `ETag` | `identity_org_state_invalid` STATE 409 (no ETag) | required key · in-tx persist · scope org=active |
| 9 | `identity.restore_organization.v1` | `POST /identity/organizations/{id}/restore_organization` | `200` | User (Owner, dual-leg) / Admin · no resolvable org context (§6.2a tx) | body field (required) | stale → VALIDATION 400 (no CONFLICT code); losing restore → `identity_org_state_invalid` STATE 409 + `ETag` | `identity_org_state_invalid` STATE 409 (no ETag) | required key · post-write persist (own tx) · scope org=null |
| 10 | `identity.set_organization_status.v1` | `POST /identity/organizations/{id}/set_organization_status` | `200` | Admin 21.6 (`staff_super_admin` DC-3; no org context; deny-by-construction non-staff 403) | body field (required) | `identity_org_status_conflict` CONFLICT 409 + `ETag` | `identity_org_state_invalid` STATE 409 (no ETag) | required key · post-commit persist · scope org=null |
| 11 | `identity.admin_recover_ownership.v1` | `POST /identity/organizations/{id}/admin_recover_ownership` | `200` | Admin 21.6 (as row 10) · **§5.5-GUARDED** | body field (required) | stale → VALIDATION 400 (no CONFLICT/STATE code) | n/a (no §5.1 transition) | required key · post-commit persist · scope org=null |

All paths/methods/success codes match Doc-5C Pass1 §2.2 rows 5–11 + Pass2 §4.1 verbatim. The frozen `organization_id : uuid : required` request field of rows 9–11 is realized as the path `{id}` (Doc-5C §4.1 input placement; the 6.1 `user_id` precedent). `GET /identity/organizations` (row 31, `list_my_organizations`) is 6.6's — deliberately NOT realized.

## Appendix B — Serialization-contract evidence per guarded command (RV-0150 T6-F1)

**`transfer_ownership`** — own transaction: the `withActiveOrg` request transaction IS the command's tx (`organization-tenant.route-handler.ts` passes it straight through; `transfer-ownership.command.ts` step 6). Lock: `resolveOwnerRemovalFacts(orgId, actorMembershipId, tx)` → `lockActiveOwnerRows` `SELECT … FOR UPDATE` over the org's active-Owner rows ON THAT TX. Facts: actor/nominee/approver memberships + succession decision ALL (re)resolved POST-lock (call 5); guarded writes (`applyOwnershipTransfer`: org-row CAS + role moves) + audit ride the SAME tx. Race probe: transfer-vs-deactivate (§6 discrimination highlight 1) — exactly-one-wins, org never ownerless.

**`admin_recover_ownership`** — own transaction: the command opens it itself (`admin-recover-ownership.command.ts` — `db.$transaction`; staff GUCs transaction-local). Lock: `resolveOwnershipRecoveryFacts(orgId, newOwnerUserId, tx)` — the IDENTICAL `lockActiveOwnerRows` statement (one shared lock set with removal/transfer/deactivate). Facts: acting-owner count + nominee membership/user status resolved INSIDE the resolver (post-lock by construction); `applyOwnershipRecovery` + audit ride the same tx. Race probe: recovery-vs-recovery (§6 highlight 2) — exactly `[200, 422]`, one recovered Owner, one audit row.

**Excluded from the guarded set** (frozen-text derivation — §8 call 1): `soft_delete_organization` (BUSINESS = "cascade preconditions"; serializes against the guarded commands via the very membership rows the lock covers + the org-row CAS) and `set_organization_status` (BUSINESS = "reason recorded"; org-row CAS only, no membership writes).

*Board-ratified permanent section (owner/Board approval of WP-GOV-B, 2026-07-09) — verbatim;
the assignee confirms it held for the whole activation.*

## Frozen Authority Checklist

Before execution, the assignee confirms:

□ All cited documents are frozen. ✅ (Doc-4C PassB §C5 verbatim :231–337 + §C4 :165–227 · Doc-2 §5.1 :467–476 / §9 :677–695 · Doc-5C Pass1 §2.2/§3.3 + Pass2 §4/§7.4/§8 · Doc-5A Pass3 §6 + Pass6 §9 · Doc-4A Pass3 §9/§11.2 + Pass4 §14.3–14.5 · Master Architecture §5.5 :345–348 · Doc-4M as patched v1.0.1 · Doc-3 v1.9)
□ Every cited section has been re-read verbatim. ✅ (three packet paraphrases checked against verbatim text; one dissolved — the guarded-set four-name list, §8 call 1)
□ No draft document is treated as authority. ✅ (playbook/tracker consulted as living docs, bound upward)
□ Any uncertainty results in Flag-and-Halt. ✅ (none triggered; the near-misses — deferred fields, creatable-membership leg — resolved fail-closed WITHIN frozen text, logged §8)
