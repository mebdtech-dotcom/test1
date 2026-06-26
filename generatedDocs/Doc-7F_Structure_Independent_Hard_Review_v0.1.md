# Doc-7F — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7F_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · moat-invariant + Doc-5E actor-leg conformance |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- **Doc-5E Buyer-leg** §4 (`create_rfq`…`reissue_rfq`), §6 (`shortlist_quotation`/`manage_clarification`/`invoke_best_and_final`/**`award_rfq`**/`close_lost_rfq`/`get_comparison_statement`), §5 quotation reads (visibility-gated) — verified vs `Doc-5E` lines 37/40–44. CORRECT.
- **R6 no-auto-decision** (award explicit; no recommendation/auto-winner; `Doc-3 §9.1` FIXED), **R7 firewall** (payment never influences matching), **engine §8 out-of-wire** — all correctly applied (FR5/FR3/FR10).
- **R5 non-disclosing explainability**; **Doc-5F R8 money-boundary**; **BC-OPS-1 buyer-private CRM + Invariant #11** — correctly invoked (FR3/FR6/FR7).

0 BLOCKER. One moat-at-the-AI-boundary gap (MAJOR) + three actor/firewall refinements + one nit.

### MAJOR-1 — FR11 AI advisory panel must explicitly never present a winner recommendation (R6 at the AI boundary)
FR11 composes the **AI advisory panel** (`Doc-5K`) on the buyer workspace, "advisory only, non-gating." But on the **comparison/award flow**, an AI panel that surfaces a **"recommended winner," a ranking-to-winner, or an auto-selection** would **violate R6** (`Doc-5E R6` / `Doc-3 §9.1` FIXED: the platform **never** auto-recommends/auto-selects a winner — **no recommendation endpoint**). The AI advisory is the most likely vector to smuggle a recommendation into the moat.
**Required fix:** FR5/FR11 state explicitly — the AI advisory panel on the comparison/award flow **may summarize/draft/explain quotations** but **NEVER presents a winner recommendation, a ranking-to-winner, an auto-selection, or a "recommended vendor"** (R6; Invariant #12 — AI suggests, the buyer decides). The AI panel is subject to R6 like every other surface; award stays a deliberate, unranked buyer choice.

### MINOR-1 — FR3 binds `get_matching_results` as a buyer read; it is the **Admin leg** + internal-service
**Verified `Doc-5E` line 46/48:** `get_matching_results` is the **Admin leg** (+ an internal-service read leg → §8), **not** a buyer caller read. The buyer's **observability caller legs** are `get_routing_log`, `get_invitation`, `list_invitations`.
**Required fix:** FR3 **remove `get_matching_results`** from the buyer observability binding (the buyer does not see raw matching results — anti-gaming / R5); bind the verified caller legs `get_routing_log` / `get_invitation` / `list_invitations`. If a buyer-leg matching read is required, it is `[ESC-7-API]`, not assumed.

### MINOR-2 — FR6 post-award docs are two-sided; clarify the buyer-leg binding
Doc-5F is **two-sided** (buyer + vendor legs). Post-award documents split: some **buyer-issued** (e.g. PO, payment record), some **vendor-issued / buyer-received-and-approved** (e.g. challan, invoice, WCC).
**Required fix:** FR6 state — Doc-7F binds the **buyer-leg** (documents the buyer **issues** + documents the buyer **receives/approves**); the **vendor-leg is Doc-7G**; each post-award document is bound per its Doc-5F buyer/vendor actor leg at content (bind-or-ESC). Money-boundary R8 holds throughout (records, not settlement).

### MINOR-3 — FR10 quota indicator must be a delivery ceiling, never a matching-eligibility gate (R7)
FR10 says "billing quota is read as a delivery ceiling." Sharpen: per **R7** the quota limits **delivery** (how many invitations/quotations the buyer's plan allows), and **never** gates **matching eligibility** or a vendor's inclusion — payment never influences the matching/routing/selection (`Doc-3 §4.1.1` three-instrument identity).
**Required fix:** FR10/FR11 state the quota indicator shows the **delivery ceiling** only; it **never** presents a vendor as excluded-by-quota and never gates matching eligibility (R7 firewall).

### NITPICK-1 — FR5 clarification flow uses the M6 thread
`manage_clarification` (Doc-5E §6) drives a buyer↔vendor clarification that renders in the **M6 conversation thread** (`Doc-5H`, the composed embedded component, FR11).
**Required fix:** note the clarification UI = `manage_clarification` (Doc-5E command) + the M6 RFQ/clarification **thread** (composed from Doc-7B/Doc-7C), non-disclosure-bound.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 AI never recommends a winner (R6) | MAJOR | Structure Patch — FR5/FR11 explicit |
| MINOR-1 get_matching_results Admin/internal | MINOR | Structure Patch — bind caller legs only |
| MINOR-2 post-award two-sided buyer-leg | MINOR | Structure Patch — clarify legs |
| MINOR-3 quota = delivery ceiling not eligibility gate | MINOR | Structure Patch — R7 sharpen |
| NITPICK-1 clarification via M6 thread | NIT | Structure Patch — note |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7F Structure Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR guards the no-auto-decision moat at the AI boundary — the highest-risk vector for smuggling a recommendation into the buyer's award.*
