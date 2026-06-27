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
| `Doc-6C_SERIES_FROZEN_v1.0.md` (M1 `identity`) | **FROZEN/authoritative:** realizes Doc-2 §10.2 — **9 tables** (users/organizations/memberships/roles/permissions/role_permissions/organization_workflow_settings/buyer_profiles/delegation_grants) as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6C_Structure_v1.0_FROZEN` + `Doc-3_Policy_Key_Registration_Patch_v1.9_Identity` + `Doc-6C_Content_v1.0_Pass1…3` + freeze audits. DC-CR1–CR11; **first real org-anchor RLS** (all 9 tables explicit DDL, §6.2a) + roles-NULL-seed + **dual-party `delegation_grants`** (both-read/controlling-write; M2 bare-UUID `vendor_profile_id`); auth boundary (no secret, `auth_user_id`); `human_ref` via `core.allocate_human_ref`; 3 state machines; 45-slug + 4-bundle seed (Doc-2 §7); 7 `identity.*` POLICY keys (Doc-3 v1.9); Appendix A 37/37 (0 FAIL). Coins nothing |
| `Doc-6C_Structure_v1.0_FROZEN.md` · `Doc-6C_Content_v1.0_Pass1…3.md` | Doc-6C source (canonical §0–§7 + Appendix A) |
| `Doc-3_Policy_Key_Registration_Patch_v1.9_Identity.md` | **RATIFIED** — additive Doc-3 §12.2 registration of **7 `identity.*` keys**; clears Doc-4C `[DC-5]` + Doc-6C `[ESC-6-POLICY]` |
| `Doc-6C_Structure_Proposal_v0.1.md` · `Doc-6C_Structure_Freeze_Audit_v1.0.md` · `Doc-6C_Content_Freeze_Audit_v1.0.md` | Doc-6C authoring history (Structure Hard Review 1B+2MAJ + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — HQ-001/HQ-003 caught — + Content Freeze Audit PASS) |
| `Doc-6D_SERIES_FROZEN_v1.0.md` (M2 `marketplace`) | **FROZEN/authoritative:** realizes Doc-2 §10.3 — **21 tables / 8 aggregates** as PostgreSQL DDL + Prisma + RLS + FTS; effective = `Doc-6D_Structure_v1.0_FROZEN` + `Doc-6D_Content_v1.0_Pass1…3` + freeze audits. MK-CR1–CR12; **first public/anonymous tri-actor RLS** (Public/User/Admin; visibility-scope = publish-state, **no `buyer_private` coined**); capability matrix (4 booleans); §5.3 two-dimension + §5.8 state; **score firewall** (no score column; bands reflected, never calculated); **`financial_tier_history` exclusive-writer-as-consumer** (Trust never writes; append-only); `vendor_matching_attributes` derived read-model (admin-only; RFQ via service); versioned `spec_documents` (column-scoped immutability); 4-level category tree (admin-governed); **first real FTS** (tsvector+GIN); ad money = M7 by reference; `human_ref` via `core`; Appendix A 37/37 (0 FAIL). Coins nothing |
| `Doc-6D_Structure_v1.0_FROZEN.md` · `Doc-6D_Content_v1.0_Pass1…3.md` | Doc-6D source (canonical §0–§8 + Appendix A) |
| `Doc-6D_Structure_Proposal_v0.1.md` · `Doc-6D_Structure_Freeze_Audit_v1.0.md` · `Doc-6D_Content_Hard_Review_v1.0.md` · `Doc-6D_Content_Freeze_Audit_v1.0.md` | Doc-6D authoring history (Structure Hard Review 0-findings + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — **HR-1** history UPDATE-open + **HR-2** spec PERFORM-of-trigger-fn caught vs Doc-6B §4 — + Content Freeze Audit PASS) |
| `Doc-6E_SERIES_FROZEN_v1.0.md` (M3 `rfq`) | **FROZEN/authoritative — the moat:** realizes Doc-2 §10.4 — **12 tables / 5 groupings** (2 ARs) as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6E_Structure_v1.0_FROZEN` + `Doc-6E_Content_v1.0_Pass1…3` + freeze audits. RQ-CR1–CR12; **first dual-sided buyer+vendor grant-row RLS** (materialized `rfq_invitation_grantees`/`rfq_document_grants`/`quotation_visibility` anchors + party columns; never cross-schema traversal; refresh-on-revocation); **blacklist undetectable — first real in-scope CHK-6-022 byte-equivalence** (gate-excluded never written to `matching_results`; `rfq_routing_log` aggregate-only + no vendor policy; matching/log/comparison buyer-side-only); RFQ control plane §5.4 (13 states) + Quotation §5.5 (6); one-active-quotation partial-unique; `rfq_versions.is_immutable`-once-quoted (conditional trigger); two human_refs (RFQ-…/QTN-…); reads M2 matching-attributes via service, owns the matching logic; Appendix A 37/37 (0 FAIL). Coins nothing |
| `Doc-6E_Structure_v1.0_FROZEN.md` · `Doc-6E_Content_v1.0_Pass1…3.md` | Doc-6E source (canonical §0–§8 + Appendix A) |
| `Doc-6E_Structure_Proposal_v0.1.md` · `Doc-6E_Structure_Freeze_Audit_v1.0.md` · `Doc-6E_Content_Hard_Review_v1.0.md` · `Doc-6E_Content_Freeze_Audit_v1.0.md` | Doc-6E authoring history (Structure Hard Review 2MAJ — incl. `matching_results` vendor-leak fix — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — 0 BLOCKER/MAJOR, byte-equivalence verified end-to-end across 12 tables — + Content Freeze Audit PASS). Carries `[ESC-RFQ-AUDIT]` · `[ESC-RFQ-SCHEMA-RULES]` |
| `Doc-6F_SERIES_FROZEN_v1.0.md` (M4 `operations`) | **FROZEN/authoritative:** realizes Doc-2 §10.5 — **19 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6F_Structure_v1.0_FROZEN` + `Doc-6F_Content_v1.0_Pass1…3` + freeze audits. OP-CR1–CR12; **the blacklist's owning side** (`buyer_vendor_statuses` + private CRM strictly `organization_id`-tenant — **no vendor, no admin-all**; non-disclosure byte-equivalence in-scope CHK-6-022; served to M3 via CRM service only); **two-sided engagement RLS via party columns** (`active_org IN (buyer_organization_id, vendor_controlling_org_id)`); **money-record boundary — no funds custody** (`trade_invoices ≠ billing.platform_invoices`; no balance/gateway/escrow; money facts immutable); governance signal #5 never mutates platform scores; versioned post-award docs (column-scoped immutability); `vendor_leads` idempotent `VendorInvited` consumer; multiple human_refs (ENG-/DOC-/INV-); Appendix A 37/37 (0 FAIL). Coins nothing |
| `Doc-6F_Structure_v1.0_FROZEN.md` · `Doc-6F_Content_v1.0_Pass1…3.md` | Doc-6F source (canonical §0–§8 + Appendix A) |
| `Doc-6F_Structure_Proposal_v0.1.md` · `Doc-6F_Structure_Freeze_Audit_v1.0.md` · `Doc-6F_Content_Hard_Review_v1.0.md` · `Doc-6F_Content_Freeze_Audit_v1.0.md` | Doc-6F authoring history (Structure Hard Review 2MAJ — non-disclosure scope + two-sided party-column — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — **HR-F1** `trade_invoices` money-immutability fixed; non-disclosure + money-boundary verified end-to-end across 19 tables — + Content Freeze Audit PASS). Carries `[ESC-OPS-AUDIT]` |
| `Doc-6G_SERIES_FROZEN_v1.0.md` (M5 `trust`) | **FROZEN/authoritative:** realizes Doc-2 §10.6 — **11 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6G_Structure_v1.0_FROZEN` + `Doc-6G_Content_v1.0_Pass1…3` + freeze audits. TR-CR1–CR12; **the governance-signal owner — the firewall's authoritative side** (Trust/Performance/verified-Tier/Capacity computed **independently**; no cross-score column/FK; **Buyer Vendor Status (M4) never enters**); **scores System-written, never hand-edited** (no in-band write policy — System owner-role/`SECURITY DEFINER` only); **public band = M2 reflection** (no public raw-score read); **Admin decides, Trust owns** (verification); `verified_financial_tiers` emits `VendorTierChanged`; idempotent `performance_inputs` Operations consumer; `public_reviews` post-award/published-public + feeds performance within Trust; `admin_ratings` staff-only; **no human_ref** (CHK-6-002 N/A); Appendix A 37/37 (0 FAIL; 4 justified N/A). Coins nothing |
| `Doc-6G_Structure_v1.0_FROZEN.md` · `Doc-6G_Content_v1.0_Pass1…3.md` | Doc-6G source (canonical §0–§8 + Appendix A) |
| `Doc-6G_Structure_Proposal_v0.1.md` · `Doc-6G_Structure_Freeze_Audit_v1.0.md` · `Doc-6G_Content_Hard_Review_v1.0.md` · `Doc-6G_Content_Freeze_Audit_v1.0.md` | Doc-6G authoring history (Structure Hard Review 2MAJ — public-band-via-reflection + System-actor-only writes — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — **HR-G1** `verified_financial_tiers` immutability fixed; firewall + System-actor-write verified end-to-end — + Content Freeze Audit PASS). Carries `[ESC-TRUST-AUDIT]` |
| `Doc-6H_SERIES_FROZEN_v1.0.md` (M6 `communication`) | **FROZEN/authoritative:** realizes Doc-2 §10.7 — **9 tables / 4 groupings** as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6H_Structure_v1.0_FROZEN` + `Doc-6H_Content_v1.0_Pass1…3` + freeze audits. CM-CR1–CR12; **delivery-only** (M6 transmits, owns no business content); **participant-grant RLS** (third grant pattern — `threads`/`messages` via `thread_participants.participant_organization_id = active org`, simple anchor, terminates); **append-only System-written delivery logs** (email/sms/whatsapp — column-scoped status; no in-band write); notifications/logs are **M0-outbox-event consumers**; Realtime-backed messages (SD=hidden); org+staff support + append-only ticket_messages; **schema = `communication`** (CLAUDE `comms` slip patched); no human_ref (CHK-6-002 N/A); Appendix A 37/37 (0 FAIL; 4 justified N/A). Coins nothing |
| `Doc-6H_Structure_v1.0_FROZEN.md` · `Doc-6H_Content_v1.0_Pass1…3.md` | Doc-6H source (canonical §0–§8 + Appendix A) |
| `Doc-6H_Structure_Proposal_v0.1.md` · `Doc-6H_Structure_Freeze_Audit_v1.0.md` · `Doc-6H_Content_Hard_Review_v1.0.md` · `Doc-6H_Content_Freeze_Audit_v1.0.md` | Doc-6H authoring history (Structure Hard Review 1MAJ — schema-name binding — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — 0 BLOCKER/MAJOR, participant-grant + delivery-only verified — + Content Freeze Audit PASS). Carries `[ESC-COMM-AUDIT]` |
| `Doc-6I_SERIES_FROZEN_v1.0.md` (M7 `billing`) | **FROZEN/authoritative:** realizes Doc-2 §10.8 — **13 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6I_Structure_v1.0_FROZEN` + `Doc-6I_Content_v1.0_Pass1…3` + freeze audits. BL-CR1–CR12; **the platform's OWN revenue** (`platform_invoices` `INV-P-…` via gateway; **`≠ operations.trade_invoices`** — no `operations` FK; the trade flow untouched); **the billing firewall** (no billing state gates trust/eligibility/routing/matching); **entitlements (boolean/numeric/enum), never plan-name** (Financial Tier ≠ Subscription Plan); subscription §5.7 + one-active partial-unique + **3 §8 events**; `record_payment`=gateway callback (not §8); append-only ledgers + column-scoped invoices/payments; money-vs-points distinction; Appendix A 37/37 (0 FAIL). Coins nothing |
| `Doc-6I_Structure_v1.0_FROZEN.md` · `Doc-6I_Content_v1.0_Pass1…3.md` | Doc-6I source (canonical §0–§8 + Appendix A) |
| `Doc-6I_Structure_Proposal_v0.1.md` · `Doc-6I_Structure_Freeze_Audit_v1.0.md` · `Doc-6I_Content_Hard_Review_v1.0.md` · `Doc-6I_Content_Freeze_Audit_v1.0.md` | Doc-6I authoring history (Structure Hard Review 2MAJ — platform-revenue boundary + billing firewall — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — 0 BLOCKER/MAJOR, firewall + platform-revenue boundary verified; HR-I1 migration-order reconciled — + Content Freeze Audit PASS). Carries `[ESC-BILL-AUDIT]` |
| `Doc-6J_SERIES_FROZEN_v1.0.md` (M8 `admin`) | **FROZEN/authoritative:** realizes Doc-2 §10.9 — **10 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6J_Structure_v1.0_FROZEN` + `Doc-6J_Content_v1.0_Pass1…3` + freeze audits. AD-CR1–CR12; **the authoritative event catalog (Doc-4J)**; **"Admin decides, owning module owns"** (M8 writes no owning-module authoritative table — ban→M2, verification→M5, link→M4, import→M2; effects via event/service); the ban authority (`ban_actions` emits **`VendorBanned`**); **`link_suggestions` never vendor-visible** (A-03; CHK-6-022 in-scope); append-only `import_rows` + column-scoped ban/verification-task; no event coined; no human_ref (CHK-6-002 N/A); Appendix A 37/37 (0 FAIL; 4 justified N/A). Coins nothing |
| `Doc-6J_Structure_v1.0_FROZEN.md` · `Doc-6J_Content_v1.0_Pass1…3.md` | Doc-6J source (canonical §0–§8 + Appendix A) |
| `Doc-6J_Structure_Proposal_v0.1.md` · `Doc-6J_Structure_Freeze_Audit_v1.0.md` · `Doc-6J_Content_Hard_Review_v1.0.md` · `Doc-6J_Content_Freeze_Audit_v1.0.md` | Doc-6J authoring history (Structure Hard Review 2MAJ — owning-module boundary + link non-disclosure — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — 0 BLOCKER/MAJOR, owning-module + link non-disclosure verified — + Content Freeze Audit PASS). Carries `[ESC-ADMIN-AUDIT]` · `[ESC-ADMIN-SCHEMA-OUTREACH]` |

| `Doc-6K_SERIES_FROZEN_v1.0.md` (M9 `ai`) | **FROZEN/authoritative — the FINAL Doc-6 module:** realizes Doc-2 §10.10 — **4 cache tables** (one grouping) as PostgreSQL DDL + Prisma + RLS; effective = `Doc-6K_Structure_v1.0_FROZEN` + `Doc-6K_Content_v1.0_Pass1…2` + freeze audits. AI-CR1–CR8; **"AI suggests; modules decide"** (Invariant #12 — owns no authoritative data; **never source of truth**; no §8 event/no score; consumed advisory via service); **the sole `ai.*` TTL hard-delete exception** (Doc-6A R7/§6.5 — caches with `expires_at`; hard-DELETE permitted; **no soft-delete, no immutability**; **CHK-6-033 the active PASS** — the one check that is a PASS only in M9); requesting-org RLS; no human_ref; Appendix A 37/37 (0 FAIL; large N/A set justified by the cache shape). Coins nothing |
| `Doc-6K_Structure_v1.0_FROZEN.md` · `Doc-6K_Content_v1.0_Pass1…2.md` | Doc-6K source (canonical §0–§8 + Appendix A) |
| `Doc-6K_Structure_Proposal_v0.1.md` · `Doc-6K_Structure_Freeze_Audit_v1.0.md` · `Doc-6K_Content_Hard_Review_v1.0.md` · `Doc-6K_Content_Freeze_Audit_v1.0.md` | Doc-6K authoring history (Structure Hard Review 1MAJ — R7 exception explicit — + Freeze Audit; per-pass reviews + cross-pass Content Hard Review — 0 BLOCKER/MAJOR, R7 exception + never-source-of-truth verified — + Content Freeze Audit PASS). Carries `[ESC-AI-AUDIT]` |

**Doc-6 Database Realization program — COMPLETE/FROZEN 2026-06-26.** All 11 deliverables frozen: **Doc-6A** (metastandard) + **Doc-6B…6K** (M0–M9 schemas). **Doc-6B `core` + 6C `identity` + 6D `marketplace` + 6E `rfq` + 6F `operations` + 6G `trust` + 6H `communication` + 6I `billing` + 6J `admin` + 6K `ai` FROZEN.** Each passed Doc-6A Appendix A (37/37). Carried `[ESC-*]` (DD-7, MKT-AUDIT, SCHEMA-SHOWCASE, RFQ-AUDIT, RFQ-SCHEMA-RULES, OPS-AUDIT, TRUST-AUDIT, COMM-AUDIT, BILL-AUDIT, ADMIN-AUDIT, ADMIN-SCHEMA-OUTREACH, AI-AUDIT) all on named channels. **Next:** the Doc-8 persistence/RLS suites (Doc-8D) now have their full schema oracle.

---

## 5c. Doc-7 Program (Frontend Realization — **COMPLETE / FROZEN**, 7A–7H)

> The presentation sibling of the Doc-5 API / Doc-6 DB programs. **Program FROZEN 2026-06-26** — `Doc-7_SERIES_FROZEN_v1.0`. **Doc-7A is the metastandard**; it governs the surface-partitioned realizations Doc-7B…7H via Appendix A (**25 `CHK-7-xxx` / 10 bands A–J**). Realizes the frozen Doc-5 API surface + Doc-4M state machines + Doc-2 §6/§7/§0.4 on Next.js 15 App Router + React + Tailwind + shadcn/ui. Consistent-with (not conformant-to) the frozen Doc-5 surface (governance §8 rule 5); conforms to Doc-4M/Doc-2 (upstream). **Coins nothing.**

| File | Purpose |
|------|---------|
| `Doc-7_SERIES_FROZEN_v1.0.md` | **Program freeze manifest** — all 8 docs FROZEN; program-level invariants (wired-contracts-only · server-side data layer · moat R6/R7 · byte-equivalence Inv #11 · governance firewalls) + program-level carried `[ESC-7-*]`. Points; the per-doc manifests are authoritative |
| `Doc-7A_SERIES_FROZEN_v1.0.md` | **7A FROZEN** — Frontend Realization Metastandard; R1–R12; surface partition; **§3.7 wired-contracts-only**; Appendix A = 25 `CHK-7-xxx` / 10 bands; embedded-component allocation table |
| `Doc-7B_SERIES_FROZEN_v1.0.md` | **7B FROZEN** — Design System & Component Kit *(frozen first)*; BR1–BR12; presentation-only kit; single-owner embedded components; microsite theme-override |
| `Doc-7C_SERIES_FROZEN_v1.0.md` | **7C FROZEN** — App Shell & Data Layer *(frozen second)*; SR1–SR10; route-group topology; server-resolved active-org + switcher; **server-side-only** typed wired client; notification center |
| `Doc-7D_SERIES_FROZEN_v1.0.md` | **7D FROZEN** — Public Surface (anonymous); PR1–PR10; Public-projection reads only; published-only; no buyer-private concept (Inv #11); 3 `[ESC-7-API-*]` |
| `Doc-7E_SERIES_FROZEN_v1.0.md` | **7E FROZEN** — Account & Identity Shell; ER1–ER11; Doc-5C mgmt + Doc-5I account; `activate_plan`→7H; `[ESC-IDN-DELEG-EXPIRY]` |
| `Doc-7F_SERIES_FROZEN_v1.0.md` | **7F FROZEN** — Buyer Workspace (the moat); FR1–FR12; R6 no-auto-decision (incl. AI); buyer never invites; R7/R8; buyer-private CRM never leaks |
| `Doc-7G_SERIES_FROZEN_v1.0.md` | **7G FROZEN** — Vendor Workspace; GR1–GR12; load-bearing byte-equivalence (Inv #11) incl. analytics; score firewall; capability matrix |
| `Doc-7H_SERIES_FROZEN_v1.0.md` | **7H FROZEN** — Admin Console *(last)*; HR1–HR12; Doc-5J + cross-module Admin legs; Admin-decides/owning-module-owns; no active-org; Trust firewall; event framing (M8 emits `VendorBanned` only) |
| `Doc-7{A…H}_Structure_*` · `Doc-7{A…H}_Content_*` · `…_Independent_Hard_Review_*` · `…_Patch_*` · `…_Freeze_Audit_*` | Per-doc source + authoring history (each: Pass → Board Hard Review → Patch → closure check → Structure & Content Freeze Audits — all PASS) |

**Program-level carried (additive channels, Board-approved):** `[ESC-7-API]` file-upload grant (M0/Doc-4B Storage by pointer; `file_ref` only) · `[ESC-7-API-PRODDETAIL/CATNAV/ADS]` (7D anonymous reads → Doc-5D patch) · `[ESC-IDN-DELEG-EXPIRY]` (7E reinstate UI → Doc-2 §5.10). **Doc-7 = COMPLETE; sibling programs Doc-6 (DB) / Doc-8 (Tests) continue.**

---

## 5d. Doc-8 Program (Test & Conformance Realization — STARTED; Doc-8A FROZEN)

> The verification sibling of the Doc-5 API / Doc-6 DB / Doc-7 FE programs. **Doc-8A is the metastandard** (the Doc-5A/6A/7A analog); it governs the test-discipline-partitioned realizations Doc-8B…8G via Appendix A (`CHK-8-xxx`). Realizes the full frozen *what*-corpus (Doc-2/3/4 + 12 invariants/5 firewalled signals/moat — the test oracle) + the Doc-5/6/7 realization contracts (under test) as deterministic, isolated, CI-gating conformance suites. **Doc-8 is the conformance harness yet subordinate to its oracle** (a downward gate over implementations; upward-subordinate to the corpus — governance §3/§8 rule 5): a red test = code defect (fix it) or corpus defect (`[ESC-8-CORPUS]`, flag-and-halt) — never weaken the assertion.

| File | Purpose |
|------|---------|
| `Doc-8A_SERIES_FROZEN_v1.0.md` | **Doc-8A FROZEN** — Test & Conformance Realization Metastandard; effective = `Doc-8A_Structure_v1.0_FROZEN` + `Doc-8A_Content_v1.0_Pass1…3` (+ per-pass patches) + freeze audits. Fixes R1–R12; **test-discipline partition** (Doc-8B Foundation/Harness *(frozen first)* + 8C Contract/API + 8D Persistence/Migration/RLS + 8E Domain/Invariant/State-Machine + 8F Integration/Event-Flow + 8G Frontend/E2E); cross-cutting conformance-concern allocation (RLS/non-disclosure→8D, firewall/invariant/state→8E — assert once, compose elsewhere); Appendix A = **39 `CHK-8-001…081` checks / 9 bands (A–I)** (per-suite freeze gate); inherits the RLS positive/negative/cross-tenant byte-equivalence gate (`Doc-6A R8/§4`) + the migration gate (`Doc-6A §11`); `ERR-8A-1` folded in (structure ID-anchor "Doc-6A §7"→"§3+Doc-4B"). Coins nothing |
| `Doc-8A_Structure_v1.0_FROZEN.md` · `Doc-8A_Content_v1.0_Pass1…3.md` (+ patches) | Doc-8A source (canonical structure + §0–§12 + Appendix A 39 checks); read via the SERIES_FROZEN manifest |
| `Doc-8A_Structure_*` · `Doc-8A_Content_Pass{1,2,3}_Independent_Hard_Review_v1.0.md` · `Doc-8A_Content_Pass{1,2,3}_Patch_v1.0.1.md` · `Doc-8A_*_Freeze_Audit_v1.0.md` | Doc-8A authoring history (structure + 3 content passes, each Pass → Board Hard Review → Patch → closure check PASS; Structure + Content Freeze Audits PASS) |

**Doc-8B (Test Foundation & Harness) — FROZEN 2026-06-26** (`Doc-8B_SERIES_FROZEN_v1.0`): realizes Doc-8A §4/§10 + Appendix A bands H/I (A/B–G N/A) as the shared harness Doc-8C…8G consume by pointer (DR-8-HARNESS satisfied) — runner, ephemeral test DB (transaction-rollback + savepoint/schema-reset opt-out for Band-F atomicity / Band-C RLS), through-contracts fixtures/factories, ≥2-org seeding, seeded clock + dual ID mechanisms (UUIDv7 generated / `human_ref` via `core.id_sequences`), six out-of-wire mock doubles + **outbox observer/drainer** (`core.outbox_status`; dispatch `pending→dispatched` + distinct POLICY-bounded archival), CI merge-gate (never-weaken; necessary-not-sufficient). **D1 → `[ESC-8-TOOLING]` RESOLVED: Vitest + Playwright + TS-native transactional SQL** (single TypeScript toolchain; pgTAP not selected). Structure + 2 content passes each Hard-Reviewed + patched + closure-checked (0 BLOCKER/MAJOR/MINOR; realized-schema corrections vs Doc-6B `core.outbox_status`/`core.id_sequences`) + Freeze Audits PASS; `ERR-8A-1` second-order clarification folded in. Coins nothing.

**Doc-8C (Contract & API Conformance Suite) — FROZEN 2026-06-26** (`Doc-8C_SERIES_FROZEN_v1.0`): the first discipline suite; consumes the Doc-8B harness by pointer. **Table-driven (C1)** over the frozen Doc-5 caller-facing surface — a contract inventory **derived from the frozen `Doc-5x` enumerations** (5C 42·5D 71·5E 38·5F 50·5G 40·5H 23·5I 33·5J 34·5K 16·5B out-of-wire), cross-checked vs `Doc-5A Pass10 §B.1` + `generated-contracts-registry/`; **completeness check ≡ frozen surface**; **wired-only scope (C2)** (out-of-wire N/A-recorded with owning-suite pointer). Realizes Appendix A bands **A/B**: envelope/pagination/error/idempotency/prohibited-field/actor-scope+field-trace, each parameterized over the wired inventory. Seam: API actor-scope here / RLS+cross-tenant in Doc-8D. Authored-not-run (oracle frozen; exec awaits code). Structure + 2 content passes each Hard-Reviewed + patched + closure-checked (0 BLOCKER/MAJOR/MINOR) + Freeze Audits PASS. Coins nothing.

**Carried into Doc-8D…8G (per-suite gates):** `DR-8-HARNESS` **satisfied** (Doc-8B; consumed by pointer) · `DR-8-CONTRACT` **satisfied** (Doc-8C is the Doc-5 testability cross-check) · `DR-8-STATE` (Doc-4M drives state suites) · `DR-8-RLS` (mandatory byte-equivalence band) · `[ESC-8-TOOLING]` **RESOLVED** (Doc-8B D1) · `[ESC-8-API]` (additive Doc-5x patch) · `[ESC-8-CORPUS]` (corpus defect — flag-and-halt, never weaken the test) · `[ESC-8-POLICY]` (additive Doc-3 §12.2 patch) · `[ESC-8-SCOPE]`. **Per-suite oracle-readiness:** 8E oracle-ready now (Doc-2/3/4M frozen); 8D growing (Doc-6B+6C frozen — `core` + `identity` testable); 8F/8G await Doc-6/7. **Next:** Doc-8E (Domain/Invariant/State) and/or Doc-8D (Persistence/RLS).

---

## 5e. Implementation Planning (Development Decomposition — current phase)

> The bridge from the frozen corpus to application code. **Non-authoritative**; decomposes
> only — coins no architecture/API/schema/UI/event/permission/route/module/state/contract.
> The corpus's declared phase sequence is **Development Decomposition → Build Roadmap →
> Implementation (Code)**; this is the first step.

| File | Purpose |
|------|---------|
| `Development_Decomposition_v1.0.md` | **Development Decomposition** — translates the frozen corpus (Doc-2…Doc-8) into buildable work: engineering streams · per-module work packages (uniform WP template + Build Artifact Checklist) · cross-cutting work · repository bootstrap (Wave 0) · walking skeleton · **dependency-ordered implementation waves** (M0→M1 serial → M2/M5/M6/M7 parallel → M3 moat → M4/M8 → M9) · parallelization plan · acceptance gates (Doc-8 bands A–I) · engineering risks + build-time rollback · milestones. No dates/estimates. Every item traces by pointer to a frozen authority; gaps → `[ESC-*]`. **Next:** the Build Roadmap |
| `Build_Roadmap_v1.0.md` | **Build Roadmap** — the engineering *execution* plan that **sequences** the Development Decomposition into a gated build program: §0 summary · §1 build principles · §2 Repository Bootstrap (Wave 0) · §3 Walking Skeleton (Wave 1) · §4 module build waves (W2 M0→M1 · W3 M2/M5/M6/M7 parallel · W4 M3 moat · W5 M4/M8 · W6 M9) with per-wave Doc-8 suites + a reconciliation table to Decomposition §7 (finer re-partition, zero edge change) · §5 parallel streams · §6 merge strategy (one module scope per PR; multiple WP PRs) · §7 quality gates (DoR/DoD) · §8 engineering risks · §9 milestones incl. MVP-Ready/Production-Ready as engineering gate-states · §10 transition to code. No dates/estimates; coins nothing. **Final planning artifact before code — drives Wave 0.** |

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
