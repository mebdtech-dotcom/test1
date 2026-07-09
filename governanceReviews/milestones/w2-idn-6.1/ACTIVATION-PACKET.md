# ACTIVATION PACKET — Agent M1 · W2-IDN-6.1

*Per `governanceReviews/AI-Activation-Packet-Template.md` (**RATIFIED v1.1** — first live packet on
the v1.1 form). Coordinator: AI Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.1` — Wired API · User/Account (§C4, 4 contracts) + `display_name`
                            realization · WP defs: `docs/backend/backend_build_plan.md` §4 Stage B +
                            `backend_execution_playbook.md` §5 (IDN-6 header + 6.1 row)
- **Depends on:**           `W2-IDN-3` ✅ (check_permission + authz wire live, RV-0148) — tracker
                            dependency · consumes `W2-IDN-5` ✅ user state machine (RV-0150) ·
                            `ESC-IDN-DISPLAYNAME` ✅ RESOLVED (owner Option A, 2026-07-09 →
                            `Doc-2_Patch_v1.0.6` + `Doc-6C_Patch_v1.0.2` executed) — gates checked
                            per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G (first wired management-API sub-domain)
- **Model class:**          advanced (pattern-setter for all IDN-6 wiring; security-surfaced)
- **Worktree:**             none (no parallel activation mutates files at dispatch)
- **Activation type:**      FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / 10 distinct files · §3+§4 files: 14 ·
                            est. input ~18k tokens — within limits: **YES** (dual count disclosed
                            per v1.1 counting-unit rule)

## 1. TASK

- **Objective:** wire the four §C4 User/Account contracts as audited atomic writes on their frozen
  routes, and realize `identity.users.display_name` end-to-end (forward-only migration · Prisma
  column · `get_user` projection · `update_user_profile.v1` wire field) exactly per the patch pair.

- **In scope:**
  - **`display_name` realization (patch pair — RE-READ VERBATIM):** forward-only migration
    (`ALTER TABLE identity.users ADD COLUMN display_name text;`) — never an edit to the shipped
    `identity_init`/`identity_authz` migrations (Invariant 8) · Prisma column 1:1 · `get_user`
    projection completion (§C3 PassB:117) — resolves the W2-IDN-3 comment anchored to
    `ESC-IDN-DISPLAYNAME` · `update_user_profile.v1` wire field (§C4 PassB:174,
    `string : optional : bounded`, bound per the Doc-4A validation conventions) · `display_name`
    joins the §C4 `deactivate_own_account` personal-field anonymization set (realized in THIS WP
    per `Doc-6C_Patch_v1.0.2` §1 scope note).
  - **4 wired contracts (verbatim ids/methods from playbook §5 6.1 row; routes + wire shapes from
    Doc-5C §C4 — RE-READ VERBATIM):** `update_user_profile.v1` PATCH·C ·
    `update_user_2fa_settings.v1` POST·C · `deactivate_own_account.v1` POST·C ·
    `set_user_account_status.v1` POST·C. Actor scope: **self + Admin-state; no active-org** on
    this sub-domain.
  - **Mapping pattern (playbook §8, per wired write):** thin `app/api` entry →
    `api/<contract>.handler.ts` → contracts facade → `application/commands/` → domain — user
    lifecycle edges via the IDN-5 `user.state-machine.ts` (**cite, never rebuild**) → repository
    (RLS-scoped) → `core.append_audit_record.v1` **ATOMIC same-tx** (D7 canonical pattern) →
    Doc-5A envelope + §6.2 status. Authz via the wired `src/server/authz` `check_permission` —
    **no re-derivation, no shadow authz** (RV-0148 IDN-6 wire expectation).
  - **Method conventions (frozen, playbook §5 IDN-6 header):** field update→`PATCH` item ·
    state/domain command→`POST` named sub-resource · **never `PUT`** · all commands audited ·
    **Events: none**.
  - **POLICY:** `identity.command_dedup_window` is **unseeded until W2-IDN-7** — follow the
    IDN-4/IDN-5 precedent exactly: read the real key via `core.config_value_query.v1`,
    test-scoped seed + sweep, never a literal fallback.
  - **Doc-8: 8C** (envelope · error class+status · idempotency · prohibited fields · actor-scope;
    wired-only, completeness ≡ frozen surface) + zero full-suite regressions.

- **Out of scope:** every other IDN-6 sub-domain (6.2–6.8) · POLICY seed (`W2-IDN-7`) · any
  state-machine change (IDN-5 is the lifecycle authority — consume only) · active-org context
  surface (6.6) · out-of-wire §7.1 reads stay out-of-wire (proposing a wire = architecture
  change, §7.5) · any M2–M9 surface · any identity-originated event (`[DC-1]`). Additions here
  are a Review-A finding, not a bonus.

- **Acceptance criteria:**
  - `display_name` end-to-end: migration applies clean forward-only · Prisma regenerated (never
    hand-edited) · projected in `get_user` · accepted + bounded on the `update_user_profile.v1`
    wire · anonymized on deactivation — each leg discriminating-tested.
  - 4 contracts wired on frozen routes/methods; envelope/error/status per Doc-5A §6.2;
    actor-scope enforced and discriminating-tested (self vs Admin-state; **staff-space never via
    org roles** — RV-0147 B8 lineage); cross-actor/absent reads collapse to
    `found:false`/`404` (non-disclosure).
  - Every write audit-atomic per D7 (rollback direction proven on ≥1 representative path) ·
    System never attributed for these caller-driven writes · zero invented audit
    action/slug/state/route/event · user machine edges consumed from IDN-5, never re-derived.
  - 8C suite green + full suite zero regressions — **suite baseline at dispatch: 262 tests /
    24 files** (RV-0150 clean-gate close; tree unmoved since except governance templates) ·
    tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | Tracker row `W2-IDN-6.1` (un-gate note, owner Option A 2026-07-09) | carry all 4 `display_name` realization legs per `Doc-2_Patch_v1.0.6`/`Doc-6C_Patch_v1.0.2` (folded into scope above) | acceptance-criterion |
  | RV-0148 (`W2-IDN-3` close) | the `get_user` comment anchored to `ESC-IDN-DISPLAYNAME` resolves at 6.1; all wiring consumes the wired `check_permission` — no re-derivation | acceptance-criterion |
  | `Doc-6C_Patch_v1.0.2` §1 | `display_name` joins the §C4 anonymization set "realized when that contract's write side lands; W2-IDN-6.1 scope note" | acceptance-criterion |
  | RV-0147 B8 lineage (via IDN-2/IDN-3 closes) | staff-space authz never via org roles — binds the `set_user_account_status.v1` Admin-state leg | acceptance-criterion |

  No further carries: checked tracker rows, playbook §11 handles, and the RV-0149/RV-0150 carry
  lists (those bind 6.2 / 6.5 / 6.6 / IDN-7 — not 6.1). Stated explicitly: checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows, dual count attested in §0)

*Every FROZEN pointer: **RE-READ VERBATIM — never trust a paraphrase, including this packet's.***

1. `generatedDocs/Doc-4C_Content_v1.0_PassB.md` — §C3 (`get_user` projection, PassB:117) · §C4
   (the 4 contracts, wire fields PassB:174, anonymization PassB:209) + Doc-2 §9 (audit actions —
   bind by pointer) + Doc-2 §10.2 `identity.users` row — locate via `CORPUS_INDEX.md`.
2. `generatedDocs/Doc-2_Patch_v1.0.6.md` + `generatedDocs/Doc-6C_Patch_v1.0.2.md` — the
   `display_name` patch pair (linked, folded together).
3. Doc-5C §C4 (routes/wire shapes) + Doc-5A §6.2 (envelope/status) + Doc-4A validation
   conventions (bounded fields) — locate via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (IDN-6 header + 6.1 row) · §8 (mapping
   pattern) · §11 (open handles) + `docs/backend/backend_build_plan.md` §4.
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` — the canonical audited write.

