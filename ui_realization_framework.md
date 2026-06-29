# iVendorz — UI Realization Framework

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.1** — UI Realization Framework (`RF`) — non-authoritative companion; the **AI-tool-agnostic prompt-assembly layer** for the design-wave family
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (additive)
**Companions:** [`shared_conventions.md`](shared_conventions.md) (`SC` — spine) · [`design_philosophy.md`](design_philosophy.md) (`DP`) · [`information_architecture.md`](information_architecture.md) (`IA`) · [`ux_patterns.md`](ux_patterns.md) (`UX`) · [`marketplace_ux.md`](marketplace_ux.md) (`MX`) · [`page_inventory.md`](page_inventory.md) (`PI`) · [`page_templates.md`](page_templates.md) (`PT`) · [`screen_specifications.md`](screen_specifications.md) (`SS`) · [`landing_page_spec.md`](landing_page_spec.md) (`LP`) · [`esc_registry.md`](esc_registry.md) (`ER`) · [`glossary.md`](glossary.md) (`GL`). Cross-ref codes: `SC §6`.

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion**. It defines **how an AI realization engine assembles a production-grade
UI-realization prompt** for any one of the 144 pages (`PI`) by **binding** the existing design corpus —
it **coins no architecture, route, contract, state, transition, permission, event, token, component, or
page**. It re-authors **none** of the companions; it **points** at them.

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

- **Tool-agnostic.** `RF` targets **any** AI UI realization tool (Claude, Gemini, Lovable, Cursor,
  Figma AI, and equivalents) — it names **no** specific product and depends on none. The headers and
  bindings are plain text; the engine is interchangeable.
- **It generates prompts, not designs.** Every page's design already lives in `SS` (the per-page screen
  spec). `RF` turns `SS` + its template/tokens/components/journey into an assembled prompt. **`RF` never
  duplicates `SS`** — the per-page overlay **is** the `SS` entry (anti-fork rule, §2.4).
- On any conflict the **frozen corpus wins and this doc is corrected** (CLAUDE.md §7, §11). ESC handles
  are defined once in `ER`; terms in `GL`.

> **Conforms upward, coins nothing.** `RF` is an assembly contract over `H-001…H-004` + the binding
> layers — not a screen, not a page, not a token, not a component.

---

## 1. Modular Header Blocks (`H-001…H-004`)

The master header is **split into four short, independently-citable blocks** so the assembler composes
only what a prompt needs (lower token cost, single-point maintenance). Each block is plain, tool-agnostic
text. Cite a block by ID (`H-002`) rather than pasting it.

### `H-001` — Identity & General Rules
```text
You are the UI Realization Engine for iVendorz — Bangladesh's Industrial Procurement Operating System
(B2B marketplace + RFQ procurement + post-award operations + vendor CRM). You produce production-quality
UI for an already-specified screen, for ANY AI UI tool. You REALIZE, never redesign. You COIN NOTHING.
```

### `H-002` — Authority & Precedence
```text
Authority (higher wins; conform downward, NEVER contradict upward):
1. Frozen corpus — Doc-2/Doc-3 · Doc-4A–4M · Doc-5A–5K · Doc-7A–7H
   (APIs, DB, contracts, routes, permissions, events, state machines, component kit, token architecture).
   Supreme.
2. Design companions (non-authoritative): SC → DP → IA → UX → MX → PI → PT → SS → LP.
3. This screen's overlay — its SS entry + PI row (the specific page being realized).
```

### `H-003` — Output Contract
```text
The realization is COMPLETE only if it delivers ALL of:
✓ Components   — Doc-7B kit only, by kit name/tier (SC §7). Never invent a component.
✓ Tokens       — DP tokens by name (spacing/type/radius/motion/elevation/iconography, DP §2). Never invent a token.
✓ Responsive   — mobile-first (DP §2.8 breakpoints / IA §7); apply the page's MB-* preset (SC §3.3).
✓ Motion       — DP motion/easing tokens only.
✓ Accessibility— WCAG-AA (GI-06): semantic markup, full keyboard, visible focus, ARIA, contrast; no color-only meaning.
✓ States       — Loading = skeleton (SC §3.2 SK-*) · Empty = contract-empty · Error = branch on error_class + surface reference_id · Not-found = byte-identical to genuine absence (GI-05).
✓ File structure & Naming — per Doc-7C topology; component/token names from the kit/DP, never ad-hoc.
✓ Placeholders — ONLY ER's interim presentation, clearly labeled and citing the ESC-* handle.
```

