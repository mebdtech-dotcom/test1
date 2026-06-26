# Doc-7F — Structure **Patch v0.1.1** (applies Independent Hard Review v0.1) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7F_Structure_Proposal_v0.1.md` |
| Applies | `Doc-7F_Structure_Independent_Hard_Review_v0.1.md` (1 MAJOR + 3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Proposal v0.1 **+ this patch** = freeze-ready structure |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Structure Freeze Audit → `Doc-7F_Structure_v1.0_FROZEN` |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MAJOR-1** (AI never recommends a winner — R6 at the AI boundary)
FR5 + FR11 amended (the moat guard):
> The **AI advisory panel** (`Doc-5K`) on the comparison/award flow **may summarize, draft, or explain quotations**, but **NEVER presents a winner recommendation, a ranking-to-winner, an auto-selection, or a "recommended vendor"** (`Doc-5E R6`; `Doc-3 §9.1` FIXED — no recommendation; Invariant #12 — AI suggests, the buyer decides). The AI panel is subject to R6 like every other surface; **`award_rfq` stays a deliberate, unranked buyer choice**. No AI output ranks-to-winner or gates the award.

### C-2 — closes **MINOR-1** (get_matching_results Admin/internal)
**Verified `Doc-5E` line 46/48:** `get_matching_results` = **Admin leg** + internal-service (§8). FR3 amended: the buyer observability binds the verified **caller legs `get_routing_log` / `get_invitation` / `list_invitations`** only; **`get_matching_results` is removed** (Admin/internal — anti-gaming; R5). A buyer-leg matching read, if ever required, is **`[ESC-7-API]`**, not assumed.

### C-3 — closes **MINOR-2** (post-award two-sided)
FR6 amended: Doc-7F binds the **buyer-leg** of post-award documents — those the buyer **issues** (e.g. PO, payment record) **and** those the buyer **receives/approves** (e.g. challan, invoice, WCC). The **vendor-leg is Doc-7G**. Each document is bound per its **Doc-5F buyer/vendor actor leg at content** (bind-or-ESC). **Money-boundary R8** holds throughout — post-award docs are records/workflow, never settlement/escrow; a trade invoice is a record (≠ platform billing invoice).

### C-4 — closes **MINOR-3** (quota = delivery ceiling, not eligibility gate)
FR10 + FR11 amended: the **billing/quota indicator** shows the **delivery ceiling** only (how many invitations/quotations the buyer's plan allows — three-instrument identity `Doc-3 §4.1.1`); it **never** presents a vendor as excluded-by-quota and **never gates matching eligibility** — payment never influences matching/routing/selection (**R7 firewall**).

### C-5 — closes **NITPICK-1** (clarification via M6 thread)
FR5 note: the clarification flow = **`manage_clarification`** (Doc-5E §6 Buyer command) + the **M6 RFQ/clarification thread** (`Doc-5H`, the composed embedded component from Doc-7B/Doc-7C — FR11), non-disclosure-bound.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 AI never recommends a winner | MAJOR | C-1: FR5/FR11 — AI summarizes, never ranks-to-winner/recommends/selects (R6) | **CLOSED** — moat guarded at the AI boundary |
| MINOR-1 get_matching_results | MINOR | C-2: removed; caller legs (routing-log/invitation) only | **CLOSED** |
| MINOR-2 post-award two-sided | MINOR | C-3: buyer-leg (issue + receive/approve); vendor-leg = 7G | **CLOSED** |
| MINOR-3 quota delivery ceiling | MINOR | C-4: delivery ceiling only, never eligibility gate (R7) | **CLOSED** |
| NITPICK-1 clarification thread | NIT | C-5 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** The no-auto-decision moat is now guarded at the AI boundary; actor-leg bindings verified (matching results Admin/internal, not buyer); post-award legs and the R7 firewall sharpened. Nothing coined.

**Next:** Structure Freeze Audit → `Doc-7F_Structure_v1.0_FROZEN` → Doc-7F content passes (the moat surface; likely 2–3 passes), through the same loop.

*End of Doc-7F Structure Patch v0.1.1 + Short Closure Check. Effective structure = Proposal v0.1 + this patch. Additive; nothing coined; no frozen document edited.*
