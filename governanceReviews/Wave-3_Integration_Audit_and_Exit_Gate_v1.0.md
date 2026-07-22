# Wave 3 — Independent Domains (M2 · M5 · M6 · M7) — Integration Audit + Exit Gate — **v1.0 — GATED (GREEN)**

| Field | Value |
|---|---|
| **WP** | Wave-3 Integration Audit [W3-AUDIT-001] |
| **Date** | 2026-07-11 (prep) · **2026-07-12 (gate run — GREEN)** |
| **Status** | **GATED — integration executed on `wave/3-integration` (off `main` `4bf4645`); all six §0.1 criteria GREEN.** All four modules merged; the one cross-cutting conflict (`core.write_outbox_event.v1` SD-vs-no-SD) was owner-ruled and resolved to Option A; combined `tsc` clean · Prisma schema valid · **all 18 Wave-3 + base migrations apply clean on ephemeral PG** · **vitest 806/806 (61 files)**. See §0.2. |
| **Scope** | M2 `marketplace` · M5 `trust` · M6 `communication` · M7 `billing` — the four Wave-3 independent domains, each on its own branch cut from `main` (`4bf4645`), integrated on `wave/3-integration` at this exit gate (Wave-2 single-wave-exit precedent). |
| **Method** | Mirrors `Wave-2_Integration_Audit_and_Exit_Gate_v1.0.md`. Prep pass = read-only per-branch (2026-07-11); **gate run = actual integration** on `wave/3-integration` in an isolated worktree against a throwaway ephemeral Postgres (port 5599), no contamination of any active session's DB (`[[review-concurrency-contamination]]`). |
| **Verdict** | **✅ PASS — integration GREEN, exit gate MET.** All four modules integrated; zero frozen-corpus drift (additive patches only); the outbox mechanism conflict resolved Option A (owner-ruled, `[ESC-CORE-OUTBOX-MECH]`); combined build/migrate/suite/CHK-8-024 all green. **Remaining outward step: owner-gated merge of `wave/3-integration` → `main`** (+ Supabase prod migrations), per §B. Local `next build` is NOT the oracle on Windows — **CI is authoritative for `next build` + Playwright E2E** (`[[ci-is-the-build-oracle]]`); run on the merge PR. |

> **Wave 3 ≠ Wave 2 in shape.** Wave 2 asserted complete M0+M1 **module DoDs**. Wave 3's committed work is **per-module slices with explicit deferrals** (M2: discovery reads, TrustIndicators/products/search deferred; M6: support-ticket pilot, event-consumer BCs deferred; M7: plan/entitlement catalog, ~of 33 contracts; M5: verification substrate WP1).

### §0.1 Gate shape — RULED (Board, 2026-07-11) — **DELIVERED-SLICE EXIT GATE · APPROVED**

This gate asserts the **delivered surface**, not full-module DoDs. Evaluation criteria (the six load-bearing clauses):

1. **Delivered-surface conformance** — each committed slice conforms to its frozen contracts/API/DB anchors.
2. **Cross-module integrity** — boundaries, contracts-only imports, signal firewall, no cross-schema FK/table access.
3. **Shared-infrastructure reconciliation** — the 5 shared files (`schema.prisma`, `AUTHORITY_MAP`, `esc_registry`, `db.ts`, `backend_build_plan`) union-merge cleanly; combined schema/migrations coherent.
4. **Combined build/test integrity** — build · lint · format · structure · migrate · **full suite** · CHK-8-024 all green on the integration branch.
5. **Governance completeness** — zero frozen-corpus drift; every corpus change additive-patch + Authority-Map-registered; ESCs recorded with disposition.
6. **No regression** — Wave-0…2 inherited behavior + suites still green.

**Explicitly EXCLUDED from this gate:** (a) full-module Definition of Done; (b) deferred capabilities scheduled for later waves (M2 trust-indicators/search, M6 event-consumer BCs, M7 remaining contracts, M5 remaining Trust WPs). These are carried (§D), not gating.

---

### §0.2 GATE RUN — RESULTS (2026-07-12) — **GREEN**

The §C trigger was met (M5 completed all 5 BC-TRUST contexts; M7 completed all 33 contracts; M2/M6 at their delivered stops; owner authorized the coordinator to run the gate). Integration executed on **`wave/3-integration`** (cut from `main` `4bf4645`) in an isolated worktree.

