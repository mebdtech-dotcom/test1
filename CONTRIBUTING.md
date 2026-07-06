# Contributing to iVendorz

Deliberately lightweight — this file points, it never restates.

1. **Start here:** [`IMPLEMENTATION_START_HERE.md`](IMPLEMENTATION_START_HERE.md) — reading
   order + the pre-PR checklist for developers and AI agents.
2. **Layout & boundaries:** [`REPOSITORY_STRUCTURE.md`](REPOSITORY_STRUCTURE.md) — the
   Structural Constitution (module shape, `contracts/`-only imports, forbidden patterns).
3. **Governance & AI rules:** [`CLAUDE.md`](CLAUDE.md) — authority order (§7), AI agent rules
   (§8), working rules (§11), Review & Findings Governance (§13), Red-Flag Checklist.
4. **Architecture (authoritative):** `generatedDocs/` — frozen corpus; start at
   [`generatedDocs/CORPUS_INDEX.md`](generatedDocs/CORPUS_INDEX.md). Never edit it.
5. **Governance process:** reviews use the §13 severity ladder (BLOCKER/MAJOR/MINOR gate at
   0/0/0); findings are raised, then owner-adjudicated (Raise ≠ Accept); records live in
   `governanceReviews/`; documentation map: [`docs/INDEX.md`](docs/INDEX.md).

Practicalities: npm is the canonical package manager (`package-lock.json`). Verification
gates: `node scripts/check-structure.mjs`, `npm run typecheck && npm run lint`, tests via
`npm test`. All AI-generated code requires review before merge; architecture-affecting
changes require human approval.
