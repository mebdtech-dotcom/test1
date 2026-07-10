# ACTIVATION PACKET — Agent M1 · W2-IDN-6.2

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.1). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header

- **Role activated:**       Agent M1 — Identity & Organization (charter: org plan §3 shared charter + M1 row)
- **Work item:**            `W2-IDN-6.2` — Wired API · Organization (§4, 7 contracts) · WP defs:
                            `docs/backend/backend_build_plan.md` §4 Stage B + `backend_execution_playbook.md`
                            §5 (corrected IDN-6 header + 6.2 row)
- **Depends on:**           `W2-IDN-3` ✅ (authz wire) · `W2-IDN-5` ✅ (org state machine + FOR-UPDATE
                            last-owner resolver, RV-0150) · `W2-IDN-6.1` ✅ closed `f0443c5` (wired house
                            shape) · `W2-IDN-6.5` review-complete at `c9e257f` (§B.6 store + claim/replay
                            primitives LIVE — reviews A/B/T6 all B/M/M = 0; its close awaits only the
                            owner's `ESC-WIRE-FIELD-CASING` gating ruling, which does NOT gate this
                            dispatch) — gates checked per org plan §5 ③
- **Priority / Lane:**      P2 · Lane G
- **Model class:**          advanced (ownership-transfer/lockout authority surface)
- **Worktree:**             none · **Activation type:** FIRST (fresh context)
- **Date · Packet author:** 2026-07-10 · Orchestrator (Backend-Lead hat: yes)
- **Packet-size attestation:** 5 document pointer rows / ~10 distinct files · §3+§4 entries: 13 ·
                            est. input ~19k tokens — within limits: **YES** (dual count per v1.1)

## 1. TASK

- **Objective:** wire the seven §4 Organization contracts on their frozen routes as audited,
  §B.6-deduped writes, with every last-owner/ownership-guarded mutation passing its OWN
  transaction to the IDN-5 FOR-UPDATE resolver (the RV-0150 serialization contract).

