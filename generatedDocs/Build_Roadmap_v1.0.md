# iVendorz — Build Roadmap

| Field | Value |
|---|---|
| **Document type** | Non-authoritative orientation document (Implementation Planning) — **Derived engineering execution guidance** |
| **Date** | 2026-06-26 |
| **Version** | v1.0 |
| **Change control** | Additive patches only. On any conflict, the **FROZEN corpus wins** and this document is patched to match. |
| **Conforms to** | `Master_System_Architecture_v1.0_FINAL` → `ADR_Compendium_v1` → Doc-2…Doc-8 (all FROZEN) → `Development_Decomposition_v1.0` |
| **Conflict rule** | **FLAG-AND-HALT** — cite both sources, escalate to the Board for a human-approved additive patch; never resolve locally. |
| **Authority** | Below rank 1 (see `00_AUTHORITY_MAP.md`). **Sequences implementation only** — it decides nothing the corpus or the Development Decomposition has not already decided. |

> This is the engineering execution plan that follows `Development_Decomposition_v1.0.md`. It is the
> **final planning artifact before application code begins** and it drives Wave 0. It coins no
> architecture, API, schema, UI, event, permission, POLICY, route, state, or contract — every item
> traces by pointer to a frozen authority. It fixes **no dates, no sprints, no story points, no
> effort estimates**: ordering is dependency order only.

---

## §0 Executive Summary

### Purpose
Convert the Development Decomposition's work breakdown into a **sequenced, gated build program**:
what gets built first, what runs in parallel, what blocks what, when a wave begins and finishes, and
which gates must pass before moving forward. It creates **no architectural authority**.

### Inputs (by pointer)
- `Development_Decomposition_v1.0.md` — engineering streams, per-module work packages (the WP template
  §3.1 + Build Artifact Checklist §3.2), the dependency graph (§7.1), acceptance gates (§9).
- The frozen corpus — Doc-2 (domain), Doc-3 (operational spec), Doc-4A…4M, Doc-5A…5K (API),
  Doc-6A…6K (DB), Doc-7A…7H (FE), Doc-8A…8G (test).
- `REPOSITORY_STRUCTURE.md` (constitution), `CLAUDE.md` (guardrails), `IMPLEMENTATION_START_HERE.md`.

### Outputs
A wave sequence (Wave 0 → Wave 6), per-wave gates, parallel-stream definitions, a merge strategy,
quality gates (Definition of Ready / Done), an engineering risk register, dependency-ordered
milestones, and the transition path into code.

### Relationship to the Development Decomposition
The Decomposition answers *what the work is*; this Build Roadmap answers *in what order it is built and
gated*. The Roadmap **sequences** the Decomposition — it restates none of its content and re-decides
none of it. Where it groups work into waves, it does so as a **finer-grained re-partition** of the
Decomposition's §7 waves (see the reconciliation table in §4) — same dependency graph, re-bucketed.

### Relationship to Implementation
The Roadmap drives **Wave 0** (repository bootstrap) and every wave after it. No wave merges until its
required Doc-8 conformance suites are green (§7). The Doc-8 fabric is **authored-not-run** today; it
executes and merge-gates as code lands. This document is the last planning step before code.

---

## §1 Build Principles

1. **Realize-never-redecide.** Doc-4x fixed *what*; Doc-5/6/7A fixed *how*. Code realizes — it never
   re-decides. No architecture/API/schema/UI/event/permission/POLICY/route/state/contract is invented
   during implementation.
2. **Frozen corpus only.** Every work package binds frozen authorities by pointer; gaps are raised as
   `[ESC-*]` markers and escalated, never filled by local invention (Flag-and-Halt).
3. **Code conforms to Doc-5/6/7/8.** API to Doc-5x, schema/RLS/migrations to Doc-6x, UI to Doc-7x,
   conformance to Doc-8x.
4. **No architecture decisions during implementation.** Architecture-affecting questions stop work and
   escalate to the Board for a human-approved additive patch (CLAUDE.md §8).
