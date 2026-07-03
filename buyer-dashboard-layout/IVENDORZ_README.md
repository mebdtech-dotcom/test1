# iVendorz UI source (v0 design-system source) — Track 1

This is the **external, non-governed** design-system source for using **Vercel v0** with iVendorz
tokens. It is **NOT** the governed iVendorz repo and must stay a **separate repo** — nothing here
is committed into `iVendorz/`. It implements **Track 1** of the v0 adoption plan: evaluate v0 and
build candidate **pure presentation primitives** on-brand, with zero impact on the frozen corpus.

Based on Vercel's [registry-starter](https://github.com/vercel/registry-starter) template.

## What was changed from the vanilla template
- **Themed to iVendorz** (light primary, dark optional) — verified palette from the governed repo
  (`app/globals.css` `--iv-*` primitives + `design_philosophy.md` §2.1 semantic layer), applied in
  all three places the template carries the theme:
  - `src/app/globals.css` (the running app)
  - `registry/common/globals.css` (the distributed theme)
  - `registry.json` → `items[].name == "theme"` → `cssVars.light` / `cssVars.dark` (what v0 + MCP read)
- Added `ivendorz/` docs: **`v0-instructions.md`** (paste into v0) and **`conformance-checklist.md`**
  (the adaptation + review rubric).

shadcn-standard variable **names** are unchanged (v0 + the primitives depend on them); only **values**
were replaced with iVendorz hex.

## ⚠️ Stack divergence (important for Track 2 porting)
This template is **Tailwind v4 + Next 16 + pnpm + oklch**. The **governed iVendorz repo is
Tailwind v3 + Next 15**. That mismatch is **fine for Track-1 evaluation** (shadcn primitives are
largely portable), but when you bring a component in-repo later (Track 2), the adaptation step must
**convert any Tailwind-v4-only idioms to v3** (`@theme`/`tw-animate-css`/v4-only utilities) — this is
already item 12 of the conformance checklist. Do **not** treat this source's framework versions as a
target for the governed repo.

This source follows the **design intent** (light = `:root`); it does **not** resolve DEF-03 for the
governed repo — that stays in the DEF-03 theming work package.

## Run it
```bash
pnpm install
pnpm dev            # → http://localhost:3000  (regenerates the registry, then starts Next)
```
(If pnpm isn't enabled: `corepack enable` first, or `npx pnpm@10 install`.)

## Use it with v0
1. Push this repo to your own GitHub (it has **no git history** — `git init` and add your remote),
   and/or deploy to Vercel.
2. In v0, add this as your **Design System / project source** so generations are grounded in these
   tokens + components. Optionally enable the registry **MCP** (the `theme` item is already iVendorz;
   set a `REGISTRY_AUTH_TOKEN` env var if you want to protect it) so Cursor/Windsurf are grounded too.
3. Paste **`ivendorz/v0-instructions.md`** into v0 → **Instructions**.

## The loop
- Generate **pure primitives** first (button/input/card/dialog/badge/table-shell/skeleton…), then a
  couple of frozen screens to judge fit.
- Review every output against **`ivendorz/conformance-checklist.md`**.
- **Governed/contract-keyed components are NOT taken from v0** (data-table, pagination, not-found,
  error-state, currency-display, status-chip) — they are hand-authored against contracts in Track 2.
- Never copy v0 output straight into the governed repo. Track 2 has its own human/AI-Supervisor gates.

## Provenance
Token values traced to the governed repo `app/globals.css` + `design_philosophy.md` §2.1. Theme
reference is the `iVendorz Theme` item in `registry.json`.