**Integration lineage:** governance docs → M5 trust (canonical outbox) → M2 marketplace → M6 communication → M7 billing → Option-A outbox cleanup → union-repair + migration reconciliation → test reconciliation.

**The one cross-cutting conflict — `core.write_outbox_event.v1` (M0 shared kernel).** Discovered at merge (not in the v0.1 prep): M5 and M7 had each realized the M0 outbox-write primitive divergently — M5 no-SD (non-`RETURNING` caller-context insert), M7 `SECURITY DEFINER`. Raised as a Flag-and-Halt (`[ESC-CORE-OUTBOX-MECH]`, `governanceReviews/BOARD-PACKET-W3-CORE-OUTBOX-MECHANISM_v1.0.md`); **owner-ruled Option A (no-SD) 2026-07-12.** Resolved at this gate: canonical = M5's `31b997d`; `WriteOutboxEventResult` dropped (frozen `Response: none`, Doc-4A §21.5) → void return; M7's `SECURITY DEFINER` function + its `20260711180000_core_write_outbox_event` migration withdrawn; billing emitters re-pointed to `@/modules/core/contracts`. **Empirically confirmed: no Doc-6B tenant-INSERT policy needed** — billing's `purchase_subscription` emit works on the privileged app connection (RLS backstop intact; the one test asserting the withdrawn SD mechanism was reconciled to assert the no-SD backstop).

**Shared-file reconciliation:** `00_AUTHORITY_MAP.md` + `esc_registry.md` auto-merged (additive). `schema.prisma` / `db.ts` / `backend_build_plan.md` union-resolved; two **union artifacts** repaired where conflict boundaries cut through syntax (dropped model `}` on `AdminRating`/`CommunicationCommandDedup`; dropped `);` on two `db.ts` grant calls) + a pre-existing duplicate `UUID_PATTERN` in `src/shared/ids/index.ts` de-duplicated. **Four** M5↔M6/M7 migration-timestamp collisions (incl. the one noted in §A-11) reconciled by +30s bumps on the M6/M7 side (no reordering); withdrawing billing's outbox migration cleared a fifth.

**Six-criteria results (§0.1):**

| # | Criterion | Result |
|---|---|---|
| 1 | Delivered-surface conformance | ✅ each slice conforms; outbox reconciled to the frozen Doc-4B contract |
| 2 | Cross-module integrity (boundaries, contracts-only, firewall, no cross-schema FK) | ✅ disjoint module trees; billing re-points via `@/modules/core/contracts` only |
| 3 | Shared-infrastructure reconciliation | ✅ union-merged; schema valid; all migrations coherent |
| 4 | Combined build/test integrity | ✅ **`tsc` clean · `prisma validate` valid · all 18 Wave-3 + base migrations `migrate deploy` clean · vitest 806/806 (61 files)** on ephemeral PG. `next build` + E2E = CI (oracle), on the merge PR. |
| 5 | Governance completeness | ✅ zero frozen-corpus drift; all corpus changes additive patches; `[ESC-CORE-OUTBOX-MECH]` recorded RESOLVED |
| 6 | No regression | ✅ Wave-0…2 inherited suites green within the 806 |

**Integration commits (`wave/3-integration`):** 4 merge commits (M2/M5/M6/M7) + `d7c1d0a` (Option-A cleanup) + `2d58a42` (union-repair + migration reconciliation) + `0d05cf9` (test reconciliation) + registry/audit folds.

---

## §0. Delivery + readiness state

| Module | Branch (worktree) | Ahead | Delivered | Session state |
|---|---|---|---|---|
| **M2 marketplace** | `wave/3-marketplace` | +3 | W3-MKT-1 (slug + profile read) · W3-MKT-2 (vendor directory) | delivered; **session-complete UNCONFIRMED** |
| **M6 communication** | `wave/3-communication` | +1 | W3-COMM-1 (support-ticket pilot) | **delivery-complete** (remainder deferred, owner-ruled) ✅ |
| **M7 billing** | `wave/3-billing` (`iVendorz-m7-billing`) | +4 | W3-BILL-1 (plan-catalog reads) · W3-BILL-2 (plan lifecycle writes) · W3-BILL-3 (entitlement/bundle writes) | delivered; **session-complete UNCONFIRMED** |
| **M5 trust** | **`wave/3-trust` = 0**; real work `wave/3-trust-wp1` (`iVendorz-m5-trust`) | +2 | W3-TRUST-1 WP1 (verification substrate) | **MID-BUILD ⚠️ — not on its wave branch** |