5. **One build owner per work package** (Development Decomposition §2.1). Build/execution ownership
   never re-assigns the immutable frozen domain ownership of a module.
6. **Doc-8 gates every wave.** A wave does not close until its required conformance bands are green.
   The fabric is **necessary-not-sufficient** and **never weakened**: a red test is a code defect or a
   corpus defect (`[ESC-8-CORPUS]`), never a reason to relax the assertion.

---

## §2 Repository Bootstrap (Wave 0)

Everything before feature work — the spine only, **no business logic**. Pointers:
`REPOSITORY_STRUCTURE.md` §2/§3/§5/§8/§10; `Development_Decomposition_v1.0.md` §5; Doc-6A; Doc-8B.

| Item | What | Pointer |
|---|---|---|
| Repository init | Single Next.js deployable (modular monolith) | REPOSITORY_STRUCTURE §1/§2 |
| Next.js 15 App Router | `app/` route groups `(public)`/`(auth)`/`(app)`/`(admin)` + `app/api/` thin entries | REPOSITORY_STRUCTURE §8 |
| Nested-DDD skeleton | 10 module folders (`contracts`/`domain`/`application`/`infrastructure`/`api` + `<module>.module.ts`) + `src/shared/` + `src/server/` | REPOSITORY_STRUCTURE §3/§5 |
| Prisma multiSchema | 10 schema namespaces (one per module; one-Prisma-namespace-per-module) | Doc-6A R3(b); REPOSITORY_STRUCTURE §6 |
| Supabase | Project, Auth, Storage, Realtime wiring | CLAUDE.md §2 |
| Inngest | Job functions consuming the M0 outbox | REPOSITORY_STRUCTURE §7 |
| Generated contracts registry | `generated-contracts-registry/` — generated, gitignored, never hand-edited | REPOSITORY_STRUCTURE §2/§5/§10 |
| Vitest · Playwright (+ @axe-core/playwright) · TS-native transactional SQL | The frozen test toolchain (`[ESC-8-TOOLING]` resolution; pgTAP not selected) | Doc-8B D1 |
| CI/CD | Merge-gate pipeline (Doc-8B harness); import-boundary lint; no-cross-schema-FK migration check | REPOSITORY_STRUCTURE §10; Doc-8B |
| Linting / formatting / pre-commit hooks | Import-boundary lint (`@/modules/<m>/contracts` only); format; git hooks | REPOSITORY_STRUCTURE §10 |
| Secrets / environment | Env vars only; never in code/commits/logs | CLAUDE.md §2; ROADMAP Security Baseline |

**Exit:** repo green — skeleton compiles, 10 schemas migrate clean, harness runs, CI merge-gate active.

---

## §3 Walking Skeleton (Wave 1)

Exactly **one real vertical slice** on a thin M0+M1 foundation — proves the contract/DB/FE/test/deploy
spine end-to-end with frozen contracts. **Everything real** (Development Decomposition §6).

```
Supabase Auth login
  → server-resolved active org (src/server/context)
  → one wired Doc-5C identity read API
  → one identity table (standard columns + org-anchor RLS, Doc-6C)
  → one Doc-7E UI screen (account/identity shell)
  → one Doc-8 integration test (Doc-8B harness + outbox observer)
  → one Vercel deploy
```

**No mock business logic** (Doc-8 Band I, observe-never-author): every domain/data/contract path is
real; only infrastructure boundaries (Inngest/Storage/Realtime/Resend/PostHog/AI) may be mocked where
genuinely unavailable.

**Thin-slice note:** the skeleton builds only enough of M0 + M1 to exercise the spine (one table, one
API, auth, org context). The **full** M0 and M1 module builds are Wave 2 — the skeleton's minimal
foundation necessarily precedes them.

**Exit:** the slice is deployed and its integration test is green in CI.

---

## §4 Module Build Waves

Each wave states: Objective · Inputs · Outputs · Dependencies · Parallel work · Blocked work · Required
Doc-8 suites · Definition of Done. Table/contract counts and properties are by pointer to the frozen
Doc-5x/6x/7x; nothing here is a new decision.

