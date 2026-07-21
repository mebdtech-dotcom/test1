# Prototypes — Hi-Fi Clickable Prototype Infrastructure

Home for the **high-fidelity clickable prototypes** produced at **Stage-3** of the mockup-first
Visual-Approval pipeline. Each prototype is the **primary Stage-4 review artifact** — the review team
navigates it interactively; screenshots are audit-trail evidence, never the review surface.

> **Prototypes are NON-AUTHORITATIVE design artifacts.** They coin nothing — every contract, state,
> slug, and lifecycle is bound by pointer to the frozen corpus; seed data is illustrative and the
> fields shown are the frozen ones. No production code, no backend. On any conflict with a frozen
> document: **Flag-and-Halt** (CLAUDE.md §11).

## The pipeline (per prototype)

```
Planning Document → Board Review → Prototype Design Brief →
  ▶ Clickable Prototype (Stage-3, here)  →  Live Stage-4 Visual Review  →
    Approved Snapshot (_screenshots/ + version tag) → Stage-5 FE Implementation Plan → Development
```

## Launcher (one command, any prototype)

```bash
npm run prototype                    # default → admin-console → http://localhost:8080
npm run prototype review-system      # serve a different prototype by folder name
npm run prototype admin-console --port 9000
```

Backed by [`scripts/serve-prototype.mjs`](../scripts/serve-prototype.mjs) — static files only, no
build, Node (not python) per the local-server lesson on this box.

## Registry

| Prototype | Folder | Feature | Stage | Version linkage |
|---|---|---|---|---|
| Admin Console | [`admin-console/`](admin-console/) | M8 staff console — 29 surfaces | **Stage-4 APPROVED** (2026-07-08) | Planning v0.3 · Brief v0.2 · Prototype **v1.0** |
| Review System | [`review-system/`](review-system/) | 3 rating lanes (public/admin/CRM) | Visual-approved (owner) | see `review_system_planning_and_design.md` |
| Digital Showcase Decisions | [`digital-showcase-decisions/`](digital-showcase-decisions/) | G3/G4/G5 decision packet — template mapping, Starter semantics, Project Portfolio fields | Stage-3 (G3 axis since ruled — hybrid model) | Planning `digital_showcase_planning_and_design.md` v0.2 · Prototype **v0.1** |
| Digital Showcase Workspace | [`digital-showcase-workspace/`](digital-showcase-workspace/) | Vendor authoring journey, **three steps** — Overview · DS-W2B Choose Template + Arrange Sections · DS-W3 Preview & Publish | Stage-3 (awaits owner/Board review) | Planning v0.9 · Audit v0.2 · Prototype **v0.2** |
| Digital Showcase Nav | [`digital-showcase-nav/`](digital-showcase-nav/) | Sidebar IA rearrangement — Current vs Option A (labeled section, Content / Publish & Promote sub-groups) vs Option B (reordered single group); all 9 entries kept | **Owner-APPROVED Option A** (2026-07-20, built) | `vendor-shell-vm.ts` VX-01 group · Prototype **v0.1** |
| Digital Showcase Content | [`digital-showcase-content/`](digital-showcase-content/) | The Content-group pages populated with sample data — Company Profile (**S1–S5 tabs**, Categories folded in + its sidebar entry removed per owner directions 07-21) · Product Portfolio + editor (S6/S7) · Project Portfolio (DS-W1/G5) · Spec Library (P-VND-09) | Stage-3 (awaits owner review) | DS-NAV Option A sidebar · Prototype **v0.3** |

## Conventions

- **One folder per feature prototype**: `prototypes/<feature>/` with `index.html` + `_assets/` +
  `README.md`. Optional `_screenshots/` holds post-approval evidence.
- **Self-contained**: HTML/CSS/JS, no build step, no external CDN. Design tokens **mirror the frozen
  Doc-7B semantic system** (usage, not new color).
- **Version linkage** in each prototype's README + on-screen (e.g. sidebar footer): Prototype vX ↔
  Planning vY ↔ Brief vZ, so an approved snapshot is traceable to its approved documents.
- **Review vs Preview**: prototypes should offer a toggle that hides review-only annotations
  (governance strips, ESC tags, legends) so reviewers can inspect the production-like UI.
