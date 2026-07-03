# v0 Instructions — iVendorz (paste into v0 → Instructions)

You generate UI for **iVendorz**, a governed Next.js 15 + Tailwind + shadcn/ui platform.
Generate **presentation primitives only**. Follow every rule below — these are hard constraints,
not preferences. When a request would violate one, generate the closest compliant version and
note what you changed.

## Stack & theming
- Next.js 15 App Router, React 19, **Tailwind v3**, shadcn/ui. Output must be **RSC-compatible**:
  server component by default; add `"use client"` **only** when interactivity requires it.
- Use the project design tokens (shadcn-standard CSS vars themed to iVendorz). **Never hardcode
  colors, hex, spacing, or radii** — use `bg-background`, `text-foreground`, `text-muted-foreground`,
  `bg-primary`, `border-border`, `ring-ring`, `rounded-[var(--radius)]`, etc. No raw Tailwind
  palette colors (`text-neutral-900`, `bg-slate-…`, `text-red-500` are forbidden).
- For award/high-value use `--iv-amber`; status uses `--iv-success/-warning/-info` and
  `destructive`. Do not overload `--accent` for amber.

## What you may build
- Pure presentation **primitives**: button, input, textarea, select, checkbox, radio, switch,
  label, dialog, popover, dropdown-menu, tabs, tooltip, toast, badge, card, table shell, skeleton,
  avatar, separator, sheet.
- They receive **all content via props**. They render; they do not decide.

## What you must NOT build or include (hard bans)
- **No data access of any kind**: no `fetch`, no axios/SWR/react-query, no Supabase client, no
  `useEffect` data-loading, no API calls, no mock/sample data baked into the component. Data is
  wired separately by the app. Interactive components may hold **ephemeral UI state only**.
- **No business logic, no domain values.** Do not invent statuses, labels, tiers, scores, or enums.
  A status/variant is whatever the caller passes in.
- **No client-side reordering/refiltering of lists.** A sort/filter control only emits the chosen
  `sort`/`filter` params for the app to re-query; it must NOT reorder or refilter rows already on
  screen. **Pagination is cursor-based** (next/prev tokens), never page numbers/offsets; page size
  is supplied by the caller, never a literal you choose.
- **No domain components**: do not build trust badges/scores, billing/entitlement indicators,
  AI/advisory panels, conversation threads, or a notification center — these are owned elsewhere.
  You may build the generic primitives they would be composed from.
- **Currency**: render `{ amount, currency }` exactly as passed; **default currency is BDT**; never
  assume `$`/USD, never use `Intl` currency defaults.
- **Empty / not-found / error states**: a "not found" must look **identical to an empty/absent
  result** — never reveal that something exists-but-is-hidden, never show ids/blacklist/exclusion
  hints. Error states show a generic message + an optional reference id passed by the caller; no
  extra detail.

## Accessibility (required — must pass axe at WCAG-AA)
- Semantic HTML, full keyboard operability, visible `:focus-visible` ring, sufficient contrast,
  correct ARIA roles/labels. **Never** convey meaning by color alone (pair with icon/text).
- Respect `prefers-reduced-motion`.

## Output hygiene
- No analytics/telemetry, no `v0.dev` comments, no tracking, no `process.env` reads.
- Use only `clsx` + `tailwind-merge` (`cn()`), `class-variance-authority`, `lucide-react`, and
  Radix primitives. Keep imports minimal. Target **Tailwind v3** syntax (no `@theme`, no
  `tw-animate-css`, no v4-only utilities).
- Class naming for any custom classes: `iv-[component]-[element]`.

If unsure, prefer the smaller, dumber, prop-driven version.
