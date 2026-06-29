# iVendorz — Shared Realization Conventions

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Shared Conventions (non-authoritative companion; the de-duplication spine for the design-wave family)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (foundation)
**Companions:** [`design_philosophy.md`](design_philosophy.md) · [`information_architecture.md`](information_architecture.md) · [`ux_patterns.md`](ux_patterns.md) · [`marketplace_ux.md`](marketplace_ux.md) · [`page_inventory.md`](page_inventory.md) · [`page_templates.md`](page_templates.md) · [`screen_specifications.md`](screen_specifications.md) · [`landing_page_spec.md`](landing_page_spec.md) · [`esc_registry.md`](esc_registry.md) · [`glossary.md`](glossary.md)

---

## 0. Precedence & Authority (read first)

Non-authoritative companion. It **states the cross-cutting realization defaults once** so the other
wave docs inherit them by reference instead of repeating them. It **coins nothing** (no route,
contract, state, transition, permission, event, token, or component). Precedence:

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

On any conflict the frozen corpus wins and this doc is corrected (CLAUDE.md §7, §11). ESC handles are
defined once in [`esc_registry.md`](esc_registry.md); terms in [`glossary.md`](glossary.md).

---

## 1. Global Inheritances (GI)

Every screen (SS), template (PT), and section inherits **all** of GI-01…GI-12 unless it declares a
delta. **Do not restate these per page** — cite `GI` (or the specific `GI-0n`) and document only what
differs.

| ID | Inherited default | Anchor |
|---|---|---|
| **GI-01** | **App shell + context** — pages mount in the Doc-7C shell (nav · org-switcher · notification center); active-org is **server-resolved, never client-trusted**. | IA §3 · Doc-7C §2/§4 · Invariant #5 |
| **GI-02** | **Data layer** — reads are RSC; writes are server actions; the browser never calls a Doc-5 contract directly. | Doc-7C §5 |
| **GI-03** | **Lists** — **cursor pagination only** (`page_size` from `*.list_page_size_max` POLICY; opaque cursor); **offset/page-number forbidden**; `total_count` only if the contract provides it. | Doc-7C §5.3 · UX §2.4 |
| **GI-04** | **Sort/filter = presentation** — re-queries the contract; **never re-ranks governed M3 matching**. | Doc-7A §6 · GR #4 |
| **GI-05** | **State primitives** — Loading = skeleton (preset, §3); Empty = contract's empty result (no client total); Error = branch on `error_class` (never HTTP status), **no protected enrichment**, surface `reference_id`; Not-found = **byte-identical to genuine absence**. | Doc-7B §6 · Doc-7A §5.3-5.4/§8 · UX §3-§4 |
| **GI-06** | **Accessibility baseline** — WCAG-AA: semantic markup, full keyboard, visible `:focus-visible` ring, ARIA where the primitive needs it, contrast; **no color-only meaning**. The a11y *test* is Doc-8's. | Doc-7B §7.1 · DP §11 |
| **GI-07** | **Responsive** — mobile-first; breakpoints per DP §2.8; shell sidebar → icon-rail → drawer; mobile presets (§3). | DP §3.2 · IA §7 |
| **GI-08** | **Currency** — every money value is `{amount, currency}` carried by the field, **default BDT, never hardcoded**. | Doc-2 §0.4 |
| **GI-09** | **Files & async** — blobs to Supabase Storage; the contract carries `file_ref` only; client upload-grant is [`ESC-7-API`](esc_registry.md); `ASYNC_PENDING` → **poll the status resource**. | Doc-7C §8 · Doc-7A §5.3 |
| **GI-10** | **State-machine UI + optimistic** — offer **only Doc-4M-permitted transitions**; reconcile on `CONFLICT`/`STATE` (409); stable idempotency key per submission. | Doc-7A §7 · Doc-4M |
| **GI-11** | **AI advisory** — the only AI surface is M9's `ai-advisory-panel` (`Doc-5K`): **suggests, never decides / ranks-to-winner / auto-selects / executes**; future-activation ([`ESC-7-AI`](esc_registry.md)). | Invariant #12 · GR #6 · UX §5.5 |
| **GI-12** | **Non-disclosure / byte-equivalence + analytics** — nothing (list, count, facet, empty, notification, error, telemetry) reveals an excluded/blacklisted/buyer-private signal; analytics is presentation telemetry that **coins no Doc-2 §8 event** (grammar §4). | Invariant #11 · CHK-7-040/041 |

> **Performance posture (inherited):** RSC streaming + suspense boundaries, image/font optimization
> (Doc-7C). Do **not** invent numeric budgets — performance *tests/targets* are Doc-8's.

---

## 2. The "Inherited From" banner (anti-duplication convention)

Every major section / page block **opens with one banner**, then documents **only deltas**:

```text
Inherits: GI · T-<TEMPLATE> · TB-<preset> · SK-<preset> · MB-<preset>   (+ any specific GI-0n)
Deltas:   <only what differs from the above>
```

Rules:
- A field left to its inheritance is simply **omitted** — omission means "as inherited," not "missing."
- **Keep (do NOT strip) for reader orientation** (per review caution): the doc-opening *"conforms
  upward, coins nothing"* statement, the one-line *scope statement*, and a short *local governance
  summary* at the end of a major section. These are orientation, not accidental duplication.
- Authority pointers (`Doc-4M`, `Invariant #n`, …) live in **GI / the governance ledger**, not inside
  every page action. A page says **"Submit RFQ"**, not "Submit RFQ per Doc-4M §…".

---

## 3. Presets

