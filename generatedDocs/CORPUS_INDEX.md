# iVendorz — Architecture Corpus Index

**Document type:** Navigation index for `generatedDocs/`. Non-authoritative.
**Date:** 2026-06-26
**Rule:** On any conflict, the **FROZEN** document wins. This index only points; it never restates.

Each module family was produced through the staged-freeze lifecycle
(**Structure Proposal → Independent Hard Review → Structure Patch → Structure FROZEN →
Content Pass-A → Review → Patch → Pass-B → Review → Patch → Freeze Audit → FROZEN**). Below,
the **authoritative artifact(s)** to read for each family are called out; the supporting
review/patch/audit trail is grouped by category.

---

## 0. Read-First (orientation)

| File | Purpose |
|------|---------|
| `Master_System_Architecture_v1.0_FINAL.md` | **CANONICAL** single source of truth — the "why" |
| `ADR_Compendium_v1.md` | Architecture Decision Records (rank 1) |
| `iVendorz_Master_Overview_v1.0.md` | Consolidated overview (non-authoritative mirror) |
| `iVendorz_New_Chat_Primer.md` · `iVendorZ_Context_Pack_v4.md` · `iVendorz_Context_Pack_v5.md` | Session bootstrap context (latest packs) |
| `ivendorz_Project_Instructions.md` · `Project_Instructions_Reconciliation_Note_v1.0.md` | Program instructions |

---

## 1. Foundation Documents

**Doc-2 — Domain Model & Database Blueprint**
- **Authoritative:** `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` + patches `Doc2_Patch_v1.0.2.md`, `Doc-2_Patch_v1.0.3.md` (effective v1.0.3)

