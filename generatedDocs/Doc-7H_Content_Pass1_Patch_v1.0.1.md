# Doc-7H — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7H_Content_v1.0_Pass1.md` (§0–§7) |
| Applies | `Doc-7H_Content_Pass1_Independent_Hard_Review_v1.0.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§7 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§8–§11 + Appendix) |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MINOR-1** (moderation-decision ≠ ban)
§2/§3 note added: `decide_moderation_case` (BC-ADM-1) records the **moderation outcome**; a **ban is a separate, explicit `issue_ban`** (BC-ADM-2) — **not automatic** from a moderation decision. The two are distinct surfaces/commands (only `issue_ban` emits `VendorBanned`).

### C-2 — closes **MINOR-2** (M8 link ≠ buyer-private link)
§4.2 amended: the M8 `confirm_/dismiss_link_suggestion` (BC-ADM-3) is the **Admin's staff-internal link triage** (`Doc-5J R6`) — never exposed to a tenant. It is **distinct** from the **buyer-private CRM vendor-link** (`confirm_/dismiss_vendor_link`, Doc-5F BC-OPS-1, realized in Doc-7F §8.5, private to the buyer). Both are non-disclosure-bound but are **different surfaces with different owners**; the Admin console never surfaces a buyer's private CRM link.

### C-3 — closes **MINOR-3** (async accepted-then-poll)
§5.1 amended: `submit_import_job` create-then-poll uses the **async accepted-then-poll** surface (`Doc-5A §10` — **202 Accepted + poll the status resource**), **not** the §6 error envelope (`ASYNC_PENDING` is not an error class — `Doc-7A §5.3`). Progress renders via the Doc-7B loading/status primitives; `process_import_job` is System (§10), never run by the console.

### C-4 — closes **NITPICK-1** (§2.2 phrasing)
§2.2 rephrased: "the case **references a target by ID**; the Admin has **no active-org**" (consistent with §1's act-ON-target-by-ID model).

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 moderation ≠ ban | MINOR | C-1: separate commands; only issue_ban → VendorBanned | **CLOSED** |
| MINOR-2 M8 link ≠ buyer link | MINOR | C-2: staff-internal triage vs buyer-private CRM link (distinct owners) | **CLOSED** |
| MINOR-3 async import path | MINOR | C-3: 202 + poll status resource (Doc-5A §10), not error | **CLOSED** |
| NITPICK-1 §2.2 phrasing | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** Cross-surface distinctness sharpened (moderation≠ban; M8-link≠buyer-link); async import pinned to the accepted-then-poll surface. Nothing coined.

**Next pass:** Content Pass-2 (§8–§11 + Appendix) — cross-module Admin governance legs (§8), Admin-decides/owning-module-owns & firewalls (§9), state-machine/no-active-org/non-disclosure (§10), composition/data/conformance (§11), skeleton (Appendix). **On freeze → Doc-7 surfaces (7A–7H) COMPLETE.**

*End of Content Pass-1 Patch v1.0.1 + Short Closure Check. Effective §0–§7 = Pass-1 + this patch. Additive; nothing coined; no frozen document edited.*