### 3.1 Toolbar presets (TB)
| ID | Composition |
|---|---|
| **TB-LIST** | search · filter · sort · density · column-settings · bulk-action slot (appears on selection) |
| **TB-DETAIL** | back/breadcrumb · primary action (state-machine-permitted) · overflow menu · status chip |
| **TB-MANAGEMENT** | search · filter · assignee/queue filter · bulk-action slot · refresh; **no offset pager** |
| **TB-NONE** | no toolbar (static / auth / state pages) |

### 3.2 Skeleton presets (SK)
| ID | Shape |
|---|---|
| **SK-LIST** | toolbar bar + N row skeletons (respect density) |
| **SK-DETAIL** | hero block + tab bar + 2-column body skeleton |
| **SK-WIZARD** | stepper + single-step form skeleton |
| **SK-DASHBOARD** | KPI-card grid skeleton + panel placeholders |
| **SK-CARD** | card-grid skeleton (discovery/marketplace) |

### 3.3 Mobile presets (MB)
| ID | Adaptation |
|---|---|
| **MB-LIST** | table → stacked cards or h-scroll; filters → filter sheet; sticky primary CTA |
| **MB-DETAIL** | tabs → accordion; right rail → bottom sheet; sticky primary CTA |
| **MB-WIZARD** | one step per screen; sticky Next/Back; progress as compact stepper |
| **MB-DASHBOARD** | single-column KPI stack; nav → drawer |

*(Skeletons compose Doc-7B `skeleton`; toolbars compose Doc-7B primitives; mobile presets realize IA §7
/ UX §9. Tokens by name from DP — never redefined.)*

---

## 4. Analytics event grammar

Analytics events are **proposed presentation telemetry** — they **coin no Doc-2 §8 domain event** and
must respect GI-12 (never log excluded/blacklisted/buyer-private/non-invited data).

- **Grammar:** `entity.action` — lowercase, dot-delimited, past-tense verb. Optional surface prefix
  for ambiguity: `buyer.rfq.created`.
- **Entities (examples):** `rfq · quotation · engagement · vendor · product · invitation · category ·
  search · page · cta · filter · ai`.
- **Examples:** `rfq.created` · `rfq.submitted` · `quotation.shortlisted` · `award.completed` ·
  `search.performed` · `category.explored` · `cta.clicked` · `page.viewed`.
- **Forbidden:** free-form names, PII in payload, any field that re-identifies an excluded/non-invited
  party (byte-equivalence).

---

## 5. `Future:` field vocabulary

Use **only** these standard values in any "Future" field (avoids drift):

`—` (none) · `Localization` · `AI` *(→ `ESC-7-AI`)* · `Analytics` · `ESC-<id>` *(named gap in
[`esc_registry.md`](esc_registry.md))* · `Later wave`.

---

## 6. Cross-reference codes

Cite companions by **code-§** instead of prose, going forward (e.g. `DP §2.9`, `IA §4.2`, `SC §1 GI-03`):

| Code | Document |
|---|---|
| **DP** | design_philosophy.md |
| **IA** | information_architecture.md |
| **UX** | ux_patterns.md |
| **MX** | marketplace_ux.md |
| **PI** | page_inventory.md |
| **PT** | page_templates.md |
| **SS** | screen_specifications.md |
| **LP** | landing_page_spec.md |
| **SC** | shared_conventions.md (this) |
| **ER** | esc_registry.md |
| **GL** | glossary.md |
| **RF** | ui_realization_framework.md |

Frozen-corpus pointers keep their native form (`Doc-7C §5`, `Invariant #11`, `CHK-7-040`).

---

## 7. Component ownership (reference — coins nothing)

The component taxonomy is **owned by Doc-7B**; this is a reference legend, not a new taxonomy. Specs
classify a component by which tier it belongs to:

| Tier | Meaning | Source |
|---|---|---|
| **Primitive** | vendored shadcn/ui (button, input, dialog, table, …) | Doc-7B Appendix |
| **App component** | composition (data-table, form-field, status-chip, currency-display, pagination-control, file-link, empty-state, error-state, not-found) | Doc-7B Appendix |
| **Embedded (single-owned)** | trust-badge · billing-indicator · ai-advisory-panel · conversation-thread | Doc-7B §5 |
| **Shell slot** | navigation · org-switcher · notification center | Doc-7C |

---

## 8. Planning-metadata vocabularies

So SS/PI/LP use identical values (the per-page values live in the **PI §13 matrix**; sections use
Binding type):

| Attribute | Allowed values |
|---|---|
| **Complexity** | `Simple` · `Medium` · `Complex` · `Critical` |
| **Priority** | `P0` (walking skeleton) · `P1` (core) · `P2` (later) |
| **Interaction** | `Read-only` · `Editable` · `Transactional` · `Workflow` |
| **Visual hierarchy** | `Hero` · `Primary` · `Secondary` · `Support` |
| **Binding type** (sections) | `STATIC` · `READ` · `READ+ESC` |
| **Devices** | `D` · `T` · `M` · `F` (PI §13) |

**Test hooks:** every page/section is testable; the **acceptance criteria, a11y/perf tests, and QA
are owned by Doc-8** — specs carry a pointer ("Test → Doc-8"), never the criteria themselves.

---

## 9. Version-header convention

Each wave doc carries: `Status` (DRAFT/FROZEN + version) · `Date` · `Wave` · `Revision` (one line). The
v0.3 refactor stamps every doc to v0.3 with a one-line revision note.

---

## 10. Governance Alignment

This doc consolidates, by pointer, the rails already established in DP/IA/UX/MX/PI and the frozen
corpus; it restates none of them as authority and coins nothing. ESC handles → [`ER`](esc_registry.md).

---

*Non-authoritative. Conforms upward; coins nothing. On any conflict the frozen document wins and this
file is patched to match.*
