# Doc-8G — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8G_Content_v1.0_Pass2.md` (§4–§7) |
| Against | `Doc-8G_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 1 MAJOR + 1 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Freeze Audit |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MAJOR-1 — §6 vendor-view (7G) vs buyer-CRM (7F) conflation → **FIXED**
§6's non-disclosure bullet is split into two distinct assertions:
> **(a) Vendor-view byte-equivalence (`CHK-8-065`; the load-bearing `Doc-7 R8` attestation):** a **blacklisted vendor cannot detect** exclusion — render the **excluded** vendor's and a **non-matched** vendor's **Vendor workspace (7G)** experience and assert they are **byte-identical** (the **vendor's rendered view** — the observer; not vendor records). Composes **Doc-8D's `CHK-8-024`** criterion at the UI layer (Doc-8D §5.4 "8G" facet). Data: `Doc-6F buyer_vendor_statuses` (to construct the excluded case — G3); UI observable oracle: frozen `Doc-7G`.
> **(b) Buyer-private CRM confinement (`Doc-7 R8`):** the buyer's blacklist / buyer-private CRM (M4) renders **in the Buyer workspace (7F) to the buyer** (it is the buyer's own private data — **not** byte-equivalence) and **never leaks to `Doc-7G` or any vendor-facing surface, view, count, notification, analytic, or error**. A distinct assertion: private-to-buyer rendering + no-vendor-facing-leak.
>
> **7F is not a byte-equivalence surface** — the buyer sees their blacklist; the vendor must not detect it.

### MINOR-1 — §5 currency cross-cutting → **FIXED**
§5's currency clause: `CHK-8-064` is **cross-cutting** (like a11y) — asserted at the **kit-component level** (a money-display component renders its currency) **and** across **surfaces/journeys**; per-value-field, default BDT, never assumed (`Doc-2 §0.4`). Not e2e-only.

### NITPICK-1 — §6 observer-view framing → **FIXED (applied)**
§6: the byte-equivalence is over the **vendor's rendered view** (the observer — the Doc-8D §5.4 framing), not vendor identities/records.

### REJECTED finding — upheld
"UI byte-equivalence redundant with 8D/8F" stays **REJECTED as false** — three leak surfaces (DB/event/rendered-UI) of the one single-sourced criterion; the UI is the surface the vendor actually perceives; dropping it leaves the Doc-7 R8 attestation untested. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 1 | **0** |
| MINOR | 1 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check

| Finding | Sev | Closed? |
|---|---|---|
| MAJOR-1 7G byte-equiv vs 7F CRM confinement | MAJOR | **CLOSED** — (a) 7G vendor-view byte-equivalence; (b) 7F buyer-private CRM confinement (never vendor-facing); distinct, 7F ≠ byte-equiv surface |
| MINOR-1 currency cross-cutting | MINOR | **CLOSED** — component + surface levels, not e2e-only |
| NITPICK-1 observer-view | NIT | **CLOSED** — vendor's rendered view |
| REJECTED (UI byte-equiv redundant) | — | **Upheld false** |

No new defect. Re-verified Invariant #11 / Doc-7 R8: vendor cannot detect blacklisting (7G byte-equivalence); buyer-private CRM renders to the buyer (7F) and never to a vendor-facing surface. **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.** Both content passes (§0–§7) approved → ready for Content Freeze Audit.

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Next: Content Freeze Audit → `Doc-8G_SERIES_FROZEN_v1.0` → Doc-8 program closure (`Doc-8_SERIES_FROZEN_v1.0`).*
