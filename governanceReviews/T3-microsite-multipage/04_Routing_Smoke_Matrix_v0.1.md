# Deliverable 4 — Routing Smoke Matrix (verification checklist)

**Team 3 · DRAFT v0.1 · pre-ADR · no code changed · NOT EXECUTED**
**Purpose:** the verification checklist Team 3 runs in Phase 4, prepared now. No execution until
the migrated multi-page site exists. `next build` is environment-blocked on Windows (deterministic
`EPERM`) → routing is verified via **dev render + static gates**; production build is a **CI** pass.

Status legend: `☐ Pending` (all rows — nothing run yet).

## A. Route renders (7 canonical)

| Route | Expected | Status |
|---|---|---|
| `/vendors/[slug]` (Home) | renders Home landing set | ☐ Pending |
| `/vendors/[slug]/about` | renders About page | ☐ Pending |
| `/vendors/[slug]/products` | renders Products page | ☐ Pending |
| `/vendors/[slug]/projects` | renders Projects page | ☐ Pending |
| `/vendors/[slug]/industries` | renders Industries page | ☐ Pending |
| `/vendors/[slug]/resources` | renders Resources page (new) | ☐ Pending |
| `/vendors/[slug]/contact` | renders Contact page | ☐ Pending |

## B. 404 parity (Invariant #11 — owned by `layout.tsx`)

| Check | Expected | Status |
|---|---|---|
| unknown slug on Home | `notFound()` | ☐ Pending |
| unknown slug on `/about` | `notFound()` | ☐ Pending |
| unknown slug on `/products` | `notFound()` | ☐ Pending |
| unknown slug on `/projects` | `notFound()` | ☐ Pending |
| unknown slug on `/industries` | `notFound()` | ☐ Pending |
| unknown slug on `/resources` | `notFound()` | ☐ Pending |
| unknown slug on `/contact` | `notFound()` | ☐ Pending |
| draft/unpublished/banned slug | byte-equivalent `notFound()` | ☐ Pending |

## C. Back-compat redirects

| From | To | Status |
|---|---|---|
| `/capabilities` | `/about` | ☐ Pending |
| `/certifications` | `/resources` | ☐ Pending |
| old `#about` / `#products` / … anchors | resolve (or intentional redirect) | ☐ Pending |

## D. Navigation & SEO

| Check | Expected | Status |
|---|---|---|
| active nav state | `aria-current="page"` on current route | ☐ Pending |
| breadcrumb | reflects active page (e.g. Vendors › Padma › About) | ☐ Pending |
| per-page `generateMetadata` | present on all 7 routes | ☐ Pending |
| metadata content | title/description per page, no fabricated field | ☐ Pending |

## E. Accessibility / responsive (per page × 7)

| Check | Expected | Status |
|---|---|---|
| one `<h1>` per page | exactly one | ☐ Pending |
| landmark structure | header/nav/main/footer present | ☐ Pending |
| focus-visible nav | keyboard focus ring on nav links | ☐ Pending |
| heading hierarchy | no skipped levels | ☐ Pending |
| responsive | mobile / tablet / desktop each page | ☐ Pending |

## F. Guardrail greps (static, non-negotiable)

| Grep | Expected | Status |
|---|---|---|
| no `app/(app)` / Vendor-workspace import | 0 hits | ☐ Pending |
| `"use client"` only in nav | 1 file | ☐ Pending |
| no trust/performance score, financial tier, turnover | 0 hits | ☐ Pending |
| `tsc --noEmit` · `eslint` (incl. import-boundaries) · `prettier --check` | 0 errors | ☐ Pending |

## G. Handoff

| Step | Status |
|---|---|
| Reuse Register final (zero duplicates, HIGH-pairs audited) | ☐ Pending |
| Promotion Watchlist delivered | ☐ Pending |
| hand to Team-4 QCT — conformance gate BLOCKER/MAJOR/MINOR = 0 | ☐ Pending |
