# Wave 2 — Core Platform (M0 → M1) — Integration Audit + Exit Gate — v1.0

| Field | Value |
|---|---|
| **WP** | Wave-2 Integration Audit [W2-AUDIT-001] |
| **Date** | 2026-07-10 |
| **Integration branch** | `wave/2-core-platform` (HEAD `142a2f6` — the W2-CORE-4 + canonical-M1-close consolidation merge) |
| **Scope** | **M0 `core`** (Stage A: W2-CORE-1…4) + **M1 `identity`** (Stage B: W2-IDN-1…7). Both module DoDs asserted + reviewed. |
| **Verdict** | **GREEN — code-complete + locally-green on all in-wave clauses.** The **push + `wave/2-core-platform → main` PR + deploy/CI-green-on-`main`** clause is the outward/owner-gated action (Wave-1 build-local-park-deploy precedent, WP-1.9). |

> Audits the whole Wave-2 integration on `wave/2-core-platform` before the single wave→main exit PR
> (`Build_Roadmap` §9 milestone 3). Both modules closed at `BLOCKER = MAJOR = MINOR = 0` with their
> Doc-8 bands green (M0 Stage A: W2-CORE-3/-4; M1 module gate: W2-IDN-7 / RV-0160 + `M1-MODULE-CLOSE_v1.0`).

---

## A. Wave Integration Audit (verified on `wave/2-core-platform` @ `142a2f6`)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | Builds (typecheck) | ✅ | `tsc --noEmit` **0**. `next build` proxied locally by tsc + gated by CI/ubuntu (Wave-1 precedent: local `next build` EPERM on the Windows `C:\Users` home-junction is an env artifact, clean on ubuntu). |
| 2 | Lint clean | ✅ | `npm run lint` (`eslint .`, incl. `eslint-plugin-boundaries`) **exit 0** (reproducible ×2; JSON artifact errorCount 0). Wave-2 backend scope (M0+M1+server+inngest+tests) independently `eslint 0`. |
| 3 | Format clean | ✅ | `prettier --check .` **0** ("All matched files use Prettier code style"). |
| 4 | Tests pass | ✅ | `vitest run` **386/33** (0 failed); **no `.only`/`.skip`** (grep = 0 — Doc-8B §8 red gate). |
| 5 | Structure matches | ✅ | `check-structure.mjs`: 10 modules × (module.ts + 4 contracts + 4 layers), 5 shared, 4 server, 3 route groups, tests. |
| 6 | Import boundaries enforced | ✅ | `eslint-plugin-boundaries` green in `npm run lint`; the `contracts/`-only cross-module rule holds (M1 reaches M0 only via `@/modules/core/contracts`; the W2-CORE-4 audit append uses a same-module `events/`→`data/` import — no `contracts`→`infrastructure` cycle). |
| 7 | Generated artifacts not tracked | ✅ | `git ls-files generated-contracts-registry src/generated` = **0**; registry regenerates. |
| 8 | CI merge-gate present | ✅ | `.github/workflows/ci.yml`: Verify (typecheck · lint · format · build · structure · secrets · FK) + `.only/.skip` gate + Vitest + e2e jobs. |
| 9 | **No architecture drift / FROZEN corpus untouched** | ✅ | `git diff wave1-complete..HEAD` over the frozen BASE docs (`*_FROZEN*`, `*_Content_v1.0_*`, Doc-2 v1.0.2 blueprint, Doc-3, Doc-4B_Content, Master, ADR_Compendium) = **0 files**. All `generatedDocs/` changes are **additive patches** (Doc-2 v1.0.4…1.0.8, Doc-4B_OutboxAuditToken/AuditAppendRLS, Doc-4C/4D/4M/5A/5D/6B/6C/6D patches, ADR-021/024/025) + non-authoritative nav/status (Authority-Map, CORPUS_INDEX, roadmap, README, primer). |
| 10 | Schema = M0 5 + M1 tables; 10 namespaces | ✅ | `check-schemas.mjs` (env-loaded): **all 10 frozen module schemas present** (`00000000000000_init_schemas` creates them). `core` = **5** table-models (audit_records/outbox_events/id_sequences/system_configuration/feature_flags). `identity` = **10** table-models = the frozen 9 + `command_dedup` (§B.6 idempotency store; grounded Doc-6A §10.3 / Doc-6C §6.1 CHK-6-072; reviewed RV-0153) — sanctioned, not scope creep. |
| 11 | Migrations forward-only, apply clean | ✅ | 9 forward-only migrations + `init_schemas`; test-harness `migrate deploy` applies clean ("No pending migrations"); expand-contract. Fresh-DB replay is CI's path (ubuntu postgres service). |
| 12 | **`CHK-8-024` MANDATORY (RLS byte-equivalence)** | ✅ | In the 386: `rls-buyer-profiles-byte-equivalence` (9) + `rls-identity-authz-tables` (34) + `authz-rls-backstop` (5) + `audit-records-context-append-rls` (16) — org-anchor RLS, staff-space firewall, buyer-private byte-equivalence, audit-append context binding, all green. |
| 13 | Secrets + no cross-schema FK | ✅ | `check-no-secrets.mjs` clean (2560 files, 11 patterns); `check-no-cross-schema-fk.mjs` clean (10 migrations). |
| 14 | **Repository Ownership Audit** | ✅ | All code ⊆ **M0 `core`** + **M1 `identity`** + sanctioned cross-cutting: same-module `contracts/` facades (config/flag/outbox/audit/authz/provision); the app-layer composition edge `src/server/identity` + `src/server/authz`; framework `src/shared/{db,ids}`; the `inngest/functions/dispatch-outbox` outbox pump; `prisma/migrations` (M0/M1 only); tests; governance docs. The W2-CORE-4 audit leg touches only `core` (`domain/audit-actions.ts` + the two §B6 workers). |

