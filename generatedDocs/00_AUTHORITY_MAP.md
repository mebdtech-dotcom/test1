# iVendorz — Authority Map

**Document type:** Authority map for the architecture corpus. Non-authoritative pointer.
**Date:** 2026-06-26
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
| `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md` | APPROVED | v1.2 | ✅ | Additive Doc-3 §12.2 registration of 2 `marketplace.*` API-realization keys (`marketplace.idempotency_dedup_window`, `marketplace.list_page_size_max`); clears the Doc-5D DD-6 content-freeze gate (Doc-4A §18.2); no semantic/routing/trust/procurement change |
| `Doc-5D_SERIES_FROZEN_v1.0.md` (M2 `marketplace` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4D (71 contracts: 64 caller-facing + 7 out-of-wire) on HTTP; effective = `Doc-5D_Content_v1.0_Pass1…3` + `Doc-5D_Structure_v1.0_FROZEN` + resolved registers; first large public/anonymous surface; tri-actor (Public/User/Admin); R1–R10; R5 projection-separation + R9 non-disclosure attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`. DD-7 tracked (claim_vendor_profile only). Gated by Doc-5A Appendix A |
| `Doc-5D_Structure_v1.0_FROZEN.md` · `Doc-5D_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5D source (canonical TOC + §0–§10 + Appendix A); read via the freeze manifest |
| `Doc-5D_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5D_Freeze_Readiness_Audit_v1.0.md` | PROVENANCE | v0.2+r3 | — | Doc-5D structure authoring history (Hard Review + round-3) + freeze audit (DD-6 gate → cleared by Patch v1.2) |
| `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust.md` | APPROVED | v1.3 | ✅ | Additive Doc-3 §12.2 registration of 2 `trust.*` API-realization keys (`trust.idempotency_dedup_window`, `trust.list_page_size_max`); clears the Doc-5G `[ESC-TRUST-POLICY]` gate (Doc-4A §18.2); no semantic/scoring/trust/governance change |
| `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations.md` | APPROVED | v1.4 | ✅ | Additive Doc-3 §12.2 registration of 2 `operations.*` API-realization keys (`operations.idempotency_dedup_window`, `operations.list_page_size_max`; new `operations` namespace); pre-clears the Doc-5F `[ESC-OPS-POLICY]` content-freeze gate (Doc-4A §18.2); no semantic/procurement/money/governance change |
| `Doc-5G_SERIES_FROZEN_v1.0.md` (M5 `trust` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4G (40 contracts: 34 caller-facing + 6 out-of-wire) on HTTP; effective = `Doc-5G_Content_v1.0_Pass1…3` + `Doc-5G_Structure_v1.0_FROZEN` + resolved registers; the governance-signal owner; multi-actor (Public/User/Admin); R1–R12; score-computation + governance/Billing firewall + non-disclosure attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust`. Gated by Doc-5A Appendix A |
| `Doc-5G_Structure_v1.0_FROZEN.md` · `Doc-5G_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5G source (canonical TOC + §0–§9 + Appendix A); read via the freeze manifest |
| `Doc-5G_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5G_Freeze_Readiness_Audit_v1.0.md` | PROVENANCE | v0.1+r1 | — | Doc-5G structure authoring history (Hard Review — SR-1 reconciliation + ADD-1/ADD-2) + freeze audit (`[ESC-TRUST-POLICY]` gate → cleared by Patch v1.3) |
| `Doc-5F_SERIES_FROZEN_v1.0.md` (M4 `operations` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4F (50 contracts: 46 caller-facing + 4 out-of-wire) on HTTP; effective = `Doc-5F_Content_v1.0_Pass1…3` + `Doc-5F_Structure_v1.0_FROZEN` + resolved registers; the post-award ERP-Lite layer; two-sided tenant User (no Admin/public); R1–R10; non-disclosure (R5) + money-boundary (R8) attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations`. Gated by Doc-5A Appendix A |
| `Doc-5F_Structure_v1.0_FROZEN.md` · `Doc-5F_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5F source (canonical TOC + §0–§10 + Appendix A); read via the freeze manifest |
| `Doc-5F_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5F_Freeze_Readiness_Audit_v1.0.md` | PROVENANCE | v0.2+r2 | — | Doc-5F structure authoring history (Board Hard Review + round-2 ADD-1/ADD-2) + freeze audit (`[ESC-OPS-POLICY]` gate → cleared by Patch v1.4) |
| `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication.md` | APPROVED | v1.5 | ✅ | Additive Doc-3 §12.2 registration of 2 `communication.*` API-realization keys (`communication.idempotency_dedup_window`, `communication.list_page_size_max`; new `communication` namespace); clears the Doc-5H `[ESC-COMM-POLICY]` content-freeze gate (Doc-4A §18.2); no semantic/delivery/non-disclosure/governance change |
| `Doc-5H_SERIES_FROZEN_v1.0.md` (M6 `communication` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4H (23 contracts: 19 caller-facing + 4 out-of-wire) on HTTP; effective = `Doc-5H_Content_v1.0_Pass1…3` + `Doc-5H_Structure_v1.0_FROZEN` + resolved registers; the delivery-only transport / notification fan-out layer; User+Admin (no public); R1–R12; delivery-only/single-authorship (R5) + delivery-aggregate-ownership (R8) + non-disclosure (R10) + append-only (R12) attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication`. Gated by Doc-5A Appendix A |
| `Doc-5H_Structure_v1.0_FROZEN.md` · `Doc-5H_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5H source (canonical TOC + §0–§9 + Appendix A); read via the freeze manifest |
| `Doc-5H_Structure_Proposal_v0.1.md` · `Doc-5H_Structure_Freeze_Audit_v1.0.md` · `governanceReviews/Doc-5H_Freeze_Readiness_Audit_v1.0.md` | PROVENANCE | v0.2 | — | Doc-5H structure authoring history (Board pre-authoring + Independent Hard Review) + structure freeze audit + content freeze audit (`[ESC-COMM-POLICY]` gate → cleared by Patch v1.5; `[REC-COMM-OWNERSHIP]` satisfied) |
| `Doc-3_Policy_Key_Registration_Patch_v1.6_Billing.md` | APPROVED | v1.6 | ✅ | Additive Doc-3 §12.2 registration of 2 `billing.*` API-realization keys (`billing.idempotency_dedup_window`, `billing.list_page_size_max`; new `billing` namespace); clears the Doc-5I `[ESC-BILL-POLICY]` gate (Doc-4A §18.2); no semantic/pricing/subscription/firewall/governance change |
| `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md` | APPROVED | v1.0 | ✅ | **Additive Doc-4I contract** `billing.activate_plan.v1` (§HB-1.1a) — realizes the `Doc-2 §3.8` `draft→active` edge; **human-approved (Board Gate 2 → Option A)**; Doc-4I contract count 32→33; no module/ownership/governance change |
| `Doc-5I_SERIES_FROZEN_v1.0.md` (M7 `billing` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4I (+ ActivatePlan additive) = **33 contracts** (27 caller-facing + 6 out-of-wire) on HTTP; effective = `Doc-5I_Content_v1.0_Pass1…3` + `Doc-5I_Structure_v1.0_FROZEN` + `Doc-5I_Structure_Additive_Patch_v1.0` + resolved registers; the meters-and-charges layer (handles no buyer↔vendor money); User+Admin+System (no public); R1–R11; billing-firewall (R5) + platform-invoice-≠-trade-invoice (R6/FIXED) + gateway-callback (R8) + entitlement-service-authority (R10) attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.6_Billing`. Gated by Doc-5A Appendix A |
| `Doc-5I_Structure_v1.0_FROZEN.md` · `Doc-5I_Structure_Additive_Patch_v1.0.md` · `Doc-5I_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5I source (canonical §0–§11 + Appendix A) + additive structure patch (Board Gates 1 & 2); read via the freeze manifest |
| `Doc-5I_Structure_Proposal_v0.1.md` · `Doc-5I_Structure_Freeze_Audit_v1.0.md` · `Doc-5I_Content_Freeze_Audit_v1.0.md` · `Doc-5I_ESC_Board_Escalation_v1.0.md` | PROVENANCE | v0.2 | — | Doc-5I authoring history (structure Hard Review + Patch + freeze audit; content Pass-2 Hard Review/Re-Review + Content Independent Hard Review; ESC board escalation → Gates 1 & 2 → Option A → `[ESC-BILL-ADMINSCOPE]`/`[ESC-BILL-ACTIVATE]` RESOLVED) |
| `Doc-3_Policy_Key_Registration_Patch_v1.8_AI.md` | APPROVED | v1.8 | ✅ | Additive Doc-3 §12.2 registration of 5 `ai.*` keys (`ai.list_page_size_max` + 4 `ai.<bc>.ttl_seconds` regenerable-cache TTLs; new `ai` namespace); clears the Doc-5K `[ESC-AI-POLICY]` carried item (Doc-4A §18.2; Doc-4K §B.12); no semantic/advisory/scoring change |
| `Doc-5K_SERIES_FROZEN_v1.0.md` (M9 `ai` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4K (**16 contracts**: 8 caller-facing reads + 8 out-of-wire generate/expire) on HTTP; effective = `Doc-5K_Content_v1.0_FROZEN` (consolidated Pass-1/2/3) + `Doc-5K_Structure_v1.0_FROZEN` (+ Patch CE-01) + resolved registers; the reserved advisory / derived-artifact layer; **User read-only** (AI-Agent/System out-of-wire; no public/Admin); R1–R9; advisory/non-authoritative + score-firewall (AI confidence ≠ Trust score) + regenerable-cache (TTL hard-delete) + non-disclosure attestations; `[REC-AI-WIRE]` satisfied. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.8_AI`. Gated by Doc-5A Appendix A |
| `Doc-5K_Structure_v1.0_FROZEN.md` · `Doc-5K_Structure_Patch_CE-01_v1.0.md` · `Doc-5K_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5K source (canonical §0–§6 + Appendix A) + structure patch CE-01; read via `Doc-5K_Content_v1.0_FROZEN` |
| `Doc-5K_Structure_Proposal_v0.1.md` · `Doc-5K_Structure_Freeze_Audit_v1.0.md` · `Doc-5K_Content_Freeze_Audit_v1.0.md` | PROVENANCE | v0.2 | — | Doc-5K authoring history (Board pre-authoring + Independent Hard Review — REC-1 reconciled; structure + content freeze audits, both PASS) |
| `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin.md` | APPROVED | v1.7 | ✅ | Additive Doc-3 §12.2 registration of 2 `admin.*` API-realization keys (`admin.idempotency_dedup_window`, `admin.list_page_size_max`; new `admin` namespace; `moderation.*` domain set reconciled as distinct); clears the Doc-5J `[ESC-ADM-POLICY]` gate (Doc-4A §18.2); no semantic/moderation/enforcement/governance change |
| `Doc-5J_SERIES_FROZEN_v1.0.md` (M8 `admin` API realization) | FROZEN | v1.0 | ✅ | Realizes Doc-4J (**34 tokens**: 32 caller-facing + 2 out-of-wire) on HTTP; effective = `Doc-5J_Content_v1.0_Pass1…3` + `Doc-5J_Structure_v1.0_FROZEN` + resolved registers; the platform-staff governance/operations layer — **Admin only** (no tenant User/public; no active-org; no delegation); R1–R10; Admin-decides/owning-module-owns (R5) + non-disclosure (R6) + procurement-moat (R7) + Trust/score firewall (R8) + single-event `VendorBanned` (R9) attestations. Applied dependency: `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin`. Gated by Doc-5A Appendix A |
| `Doc-5J_Structure_v1.0_FROZEN.md` · `Doc-5J_Content_v1.0_Pass1…3.md` | FROZEN | v1.0 | ✅ | Doc-5J source (canonical §0–§11 + Appendix A); read via the freeze manifest |
| `Doc-5J_Structure_Proposal_v0.1.md` · `Doc-5J_Structure_Independent_Hard_Review_v0.1.md` · `Doc-5J_Structure_Freeze_Audit_v1.0.md` · `Doc-5J_Content_Independent_Hard_Review_v1.0.md` · `Doc-5J_Content_Freeze_Audit_v1.0.md` | PROVENANCE | v0.2 | — | Doc-5J authoring history (structure Hard Review — 3 MAJOR resolved + Freeze Audit; content Independent Hard Review — 2 MINOR + 3 NITPICK resolved + Content Freeze Audit PASS) |
| `Doc-6A_SERIES_FROZEN_v1.0.md` (Database Realization Metastandard) | FROZEN | v1.0 | ✅ | The DB-program metastandard (the Doc-5A analog); realizes Doc-2 v1.0.3 on PostgreSQL/Supabase + Prisma `multiSchema`; effective = `Doc-6A_Structure_v1.0_FROZEN` + `Doc-6A_Content_v1.0_Pass1…4` + freeze audits; fixes R1–R12 + §2.5 realization-choice attribution; Appendix A = 10 bands / 37 `CHK-6-xxx` checks (per-module freeze gate); Appendix B = Global Conventions Registry; R3(b) one-Prisma-namespace-per-module Board-ratified; coins nothing. **Consistent-with (not conformant-to) the Doc-5 surface** (governance §8); the *what*-authority is Doc-2. Governs Doc-6B…6K |
| `Doc-6A_Structure_v1.0_FROZEN.md` · `Doc-6A_Content_v1.0_Pass1…4.md` | FROZEN | v1.0 | ✅ | Doc-6A source (canonical §0–§13 + Appendix A/B); read via the freeze manifest |
| `Doc-6A_Structure_Proposal_v0.1.md` · `Doc-6A_Structure_Freeze_Audit_v1.0.md` · `Doc-6A_Content_Freeze_Audit_v1.0.md` | PROVENANCE | v0.2 | — | Doc-6A authoring history (Structure Independent Hard Review — 2 MAJOR resolved, R3(b) ratified + Structure Freeze Audit; per-pass content reviews + full cross-pass Content Hard Review + Content Freeze Audit PASS) |
| `Doc-6B_SERIES_FROZEN_v1.0.md` (M0 `core` schema realization) | FROZEN | v1.0 | ✅ | Realizes Doc-2 §10.1 — 5 platform-owned tables (`audit_records`/`outbox_events`/`id_sequences`/`system_configuration`/`feature_flags`) as PostgreSQL DDL + Prisma; effective = `Doc-6B_Structure_v1.0_FROZEN` + `Doc-6B_Structure_Additive_Patch_v1.0` (**CR4′**) + `Doc-6B_Content_v1.0_Pass1…2` + freeze audits; CR1–CR10 + CR4′ column-scoped immutability (5 triggers); platform-owned (no org anchor); human-ref allocator (SECURITY DEFINER, never-reused); 18 `core.*` POLICY keys seeded (Doc-3 v1.0); Appendix A 37/37 (0 FAIL); **DR-6-CORE resolved**; coins nothing. Gated by Doc-6A Appendix A |
| `Doc-6B_Structure_v1.0_FROZEN.md` · `Doc-6B_Structure_Additive_Patch_v1.0.md` · `Doc-6B_Content_v1.0_Pass1…2.md` | FROZEN | v1.0 | ✅ | Doc-6B source (canonical §0–§6 + Appendix A) + the **CR4′** additive structure patch (Board-approved; flag-and-halt worked example); read via the freeze manifest |
| `Doc-6B_Structure_Proposal_v0.1.md` · `Doc-6B_Structure_Freeze_Audit_v1.0.md` · `Doc-6B_Content_Freeze_Audit_v1.0.md` | PROVENANCE | v0.2 | — | Doc-6B authoring history (Structure Hard Review 0-findings + Freeze Audit; per-pass content reviews + cross-pass Content Hard Review + Content Freeze Audit PASS) |
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
| Physical DB realization conventions (Prisma/`multiSchema`, migrations, indexes, constraints, RLS realization, naming) | Doc-6A (realizes Doc-2; Doc-2 remains the *what*-authority) |

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
