# Digital Showcase — Workspace Authoring Flow

> 🛑 **TEMPLATE NAMES: `OWNER-PROPOSED — architecture amendment required`.** The names
> *Corporate Classic · Modern Industrial · Product Catalogue · Portfolio & Projects · Business Landing*
> appear in this prototype under that label ONLY. They are **not** production semantics and **not**
> corpus-authoritative: the G3 mint proposal was **REJECTED FOR FOLD** (owner/Board 2026-07-21) because
> `Master_System_Architecture_v1.0_FINAL.md:569` (rank 0) and `ADR_Compendium_v1.md:1008` (rank 1,
> ADR-020) already bind **A Directory Style · B Engineering Company · C Manufacturer · D Service
> Company · E Corporate Microsite**. Production renders neutral `Template A`…`Template E` until an
> atomic **Master §8.4 + ADR-020** amendment packet is Board-approved
> (`governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md`).


> **Stage-3 clickable prototype — NON-AUTHORITATIVE, coins nothing.** Every element marked
> **PROPOSED** awaits a Board ruling; frozen anchors are bound **by pointer**. Sample vendor content
> is illustrative only. On any conflict with a frozen document: **Flag-and-Halt** (CLAUDE.md §11).

**Version linkage:** Prototype **v0.2** ↔ Plan `digital_showcase_planning_and_design.md` **v0.9** ↔
Audit `DS-W2A_Template_Manifest_and_Audit_v0.2.md` ↔ Template System **v1.0** (owner-approved).

## Purpose

Walks the vendor's **Digital Showcase authoring journey** as one continuous flow — the Stage-3
artifact for the `/sell` build. **Three steps** (owner decision, 2026-07-20):

| Step | Work package | What it shows |
|---|---|---|
| 1 | **Overview** | Where the showcase stands: status, selected template, visible-section count, content readiness — plus the Content ≠ Presentation rule and one CTA into step 2. |
| 2 | **DS-W2B** · Choose Template + Arrange Sections | *One page, two independent settings.* **Top:** five named cards (the canonical layout-style five) with preview, use-case, section emphasis, multi/single-page indicator; non-binding guidance from **content availability + the 4-flag capability matrix only**. **Lower:** `profile_sections` order and visibility, with four documented arrangements as starting points. Serves **G3**. |
| 3 | **DS-W3** · Preview & Publish | The chosen template over the canonical seven routes (Template E follows the **G4** recommendation: everything on Home, sub-routes 308-redirect), rendered in the independently arranged section order, with desktop/mobile preview widths and publish state draft → published. |

**Project Portfolio is not a journey step.** `/sell/company/projects` remains a real, built content
surface and Projects remains a public content section — it feeds the showcase, but authoring a case
study is content work, not a step in choosing and publishing a presentation.

## Run

```bash
npm run prototype digital-showcase-workspace   # → http://localhost:8080
```

Static files only — no build, no backend. Each step is hash-addressable (`#overview`,
`#template-sections`, `#preview-publish`), so browser Back/Forward move through the journey. The
**Review annotations** toggle (top right) hides all governance strips and PROPOSED/FROZEN tags to
inspect the production-like UI.

## The governance point it demonstrates

**Arrangement ⟂ template.** The owner's hybrid ruling (plan §3A.0) says business type may drive
*which sections are emphasized* but must never create template identities or lock a vendor to a
template. Putting both settings on **one page** makes that independence provable in both directions,
in front of the reviewer:

- Applying "Engineering service" reorders sections and hides the product catalogue, while the note
  states *"Template unchanged: Corporate Classic (A) — arrangement and template are independent."*
- Selecting a different template rewrites only `layout_template`, while the selected-template bar
  states *"Section arrangement unchanged — 8 sections, 6 visible, order untouched."*

Section emphasis lives in `profile_sections`; visual style lives in `layout_template`. That is the
Content ≠ Presentation seam.

## Guardrails honored

- **No trust panel anywhere.** The preview renders a **binary Verified badge only** — present or
  absent, never a score, rating, percentage, or job count — and step 3 carries the **DS-W2A-B1**
  guardrail explicitly: the audited reference kits' fabricated trust panels must never be recreated.
- **Nothing coined**: non-frozen elements carry visible `PROPOSED` tags; the frozen interim
  `display_order`/`is_visible` columns carry `FROZEN` tags; the A–E mapping is labelled
  `PROPOSED MAPPING` (G3 mint pending) and Template E carries a `G4 OPEN` flag. No page ID, contract,
  event, aggregate, or domain field is minted.
- **No vendor-type taxonomy** in the recommendation logic (`ESC-MKT-VENDORTYPE` is open) — guidance
  derives from published-content counts and the 4-flag capability matrix, and **never auto-mutates
  the selection**.
- **Honest pre-wiring states**: **Save design** and Publish / Unpublish are **disabled**, with titles
  naming their wiring contracts (`update_microsite.v1` + `update_profile_sections.v1`;
  `publish_microsite.v1`, `unpublish_microsite.v1`). Publish notes it emits only frozen events.
- **Two settings, two state models.** Template selection and section arrangement are separate
  variables; neither handler reads or writes the other's state.
- Frozen `--iv-*` tokens (`_assets/tokens.css`), navy sidebar, motion ≤250ms ease-out with
  `prefers-reduced-motion` respected. Keyboard-operable throughout, with labelled section controls
  and a focus-visible ring.
- Template default is **A**, matching the frozen `DEFAULT 'A'`.

## Out of scope

Company Profile, Products, **Project Portfolio**, Categories, Spec Library, Advertising — content
surfaces already built in production, shown disabled in the sidebar; the public rendering runtime
(DS-P1/P2, Phase 2, gated); all backend behavior.

## Change log

- **v0.2** (2026-07-20, owner decision) — Authoring journey reduced to **three** steps. The Project
  Portfolio step was removed from the journey (the surface itself untouched); "Choose template" and
  "Arrange sections" merged into one page with a single **Save design** action; Overview rebuilt as a
  status summary; DS-W1 and G5 removed from this prototype's scope. Added desktop/mobile preview
  widths, the binary Verified badge inside the preview, hash-addressable steps so browser Back works,
  and a focus-visible ring. **Two defects fixed:** (1) the Overview's scope annotation was closed
  with `</p>` instead of `</div>`, so the entire Overview body nested inside the review-annotation box
  and **vanished whenever Review annotations were switched OFF**; (2) `renderSelBar()` wrote inline
  `display:none` onto PROPOSED tags, which survived toggling review back ON — removed in favour of
  the existing CSS rule that already handles both directions.
- **v0.1** (2026-07-20) — initial four-step flow (DS-W1 · DS-W2B · arrangement · DS-W3).
