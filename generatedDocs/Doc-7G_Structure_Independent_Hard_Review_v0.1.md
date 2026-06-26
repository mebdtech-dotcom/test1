# Doc-7G — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7G_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · byte-equivalence (Invariant #11) + Doc-5E/5D/5F actor-leg conformance |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- **Doc-5E §5 Vendor** (`respond_to_invitation`, `submit_/revise_/withdraw_quotation`, `request_late_extension`; quotation reads visibility-gated) — verified lines 40–42. CORRECT.
- **Doc-5D BC-MKT-1/2/3/5** vendor profile/catalog/ads; **draft projection R5** (GR3) — CORRECT.
- **Doc-5F BC-OPS-3** lead pipeline (System-created leads, R7); **`issue_trade_invoice` = vendor leg** (correctly here, moved from Doc-7F) — CORRECT.
- **Score firewall** (vendor declares tier, reads scores, never mutates) + capability matrix (Invariant #1) — CORRECT.

0 BLOCKER. One byte-equivalence leak vector (MAJOR) + three actor/dependency refinements + one nit.

### MAJOR-1 — the byte-equivalence attestation is unguarded at the **analytics/metrics vector**
GR11 forbids exposing exclusion in "view/count/analytic," but GR12 does not constrain the **vendor's own analytics/metrics**, which is the **highest-risk leak vector**: a metric with a **denominator of all matchable RFQs** (e.g. "you were invited to 3 of 10 RFQs in your category," or a win-rate over all-RFQs-not-just-submitted) **reveals** that the vendor was **not invited** to the other 7 — leaking exclusion/non-match (Invariant #11 violation).
**Required fix:** add to GR11/GR12 — vendor analytics/metrics expose **only positive facts** (invitations **received**, quotations **submitted**, awards **won on submitted quotations**); **a win/conversion rate's denominator is submitted quotations, never all-matchable RFQs**; **no metric includes a count of RFQs not-invited-to or matched-against**. Absence is uniformly non-disclosed across every metric. This is the byte-equivalence guard at the analytics surface (the document's load-bearing obligation).

### MINOR-1 — GR2 `claim_vendor_profile` carries the Doc-5D DD-7 dependency
`claim_vendor_profile` (BC-MKT-1) carries the tracked **DD-7** dependency (`Doc-5D` — claim flow).
**Required fix:** GR2 note `claim_vendor_profile` carries **`Doc-5D` DD-7** (tracked); the claim UI is bound subject to its carried dependency (reference by pointer, not re-decided here).

### MINOR-2 — GR9 `update_trade_invoice_status` actor leg unspecified
The vendor **issues** the trade invoice (`issue_trade_invoice`); `update_trade_invoice_status` may be **two-sided** (vendor revises / buyer approves).
**Required fix:** GR9 confirm each BC-OPS-2 status command's actor leg — bind the **vendor-leg** (issue + vendor-side status); the **buyer-side approval** (`update_trade_invoice_status` buyer leg) is **Doc-7F**. Bind-or-ESC per leg.

### MINOR-3 — GR3 microsite publish/unpublish commands need binding confirmation
GR3 references `publish_*`/`unpublish_*` driving the draft→published transition but doesn't bind the specific BC-MKT-4 vendor commands.
**Required fix:** GR3 bind the specific **BC-MKT-4 vendor presentation + publish/unpublish commands** at content (bind-or-ESC); the vendor manages the **draft (controlling-org) projection**; the published projection renders in Doc-7D.

### NITPICK-1 — GR12 trust badge: vendor reads its **own** trust
GR12 says the vendor reads "its own trust/performance." Confirm the vendor's own-trust read (Doc-5G own-org/User read) vs the public badge.
**Required fix:** note the vendor reads its own trust/performance/verified-tier via the appropriate `Doc-5G` read (own-org/User), read-only (never mutates — score firewall).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 byte-equivalence at analytics vector | MAJOR | Structure Patch — guard GR11/GR12 |
| MINOR-1 claim_vendor_profile DD-7 | MINOR | Structure Patch — note dependency |
| MINOR-2 update_trade_invoice_status leg | MINOR | Structure Patch — confirm leg |
| MINOR-3 microsite publish commands | MINOR | Structure Patch — bind BC-MKT-4 |
| NITPICK-1 vendor own-trust read | NIT | Structure Patch — note |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7G Structure Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR guards the load-bearing byte-equivalence attestation at the analytics/metrics vector — a denominator over all-matchable-RFQs would leak exclusion, breaking "blacklist undetectable" (Invariant #11).*
