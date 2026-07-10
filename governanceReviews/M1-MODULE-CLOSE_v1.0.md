# M1 `identity` — MODULE CLOSE RECORD v1.0

| Field | Value |
|---|---|
| **Document type** | Module-close governance record · non-authoritative under the frozen corpus |
| **Module** | M1 Identity & Organization (`identity` schema · Doc-4C · Doc-5C · Doc-6C) |
| **Wave** | Wave 2 — Core Platform (M0 → M1). **This record closes the M1 stage only** — it is NOT the Wave-2 exit (see §5). |
| **Date** | 2026-07-10 |
| **Authorized by** | Human owner / Architecture Board — M1-close disposition ruling 2026-07-10 (**"close now, carry all"**): the open-ESC queue + provisioning locus are dispositioned as explicit fail-closed carries to their named channels; no silent contract↔schema gap closes the module. |
| **Conforms to** | `Build_Roadmap_v1.0` Wave-2 milestone 3 · `backend_build_plan.md` §W2-IDN-7 (M1 module DoD) · CLAUDE.md §13 (Validate-Findings; Raise ≠ Accept). Coins nothing; edits no frozen text; binds every entity by pointer. |

> The M1 module **conformance gate** (W2-IDN-7) closed clean at `c562e7f` (RV-0160 Review-A ✅ +
> Team-6 ✅ + Review-B-delta ✅). This record is the owner-authorized **module-close roll-up** on top
> of that passed gate: it asserts the Definition of Done and records the disposition of every
> surfaced close-blocker (`backend_execution_tracker.md` W2-IDN-7 · `w2-idn-7/COMPLETION-REPORT.md` §8).

---

## 1. Definition of Done — MET

Per `backend_build_plan.md` §W2-IDN-7 (M1 module DoD) and the §3.2 Build Artifact Checklist, each
verified at the W2-IDN-7 conformance gate (RV-0160, `c562e7f`):

