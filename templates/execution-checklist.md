# Repository Structure Change — Execution Checklist (template)

**Extracted from:** the Repo Structure Package (G1 approved 2026-07-06, 9 Board asks ①–⑨).
Reuse this checklist for every future repository-structure change. It encodes the ratified
execution model: **audit → Board gate (G1) → atomic execution → verification → owner merge (G2).**

## Phase 1 — Plan & gate

- [ ] Conformance audit authored in `governanceReviews/` (findings per CLAUDE.md §13 severities)
- [ ] Frozen-reference grep for **every** mover (`grep -rnF "<name>" generatedDocs/`) — any hit
      flips the file to KEEP (rule R2); frozen documents are **never** edited
- [ ] Additive constitution patch PROPOSAL authored (append-only; version-history table updated)
- [ ] Classification doc authored (KEEP / MOVE with target + link budget / DELETE junk only)
- [ ] Board packet ≤2–3 pages: decision asks + links only, never restated detail
- [ ] **Gate G1 (HUMAN):** owner rules on every ask; nothing moves before approval

## Phase 2 — Execute (atomic commits, `git mv` throughout, never push)

- [ ] Precondition: other teams' in-flight work checkpoint-committed (`git status --porcelain`
      clean); **never stash others' work**
- [ ] Branch `chore/<change-name>` off the wave branch
- [ ] Hygiene commit (deletes, lockfile, ignores)
- [ ] Relocation commits (one concern per commit; renames must show ≥ R090 in `git log --stat`)
- [ ] Link sweep after each move batch: fix **live docs only** — historical records
      (`governanceReviews/`, `review-log.md`, `changelog.md`) and the frozen corpus keep old
      links; the old→new **mapping table** in the classification doc is the permanent lookup
- [ ] Check functional path references too (scripts/configs that *read* moved files), not
      only markdown links
- [ ] Constitution commit **post-G1 only**: append the approved patch text + header bump;
      companion patched-to-match files updated
- [ ] Mirror-sync commit: CLAUDE.md layout mirror, `docs/INDEX.md`, regenerate
      `repo.manifest.json` (generated metadata — never hand-edited; regenerate + commit
      together with every structure change)

## Verification (after every commit; full build at close minimum)

```
node scripts/check-structure.mjs
node scripts/verify-fe-wbs-coverage.mjs
npm run typecheck && npm run lint && npm run format
npm run build
node scripts/build-repo-manifest.mjs --check
```

- [ ] Dangling-reference sweep: resolve every relative markdown link in live docs — zero broken
- [ ] `git status --porcelain` empty after each commit
- [ ] No frozen document modified (`git diff <base> -- generatedDocs/` = additive files only, if sanctioned)

## Close

- [ ] Repository structure verified against the constitution registry
- [ ] Mapping table published; documentation index current
- [ ] **Gate G2 (HUMAN):** owner reviews the branch and merges locally
- [ ] Post-merge: session memory updated to new paths