- **In scope:**
  - **7 wired contracts (verbatim ids/methods from playbook §5 6.2 row; routes/registers from
    Doc-5C §4 + Doc-4C's Organization sub-domain section — RE-READ VERBATIM, locate the exact §
    via `CORPUS_INDEX.md`):** `create_organization.v1` POST·C · `update_organization_profile.v1`
    PATCH·C · `transfer_ownership.v1` POST·C · `soft_delete_organization.v1` DELETE·C ·
    `restore_organization.v1` POST·C · `set_organization_status.v1` POST·C ·
    `admin_recover_ownership.v1` POST·C.
  - **SERIALIZATION CONTRACT (RV-0150 T6-F1 — binding):** every command whose guard consults
    Last-Owner Protection or ownership succession (`transfer_ownership` · `soft_delete_organization`
    · `set_organization_status` · `admin_recover_ownership` — confirm the exact guarded set from
    the frozen text) opens its own transaction and passes THAT tx to the FOR-UPDATE resolver
    (`resolveOwnerRemovalFacts` / `evaluateOwnershipSuccession` — the contract is documented on
    the resolver docstring and the contracts face; the 6.1 deactivate command is the house
    precedent). A discriminating concurrency test per guarded command class (the RV-0150
    race-shape idiom).
  - **State machine:** org lifecycle edges via the IDN-5 `organization.state-machine.ts` —
    **cite, never rebuild**; illegal edges rejected-status-unchanged (matrix idiom).
  - **§B.6 dedup (consume the 6.5 store):** Idempotency-Key mandatory per Doc-5C §4.3:52; deps
    bind the **REQUIRED-field `idempotencyKey` shape** (RV-0153 OBS-2 — the 6.5 faces are the
    model, NOT the 6.1 retro-fit's optional shape); claim leg on the create contract (the
    RV-0153 F2 pattern); window keys per each contract's frozen declaration (unseeded until
    IDN-7 — the IDN-4 test-scoped-seed precedent).
  - **Concurrency/audit wire mechanics:** If-Match/ETag ONLY where the frozen contract declares
    `Concurrency: optimistic` (the RV-0153 call-1 lesson — check each contract's verbatim
    declaration, never assume); audited per each contract's frozen Audit declaration (RV-0152
    call-1 — never a blanket), D7-atomic, actions by `[ESC-IDN-AUDIT]` near-pointer.
  - **Admin legs** (`set_organization_status` · `admin_recover_ownership`): staff-space via the
    wired `check_permission` + the DC-3 fail-closed port — the 6.1 set-user-account-status
    composition is the house shape INCLUDING its truthful deny-by-construction comments
    (RV-0152 F-B1: never claim the decision branches if it doesn't).
  - **DC-1 cascade discipline:** the soft-delete/status cross-module effects (§7.4) stay
    **out-of-wire** — no identity event, no cross-module write; in-module membership
    consequences only, per the frozen text.
  - **Test folds (RV-0153 B, accepted — small, ride along):** NIT-1 fix the stale
    `delegation-grant.repository.ts:40` docstring ("(`active`, …)" → both-states) · NIT-2 soften/
    document the state-machine header's "NEVER hand-roll" vs the required reinstate source pin ·
    NIT-3 move the RETRO-FIT 2FA dedup cleanup into `finally` · NIT-4 one parameterized
    revoke-face register leg (invalid_input/forbidden/not_found) + pin the call-19
    "updated_at is required." message text.
  - **Doc-8:** 8C (registers · idempotency/replay · actor-scope · non-disclosure collapse) +
    8E (org machine edges + Last-Owner/succession guards discriminating-tested, incl. the
    concurrency shapes).

- **Out of scope:** membership contracts (6.3) · context/active-org (6.6) · POLICY seed (IDN-7) ·
  any machine change (IDN-5 authority) · any M2–M9 surface · any identity event. Additions =
  Review-A finding.

- **Acceptance criteria:** 7 contracts on frozen routes/registers (as-built table for
  cross-derivation) · serialization contract honored on every guarded command (own tx → resolver;
  race probes exactly-one-wins) · machine consumed · §B.6 required-deps + claim-on-create ·
  audit per-contract declarations, zero invented tokens · byte-identical 404 collapse on
  non-party reads/writes · the 4 test folds landed · full suite green — **baseline at dispatch:
  301 tests / 26 files** (quiet-tree ×3 at `c9e257f`) · tsc/ESLint/Prettier green.

- **Binding carries (inbound):**
  | Source | Obligation | Class |
  |---|---|---|
  | RV-0150 close (T6-F1 remedy) | serialization contract: guarded commands pass their OWN tx to the FOR-UPDATE resolver; documented contract on the resolver + contracts face binds you | acceptance-criterion |
  | RV-0153 OBS-2 | §B.6 deps = REQUIRED-field `idempotencyKey` shape (6.5 model, not the 6.1 optional retro-fit shape) | acceptance-criterion |
  | RV-0153 B NIT-1/2/3/4 | the four test/comment folds enumerated in scope | fold-in |
  | **`ESC-WIRE-FIELD-CASING` (🟥 owner-pending)** | build response `result` payloads in the ratified house shape (camelCase, as 6.1/6.5); the casing question is owner-gated on the program handle — **log it as a carried item in your report §8; reviewers treat it as carried, not new** | carried handle |
  | RV-0150 OBS-B1 | suspended-org live-path denial test binds **6.6**, not 6.2 — but if your wires touch the org-suspension enforcement path, note the interaction in the report | boundary note |

  No further carries: NIT-Δ1/Δ2 landed at 6.5's B-folds… **correction: verify against the
  review-log RV-0152/0153 close entries at read time** — RV-0152's NIT-Δ1/Δ2 were bound to the
  6.5 fold list; confirm their disposition state in the log before assuming them closed.
  Checked, not omitted.

## 2. DOCUMENTS (pointers only — ≤5 rows, dual count attested in §0)

*Every FROZEN pointer: **RE-READ VERBATIM — never trust a paraphrase, including this packet's**
(three packet paraphrases have dissolved under verbatim re-read this wave).*

1. Doc-4C — the Organization sub-domain section (all 7 contracts: fields, registers, Audit and
   Concurrency declarations, actor scopes) + Doc-2 §5.1 (org machine co-conditions) + §9 (audit
   actions by pointer) — locate via `generatedDocs/CORPUS_INDEX.md`.
2. Doc-5C §4 (the 7 Organization route rows) + §4.3 (If-Match/Idempotency-Key conditions) +
   Doc-5A §6.2/§9.2/§9.5 + Doc-4A §9/§11.2/§14.3 — via `CORPUS_INDEX.md`.
3. Master Architecture §5.5 (Last-Owner/ownership law) + Doc-4M (org rows, as corrected by
   `Doc-4M_Patch_v1.0.1`) — via `CORPUS_INDEX.md`.
4. `docs/backend/backend_execution_playbook.md` §5 (corrected IDN-6 header + 6.2 row) · §7.4
   (DC-1 cascade) · §8 + the RV-0152/RV-0153 close entries in `project-management/review-log.md`
   (carry provenance).
5. `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` + in-repo precedents: the 6.1
   composition set (esp. `deactivate-own-account.command.ts` = own-tx-to-resolver +
   `set-user-account-status.*` = staff leg) · the 6.5 §B.6 primitives
   (`src/server/identity/command-dedup.ts` · the claim pattern in
   `create-delegation-grant.route-handler.ts`) · `src/modules/identity/domain/policies/last-owner-protection.policy.ts`
   + `infrastructure/data/membership-lifecycle.repository.ts` (the documented serialization contract).

## 3. CONTRACTS

- `src/modules/identity/contracts/{services,types,index}.ts` — additive only; existing exports unbroken.
- Consumed: `src/modules/core/contracts/` — **consume only, never edit**.

## 4. CODE (§3+§4 combined ≤15 entries)

- `src/modules/identity/application/commands/` (7 new/extended) · `domain/` (consume machine +
  policies — no rebuild) · `infrastructure/data/` (org repository legs)
- `src/modules/identity/api/` + `app/api/identity/` + `src/server/identity/` (7 wired faces;
  6.1/6.5 house shape) · `src/server/context/` + `src/server/authz/` (consume)
- `src/shared/http/` (consume)
- `prisma/` — NO migration expected (tables exist); Flag-and-Halt if one seems needed
- `tests/integration/` (new org wire slice + the 4 fold touches) · `tests/_harness/` (reuse)

## 5. CONSTRAINTS

- **Standing charter binds.** **Team-6 pre-flag: YES** — ownership transfer + admin recovery =
  org-takeover surface; suspension = lockout surface; Last-Owner = the §5.5 law under concurrency.
- **Open gates/ESC:** `[DC-1]` — zero identity events; cascade effects out-of-wire (§7.4);
  Flag-and-Halt if a wire needs one · `[ESC-IDN-AUDIT]` near-pointers only ·
  `ESC-WIRE-FIELD-CASING` carried (see §1 carries) · POLICY keys unseeded until IDN-7
  (test-scoped-seed precedent).
- **Task-specific:** contract-first ladder · D7 audited writes · per-contract Audit/Concurrency
  declarations (never blankets) · serialization contract on every guarded command · required-field
  §B.6 deps · truthful comments (RV-0152 F-B1 class is now a named review lens).
- **Halt condition:** any corpus conflict, any needed audit action without a §9 near-pointer,
  any apparent need for a migration or an event → Flag-and-Halt via Handoff Note; never resolve
  locally.
- **DB bootstrap:** `docker compose up -d db`. Commit discipline: checkpoint commits of ONLY
  W2-IDN-6.2 files (+ the 4 authorized fold touches), `feat(identity): W2-IDN-6.2 … [checkpoint]`,
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never touch coordinator governance
  files or external frontend/motion working-tree changes.

## 6. EXPECTED OUTPUTS

- Completion Report per the v1.1 template at
  `governanceReviews/milestones/w2-idn-6.2/COMPLETION-REPORT.md` — judgment-call log (log EVERY
  call; the un-logged-call class is a MAJOR aggravator), as-built route table, serialization-
  contract evidence per guarded command, discrimination statements, ESC dispositions, §11 next
  gate = Review-A with **Team-6 = YES**.
- Checkpoint SHA · 8C+8E + full-suite results vs 301/26 · self-check (`/ivendorz-security`-equivalent).

## Frozen Authority Checklist

Before execution, the assignee confirms:

□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
