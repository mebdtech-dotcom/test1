# Doc-7F — Content Pass-3 (§8–§10 + Appendix) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7F_Content_v1.0_Pass3.md` (§8–§10 + Appendix) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Invariant #11 + Doc-5F/5K conformance |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- **§8 buyer-private CRM** ↔ BC-OPS-1 (verified `Doc-5F` line 41); **`read_crm_status_for_routing` internal-service / out-of-wire** (line 48) — never frontend-called; private exclusion invisible (Invariant #11). CORRECT — strong non-disclosure realization.
- §8.3 buyer status never mutates platform scores (firewall) — CORRECT.
- §9.2 R6/R7 firewall (no auto-decision incl. AI; quota = delivery ceiling) — CORRECT.
- §10.3 full Appendix A applies (richest surface) — CORRECT.

0 BLOCKER, 0 MAJOR — the CRM non-disclosure core is sound. Three binding refinements + one nit.

### MINOR-1 — §8 `confirm_vendor_link`/`dismiss_vendor_link` are buyer-private link-suggestion actions
`confirm_vendor_link`/`dismiss_vendor_link` (BC-OPS-1) act on **link suggestions** (connecting a buyer's private vendor record to a platform vendor profile). **Invariant #11** explicitly names **`link_suggestions`** as private/non-disclosed.
**Required fix:** §8 note these are **buyer-private link-suggestion** actions — the suggestion and its confirm/dismiss are **private to the buyer**, never exposed to the vendor or any shared surface (Invariant #11; non-disclosure-bound).

### MINOR-2 — §10.1 AI advisory panel does not bind specific Doc-5K reads (bind-or-ESC)
§10.1 composes the AI advisory panel "advisory only" but names no specific `Doc-5K` buyer read. The panel must bind a confirmed Doc-5K User advisory read.
**Required fix:** §10.1 state the AI panel **binds confirmed `Doc-5K` User advisory reads** (e.g. RFQ-draft assist / quotation summary, per the frozen Doc-5K surface); **if no buyer-relevant advisory read exists, the panel is absent or `[ESC-7-API]`** — never assumed. It remains **non-recommending** (R6) regardless.

### MINOR-3 — §10.4 the Doc-7C file-upload `[ESC-7-API]` applies to post-award document attachments
The post-award flow (PO / trade-invoice / WCC attachments) involves **file uploads**, which carry the unresolved **Doc-7C file-upload grant `[ESC-7-API]`** (no client-facing signed-URL contract in the frozen surface).
**Required fix:** §10.4 explicitly carry the **file-upload `[ESC-7-API]`** for post-award document attachments — blobs to Supabase Storage via the M0/Doc-4B mechanism; contract carries `file_ref` only (Doc-7C §8.2); a client-facing upload grant is `[ESC-7-API]`, not assumed.

### NITPICK-1 — §10.1 trust badge on quotations
The trust badge on a quotation's vendor binds the **Doc-5G public/User badge read** (as established in Doc-7D).
**Required fix:** note the quotation trust badge reuses the verified Doc-5G public-badge reads (`get_trust_score`/`get_performance_score`/`get_verified_tier`).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 vendor-link = buyer-private suggestion | MINOR | Content Patch — note non-disclosure |
| MINOR-2 AI panel Doc-5K bind-or-ESC | MINOR | Content Patch — bind or omit/ESC |
| MINOR-3 file-upload ESC on attachments | MINOR | Content Patch — carry ESC |
| NITPICK-1 quotation trust badge | NIT | Content Patch — note Doc-5G reads |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR. 3 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7F FROZEN.

*End of Content Pass-3 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — the buyer-private CRM non-disclosure (Invariant #11) is correctly realized incl. the invisible private-exclusion mechanism (`read_crm_status_for_routing` internal-service).*
