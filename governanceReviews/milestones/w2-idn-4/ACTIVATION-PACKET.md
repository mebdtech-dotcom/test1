# ACTIVATION PACKET — Agent M1 · W2-IDN-4

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat. **First audited-write WP of Wave 2 — the D7 canonical
pattern is binding law here.***

## 0. Header
- **Role activated:**       Agent M1 — Identity & Organization (org plan §3 charter + M1 row)
- **Work item:**            `W2-IDN-4` — delegation grants: dual-party commands + lifecycle ·
                            WP defs: `docs/backend/backend_build_plan.md` §4 Stage B +
                            `backend_execution_playbook.md` §5
- **Priority / Lane:**      P2 · Lane G (authz surface + first audited writes)
- **Model class:**          **Opus** per dispatch-binding **E1** (state machine: the 5-state
                            `delegation_grant_status` lifecycle)
- **Worktree:**             none · **Activation type:** FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** realize the delegation-grant write side — create/suspend/reinstate-scaffold/
  revoke commands with the 5-state machine, dual-party authority guards, the System expiry timer,
  and refresh-on-revocation — every mutation an **audited, atomic write** per the canonical D7
  pattern.
- **In scope:**
  - **State machine (Doc-2 §5.10 owner — RE-READ VERBATIM, never paraphrase):**
    `draft → active` · `active ⇄ suspended` · `→ revoked` · `→ expired`. Enum exists (IDN-1);
    this WP realizes the **transition matrix service-layer** (DR-6-STATE): `domain/state-machines/`
    with legal-edge enforcement; illegal edges rejected.
  - **Commands (`application/commands` + `contracts/` facades, identifiers verbatim Doc-4C §C9):**
    `create_delegation_grant` · `suspend_delegation_grant` · `revoke_delegation_grant` (+ the
    expiry worker below). **`reinstate_delegation_grant` (#25): SCAFFOLD-GATED** — its error
    boundary is `[ESC-IDN-DELEG-EXPIRY]` (Doc-2 §5.10 unresolved): realize the command shell that
    rejects with a handle-citing internal error; the real edge lands with the ruling. Never
    invent the suspended-at-expiry boundary.
  - **Guards (service-layer, each with a discriminating test):** dual-party authority — only the
    **controlling org** writes (representative attempts → deny) · `permission_set_jsonb` **⊆ the
    granting org's actually-held slug set AND never ownership-class AND never staff-space**
    (Inv #2; DC-CR7; this is RV-0146 T6-OBS-1's delegation leg — binding) · validity window sane
    (CHECK exists; service validates before hitting it).
  - **AUDITED WRITES (binding law):** every mutation calls `core.append_audit_record.v1`
    **atomically in the same transaction** — copy `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`
    exactly (the D7 reference); **audit actions bind by pointer to the nearest Doc-2 §9 action
    via the `[ESC-IDN-AUDIT]` channel convention — NEVER invent an action name.** Zero §8 events
    (M1 frozen truth) — audited only.
  - **System expiry timer (out-of-wire):** `identity.expire_delegation_grant.v1` — background
    worker, **`active → expired` edge ONLY** (`suspended`-at-expiry is the `[ESC-IDN-DELEG-EXPIRY]`
    carry — do not implement that edge); sweep cadence + validity default from POLICY via
    `core.config_value_query.v1` (`identity.delegation_expiry_sweep_cadence` ·
    `identity.delegation_validity_default` · dedup via `identity.command_dedup_window`) — never
    literals. Follow the Inngest wiring conventions from W2-CORE-2 if a pump entry is needed.
  - **Refresh-on-revocation:** on `→ revoked/expired`, derived M3 rows would be removed **via
    service/event — never a cross-schema write**. M3 does not exist in Wave 2: realize this as an
    **injected port** (the `VendorProfileStateReader` precedent — define the port on contracts,
    no-op default, documented + tested that revocation invokes it) so the seam exists without
    coining M3 anything.
  - **Doc-8:** 8E (delegation as the second authz path — including end-to-end: grant → resolve
    via the IDN-3 `check_permission` delegated leg → revoke → resolve = deny, the
    refresh-on-revocation immediacy assertion) + 8D (dual-party RLS already proven at IDN-1 —
    cite; add only what the write path newly exposes).
  - **Fold-ins (non-gating carries):** the 2 stale comment NITs — `identity-check-permission.test.ts`
    ~:398 (grant-set comment, RV-0148 re-verify NIT) and the RV-0147 B-NIT-1 order-independence
    comment in `identity-permission-catalog-seed.test.ts` (~:16–21 — re-attribute to
    `fileParallelism: false` + teardown).
- **Out of scope:** the wired HTTP faces (`W2-IDN-6.5` — commands land on contracts only) ·
  contract #25's real error boundary (ESC-gated) · state machines for org/membership (`W2-IDN-5`)
  · any M3 code · POLICY seed (`W2-IDN-7`).
- **Acceptance criteria:** Doc-2 §5.10 machine verbatim (every legal edge realized + illegal
  edges rejected + tested) · all guards discriminating-tested (incl. staff-space + ownership-class
  + not-held rejection on the jsonb set) · **every write audited-atomically per D7** (rollback
  test: audit and write commit/rollback together) · expiry worker active→expired only ·
  end-to-end delegated-authz round trip green · full suite green (**current baseline: 219 tests /
  22 files**, zero regressions) · tsc/ESLint/Prettier green · zero invented audit action/slug/
  event.

## 2. DOCUMENTS (pointers only)
1. `generatedDocs/` **Doc-2 §5.10** (the state machine — verbatim oracle) + Doc-2 §9 (audit
   actions — bind by pointer) — locate via `CORPUS_INDEX.md`.
2. `generatedDocs/` **Doc-4C §C9** (delegation contracts — identifiers verbatim; Doc-4A §6B
   context already realized at IDN-3).
3. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` — **the canonical audited write;
   copy, never reinvent.**
4. `docs/backend/backend_execution_playbook.md` §5 `W2-IDN-4` · `backend_build_plan.md` §4 ·
   `esc_registry.md` rows `ESC-IDN-DELEG-EXPIRY` + `ESC-IDN-AUDIT`.
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- `src/modules/identity/contracts/{services,types,index}.ts` (additive: command facades + the
  M3-refresh port; existing exports unbroken).

## 4. CODE (≤15 with §3)
- `src/modules/identity/{domain/state-machines,domain/policies,application/commands,infrastructure/data}/`
- `src/modules/core/contracts/` (READ-ONLY — audit + config services to consume)
- `inngest/` (only if the expiry worker needs a pump entry — follow W2-CORE-2 conventions)
- `tests/integration/` (+ the two fold-in comment fixes in the two named existing test files) ·
  `tests/_harness/` (reuse)

## 5. CONSTRAINTS
- Standing charter binds. **Team-6 pre-flag: YES** (delegation = authz surface + first audited
  writes). Self-run `/ivendorz-security`.
- Every mutation inside `withActiveOrgContext`-equivalent server context with the established
  GUCs; controlling-org authority enforced app-layer (RLS = backstop, proven at IDN-1).
- Halt conditions: Doc-2 §5.10 ambiguity on any edge → Flag-and-Halt (the `ESC-JRN`-era lesson:
  never trust a paraphrased machine) · a needed audit action with no Doc-2 §9 near-pointer →
  Flag-and-Halt on the `[ESC-IDN-AUDIT]` channel · anything requiring a real M3 surface →
  Flag-and-Halt.
- DB bootstrap: `docker compose up -d db`. Commit discipline: checkpoint commits of ONLY W2-IDN-4
  files (+ the two named fold-in test files), `feat(identity): W2-IDN-4 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (§5 Events = "Zero —
  audited only, per frozen truth"; §6 discrimination statements incl. the audit-atomicity
  rollback proof; §11 next gate = Review-A with **Team-6 = YES**).
- Checkpoint SHA · 8E/8D + full-suite results · ESC dispositions (#25 scaffold, audit-action
  pointers used) · self-check results.
