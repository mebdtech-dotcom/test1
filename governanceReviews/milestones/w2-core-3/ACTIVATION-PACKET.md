# ACTIVATION PACKET — Agent M0 · W2-CORE-3

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header
- **Role activated:**       Agent M0 — Platform Core (org plan §3 charter + M0 row; infra-only)
- **Work item:**            `W2-CORE-3` — M0 conformance gate · WP defs:
                            `docs/backend/backend_build_plan.md` §4 Stage A + `backend_execution_playbook.md` §4
- **Priority / Lane:**      P2 · Lane G (module DoD gate)
- **Model class:**          advanced (Sonnet default per `governanceReviews/BOARD-DISPATCH-BINDING-ADDENDUM_v1.0.md`
                            — no E1–E6 trigger: test authoring over existing frozen triggers, no
                            contracts change, no outbox mechanics change)
- **Worktree:**             none · **Activation type:** FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** bring the M0 module to its Wave-2 Definition of Done — **8D** CR4′ immutability
  coverage (the 5 existing immutability triggers) + **8B** outbox-observer coverage confirmed —
  and roll up the M0 module DoD record (Build Artifact Checklist, infra-only shape).
- **In scope:**
  - Author/complete the **8D** band suite proving each of the **5 CR4′ immutability triggers**
    rejects UPDATE/DELETE as the frozen DDL defines (read the triggers verbatim from the realized
    migration — which tables, which operations, which exception text; assert rejection AND that
    permitted mutations still pass, e.g. the outbox forward-only status transitions and
    CHK-6-030 mutable-config tables are NOT over-blocked).
  - **Gap-check, don't duplicate:** inventory existing coverage first (Wave-0/1 suites +
    W2-CORE-1/2 tests) — author only the missing 8D cases; cite existing tests for covered ones.
  - Confirm **8B** observer coverage (dispatch + distinct archival — exists from W2-CORE-2; cite,
    verify green, add nothing unless a §9 playbook mapping row is genuinely uncovered).
  - Produce the **M0 module DoD roll-up** as a short section in your Completion Report §11:
    18 `core.*` POLICY keys seeded ✓/✗ · 8D green ✓/✗ · 8B green ✓/✗ · Build Artifact Checklist
    (infra-only: schema/migrations/contracts/infrastructure/api-N/A/domain-N/A/tests/README) ·
    ESC status (zero unresolved; `[D-5]` on its Board channel — cited, not resolved).
  - Update `src/modules/core/README.md` if one exists (or note its absence — do NOT create new
    root-level files; a module README is in-module and permitted by the Build Artifact Checklist).
- **Out of scope:** any behavior change to services/workers/triggers (this is a GATE — if a
  conformance test FAILS, do not fix the production code: record the failure and suspend via
  Handoff Note; the fix is a new dispatch decision) · any migration · any contracts/ change
  (needing one = dispatch-binding E3 → suspend) · `[D-5]` audit leg · M1.
- **Acceptance criteria:** 8D suite green covering all 5 triggers (reject + permitted-path) ·
  8B cited/green · full suite green (**current baseline: 101 tests / 16 files**, zero
  regressions) · tsc/ESLint/Prettier green · DoD roll-up complete · zero new `[ESC-*]`.

## 2. DOCUMENTS (pointers only)
1. `prisma/migrations/20260627183528_core_init/migration.sql` — the realized frozen DDL: the 5
   immutability triggers (names, tables, semantics — transcribe verbatim; this is the test oracle).
2. `generatedDocs/Doc-6B_Content_v1.0_Pass2.md` — CR4′/immutability intent + Appendix A CHK rows
   (which tables are immutable vs mutable-config; CHK-6-030 exemptions).
3. `docs/backend/backend_execution_playbook.md` §4 `W2-CORE-3` + §9 (Doc-8 band mapping — 8D =
   bands A+C; do not fork the taxonomy or invent a gate).
4. `docs/backend/backend_build_plan.md` §4 Stage A `W2-CORE-3` (DoD list).
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- None to change. `src/modules/core/contracts/` is READ-ONLY context.

## 4. CODE (≤15 with §3)
- `tests/integration/` + `tests/unit/` (existing M0 suites — inventory for gap-check; add the 8D
  suite here) · `tests/_harness/` (reuse; note `vitest.config.ts` `fileParallelism: false` for any
  DB-wide assertion)
- `src/modules/core/` (READ-ONLY — services under test via contracts)
- `src/modules/core/README.md` (update if present)

## 5. CONSTRAINTS
- Standing charter binds (org plan §3). This is a **verification WP**: production code is
  read-only; a red conformance result → Handoff Note + SUSPENDED, never a local fix.
- **Team-6 pre-flag: N/A — no security surface** (test authoring over own schema; no auth/org/
  RLS/private-data/input/secret/signal change). Re-flag conditions standard (packet template §5).
- DB bootstrap: `docker compose up -d db` (Docker Desktop may need starting); suites local
  (WP-1.9 parked).
- Commit discipline: checkpoint commit(s) of ONLY W2-CORE-3 files,
  `feat(core): W2-CORE-3 … [checkpoint]`, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Halt condition: trigger semantics in the migration ↔ Doc-6B conflict → Flag-and-Halt citing both.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (all sections;
  §5 Events = "Zero"; §11 = next gate + the **M0 module DoD roll-up**).
- Checkpoint SHA · 8D/8B + full-suite results · gap-check inventory (covered-by-existing vs
  newly-authored) · self-check results.
