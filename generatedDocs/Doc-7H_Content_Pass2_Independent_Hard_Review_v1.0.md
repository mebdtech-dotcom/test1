# Doc-7H — Content Pass-2 (§8–§11 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7H_Content_v1.0_Pass2.md` (§8–§11 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5G Admin-governance completeness + event framing |
| Verdict | **NOT YET PASS** — 1 MAJOR + 2 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- §8 cross-module legs (ad review, category, plan catalog incl. `activate_plan`, routing control, identity governance, support) — owning-module Admin commands. CORRECT.
- §9 Admin-decides/owning-module-owns (R5); moat (R7); score firewall (no score write) — CORRECT framing.
- §10 no active-org; staff-internal non-disclosure (Doc-5G R10) — CORRECT.
- §11.3 conformance mapping (010 N/A; 012 APPLIES-assert; 011 staff-slug) — CORRECT (carries structure C-2).

0 BLOCKER. One Doc-5G-completeness + event-framing defect (MAJOR) + two refinements + one nit.

### MAJOR-1 — §8 under-binds the Doc-5G Admin governance surface, and the "single event" framing is M8-scoped, not console-scoped
**Verified `Doc-5G` (lines 46–55, R7):** the M5 Admin governance surface is **large** and the Trust verification **decision** exists — **`decide_verification`** (BC-TRUST-1 Admin) — and **emits `VendorVerified`**. The full Doc-5G Admin surface the Admin Console must bind:
- **BC-TRUST-1:** `assign_verification` / **`decide_verification`** (→ `VendorVerified`) / `revoke_verification`; **verified-tier governance** `set_verified_tier`/`confirm_verified_tier`/`suspend_verified_tier`/`downgrade_verified_tier`; staff reads `get_verification`/`list_verifications`.
- **BC-TRUST-2/3:** `freeze_/reactivate_trust_score`, `freeze_/reactivate_performance_score` (publication/ranking only — R5).
- **BC-TRUST-4:** `create_/review_/action_/dismiss_fraud_signal` + staff reads (**staff-only — R10/R12**).
- **BC-TRUST-5:** `moderate_review`/`publish_review` (→ review ingestion, R9)/`remove_review`/`set_admin_rating`.

§8 bound only `freeze_/reactivate_trust_score` + a vague "verification-decision if distinct." **Two defects:**
1. **Under-binding:** the fraud-signal surface (BC-TRUST-4), review moderation (BC-TRUST-5), verification decide/revoke, and verified-tier governance (BC-TRUST-1) are all **missing** from §8.
2. **Event framing wrong (§3.2 / §8):** the structure/Pass-1 said `VendorBanned` is "the only event any Doc-7H surface drives." That is **M8-scoped** (Doc-5J emits exactly one event). But the **Admin Console drives owning-module events via cross-module legs** — **`decide_verification` → `VendorVerified`** (Doc-5G R7) and **`publish_review` → ingestion** (R9). The console **invokes** the owning module's command; the **owning module emits** its event.

**Required fix:**
- §8 **bind the full Doc-5G Admin governance surface** (BC-TRUST-1…5 Admin: verification decide/revoke + verified-tier governance; trust/performance score freeze/reactivate publication-only; fraud signals staff-only; review moderation). The **M5 `decide_verification` is the Trust decision** (distinct from the M8 `decide_verification_task` workflow — Pass-1 §6.2 ESC **RESOLVED**: `decide_verification` exists).
- Correct the **event framing**: **M8 (Doc-5J) emits exactly one event (`VendorBanned`)**; the **Admin Console additionally drives owning-module events through cross-module Admin commands** (`VendorVerified` via Doc-5G `decide_verification`; review ingestion via `publish_review`). The console emits nothing itself — the owning module emits.

### MINOR-1 — §9.3 distinguish verified-TIER governance from score-editing
§9.3 says "writes no governance score." Sharpen: the Admin **decides verification and sets the verified financial TIER** (`set_/confirm_/suspend_/downgrade_verified_tier`, `decide_verification` — Admin governance, R7); but the **computed trust/performance SCORES are System-only** (R5 — never hand-edited; `freeze_/reactivate` = publication only). The Admin decides verification/tier; it **never edits a computed score value**.
**Required fix:** §9.3 distinguish — Admin **decides** verification + sets verified tier (governance); the **computed scores stay System-only** (no hand-edit; publication-only freeze/reactivate).

### MINOR-2 — §11.1 Admin sees public badge + staff-internal detail
§11.1 trust badge says "Admin reads the vendor's trust." Clarify the Admin sees **both** the public trust badge **and** the **staff-internal** verification case detail / fraud signals / admin ratings (`Doc-5G R10` staff reads — §8) — the latter never on a tenant surface.
**Required fix:** §11.1 note the Admin's view spans the public badge **+** staff-internal verification/fraud detail (staff-only).

### NITPICK-1 — §8 `get_matching_results` Admin observability
Note the Admin's `get_matching_results` is **governance observability** (to assist routing rules) and remains **non-disclosing of protected facts beyond the governance scope** (R5).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 Doc-5G under-bound + event framing | MAJOR | Content Patch — bind full BC-TRUST Admin; correct events |
| MINOR-1 verified-tier vs score-edit | MINOR | Content Patch — distinguish |
| MINOR-2 Admin public + staff-internal view | MINOR | Content Patch — note |
| NITPICK-1 matching observability | NIT | Content Patch — note |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 1 MAJOR + 2 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7H FROZEN.

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a real completeness + correctness defect: the full Doc-5G Admin governance surface must be bound, and the console drives owning-module events (VendorVerified, review ingestion) beyond M8's single VendorBanned.*
