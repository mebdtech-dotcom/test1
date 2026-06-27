# iVendorz — Wave 0 Baseline Report — v1.0

| Field | Value |
|---|---|
| **Document type** | Permanent engineering baseline record (delivery artifact). |
| **Authority** | **NON-AUTHORITATIVE.** On any conflict, the FROZEN corpus and `generatedDocs/00_AUTHORITY_MAP.md` win. References the corpus by pointer only; restates no architecture. |
| **Date** | 2026-06-27 |
| **Supersedes** | — (first engineering baseline) |

> This file records the engineering facts of the **Wave 0 — Repository Bootstrap** delivery so the
> baseline is recoverable and auditable. It is a *delivery* record, not a governance authority and not
> a status tracker — the live phase/status SSoT is `generatedDocs/00_AUTHORITY_MAP.md` +
> `generatedDocs/Program_Status_And_Roadmap.md`; the gated build sequence is
> `generatedDocs/Build_Roadmap_v1.0.md` (§2 Wave 0). The wave's governance record is
> `governanceReviews/Wave-0_Integration_Audit_and_Exit_Gate_v1.0.md`.

---

## 1. Baseline identity

| Field | Value |
|---|---|
| **Wave** | Wave 0 — Repository Bootstrap (`Build_Roadmap_v1.0.md` §2) |
| **Completion status** | **COMPLETE — delivered to `main`.** Exit Gate GREEN (5/5); Integration Audit GREEN (11/11). |
| **Merge commit SHA** | `b1c70fd84a4448af2738f4ba13630665144e69c1` (`--no-ff` delivery merge; parents `35d78ef` old `main` + `237603c` `wave/0-bootstrap`) |
| **Baseline tag** | `wave0-complete` (annotated; points at `b1c70fd`) |
| **Default branch** | `main` |
| **History** | Complete — no squash; all 14 work-package merges + the ESC R-a baseline preserved under the delivery merge. |
| **Git remote** | none configured (delivery was a local merge). |

## 2. Toolchain pins (the baseline stack)

Resolved from `package.json` + `package-lock.json` (lockfileVersion 3) at `b1c70fd`. The fixed stack
is mandated by the Master System Architecture / `CLAUDE.md` §2; exact pins live in the lockfile.

| Concern | Version | Source of truth |
|---|---|---|
| **Node** | **20 LTS** (`.nvmrc` = `20`; `engines.node` = `>=20`; CI = Node 20). Local dev observed on v24 — a tolerated forward drift, CI pins 20. | `.nvmrc`, `package.json` |
| **Package manager** | **npm** (lockfileVersion 3) | `package-lock.json` |
| **Next.js** | **15.5.19** (range `^15.1.3`) | lockfile |
| **React / React-DOM** | **19.2.7** (range `^19.0.0`) | lockfile |
| **TypeScript** | **5.9.3** (range `^5.7.2`) | lockfile |
| **Prisma / @prisma/client** | **6.19.3** (range `^6.2.1`) | lockfile |
| **Vitest** | **2.1.9** | lockfile |
| **Playwright** (`@playwright/test`) | **1.61.1** (+ `@axe-core/playwright` 4.x) | lockfile |
| **ESLint** | **9.39.4** (flat config + `eslint-plugin-boundaries`) | lockfile |
| Database engine (Wave 0 gate) | PostgreSQL 16 (Docker / CI service container; Supabase deferred to Wave 1) | `docker-compose.yml`, `.github/workflows/ci.yml` |

## 3. Health at baseline (all green)

