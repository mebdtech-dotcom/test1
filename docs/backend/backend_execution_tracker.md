# iVendorz — Backend Execution Tracker

| Field | Value |
|---|---|
| **Document type** | Living execution tracker · non-authoritative under the frozen corpus |
| **Companion to** | [`backend_build_plan.md`](backend_build_plan.md) (sequence) · [`backend_execution_playbook.md`](backend_execution_playbook.md) (how-to-build) |
| **Updated** | 2026-07-08 |
| **Rule** | Coins nothing. Tracks status only; on any conflict the frozen corpus + the Build Plan win. |

> Live per-work-package status board for the backend build — the backend analog of
> `project-management/execution-board.md`. **One module scope per PR; multiple WP PRs per module.**
> A WP advances only through its full lifecycle (Build Plan §6); it closes at
> `BLOCKER = MAJOR = MINOR = 0` with its required Doc-8 bands green.

## Status legend

| Mark | Meaning |
|---|---|
| ⬜ | Planned — not started (DoR may still be open) |
| 🔍 | Discovery — WP card + grounding in progress |
| 🟡 | In Progress — building |
| 🔵A | Review-A (architecture & governance, fresh context) |
| 🔵B | Review-B (quality & adversarial, fresh context) |
| 🟣 | Board / owner adjudication (Validate-Findings §13) |
| ✅ | Merged into `wave/2-core-platform` |
| ⛔ | Blocked (open dependency or `[ESC-*]`) |

> **Additive amendment — execution-organization sync (2026-07-09).** Rows advance under the
> **AI Engineering Organization v1.0** (`project-management/ai-engineering-organization-plan.md` ·
> `governanceReviews/BOARD-DECISION-AI-ENG-ORG_v1.0.md`). **Team-6 (Security Review) activates per
> the ratified runtime policy** on any security-surfaced WP — it may run **alongside** 🔵B on the
> same SHA; its verdict is required before 🟣 for those rows and is logged in the same RV entry; non-surfaced rows record "N/A" without
> activation (charter: `governanceReviews/TEAM-6-Security-Review-Charter.md`). Legend unchanged;
> governance not restated here.

**Wave-2 gate on close of all rows:** Wave Integration Audit GREEN → one PR `wave/2-core-platform → main` → *Core Platform gated* (Build_Roadmap §9 milestone 3).

---

## Wave 2 — Core Platform (M0 → M1, serial)

### Stage A — M0 `core` (infra-only shape-exception)

| WP | Scope | Depends | Status | A | B | PR | Commit | Suites | ESC | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| **W2-CORE-1** | Config (POLICY) + feature-flag read services on `contracts/` | — (M0 tables done) | ✅ | **PASS** (RV-0143) | **PASS** (post-patch, delta-verified) | (checkpoint commits on wave branch) | `6a2cae6` | 8B ✅ (90/90; leak probes 0/0) | — | **✅ FIRST FULL LIFECYCLE under org v1.0 — proof run COMPLETE** (clean-gate close 2026-07-09; T6 Security PASS 0/0/0, first live charter run); contracts `core.config_value_query.v1` + `core.feature_flag_evaluate.v1`; trail: RV-0143 (3 builder + 5 review activations, 2 accepted MINORs fixed+re-verified, 0 false positives); Board PENDING (non-gating): B-1 severity · OBS a/b · convention · executor-type backlog |
| **W2-CORE-2** | Outbox dispatch hardening + Inngest wiring (`pending→dispatched→archived`) | CORE-1 ✅ | ✅ | **PASS** (RV-0144) | **PASS** (delta re-verify 0/0/0/0/0 at `7ecd284`) | (checkpoints on wave branch) | `7ecd284` · close `cbd02c5` | 8B · 8F ✅ (101/16) | `[D-5]` on Board channel (mechanics built, audit leg waits) | **✅ clean-gate close 2026-07-09** (T6 N/A exercised + re-confirmed by both lenses); §B6 workers on contracts; CAS advance writes (Review-B caught the SELECT-time dedup race, discrimination proven revert-fail/restore-pass); OBS-3 forward: first real consumer = its own transport-leg WP |
| **W2-CORE-3** | M0 conformance gate (CR4′ immutability + outbox observer green) | CORE-2 ✅ | 🔵 (combined A+B) | in review | in review | — | `f2c9c95` | 8D ✅ new (19 tests) · 8B cited · 120/17 green | `[D-5]` cited on channel | 1 test file only, prod untouched → single combined A+B fresh-context review (Lane-L pattern); **M0 DoD roll-up COMPLETE in report §11** (18 keys ✓ · 8D ✓ · 8B ✓ · BAC infra-only ✓ · module README absent, honestly noted); Team-6 N/A re-confirmed |

### Stage B — M1 `identity`