### `H-004` — Forbidden Rules & Stop Conditions
```text
NEVER invent: APIs/contracts · DB/schema · business rules · permissions/roles · authentication ·
  workflow/state machines · routes · components · design tokens.
ALWAYS honor (by pointer — SC §1 GI; do not restate):
  • Non-disclosure / byte-equivalence — nothing (list/count/facet/empty/notification/error/telemetry)
    reveals an excluded/blacklisted/buyer-private signal (GI-12 / Invariant #11).
  • State-machine fidelity — offer ONLY Doc-4M-permitted transitions; reconcile on 409 (GI-10).
  • Content ≠ presentation — sort/filter/search re-queries the contract; NEVER re-ranks governed matching (GI-04).
  • AI is advisory only — suggests, never decides / ranks-to-winner / auto-selects / executes (GI-11 / Invariant #12).
  • Currency = {amount, currency}, default BDT, never hardcoded (GI-08). Routes carry opaque IDs; human refs
    (e.g. RFQ-2026-000123) are DISPLAY LABELS only.
STOP CONDITION (Flag-and-Halt): if the Screen Spec (SS) and Page Template (PT) conflict, or any binding
  contradicts the frozen corpus — STOP, report the conflict, and DO NOT GUESS (CLAUDE.md §11).
```

*(The GI guardrails are bound here by pointer; their authoritative statement is `SC §1`. A prompt cites
the `GI-0n` it relies on, never the prose.)*

---

## 2. Binding layers (what the assembler pulls — and the pointer)

Each layer states **what to pull** and **the single source pointer**. None restate the source.

### 2.1 Tokens — `DP`
Inject the **design tokens by name** the screen uses: color/surface (semantic, theme-aware), type scale,
spacing (4px grid), radius, shadow/elevation, motion/easing, z-index, breakpoints, layout
(`--iv-content-max`/`--iv-sidebar-width`/…), icon tokens, data-viz colors. **Source: `DP §2` (token sets)
+ `DP §3` (theming).** Values are owned by Doc-7B (which defers them to implementation); cite by **name**,
never redefine.

### 2.2 Components — Doc-7B kit + `SC §7`
Bind every rendered element to its **kit entry by tier** — Primitive (button, input, dialog, table, …) ·
App component (data-table, form-field, status-chip, currency-display, pagination-control, file-link,
empty-state, error-state, not-found) · Embedded single-owned (trust-badge, billing-indicator,
ai-advisory-panel, conversation-thread) · Shell slot (navigation, org-switcher, notification center).
**Source: Doc-7B (kit, authoritative) via the `SC §7` legend.** The screen's exact allowed/prohibited set
is the template's `PT §n.3/§n.4`. **Never introduce a component outside the kit.**

### 2.3 Template — `PT` (`T-*`)
Pull the page's archetype **region contract**: layout regions, responsive deltas, allowed components,
prohibited components, local governance. **Source: `PT §n`** for the page's `T-*`
(`T-LANDING`=§2 · `T-LISTING`=§3 · `T-DETAILS`=§4 · `T-DASHBOARD`=§5 · `T-WIZARD`=§6 · `T-SETTINGS`=§7 ·
`T-MANAGEMENT`=§8 · `T-ANALYTICS`=§9 · `T-AUTH`=§10 · `T-STATIC`=§11 · `T-STATE`=§12). The template owns
the regions; the screen fills them.

### 2.4 Screen overlay — `SS` (+ `PI`) — **the overlay IS the screen spec**
Pull the page's **`SS` entry** (its `Inherits:` banner + `Deltas:` block) plus its **`PI` row**
(`ID · Page · Template · Binds · Journey · Notes`) and its **`PI §13`** planning attributes (Actor,
Devices, Search, Nav, Complexity, Priority, Interaction, Visual-hierarchy). **Source: `SS [P-*]` + `PI`.**