| Signal | Status | Evidence |
|---|---|---|
| **Build** | ✅ GREEN | `next build` 0 (4 routes incl. `/api/inngest`) · `tsc --noEmit` 0 |
| **Lint** | ✅ GREEN | `eslint .` 0 · import-boundary rule enforced (planted cross-module-internal import → error at lint, pre-commit hook, and CI) |
| **Format** | ✅ GREEN | `prettier --check .` 0 |
| **Vitest** | ✅ GREEN | `vitest run` 4/4 |
| **Playwright** | ✅ GREEN | `playwright test` 2/2 (incl. `@axe-core` a11y smoke — 0 violations) |
| **Migration** | ✅ GREEN | `prisma migrate deploy` creates the 10 frozen module schemas; `scripts/check-schemas.mjs` probe asserts exactly 10 (idempotent; fails if one is dropped) — proven from an empty Postgres 16 |
| **CI** | ✅ OPERATIONAL | `.github/workflows/ci.yml` — 3 jobs (verify / unit / e2e); all mandated Wave-0 gates wired (typecheck, build, lint, format, structure, no-cross-schema-FK, no-secrets, migrate+probe, vitest, playwright) |
| **Structure** | ✅ GREEN | `scripts/check-structure.mjs` — 10 modules × (module.ts + 4 `contracts/` + 4 layers), `shared`, `server`, 4 App Router route groups, tests |
| **Wave Exit Gate** | ✅ **GREEN — 5/5** | skeleton compiles · 10 schemas migrate clean · harness runs · CI merge-gate active · all WP green tags present |

CI **execution** ran locally against the Postgres 16 container; marking the GitHub checks **"required"**
on `main` is a repo-admin action that needs a remote (see §5).

## 4. What the baseline contains (by pointer — not restated)

The spine only — **no business logic, no models, no domain code** (Wave 0 scope, `Build_Roadmap` §2):
the Next.js 15 App Router shell + 4 route groups; the 10 bounded DDD module trees (`contracts/`-only
cross-module surface) per `repository_structure.md`; `prisma/schema.prisma` with the 10 frozen schema
namespaces (zero models) + the idempotent baseline migration; Supabase auth seams; the Inngest serve
scaffold (zero functions); the Doc-8B test harness (runner + ephemeral DB + six out-of-wire mock
doubles); the generated-contracts registry build; CI merge-gate; boundary lint + git hooks; secrets
hygiene. Authoritative detail lives in the frozen corpus and `repository_structure.md` — **not here.**

## 5. Known non-blocking follow-ups (Raise ≠ Accept; recorded, not gating)

External / repo-admin (cannot be done by an execution agent):
- **GitHub remote + branch protection** on `main` + mark CI checks **"required"** (the literal
  "merge-gate enforced"). No remote is configured yet.
- **Supabase project + secrets** — deferred to Wave 1 (`Build_Roadmap` §2 defers live infra; the
  Wave-0 gate runs against the Postgres container).

Carried engineering follow-ups (recorded in `governanceReviews/`):
- `governanceReviews/W0-DEP-AUDIT-FOLLOWUP_v1.0.md` — npm-audit advisories (dev-only / unreachable at
  Wave 0); action at next lockfile regeneration.
- Doc-sync: `repository_structure.md` §8 diagram omits the `(auth)` route group (the repo implements
  all four; `Build_Roadmap` §2 mandates four) — additive patch to the non-authoritative structure doc.
- `scripts/check-structure.mjs` could additionally flag *unexpected* `src/modules/*` entries
  (close the over-inclusion gap against the registry).

## 6. Repository health summary

The repository builds, lints, type-checks, tests, and migrates clean from `main` with the frozen
corpus byte-identical to its pre-Wave-0 state (verified: `git diff 35d78ef b1c70fd -- generatedDocs/Doc-*`
empty; no Master/ADR change). The mis-committed Prisma client was relocated to the gitignored registry
per `Doc-6A` §11.4. Import boundaries are empirically enforced. The one architecture-adjacent ambiguity
(the schema-migration clause) was handled as a formal FLAG-AND-HALT
(`governanceReviews/ESC-W0-MIGRATE-SCHEMAS_v1.0.md`) and realized exactly per Board ruling **R-a** — no
frozen document was edited. **The baseline is healthy and ready for Wave 1 — Foundation.**

---

*Non-authoritative engineering baseline record. Patch additively if a fact changes; the corpus and the
live status SSoT always win. Wave 0 execution is closed — future work begins from Wave 1.*
