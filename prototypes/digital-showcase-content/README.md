# Digital Showcase — Content Group Pages

> **Stage-3 clickable prototype — NON-AUTHORITATIVE, coins nothing.** Sample content is
> illustrative only; the production surfaces render wired reads or honest empty states (VX-03).
> Frozen anchors are bound **by pointer**; on any conflict with a frozen document:
> **Flag-and-Halt** (CLAUDE.md §11).

## Purpose

Walks the five pages of the DS-NAV **Content** sub-group (owner-approved Option A sidebar) as one
clickable flow, each populated with realistic sample data so the owner can review the pages as a
vendor would experience them — the built production surfaces render genuine-empty states, which
makes design review hard:

| Page | Hash | Mirrors |
|---|---|---|
| Company Profile | `#company` | **S1–S5 tabs** (owner direction 2026-07-21): Overview · Identity & geography · Capabilities & capacity · **Categories** · Financial tier. The Identity tab is an extended **decision packet** (owner-applied 07-21): FROZEN read-only platform-identity block (`human_ref`/`slug`/claim+status) · BD division→district dependent dropdowns (presentation-only; full list = seed content needing an owner nod) · three PROPOSED non-frozen card groups rendered disabled — Registration & compliance (M2-vs-M5 ruling open), Address & locations (1:N sites flagged out), Public contact (Content-vs-Presentation ruling open) — each requiring an ESC + additive Doc-2/6D patch before production |
| Product Portfolio | `#products` (+ `#product-editor`) | S6 list (allowance, filters, status chips) + S7 editor (Content · Specifications · Publishing) |
| Project Portfolio | `#projects` | DS-W1 list + editor with the G5-ruled field set |
| Categories | `#categories` | **Alias** — deep-links the Company Profile Categories tab (S5 assigned list + propose panel), which is its **single home: the sidebar entry is removed** (owner directions 2026-07-21). PROPOSED IA: production still serves `/sell/company/categories` as a sibling route with a nav entry — realizing the fold is a route/IA change through the normal review path. |
| Spec Library | `#spec-library` | P-VND-09 list + entry dialog |

Pages are hash-addressable, so browser Back/Forward navigate. The sidebar replica shows the
approved DS-NAV Option A grouping with the Content group active.

## Run

```bash
npm run prototype digital-showcase-content   # → http://localhost:8080
```

Static files only — no build, no backend. The **Review annotations** toggle (top banner) hides all
FROZEN / PROPOSED / SAMPLE tags and governance strips to inspect the production-like UI.

## Guardrails honored

- **No trust panel, ever** (DS-W2A-B1): Governance bands render *"Display pending"* — no score,
  rating, percentage or job count anywhere.
- **Tier ≠ Plan** (Invariant #10): publish allowance is numeric-only ("4 of 10"), never a plan
  name; the Financial-tier tab carries the frozen warning copy.
- **Capability = matrix** (Invariant #1): the four independent flags, never a single label.
- **Frozen vocab verbatim**: claim (`seeded/invited/claimed/verified`), verification
  (`pending/verified/rejected`), product status (`draft/published/unpublished`), category status
  (`proposed/active/removed`), spec revisions (`Current/Superseded`, append-only Inv #8).
- **Project Portfolio**: G5-ruled fields tagged PROPOSED (ride the frozen `content_jsonb`
  carrier); `display_order`/`is_visible` tagged FROZEN; client is a *descriptor*, never a named
  company; no status enum coined (visibility chip maps the boolean).
- **No SKU** on products (not a frozen column); no lorem — all copy is realistic
  Bangladesh-industrial sample content.
