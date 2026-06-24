# iVendorz — Authority Map

**Document type:** Authority map for the architecture corpus. Non-authoritative pointer.
**Date:** 2026-06-23
**Companion:** [`CORPUS_INDEX.md`](CORPUS_INDEX.md) (navigation). This file ranks **authority**.

> On any conflict, higher authority wins. This map only states *which document decides*; it
> never restates a decision. If a status here disagrees with the actual document, the
> document wins and this map is patched.

---

## 1. Authority Order (binding)

Architecture is supreme. Higher rank overrides lower.

```
0. Frozen Architecture Corpus  (Master Architecture · Doc-2 · Doc-3 · Doc-4A…4M)   ← immutable
1. ADR Compendium                                                                  ← immutable
2. Virtual CTO
3. Enterprise Architect
4. DDD Architect
5. API Governance Board
6. Security Architect
7. Engineering
8. Product
9. AI Skills
```

Ranks **0–1** are immutable to all skills (including the Virtual CTO). Changing them requires
an **additive architecture patch with human approval** — never a skill/agent decision.
Implementation contracts (Doc-5…8), code, and all root orientation docs sit **below** rank 1
and must conform upward.

---

## 2. Authority Levels (legend)

| Level | Meaning |
|-------|---------|
| **CANONICAL** | Single source of truth; supreme within its scope |
| **FROZEN** | Ratified; authoritative; changed only by additive patch + (rank 0–1) human approval |
| **ACTIVE** | Current working program; not yet frozen |
| **NON-AUTHORITATIVE** | Orientation/mirror; conforms to the corpus; patched to match |
| **PROVENANCE** | Lifecycle record (reviews/patches/audits); reference only, never reopened |

---

## 3. Corpus Authority Table

