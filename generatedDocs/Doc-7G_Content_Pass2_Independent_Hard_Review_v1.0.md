# Doc-7G — Content Pass-2 (§6–§11 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7G_Content_v1.0_Pass2.md` (§6–§11 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · byte-equivalence (Invariant #11) + Doc-5E/5F leg conformance |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- §6/§7 Doc-5E §5 vendor (invitation response, quotation authoring, visibility-gated) — CORRECT.
- §8 Doc-5F BC-OPS-3 lead pipeline (System-created leads, R7) — CORRECT.
- §9 `issue_trade_invoice` vendor-leg; money-boundary R8 — CORRECT.
- **§10 byte-equivalence attestation** — received-only (§6.2/§8.3); **analytics denominator = submitted, never all-RFQs** (§10.3); no buyer-private signal (§10.4) — CORRECT (the load-bearing attestation is well realized).

0 BLOCKER, 0 MAJOR — the byte-equivalence core is sound. Three refinements + one nit.

### MINOR-1 — §7.3 sharpen the "not-awarded" outcome non-disclosure
§7.3 says the vendor sees "awarded / not-awarded." Sharpen: a **not-awarded** outcome must **not** reveal the **winning vendor's identity**, their quotation, or the buyer's **comparison ranking** — the vendor sees **only its own quotation's** Doc-4M outcome state, never a competitive comparison (the comparison/award is the buyer's, Doc-7F).
**Required fix:** §7.3 state the vendor sees **only its own quotation's outcome** (per Doc-4M); never the winner's identity/quotation, never the ranking — no competitive disclosure.

### MINOR-2 — §9.1 confirm vendor-issued vs buyer-issued engagement documents
§9.1 binds "delivery **challan** via `issue_engagement_document` vendor leg." BC-OPS-2 `issue_engagement_document` is two-sided; confirm the document split — **vendor-issued** (delivery challan, vendor-side docs) vs **buyer-issued** (PO, LOI — Doc-7F); a **WCC** may be **buyer-certified** (the buyer certifies completion) or vendor-submitted-for-approval.
**Required fix:** §9.1 confirm each engagement document's actor leg at content; bind the **vendor-issued** documents here (challan; vendor-submitted docs), the buyer-issued/certified ones are Doc-7F; WCC leg confirmed (bind-or-ESC).

### MINOR-3 — §11.1 quota indicator: the quotation allowance is the three-instrument quotation-quota
§11.1 lists "lead/quotation allowance" as a quota. Pin it: the **quotation-quota** is the three-instrument accounting identity (`Doc-3 §4.1.1` — entitlement ≠ delivery ≠ quotation-quota); it gates **quotation submission** (QUOTA 403 on exceed) as a **billing/delivery feature**, **never** a matching/eligibility gate (R7).
**Required fix:** §11.1 distinguish the quotation/delivery quota (billing feature, QUOTA) from the matching firewall; consistent with Pass-1 §5.2 (billing never gates matching).

### NITPICK-1 — §10.2 note the notification center byte-equivalence
The Doc-7C/M6 **notification center** is also byte-equivalence-bound for the vendor — **absence of an invitation-notification is non-disclosed** (no notification = non-match or exclusion, undetectable).
**Required fix:** §10.2 add the notification center to the byte-equivalence surfaces.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 not-awarded non-disclosure | MINOR | Content Patch — own-outcome-only |
| MINOR-2 engagement document legs | MINOR | Content Patch — confirm vendor-issued |
| MINOR-3 quotation-quota three-instrument | MINOR | Content Patch — pin billing feature |
| NITPICK-1 notification byte-equivalence | NIT | Content Patch — add surface |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 3 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7G FROZEN.

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — the load-bearing byte-equivalence attestation (incl. the analytics-denominator guard) is correctly realized; three refinements harden outcome/notification non-disclosure and the quota distinction.*