**Doc-8 band → suite map** (Development Decomposition §9): 8C = bands **A+B** (contract/API) · 8D =
**A+C** (persistence/migration/RLS; **`CHK-8-024` RLS byte-equivalence MANDATORY**) · 8E = **A+D+E**
(domain/invariant/firewall/state) · 8F = **A+F** (integration/event-flow) · 8G = **A+G** (FE/E2E) ·
8B = bands **H+I** (harness, realized for every suite).

### Wave reconciliation (binding)
This Roadmap's 7 waves (0–6) are a **finer-grained re-partition** of the Development Decomposition §7's
5 waves (0–4): **same dependency graph, re-bucketed — zero edge re-ordered, zero edge added.**

| Build Roadmap wave | Development Decomposition §7 |
|---|---|
| W0 Bootstrap | W0 (Bootstrap + harness) |
| W1 Walking Skeleton | W1 (skeleton, on the M0+M1 foundation) |
| W2 M0 → M1 | W1 (M0 → M1 serial) |
| W3 M2 / M5 / M6 / M7 | W2 (independent domains, parallel) |
| W4 M3 | W3 (the moat, first) |
| W5 M4 / M8 | W3 (post-award + admin, after M3) |
| W6 M9 | W4 (advisory) |

---

### Wave 2 — Core Platform (M0 → M1, serial)

- **Objective:** the foundation every other module references — platform infra (M0) then identity (M1).
- **Inputs:** Wave 0 repo + harness; Wave 1 skeleton spine.
- **Outputs:** M0 `core` (5 tables; outbox, audit, `id_sequences`/`human_ref` allocator, config/POLICY,
  flags; CR4′ column-scoped immutability) → M1 `identity` (9 tables; first org-anchor RLS, `check_permission`,
  active-org resolution, dual-party delegation, 3 state machines; 45-slug/4-bundle seed).