| WP | Scope | Depends | Status | A | B | PR | Commit | Suites | ESC | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| **W2-IDN-1** | 4 remaining tables (`permissions`, `role_permissions`, `organization_workflow_settings`, `delegation_grants`) + RLS | CORE-3 | ⬜ | — | — | — | — | 8D | — | Forward-only; Doc-6C §6 order |
| **W2-IDN-2** | 45-slug permission + 4-bundle role seed (idempotent, System actor) | IDN-1 | ⬜ | — | — | — | — | 8E (#2) | — | Slugs ≡ Doc-2 §7; never coin |
| **W2-IDN-3** | `check_permission` (3-layer, out-of-wire) + wire `src/server/authz` | IDN-1, IDN-2 | ⬜ | — | — | — | — | 8E (#5) · 8D | W1-CTX / W1-401 | No shadow authz |
| **W2-IDN-4** | Delegation grants (dual-party grant/revoke + refresh-on-revocation) | IDN-3 | ⬜ | — | — | — | — | 8E · 8D | IDN-DELEG-EXPIRY | 2nd authz path |
| **W2-IDN-5** | State machines (org §5.1 · membership §5.2 · delegation) | IDN-1, IDN-4 | ⬜ | — | — | — | — | 8E (Doc-4M) | — | Re-read Doc-4M verbatim |
| **W2-IDN-6.1** | Wired API — User/Account (§4, 4 contracts) | IDN-3 | ⬜ | — | — | — | — | 8C | — | self + Admin-state; no active-org |
| **W2-IDN-6.2** | Wired API — Organization (§4, 7 contracts) | IDN-3, IDN-5 | ⬜ | — | — | — | — | 8C | — | DC-1 cascade out-of-wire |
| **W2-IDN-6.3** | Wired API — Membership (§5, 5 contracts) | IDN-3, IDN-5 | ⬜ | — | — | — | — | 8C | — | |
| **W2-IDN-6.4** | Wired API — Role & Permission (§5, 6 contracts) | IDN-2, IDN-3 | ⬜ | — | — | — | — | 8C | — | |
| **W2-IDN-6.5** | Wired API — Delegation (§5, 6 contracts) | IDN-4 | ⬜ | — | — | — | — | 8C | DELEG-EXPIRY | **#25 `reinstate` ESC-gated** — ship 5, gate 1 |
| **W2-IDN-6.6** | Wired API — Context/Active-Org (§6, 3 contracts) | IDN-3 | ⬜ | — | — | — | — | 8C | — | switch/get/list context |
| **W2-IDN-6.7** | Wired API — Buyer Profile (§6, 2 contracts) | — | ✅ | PASS | PASS | (W1/D7) | — | 8C · 8D | — | **Already delivered** (Wave 1 + D7 audited write); verify under full M1 gate |
| **W2-IDN-6.8** | Wired API — Workflow-Settings (§6, 2 contracts) | IDN-1 | ⬜ | — | — | — | — | 8C | — | POLICY bounds via `core.config_value_query.v1` |
| **W2-IDN-7** | 7 `identity.*` POLICY keys seed + M1 conformance gate | all IDN | ⬜ | — | — | — | — | 8C · 8D · 8E | — | M1 module DoD |

> **IDN-6 = 35 caller-facing Doc-5C contracts across 8 frozen sub-domains** (§C4–§C11); 6.7 already
> delivered. Per-contract routes + command/query + audit flags are in the Execution Playbook §5/§6.

---

## Waves 3–6 (placeholder — populated at wave entry)

| Wave | Modules | Status |
|---|---|---|
| **W3** | M2 `marketplace` · M5 `trust` · M6 `communication` · M7 `billing` (parallel) | ⬜ blocked on Wave 2 |
| **W4** | M3 `rfq` (the moat) | ⬜ blocked on W3 (M2/M5/M7) |
| **W5** | M4 `operations` · M8 `admin` (parallel) | ⬜ blocked on W4 (M3) |
| **W6** | M9 `ai` (advisory) | ⬜ |

---

## Open cross-cutting items

| Item | Kind | Status |
|---|---|---|
| WP-1.9 infra (Supabase + Vercel + push `main` + branch-protection) | Board-parked | ⛔ external — suites run locally until unparked (Build Plan §3) |
| **`[DC-1]`** — identity cross-module effects have no §8 emitter | Open escalation | **Do not build identity-originated events; Flag-and-Halt if a WP needs one** (Playbook §1/§11) |
| **`[D-5]`** — Outbox Audit Granularity | Board-pending | Shadows `W2-CORE-2` worker freeze; build dispatch, audit-leg lands with ruling |
| **`[ESC-IDN-DELEG-EXPIRY]`** — `reinstate`/`expire` delegation error boundary | Carried ESC | Gates IDN-6.5 contract #25 (Doc-2 §5.10) |
| `ESC-W1-USER-PROVISION` · `ESC-W1-CONTEXT-RESOLVE` · `ESC-W1-AUTH-401` · `ESC-IDN-BUYERPROFILE-CODE` · `ESC-IDN-AUDIT` · `ESC-IDN-SLUG` | Carried ESC | non-blocking; resolve/channel during Wave 2 |
</content>
