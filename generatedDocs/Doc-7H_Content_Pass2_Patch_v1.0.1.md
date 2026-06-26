# Doc-7H — Content Pass-2 **Patch v1.0.1** (applies Pass-2 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7H_Content_v1.0_Pass2.md` (§8–§11 + Appendix) |
| Applies | `Doc-7H_Content_Pass2_Independent_Hard_Review_v1.0.md` (1 MAJOR + 2 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-2 **+ this patch** = clean §8–§11 + Appendix |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Freeze Audit → Doc-7H FROZEN |
| Discipline | Additive; nothing coined; Doc-5G surface + event framing corrected against the frozen surface |

---

## Changes

### C-1 — closes **MAJOR-1** (bind full Doc-5G Admin surface + correct event framing)
**Verified `Doc-5G` (lines 46–55, R7).** §8 amended — the **Trust governance** leg binds the **full Doc-5G Admin surface**:
- **Verification (BC-TRUST-1):** `assign_verification`, **`decide_verification`** (→ emits **`VendorVerified`**, R7), `revoke_verification`; **verified-tier governance** `set_verified_tier`/`confirm_verified_tier`/`suspend_verified_tier`/`downgrade_verified_tier`; staff reads `get_verification`/`list_verifications`. *(The Pass-1 §6.2 ESC is RESOLVED: the M5 Trust decision is `decide_verification` — distinct from the M8 `decide_verification_task` workflow.)*
- **Score publication (BC-TRUST-2/3):** `freeze_/reactivate_trust_score`, `freeze_/reactivate_performance_score` — **publication/ranking only** (R5).
- **Fraud signals (BC-TRUST-4):** `create_/review_/action_/dismiss_fraud_signal` + staff reads — **staff-only** (R10/R12).
- **Review moderation (BC-TRUST-5):** `moderate_review`/`publish_review` (→ review ingestion, R9)/`remove_review`/`set_admin_rating`.

**Event framing corrected (§3.2 + §8 + §11):** **M8 (Doc-5J) emits exactly one Doc-2 §8 event (`VendorBanned`)** — that is the M8-scoped fact. **The Admin Console (Doc-7H) additionally drives owning-module events via cross-module Admin commands** — **`VendorVerified`** (Doc-5G `decide_verification`) and **review ingestion** (Doc-5G `publish_review`, R9). **The console emits nothing itself**; it invokes the owning module's command, and the **owning module emits** its event (Admin-decides / owning-module-owns).

### C-2 — closes **MINOR-1** (verified-tier governance vs score-edit)
§9.3 amended: the Admin **decides verification** (`decide_verification`) and **sets the verified financial TIER** (`set_/confirm_/suspend_/downgrade_verified_tier` — Admin governance, R7) — these are **verification decisions, not score edits**. The **computed trust/performance SCORES are System-only** (R5 — never hand-edited; `freeze_/reactivate` = publication/ranking only). The console **never edits a computed score value**.

### C-3 — closes **MINOR-2** (Admin public + staff-internal view)
§11.1 amended: the Admin's view spans the **public trust badge** (`Doc-5G` badge read) **and** the **staff-internal** verification case detail / fraud signals / admin ratings (`Doc-5G R10` staff reads — §8). The staff-internal detail renders **only** in the Admin console, never on a tenant surface.

### C-4 — closes **NITPICK-1** (matching observability)
§8 note: the Admin's `get_matching_results` (Doc-5E §7 Admin) is **governance observability** (to assist routing rules) and remains **non-disclosing of protected facts beyond the governance scope** (R5).

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 Doc-5G under-bound + events | MAJOR | C-1: full BC-TRUST-1…5 Admin bound; decide_verification→VendorVerified; console drives owning-module events (M8=VendorBanned only) | **CLOSED** — surface complete; event framing correct |
| MINOR-1 verified-tier vs score | MINOR | C-2: Admin decides verification/tier; computed scores System-only | **CLOSED** |
| MINOR-2 public + staff view | MINOR | C-3: badge + staff-internal detail | **CLOSED** |
| NITPICK-1 matching observability | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** The full Doc-5G Admin governance surface is bound; the event framing is correct (M8 emits `VendorBanned`; the console drives `VendorVerified`/review-ingestion via Doc-5G Admin commands — the owning module emits). The Pass-1 verification-decision ESC is resolved (`decide_verification`). Nothing coined; no score hand-edited.

**Doc-7H content (§0–§11 + Appendix) is now complete across Pass-1/2, both loops PASS.** Next: **Content Freeze Audit** → consolidate Doc-7H FROZEN → **Doc-7 surfaces (7A–7H) COMPLETE**.

*End of Content Pass-2 Patch v1.0.1 + Short Closure Check. Effective §8–§11 + Appendix = Pass-2 + this patch. Additive; nothing coined; Doc-5G surface + event framing corrected.*
