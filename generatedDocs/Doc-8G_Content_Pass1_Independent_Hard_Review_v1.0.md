# Doc-8G — Content Pass-1 (§0–§3) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8G_Content_v1.0_Pass1.md` (§0–§3) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board · UX lead |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 1 MAJOR + 1 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- The frozen `Doc-7B…7H` (surfaces/kit) · the Doc-7A partition (7B Design System · 7C App Shell · 7D Public · 7E Account · 7F Buyer · 7G Vendor · 7H Admin) + embedded-component allocation (M5/M6/M7/M9 single-owned) · `Doc-7 R5` (Content≠Presentation/microsite) / `R11` (a11y) · Invariant #9 · `Doc-8A §9` + bands A/G · `Doc-8B` (Playwright/axe) · `Doc-8E` (#9) — all correctly invoked.

0 BLOCKER. The surface inventory + Content≠Presentation + a11y altitude is sound. One coverage gap (the kit components), one scope clarification, one band-label nit.

### MAJOR-1 — the inventory + Band-G checks under-cover the **Doc-7B Design System kit components** as first-class conformance targets
§1 lists only the **7D–7H route-group surfaces** as inventory rows; §2 asserts surfaces **compose** the kit but **not that the kit components themselves conform**. **Doc-7B is a frozen Doc-7 deliverable** — the shared component foundation every surface depends on — and `Doc-8A §9.1` calls for "**component behavior against the shared kit**." A kit component has its own **prop/state/variant matrix** (disabled, loading, error, sizes) that **no single surface exercises fully**; testing only composition leaves rarely-used variants unverified.
**Required fix:** the inventory covers the **full frozen Doc-7 set** — **Doc-7B kit components (component-level rows)** + the **7D–7H surfaces (surface-level rows)**; the **component (§2), a11y (§3), and visual (§4)** checks apply at **both** levels: **(a) kit-component conformance** (the Doc-7B component's behavior/states/a11y/visual, once, as the shared foundation) **and (b) surface composition** (a surface composes the kit, no re-implemented primitive). Doc-7C App Shell elements (the shell slots/notification center) likewise get shell-level rows.

### MINOR-1 — §1 completeness "≡ frozen Doc-7 surfaces" should scope to the **full frozen Doc-7 set**
§1's completeness check says "inventory ≡ the frozen Doc-7 **surfaces**." Given MAJOR-1, the inventory must cover the **full frozen Doc-7 set** — `Doc-7B` kit components + `Doc-7C` shell elements + `Doc-7D…7H` surfaces — not only the five route-groups.
**Required fix:** §1 — completeness ≡ **the full frozen Doc-7 set** (7B kit + 7C shell + 7D–7H surfaces); each at its level (component / shell / surface).

### NITPICK-1 — §3 "Band A/G applicability" is imprecise
§3 says a11y is universal "(Band A/G applicability)." a11y is **`CHK-8-061` — Band G**; Band A is oracle-by-pointer (a separate concern).
**Suggested fix:** §3 — a11y is `CHK-8-061` (**Band G**), applied universally across **kit components + surfaces** (per MAJOR-1).

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Testing the Doc-7B kit components separately duplicates the surface tests — if a surface composes a kit button and its test passes, the button works."* | **REJECTED (false).** A surface test exercises the component **only in that surface's context/states**; the kit component has its own **prop/state/variant matrix** (disabled, loading, error, sizes) **no single surface exercises fully**. A **component-level** conformance test covers the kit's full behavior **once** (the shared foundation), catching a regression in a rarely-used variant that surface tests would miss by chance. Composition tests (surface uses the kit) and component tests (the kit conforms) are **complementary, not duplicate** — exactly the MAJOR-1 fix. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 kit components not first-class targets | MAJOR | Pass-1 Patch — full Doc-7 set inventory (7B kit + 7C shell + 7D–7H); checks at both levels |
| MINOR-1 completeness scope | MINOR | Pass-1 Patch — ≡ full frozen Doc-7 set |
| NITPICK-1 §3 band label | NIT | Pass-1 Patch — a11y = CHK-8-061 (Band G) |

**Gate:** 1 MAJOR + 1 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§4–§7).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited.*
