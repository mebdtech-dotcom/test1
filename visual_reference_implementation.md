# iVendorz — Visual Reference Implementation

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **FINAL v1.0** — Reference-Driven UI Implementation Standard (non-authoritative companion to the Doc-7 program)
**Date:** 2026-07-06
**Supersedes:** draft "Frontend Visual Implementation Guidelines v1.0" (unfiled; review round 1 raised 2 BLOCKER / 4 MAJOR / 2 MINOR — all eight findings accepted by owner adjudication 2026-07-06 and folded here)
**Companions:** [`design_philosophy.md`](design_philosophy.md) · [`shared_conventions.md`](shared_conventions.md) · [`ux_patterns.md`](ux_patterns.md) · [`ui_realization_framework.md`](ui_realization_framework.md) · [`shared_platform_component_registry.md`](shared_platform_component_registry.md)

---

## 0. Precedence & Authority (read first)

Non-authoritative companion. It defines **how a visual reference (screenshot, mockup, Figma frame,
or external website) may be used** when implementing iVendorz UI. It **coins nothing** — no route,
contract, state, transition, permission, event, token, breakpoint, or component.

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

- Authority order is owned by **CLAUDE.md §7** and is not restated here. A visual reference ranks
  **below everything** in that order — it is an input, never an authority.
- **Doc-7A** (Frontend Realization Metastandard) and **Doc-7B** (Design System & Component Kit) own
  the token architecture, component kit, and the a11y/i18n/currency/**responsive** baseline.
  **Doc-7C** owns the app shell; **Doc-7D…7H** own the surfaces. Concrete token values live in
  [`design_philosophy.md`](design_philosophy.md); shared realization defaults in
  [`shared_conventions.md`](shared_conventions.md).
- On any conflict, the frozen corpus wins and this document is corrected (CLAUDE.md §7, §11).

---

## 1. Purpose

When a reference image is attached to a task, the implementation must:

- reproduce the reference's **composition** faithfully, and
- take **everything else** — tokens, components, behavior, workflow — from the iVendorz platform.

> **Golden Rule: copy the composition; implement the platform.**
> Visual arrangement and business behavior are separate responsibilities. A screenshot is a
> layout instruction, not a specification.

---

## 2. What a Visual Reference MAY / MUST NOT Influence

This split is the operative rule of the document. It applies identically to screenshots of other
products, Figma frames, and "make it look like this" requests.

```text
A visual reference MAY influence:

✓ Page composition
✓ Grid
✓ Information hierarchy
✓ Card arrangement
✓ Form layout
✓ Table layout
✓ Relative spacing
✓ Type size / density / weight emphasis — within the ratified scale
✓ Interaction placement

A visual reference MUST NOT influence:

✗ Brand colors
✗ Typography system
✗ Design tokens
✗ Navigation shell
✗ Sidebar styling
✗ Header styling
✗ Icons (unless explicitly requested)
✗ Business workflow
✗ Permissions
✗ State transitions
✗ API behavior
```

Notes:

- The **frontend foundation is frozen** (kit + app shell + semantic token layer). A reference
  never re-skins it: the ratified navigation shell, sidebar, header, and brand palette are kept
  even when the reference shows different chrome. Only layout, grid, and card rhythm are ported.
- Icons come from the kit's icon system; a reference may influence icon **placement**, not the
  icon set.
- **Typography system ≠ type sizes.** The family and scale are ratified (`DP §2.2`) and never come
  from a reference; a reference MAY inform which step of the ratified scale an element uses
  (size/density/weight) — per the owner ruling RV-0136/BX-06 ("match the reference's density/weight
  while staying on the ratified Navy palette", `project-management/review-log.md`).
- Everything in the MUST NOT list on the behavior side (workflow, permissions, states, APIs) is
  owned by the frozen corpus — bound by pointer per CLAUDE.md §11, never inferred from an image.

---

## 3. Fidelity Target

Faithfully reproduce the reference's **layout, information hierarchy, spacing rhythm, and visual
composition** — subject to the precedence above. Where a kit primitive or a ratified token differs
from the reference, **the kit and token win** and the divergence is correct, not a defect.

No numeric similarity percentage is defined or measured; conformance is judged qualitatively in
the normal review pipeline (CLAUDE.md §13). Numeric acceptance/test criteria are **Doc-8's** to
define, never this document's ([`deferred_decisions.md`](deferred_decisions.md) REJ-02).

---

## 4. Existing iVendorz Pages

If an equivalent or sibling iVendorz page already exists, it is the primary reference:

- reuse its layout, components, spacing, and interaction patterns;
- do not introduce a divergent visual style for the same pattern unless explicitly requested.

Consistency with the existing surface outranks fidelity to an external reference.

---

## 5. Component Reuse

Before creating any UI element, check the frontend kit (**`src/frontend/`**) and the
[`shared_platform_component_registry.md`](shared_platform_component_registry.md).

Binding rule: **extend the kit, never duplicate a primitive.** A raw `<input>`, `<button>`,
`<select>`, or `<textarea>` that re-implements an existing kit primitive is a review finding
(duplication-as-architecture), not a style choice. Native elements are acceptable only where no
kit primitive exists.

---

## 6. Responsive Behavior

Desktop is the primary experience — iVendorz serves industrial procurement teams working
predominantly on PCs and laptops. Authoring stays **mobile-first** (Doc-7B §8.1; `SC` GI-07) —
desktop-primary describes the usage target, not the authoring order. Breakpoints, device tiers,
and the responsive baseline are owned by **Doc-7A/Doc-7B** and realized per
[`shared_conventions.md`](shared_conventions.md); this document defines none of its own. A reference's mobile/desktop arrangement may inform composition
at each tier, within that baseline.

---

## 7. Conflicts: Flag-and-Halt

If a reference (or the request accompanying it) conflicts with a frozen document, an invariant, or
a ratified design decision: **Flag-and-Halt per CLAUDE.md §11** — cite both sources and escalate.
Do not silently follow the reference, silently ignore it, or resolve the conflict locally.
Ordinary ambiguity (e.g., the reference doesn't show a required platform element) is not a
conflict — place the element per the owning Doc-7 surface document and note the decision.

---

## 8. Protocol for AI Coding Agents

When an image is attached (in addition to CLAUDE.md §8):

1. Analyze the reference for **composition only** (§2 MAY list).
2. Map each region to existing kit components and surface patterns (§4, §5).
3. Realize the layout with kit primitives and ratified tokens — never raw re-implementations,
   never reference-derived colors/typography/chrome.
4. Take all behavior — data, states, permissions, workflow — from the owning frozen documents by
   pointer; **never infer behavior from the screenshot**.
5. On any conflict with platform rules, Flag-and-Halt (§7).

---

## 9. Completion Checklist

A reference-driven page is complete only when **both** hold:

- **Visual:** composition, hierarchy, and spacing rhythm faithfully reflect the reference (§3);
  all chrome, tokens, typography, and components are the platform's own (§2).
- **Platform:** workflow, permissions, module ownership, contracts, and states conform to the
  frozen corpus — verified in the normal review pipeline (CLAUDE.md §13; gate B/M/M = 0).

This companion realizes the architecture principle **Content ≠ Presentation** (Master System
Architecture **Invariant 9** · CLAUDE.md Golden Rule 4 · realized frontend-side by Doc-7A §6 /
Doc-7B BR4):
proven visual compositions are reusable; authoritative business behavior never is.