| DoD item | State | Evidence (pointer) |
|---|---|---|
| **Schema** — all 9 `identity` tables + org-anchor RLS | ✅ | W2-IDN-1 (`e7794e3`); 8D green |
| **Caller-facing Doc-5C HTTP surface** — wired across the 8 frozen §C sub-domains (§C4–§C11) | ✅ | W2-IDN-6.1…6.8 (6.5 closed this record); 8C green |
| **Out-of-wire authorization core** — `check_permission` (3-layer + delegated), delegation grants, 3 state machines | ✅ | W2-IDN-3/-4/-5; 8E green |
| **Permission catalog** — 45-slug catalog (36 tenant + 9 staff; routing pair on ZERO bundles, Inv #2) | ✅ | W2-IDN-2 + W2-IDN-7 seed; `Doc-6C_Patch_v1.0.3` (Authority-Map-registered) |
| **POLICY keys** — 18 `core.*` + 7 `identity.*` seeded + value-pinned | ✅ | W2-IDN-7 (`20928c1`); `identity-policy-keys-seed.test.ts` |
| **`durationToMs` canonicalization** — one domain value-object | ✅ | `domain/value-objects/policy-duration.ts` |
| **Doc-8 bands** — 8C + 8D + 8E green (382/33), tsc/ESLint/Prettier clean | ✅ | RV-0160 reviewer-run; local ephemeral Postgres |
| **Module README** — module-close DoD artifact | ✅ | `src/modules/identity/README.md` |
| **Forward-only migrations** — apply clean, idempotent | ✅ | all `identity_*` migrations; expand-contract |
| **Audited-atomic writes** — D7 reference pattern; zero invented audit actions | ✅ | W2-IDN-4 onward; `REFERENCE_Audited_Write_Pattern_v1.0.md` |

**Contract-count note (bound by pointer, not restated):** exact wired/out-of-wire counts live in
`backend_execution_tracker.md` (W2-IDN-6 note + W2-IDN-7 close) and `00_AUTHORITY_MAP.md` (Doc-5C row:
"Realizes Doc-4C (42 contracts)"). This record asserts completeness against that frozen surface, not a
number it coins.

## 2. Close-blocker dispositions (owner ruling 2026-07-10)

Every item surfaced at the gate (`w2-idn-7/COMPLETION-REPORT.md` §8) is dispositioned. The M1 DoD's
"zero `[ESC-*]`" is met on the standing reading **zero *un-dispositioned* ESCs** — each open handle
below carries an explicit, reviewed disposition + named channel; none is a silent gap.

**Resolved (no longer open):**
- **`ESC-WIRE-FIELD-CASING`** ✅ — owner **Option B** (ratify `camelCase` result-payload property names);
  `Doc-5A_Patch_v1.0.1` (Authority-Map-registered); Review-A PASS 0/0/0/0/1. Dissolved RV-0153 F1;
  un-gated **W2-IDN-6.5** (closed this record).
- **`ESC-IDN-ORG-PROFILE-FIELDS` + the §C11 pair** (`default_routing_mode`/`buyer_courtesy_options`) ✅ —
  owner **FORMAL DEFER** 2026-07-10: fail-closed reject-on-write / null-on-read RATIFIED as the standing
  interim; realization (additive Doc-2/Doc-6C patch + forward-only migration) **carried to Wave-4** (where
  the M3 routing consumers live). Precedent: `ESC-IDN-DISPLAYNAME` Option-A. Not a silent divergence.

**Carried fail-closed to named channels (owner "close now, carry all"):**
| Handle | Interim posture | Channel | Carry-to |
|---|---|---|---|
| `ESC-IDN-2FA-RECOVERY` | `recovery_method` value → VALIDATION reject | Additive Doc-4C enum value-set registration (Board) | Board queue |
| `ESC-IDN-PREF-KEYS` | `preferences` → VALIDATION reject (fail-closed) | Additive Doc-4C preference key-schema registration (Board) | Board queue |
| `ESC-IDN-LIST-PAGESIZE` | conservative page-size bound; nothing dropped silently | Doc-3 §12.2 POLICY-key registration (additive; identity parity with M2–M9) | Board queue |
| `ESC-IDN-INVITE-ACCOUNT` | email-with-no-existing-user invite → VALIDATION 400 | Additive Doc-4C/Doc-2 no-account-invitee model (Board) | Board queue |
| `ESC-IDN-CTX-SUSPENDED-DOWNSTREAM` | switch denies suspended (§C8, live-path); downstream stays membership-only (§3.3) — as-built frozen-faithful | Board — rule switch+per-op SUFFICES vs operation-aware downstream gate (never a local coin) | Board queue |
| Workflow-settings first-row **provisioning locus** (RV-0159 OBS-1) | no provisioning contract built (none frozen) | provisioning-locus product/design decision | Wave-4 |

**Standing carries (established non-blocking):**
- **`[DC-1]`** — identity emits no `§8` events (frozen truth, R6). Do not build identity-originated
  events; Flag-and-Halt if a WP needs one.
- **`[ESC-IDN-AUDIT]`** — delegation serialization-token pinning (near-pointer interim).
- **RV-0149 OBS-7** — bind the delegation expiry sweep to `identity.delegation_expiry_sweep_cadence`
  (key now seeded; binding = behavior change) → **next M1 timer WP**, own authorization.
- **RV-0153 OBS-Δ3** — unify the `command_dedup` window-clock source (JS-lookup vs SQL `now()`;
  fail-closed today) → **behavior-change channel**, own authorization.

## 3. Firewall / invariant assertions held at close

- **Inv #2** (two role dimensions) — the 2 routing-governance staff slugs seeded on ZERO org bundles;
  per-slug discriminating test; a forged `role_permissions` row still resolves `{deny, staff_space_firewall}`
  (T6 breach-proof, RV-0160).
- **Inv #5** (Users act, Orgs own) — server-validated active-org context; client-supplied org ID never
  trusted; switch-side suspended-org denial live-path proven (W2-IDN-6.6).
- **Inv #6** (governance-signal firewall) — M1 stores/consumes no trust/performance/tier/capacity signal;
  workflow-settings smuggle-tested signal-free (W2-IDN-6.8, 8E).
- **Inv #8** (nothing authoritative overwritten) — audited writes, soft delete, immutable audit; forward-only migrations.
- **7 `identity.*` POLICY keys** signal-free + fail-loud (T6 RV-0160).

## 4. Provenance (the M1 WP chain, by pointer)

W2-IDN-1 `e7794e3` · W2-IDN-2 `f2bbcfa` · W2-IDN-3 `e365046` · W2-IDN-4 `000b51b` · W2-IDN-5 `a6c9cb9` ·
W2-IDN-6.1 `f0443c5` · 6.2 `e3eea59` · 6.3 `a9d977e` · 6.4 `c80c309` · **6.5 `c9e257f` (closed this record)** ·
6.6 `c53c531` · 6.7 (Wave-1/D7) · 6.8 `2389e85` · W2-IDN-7 conformance gate `c562e7f`. Full lifecycle
trail: `backend_execution_tracker.md` (Stage B) · `project-management/review-log.md` (RV-0146…0160).

## 5. What this close does NOT do (scope fence)

- **Not the Wave-2 exit.** Wave 2 (M0 → M1) still requires **`W2-CORE-4`** (M0 `[D-5]` outbox audit leg +
  WI-CAS-FLAKE hardening — the last unstarted build WP) and the **Wave Integration Audit** before the single
  `wave/2-core-platform → main` PR and the *Core Platform gated* milestone (`Build_Roadmap` §9 milestone 3).
- **Grants no downstream unblock beyond M1.** Waves 3–6 remain gated on the Wave-2 exit, not on this record.
- **Coins nothing; ratifies no frozen text.** The one frozen-corpus amendment in this close
  (`Doc-5A_Patch_v1.0.1`) is an owner-authorized additive patch, reviewed and Authority-Map-registered.

---

## Gate roll-up

| Check | Result |
|---|---|
| M1 conformance gate (W2-IDN-7, RV-0160 A+T6+B) | ✅ CLOSED `c562e7f` |
| All M1 WPs through full lifecycle (B/M/M = 0) | ✅ (6.5 closed this record) |
| Every surfaced close-blocker dispositioned | ✅ (§2) |
| DoD Build Artifact Checklist | ✅ (§1) |

**M1 `identity` MODULE — CLOSED 2026-07-10** (owner-authorized). Next: `W2-CORE-4` → Wave Integration
Audit → Wave-2 exit PR.

---
*Non-authoritative module-close record. Conforms upward; coins nothing; edits no frozen text. On any
conflict the frozen corpus wins. Authorized by the human owner per CLAUDE.md §7/§8/§13.*
