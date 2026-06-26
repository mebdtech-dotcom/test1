# Doc-8G — Content Pass-2 (§4–§7) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8G_Content_v1.0_Pass2.md` (§4–§7) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board · Security Architect · UX lead |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 1 MAJOR + 1 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Content Pass-2 Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- The frozen Doc-7 surfaces + `Doc-7 R5/R8/R11` · `Doc-2 §0.4` (currency) · the frozen Doc-5 surface (e2e) · `Doc-8C` (shared oracle) · `Doc-8D §5.4` (byte-equivalence criterion) · `Doc-8E` (#9 / `CHK-8-042`) · `Doc-8B` (snapshots) · CLAUDE.md §5 (active org) · Invariant #9/#11 — all correctly invoked.
- Pass-1 fixes consumed: §4 visual at both levels (kit variant matrix + surface); §7 labels composed checks separately from Band G.

0 BLOCKER. Visual (§4), e2e/currency (§5), and the convergence composition (§6) are sound. **One MAJOR on the load-bearing privacy attestation** (vendor-view vs buyer-CRM), one currency-placement minor, one nit.

### MAJOR-1 — §6 conflates the **Vendor-view byte-equivalence (7G)** with the **buyer-private CRM rendering (7F)** — they are distinct assertions
§6 says "render the excluded-vendor case ... in the vendor-facing surfaces **(7G/7F)**." But **7F is the Buyer workspace, 7G is the Vendor workspace** — and Invariant #11 / `Doc-7 R8` distinguish two things:
- **Vendor-view byte-equivalence (the load-bearing attestation):** a **blacklisted vendor cannot detect** they are excluded — their **Vendor workspace (7G)** experience is **byte-equivalent** to a non-matched vendor's. This is the **vendor's** view in **7G** (not 7F).
- **Buyer-private CRM confinement:** the buyer's blacklist renders **privately to the buyer in the Buyer workspace (7F)** and **never leaks to any vendor-facing surface** (`Doc-7 R8` — the buyer-private CRM "renders only inside the buyer's own workspace"). This is a **different** assertion — *private-to-buyer rendering*, **not** byte-equivalence.
Including 7F in the byte-equivalence assertion is wrong (the buyer **does** see their own blacklist — it's their private data; byte-equivalence there would be incorrect).
**Required fix:** §6 — (a) **byte-equivalence (`CHK-8-065`) = the Vendor workspace (7G)** view: excluded vendor's 7G ≡ non-matched vendor's 7G (the vendor cannot detect blacklisting); (b) add a **distinct buyer-private-CRM-confinement** assertion: the buyer-private CRM (M4) renders **in 7F to the buyer** and **never in 7G / any vendor-facing surface** (`Doc-7 R8`). Do not conflate the two; 7F is not a byte-equivalence surface.

### MINOR-1 — §5 currency (`CHK-8-064`) is cross-cutting, not e2e-only
§5 places currency under the e2e journey. But `CHK-8-064` (per-value-field currency, default BDT) applies **wherever money renders** — a kit money-display component **and** any surface view — like a11y (`CHK-8-061`), it is universal, not e2e-specific.
**Required fix:** §5 — note currency (`CHK-8-064`) is **cross-cutting**: asserted at the kit-component level (a money-display component renders its currency) **and** across surfaces/journeys (per the Pass-1 MAJOR-1 two-level model); not only at the e2e level.

### NITPICK-1 — §6 "observer's view" framing should be explicit
§6 asserts UI byte-equivalence; the self-check notes "observer's rendered view." Make it explicit in §6 (per Doc-8D §5.4): equivalence is of the **observer's (vendor's) rendered experience**, not of vendor identities/rows.
**Suggested fix:** §6 — state the equivalence is over the **vendor's rendered view** (the observer), not the underlying records.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§6's UI byte-equivalence is redundant with 8D's DB byte-equivalence and 8F's event byte-equivalence — three suites testing the same thing."* | **REJECTED (false).** Three **different leak surfaces** of the **same single-sourced criterion** (Doc-8D §5.4): **8D** = DB row visibility, **8F** = event/notification, **8G** = the **rendered UI** — a surface/count/analytic could reveal exclusion **even if rows and events are byte-equivalent** (e.g. a UI element that renders differently). The criterion is defined **once** (8D); asserted at **each observable surface a user actually perceives**. Dropping the UI assertion leaves the surface the **vendor actually sees** untested — the load-bearing `Doc-7 R8` attestation. Not redundant; assert-once-criterion, per-leak-surface. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 §6 vendor-view (7G) vs buyer-CRM (7F) conflation | MAJOR | Pass-2 Patch — byte-equivalence = 7G; add buyer-private-CRM confinement (7F-only, never vendor-facing) |
| MINOR-1 §5 currency cross-cutting | MINOR | Pass-2 Patch — currency at component + surface levels, not e2e-only |
| NITPICK-1 §6 observer-view framing | NIT | Pass-2 Patch — equivalence over the vendor's rendered view |

**Gate:** 1 MAJOR + 1 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited. The MAJOR is a correctness fix on the load-bearing Doc-7 R8 privacy attestation: vendor-view byte-equivalence (7G) ≠ buyer-private CRM confinement (7F).*