## B. Wave Exit Gate (Build_Roadmap §9 milestone 3 + §7 DoD)

| Clause | Status |
|--------|--------|
| M0 `core` module DoD (5 tables + immutability CR4′ + allocator + 18 POLICY keys + outbox dispatch/archive + **[D-5] audit leg**) | ✅ **GREEN** — W2-CORE-1…4 closed (CORE-4 / RV-0161) |
| M1 `identity` module DoD (9+1 tables + org-anchor RLS + 42 Doc-4C contracts wired + 45-slug catalog + authz + 3 state machines + 7 POLICY keys + D7 audited writes) | ✅ **GREEN** — W2-IDN-1…7 closed; module gate RV-0160; `M1-MODULE-CLOSE_v1.0` |
| Full conformance suite green (8C API · 8D persistence/RLS · 8E domain/invariant · 8F integration/outbox) | ✅ **GREEN** — 386/33, no suppressed tests |
| `CHK-8-024` DB-layer RLS byte-equivalence (pos/neg/cross-tenant + non-disclosure) | ✅ **GREEN** |
| Harness / CI merge-gate green locally | ✅ **GREEN** — typecheck · lint · format · structure · secrets · FK · vitest |
| FROZEN corpus untouched (additive patches only; no in-place edit) | ✅ **GREEN** |
| **Push + `wave/2-core-platform → main` PR + deploy + CI-green-on-`main`** | **OWNER-GATED / PARKED** — external/outward (GitHub remote push + branch-protection + Supabase + Vercel), per the Wave-1 build-local-park-deploy Board ruling (WP-1.9). |

**Exit verdict:** Wave 2 is **GREEN on all in-wave clauses** and **code-complete + locally-green**. The remaining
clause (push + wave→main PR + deploy + CI-on-`main`) is the **outward, owner-authorized** action.

## C. What stands end-to-end (the Wave-2 platform)

