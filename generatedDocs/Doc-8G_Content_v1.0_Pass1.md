# Doc-8G — Frontend & E2E Conformance Suite — Content v1.0 **Pass-1 (§0–§3)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§3 of `Doc-8G_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8G_Structure_v1.0_FROZEN` §0–§3: control · surface inventory · component conformance · a11y |
| Authority | `Doc-8A §9` + bands A/G; oracle = the frozen Doc-7 surfaces (`7B…7H`) + Doc-2 §0.4 + the frozen Doc-5 surface; consumes `Doc-8B` (Playwright/axe) by pointer |
| Coins | **Nothing.** Inventory derived from frozen Doc-7; assertions oracle-by-pointer; snippets illustrative |
| Binding vs choice | Convention tracing to the frozen Doc-7/Doc-8A = **[binding]**; physical specific = **[Doc-8G choice]**. |

> **Scope of this pass:** control/precedence + Bands A/G gate (§0), the frozen-Doc-7-sourced surface inventory (§1), component conformance (§2), a11y baseline (§3). §4–§7 (visual-regression, e2e/currency, UI non-disclosure/convergence, conformance) land in Pass-2.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding

Doc-8G sits at: `… → Doc-8A → (Doc-8B harness: Playwright/axe/snapshots) → **Doc-8G** → asserts the frozen Doc-7 surfaces + the frozen Doc-5 surface (e2e)`. It **realizes** `Doc-8A §9` and **passes Appendix A Bands A + G** (`CHK-8-001…003`; `CHK-8-060…065`) before content freeze. Realize-never-redecide: every assertion is an **oracle-by-pointer** into the frozen `Doc-7B…7H` / Doc-2 §0.4 / the frozen Doc-5 surface; **no assertion stricter or looser** than the frozen Doc-7 surface (`Doc-8A §3.3`). A red test = code defect, or `[ESC-8-CORPUS]` (a coined screen / Doc-7 defect — flag-and-halt) — **never weaken** (`Doc-8A §3.4`), **never coin a screen**. Doc-8G **composes** 8C (e2e: shared Doc-5 oracle, not re-run), 8E (#9 + `CHK-8-042`), 8D (#11 UI byte-equivalence); it defines the UI-specific checks. Consumes the **Doc-8B** harness by pointer. Coins nothing. **It is the final Doc-8 deliverable — its freeze closes the program.**

## §1 — Scope & the Surface Inventory

**[G1 binding]** The suite's spine is the **surface inventory** — **derived from the frozen `Doc-7B…7H`**, **never hand-maintained**. Row schema **[Doc-8G choice — columns; values [binding] from the frozen surfaces]**:

| Field | Source |
|---|---|
| `surface` | the frozen `Doc-7x` route-group (7D Public · 7E Account/Identity · 7F Buyer · 7G Vendor · 7H Admin) |
| `views` | the screens/views the surface declares (`Doc-7x`) |
| `kit_components` | the `Doc-7B` design-system components composed (the kit is the oracle) |
| `lifecycle_uis` | the Doc-4M-driven lifecycle screens on the surface (state-machine UI — 8E-composed) |
| `e2e_journeys` | the user journeys over the frozen Doc-5 surface (8C shares the oracle) |
| `active_org` | the Doc-7C active-org context (none for `Doc-7H` Admin) |
| `execution` | `authored` (UI oracle complete) — execution deferred to UI code (G3); `CHK-8-065` also data-deps `Doc-6F` |

The **completeness check** asserts **inventory ≡ the frozen Doc-7 surfaces** (every frozen surface/view covered; **none coined**). Shared cross-cutting embedded components (M5 trust badge, M6 notification center/thread, M7 billing indicator, M9 AI panel) are realized in `Doc-7B`/`Doc-7C` and **composed** into surfaces — the inventory references them at their single defining document (no orphan, no duplicate — the Doc-7A allocation).

## §2 — Component Conformance *(`CHK-8-060`)*

**[binding `Doc-7B` / Invariant #9 / `Doc-7 R5`]** Per surface/component:

- **Kit composition:** a surface renders the **`Doc-7B` design-system components** — never a re-implemented primitive (a hand-rolled button/table where the kit provides one is a defect). The component tree composes the kit.
- **Presentation-component boundary (Content ≠ Presentation, Invariant #9 / `Doc-7 R5`):** a presentation component **owns no authoritative state** — it renders module-owned content (fetched via contracts) and never mutates/caches-as-authoritative/stands-in-for it. **Composes 8E's Invariant-#9** criterion at the UI layer (8E defines #9; 8G asserts it in the component tree).
- **Microsite case (`Doc-7 R5`):** the same M2 microsite content is rendered **read-only by the Public surface (7D)** and **managed by the Vendor workspace (7G)** — **one M2 owner, two surfaces** — asserted (presentation differs; the owned content is identical, contract-fetched).

```ts
// illustrative; convention [Doc-7B / Inv #9 / Doc-7 R5 binding]; kit-composed; presentation owns no authoritative state
expectComposesKit(surface.components, Doc7B.kit)               // no re-implemented primitive
expectNoAuthoritativeStateInComponent(component)               // Content≠Presentation (compose 8E #9)
expectMicrositeOneOwnerTwoSurfaces(M2content, [Doc7D, Doc7G])  // Doc-7 R5
```

## §3 — Accessibility Baseline *(`CHK-8-061`)*

**[binding `Doc-7 R11`]** Assert the **WCAG-AA + keyboard/focus** baseline every surface inherits, via **`@axe-core/playwright`** (Doc-8B D1):

- **Keyboard operability + focus order:** every interactive control reachable and operable by keyboard; a logical, visible focus order; no keyboard trap.
- **Semantic roles / ARIA:** correct roles, names, states (axe rule set).
- **Contrast:** text/UI contrast meets WCAG-AA.

An a11y regression is a **code defect** (§0). Applies to **every** surface inventory row (Band A/G applicability: a11y is universal across surfaces). Execution-deferred (UI code); the WCAG-AA target + the axe ruleset are the frozen-convention oracle now (`Doc-7 R11`).

```ts
// illustrative; convention [Doc-7 R11 binding]; WCAG-AA + keyboard/focus via axe
for (const view of surface.views) {
  expectNoAxeViolations(view, { standard: 'wcag2aa' })          // @axe-core/playwright
  expectKeyboardOperableAndFocusOrdered(view)
}
```

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** the frozen `Doc-7B…7H` (surfaces/kit); `Doc-7 R5` (Content≠Presentation/microsite) / `R11` (a11y); Invariant #9; the Doc-7A embedded-component allocation; `Doc-8A §9/§3.x` + bands A/G; `Doc-8B` (Playwright/axe); `Doc-8E` (#9). **Nothing invented; no screen coined.**
- **Inventory frozen-sourced:** §1 derives from `Doc-7B…7H`; completeness ≡ frozen Doc-7 surfaces; embedded components referenced at their single defining doc (no orphan/duplicate).
- **Composition correct:** §2 composes 8E's #9 (defines neither); a11y (§3) is 8G-defined (Band G).
- **Coins nothing; binding/choice tagged:** 0 new surface/component/route/expected value.
- **Open for review:** confirm the surface list (7D Public · 7E Account · 7F Buyer · 7G Vendor · 7H Admin) + the embedded-component allocation match the frozen Doc-7A partition; confirm a11y universality across surfaces (incl. the Doc-7H Admin no-active-org surface).

*End of Content Pass-1 (§0–§3) — DRAFT. Realizes `Doc-8G_Structure_v1.0_FROZEN` §0–§3. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7).*
