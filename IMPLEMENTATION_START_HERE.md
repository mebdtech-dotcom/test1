# IMPLEMENTATION — START HERE

**Audience:** developers and AI coding agents (Claude Code, Cursor, Antigravity, Windsurf).
**Status (2026-06-28):** the **entire design + realization + verification corpus is COMPLETE / FROZEN**,
and **Waves 0–1 are DELIVERED** — Wave 0 Repository Bootstrap (`wave0-complete`) + Wave 1 Foundation /
Walking Skeleton (`wave1-complete`).

- **Architecture:** Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A…4M — **FROZEN** (`Doc-4_SERIES_FROZEN_v1.0`).
- **API realization (Doc-5):** `Doc-5A` metastandard + `Doc-5B`…`Doc-5K` (M0–M9) — **all FROZEN**.
- **Database realization (Doc-6):** `Doc-6A` metastandard + `Doc-6B`…`Doc-6K` (M0–M9) — **all FROZEN**.
- **Frontend realization (Doc-7):** `Doc-7A`…`Doc-7H` — **all FROZEN** (`Doc-7_SERIES_FROZEN_v1.0`).
- **Test & conformance (Doc-8):** `Doc-8A`…`Doc-8G` — **all FROZEN** (`Doc-8_SERIES_FROZEN_v1.0`; the conformance fabric, authored-not-run, gates the eventual Code).

**Current phase: Wave 2 — Core Platform (M0 → M1).** The frozen corpus decomposes into a gated build sequence via
two non-authoritative planning artifacts: the **Development Decomposition**
(`generatedDocs/Development_Decomposition_v1.0.md`) — the bridge translating the frozen corpus into
buildable work (engineering streams, per-module work packages, acceptance gates) — and the **Build
Roadmap** (`generatedDocs/Build_Roadmap_v1.0.md`) — the gated execution sequence (Wave 0 Repository
Bootstrap → Wave 6 M9; per-wave Doc-8 gates; merge strategy; Definitions of Ready/Done).
**Waves 0–1 are DELIVERED** to `main`: Wave 0 (baseline tag `wave0-complete`) +
**Wave 1 — Foundation / Walking Skeleton** (baseline tag `wave1-complete`; see
`generatedDocs/Wave1_Baseline_Report_v1.0.md` + `governanceReviews/Wave-1_Integration_Audit_and_Exit_Gate_v1.0.md`).
**Next: Wave 2 — Core Platform** (the full M0 → M1 module builds, `Build_Roadmap_v1.0.md` § Wave 2). Every
wave remains gated by the Doc-8 conformance fabric.

This is the entry point for any implementation work. Read it first, then follow the order below.

---

## The five rules (non-negotiable)

1. **Read [CLAUDE.md](CLAUDE.md)** — the AI-agent guardrails and working rules.
2. **Read [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md)** — the repository constitution
   (module shape, `contracts/`-only imports, forbidden patterns).
3. **Read the relevant frozen contracts in [generatedDocs/](generatedDocs/)** — start at
   [generatedDocs/CORPUS_INDEX.md](generatedDocs/CORPUS_INDEX.md), and read **Doc-4A** (API
   metastandard) before any contract work, plus the owning module's contract doc (Doc-4B…4M).
4. **Never modify `generatedDocs/`** — the corpus is frozen. Propose **additive patches** only;
   never reopen a frozen document.
5. **All code follows the contracts** — cross-module communication only through `contracts/`;
   one module, one owner; references by ID only.

---

## Reading order