> **Anti-fork rule (binding):** `RF` **references** `SS`/`PI`; it **never copies, restates, or replaces**
> them. There is **no** separate per-page overlay artifact — the overlay for `P-*` **is** `SS [P-*]`. The
> single source of per-page realization truth remains `SS` (the de-dup spine, `SC §0/§2`).

### 2.5 Context — `UX`
For pages that compose a named interaction pattern, pull the pattern **by pointer**: e.g. Industrial
Category Explorer (`UX §3.2`), enterprise data-table + governed comparison (`UX §2`), wizard / async
upload / optimistic reconciliation (`UX §5`), KPI cards / detail-page composition (`UX §6`), RFQ /
quotation / award / post-award flows (`UX §8`). **Source: `UX §n`.** No new pattern is authored here.

### 2.6 ESC fill — `ER` (gaps only)
If a binding the screen needs is **absent** from the frozen wired surface, it is a **named gap in `ER`**.
Render `ER`'s **interim presentation** with a **clearly-labeled placeholder citing the `ESC-*` handle** —
never fabricate the missing contract/data. **Source: `ER`.**

---

## 3. Assembly recipe

For a page `P-*`, the assembled prompt is the deterministic composition:

```
PROMPT(P-*) =
  [provenance stamp]                      §8
  + H-001 + H-002 + H-003 + H-004         §1   (Authority · Output Contract · Forbidden/Stop)
  + Tokens(DP)                            §2.1 (token names the screen uses)
  + Components(Doc-7B + SC §7)            §2.2 (allowed set = PT §n.3; prohibited = PT §n.4)
  + Template(PT T-<archetype> §n)         §2.3 (region contract)
  + ScreenOverlay(SS [P-*] + PI row+§13)  §2.4 (the page's deltas — referenced, not copied)
  + Context(UX §n)                        §2.5 (named pattern(s), if any)
  + ESC fill(ER)                          §2.6 (only where a binding is absent)
```

The assembler resolves each layer to **pointers and the page's deltas only** — never to re-stated source
prose. A page that fully inherits a layer simply **omits** it (omission means "as inherited," `SC §2`).

---

## 4. Worked examples (one per load-bearing template)

Each example shows **what the assembler pulls** — all pointers; no source restated. (`PI §13` attributes
are quoted from the inventory row, which `RF` is allowed to cite.)

### 4.1 `P-PUB-01` — Home / Landing — `T-LANDING`
- **PI row:** Template `T-LANDING` · Binds *marketing* (anonymous Public reads via `LP`) · Journey `J-GST-01` · Notes "SEO-first, light". **§13:** Guest · D/T/M · Search Critical · Primary · Medium · P0 · Read-only · Hero.
- **Assembly:** H-001..H-004 + Tokens(`DP §2/§3.1` light theme) + Components(`PT §2.3`) + Template(`PT §2` T-LANDING; `TB-NONE`/`SK-CARD`/`MB-LIST`) + Screen(`SS [P-PUB-01]` + the full landing anatomy in **`LP`** — hero + Industrial Procurement Command Center + 13 sections) + Context(`UX §7` discovery, `UX §3.2` Category Explorer) + **ESC:** `ESC-7-API-CATNAV` (explorer → `search_catalog` facets), `ESC-7-API-ADS`, `ESC-7-API/stats`.
- **Guardrails active:** anonymous/read-only; published-only; no buyer-private awareness; CTAs route to auth (`H-004`).

### 4.2 `P-PUB-12` — Vendor directory — `T-LISTING`
- **PI row:** Template `T-LISTING` · Binds `list_vendor_directory` · Journey `J-GST-03`. **§13:** Guest · D/T/M · Search Critical · Primary · Complex · P0 · Read-only · Hero.
- **Assembly:** H-001..H-004 + Tokens(`DP §2`) + Components(`PT §3.3`: search · filter · data-table/result-cards · status-chip · trust-badge · pagination-control) + Template(`PT §3` T-LISTING; `TB-LIST`/`SK-LIST`/`MB-LIST`) + Screen(`SS [P-PUB-12]`) + Context(`UX §2` lists, `UX §7` discovery).
- **Guardrails active:** cursor pagination only (GI-03); sort/filter never re-ranks (GI-04); non-disclosure on every facet/count (GI-12); trust-badge is read-only M5 display.

