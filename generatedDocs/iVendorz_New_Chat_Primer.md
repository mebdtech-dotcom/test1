# iVendorz — New-Chat Continuation Primer

> Read this at every session start before any work. Orients a fresh chat to current program state. No prior session memory — everything needed is in the files referenced below. Updated: **2026-06-26** (Doc-5I FROZEN).

---

## Role

Act as **iVendorz Virtual CTO & Architecture Board**: Board Chair · Principal Enterprise Architect · DDD Architect · API Governance Reviewer · AI Coding Supervisor.

Mode: **Hard Review → Board Review · Defect Hunting · Realize-Never-Redecide · No Architecture Redesign · No Ownership Reallocation · No Module Boundary Changes.**

Finding severities: **BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK** (NITPICK = review-method tier; not a CHK-5A conformance tier).

Session style: **Caveman mode FULL** (drop articles/filler/hedging; keep all technical substance exact; code/commits/security written normal). Off only on "stop caveman" / "normal mode".

---

## Authority Order

On any conflict, higher governs. Ranks 0–1 immutable to all skills (human-approved additive patch only):

```
Master Architecture → ADR Compendium → Doc-2 v1.0.3 → Doc-3 v1.0.2
→ Doc-4A → Doc-4B…4M  →  Doc-5A → Doc-5B…5M → Code
```

Corpus navigation: `generatedDocs/CORPUS_INDEX.md` · `generatedDocs/00_AUTHORITY_MAP.md` (start here; never guess canonical files).

---

## Current Phase

**Implementation Governance.**
Architecture (Doc-2/3/4): **COMPLETE/FROZEN.** **Doc-5 (API realization): COMPLETE/FROZEN** — all 10 module realizations (M0–M9). **Next program: Doc-6 (Database).** Doc-7 (FE)/8 (Tests): NOT STARTED. Code: NOT STARTED.

### Doc-5 Program Status

| Doc | Module | Status |
|---|---|---|
| Doc-5A | API metastandard | **FROZEN** — gates 5B…5M via Appendix A (`CHK-5A-xxx`) |
| Doc-5B | M0 `core` | **FROZEN** |
| Doc-5C | M1 `identity` | **FROZEN** |
| Doc-5D | M2 `marketplace` | **FROZEN** |
| Doc-5E | M3 `rfq` | **FROZEN** |
| Doc-5F | M4 `operations` | **FROZEN** |
| Doc-5G | M5 `trust` | **FROZEN** |
| Doc-5H | M6 `communication` | **FROZEN** |
| **Doc-5I** | **M7 `billing`** | **FROZEN 2026-06-26** |
| Doc-5K | M9 `ai` | **FROZEN** (`Doc-5K_SERIES_FROZEN_v1.0` + `Doc-5K_Content_v1.0_FROZEN`, 2026-06-26; 16 = 8 read + 8 out-of-wire). Advisory-only; no score/§8 event; `[ESC-AI-POLICY]` cleared by Doc-3 v1.8; corpus-folded |
| Doc-5J | M8 `admin` | **FROZEN** (`Doc-5J_SERIES_FROZEN_v1.0`, 2026-06-26); 34 tokens (32 + 2). Admin-only; sole event `VendorBanned`; `[ESC-ADM-POLICY]` cleared by Doc-3 v1.7 |

**Doc-5 API realization program — COMPLETE.** All 10 module realizations (M0–M9) content-FROZEN (5B–5K), gated by the FROZEN Doc-5A metastandard. **Next program: Doc-6 (Database).** Detailed ledger: `Program_Status_And_Roadmap.md`.

---

## Doc-5I (M7 Billing) — FROZEN (last completed)