## 3. CONTRACTS

- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` (audit append + config query) — **consume only, never edit**.

## 4. CODE (§3+§4 combined ≤15)

- `prisma/schema.prisma` + ONE new forward-only migration under `prisma/migrations/`
- `src/modules/identity/api/` — 4 new handlers (house shape: `upsert-buyer-profile.handler.ts`)
- `app/api/identity/` — new user routes per Doc-5C (house shape: `buyer_profiles/route.ts` +
  `src/server/identity/*.route-handler.ts`)
- `src/modules/identity/application/commands/` — 4 new commands ·
  `application/queries/get-user.query.ts` — projection completion
- `src/modules/identity/domain/state-machines/user.state-machine.ts` (**consume — never rebuild**)
  · `domain/audit-actions.ts`
- `src/server/authz/` + `src/server/context/` (consume; this sub-domain is **no-active-org** —
  user-scope context only)
- `tests/integration/` (new 8C slice suite) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS

- **Standing charter binds** (not restated): org plan §3 shared charter — Never-list violations
  are Review-A BLOCKERs.
- **Team-6 pre-flag: YES** — account-status/2FA/deactivation = account-takeover/lockout surface +
  personal-data anonymization leg. The Completion Report's readiness section must match.
- **Open gates/ESC on this scope:** `[DC-1]` — **zero identity events; do not emit**;
  Flag-and-Halt if any wire seems to need one · `[ESC-IDN-AUDIT]` — audit actions bind by Doc-2
  §9 near-pointer; no near-pointer → Flag-and-Halt, **never invent** · `ESC-IDN-DISPLAYNAME` ✅
  resolved — realize exactly the patch pair, nothing more.
- **Task-specific:** contract-first ladder (playbook §3) · audited-write per the D7 reference ·
  forward-only migration discipline (Invariant 8) · wired-only surface — the §7.1 out-of-wire
  reads (`get_user` et al.) gain **no** HTTP face.
- **Halt condition:** any corpus conflict or Red-Flag item → Flag-and-Halt via Handoff Note
  (`governanceReviews/AI-Handoff-Note-Template.md`); never resolve locally (CLAUDE.md §11).
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: checkpoint commits of ONLY
  W2-IDN-6.1 files, `feat(identity): W2-IDN-6.1 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 6. EXPECTED OUTPUTS

- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (§5 Events = "Zero —
  audited only, per frozen truth" · discrimination statements per guard/leg · §11 next gate =
  Review-A with **Team-6 = YES**).
- Checkpoint SHA · migration + Prisma delta · 8C + full-suite results (vs the 262/24 baseline) ·
  ESC dispositions · as-built route/method table vs Doc-5C §C4 (for reviewer cross-derivation) ·
  self-check results (`/ivendorz-security`).

## Frozen Authority Checklist

Before execution, the assignee confirms:

□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