**Readiness blockers to the full gate:** (1) **M5** must complete its Wave-3 scope and land on `wave/3-trust`. (2) **M2 + M7 sessions** must confirm delivery-complete (no more commits incoming). (3) A **quiet-tree window** (no active session using the shared Postgres) is required to run the combined suite without contamination.

---

## §A. Wave Integration Audit (14 items — Wave-2 mirror)

Legend: **✅ PRELIM** = verified read-only, per delivered branch, pre-integration · **⏳ HELD** = requires the integration branch (all 4) + owned DB.

| # | Item | Status | Evidence (read-only, this pass) |
|---|------|--------|--------|
| 1 | Builds (typecheck `tsc`) | ⏳ HELD | each branch self-reported `tsc 0` at delivery; combined re-verify on the integration branch |
| 2 | Lint clean (`eslint` + boundaries) | ⏳ HELD | per-branch reported clean; combined re-verify |
| 3 | Format clean (`prettier --check`) | ⏳ HELD | per-branch reported clean; combined re-verify |
| 4 | Tests pass (`vitest` vs real Postgres); no `.only/.skip` | ⏳ HELD | per-branch reported green (M2 430/430 · M6 423/423 · M7 18/18+ · M5 partial); **combined suite HELD** (needs all 4 + owned DB) |
| 5 | Structure matches (`check-structure.mjs`) | ⏳ HELD | combined check on the integration branch |
| 6 | Import boundaries enforced (`eslint-plugin-boundaries`) | **✅ PRELIM** | **ownership scan: each branch touches ONLY its own `src/modules/<m>` + `src/server/<m>`** (M2 marketplace 17+6 · M6 communication 13+3 · M7 billing 23+5 · M5 trust 8+2). Sole shared touch = **M6 `src/server/context` (2 files)** = `withStaffContext` app-layer edge (sanctioned, Review-A-passed; the Wave-2 `src/server/identity`+`authz` precedent). No cross-module `src/modules`/`src/server` contamination. |
| 7 | Generated artifacts not tracked | ⏳ HELD | combined `git ls-files` check |
| 8 | CI merge-gate present | ✅ | `.github/workflows/ci.yml` on `main` (inherited) |
| 9 | **No architecture drift / FROZEN corpus untouched** | **✅ PRELIM** | **per-branch `git diff main..<b>` over frozen base docs (`_FROZEN`/`_Content_v1.0_`/Doc-2 blueprint/Doc-3/Doc-4B_Content/Master/ADR_Compendium) = 0 in-place edits on ALL FOUR branches.** All `generatedDocs` changes are **additive patches** (new files) — M2: Doc-4D_VendorSlugResolve v1.0.4 + Doc-5D ×3; M6: Doc-2_Patch_v1.0.9 + Doc-4H_SupportTicketAuditToken; M7: Doc-4I_5I_PlanStatusModel + Doc-5I_RetiredVisibility; M5: none. |
| 10 | Combined schema = M2+M5+M6+M7 tables across their 4 namespaces | ⏳ HELD | combined `check-schemas.mjs` after schema.prisma union-merge |
| 11 | Migrations forward-only, apply clean (combined) | ⏳ HELD (⚠ note) | each branch's migrations are own-schema + forward-only. **Timestamp collision: M6 `20260711160000_communication_support_tickets` ⟂ M5 `20260711160000_trust_verification_substrate`** — distinct dir names, different schemas, no cross-dependency → harmless (Prisma orders by full name); **noted**, no rename needed. Combined `migrate deploy` clean-apply HELD. |
| 12 | **`CHK-8-024` MANDATORY (RLS byte-equivalence)** | ⏳ HELD | per-branch RLS suites reported green; the **combined** byte-equivalence pass is the load-bearing gate (M5's staff-RLS + score-firewall; M2 public/anonymous tri-actor; M6 recipient/party; M7 billing firewall) |
| 13 | Secrets + **no cross-schema FK** | **✅ PRELIM** | **cross-schema-FK scan of all four branches' new migrations = CLEAN** (only own-schema FKs + the sanctioned `core.id_sequences` allocator ref). Combined `check-no-secrets.mjs` HELD. |
| 14 | **Repository Ownership Audit** | **✅ PRELIM (M2/M6/M7)** | each delivered branch's code ⊆ its module + sanctioned shared (M6 `src/server/context`). Full audit re-run on the integration branch incl. M5. |

**Read-only governance sub-verdict:** the delivered branches (and M5's partial) are **clean** on every clause verifiable without integrating — **zero frozen-corpus drift, additive-patches-only, clean module ownership, no cross-schema FK.** Nothing blocks governance; the open work is the *combined* build/migrate/suite + M5.

---

## §B. Integration reconciliation plan

- **Code merges cleanly** — the four modules' `src/modules/<m>` + `src/server/<m>` trees are **disjoint** (§A item 6). No semantic merge conflict in code.
- **Shared files = additive UNION.** Five shared files each receive additive appends; the integration keeps **every** module's additions:
  - `generatedDocs/00_AUTHORITY_MAP.md`, `esc_registry.md` → predicted **0 conflicts** (append clean).
  - `prisma/schema.prisma`, `tests/_harness/db.ts`, `docs/backend/backend_build_plan.md` → a few **append-region** conflicts as the 3rd/4th branch folds in; **resolve by union** (all models / all RLS grants / all WP records kept). No semantic conflict.
- **Integration procedure (when triggered):** cut `wave/3-integration` from `main`; merge the four module branches in turn (isolated worktree, per `[[parallel-session-branch-coordination]]`); resolve the 5 shared files by union; regenerate Prisma client; run the combined §A HELD clauses (build/lint/format/**migrate**/**full suite**/**CHK-8-024**/structure) on an **owned** test DB during a quiet-tree window.
- **Merge to `main`:** owner-gated, per-module PRs (`Build_Roadmap` "one module scope per PR"), all gated by this exit review — the **outward/owner-authorized** action (Wave-2 WP-1.9 precedent: push + branch-protection + Vercel + Supabase-prod-migrations owner-gated).

---

## §C. Readiness TRIGGER (what unblocks the full gate)

Run the combined integration + §A HELD clauses + Part-B merge **only when ALL of**:
1. ✅ **M5 trust** completed all 5 BC-TRUST contexts (`wave/3-trust-wp1` `a68e997`) — integrated here. (Its code lived on `wave/3-trust-wp1`; `wave/3-trust` held the coordination/governance docs.)
2. ✅ **M2 + M7** delivery-complete (M7 = all 33 contracts; M2 = its delivered discovery slices); **M6** at its owner-ruled pilot stop.
3. ✅ **Owner ruling on gate shape — RULED: DELIVERED-SLICE EXIT GATE (Board, 2026-07-11, APPROVED).** §0.1 closed.
4. ✅ **Quiet-tree window honored** — the combined suite ran in an isolated worktree against a throwaway ephemeral Postgres (port 5599); zero contamination of any active session's DB.

**All triggers met — the gate ran 2026-07-12; results in §0.2.**

---

## §D. Carried forward (recorded; non-blocking)

- **M6:** `[ESC-COMM-STAFF-AUTHZ]` (DC-3 roster-time staff hard-gate); M6 event-consumer BCs (Notifications/Delivery/Messaging) deferred to their §8 producers (Waves 4–5, owner-ruled).
- **M7:** `[ESC-BILL-RETIRE-VIS]` was owner-ruled + folded (`Doc-5I_RetiredVisibility_Patch`); confirm no residual billing ESCs at integration.
- **M2:** deferred `trust_indicators`/`profile_experience` projection (needs M5); `search_catalog` unbuilt; program-wide `[ESC-MKT-HUMANREF-ENUM]` + `[ESC-MKT-RATELIMIT-ENFORCE]` (Board-dispositioned non-blocking).
- **M5:** verification substrate WP1 only — remaining Trust WPs pending (its own delivery scope).

---

*Wave-3 Integration Audit + Exit Gate — **v1.0 · GATED (GREEN) 2026-07-12**. All four modules integrated on `wave/3-integration`; the `[ESC-CORE-OUTBOX-MECH]` outbox conflict resolved Option A (owner-ruled); combined `tsc`/`prisma validate`/`migrate deploy`/`vitest 806/806` green on ephemeral PG. §A prep-pass ⏳ HELD markers below record the 2026-07-11 read-only state and are **superseded by §0.2**. Remaining outward step = owner-gated `wave/3-integration` → `main` PR (CI runs `next build` + Playwright — the authoritative build/E2E oracle) + Supabase prod migrations. Non-authoritative under the frozen corpus; on conflict the frozen doc wins.*
