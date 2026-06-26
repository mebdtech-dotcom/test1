# Doc-7F — Buyer Workspace — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7F** — the Buyer Workspace (the moat surface) |
| Program | **Doc-7 — Frontend Realization** |
| Realizes | the **Buyer-leg** of frozen **Doc-5E** (§4/§5/§6/§7) + **Doc-5F** (BC-OPS-1 CRM · BC-OPS-2/4/5 buyer-leg) + **Doc-5D** (discovery + favorites), on Doc-7C `(app)`, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (FR11) |
| Coins | **Nothing** — binds frozen Buyer-leg by pointer; never invokes the engine; carries the file-upload `[ESC-7-API]` |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7F_Structure_v1.0_FROZEN` (= Proposal v0.1 + Patch v0.1.1) |
| Content §0–§3 | `Doc-7F_Content_v1.0_Pass1` + `Doc-7F_Content_Pass1_Patch_v1.0.1` |
| Content §4–§7 | `Doc-7F_Content_v1.0_Pass2` + `Doc-7F_Content_Pass2_Patch_v1.0.1` |
| Content §8–§10 + Appendix | `Doc-7F_Content_v1.0_Pass3` + `Doc-7F_Content_Pass3_Patch_v1.0.1` |
| Freeze gates | `Doc-7F_Structure_Freeze_Audit_v1.0` · `Doc-7F_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7F_Structure_Independent_Hard_Review_v0.1` · `Doc-7F_Content_Pass{1,2,3}_Independent_Hard_Review_v1.0` |

---

## What Doc-7F fixes (summary — authoritative text is the effective set)

**The moat, guarded end-to-end:**
- **R6 no-auto-decision** — the comparison statement is read-only decision support (engine-generated); **`award_rfq` is a deliberate, unranked buyer choice**; **the UI and the AI advisory panel NEVER recommend / rank-to-winner / auto-select** (Invariant #12).
- **Engine out-of-wire** — the buyer **never invokes matching/routing/wave/comparison-generation/`expire_rfq`** and **never sends an invitation** (the engine generates invitations); discovery (`search_catalog`/`list_vendor_directory`/favorites) is **research/reference** for RFQ authoring. `get_matching_results` (Admin/internal) is **not bound** — the buyer sees the **positive routing outcome only** (invited vendors + reasons), never excluded vendors (R5).
- **R7 firewall** — payment/entitlement never influences matching/routing/selection; the **quota indicator = delivery ceiling**, never a matching-eligibility gate.
- **R8 money-boundary** — post-award docs are **records/workflow, never settlement**; the **vendor issues the trade invoice, the buyer receives/approves/pays** (`record_payment`/`confirm_payment`); a trade invoice ≠ the platform billing invoice (Doc-7E).
- **Buyer-private CRM never leaks** (Invariant #11) — status/notes/rating/approved/**blacklist**/link-suggestions render **only in the buyer's workspace**; never mutate platform scores; the **private exclusion is invisible** (`read_crm_status_for_routing` is internal-service/out-of-wire — the routing engine reads CRM privately; the frontend never calls it).

**Bindings:** discovery (Doc-5D) · RFQ authoring + role-gated internal approval (Doc-5E §4) · routing/invitation observability (Doc-5E §7 caller legs) · quotation viewing (Doc-5E §5, visibility-gated) · comparison & award (Doc-5E §6) · post-award ops (Doc-5F BC-OPS-2/4/5 **buyer-leg**; engagement System-created on award — R7 seam) · buyer-private CRM (Doc-5F BC-OPS-1). State machines per Doc-4M; System transitions displayed not invoked. Data via the Doc-7C server-side wired client; currency-per-field default BDT.

**Conformance:** full Appendix A applies (richest surface). **Composed embedded components:** trust badge (Doc-5G) · quota indicator (Doc-5I, delivery ceiling) · AI panel (Doc-5K, **non-recommending**, bind-or-ESC) · M6 thread.

---

## Carried into Doc-7G…7H

`DR-7-SHELL` · `DR-7-API` · `DR-7-STATE` · `[ESC-7-API]` (incl. **file-upload grant** for post-award attachments) · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]`. Resolved only via named channels.

**Next deliverable:** **Doc-7G — Vendor Workspace** — invitation inbox, quotation authoring/versioning, vendor profile & microsite management, lead pipeline (realizes `Doc-5E` vendor-leg + `Doc-5D` vendor presentation + `Doc-5F` vendor-leg incl. `issue_trade_invoice`/challan/`record_delivery`/BC-OPS-3 lead pipeline). **Carries the load-bearing byte-equivalence non-disclosure attestation** — a blacklisted vendor's experience is byte-equivalent to a non-matched vendor's (the blacklist is undetectable).

*End of Doc-7F SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7F realizes the Buyer Workspace (moat) over the frozen Doc-5E/5F/5D Buyer surfaces; no auto-decision (incl. AI); never invokes the engine; buyer-private CRM never leaks; handles no money; coins nothing.*
