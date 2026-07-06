# BOARD PACKET — Repository Structure Package (Gate G1)

**Date:** 2026-07-06 · **Status:** AWAITING OWNER BOARD (human gate — CLAUDE.md §8: architecture-affecting artifacts require human approval)
**Deliverables under review:**
[WP-A · Conformance Audit](Repo_Structure_Conformance_Audit_v1.0.md) · [WP-B · v1.1 Additive Patch](REPOSITORY_STRUCTURE_v1.1_Additive_Patch_PROPOSAL.md) · [WP-C · Classification](Root_File_Classification_v1.0_PROPOSAL.md)

---

## 1 · Executive summary

The Wave-0 structure is conformant at the module/layer level, but the audit found **3 MAJOR · 4 MINOR · 3 NIT · 5 OBS** (0 BLOCKER). Two MAJORs are constitution-drift (`comms/` vs frozen `communication`; dual lockfiles); the third is a **Flag-and-Halt between two ratified instruments**: the owner-frozen URL/SEO adjudication (OBS-03, `a9de258`) deliberately removed `app/(admin)` ("admin surface remains `(app)/admin`"), but constitution §8 and the ratified gate `check-structure.mjs` still mandate it — the gate has been RED since. Recommended: v1.1 retires `(admin)` and sanctions the one-line gate-script update, conforming to the later frozen ruling. The package then consolidates ~50 loose documentation files into a single owner-approved `docs/` hierarchy, registers all directories in a v1.1 additive constitution patch, and cleans the root — with every file frozen-reference-checked first: `governanceReviews/` and six root files are **pinned** by frozen path references and never move. Execution is gated (G1 → moves → G2), commit-atomic, and never touches `src/`, `app/` code, `prisma/`, or any frozen document body.

## 2 · Decision requests

| # | Ask | Seed / recommendation |
|---|---|---|
| ① | Adjudicate audit findings F-01…F-15 (dispositions in WP-A §3) — incl. the **M6 erratum** (F-01: v1.1 supersedes `comms/` by pointer to Doc-2; disk never renamed) | Approve as proposed |
| ② | **Lockfile ruling (F-06):** Option A = npm (matches ci.yml, husky, .prettierignore) or Option B = pnpm (full ci/husky/packageManager migration, one commit) | **Option A (npm)** |
| ③ | **F-02 Flag-and-Halt ruling — `(admin)` route group:** (a) v1.1 retires `(admin)` per the owner-frozen OBS-03 (admin surface = `(app)/admin`) + sanction the one-line `check-structure.mjs` closed-list update, restoring the gate to GREEN; or (b) reinstate the placeholder — reverses the frozen OBS-03 disposition and reopens that adjudication | **(a)** — conform to the later owner-frozen ruling |
| ④ | **Historical-links policy:** frozen/historical docs keep old links; the WP-C §5 old→new mapping table is the lookup; only live docs edited | Approve (rejection flips governanceReviews-referenced movers to KEEP) |
| ⑤ | **Forward home for new governance/ADR-proposal artifacts:** subfolders inside pinned `governanceReviews/` vs `docs/governance/` + `docs/adr/` | `governanceReviews/` subfolders (keeps the provenance web in one place); `docs/adr/` reserved for engineering notes/RFCs only |
| ⑥ | **`generatedDocs/README.md`** "⚠ DO NOT EDIT — Frozen Corpus" warning — an ADDITIVE file inside the corpus directory; no frozen document body touched | Approve |
| ⑦ | **`CONTRIBUTING.md`** — thin pointer to IMPLEMENTATION_START_HERE + governance rules | Approve |
| ⑧ | **`.git.code-workspace`** — tracked editor artifact | `git rm` + gitignore `*.code-workspace` |
| ⑨ | **`repo.manifest.json`** — machine-readable area map; GENERATED via `scripts/build-repo-manifest.mjs`, regenerated on every structure change, never hand-maintained. Seed: `{"version":"1.1","frozenCorpus":"generatedDocs/","governance":"governanceReviews/","livingDocs":"docs/","projectManagement":"project-management/","designSources":"design/","prompts":"prompts/","templates":"templates/","examples":"examples/","prototypes":"prototypes/"}` | Approve |

**Registered deferrals (no ask):** `.github/CODEOWNERS` (on multi-contributor; seed in WP-C §6) · `project_details.md` → `docs/reference/` (future additive patch) · `LICENSE` (owner-provided only).

## 3 · On approval

Precondition: team-2's in-flight work checkpoint-committed. Then branch `chore/repo-structure`, commits C2 (hygiene) → C3 (prototypes) → C4 (docs/ consolidation) → C5 (new homes + `templates/execution-checklist.md`) → C6 (constitution: case fix + v1.1 append + project_details cell) → C7 (CLAUDE.md §10 mirror + manifest). Verification after each commit (check-structure GREEN, wbs-coverage GREEN, typecheck/lint/build, dangling-ref sweep). Owner merge at G2; never pushed. Closure checklist: WP-A §5.