### 4.3 `P-BUY-08` — RFQ detail (overview) — `T-DETAILS`
- **PI row:** Template `T-DETAILS` · Binds `get_rfq` · Journey `J-PROC` · Notes "Status from Doc-4M". **§13:** Buyer · D/T/M · Search Critical · Contextual · Complex · P0 · Workflow · Hero.
- **Assembly:** H-001..H-004 + Tokens(`DP §2`) + Components(`PT §4.3`: page-header · status-chip · tabs · right-rail · timeline) + Template(`PT §4` T-DETAILS; `TB-DETAIL`/`SK-DETAIL`/`MB-DETAIL`) + Screen(`SS [P-BUY-08]`) + Context(`UX §6` detail composition, `UX §8` RFQ flow).
- **Guardrails active:** status + actions are **Doc-4M-permitted transitions only** (GI-10); buyer never invites (engine-issued invitations); opaque route ID, `RFQ-…` is a display label.

### 4.4 `P-BUY-01` — Buyer dashboard — `T-DASHBOARD`
- **PI row:** Template `T-DASHBOARD` · Binds *reads* · Journey `J-PROC-01` · Notes "KPI cards (`UX §6.2`)". **§13:** Buyer · D/T/M · Search Critical · Primary · Complex · P0 · Read-only · Hero.
- **Assembly:** H-001..H-004 + Tokens(`DP §2`) + Components(`PT §5.3`: KPI/stat cards · activity feed · queues · right-rail) + Template(`PT §5` T-DASHBOARD; `SK-DASHBOARD`/`MB-DASHBOARD`) + Screen(`SS [P-BUY-01]`) + Context(`UX §6.2` KPI cards).
- **Guardrails active:** every KPI is a wired read (no fabricated numbers); non-disclosure (GI-12); advisory AI only (GI-11).

### 4.5 `P-BUY-07` — RFQ create wizard — `T-WIZARD`
- **PI row:** Template `T-WIZARD` · Binds `create_rfq`, `update_rfq`, `submit_rfq` · Journey `J-PROC-02/03` · Notes "Resumable draft". **§13:** Buyer · D/T · Search Critical · Contextual · Critical · P0 · Workflow · Hero.
- **Assembly:** H-001..H-004 + Tokens(`DP §2`) + Components(`PT §6.3`: stepper-rail · form-field · save-bar) + Template(`PT §6` T-WIZARD; `SK-WIZARD`/`MB-WIZARD`) + Screen(`SS [P-BUY-07]`) + Context(`UX §5` wizard + async + optimistic) + **ESC:** `ESC-7-API/upload` (spec attachments → `file_ref`).
- **Guardrails active:** resumable draft; stable idempotency key per submission (GI-10); files → Storage `file_ref` (GI-09); 409 reconcile.

---

## 5. Output Contract (reference for `H-003`)

A realization is **accepted** only when every item below is satisfiable against the bound sources — this
is the concrete meaning of "production-quality," replacing "good UI":

| ✓ | Requirement | Bound to |
|---|---|---|
| Components | Doc-7B kit only, by name/tier | `SC §7` · `PT §n.3/§n.4` |
| Tokens | DP tokens by name (spacing/type/radius/motion/elevation/iconography) | `DP §2` |
| Responsive | mobile-first + the page's `MB-*` preset | `DP §2.8` · `IA §7` · `SC §3.3` |
| Motion | DP motion/easing tokens only | `DP §2` |
| Accessibility | WCAG-AA baseline | `GI-06` · `DP §11` |
| States | Loading / Empty / Error (`error_class` + `reference_id`) / Not-found (byte-identical) | `GI-05` · `SC §3.2` |
| File structure & Naming | topology + kit/token names | Doc-7C · kit/`DP` |
| Placeholders | ER interim presentation, labeled + handle | `ER` |

