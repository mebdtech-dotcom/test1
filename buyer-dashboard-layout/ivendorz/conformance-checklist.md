# v0 → iVendorz conformance checklist

The adaptation gate. Every v0-generated primitive passes **all** items before it leaves the
quarantine path and (later, Track 2) is hand-ported into the governed repo. This list is both the
v0 Instructions pack (constrain generation up front) and the PR review rubric (verify after).

| # | Check | Authority |
|---|---|---|
| 1 | **Tokens-only** — no hardcoded color/hex/spacing/radius; resolves to shadcn-standard vars / `--iv-*`. No token encodes a domain value. | Doc-7B BR3 |
| 2 | **Content ≠ Presentation** — props-in only; no fetch / data lib / HTTP client / Supabase client / `useEffect`-load / cache-as-truth. Interactive = ephemeral UI state only. | Golden Rule #4 · Invariant #9 · BR4 · Doc-7C SR5 |
| 3 | **RSC discipline** — server component by default; `"use client"` only where interactivity needs it. | Doc-7B |
| 4 | **Naming** — `iv-[component]-[element]`; names coin nothing architectural. | design_philosophy §12 |
| 5 | **List semantics** — cursor pagination only, page size from caller/POLICY (never a UI literal); sort/filter re-query the contract, never client-reorder, never re-rank M3. | GI-03/04 · Doc-7B C-3 |
| 6 | **Currency** — `{amount, currency}`, default **BDT**, never hardcoded/assumed. | GI-08 · BR7 |
| 7 | **Accessibility** — semantic markup, keyboard, `:focus-visible`, contrast, ARIA, no color-only meaning → passes **axe** (`CHK-8-061`). | GI-06 · BR6 |
| 8 | **Non-disclosure** — `not-found` byte-identical to genuine absence; `error-state` branches on `error_class`, no protected enrichment; never render excluded/blacklisted signals. | Invariant #11 · GI-12 · `CHK-7-041` |
| 9 | **Files** — `file-link` carries `file_ref` only. | GI-09 |
| 10 | **AI surfaces** — advisory only; "AI suggests, modules decide"; do not build the M9 advisory panel or the Doc-7C notification center as governed components. | GI-11 · Invariant #12 |
| 11 | **Boundaries** — no business logic / no module internals; cross-module only via `contracts/`; `eslint-plugin-boundaries` clean. | REPOSITORY_STRUCTURE §3/§9 |
| 12 | **Hygiene & supply chain** — strip telemetry/branding/demo data; pin Radix/`cva`/`tailwind-merge`/`clsx`; commit lockfile; no Tailwind-v4-only output. | — |

**Governed app-components are NOT v0-generatable as-is** (hand-author against contracts):
`data-table` / `pagination-control` (cursor + re-query), `not-found` / `error-state`
(byte-equivalence + no enrichment), `currency-display` (BDT), `status-chip` (contract-keyed).

**Merge gate (Track 2):** BLOCKER = MAJOR = MINOR = 0; component tests + axe (`CHK-8-061`) +
visual-regression green; boundaries lint clean; human/AI-Supervisor review per the sign-off matrix.