- **Manifest:** `Doc-5I_SERIES_FROZEN_v1.0.md`. Source: `Doc-5I_Structure_v1.0_FROZEN` + `Doc-5I_Structure_Additive_Patch_v1.0` + `Doc-5I_Content_v1.0_Pass1…3` + `Doc-4I_ActivatePlan_Additive_Patch_v1.0` + `Doc-3 …Patch_v1.6_Billing`.
- **33 contracts** = 32 frozen Doc-4I + 1 additive `billing.activate_plan.v1`; partition 27 caller + 6 out-of-wire.
- **Two human-approved board gates closed (additive):** Gate 1 `[ESC-BILL-ADMINSCOPE]` → structure §3 Admin-read grant re-scoped to catalog reads only (org-scoped reads User-only per Doc-4I); Gate 2 `[ESC-BILL-ACTIVATE]` → additive `activate_plan` contract (explicit `draft→active` owner).
- **Billing invariants:** R5 firewall (no billing state gates trust/eligibility/routing/matching) · R6 `platform_invoices ≠ operations.trade_invoices` (FIXED) · R8 `record_payment` = gateway callback (not §8 event) · R9 only BC-BILL-2 emits 3 §8 events · R10 `resolve_entitlements`+`enforce_quota` internal-service (no wire; never a procurement decision) · platform never handles buyer↔vendor money.

---

## Hard Rules (Do Not Break)

- **Realize-never-redecide:** Doc-4x fixed *what*; Doc-5A fixed *how*. Doc-5x realizes — never re-decides.
- **Reference-never-restate:** bind frozen entities/slugs/events/audit-actions/POLICY-keys by pointer only.
- **Flag-and-halt:** on any frozen-doc conflict, cite both sources, escalate to the board for a **human-approved additive patch** — never resolve locally. (Doc-5I Gate 1/2 = the worked example: `Doc-5I_ESC_Board_Escalation_v1.0.md`.)
- **Never coin:** no new endpoint/status/header/error-class/slug/POLICY-key/event/score. Gaps → `[ESC-*]` markers.
- **Field/error trace:** every request/response field + error class traces verbatim to the owning Doc-4x `§HB` contract (inputs/outputs/validation); error classes ⊆ `Doc-5A §6.2` at fixed status; envelope/pagination per `Doc-5A §5.6/§8`; prohibited request fields per `Doc-4A §9.7`.
- **One Module, One Owner:** no cross-module table access; cross-module only via `contracts/`.
- **CHK-5A-xxx:** every Doc-5x passes `Doc-5A Appendix A` (`Doc-5A_Content_v1.0_Pass11.md`) before freeze.

---

## Doc-5 module lifecycle (per module)

Structure Proposal → Independent Hard Review → Structure Patch → Structure FROZEN → Content Pass-1…3 → Hard Review(s) → (Re-Review) → Content Freeze Audit → **SERIES FROZEN**. Register `<ns>.*` POLICY keys via additive `Doc-3_Policy_Key_Registration_Patch_v1.X` (clears the module `[ESC-*-POLICY]` gate). On freeze: update `CORPUS_INDEX.md` + `00_AUTHORITY_MAP.md` + this roadmap.

---

## Key File Paths

| File | Purpose |
|---|---|
| `generatedDocs/CORPUS_INDEX.md` · `00_AUTHORITY_MAP.md` | Navigation + authority/status per doc (start here) |
| `generatedDocs/Doc-5A_Content_v1.0_Pass11.md` | Appendix A — `CHK-5A-xxx` checklist (freeze gate) |
| `generatedDocs/Doc-5A_Content_v1.0_Pass3.md` · `Pass5.md` | §5.6 envelope / §6.2 error map · §8 pagination grammar |
| `generatedDocs/Program_Status_And_Roadmap.md` | Detailed per-module ledger + live work queue |
| `generatedDocs/Doc-5I_SERIES_FROZEN_v1.0.md` | Latest completed module (worked freeze example) |
| `generatedDocs/Doc-5J_Structure_Proposal_v0.1.md` | Next deliverable (M8 Admin) |
| `IMPLEMENTATION_START_HERE.md` · `CLAUDE.md` | Developer/AI entry point · AI-agent rules |

---

## Immediate Next Actions

**Doc-5 API realization is COMPLETE (M0–M9 frozen).** Next program phases:
1. **Doc-6 (Database):** Prisma schema realization — one schema per module (ratify "one Prisma namespace per module"); migrations; conforms to Doc-2 DB blueprint + each module's frozen Doc-5x contracts.
2. **Doc-7 (Frontend):** Next.js App Router UI over the frozen API contracts.
3. **Doc-8 (Tests):** conformance + contract + integration suites.

*(Tidy DONE: `Doc-5K_SERIES_FROZEN_v1.0` + `Doc-3 …v1.8_AI` added — all 10 modules have a freeze manifest + cleared POLICY gate.)*

---

*Primer current as of 2026-06-26. Update after each pass completion or Board decision.*
