# iVendorz — New-Chat Continuation Primer

> Read this at every session start before any work. Orients a fresh chat to current program state. No prior session memory — everything needed is in the files referenced below. Updated: **2026-06-26** (all programs Doc-2…Doc-8 COMPLETE/FROZEN; **Development Decomposition produced** — phase = Development Decomposition → Build Roadmap → Implementation).

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
Architecture (Doc-2/3/4): **COMPLETE/FROZEN.** **Doc-5 (API realization): COMPLETE/FROZEN** — all 10 module realizations (M0–M9). **Doc-6 (Database): COMPLETE/FROZEN — `Doc-6A` (metastandard) + `Doc-6B`…`Doc-6K` (M0–M9 schemas) all FROZEN 2026-06-26.** `core` · `identity` · `marketplace` (first public/anonymous; tri-actor) · `rfq` (the moat — dual-sided grant-row RLS + blacklist-undetectable) · `operations` (the blacklist's owning side + money-record boundary, no funds custody) · `trust` (the governance-signal owner — System-written scores, public band via M2 reflection) · `communication` (delivery-only; participant-grant RLS) · `billing` (the platform's own revenue; `platform_invoices ≠ trade_invoices`; billing firewall; entitlements not plan-name) · `admin` (the authoritative event catalog; Admin decides, owning module owns) · `ai` (regenerable derived artifacts only; the sole `ai.*` TTL hard-delete exception; never source of truth). Every per-module schema passed Doc-6A Appendix A (37/37). All carried `[ESC-*]` on named channels.** **Doc-7 (Frontend): COMPLETE — all 8 surfaces `Doc-7A`–`Doc-7H` FROZEN (2026-06-26; `Doc-7_SERIES_FROZEN_v1.0`):** 7A metastandard · 7B Design System · 7C App Shell · 7D Public · 7E Account/Identity · 7F Buyer (moat) · 7G Vendor · 7H Admin. Realizes the frozen Doc-5 surface + Doc-4M on Next.js 15 App Router; coins nothing; carries program-level `[ESC-7-API]` (file-upload grant) + `[ESC-IDN-DELEG-EXPIRY]` + `[ESC-7-API-PRODDETAIL/CATNAV/ADS]`. **Doc-8 (Test & Conformance): COMPLETE/FROZEN (2026-06-26; `Doc-8_SERIES_FROZEN_v1.0`) — all 7 deliverables `Doc-8A`…`8G`** (metastandard + harness + 5 discipline suites; the conformance fabric, authored-not-run). Doc-8 is the conformance harness yet subordinate to its oracle — a red test = code defect or corpus defect (`[ESC-8-CORPUS]`), never weaken the assertion. **All design+realization+verification programs are COMPLETE/FROZEN.** **Next phase: Development Decomposition → Build Roadmap → Implementation (Code).** **Development Decomposition PRODUCED** (`Development_Decomposition_v1.0.md`) + **Build Roadmap PRODUCED** (`Build_Roadmap_v1.0.md`, 2026-06-26) — the non-authoritative bridge to buildable work + its gated execution sequence (Wave 0 bootstrap · Wave 1 walking skeleton · Wave 2 M0→M1 · Wave 3 M2/M5/M6/M7 parallel · Wave 4 M3 moat · Wave 5 M4/M8 · Wave 6 M9; per-wave Doc-8 gates). **Next: Wave 0 (Repository Bootstrap) — first code.** Code: NOT STARTED.

**Authoring loop (every deliverable, Board-mandated):** Pass → Hard Review as Board → Fix (Patch) → short closure check (fixed? y/n; if not, re-fix) → next pass. Each a separate artifact; freeze only at 0 open BLOCKER/MAJOR/MINOR.

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

**Doc-5 API realization program — COMPLETE.** All 10 module realizations (M0–M9) content-FROZEN (5B–5K), gated by the FROZEN Doc-5A metastandard. **Doc-6/7/8 also COMPLETE/FROZEN; next phase = Development Decomposition (produced) → Build Roadmap → Implementation.** Detailed ledger: `Program_Status_And_Roadmap.md`.

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
| `generatedDocs/Doc-5I_SERIES_FROZEN_v1.0.md` | A worked module freeze example |
| `generatedDocs/Development_Decomposition_v1.0.md` | **Current deliverable** — Development Decomposition (frozen corpus → buildable work) |
| `IMPLEMENTATION_START_HERE.md` · `CLAUDE.md` | Developer/AI entry point · AI-agent rules |

---

## Immediate Next Actions

**All design + realization + verification programs are COMPLETE/FROZEN (2026-06-26):** Doc-2/3/4 (architecture) · Doc-5A…5K (API) · Doc-6A…6K (DB) · Doc-7A…7H (FE) · Doc-8A…8G (Test). The full design+realization+verification corpus is frozen; the Doc-8 conformance fabric is authored-not-run, gating the eventual Code. **Phase = Development Decomposition → Build Roadmap → Implementation (Code).** Next:
1. **Development Decomposition — PRODUCED** (`Development_Decomposition_v1.0.md`, 2026-06-26): the non-authoritative bridge from the frozen corpus to buildable work — engineering streams · per-module work packages (uniform WP template + Build Artifact Checklist) · cross-cutting work · repository bootstrap (Wave 0) · walking skeleton · **dependency-ordered implementation waves** (M0→M1 serial → M2/M5/M6/M7 parallel → M3 moat → M4/M8 → M9) · parallelization plan · acceptance gates (Doc-8 bands A–I) · engineering risks + build-time rollback · milestones. No dates/estimates; coins nothing. Registered in `CORPUS_INDEX.md` §5e + `00_AUTHORITY_MAP.md`.
2. **Build Roadmap — PRODUCED** (`Build_Roadmap_v1.0.md`, 2026-06-26): the gated execution sequence (Wave 0→Wave 6; per-wave Doc-8 gates; merge strategy; DoR/DoD; MVP-Ready/Production-Ready engineering gate-states). The final planning artifact before code.
3. **Implementation (Code)** — begins at **Wave 0 (Repository Bootstrap)**; Next.js + Supabase + Prisma + Inngest, gated by the Doc-8 conformance fabric.

*(Corpus tidy DONE: all 10 modules have a freeze manifest + cleared POLICY gate; Doc-6/7/8 all series-frozen; Development Decomposition produced and indexed.)*

---

*Primer current as of 2026-06-26. Update after each pass completion or Board decision.*
