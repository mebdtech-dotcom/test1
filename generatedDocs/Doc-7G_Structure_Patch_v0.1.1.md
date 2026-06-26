# Doc-7G — Structure **Patch v0.1.1** (applies Independent Hard Review v0.1) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7G_Structure_Proposal_v0.1.md` |
| Applies | `Doc-7G_Structure_Independent_Hard_Review_v0.1.md` (1 MAJOR + 3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Proposal v0.1 **+ this patch** = freeze-ready structure |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Structure Freeze Audit → `Doc-7G_Structure_v1.0_FROZEN` |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MAJOR-1** (byte-equivalence at the analytics vector)
GR11 + GR12 amended (the load-bearing guard, extended to analytics):
> Vendor analytics/metrics expose **only positive facts** — invitations **received**, quotations **submitted**, awards **won on submitted quotations**, profile/microsite views. **A win/conversion rate's denominator is the vendor's submitted quotations (or received invitations), NEVER all-matchable RFQs.** **No metric, count, chart, or export includes a count of RFQs the vendor was not invited to or matched against.** Absence is uniformly non-disclosed across every metric — a blacklisted/excluded vendor's analytics are **byte-equivalent** to a non-matched vendor's (Invariant #11). This is the byte-equivalence guard at the analytics surface.

### C-2 — closes **MINOR-1** (claim DD-7)
GR2 note: `claim_vendor_profile` (BC-MKT-1) carries the tracked **`Doc-5D` DD-7** dependency (claim flow); the claim UI binds subject to DD-7 — referenced by pointer, never re-decided here.

### C-3 — closes **MINOR-2** (trade-invoice status leg)
GR9 amended: the vendor **issues** the trade invoice (`issue_trade_invoice`) and performs **vendor-side** status updates; **buyer-side approval** (`update_trade_invoice_status` buyer leg) is **Doc-7F**. Each BC-OPS-2 status command's actor leg is confirmed at content (bind-or-ESC); the vendor never performs the buyer's approval.

### C-4 — closes **MINOR-3** (microsite publish commands)
GR3 amended: the specific **BC-MKT-4 vendor presentation + `publish_*`/`unpublish_*` commands** are bound at content (bind-or-ESC). The vendor manages the **draft (controlling-org) projection**; `publish_*` drives the draft→published transition (Doc-4M); the **published projection renders in Doc-7D** (no draft leaks to public — `Doc-5D R5`).

### C-5 — closes **NITPICK-1** (vendor own-trust read)
GR12 note: the vendor reads its **own** trust/performance/verified-tier via the appropriate `Doc-5G` read (own-org/User leg), **read-only** — it never mutates a score (score firewall; auto-calculated under System).

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 analytics byte-equivalence | MAJOR | C-1: positive-facts-only; denominator = submitted, never all-RFQs; no not-invited count | **CLOSED** — leak vector guarded |
| MINOR-1 claim DD-7 | MINOR | C-2: dependency noted | **CLOSED** |
| MINOR-2 trade-invoice status leg | MINOR | C-3: vendor issues/vendor-side; buyer approval = 7F | **CLOSED** |
| MINOR-3 microsite publish | MINOR | C-4: bind BC-MKT-4 publish/unpublish at content | **CLOSED** |
| NITPICK-1 vendor own-trust | NIT | C-5 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** The byte-equivalence attestation now guards the analytics vector (no denominator over all-matchable RFQs); actor legs and dependencies pinned. Nothing coined.

**Next:** Structure Freeze Audit → `Doc-7G_Structure_v1.0_FROZEN` → Doc-7G content passes (~2–3), through the same loop.

*End of Doc-7G Structure Patch v0.1.1 + Short Closure Check. Effective structure = Proposal v0.1 + this patch. Additive; nothing coined; no frozen document edited.*
