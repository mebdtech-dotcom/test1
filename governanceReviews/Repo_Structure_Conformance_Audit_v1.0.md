# Repository Structure Conformance Audit — v1.0

**Date:** 2026-07-06
**Scope:** current repository disk/git state vs `REPOSITORY_STRUCTURE.md` (Structural Constitution, FROZEN v1.0, `governance-frozen-v1`) and the frozen corpus it defers to.
**Status:** COMPLETE — findings PROPOSED, awaiting owner adjudication (Gate G1). Per CLAUDE.md §13: Raise ≠ Accept; every finding passes the four-question Validate Findings gate before action.
**Produced under:** CLAUDE.md §8 (AI-generated; requires human review; architecture-affecting resolutions require human approval).
**Companions:** `REPOSITORY_STRUCTURE_v1.1_Additive_Patch_PROPOSAL.md` · `Root_File_Classification_v1.0_PROPOSAL.md` · `BOARD-PACKET-REPO-STRUCTURE_v1.0.md`.

---

## 1. Programmatic check results (run 2026-07-06)

| Check | Result | Evidence |
|---|---|---|
| `node scripts/check-structure.mjs` | **FAIL** — `missing dir: app/(admin)` | See F-02. Gate was GREEN at Wave-0 exit (`Wave-0_Integration_Audit_and_Exit_Gate_v1.0.md` item #4). The placeholder was removed **deliberately** by the owner-frozen `URL-NAMING-SEO-REVIEW-ADJUDICATION_v1.0.md` OBS-03 (ACTIONED, commit `a9de258`) — but the ratified gate script and constitution §8 were not updated in the same change, so two ratified instruments now conflict and the gate has been RED since. (Accuracy note: OBS-03's rationale says "git tracked no content under it"; in fact `app/(admin)/.gitkeep` was tracked — immaterial to the ruling, recorded for the record.) |
| `node scripts/verify-fe-wbs-coverage.mjs` | **PASS** — 151/151 pages, each owned exactly once, 35 milestones | — |
| `git ls-files generated-contracts-registry` | **PASS** — 0 tracked files; `.gitignore:12` = `/generated-contracts-registry/` | Constitution §2 "GENERATED, gitignored" honored. |
| Module shape (10 × `contracts/domain/application/infrastructure/api` + `<module>.module.ts`, `src/shared/`, `src/server/`, `tests/`) | **PASS** (per check script; independently confirmed on disk) | Modules: admin, ai, billing, communication, core, identity, marketplace, operations, rfq, trust. |
| Constitution filename case | **FAIL** — git tracks `repository_structure.md` (lowercase) | Every governance reference says `REPOSITORY_STRUCTURE.md`; breaks case-sensitive checkouts (CI = ubuntu). See F-05. |
| Lockfile hygiene | **FAIL** — both `package-lock.json` and `pnpm-lock.yaml` tracked; no `packageManager` field | ci.yml uses `npm ci` ×3; `.husky/pre-push` = `npm run typecheck`; `.prettierignore` says "managed by npm"; but pnpm-lock has the more recent commit (2026-07-04 vs 2026-07-03). See F-06. |
| Route-group census | `(public)` 30 pages · `(app)` 117 (contains `(buyer)` group + `account/` + `admin/` + `workspace/`) · `(auth)` 8 · `(admin)` **ABSENT** · `api/` handlers | §8 enumerates `(public) (app) (admin) api/` only. |
| Stale tool-config excludes | `buyer-dashboard-layout` at `tsconfig.json:29` and `eslint.config.mjs:29` — directory does not exist | See F-13. |
| Untracked junk | `.next-dev.log`, `tsconfig.tsbuildinfo` on disk; both already gitignore-covered (`*.log`:37, `*.tsbuildinfo`:21) | See F-08. |
| Tracked junk | `ChatGPT prompt.txt`, `review.txt`, `.git.code-workspace` tracked | See F-07/F-14. |

## 2. Frozen-reference pinning greps (rule R2: a file referenced by path from `generatedDocs/` can never move — frozen docs are never edited)

| Target | Frozen references | Verdict |
|---|---|---|
| `governanceReviews/` | Extensive provenance web: ADR-021/024/025 origin lines, `00_AUTHORITY_MAP.md` (multiple PROVENANCE rows), `CORPUS_INDEX.md`, Doc-2/3/4 patch chains | **PINNED — never relocates.** Taxonomy applies to new artifacts only (G1 ask ⑤). |
| `esc_registry.md` | `ADR-024_Canonical_Vendor_Subdomain_URLs.md:131` | PINNED at root |
| `ROADMAP.md` | `Build_Roadmap_v1.0.md` (343/344/390) + `Program_Status…:28` relative link `../ROADMAP.md` | PINNED at root |
| `Wave_Template_v1.0.md` | `Build_Roadmap_v1.0.md:262` ("owned by") | PINNED at root |
| `IMPLEMENTATION_START_HERE.md` | frozen relative link `../IMPLEMENTATION_START_HERE.md` | PINNED at root |
| `project_details.md` | 4 mentions across `00_AUTHORITY_MAP.md`, `Development_Decomposition_v1.0.md`, `Doc-5_Program_Governance_Note_v1.0.md` | PINNED for now; relocation to `docs/reference/` deferred (v1.1 P-5) |
| `productSpec/` · `journeys/` · `project-management/` · entire movable root doc cluster | **Zero** frozen path references | Free to consolidate |

## 3. Findings register (§13 severity ladder)

Gate rule: the package does not close until **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** (NIT/OBS never block).
Tally: **0 BLOCKER · 3 MAJOR · 4 MINOR · 3 NIT · 5 OBS.**

| ID | Sev | Finding | Proposed disposition |
|---|---|---|---|
| **F-01** | **MAJOR** | `REPOSITORY_STRUCTURE.md:179` mandates module folder `comms/`; the **supreme** frozen Doc-2 schema map says `communication`, as do `prisma/schema.prisma:32`, CLAUDE.md §3, `scripts/check-structure.mjs:29`, and the disk. The constitution's own header rules "on any conflict the frozen document wins; content is patched to match." | Flag-and-Halt executed via this audit (both sources cited). Fix = Board-approved v1.1 erratum (patch P-1) + `project_details.md` §3 cell patch-to-match. **The disk module is never renamed.** |
| **F-02** | **MAJOR** | **Flag-and-Halt — two ratified instruments conflict.** Source A: owner-frozen `URL-NAMING-SEO-REVIEW-ADJUDICATION_v1.0.md` OBS-03 (ACTIONED, `a9de258`) removed `app/(admin)` and ruled "Admin surface remains `app/(app)/admin`". Source B: constitution §8 route-group set + the ratified Wave-0 gate `scripts/check-structure.mjs:38` (closed list) still mandate `(admin)` — the gate has been RED since the removal. Not resolvable locally (CLAUDE.md §11). | Board ruling (G1 ask ③), two directions: **(a) — recommended:** conform to the later owner-frozen ruling — v1.1 P-2 retires `(admin)` from the route-group set (admin surface = `(app)/admin`) and **sanctions the matching one-line `check-structure.mjs` closed-list update** (the script self-declares "coins nothing; closed list" — changing it requires exactly this Board sanction); or **(b):** reinstate the `(admin)` placeholder — which reverses an owner-frozen ACTIONED disposition and requires reopening that adjudication. |
| **F-03** | OBS | `(auth)/` route group exists (8 pages); §8 is silent; authorized downstream by frozen `Build_Roadmap_v1.0.md` §2. | Codify in v1.1 P-2. Not a violation. |
| **F-04** | OBS | Nested `(app)/(buyer)` group + `account/`/`workspace/` composition; constitution silent (§8 stops at `(app)`). | v1.1 P-2: nested groups declared composition detail. |
| **F-05** | MINOR | Constitution tracked as lowercase `repository_structure.md`; latent breakage on case-sensitive checkouts. | Case-only `git mv` in C6 (rename ≠ content edit; Board notified via packet). |
| **F-06** | **MAJOR** | Dual lockfiles + no `packageManager` field → real resolution-divergence risk. Evidence splits: npm per CI/husky/prettierignore vs pnpm-lock most recently committed. | Owner picks Option A (npm — recommended: matches all executable tooling) or B (pnpm — requires ci.yml ×3 + husky + `packageManager` migration, all-or-nothing in one commit). Executed in C2. |
| **F-07** | MINOR | Tracked junk: `ChatGPT prompt.txt`, `review.txt`. | `git rm` in C2 (history-recoverable). |
| **F-08** | NIT | Untracked disk junk: `.next-dev.log`, `tsconfig.tsbuildinfo`; gitignore already covers both. | Disk delete in C2. |
| **F-09** | MINOR | Standalone Vite prototype `ivendorz-rfq-creator/` (27 tracked files) at top level, unregistered. | `git mv` → `prototypes/` (C3) + v1.1 registration. Owner pre-approved keep-and-relocate. |
| **F-10** | MINOR | ~24 loose non-constitutional `.md` files + 1 `.html` demo at root. | WP-C per-file classification → `docs/` consolidation (C4/C5). |
| **F-11** | OBS | `journeys/`, `productSpec/`, `governanceReviews/`, `project-management/` exist; constitution silent. | v1.1 P-4 directory registry; first two consolidate under `docs/product/`. |
| **F-12** | OBS | `src/frontend/` built (~88 files) under the frozen Doc-7 series ("reserved for Doc-7" — fulfilled). | v1.1 P-3 registers it by pointer. Conformant. |
| **F-13** | NIT | Stale excludes `buyer-dashboard-layout` in `tsconfig.json:29` + `eslint.config.mjs:29`. | Remove in C3. |
| **F-14** | NIT | `.git.code-workspace` tracked editor artifact. | G1 ask ⑧ (seed: `git rm` + gitignore `*.code-workspace`). |
| **F-15** | OBS | `governanceReviews/` pinned by the frozen provenance web (§2 above) — the owner-requested relocation into `docs/governance/` is barred for existing records. | Keep-in-place as append-only archive; forward taxonomy for NEW artifacts per G1 ask ⑤. |

## 4. PASS record

Conformant and requiring no action: 10-module nested-DDD shape · `src/shared/` (db/http/ids/result/telemetry/validation) · `src/server/` (auth/authz/context/guards/identity) · `prisma/` (4 migrations, 10-schema multiSchema incl. `communication`) · `inngest/` (client + outbox dispatch) · `tests/` (unit/integration/e2e/_harness) · `scripts/` · `public/` · generated-contracts-registry gitignored · eslint-plugin-boundaries active (§10 CI enforcement) · FE page-coverage invariant 151/151.

## 5. Closure checklist (completed post-G2; final entry of this package)

- [ ] Repository structure verified against the v1.1 registry
- [ ] All verification scripts GREEN (check-structure, verify-fe-wbs-coverage, typecheck, lint, build)
- [ ] No dangling references (sweep clean; old→new mapping table published)
- [ ] No frozen document modified (git diff on `generatedDocs/` = additive README only, if sanctioned)
- [ ] `repo.manifest.json` regenerated (generator output matches disk)
- [ ] `docs/INDEX.md` + `docs/README.md` current
- [ ] Session memory updated to new paths — migration complete