| Step | Read | Why |
|------|------|-----|
| 1 | [README.md](README.md) | What iVendorz is, at a glance |
| 2 | [CLAUDE.md](CLAUDE.md) | Guardrails, authority order, red-flag checklist |
| 3 | [REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md) | Folder shape, boundaries, forbidden patterns |
| 4 | [generatedDocs/CORPUS_INDEX.md](generatedDocs/CORPUS_INDEX.md) + [00_AUTHORITY_MAP.md](generatedDocs/00_AUTHORITY_MAP.md) | Find the canonical document for your task |
| 5 | `generatedDocs/Doc-4A_Structure_v1.0_FROZEN.md` | API conventions (mandatory before contract work) |
| 6 | The owning module's frozen contracts (Doc-4B…4M + its Doc-5x API + Doc-6x DB + Doc-7x FE + Doc-8x test) | The rules for the module you're touching |
| 7 | `generatedDocs/Development_Decomposition_v1.0.md` | How the frozen corpus decomposes into buildable work (streams, work packages, waves, gates) |
| 8 | `generatedDocs/Build_Roadmap_v1.0.md` | The gated build sequence (Wave 0 → Wave 6); **Waves 0–1 delivered — Wave 2 (Core Platform, M0 → M1) next**. Start here to pick the next work package |

---

## Authority order (who decides)

```
0. Frozen Architecture Corpus (Master Arch · Doc-2 · Doc-3 · Doc-4A…4M)   ← immutable
1. ADR Compendium                                                         ← immutable
2. Virtual CTO → 3. Enterprise Architect → 4. DDD Architect
→ 5. API Governance Board → 6. Security Architect → 7. Engineering
→ 8. Product → 9. AI Skills
```

If a request conflicts with the frozen corpus: **stop and flag it** (Flag-and-Halt). Do not
work around it. Architecture-affecting changes require **human** approval — code review alone
is insufficient.

---

## Before you open a PR

- [ ] Change sits inside **one module** (one module, one owner).
- [ ] No cross-module imports except `…/contracts`; no cross-module table access or FKs.
- [ ] No forbidden pattern (see REPOSITORY_STRUCTURE.md §9): shared business logic, cross-module
      writes, admin bypass, workflow-owned state, read-model-as-truth, AI-owned data, raw cross-schema SQL.
- [ ] Conforms to Doc-4A (API) and the owning module's frozen contract.
- [ ] No frozen document modified.
- [ ] AI-generated code reviewed by AI Coding Supervisor or human; architecture-affecting
      changes have **human** approval.

---

## Where things live

| Need | Document |
|------|----------|
| What/why of the system | `README.md`, `project_details.md`, Master System Architecture |
| Folder shape & boundaries | `REPOSITORY_STRUCTURE.md` |
| Which doc is canonical | `generatedDocs/CORPUS_INDEX.md`, `generatedDocs/00_AUTHORITY_MAP.md` |
| API conventions | Doc-4A |
| State machines | Doc-4M · Event catalog | Doc-4J · Cross-module flows | Doc-4L |
| Current phase | **Wave 2 — Core Platform (M0 → M1)** (Waves 0–1 delivered: `generatedDocs/Wave0_Baseline_Report_v1.0.md` · `generatedDocs/Wave1_Baseline_Report_v1.0.md`). `generatedDocs/Build_Roadmap_v1.0.md` (the gated build sequence; **Wave 2 next**) · `generatedDocs/Development_Decomposition_v1.0.md` (work breakdown) · all module realizations FROZEN (Doc-5/6/7) + the Doc-8 conformance fabric (`Doc-8_SERIES_FROZEN_v1.0`) |
| Per-module ledger | `generatedDocs/Program_Status_And_Roadmap.md` · `CORPUS_INDEX.md` · `00_AUTHORITY_MAP.md` |
| Frontend design companions (non-authoritative — supplement Doc-7, never override it) | `design_philosophy.md` · `information_architecture.md` · `ux_patterns.md` · `marketplace_ux.md` · `page_inventory.md` · `page_templates.md` · `screen_specifications.md` · `landing_page_spec.md` · `shared_conventions.md` · `esc_registry.md` · `glossary.md` · `deferred_decisions.md` · `visual_reference_implementation.md`. **First FE slice** (Public/Doc-7D, **Wave 3** with M2): `frontend_first_slice.md` |

---

*Non-authoritative entry point. On any conflict, the frozen corpus wins.*
