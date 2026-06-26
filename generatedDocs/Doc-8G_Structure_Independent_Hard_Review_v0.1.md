# Doc-8G — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8G_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect · UX lead) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT

- **The Doc-7 program is FROZEN** — `Doc-7B…7H` SERIES_FROZEN all present (the FE oracle is **complete**); `Doc-7 R5` (Content≠Presentation) / `R8` (Private Exclusion / byte-equivalence) / `R9` (state-machine/optimistic-UI) / `R11` (a11y/i18n/currency) — verified against the Doc-7A R-set.
- `Doc-2 §0.4` (currency) · Invariant #9/#11 · the frozen Doc-5 surface (e2e) · `Doc-8A §9` + Band G (`CHK-8-060…065`) · `Doc-8B` D1 (Playwright + axe + snapshots) · `Doc-8E §5` (`CHK-8-042` define-here/execute-8G) · `Doc-8D §5.4` (byte-equivalence "8G" facet) — all correctly invoked.

0 BLOCKER. G1 (surface-inventory-driven) + G2 (define-UI/compose-cross-suite) + G3 are sound, and authoring against the complete Doc-7 oracle is the right close. Two compose/oracle precision defects, one band-label nit.

### MINOR-1 — §5 "composes Doc-8C" mis-states the relationship; e2e **uses** the Doc-5 oracle, it does not re-run 8C
§5 says the e2e journey "**composes Doc-8C**." But **8C asserts each contract conforms in isolation** (envelope/error/pagination/idempotency per contract); **8G's e2e asserts a multi-contract user journey works end-to-end**. They **share the Doc-5 oracle** but assert **different things** — 8G does **not** invoke 8C's per-contract assertion helpers; it **uses** the frozen Doc-5 contracts (the same surface 8C independently verifies).
**Required fix:** §5 — reword: the e2e journey **invokes only frozen Doc-5x contracts** (the oracle 8C independently verifies); 8G asserts the **journey works** (the flow composes), **not** per-contract conformance (8C's). Shared oracle, distinct assertions; 8G does not re-run 8C's Band-B checks.

### MINOR-2 — G3 "no oracle-gap" overstates for `CHK-8-065`; the UI byte-equivalence test needs the buyer-private **data** (Doc-6F)
G3 claims "the frontend oracle being complete means Doc-8G has **no oracle-gap** — every Band-G check has its full oracle now." True for component/a11y/visual/e2e/currency (the Doc-7 surfaces are frozen). **But `CHK-8-065` (UI non-disclosure byte-equivalence) needs the buyer-private exclusion *data*** (`buyer_vendor_statuses`, M4/`Doc-6F`) to **construct the excluded case** — the UI *surface* oracle (Doc-7G) is frozen, but the *data* oracle is `Doc-6F`. So one Band-G check retains a residual data-oracle dependency.
**Required fix:** G3/§6 — qualify: the **UI surface oracle is complete** (Doc-7 frozen) for **all** Band-G checks; **`CHK-8-065` additionally has a data-oracle dependency** (`Doc-6F buyer_vendor_statuses`) to construct the excluded-vendor scenario — flagged like Doc-8D's #11 (the criterion is 8D's, sourced from Doc-6F). The rest of Band G has its full oracle now. "No oracle-gap" holds for the **UI surfaces**, not for the byte-equivalence **data scenario**.

### NITPICK-1 — §6/§7 should label `CHK-8-042` as a **Band-E** check 8G *executes*, not a Doc-8G Band-G deliverable
§6 lists optimistic-UI convergence (`CHK-8-042`) alongside the Band-G checks. `CHK-8-042` is a **Band-E** check **8E defines** and **8G executes** (the define-here/execute-in-8G split). Ensure §7's attestation labels it **composed-from-8E (Band E)**, not a Doc-8G Band-G realization.
**Suggested fix:** §7 — Band G = `CHK-8-060…065` (Doc-8G-realized); `CHK-8-042` (Band E) is **executed-as-composed** from 8E — listed separately, not as a Band-G deliverable.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Doc-8G's e2e tests duplicate Doc-8C's contract tests — both exercise the Doc-5 contracts."* | **REJECTED (false).** 8C asserts each contract **conforms in isolation** (per-contract envelope/error/pagination/idempotency); 8G asserts a **multi-contract user journey works end-to-end** (the contracts compose into a working flow through the UI). Different assertions over the **shared** Doc-5 oracle — a journey can fail (broken flow, wrong step sequence, UI state bug) **while every individual contract conforms**. Dropping 8G's e2e leaves the **integrated flow** untested. Not duplication (reinforces MINOR-1). No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §5 "composes 8C" mis-stated | MINOR | Structure Patch — e2e uses Doc-5 oracle; asserts journey, not 8C's per-contract |
| MINOR-2 G3 oracle-gap for CHK-8-065 (Doc-6F data) | MINOR | Structure Patch — UI oracle complete; CHK-8-065 data-dep on Doc-6F |
| NITPICK-1 CHK-8-042 is Band-E composed | NIT | Structure Patch — label composed-from-8E, not a Band-G deliverable |

**Gate (governance §8 rule 1):** freeze only with 0 open BLOCKER/MAJOR/MINOR. 2 MINOR open → **Structure Patch required**, then short re-review, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. The Doc-7 oracle is verified complete (7B…7H frozen); Doc-8G is the final Doc-8 deliverable.*
