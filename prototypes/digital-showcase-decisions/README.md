# Digital Showcase — Decision-Support Prototype

> 🛑 **TEMPLATE NAMES: `OWNER-PROPOSED — architecture amendment required`.** The names
> *Corporate Classic · Modern Industrial · Product Catalogue · Portfolio & Projects · Business Landing*
> appear in this prototype under that label ONLY. They are **not** production semantics and **not**
> corpus-authoritative: the G3 mint proposal was **REJECTED FOR FOLD** (owner/Board 2026-07-21) because
> `Master_System_Architecture_v1.0_FINAL.md:569` (rank 0) and `ADR_Compendium_v1.md:1008` (rank 1,
> ADR-020) already bind **A Directory Style · B Engineering Company · C Manufacturer · D Service
> Company · E Corporate Microsite**. Production renders neutral `Template A`…`Template E` until an
> atomic **Master §8.4 + ADR-020** amendment packet is Board-approved
> (`governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md`).


> **✅ Stage-3 clickable prototype — NON-AUTHORITATIVE, coins nothing.** Every element marked
> **PROPOSED** awaits an owner/Board ruling; every frozen anchor is bound **by pointer**. On any
> conflict with a frozen document: **Flag-and-Halt** (CLAUDE.md §11). Sample data is illustrative
> mock content (the approved template system's anchor vendor), never real or fabricated-real data.

**Version linkage:** Prototype **v0.1** ↔ Plan
`docs/product/requirements/digital_showcase_planning_and_design.md` **v0.2** ↔ Vendor Profile
Template System **v1.0** (owner-approved 2026-07-08).

## Purpose

The Digital Showcase program plan (v0.2 §5/§10) leaves three visual decisions open. This prototype
lets the owner/Board **see each decision before ruling** — it is the packet's primary review
artifact, per the Stage-4 "clickable prototype primary" ruling.

| Screen | Gate | Question | Recommendation shown |
|---|---|---|---|
| Template picker (S10 builder) | **G3** | Which approved layout name maps to which frozen `layout_template` letter? | 01→A · 02→B · 03→C · 04→D · 05→E |
| Starter semantics | **G4** | How does single-page Template E live inside the canonical 7-route public IA? | Option A: Home renders all; sub-routes 308-redirect (M2.5 Hybrid precedent); Option B shown for contrast |
| Project Portfolio (DS-W1) | **G5** | What does a vendor author on `showcase_projects` (frozen but column-underspecified, `[ESC-6-SCHEMA-SHOWCASE]`)? | Field set mirroring the public case-study surface (P-PUB-25 / benchmark §6.9): title · sector · client **descriptor** · year · summary · scope highlights · gallery (disabled) + frozen interim `display_order` / `is_visible` |
| Overview | G2 rider | 5-item amended nav vs approved canonical seven | Nothing from the amendment is built; plan recommends re-affirming the seven |

## Run

```bash
npm run prototype digital-showcase-decisions   # → http://localhost:8080
```

Static files only — no build, no backend. The **Review annotations** toggle (top right) hides all
governance strips and PROPOSED/FROZEN tags to inspect the production-like UI (Review vs Preview
convention).

## Governance guardrails honored

- **Content ≠ Presentation** (Inv #9): template selection is presented as presentation-only; copy
  states content never changes with the template.
- **No coined fields as fact**: every non-frozen field carries a visible `PROPOSED` tag; the two
  frozen interim columns carry `FROZEN` tags; no status enum is invented for showcase projects.
- **Honest pre-wiring states**: Save / Publish / Add project / Add images are **disabled** with
  titles naming the wiring contract (`create/update/publish_showcase_project.v1`,
  `update_microsite.v1`) — never faked. Publish tooltip notes **no event exists to emit**.
- **Client identity = descriptor, never a fabricated company name** (M2.7 precedent); no invented
  figures/stats; no trust/performance/tier signals anywhere on these screens.
- Tokens copied verbatim from the frozen system (`_assets/tokens.css`); navy-dominant palette;
  light theme primary; motion ≤250ms ease-out, `prefers-reduced-motion` respected.

## Out of scope

The five hi-fi public templates themselves (already approved — `prototypes/vendor-profile-templates/`),
all production `/sell` surfaces, any backend behavior, and anything gated on G1 records folds.
