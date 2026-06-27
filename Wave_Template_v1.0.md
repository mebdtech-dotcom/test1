# Wave Execution Template — v1.0 (FROZEN)

> Extracted on Wave-0 close (Board rev.3 deliverable). Every implementation wave (Wave 1 → Wave 6)
> instantiates this structure unchanged — **only the Work Packages differ**. Inherit unless
> intentionally version-bumped. Non-authoritative process doc; on any conflict the frozen corpus
> wins (Flag-and-Halt).

## Corpus supremacy
If any part of a wave's execution conflicts with the frozen corpus, **the frozen corpus prevails** —
Flag-and-Halt, never resolve locally (Authority Order §7). Realize, never re-decide.

## Structure (per wave)

1. **Execution Dashboard** — live control panel: `WP · Artifact ID · Owner · Branch · Depends · Status · State · PR`.
2. **Glossary** — WP · Phase · Group · Gate · Owner · Producer/Consumer · Artifact ID · ESC · GREEN.
3. **Phases → Groups → WPs** — phases answer a question ("can every later WP start?" → "can every
   subsystem run?" → "integration"); groups are parallel buckets; an explicit **gate** between phases.
4. **Dependency + Ownership matrix** — `WP · Group · Owner-Agent · Depends-On · Parallel-With · PR-Size ·
   Files-Owned` (single-owner, file-granular; ownership exclusive *during execution*, not permanent).
5. **Work Packages** — each in **WP Template v1.0** (below).
6. **Integration Audit** (final WP) — programmatic checklist incl. a Repository Ownership Audit.
7. **Exit Gate** — the wave's corpus-defined exit clauses; per-clause pass/fail; all WP tags present.
8. **Retrospective** — short engineering note; carry-forwards.

## WP Template v1.0

```
Metadata     — ID · Artifact ID (W{n}-<DOMAIN>-NNN) · Execution Group · Owner-Agent ·
               Depends-On · Parallel-With · PR-Size
Files Owned  — exact paths this WP may create/modify (single-owner; no overlap)
Produces     — artifacts/capabilities other WPs consume
Consumes     — Producer outputs of its Depends-On set (+ frozen corpus by pointer)
Modifies     — pre-existing tracked files it changes (drift corrections)
Frozen Pointer — the authority it realizes
Acceptance   — the checkable gate that closes it (maps to the wave DoD)
Watch-point  — realize-never-redecide / flag-and-halt risk
```

## Per-WP lifecycle

implement → self-verify → **multi-agent board review** (architecture-conformance · build/CI ·
security/secrets) → consolidate → **Validate-Findings gate** (Valid? · Applicable? · Best for the
product? · Corpus-consistent?) → apply accepted fixes → regression recheck → technical audit →
**merge-collision check** (rebase on the integration branch; diff ⊆ Files-Owned) → merge +
tag `wave{n}/wp-{n}.x-green`. Close only at BLOCKER=MAJOR=MINOR=0 (CLAUDE.md §13).

## WP state model

`PLANNED → IN_PROGRESS → UNDER_REVIEW → FIXING → READY_FOR_AUDIT → GREEN → MERGED`.
A WP enters a downstream `Depends-On` only when `MERGED`; `FIXING` loops to `UNDER_REVIEW`.

## Git model

Integration branch `wave/{n}-*` off the prior wave's tip; one `wp/{n}.x-*` branch per WP; merge
each into the integration branch after its lifecycle; after the Integration Audit + Exit Gate,
one PR `wave/{n}-*` → `main`.

## Failure recovery

A defect in one merged WP → **revert only that WP's merge commit** (file-level ownership isolates
the diff) → re-run the Integration Audit → continue. A full wave revert (to the last green wave
tag) is reserved for a cross-cutting failure the per-WP revert can't isolate.

## Escalation (Raise ≠ Accept)

A corpus conflict or architecture-affecting question is **Flagged-and-Halted**: cite both sources,
record an `ESC-*` in `governanceReviews/`, escalate to the Board for a human-approved additive
patch; the dependent step (and only that step) parks until ruled. Never resolve locally.

---

*WP Template v1.0 (frozen). Adopted repo-wide; Waves 1–6 instantiate it. Wave 0 is the reference
instance — see `governanceReviews/Wave-0_Integration_Audit_and_Exit_Gate_v1.0.md`.*