**Doc-3 — RFQ Procurement Engine & Operational Specification**
- **Authoritative:** `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` + patches `Doc-3_Patch_v1.0.2.md`, `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (`core.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ.md` (`rfq.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md` (`marketplace.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust.md` (`trust.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations.md` (`operations.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication.md` (`communication.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.6_Billing.md` (`billing.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin.md` (`admin.*` keys), `Doc-3_Policy_Key_Registration_Patch_v1.8_AI.md` (`ai.*` keys) (effective v1.0.2)

**Architecture-level patches / reconfirmation**
- `Architecture_CD-MA-1_Patch_v1.0.md` · `Architecture_CD-MA-1_Patch_Verification_v1.0.md` · `Architecture_Freeze_Reconfirmation_v1.0.md`

---

## 2. Doc-4A — API Standards & Conventions (metastandard)

- **Authoritative:** `Doc-4A_Structure_v1.0_FROZEN.md` + content passes `Doc-4A_Content_v1.0_Pass1…Pass6.md`
- Freeze: `Doc-4A_Freeze_Readiness_Audit_v1.0.md` · `Doc-4A_FreezeAudit_Patch_v1.0.1.md`
- Lifecycle trail: `Doc-4A_Structure_Proposal_v0.1.md`; Pass3–6 reviews `Doc-4A_PassN_Independent_Architecture_Review.md`; patches `Doc-4A_PassN_Patch_v1.0.1.md`; `Doc-4A_Review_Log.md`

---

## 3. Doc-4B…4M — Module Contracts (one family per module)

> For each family, read the **FROZEN** artifact(s). The Structure/PassA/PassB/Review/Patch/
> Freeze-Audit files are the production trail and are listed by category.

### Doc-4B — M0 Platform Core / Shared Kernel
- **FROZEN/authoritative:** `Doc-4B_Content_v1.0_PassB.md` (+ `Doc-4B_Freeze_Patch_v1.0.1.md`); structure `Doc-4B_Structure_Proposal_v0.1.md`
- Content: `Doc-4B_Content_v1.0_PassA.md`
- Reviews: `Doc-4B_Structure_Independent_Architecture_Review_v0.1.md` · `Doc-4B_PassA_Independent_Architecture_Review_v1.0.md` · `Doc-4B_PassB_Hard_Review_v1.0.md`
- Patches: `Doc-4B_Structure_Patch_v0.1.1.md` · `Doc-4B_PassA_Patch_v1.0.1.md` · `Doc-4B_PassA_Consistency_Patch_v1.0.2.md`
- Freeze: `Doc-4B_Freeze_Authorization_v1.0.md`

### Doc-4C — M1 Identity & Organization
- **FROZEN/authoritative:** `Doc-4C_Structure_v1.0_FROZEN.md` + `Doc-4C_Content_v1.0_PassB.md`; freeze `Doc-4C_Freeze_Audit_v1.0.md`
- Content: `Doc-4C_Content_v1.0_PassA.md`
- Reviews: `Doc-4C_Structure_Independent_Architecture_Review_v0.1.md` · `Doc-4C_PassA_Hard_Review_v1.0.md` · `Doc-4C_PassB_Hard_Review_Report_v1.0.md`
- Patches/verification: `Doc-4C_Structure_Patch_v0.1.1.md` · `Doc-4C_PassA_Patch_v1.0.1.md` · `Doc-4C_PassB_Patch_v1.0.1.md` · `Doc-4C_PassA/PassB_Patch_Verification_Report_v1.0.md`

### Doc-4D — M2 Marketplace & Discovery
- **FROZEN/authoritative:** `Doc-4D_Structure_v1.0_FROZEN.md` + `Doc-4D_Content_v1.0_PassB.md`; freeze `Doc-4D_Freeze_Audit_v1.0.md`
- PassB sub-domains: `Doc-4D_Content_v1.0_PassB_{VendorProfile,CatalogProductSpec,ProfileExperience,AdvertisingFavorites,Discovery}.md`
- Content: `Doc-4D_Content_v1.0_PassA.md`
- Reviews: `Doc-4D_Structure_Hard_Review_Report_v1.0.md` · `Doc-4D_PassA/PassB_Hard_Review_Report_v1.0.md`
- Patches/gates: `Doc-4D_Structure_Patch_v0.1.1.md` · `Doc-4D_Structure_Freeze_Gate_v1.0.md` · `Doc-4D_PassA/PassB_Patch_v1.0.1.md` · `…_Patch_Verification_Report_v1.0.md`

### Doc-4E — M3 RFQ Procurement Engine
- **FROZEN/authoritative:** `Doc-4E_Structure_v1.0_FROZEN.md` · `Doc-4E_PassA_v1.0_FROZEN.md` · `Doc-4E_PassB_Part1…Part5_v1.0_FROZEN.md`; module cert `Doc-4E_Module3_Full_Freeze_Certification_v1.0.md`
- PassB content (5 parts): `Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md` · `Part2_MatchingPipeline` · `Part3_RoutingGovernance` · `Part4_QuotationManagement` · `Part5_EvaluationComparisonAward.md`
- Audits/reviews: `Doc-4E_Structure_Freeze_Gate_v1.0.md` · `Doc-4E_PassA_Independent_Hard_Review_v1.0.md` · `Doc-4E_PassB_PartN_Independent_Hard_Review_v1.0.md` · `Doc-4E_PassB_PartN_Freeze_Audit_v1.0.md` · `Doc-4E_Parts1to3_CrossPart_Consistency_Audit_v1.0.md`
- Patches: `Doc-4E_Structure_Patch_v0.1.1.md` · `Doc-4E_PassA_Patch_v1.0.md` · `Doc-4E_PassB_PartN_Patch_v1.0.md` · `…_Patch_Verification_Report_v1.0.md`

### Doc-4F — M4 Business Operations
- **FROZEN/authoritative:** `Doc-4F_Structure_v1.0_FROZEN.md` + PassB parts `Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md`, `Part3_BC-OPS-3_FROZEN.md`, `Part4_BC-OPS-4_FROZEN.md`, `Part5_BC-OPS-5_FROZEN.md`; module freeze `Doc-4F_Module4_Freeze_Audit_v1.0.md`
- PassB content (bounded contexts): `Part1_BC-OPS-1_Buyer_Private_CRM` · `Part2_BC-OPS-2_Procurement_Engagements` · `Part3_BC-OPS-3_Vendor_Lead_Pipeline` · `Part4_BC-OPS-4_Document_Generation_&_Templates` · `Part5_BC-OPS-5_Finance_Records_v1.0.md`
- Content/reviews: `Doc-4F_Content_v1.0_PassA.md` · `Doc-4F_Structure_Independent_Hard_Review_v1.0.md` · `Doc-4F_PassB_PartN_Hard_Review_v1.0.md` · `Doc-4F_Module4_Consolidated_PassB_Review_v1.0.md`
- Patches/audits: `Doc-4F_Structure_Patch_v1.0.md` · `Doc-4F_PassB_PartN_Patch_v1.0.md` · `…_Freeze_Audit_v1.0.md` · `…_Patch_Verification[_Report]_v1.0.md`

### Doc-4G — M5 Trust & Verification
- **FROZEN/authoritative:** `Doc-4G_Final_Freeze_Audit_v1.0.md` + PassB parts `Doc-4G_PassB_Part1…Part5_*_v1.0.md` (BC-TRUST-1 Verification · 2 Trust Scoring · 3 Performance Scoring · 4 Fraud/Risk Signals · 5 Reviews/Admin Ratings); consolidation `Doc-4G_Final_Consolidation_Review_v1.0.md`
- Content: `Doc-4G_PassA_Content_v1.0.md` · primer `Doc-4G_New_Chat_Primer.md`
- Reviews/patches: `Doc-4G_Structure_Independent_Hard_Review_v0.1.md` · `Doc-4G_PassA_Independent_Hard_Review_v0.1.md` · `Doc-4G_Structure_Patch_v0.1.md` · `Doc-4G_PassA_Patch_v1.0.md` · `Doc-4G_PassB_PartN_Patch_v1.0.md` · `…_Freeze_Audit_v1.0.md` · `…_Patch_Verification_v1.0.md`
- (Related module-level: `Module-5_Consolidation_Review_v1.0.md` · `Module-5_Freeze_Audit_v1.0.md`)

### Doc-4H — M6 Communication
- **FROZEN/authoritative:** PassB parts incl. `Doc-4H_PassB_Part1b_v1.0_FROZEN.md`; consolidation `Doc-4H_Module6_Consolidated_PassB_Review_v2.0.md` (supersedes v1.0)
- PassB content: `Part1_BC-COMM-1_Messaging` · `Part1b_BC-COMM-1_Participant_And_Close` · `Part2_BC-COMM-2_Notifications` · `Part3_BC-COMM-3_Delivery_Tracking` · `Part4_BC-COMM-4_Support_Communications_v1.0.md`
- Content/primer: `Doc-4H_PassA_Content_v1.0.md` · `Doc-4H_Module6_New_Chat_Primer.md`
- Reviews/patches/audits: `Doc-4H_Structure_Independent_Hard_Review_v0.1.md` · `Doc-4H_PassA/PassB_PartN_Independent_Hard_Review_v1.0.md` · `Doc-4H_Structure_Patch_v0.1.md` · `Doc-4H_PassN_Patch_v1.0.md` · `…_Freeze_Audit_v1.0.md`

### Doc-4I — M7 Monetization
- **FROZEN/authoritative:** `Doc-4I_FROZEN_v1.0.md`; freeze `Doc-4I_Final_Freeze_Audit_v1.0.md`; consolidation `Doc-4I_Module_Consolidation_Review_v1.0.md`
- **Additive contract (human-approved, Doc-5I Board Gate 2):** `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md` — `billing.activate_plan.v1` (§HB-1.1a); realizes the `Doc-2 §3.8` `draft→active` edge; Doc-4I count 32→33
- Frozen sub-artifacts: `Doc-4I_PassA_v1.0_FROZEN.md` · `Doc-4I_PassB_Part1_v1.0_FROZEN.md` · `Doc-4I_PassB_Part2_v1.0_FROZEN.md`
- PassB content: `Part1_BC-BILL-1_Plans_And_Entitlements` (+ `BC-BILL-1_2_3`) · `Part2_BC-BILL-4_5_6_v1.0.md`
- Content/reviews/patches: `Doc-4I_PassA_Content_v1.0.md` · `Doc-4I_Structure/PassA/PassB_*_Independent_Hard_Review_v1.0.md` · `…_Patch_v1.0.md` · `…_Patch_Verification_v1.0.md`

### Doc-4J — M8 Admin Operations (authoritative event catalog)
- **FROZEN/authoritative:** `Doc-4J_FROZEN_v1.0.md`; freeze `Doc-4J_Final_Freeze_Audit_v1.0.md`
- Frozen sub-artifacts: `Doc-4J_Structure_FROZEN_v1.0.md` · `Doc-4J_PassA_FROZEN_v1.0.md`
- Content: `Doc-4J_PassA_Part1/Part2_Content_v1.0.md` · `Doc-4J_PassB_Content_v1.0.md`
- Reviews/patches: `Doc-4J_*_Independent_Hard_Review_v1.0.md` · `Doc-4J_*_Consolidation_Review_v1.0.md` · `Doc-4J_*_Patch_v1.0.md` · `…_Patch_Verification_v1.0.md` · `…_Freeze_Audit_v1.0.md`

### Doc-4K — M9 AI Layer (reserved)
- **FROZEN/authoritative:** `Doc-4K_FROZEN_v1.0.md`; freeze `Doc-4K_Final_Freeze_Audit_v1.0.md`; structure `Doc-4K_Structure_FROZEN_v1.0.md`
- Content: `Doc-4K_PassA_Content_v1.0.md` · `Doc-4K_PassB_Content_v1.0.md`
- Reviews/dispositions/patches: `Doc-4K_Structure_Board_Assessment_v1.0.md` · `Doc-4K_PassA_Board_Disposition_v1.0.md` · `Doc-4K_*_Independent_Hard_Review_v1.0.md` · `Doc-4K_*_Patch[_Verification]_v1.0.md` · `Doc-4K_Brief_Reconciliation_Note_v1.0.md`

### Doc-4L — Cross-Module Integration Index / event-flow map
- **FROZEN/authoritative:** `Doc-4L_FROZEN_v1.0.md`; freeze `Doc-4L_Final_Freeze_Audit_v1.0.md`; structure `Doc-4L_Structure_FROZEN_v1.0.md`
- Content/reviews/patches: `Doc-4L_PassA_Content_v1.0.md` · `Doc-4L_PassA_Independent_Hard_Review_v1.0.md` · `Doc-4L_PassA_board_accessment.md` · `Doc-4L_Structure_Proposal_v0.1.md` · `Doc-4L_Structure_Patch_v1.0.md`

### Doc-4M — State Machine Contracts (authoritative lifecycle/state authority)
- **FROZEN/authoritative:** `Doc-4M_FROZEN_v1.0.md`; freeze `Doc-4M_Final_Freeze_Audit_v1.0.md`; structure `Doc-4M_Structure_FROZEN_v1.0.md`
- Content/reviews/patches: `Doc-4M_PassA_Content_v1.0.md` · `Doc-4M_Independent_Hard_Review_v1.0.md` · `Doc-4M_PassA_Independent_Hard_Review_v1.0.md` · `Doc-4M_*_Patch[_Verification]_v1.0.md` · `Doc-4M_Structure_Proposal_v0.1.md`

---

## 4. Doc-4 Series — Cross-Family Governance & Freeze

| File | Purpose |
|------|---------|
| `Doc-4_SERIES_FROZEN_v1.0.md` | **Series freeze record** — Doc-4A…4M all FROZEN |
| `Doc-4_SERIES_FINAL_AUDIT_v1.0.md` | Final cross-series audit |
| `Doc-4_Governance_Note_v1.0.md` | Doc-4 program governance |
| `Doc-4_FamilyMap_Conflict_Escalation_v0.1.md` | Family map + conflict escalation |
| `iVendorZ_CrossDoc_Consistency_Audit_1_v1.0.md` | Cross-document consistency audit |

---

## 5. Doc-5 Program (Implementation Contracts — current phase)

| File | Purpose |
|------|---------|
| `Doc-5_Program_Governance_Note_v1.0.md` | **Doc-5 program governance** — entry to Implementation Contracts (API/DB/Frontend/Tests). |
| `Doc-5A_SERIES_FROZEN_v1.0.md` | **Doc-5A FROZEN** — API realization metastandard freeze manifest; effective = `Doc-5A_Content_v1.0_Pass1…12` + `Doc-5A_Structure_v1.0_FROZEN` + ratified patches. Gates Doc-5B…5M. |
| `Doc-5A_Content_v1.0_Pass1…12.md` · `Doc-5A_Structure_v1.0_FROZEN.md` | Doc-5A source passes (§0–§12 + App A/B/C) + canonical structure |
| `Doc-5A_Structure_Patch_STRUCT-02.md` · `Doc-4A_Patch_C-05-204_v1.0.md` | Ratified patches (2026-06-24) |
| `Doc-5B_SERIES_FROZEN_v1.0.md` | **Doc-5B FROZEN** — M0 `core` API realization freeze manifest; effective = `Doc-5B_Content_v1.0_Pass1…4` + `Doc-5B_Structure_v1.0_FROZEN` + resolved finding registers. Realizes Doc-4B; out-of-wire boundary (R1) precedent. |
| `Doc-5B_Content_v1.0_Pass1…4.md` · `Doc-5B_Structure_v1.0_FROZEN.md` | Doc-5B source passes (§0–§7 + Appendix A) + canonical structure |
| `governanceReviews/Doc-5B_Freeze_Readiness_Audit_v1.0.md` · `governanceReviews/Doc-5B_Pass3_Escalation_B01_M03.md` | Doc-5B freeze audit + Pass-3 escalation record (B-01/M-03, CLOSED) |
| `Doc-5C_SERIES_FROZEN_v1.0.md` (M1 `identity`) | **Doc-5C FROZEN** — M1 API realization freeze manifest; effective = `Doc-5C_Content_v1.0_Pass1…2` + `Doc-5C_Structure_v1.0_FROZEN` + resolved registers. User-primary/active-org surface; R1–R6 |
| `Doc-5C_Structure_v1.0_FROZEN.md` · `Doc-5C_Content_v1.0_Pass1…2.md` | Doc-5C source (canonical TOC + §0–§8 + Appendix A) |
| `Doc-5C_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5C_Freeze_Readiness_Audit_v1.0.md` | Doc-5C structure authoring history (v0.2; Hard Review) + freeze audit |
| `Doc-5E_SERIES_FROZEN_v1.0.md` (M3 `rfq`) | **Doc-5E FROZEN** — M3 RFQ Procurement Engine (the moat) API realization freeze manifest; effective = `Doc-5E_Content_v1.0_Pass1…3` + `Doc-5E_Structure_v1.0_FROZEN` + resolved registers. Realizes Doc-4E (38 contracts); matching/routing engine out-of-wire (R1); R1–R7; non-disclosure + engine-execution attestations |
| `Doc-5E_Structure_v1.0_FROZEN.md` · `Doc-5E_Content_v1.0_Pass1…3.md` | Doc-5E source (canonical TOC + §0–§9 + Appendix A) |
| `Doc-5E_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5E_Freeze_Readiness_Audit_v1.0.md` | Doc-5E structure authoring history (v0.2; Hard Review) + freeze audit (`[ESC-RFQ-POLICY]` gate → cleared by Patch v1.1) |
| `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ.md` | Additive Doc-3 §12.2 registration of 2 `rfq.*` API-realization keys; clears the Doc-5E freeze gate (Doc-4A §18.2) |
| `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace.md` | Additive Doc-3 §12.2 registration of 2 `marketplace.*` API-realization keys; clears the Doc-5D DD-6 content-freeze gate (Doc-4A §18.2) |
| `Doc-5D_SERIES_FROZEN_v1.0.md` (M2 `marketplace`) | **Doc-5D FROZEN** — M2 Marketplace & Discovery API realization freeze manifest; effective = `Doc-5D_Content_v1.0_Pass1…3` + `Doc-5D_Structure_v1.0_FROZEN` + resolved registers. Realizes Doc-4D (71 contracts); first large public/anonymous surface; tri-actor (Public/User/Admin); R1–R10; R5 projection-separation + R9 non-disclosure attestations |
| `Doc-5D_Structure_v1.0_FROZEN.md` · `Doc-5D_Content_v1.0_Pass1…3.md` | Doc-5D source (canonical TOC + §0–§10 + Appendix A) |
| `Doc-5D_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5D_Freeze_Readiness_Audit_v1.0.md` | Doc-5D structure authoring history (v0.2 + round-3 ADD-1/ADD-2; Hard Review) + freeze audit (DD-6 gate → cleared by Patch v1.2) |
| `Doc-5G_SERIES_FROZEN_v1.0.md` (M5 `trust`) | **Doc-5G FROZEN** — M5 Trust & Verification (the governance-signal owner) API realization freeze manifest; effective = `Doc-5G_Content_v1.0_Pass1…3` + `Doc-5G_Structure_v1.0_FROZEN` + resolved registers. Realizes Doc-4G (40 contracts); multi-actor (Public/User/Admin); R1–R12; score-computation + governance/Billing firewall + non-disclosure attestations |
| `Doc-5G_Structure_v1.0_FROZEN.md` · `Doc-5G_Content_v1.0_Pass1…3.md` | Doc-5G source (canonical TOC + §0–§9 + Appendix A) |
| `Doc-5G_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5G_Freeze_Readiness_Audit_v1.0.md` | Doc-5G structure authoring history (Hard Review — SR-1 reconciliation + ADD-1/ADD-2) + freeze audit (`[ESC-TRUST-POLICY]` gate → cleared by Patch v1.3) |
| `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust.md` | Additive Doc-3 §12.2 registration of 2 `trust.*` API-realization keys; clears the Doc-5G `[ESC-TRUST-POLICY]` gate (Doc-4A §18.2) |
| `Doc-5F_SERIES_FROZEN_v1.0.md` (M4 `operations`) | **Doc-5F FROZEN** — M4 Business Operations (post-award ERP-Lite layer) API realization freeze manifest; effective = `Doc-5F_Content_v1.0_Pass1…3` + `Doc-5F_Structure_v1.0_FROZEN` + resolved registers. Realizes Doc-4F (50 contracts: 46 caller-facing + 4 out-of-wire); two-sided tenant User (no Admin/public); R1–R10; non-disclosure (R5) + money-boundary (R8) attestations |
| `Doc-5F_Structure_v1.0_FROZEN.md` · `Doc-5F_Content_v1.0_Pass1…3.md` | Doc-5F source (canonical TOC + §0–§10 + Appendix A) |
| `Doc-5F_Structure_Proposal_v0.1.md` · `governanceReviews/Doc-5F_Freeze_Readiness_Audit_v1.0.md` | Doc-5F structure authoring history (Board Hard Review + round-2 ADD-1/ADD-2; partition independently verified 50=46+4) + freeze audit (`[ESC-OPS-POLICY]` gate → cleared by Patch v1.4) |
| `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations.md` | Additive Doc-3 §12.2 registration of 2 `operations.*` API-realization keys (new `operations` namespace); clears the Doc-5F `[ESC-OPS-POLICY]` gate (Doc-4A §18.2) |
| `Doc-5H_SERIES_FROZEN_v1.0.md` (M6 `communication`) | **Doc-5H FROZEN** — M6 Communication (delivery-only transport / notification fan-out layer) API realization freeze manifest; effective = `Doc-5H_Content_v1.0_Pass1…3` + `Doc-5H_Structure_v1.0_FROZEN` + resolved registers. Realizes Doc-4H (23 contracts: 19 caller-facing + 4 out-of-wire); User+Admin (no public); R1–R12; delivery-only/single-authorship (R5) + delivery-aggregate-ownership (R8) + non-disclosure (R10) + append-only (R12) attestations |
| `Doc-5H_Structure_v1.0_FROZEN.md` · `Doc-5H_Content_v1.0_Pass1…3.md` | Doc-5H source (canonical TOC + §0–§9 + Appendix A) |
| `Doc-5H_Structure_Proposal_v0.1.md` · `Doc-5H_Structure_Freeze_Audit_v1.0.md` · `governanceReviews/Doc-5H_Freeze_Readiness_Audit_v1.0.md` | Doc-5H structure authoring history (Board pre-authoring + Independent Hard Review; partition verified 23=19+4) + structure + content freeze audits (`[ESC-COMM-POLICY]` gate → cleared by Patch v1.5; `[REC-COMM-OWNERSHIP]` satisfied) |
| `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication.md` | Additive Doc-3 §12.2 registration of 2 `communication.*` API-realization keys (new `communication` namespace); clears the Doc-5H `[ESC-COMM-POLICY]` gate (Doc-4A §18.2) |
| `Doc-5I_SERIES_FROZEN_v1.0.md` (M7 `billing`) | **Doc-5I FROZEN** — M7 Monetization / Billing (meters-and-charges; handles no buyer↔vendor money) API realization freeze manifest; effective = `Doc-5I_Content_v1.0_Pass1…3` + `Doc-5I_Structure_v1.0_FROZEN` + `Doc-5I_Structure_Additive_Patch_v1.0` + resolved registers. Realizes Doc-4I + `Doc-4I_ActivatePlan_Additive_Patch` = **33 contracts** (27 caller-facing + 6 out-of-wire); User+Admin+System (no public); R1–R11; billing-firewall (R5) + platform-invoice-≠-trade-invoice (R6/FIXED) + gateway-callback (R8) + entitlement-service-authority (R10) attestations |
| `Doc-5I_Structure_v1.0_FROZEN.md` · `Doc-5I_Structure_Additive_Patch_v1.0.md` · `Doc-5I_Content_v1.0_Pass1…3.md` | Doc-5I source (canonical §0–§11 + Appendix A) + additive structure patch (Board Gates 1 & 2) |
| `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md` | Additive Doc-4I contract `billing.activate_plan.v1` (§HB-1.1a; human-approved Board Gate 2 → A); realizes `Doc-2 §3.8` `draft→active` |
| `Doc-3_Policy_Key_Registration_Patch_v1.6_Billing.md` | Additive Doc-3 §12.2 registration of 2 `billing.*` API-realization keys (new `billing` namespace); clears the Doc-5I `[ESC-BILL-POLICY]` gate (Doc-4A §18.2) |
| `Doc-5I_Structure_Proposal_v0.1.md` · `Doc-5I_Structure_Freeze_Audit_v1.0.md` · `Doc-5I_Content_Freeze_Audit_v1.0.md` · `Doc-5I_ESC_Board_Escalation_v1.0.md` | Doc-5I authoring history (structure Hard Review + Patch + freeze audit; content Pass-2 Hard Review/Re-Review + Content Independent Hard Review; ESC board escalation → Gates 1 & 2 → Option A) |
| `Doc-5K_SERIES_FROZEN_v1.0.md` (M9 `ai`) | **Doc-5K FROZEN** — M9 AI Layer (reserved advisory / derived-artifact layer) API realization freeze manifest; effective = `Doc-5K_Content_v1.0_FROZEN` (consolidated Pass-1/2/3) + `Doc-5K_Structure_v1.0_FROZEN` (+ Patch CE-01) + resolved registers. Realizes Doc-4K (**16 contracts**: 8 caller-facing reads + 8 out-of-wire generate/expire); User read-only (AI-Agent/System out-of-wire; no public/Admin); R1–R9; advisory/non-authoritative + score-firewall + regenerable-cache (TTL hard-delete) + non-disclosure attestations; `[REC-AI-WIRE]` satisfied |
| `Doc-5K_Content_v1.0_FROZEN.md` · `Doc-5K_Structure_v1.0_FROZEN.md` · `Doc-5K_Structure_Patch_CE-01_v1.0.md` · `Doc-5K_Content_v1.0_Pass1…3.md` | Doc-5K source (consolidated content + canonical §0–§6 + Appendix A + structure patch CE-01) |
| `Doc-3_Policy_Key_Registration_Patch_v1.8_AI.md` | Additive Doc-3 §12.2 registration of 5 `ai.*` keys (`ai.list_page_size_max` + 4 `ai.<bc>.ttl_seconds`; new `ai` namespace); clears the Doc-5K `[ESC-AI-POLICY]` carried item (Doc-4A §18.2 / Doc-4K §B.12) |
| `Doc-5K_Structure_Proposal_v0.1.md` · `Doc-5K_Structure_Freeze_Audit_v1.0.md` · `Doc-5K_Content_Freeze_Audit_v1.0.md` | Doc-5K authoring history (Board pre-authoring + Independent Hard Review — REC-1 reconciled; structure + content freeze audits) |
| `Doc-5J_SERIES_FROZEN_v1.0.md` (M8 `admin`) | **Doc-5J FROZEN** — M8 Admin Operations (platform-staff governance/operations layer) API realization freeze manifest; effective = `Doc-5J_Content_v1.0_Pass1…3` + `Doc-5J_Structure_v1.0_FROZEN` + resolved registers. Realizes Doc-4J (**34 tokens**: 32 caller-facing + 2 out-of-wire); **Admin only** (no tenant/public; no active-org; no delegation); R1–R10; Admin-decides/owning-module-owns (R5) + non-disclosure (R6) + moat (R7) + Trust firewall (R8) + single-event `VendorBanned` (R9) attestations |
| `Doc-5J_Structure_v1.0_FROZEN.md` · `Doc-5J_Content_v1.0_Pass1…3.md` | Doc-5J source (canonical §0–§11 + Appendix A) |
| `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin.md` | Additive Doc-3 §12.2 registration of 2 `admin.*` API-realization keys (new `admin` namespace); clears the Doc-5J `[ESC-ADM-POLICY]` gate (Doc-4A §18.2) |
| `Doc-5J_Structure_Proposal_v0.1.md` · `Doc-5J_Structure_Independent_Hard_Review_v0.1.md` · `Doc-5J_Structure_Freeze_Audit_v1.0.md` · `Doc-5J_Content_Independent_Hard_Review_v1.0.md` · `Doc-5J_Content_Freeze_Audit_v1.0.md` | Doc-5J authoring history (structure Hard Review + Freeze Audit; content Hard Review + Content Freeze Audit PASS) |

---

## 5b. Doc-6 Program (Database Realization — current phase)

> The persistence sibling of the Doc-5 API program. **Doc-6A is the metastandard** (the DB analog of Doc-5A); it governs the per-module schema realizations Doc-6B…6K via Appendix A (`CHK-6-xxx`). Realizes Doc-2 v1.0.3 (the binding *what*-authority) on PostgreSQL/Supabase + Prisma `multiSchema`. Consistent-with (not conformant-to) the frozen Doc-5 surface (governance §8).

| File | Purpose |
|------|---------|
| `Doc-6A_SERIES_FROZEN_v1.0.md` | **Doc-6A FROZEN** — DB Realization Metastandard freeze manifest; effective = `Doc-6A_Structure_v1.0_FROZEN` + `Doc-6A_Content_v1.0_Pass1…4` + freeze audits. Fixes R1–R12 + §2.5 realization-choice attribution; Appendix A = 10 bands / 37 `CHK-6-xxx` checks (per-module freeze gate); Appendix B = Global Conventions Registry (base model · Prisma/PG type catalog · cross-cutting shared-enum catalog · naming registry). R3(b) one-Prisma-namespace-per-module Board-ratified. Coins nothing |
| `Doc-6A_Structure_v1.0_FROZEN.md` · `Doc-6A_Content_v1.0_Pass1…4.md` | Doc-6A source (canonical §0–§13 + Appendix A/B); Pass-1 §0–§4 · Pass-2 §5–§9 · Pass-3 §10–§13 + App A · Pass-4 App B + App A Band J |
| `Doc-6A_Structure_Proposal_v0.1.md` · `Doc-6A_Structure_Freeze_Audit_v1.0.md` · `Doc-6A_Content_Freeze_Audit_v1.0.md` | Doc-6A authoring history (Structure Proposal v0.2 Independent Hard Review + Structure Freeze Audit; per-pass content reviews + full cross-pass Content Hard Review + Content Freeze Audit PASS) |
| `Doc-6B_SERIES_FROZEN_v1.0.md` (M0 `core`) | **FROZEN/authoritative:** realizes Doc-2 §10.1 — **5 platform-owned tables** (`audit_records`/`outbox_events`/`id_sequences`/`system_configuration`/`feature_flags`) as PostgreSQL DDL + Prisma; effective = `Doc-6B_Structure_v1.0_FROZEN` + `Doc-6B_Structure_Additive_Patch_v1.0` (**CR4′** column-scoped immutability) + `Doc-6B_Content_v1.0_Pass1…2` + freeze audits. CR1–CR10 + CR4′; platform-owned (no org anchor); append-only (no-DELETE + immutable-payload + bounded operational updates; 5 triggers); human-ref allocator (SECURITY DEFINER, row-locked, never-reused); 18 `core.*` POLICY keys seeded (Doc-3 v1.0); Appendix A 37/37 (0 FAIL); **DR-6-CORE resolved** (the owner). Coins nothing |
| `Doc-6B_Structure_v1.0_FROZEN.md` · `Doc-6B_Structure_Additive_Patch_v1.0.md` · `Doc-6B_Content_v1.0_Pass1…2.md` | Doc-6B source (canonical §0–§6 + Appendix A) + the CR4′ additive structure patch (flag-and-halt worked example) |
| `Doc-6B_Structure_Proposal_v0.1.md` · `Doc-6B_Structure_Freeze_Audit_v1.0.md` · `Doc-6B_Content_Freeze_Audit_v1.0.md` | Doc-6B authoring history (Structure Hard Review 0-findings + Freeze Audit; per-pass content reviews + cross-pass Content Hard Review + Content Freeze Audit PASS) |

**Carried into Doc-6C…6K (per-module gates):** `DR-6-CORE` (M0 owns outbox/audit/id/config) · `DR-6-API` (Doc-5 persistability cross-check) · `DR-6-STATE` (state machines as columns + enforcement) · `[ESC-6-SCHEMA]` (additive Doc-2 patch) · `[ESC-6-POLICY]` (additive Doc-3 §12.2 patch — incl. open **M1 `identity`** namespace, a Doc-6C cross-check) · `[ESC-6-API]` (Board → additive Doc-2 patch). **Doc-6B (M0 `core`) FROZEN 2026-06-26.** **Next:** Doc-6C (M1 `identity`) — carries the open `[ESC-6-POLICY]` identity-namespace question.

---

## 6. Program Status, Roadmap & Context Packs

| File | Purpose |
|------|---------|
| `Program_Status_And_Roadmap.md` · `Program_Status_and_Authoring_Roadmap_v1.0.md` | Program status + authoring roadmap |
| `iVendorz_Context_Pack_v1…v3.md` · `iVendorZ_Context_Pack_v4.md` · `iVendorz_Context_Pack_v5.md` | Session context packs (v5 = latest) |
| `iVendorz_New_Chat_Primer.md` · `Doc-4G_New_Chat_Primer.md` · `Doc-4H_Module6_New_Chat_Primer.md` | New-chat primers |
| `iVendorz_Master_Overview_v1.0.md` | Consolidated master overview |
| `ivendorz_Project_Instructions.md` · `Project_Instructions_Reconciliation_Note_v1.0.md` | Project instructions + reconciliation |

---

## How to navigate

1. **To understand the system:** §0 read-first, then `Master_System_Architecture_v1.0_FINAL.md`.
2. **To work on a module:** open that family's **FROZEN/authoritative** file (§3); read Doc-4A first for contract conventions.
3. **State machines:** Doc-4M. **Event catalog:** Doc-4J. **Cross-module flows:** Doc-4L.
4. **Lifecycle/provenance:** the Structure/Review/Patch/Freeze-Audit files trace how each frozen doc was reached — reference only; never reopen a frozen doc.

> Non-authoritative index. If a filename or status here disagrees with the actual document,
> the document wins; patch this index to match.