| Document | Authority Level | Version | Frozen? | Notes |
|----------|-----------------|---------|---------|-------|
| `Master_System_Architecture_v1.0_FINAL.md` | CANONICAL | v1.0 FINAL | ✅ | Single source of truth (rank 0) |
| `ADR_Compendium_v1.md` | FROZEN | v1 | ✅ | Rank 1 |
| `Doc-2_Domain_Model_And_Database_Blueprint` (+ patches) | FROZEN | v1.0.3 | ✅ | Domain model & DB blueprint |
| `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification` (+ patches) | FROZEN | v1.0.2 | ✅ | RFQ operational spec |
| `Doc-4A_Structure_v1.0_FROZEN.md` (+ content passes) | FROZEN | v1.0 | ✅ | API metastandard — read before any contract work |
| `Doc-4B` (M0 Platform Core) | FROZEN | v1.0 | ✅ | Owns audit, outbox, ID gen, config, flags |
| `Doc-4C_Structure_v1.0_FROZEN.md` (M1 Identity) | FROZEN | v1.0 | ✅ | Users/orgs/roles/permissions/delegation |
| `Doc-4D_Structure_v1.0_FROZEN.md` (M2 Marketplace) | FROZEN | v1.0 | ✅ | Vendor profiles, discovery, presentation |
| `Doc-4E_*_v1.0_FROZEN.md` (M3 RFQ) | FROZEN | v1.0 | ✅ | Module cert: `Doc-4E_Module3_Full_Freeze_Certification_v1.0.md` |
| `Doc-4F_*_FROZEN.md` (M4 Operations) | FROZEN | v1.0 | ✅ | Module freeze: `Doc-4F_Module4_Freeze_Audit_v1.0.md` |
| `Doc-4G_Final_Freeze_Audit_v1.0.md` (M5 Trust) | FROZEN | v1.0 | ✅ | Trust/performance/verification/fraud |
| `Doc-4H_*` (M6 Communication) | FROZEN | v1.0 | ✅ | Consolidation v2.0 supersedes v1.0 |
| `Doc-4I_FROZEN_v1.0.md` (M7 Monetization) | FROZEN | v1.0 | ✅ | Plans/entitlements/billing |
| `Doc-4J_FROZEN_v1.0.md` (M8 Admin) | FROZEN | v1.0 | ✅ | **Authoritative event catalog** |
| `Doc-4K_FROZEN_v1.0.md` (M9 AI) | FROZEN | v1.0 | ✅ | Reserved; owns no authoritative data |
| `Doc-4L_FROZEN_v1.0.md` (Integration Index) | FROZEN | v1.0 | ✅ | **Authoritative cross-module event-flow map** |
| `Doc-4M_FROZEN_v1.0.md` (State Machines) | FROZEN | v1.0 | ✅ | **Authoritative lifecycle/state authority** |
| `Doc-4_SERIES_FROZEN_v1.0.md` | FROZEN | v1.0 | ✅ | Whole Doc-4 series freeze record |
| `Doc-5_Program_Governance_Note_v1.0.md` | APPROVED | v1.0 | ✅ | Implementation Contracts program; active deliverable = Doc-5A API Standards |
| `Doc-5A_SERIES_FROZEN_v1.0.md` (API Realization Standards) | FROZEN | v1.0 | ✅ | API realization metastandard; effective = Pass-1…12 + ratified patches (`STRUCT-02`, `0-D`, `D4A-C05-204`); gates Doc-5B…5M via Appendix A |
| `Doc-4A_Patch_C-05-204_v1.0.md` | RATIFIED | v1.0 | ✅ | Additive Doc-4A §22.1 C-05 clarification (reference_id on body-bearing responses; 204 exempt) |
| `Doc-5B_SERIES_FROZEN_v1.0.md` (M0 `core` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4B on HTTP; effective = `Doc-5B_Content_v1.0_Pass1…4` + `Doc-5B_Structure_v1.0_FROZEN` + resolved registers; out-of-wire boundary (R1) precedent; no ratification dependency. Gated by Doc-5A Appendix A |
| `Doc-5B_Structure_v1.0_FROZEN.md` · `Doc-5B_Content_v1.0_Pass1…4.md` | FROZEN | v1.0 | ✅ | Doc-5B source (canonical TOC + §0–§7 + Appendix A); read via the freeze manifest |
| `Doc-5C_SERIES_FROZEN_v1.0.md` (M1 `identity` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4C (42 contracts) on HTTP; effective = `Doc-5C_Content_v1.0_Pass1…2` + `Doc-5C_Structure_v1.0_FROZEN` + resolved registers; User-primary/active-org surface; R1–R6; no ratification dependency. Gated by Doc-5A Appendix A |
| `Doc-5C_Structure_v1.0_FROZEN.md` · `Doc-5C_Content_v1.0_Pass1…2.md` | FROZEN | v1.0 | ✅ | Doc-5C source (canonical TOC + §0–§8 + Appendix A); read via the freeze manifest |
| `Doc-5E_SERIES_FROZEN_v1.0.md` (M3 `rfq` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4E (38 contracts: 30 caller-facing + 8 System engine workers) on HTTP; effective = `Doc-5E_Content_v1.0_Pass1…3` + `Doc-5E_Structure_v1.0_FROZEN` + resolved registers; matching/routing engine out-of-wire (R1); R1–R7; non-disclosure + engine-execution attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ`. Gated by Doc-5A Appendix A |
| `Doc-5E_Structure_v1.0_FROZEN.md` · `Doc-5E_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5E source (canonical TOC + §0–§9 + Appendix A); read via the freeze manifest |
| `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ.md` | APPROVED | v1.1 | ✅ | Additive Doc-3 §12.2 registration of 2 `rfq.*` API-realization keys (`rfq.idempotency_dedup_window`, `rfq.list_page_size_max`); clears the Doc-5E `[ESC-RFQ-POLICY]` gate (Doc-4A §18.2); no semantic/routing/trust/procurement change |
| `Doc-5D_Structure_v1.0_FROZEN.md` (M2 `marketplace` API realization) | STRUCTURE FROZEN | v1.0 | ✅ | Canonical TOC realizing Doc-4D (71 contracts: 64 caller-facing + 7 out-of-wire) on HTTP; first large public/anonymous read surface; tri-actor (Public/User/Admin); R1–R10 + DD-1…DD-8; content passes next (3). DD-6 `marketplace.*` POLICY-key patch = content-freeze gate |
| `Doc-5D_Structure_Proposal_v0.1.md` | PROVENANCE | v0.2+r3 | — | Doc-5D structure authoring history (Hard Review + round-3 ADD-1/ADD-2) |
| `iVendorz_Master_Overview_v1.0.md` | NON-AUTHORITATIVE | v1.3 | — | Consolidated mirror |
| `CORPUS_INDEX.md` · `00_AUTHORITY_MAP.md` | NON-AUTHORITATIVE | — | — | Navigation + authority pointers |
| Context Packs / Primers / Status / Roadmap | NON-AUTHORITATIVE | various | — | Orientation only |
| `*_Structure_Proposal` · `*_Hard_Review` · `*_Patch` · `*_Freeze_Audit` · `*_Verification` | PROVENANCE | various | — | Lifecycle trail; reference only |

---

## 4. Single-Topic Authorities (where one document decides)

| Topic | Authoritative document |
|-------|------------------------|
| Core invariants / module boundaries / security rules | Master System Architecture (§4, §16, §22) |
| Architecture decisions | ADR Compendium |
| Domain entities & database schema | Doc-2 |
| RFQ operational policy / FIXED·POLICY·ORG settings | Doc-3 |
| API conventions (namespace, validation order, error model, idempotency) | Doc-4A |
| Lifecycle / state machines | Doc-4M |
| Event catalog | Doc-4J |
| Cross-module event flows | Doc-4L |
| Outbox ownership & transactional write model | Doc-2 / Doc-4B / Doc-4J / Doc-4L |

---

## 5. Root (repository) authority — below rank 1

| File | Authority Level | Role |
|------|-----------------|------|
| `README.md` | NON-AUTHORITATIVE | Entry description |
| `IMPLEMENTATION_START_HERE.md` | NON-AUTHORITATIVE | Implementation entry point / reading order |
| `CLAUDE.md` | NON-AUTHORITATIVE | AI-agent guardrails |
| `project_details.md` | NON-AUTHORITATIVE | Full project description |
| `REPOSITORY_STRUCTURE.md` | NON-AUTHORITATIVE | Repository constitution (folder shape, boundaries) |

All conform upward to the frozen corpus and are patched to match it. None grants authority
above rank 1.

---

*Non-authoritative authority map. Patch additively when the corpus changes; the document
always wins over this map.*