- **Dependencies:** M0 → M1 (M1 needs M0 infra). **Serial within the wave.**
- **Parallel work:** within M1, the Doc-7E account/identity FE leg + the M1 Doc-8 suites once contracts land.
- **Blocked work:** all of Wave 3+ (every module needs M0 infra + M1 `check_permission`/org context).
- **Required Doc-8 suites:** M0 → **8D** (immutability CR4′) + **8B** outbox observer. M1 → **8C** +
  **8D** (org-anchor RLS positive/negative/cross-tenant) + **8E** (Invariant #2 two role dimensions;
  Invariant #5 users-act/orgs-own).
- **Definition of Done:** Build Artifact Checklist complete per module · 18 `core.*` (Doc-3 v1.0) + 7
  `identity.*` (Doc-3 v1.9) POLICY keys seeded · required suites green · zero `[ESC-*]`.

### Wave 3 — Independent Domains (M2 · M5 · M6 · M7, parallel)

- **Objective:** the four module-independent domains that feed the moat.
- **Inputs:** M0 + M1.
- **Outputs:** M2 `marketplace` (21 tables/8 aggregates; tri-actor RLS, capability matrix, score firewall,
  `vendor_matching_attributes` read-model, FTS) · M5 `trust` (11 tables; governance-signal owner, System-written
  scores, firewall) · M6 `communication` (9 tables; delivery-only, participant-grant RLS, append-only logs) ·
  M7 `billing` (13 tables; platform-own revenue, billing firewall, entitlements-not-plan-name).
- **Dependencies:** each on M0 + M1 only. **M2 ↔ M5 exchange events via idempotent consumers (async — no
  synchronous cycle), so they build in parallel.** M7 provides the quota service M3 will read.
- **Parallel work:** all four modules concurrently; each module's FE (Doc-7D/7E/7G/7H legs) + Doc-8 suites
  alongside its backend.
- **Blocked work:** M3 (needs M2 attributes + M5 signals + M7 quota).
- **Required Doc-8 suites:** per module — **8C** + **8D** (M2 tri-actor incl. public/anonymous; others per
  module RLS) + **8E** (M2 score-firewall band-reflected-never-computed + Invariant #1; M5 firewall
  non-cross-mutation + non-dominance + System-actor-only writes; M7 billing firewall + Invariant #10) +
  **8F** (M5 `VendorTierChanged` fan-out; M6 delivery-only consumer locality; M7 subscription events).
- **Definition of Done:** per-module Build Artifact Checklist · POLICY keys (Doc-3 v1.2/v1.3/v1.5/v1.6) ·
  carried `[ESC-*-AUDIT]`/`[ESC-6-DD7]`/`[ESC-MKT-AUDIT]`/`[ESC-6-SCHEMA-SHOWCASE]` resolved or on a named channel ·
  required suites green.

### Wave 4 — The Moat (M3 RFQ)

- **Objective:** the procurement decision engine — the platform moat.
- **Inputs:** M0 + M1 + M2 (`vendor_matching_attributes` via service) + M5 (trust/verified-tier/performance
  gate+score inputs) + M7 (quota); reads M4 CRM status via service for private exclusion.
- **Outputs:** M3 `rfq` (12 tables/5 groupings; first dual-sided buyer+vendor grant-row RLS; RFQ §5.4 13-state
  + Quotation §5.5 6-state machines; matching/routing engine **out-of-wire** System workers — buyers never invite,
  invitations engine-generated; blacklist-undetectable byte-equivalence).
- **Dependencies:** M2 + M5 + M7 (all Wave 3). M4 CRM read is service-only (M4 is Wave 5; the read seam exists,
  populated when M4 lands — the routing read tolerates an empty CRM).
- **Parallel work:** M3 FE (Doc-7F buyer/moat + Doc-7G vendor legs) + Doc-8 suites alongside.
- **Blocked work:** M4 (consumes RFQ award/invitation events); M8 routing-control legs.
- **Required Doc-8 suites:** **8C** + **8D** (dual-sided grant-row RLS + **`CHK-8-024` byte-equivalence —
  blacklist-undetectable**) + **8E** (moat as governed property: no signal dominates; AI never ranks-to-winner;
  no auto-decision) + **8F** (RFQ events) + Doc-4M state coverage.
- **Definition of Done:** Build Artifact Checklist · `rfq.*` POLICY keys (Doc-3 v1.1) · carried
  `[ESC-RFQ-AUDIT]`/`[ESC-RFQ-SCHEMA-RULES]` resolved or on a named channel · required suites green
  (byte-equivalence end-to-end).

### Wave 5 — Post-Award + Admin (M4 · M8)

- **Objective:** post-award execution (M4) and platform governance/decision authority (M8).
- **Inputs:** M0 + M1 + M3 (M4 consumes `RFQClosedWon`/`VendorInvited`); M8 acts on M2/M3/M5 targets by ID.
- **Outputs:** M4 `operations` (19 tables; the blacklist's owning side — `buyer_vendor_statuses` private CRM;
  two-sided party-column RLS; money-record boundary — `trade_invoices ≠ billing.platform_invoices`, no funds
  custody) · M8 `admin` (10 tables; authoritative event catalog; "Admin decides, owning module owns"; `ban_actions`
  emits `VendorBanned`; `link_suggestions` never vendor-visible).
- **Dependencies:** M4 after M3; M8 after the modules it governs (M2/M3/M5). M4 and M8 build in parallel with
  each other.
- **Parallel work:** M4 + M8 backends concurrently; their FE legs (Doc-7F/7G for M4; Doc-7H admin console for M8)
  + Doc-8 suites.
- **Blocked work:** M9 (advisory; reads all) prefers M4/M8 present, but blocks nothing.
- **Required Doc-8 suites:** M4 → **8D** (two-sided RLS + **#11 byte-equivalence buyer-private blacklist-undetectable**)
  + **8E** (money-boundary; governance signal #5 never mutates platform scores) + **8F** (idempotent
  `RFQClosedWon`/`VendorInvited` consumers). M8 → **8D** (Admin-only RLS; link non-disclosure) + **8E**
  (Admin-decides/owning-module-owns — no owning-module table write) + **8F** (`VendorBanned`; owning-module-emits framing).
- **Definition of Done:** Build Artifact Checklists · POLICY keys (Doc-3 v1.4/v1.7) · carried
  `[ESC-OPS-AUDIT]`/`[ESC-ADMIN-AUDIT]`/`[ESC-ADMIN-SCHEMA-OUTREACH]` resolved or on a named channel · required suites green.

### Wave 6 — Advisory (M9 AI)

- **Objective:** the reserved advisory layer — suggests, never decides.
- **Inputs:** reads all modules via contracts; writes only `ai.*`.
- **Outputs:** M9 `ai` (4 cache tables; "AI suggests; modules decide" (Invariant #12) — owns no authoritative
  data; never source of truth; no §8 event/no score; the sole `ai.*` TTL hard-delete exception — Doc-6A R7).
- **Dependencies:** reads stable domains; **blocks nothing**.
- **Parallel work:** M9 FE advisory panels (within frozen Doc-7 surfaces) + Doc-8 suites.
- **Blocked work:** none.
- **Required Doc-8 suites:** **8C** + **8D** (`CHK-6-033` TTL hard-delete PASS — the one active M9 PASS) +
  **8E** (Invariant #12 — advisory; never authoritative; never ranks-to-winner).
- **Definition of Done:** Build Artifact Checklist (derived-artifact shape-exception) · `ai.*` POLICY keys
  (Doc-3 v1.8) · carried `[ESC-AI-AUDIT]` on a named channel · required suites green.

---

## §5 Parallel Engineering Streams

Discipline lanes that run concurrently across waves (Development Decomposition §2). A module's build touches
several streams at once.

| Stream | Start point | Finish point | Merge points | Blocking dependencies |
|---|---|---|---|---|
| **Backend** | Wave 2 (M0 contracts/domain) | Wave 6 (M9 advisory reads) | End of each module's wave (its 8C/8E green) | Upstream module contracts (Doc-5x); M0 infra; M1 `check_permission` |
| **Frontend** | Wave 1 (skeleton UI) | Wave 6 (advisory panels) | Per surface, once its module's Doc-5 surface is wired | Doc-7 surfaces (frozen); the module's wired Doc-5x API |
| **Database** | Wave 0 (Prisma multiSchema) | Wave 6 (`ai.*` cache) | Each module's migration + RLS green (8D) | Doc-6x schema (frozen); forward-only migration order (Doc-6A §11) |
| **Testing** | Wave 0 (Doc-8B harness) | Wave 6 (full fabric executing) | Each wave's required suites green | Doc-8x suites (frozen oracle); harness (Doc-8B) |
| **Infrastructure** | Wave 0 (Supabase/Vercel/Inngest/env) | Production gate | Bootstrap green; each deploy | Supabase/Vercel/Inngest availability; secrets |
| **DevOps** | Wave 0 (CI merge-gate, boundary lint) | Production gate | Every PR (CI green) | Doc-8B merge-gate; generated-registry build |
| **Documentation** | Wave 0 (module READMEs) | Continuous | Per module | This Roadmap; IMPLEMENTATION_START_HERE |
| **AI** | Wave 6 (M9) | Wave 6 | M9 wave gate | All upstream domains (read-only); Invariant #12 |

---

## §6 Merge Strategy

- **Branch strategy:** `main` = production, protected, no direct push. Feature branch per work package off
  `main` → PR → review → merge.
- **PR scope:** **one module scope per PR; multiple WP PRs allowed** — a module is delivered through several
  work-package PRs (e.g. schema+RLS, then contracts, then application/api), each scoped to that one module.
  A PR never spans two modules. (Module-boundary discipline; one module, one owner.)
- **Merge order:** wave order (W0 → W6). Within a wave, modules merge in dependency order (M0 before M1;
  parallel-wave modules in any order; M3 before M4/M8).
- **Required approvals:** AI Coding Supervisor **or** human for all AI-generated code; **architecture-affecting
  changes require human approval** (CLAUDE.md §8) — code review alone is insufficient.
- **Conflict ownership:** the single build owner of the work package owns its conflicts; cross-module seams are
  resolved through `contracts/`, never by editing another module.
- **Generated artifacts:** Prisma client + `generated-contracts-registry/` are regenerated, never hand-merged;
  a manual edit to a generated path is a CI-failing violation (REPOSITORY_STRUCTURE §10).
- **CI gates:** import-boundary lint + no-cross-schema-FK migration check + the Doc-8B merge-gate (required suites
  for the touched module). A red/`skipped`/`.only`/deleted test is a red gate.

---

## §7 Quality Gates

### Definition of Ready (a work package may start when)
- The governing frozen contracts are identified (Doc-4/5/6/7 pointers).
- Its dependencies are gated green.
- The WP template (Development Decomposition §3.1) is fully filled.
- The single build owner is assigned.
- Required generated artifacts (Prisma client, contracts registry) exist for its inputs.

### Definition of Done (a work package / wave closes when)
- Required **Doc-8 suites green** (the wave's band set).
- **CI green** (merge-gate; boundary lint; migrations apply clean).
- **Zero unresolved `[ESC-*]`** markers (mirrors corpus freeze discipline).
- **Zero unresolved `TODO`** in the merged code path.
- **No failing migrations** (forward-only; expand-contract; Doc-6A §11).
- Build Artifact Checklist (Development Decomposition §3.2) complete + pre-PR checklist
  (`IMPLEMENTATION_START_HERE.md`) satisfied.

---

## §8 Risks (engineering only)

No architecture-redesign risks exist — the architecture is frozen. Build-time rollback for any wave = revert
the wave's merge set to the last green wave tag; bad schema undone by a compensating forward migration
(Doc-6A §11), never a down-migration.

| Risk | Mitigation |
|---|---|
| Repository drift (skeleton diverges from REPOSITORY_STRUCTURE) | Import-boundary lint + structure conformance in CI (REPOSITORY_STRUCTURE §10). |
| Generated-code drift (hand-edited Prisma client / contracts registry) | Generated paths gitignored + regenerated; manual edit = CI-failing. |
| Migration conflicts across module-owned schemas | Forward-only/expand-contract (Doc-6A §11); no cross-schema FK; migration check in CI. |
| Parallel merge conflicts (Wave 3 four-module concurrency) | One module scope per PR; `contracts/`-only seams; per-module owner resolves. |
| Contract mismatch (code vs frozen Doc-5/6/7) | Doc-8C contract suite (table-driven; completeness ≡ frozen surface); authored-not-run until code. |
| Event-consumer idempotency (Wave 3 M2↔M5; Wave 5 M4/M6 consumers) | Idempotent consumers + Doc-8F write-plus-emit atomicity (outbox observer). |
| RLS byte-equivalence regression (blacklist/exclusion detectable) | Doc-8D `CHK-8-024` mandatory gate on every RLS change; #11 defining target (M3/M4). |
| Outbox atomicity (write without event, or vice-versa) | Business write + event insert in one transaction; Doc-8B outbox observer + savepoint. |
| Deployment regression | Vercel preview per PR + instant rollback; staging promote gate; wave tags as restore points. |

---

## §9 Milestones

Dependency order only — **no dates**. Each milestone is an engineering gate-state: it is reached when its
named conditions hold, not on a calendar.

1. **Repository Bootstrap** — repo scaffold + 10 schemas migrate + harness + CI merge-gate active (Wave 0).
2. **Walking Skeleton** — the real M0+M1 auth→org→API→DB→UI→test→deploy slice green (Wave 1).
3. **Core Platform** — M0 + M1 gated (Wave 2).
4. **Marketplace + Trust + Communication + Billing** — M2/M5/M6/M7 gated (Wave 3).
5. **RFQ (the moat)** — M3 gated, incl. dual-sided RLS + blacklist-undetectable byte-equivalence (Wave 4).
6. **Operations + Admin** — M4 + M8 gated (Wave 5).
7. **AI** — M9 gated (Wave 6).
8. **MVP Ready** *(engineering gate-state)* — reached when: the Walking Skeleton plus all MVP-scope module
   waves (per `ROADMAP.md` MVP Scope: M2/M5/M3/M6/M7/M8) are gated green; the security baseline
   (`ROADMAP.md` Security Baseline) is wired and verified; all required Doc-8 suites are green in CI; zero
   open `[ESC-*]` on MVP-scope modules. This is an **engineering completion state**, not a launch/marketing
   decision (which is Product + Board).
9. **Production Ready** *(engineering gate-state)* — reached when: staging is stable; audit logging is live;
   feature flags are operational; rollback is tested (wave-tag revert + compensating forward migration);
   the security review / penetration test has passed; no open SEV-1/SEV-2. Like MVP Ready, this is an
   **engineering readiness state** — the go-live authorization remains a Board + Product decision.

---

## §10 Transition to Implementation

How an engineer moves from this Roadmap to merged, verified code:

```
Build Roadmap (this doc — the wave + gate sequence)
   ↓  pick the next ready work package
Work Package (Development Decomposition §3.1 template — objective, frozen authority, inputs/outputs,
              files in the nested-DDD shape, acceptance gate, required Doc-8 suites, build owner)
   ↓  Definition of Ready satisfied (§7)
Feature Branch (off main; one module scope; per WP)
   ↓
Code (conforms to Doc-5/6/7; references frozen contracts by pointer; coins nothing)
   ↓
Doc-8 Verification (the WP's required suites; CI merge-gate; never-weaken)
   ↓  Definition of Done satisfied (§7) — suites green, CI green, zero ESC/TODO, migrations clean
Merge (into main; wave-ordered; generated artifacts regenerated, never hand-merged)
```

Each merge advances its wave; a wave's final merge, with all required suites green, reaches that wave's
milestone (§9). The next phase after this Roadmap is **Implementation (Code)** itself, beginning at Wave 0.

---

## Sources (by Authority Order rank; pointers, never restated)

1. `Master_System_Architecture_v1.0_FINAL.md` (rank 0 — CANONICAL)
2. `ADR_Compendium_v1.md` (rank 1)
3. `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` (+ `Doc-2_Patch_v1.0.3.md`) — §8 events, §10 schema
4. `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` (+ patches; POLICY v1.0–v1.9)
5. `Doc-4A_Structure_v1.0_FROZEN.md` · `Doc-4E_Structure_v1.0_FROZEN.md` (§E0 dependency facts) · `Doc-4J_FROZEN_v1.0.md` · `Doc-4L_FROZEN_v1.0.md` · `Doc-4M_FROZEN_v1.0.md`
6. `Doc-5A_SERIES_FROZEN_v1.0.md` … `Doc-5K_SERIES_FROZEN_v1.0.md` — API realization
7. `Doc-6A_SERIES_FROZEN_v1.0.md` … `Doc-6K_SERIES_FROZEN_v1.0.md` — DB realization (RLS, R7/R8/§11)
8. `Doc-7_SERIES_FROZEN_v1.0.md` (`Doc-7A`…`Doc-7H`) — frontend realization
9. `Doc-8A_SERIES_FROZEN_v1.0.md` … `Doc-8G_SERIES_FROZEN_v1.0.md` — test & conformance (Appendix A bands)
10. `Development_Decomposition_v1.0.md` — the work breakdown this Roadmap sequences
11. `REPOSITORY_STRUCTURE.md` · `CLAUDE.md` · `IMPLEMENTATION_START_HERE.md` · `ROADMAP.md` (non-authoritative orientation)

---

*Non-authoritative orientation document (Implementation Planning) — Derived engineering execution guidance.
Sequences the Development Decomposition into a gated build program; on any conflict the frozen document wins
and this file is patched to match. Coins no architecture, API, schema, UI, event, permission, POLICY, route,
state, or contract. No dates, no estimates.*
