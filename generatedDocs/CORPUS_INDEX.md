# iVendorz — Architecture Corpus Index

**Document type:** Navigation index for `generatedDocs/`. Non-authoritative.
**Date:** 2026-06-23
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
- **Authoritative:** `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` + patches `Doc-3_Patch_v1.0.2.md`, `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (effective v1.0.2)

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
| `Doc-5E_Structure_v1.0_FROZEN.md` (M3 `rfq`) | **Doc-5E STRUCTURE FROZEN** — canonical TOC realizing Doc-4E (38 contracts) on HTTP; matching/routing engine out-of-wire (R1); R1–R7 + DE-1…DE-8. Content passes next (3) |
| `Doc-5E_Structure_Proposal_v0.1.md` | Doc-5E structure authoring history (v0.2; Hard Review — 3 MAJOR + 6 MINOR + 4 NITPICK resolved) |

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