**Test ownership:** acceptance criteria, a11y/perf conformance, and QA are **Doc-8's** (`SC §8`) — `RF`
carries the pointer, never the criteria.

---

## 6. Stop Conditions (Flag-and-Halt)

The realization engine **must stop and report** — and must **not guess** — when:
1. The **Screen Spec (`SS`) and Page Template (`PT`) conflict** (e.g. a region/component the template
   prohibits but the spec requires).
2. Any **binding contradicts the frozen corpus** (a state/route/permission/contract the spec implies but
   the corpus does not provide).
3. A required binding is **absent and has no `ER` handle** — record a new `ER` row (gap + interim +
   channel); never invent the contract (`ER §2`).

Resolution is **upward only**: cite both sources, escalate to the Board for an additive patch (CLAUDE.md
§11). The engine never resolves a conflict locally.

---

## 7. Realization Lifecycle & Review Loop

`RF` produces a prompt; it does **not** make the AI the designer. The Board stays the designer:

```
Frozen corpus + design companions
        │  (RF assembles)
        ▼
  Assembled Prompt
        │  (AI UI tool realizes)
        ▼
   Candidate UI
        │  Board Review — Validate-Findings gate (CLAUDE.md §13; severity ladder; Raise ≠ Accept)
        ▼
    Freeze UI  (the realized screen becomes the reference for build)
        │
        ▼
  Implementation (Next.js + Doc-7B kit) — Wave-3-gated per frontend_first_slice.md
```

- **The AI never self-approves.** A candidate UI is a *finding set*, not a decision; only Board-validated
  output is frozen.
- **Sequencing.** Authoring `RF` is **now** (governance). *Using* it to realize+build pages is **Wave-3**
  (Public/Landing surface first; `frontend_first_slice.md`, `Build_Roadmap §4`).

---

## 8. Versioning & Reproducibility

Every assembled prompt carries a **provenance stamp** so it is reproducible:

```
RF v0.1 | DP v1.0 · IA v0.2 · UX v0.2 · MX v0.2 · PI v0.3 · PT v0.3 · SS v0.3 · LP v0.3 · SC v0.3 · ER v0.3 | P-<id>
```

- A prompt is reproducible from **{`RF` version + bound-doc versions + Page ID}** — the same inputs
  reassemble the same prompt.
- `RF` version line: **`v0.1 → v0.2 → v1.0`** (SC §9 header convention). A bound-doc version bump that
  changes a page's realization is a **prompt-affecting change** — re-stamp and re-review (`§7`).

---

## 9. North-Star pipeline (future) & the deferred Prompt Generator

The permanent realization pipeline `RF` slots into:

```
Frozen Docs → Prompt Framework (RF) → Prompt Generator → AI → UI → Board Review → Freeze → Production Code
```

- **Prompt Generator (deferred — Wave-3 tooling).** A script that **materializes** per-page prompts from
  the bound docs into a **generated, gitignored** directory (the `generated-contracts-registry` pattern,
  `REPOSITORY_STRUCTURE.md §2/§5/§10`) — **generated, never hand-edited**, reproducible from §8 inputs.
  This realizes "overlays keyed to Page IDs, assembled automatically" **without** forking `SS`. **Not
  built now**; scoped here so the path is governed.

---

## 10. Governance & registration

- **Non-authoritative; coins nothing.** `RF` binds the frozen corpus + companions by pointer; it
  introduces **no** new template/page/overlay ID — it reuses `T-*` (`PT`) and `P-*` (`PI`).
- **Registration:** add `RF` to the `SC §6` cross-reference codes; one line in `GL`.
- **Review:** `RF` and every prompt it produces pass the **Validate-Findings gate** (CLAUDE.md §13:
  BLOCKER = MAJOR = MINOR = 0). ESC gaps live only in `ER`.

---

*Non-authoritative. AI-tool-agnostic. Conforms upward; coins nothing; binds `SS`/`PI`/`PT`/`DP` by
pointer and never forks them. On any conflict the frozen document wins and this file is patched to match.*