**M0 `core`** — 5 platform-owned tables with column-scoped immutability (CR4′), the year-scoped `human_ref`
allocator, 18 `core.*` POLICY keys, the transactional-outbox **dispatch + archive** workers (POLICY-bounded
retry/backoff/dead-letter/reconciliation, write-time CAS, forward-only), and — new this wave — the **[D-5]
run/batch outbox audit leg** (one System audit record per advancing run; atomic; Legs 1+4 carried). **M1
`identity`** — 9 frozen tables + the `command_dedup` idempotency store, org-anchor RLS on all, the full
`check_permission` (3-layer + delegated) authz core, the 45-slug/4-bundle catalog (routing pair on ZERO
bundles — Inv #2), 3 state machines + delegation 5-state, 7 `identity.*` POLICY keys, and **42 Doc-4C
caller-facing contracts wired** across §C3–§C11 on the D7 audited-write pattern. Firewalls proven: Inv #2
(staff-space breach-proof), Inv #5 (Users-Act-Orgs-Own; server-validated active-org), Inv #6 (governance-signal
firewall), Inv #8 (immutable audit / soft delete / forward-only), `[DC-1]` (identity emits zero §8 events).

## D. Carried forward (recorded; non-blocking — Raise ≠ Accept)

- **`[D-5-LEG1-CREATED]` + `[D-5-LEG4-PARK]`** — the two unrealizable outbox audit legs; future additive
  Doc-4B §B10 / §B6+Doc-2 §10.1 patches + human approval (Board channel).
- **M1 fail-closed ESC queue** — `ESC-IDN-2FA-RECOVERY` / `-PREF-KEYS` / `-LIST-PAGESIZE` / `-INVITE-ACCOUNT`
  / `-CTX-SUSPENDED-DOWNSTREAM` (each an additive Doc-4C/Doc-3 patch; interim reject/null fail-closed).
- **Realize-vs-defer fields** — `ESC-IDN-ORG-PROFILE-FIELDS` + the §C11 pair (`default_routing_mode` /
  `buyer_courtesy_options`) → **Wave-4** (M3 routing consumers); formal defer.
- **`ESC-RFQ-SLUG` overlay** — Doc-2 v1.0.8 routing-governance staff slugs; seed/overlay realization carried
  to W4; provisioning-locus (RV-0159 OBS-1) → Wave-4.
- **RV-0149 OBS-7** delegation-expiry-sweep cadence bind (next M1 timer WP) · **RV-0153 OBS-Δ3** command_dedup
  clock-source unify (behavior-change channel).

## E. External / parked (cannot be done by the execution agent)

1. **Push `wave/2-core-platform` → `origin`** (local branch is ahead of `origin/wave/2-core-platform`).
2. **`wave/2-core-platform` → `main` PR** — the wave's delivery PR (default branch; delivery authorization).
3. **Supabase project + secrets · Vercel deploy · GitHub branch-protection/required-checks** → the
   "CI green on `main` + deployed" clause (Wave-1 WP-1.9 parked precedent).

## F. Notes / retrospective

- **Parallel-session reconciliation:** two sessions built Wave-2's tail independently and diverged at
  `de0d09c`. Code trees were byte-identical (the M1 command-composition refactor done twice), so the
  `refactor/w2-identity-command-composition` → `wave/2-core-platform` merge (`142a2f6`) had **zero code
  conflicts**; 4 governance-doc conflicts resolved (3 duplicate-record → took the more-complete version;
  review-log → union). Post-merge: 386/33, lint/format clean. Safety tags `backup/{wave2-core,refactor-w2-idn}-pre-merge`.
- **WP-tag divergence (process, not defect):** Wave-2 tracked WP lifecycle via the execution tracker +
  `review-log.md` (RV-0143…0161) + per-WP close records rather than Wave-1's `wave1/wp-*-green` tags.
- **The [D-5] Flag-and-Halt paid off:** the builder halted rather than invent frozen state; the owner ruling
  (run/batch, Legs 3+5) + the RV-0161 A+T6+B pipeline realized it additively with the dispatch mechanics
  byte-for-byte unchanged — the discipline the wave is meant to enforce.

---

*W2-AUDIT-001 record. Wave 2 Integration Audit GREEN (14/14); Exit Gate GREEN on all in-wave clauses; the
push + wave→main PR + deploy clause is owner-gated/parked (Wave-1 precedent). Wave 2 is code-complete +
locally-green and ready for the delivery PR to `main`. Non-authoritative; conforms upward; coins nothing.*
