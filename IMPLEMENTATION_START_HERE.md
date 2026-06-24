# IMPLEMENTATION — START HERE

**Audience:** developers and AI coding agents (Claude Code, Cursor, Antigravity, Windsurf).
**Status:** the architecture program is **COMPLETE / FROZEN**. The project is in
**Implementation Governance** — **Doc-5A — API Realization Standards** is **FROZEN**
(`Doc-5A_SERIES_FROZEN_v1.0`; freeze patches ratified 2026-06-24): §0–§12 + Appendices A–C complete.
**Doc-5B (M0 `core`)** is **FROZEN** (`Doc-5B_SERIES_FROZEN_v1.0`, 2026-06-24; §0–§7 + Appendix A; out-of-wire
boundary R1 precedent). **Doc-5C (M1 Identity)** is **FROZEN** (`Doc-5C_SERIES_FROZEN_v1.0`, 2026-06-24; §0–§8 + Appendix A;
42 contracts; User-primary/active-org surface; R1–R6). **Doc-5E (M3 RFQ — the moat)** is **FROZEN**
(`Doc-5E_SERIES_FROZEN_v1.0`, 2026-06-24; §0–§9 + Appendix A; 38 contracts; matching/routing engine out-of-wire; R1–R7;
non-disclosure + engine-execution attestations; `[ESC-RFQ-POLICY]` gate cleared by `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ`).
**Doc-5D (M2 Marketplace)** is **FROZEN** (`Doc-5D_SERIES_FROZEN_v1.0`, 2026-06-25; §0–§10 + Appendix A; 71 contracts =
64 caller-facing + 7 out-of-wire; tri-actor Public/User/Admin; R1–R10; R5 projection-separation + R9 non-disclosure attestations;
DD-6 gate cleared by `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`; DD-7 tracked, `claim_vendor_profile` only).
**Doc-5G (M5 Trust)** is **STRUCTURE FROZEN** (`Doc-5G_Structure_v1.0_FROZEN`, 2026-06-25; 40 contracts = 34 caller-facing +
6 out-of-wire; the governance-signal owner; multi-actor Public/User/Admin; R1–R12 score-computation + governance/Billing
firewalls; SR-1 reconciled to 40) — **content passes next**. **Doc-5F · 5H…5M** gated by the Appendix A checklist.
Application code has **not** started.

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
| 6 | The owning module's frozen contract (Doc-4B…4M) | The rules for the module you're touching |
| 7 | `generatedDocs/Doc-5_Program_Governance_Note_v1.0.md` | Current implementation-contracts program |

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
| Current program | `generatedDocs/Doc-5G_Structure_v1.0_FROZEN.md` (M5 Trust STRUCTURE FROZEN; content next) · `Doc-5D_SERIES_FROZEN_v1.0.md` (M2 FROZEN) · `Doc-5E_SERIES_FROZEN_v1.0.md` (M3 FROZEN) · `Doc-5C_SERIES_FROZEN_v1.0.md` (M1 FROZEN) · `Doc-5B_SERIES_FROZEN_v1.0.md` (M0 FROZEN) · `Doc-5A_SERIES_FROZEN_v1.0.md` (metastandard FROZEN) · next: Doc-5F · 5H…5M |

---

*Non-authoritative entry point. On any conflict, the frozen corpus wins.*
