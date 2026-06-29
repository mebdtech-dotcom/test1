# iVendorz — UX Patterns

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.2** — Reusable UX Patterns (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29
**Wave:** 0D — UX Patterns
**Companions:** [`design_philosophy.md`](design_philosophy.md) (tokens) · [`information_architecture.md`](information_architecture.md) (structure)
**Revision v0.2:** added Navigation & Wayfinding patterns (Command Palette §3.1, Industrial Category
Explorer §3.2, Breadcrumbs §3.3), Enterprise Data Table (§2.6), Empty-State Library (§4.2),
Progressive Disclosure (§5.4), AI Interaction (§5.5), Layout & Composition — Detail Page + KPI Cards
(§6), **Marketplace Discovery patterns (§7)**, and a Mobile Interaction Library (§9).

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion**. It defines *reusable interaction patterns* — it **coins no
architecture, route, contract, state, transition, permission, event, or domain element**. It sits
**below** the frozen Doc-7 program and the state machines, and conforms upward.

```
Master Architecture → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                  ▲ state machines                                    ▲ this doc conforms upward
```

- **State machines are owned by Doc-4M** (consolidating Doc-2 §5.4/§5.5/§3.5/§10.5, realized in
  Doc-4E/Doc-4F). Every flow pattern **binds those states/transitions by pointer and invents none**
  (Doc-7A §7).
- **Doc-7A §5–§9** owns realization rules; **Doc-7B §5/§6** owns the embedded components + state
  primitives; **Doc-7C §5/§6/§8** owns the data layer, notification center, files/realtime. Referenced,
  never re-authored.
- Tokens come from [`design_philosophy.md`](design_philosophy.md); structure/nav from
  [`information_architecture.md`](information_architecture.md) — **referenced by name, never redefined.**
- **On any conflict, the frozen corpus wins and this doc is corrected** (CLAUDE.md §7, §11). Gaps are
  flagged `[ESC-7-*]` and halted — **never invented** (§12).

> **Scope of Wave 0D:** reusable UX patterns (the *how-it-behaves* layer). Not pages (0F), not screens
> (0H). A **specification, not code.**

---

## 1. Purpose & Scope

Instead of designing individual pages, Wave 0D defines the **reusable interaction patterns** every page
composes from — so behavior is consistent and governance-correct **by construction**, before any
screen is drawn. iVendorz is ~40% **marketplace discovery** and ~60% **enterprise workspace**; this
catalog serves both.

### 1.1 How each pattern is documented

| Field | Meaning |
|---|---|
| **Intent** | What the pattern is for |
| **Anatomy** | Parts + tokens (from `design_philosophy.md`) |
| **States** | default / loading / empty / error / disabled, etc. |
| **Bindings** | The wired Doc-5 contract(s) / Doc-4M states it reflects |
| **Governance** | The frozen rules it must honor (by pointer) |

### 1.2 The pattern catalog

| Group | Patterns |
|---|---|
| **2. Data & Lists** | Search · Filter · Sort · Pagination · Infinite scroll · **Enterprise Data Table** · Comparison |
| **3. Navigation & Wayfinding** | **Command Palette (⌘K)** · **Industrial Category Explorer** · Breadcrumbs |
| **4. State & Feedback** | Loading · Empty (+ **Empty-State Library**) · Error · Not-found · Notifications |
| **5. Input & Action** | Wizard · Upload · Optimistic action · **Progressive Disclosure** · **AI Interaction** |
| **6. Layout & Composition** | **Detail Page** · **Dashboard / KPI Cards** |
| **7. Marketplace Discovery** | Category Explorer · Product Discovery · Vendor Discovery · Industrial Search · Compare · Related/Similar |
| **8. Domain Flows** | RFQ · Internal approval · Quotation · Award · Post-award |
| **9. Mobile** | Interaction library (bottom sheet · swipe · FAB · filter sheet · drawer · sticky CTA) |

---

## 2. Data & List Patterns

### 2.1 Search

- **Intent:** context-aware lookup across the surface's entity set ([`information_architecture.md`](information_architecture.md) §5.1).
- **Bindings:** wired reads only — `search_catalog`, `list_vendor_directory`, `list_rfqs`, etc.
  Un-bound types (Industries/Brands/Standards) are **not modeled** (IA §5.1), never invented.
- **Governance:** results are **presentation over the contract result set**; ordering/filtering
  **never re-ranks governed M3 matching** (Doc-7A §6.3). A sort/filter change **re-queries the
  contract** (Doc-7B §4). Respects non-disclosure (§4).
- **States:** idle · typing (debounced) · loading (§4.1) · results · empty (§4.2) · error (§4.3).

### 2.2 Filter

- **Intent:** narrow a list by contract-supported facets.
- **Governance:** filters **re-query** with new parameters; facet **counts come from the contract**,
  **never client-computed** (a client total leaks exclusion counts — Doc-4A §7.5; CHK-7-042). Never
  re-ranks M3.
- **Anatomy:** filter rail (desktop) / filter sheet (mobile, §9); applied-filter chips; clear-all.

### 2.3 Sort

- **Intent:** reorder a list by a contract-supported key.
- **Governance (load-bearing):** a sort toggle **re-queries the contract**; it **never reorders the
  result set client-side**, and **never re-ranks governed M3 matching** (Doc-7A §6.3; Doc-7B §4). On
  governed result sets the contract order is authoritative.

### 2.4 Pagination (cursor)

- **Bindings (frozen):** **cursor-based only** — `page_size` + opaque `cursor`; client **never
  constructs/decodes the cursor** (Doc-4A §9.6). `page_size` from POLICY `*.list_page_size_max`
  (Doc-3 §12) — **never a UI literal**; oversize → 400 VALIDATION.
- **Governance:** **offset / page-number / index pagination forbidden** (offset leaks exclusion counts
  — Doc-4A §7.5; Doc-7C §5.3). `has_more` drives **"Load more"**; `total_count` is **contract-optional**
  — show a total only when the contract provides it.

### 2.5 Infinite scroll

- **Bindings:** a **presentation choice layered over cursor pagination** (consumes `has_more` +
  `next_cursor`). Doc-7A/7B/7C are **SILENT** (neither endorse nor forbid) → permitted **only** as
  cursor-backed.
- **Governance & a11y:** cursor-only (no offset); provide a **"Load more" fallback** + keyboard/focus
  continuity (`design_philosophy.md` §11); never client-compute a total. Use for *discovery* lists, not
  dense data tables (those use §2.6).

### 2.6 Enterprise Data Table

The workhorse of the enterprise surfaces (~60% of workspace UI). Builds on Doc-7B's `data-table` and
the **Table Specification in [`design_philosophy.md`](design_philosophy.md) §5.1** (referenced, not
duplicated).

- **Intent:** dense, scannable, action-capable tabular data (RFQ lists, quotations, vendors, admin queues).
- **Anatomy / capabilities:** sticky header · **density** (compact / default / comfortable —
  `design_philosophy.md` §3.3) · **row selection** + **bulk-action** bar · **column pin** (freeze
  leading columns) · **column resize** (persisted presentation pref) · row hover/selected states.
- **Sorting:** a column toggle **re-queries the contract** — it **never reorders cursor results
  client-side and never re-ranks M3** (§2.3).
- **Pagination:** **cursor only** (§2.4) — *not* offset/"server page-number". `has_more` → load-more
  or next/prev cursor; no jump-to-page-N.
- **Export:** renders **only the exclusion-applied data the user can already read** — never exports
  buyer-private / excluded / blacklisted signals (Invariant #11). Large exports follow **create-then-poll**
  (§5.2, `ASYNC_PENDING`). A dedicated export-grant contract, if required, is **`[ESC-7-API]`** (§12).
- **States:** loading (skeleton rows) · empty (§4.2) · error (§4.3) · partial (loading more).

### 2.7 Comparison (governed — RFQ)

- **Bindings:** `get_comparison_statement` — a **read-only, System-generated** decision-support view
  (Doc-7F §6.1). The buyer **reads** it; the UI never generates it.
- **Governance (moat, load-bearing):** the comparison — **and any AI advisory panel** — **never
  auto-recommends, ranks-to-winner, auto-selects, or shows a "recommended winner"** (Doc-5E R6;
  Doc-3 §9.1; Invariant #12). Quotations render in the **contract's order**. Vendor isolation: a vendor
  never sees a competitor's quotation; comparison shows **bands, not competitor values** (Doc-3 §7.5).
  `award_rfq` is a **deliberate, unranked** buyer choice (§8.4).
- *(Public, ungoverned product/vendor comparison is a different pattern — see §7.5.)*

---

## 3. Navigation & Wayfinding Patterns

### 3.1 Command Palette (⌘K)

The realization of the **Universal Command Center** ([`information_architecture.md`](information_architecture.md) §5.2).

- **Intent:** keyboard-first hub — universal navigation, quick actions, AI entry, entity search,
  recent pages.
- **Anatomy:** trigger `⌘K` / `Ctrl-K` (desktop) · a **search button** on mobile (§9) · grouped
  results (Navigate · Actions · Search results · Ask AI · Recent).
- **Bindings:** navigation targets + the Quick-Create command set (`create_rfq`, etc., IA §4.9);
  search delegates to §2.1; "Ask AI" hands off to §5.5.
- **Governance:** **gating mirrors nav derivation** — never offers a destination, command, or AI
  action the user isn't entitled to (entitlement via wired contracts, **never name-strings**;
  Invariant #10), and never reveals a non-disclosable entity (§4). Recent-pages is **local ephemeral
  state** only. Client component; owns no authoritative state.

### 3.2 Industrial Category Explorer

The realization of [`information_architecture.md`](information_architecture.md) §5.3 — **public
marketplace only** (the iVendorz answer to the consumer "mega menu"; a discovery moat).

- **Anatomy:** **four synchronized columns** `Parent → Child → Child-2 → Child-3` (entire taxonomy
  visible at once) · **single hover** to drill (no click-churn) · category **icons** (`design_philosophy.md`
  §10) · **in-explorer search** · **featured suppliers** + **product counts** per node · **"View all"**
  per column · **collapses to an accordion drawer on mobile** (§9).
- **⚠️ Governance / gap:** the full anonymous tree is blocked — `list_categories` has **no Public
  projection** → **`[ESC-7-API-CATNAV]`** (§12). **Interim:** render **`search_catalog` facets** only;
  product counts via facet aggregations; featured-suppliers per node needs a public vendor-by-category
  read (flagged under the same ESC). Never coins the contract.

### 3.3 Breadcrumbs

- **Intent:** hierarchical context on detail pages (`Section / List / Item`).
- **Anatomy:** **desktop** full trail · **mobile** truncated (leaf + back) · **overflow** collapses
  middle nodes into an ellipsis menu · **dynamic** labels from contract data (leaf = human ref, e.g.
  `RFQ-2026-000123`) · **context-aware** to the active surface/section.
- **Governance:** **non-disclosure-safe** — never expose a parent the user may not view; the **URL uses
  opaque IDs** (UUIDs), human refs are display labels only (IA §8).

---

## 4. State, Feedback & Resilience Patterns

These realize the **Doc-7B §6 state primitives** — encoded once so every surface inherits the
non-disclosure rules.

### 4.1 Loading / Skeleton

- Suspense-boundary fallback for streamed RSC reads (Doc-7C §7). **Skeletons mirror the final layout**
  (`.iv-skeleton`, `iv-shimmer` — `design_philosophy.md` §2.6); **no full-page spinners**. Respect
  `prefers-reduced-motion` (static placeholder).

### 4.2 Empty states + Empty-State Library

- **Pattern:** render when the contract returns an **empty (exclusion-applied) result**. **Never
  compute a client-side total** to decide emptiness. Anatomy: icon (not heavy illustration on dense
  surfaces) · concise headline · single CTA · subtext (`design_philosophy.md` §4.4–4.6).
- **Governance (load-bearing):** an empty list caused by exclusion must be **byte-identical** to a
  genuinely empty list — emptiness **never reveals** that something was filtered out (Invariant #11).
- **Library (domain-specific empties — reusable):**

| Context | Headline (illustrative) | Primary CTA |
|---|---|---|
| No RFQs | "No RFQs yet" | Create RFQ |
| No suppliers / vendors | "No vendors match" | Adjust filters / browse categories |
| No products | "No products listed" | Add product (vendor) |
| No quotations | "No quotations yet" | — (awaiting vendor responses) |
| No invitations | "No invitations" | Browse marketplace (vendor) |
| No approvals | "Nothing to approve" | — |
| No payments | "No payment records" | Record payment |
| No notifications | "You're all caught up" | — |
| No search results | "No matches for '…'" | Clear search / broaden |
| No favorites | "No saved items" | Browse marketplace |

### 4.3 Error handling

- **Branch on `error.error_class` / `error.error_code` — never on HTTP status alone** (Doc-7A §5.3).
  **Never invent a class/code/status** → **flag-and-halt `[ESC-7-API]`**. **No protected enrichment**
  (Doc-7A §5.4). Always surface `reference_id`.

| `error_class` | Status | UI realization | Remediation |
|---|---|---|---|
| `VALIDATION` | 400 | Inline `field_errors` on the form | Correct + resubmit |
| `AUTHORIZATION` | 403 | Not-permitted **only where right-to-know exists**; else collapse to NOT_FOUND | No retry |
| `QUOTA` | 403 | Entitlement-exhausted notice (link to Billing) | Not retryable |
| `RATE_LIMITED` | 429 | Throttled notice; honor `Retry-After` | Backoff + retry |
| `NOT_FOUND` | 404 | Not-found — **byte-identical to genuine absence** (§4.4) | No distinction shown |
| `CONFLICT` | 409 | Stale-state notice | Refresh + **idempotent** retry |
| `STATE` | 409 | Illegal-transition notice | **Re-derive offerable transitions**, no blind retry |
| `REFERENCE` / `BUSINESS` | 422 | Domain-rejection message from `error.message` | Correct domain issue |
| `DEPENDENCY` | 503 | Transient-dependency notice | Backoff per declared interval |
| `ASYNC_PENDING` | — | Accepted → processing | **Poll the status resource** (§5.2) |

### 4.4 Not-found

- Byte-identical to genuine absence — **no difference in copy/layout/timing/telemetry** between
  "forbidden" and "does not exist" (Doc-7A §8.2; CHK-7-041). 403 only where right-to-know is established.

### 4.5 Notifications

- **Owned by Doc-7C** (notification center slot) + Doc-7B primitives (toast · list-item · badge-count).
  Renders **M6 `Doc-5H`** reads; **mark-read / dismiss** = server actions to `mark_notification_read` /
  `archive_notification`.
- **Governance:** **non-disclosure-bound** (Doc-7C §6.3; CHK-7-040). **Realtime is transport** — an
  event prompts a **re-fetch**, never the source of truth (Doc-7C §6.4).
- **Anatomy:** transient **toast** + persistent **center** (unread badge, mark-read, archive).

---

## 5. Input & Action Patterns

### 5.1 Wizard (multi-step)

- **Intent:** decompose a complex authoring task (canonical: **RFQ creation**) into steps.
- **Pattern:** stepper (`design_philosophy.md` §6); per-step validation on Next; a resumable **draft**
  persisted via wired commands (`create_rfq` → `update_rfq`), not local state; final step **submits**
  (`submit_rfq`).
- **Governance:** reflects the **draft** state; offers only machine-permitted next actions (Doc-7A §7);
  invents no state-mutating step outside a contract.

### 5.2 Upload & async jobs

- **File uploads:** blobs transfer **directly to Supabase Storage**; the wired contract carries a
  **`file_ref` only, never the binary** (Doc-2 §9; Doc-7C §8.2). A **client-facing upload-grant is
  absent from the wired surface → `[ESC-7-API]`** (§12) — never coined.
- **Create-then-poll:** on **`ASYNC_PENDING`**, **poll the status resource**, not the error envelope
  (Doc-7A §5.3). Canonical: **import** (`submit_import_job` → poll), **document generation**
  (`generate_document`, System async — read via grant, never run client-side).
- **Governance:** no UI component owns authoritative job state; Inngest/outbox effects surface as
  **state changes via contracts** (Doc-7C §8).

### 5.3 Optimistic action & reconciliation

- **Optimistic UI permitted; server owns state.** On `CONFLICT` (409) → refresh + **idempotent**
  retry; on `STATE` (409) → **re-derive offerable transitions** (no blind retry) (Doc-7A §7.2). Each
  mutation carries a **stable idempotency key per submission** within `*.idempotency_dedup_window`
  (Doc-7A §5.6 / Doc-7C §5.4).

### 5.4 Progressive Disclosure

- **Intent:** enterprise density without overload — reveal complexity on demand.
- **Pattern:** **Basic → Advanced → Expert** tiers (e.g. advanced filters, extra table columns,
  optional form fields, raw spec views). Persisted presentation preference; pairs with table density
  (§2.6 / `design_philosophy.md` §3.3).
- **Governance:** **never hide required, safety, or compliance information** behind a tier; disclosure
  is presentation only and changes no authoritative data.

### 5.5 AI Interaction Pattern

Documents the **interaction** of M9's advisory — the frozen **`ai-advisory-panel`** embedded component
(Doc-7B §5, contract `Doc-5K`). This pattern **does not re-author** that component; it standardizes how
surfaces use it (and the Command Center "Ask AI", §3.1; IA §4.10).

- **Capabilities:** **Ask AI** · **Explain** (a spec, a status) · **Summarize** · **Generate / Draft**
  (e.g. pre-fill an RFQ). Each advisory output may carry **confidence** and **citations** surfaced from
  the advisory payload (never fabricated by the UI).
- **Governance (load-bearing):**
  - **AI suggests; modules decide** (Invariant #12 / Golden Rule #6). The panel **never executes an
    action** — it drafts/explains; the **user confirms** and the **owning module commits** via the same
    wired command + gating as Quick Create / §5.3.
  - **Non-recommending** — never ranks vendors/quotations to a winner, auto-selects, or re-ranks M3
    (R6; Doc-7A §6).
  - **Non-disclosure** — never reveals an excluded/blacklisted/buyer-private signal (Invariant #11).
  - **Future activation** — AI is future-activation (CLAUDE.md §2); reserved. Anything beyond the wired
    `Doc-5K` advisory is **`[ESC-7-AI]`** (§12).

---

## 6. Layout & Composition Patterns

### 6.1 Detail Page Pattern

One reusable skeleton for every entity detail (Vendor · Product · RFQ · PO · Trade Invoice ·
Engagement), so detail pages are consistent by construction. Maps to `design_philosophy.md` §6 Details.

| Region | Content | Governance |
|---|---|---|
| **Hero** | Identity + primary signal (status chip, trust ring) + key meta | Trust/score **read-only** (M5); status from Doc-4M |
| **Tabs** | Overview / facets (presentation switching) | Tabs are presentation (IA §4.4) |
| **Actions** | Primary + secondary actions | **Only machine-permitted transitions** (Doc-7A §7) |
| **Timeline** | Lifecycle / state history | From the **immutable audit** trail (Invariant #8; M0) |
| **Sidebar** | Metadata, context, relations summary | — |
| **Audit** | Who/what/when | **Immutable audit** (M0-owned), read-only |
| **Files** | Attached documents | `file_ref` / Storage; upload via **`[ESC-7-API]`** (§5.2) |
| **Relations** | Linked entities (by ID/contract) | Referenced by ID; no cross-module coupling |

### 6.2 Dashboard / KPI Cards

- **Intent:** reusable at-a-glance metrics on dashboards.
- **Variants:** **Metric** (single value) · **Trend** (value + delta/sparkline) · **Chart** · **Status**
  · **Progress** (bar) · **Health** (composite). Charts/sparklines use the **forward-looking data-viz
  tokens** (`design_philosophy.md` §2.12).
- **Governance:** metrics come from **contract reads** — never client-computed authoritative figures;
  trust/score/tier cards are **read-only** (M5); counts respect non-disclosure (no excluded counts).
  `{amount, currency}` per field, BDT default (Doc-2 §0.4).

---

## 7. Marketplace Discovery Patterns

> iVendorz's largest surface area. All discovery is **public-projection** (Doc-5D), has **zero concept
> of buyer-private status** (a blacklisted vendor still appears publicly — Invariant #11), and renders
> **published-only** content (no draft leaks). A consistent pattern library here keeps 100+ marketplace
> pages aligned (Wave 0F).

### 7.1 Category Explorer
The public taxonomy navigator — see **§3.2** (with its `[ESC-7-API-CATNAV]` gap).

### 7.2 Product Discovery
- **Bindings:** `search_catalog` (BC-MKT-6) — cards, facets, filters (§2.1–2.6).
- **Gap:** an anonymous **product detail** page is blocked — `get_product` is User-only →
  **`[ESC-7-API-PRODDETAIL]`** (§12). Interim: products render from `search_catalog` results.

### 7.3 Vendor Discovery
- **Bindings:** `list_vendor_directory` + `get_public_vendor_profile` (BC-MKT-6); vendor cards carry a
  **trust badge** (read-only, M5 `Doc-5G`). Microsite = published M2 projection.
- **Governance:** trust is **displayed, never computed** (M2 reads, M5 owns).

### 7.4 Industrial Search
- **Intent:** technical, spec-oriented discovery (by category, capability, specification).
- **Bindings:** `search_catalog` (FTS now, Meilisearch future); facets are contract-provided (§2.2).
  Capability flags rendered as a **matrix**, never a label (Invariant #1).

### 7.5 Compare (Vendors / Products) — public, ungoverned
- **Intent:** anonymous side-by-side of **public** vendor profiles or products (a discovery aid).
- **Governance:** presentation over public contract reads; **distinct from the governed RFQ comparison
  (§2.7)** — public compare **implies no matching, ranking, or recommendation** and never re-ranks M3;
  no buyer-private data exists here (Invariant #11).

### 7.6 Related Products / Similar Suppliers
- **⚠️ Gap:** there is **no "related" / "similar" / recommendation contract** in the wired surface →
  **`[ESC-7-API]`** (or a future M9 advisory under §5.5's AI governance). **Interim:** show
  **same-category** items via `search_catalog` facets, clearly labeled "Same category" — **never
  "Recommended"** (a recommendation is governed AI output, not coined here).

---

## 8. Domain Flow Patterns (state-machine-bound)

> Every flow **binds the canonical Doc-4M states/transitions by pointer**. The UI **offers only the
> transitions the machine permits for the actor in the current state, and invents no state, edge, or
> label** (Doc-7A §7.1). Status colors from `design_philosophy.md` §2.13.

### 8.1 RFQ flow

**Canonical states** (Doc-4M §M4 / Doc-2 §5.4):
`draft → [pending_internal_approval] → submitted → under_review → matching → vendors_notified →
quotations_received → buyer_reviewing → shortlisted → closed_won` · terminal: `closed_lost`,
`cancelled`, `expired`.

```
draft ──submit_rfq──▶ pending_internal_approval ──approve_rfq──▶ submitted ──(moderation)──▶ under_review
  ▲ reject_internal_rfq ┘        (self-approve path skips the gate)                              │
  │                                                                      moderate (pass) ───────┘──▶ matching
  └──◀ moderate (reject, reason) ── under_review                                                       │
                                                                      (system routes wave) ───────────┘──▶ vendors_notified
 vendors_notified ──(first quote)──▶ quotations_received ──(buyer opens compare)──▶ buyer_reviewing
   buyer_reviewing ──shortlist_quotation──▶ shortlisted ──award_rfq──▶ closed_won
                                            shortlisted ──close_lost_rfq──▶ closed_lost
   any active ──cancel_rfq (buyer)──▶ cancelled        any active ──expire_rfq (system)──▶ expired
```

- **Actors/triggers (Doc-4E):** buyer (`submit/approve/reject/shortlist/award/close/cancel`), Admin
  moderator (`moderate_rfq`), **System** (matching pipeline, routing wave, expiry). `matching` is an
  **internal** state.
- **Governance:** **no public RFQ board** (Doc-3 §5.1); cancel/expire **cascade** open quotations +
  invitations to `expired`; reopen only via `reissue_rfq` (terminals never reopen).

### 8.2 Internal approval flow

- On `submit_rfq`, an active approval chain → `pending_internal_approval`; approver `approve_rfq` →
  `submitted` or `reject_internal_rfq` (mandatory reason) → `draft`. A submitter with `can_approve_rfq`
  uses the **self-approve path**. **No auto-approve timeout** (Doc-3 §1.2).
- **Award-threshold approval:** values above the org's configured threshold require Director/Owner
  approval **on award** (Doc-3 §9.4) — explicit gate, sourced from Identity config (consumed, not authored).

### 8.3 Quotation flow (vendor)

**Canonical states** (Doc-4M / Doc-2 §5.5): `draft → submitted` · `submitted → submitted (new version)`
· `→ withdrawn` · `→ shortlisted` · `→ selected` · `→ not_selected` · `→ expired`.

- **Bindings:** `submit_quotation` / `revise_quotation` (new immutable version) / `withdraw_quotation`
  / `request_late_extension` (Doc-4E §E7). Versioned (Invariant #8).
- **Governance:** **received-only** — a vendor never sees competitor quotations, exclusion reason, or
  count of RFQs-not-invited-to (**byte-equivalence**, Invariant #11 / CHK-7-040). Withdraw = **zero
  performance penalty** (Doc-3 §5.4). Gated by `quotation_visibility`.

### 8.4 Award flow

- From `shortlisted`, the buyer issues `award_rfq` → RFQ `closed_won`; **exactly one** `selected`
  quotation (1:1), others → `not_selected`; an **engagement** is created (`open`) via the
  `RFQClosedWon` seam — atomic (Doc-4E §E8.4 / Doc-4F §F5.1).
- **Governance (load-bearing):** award is **explicit, unranked, never auto-recommended** (Doc-3 §9.1;
  R6); value snapshotted immutably; **split sourcing = `reissue_rfq`**, never multi-award.

### 8.5 Post-award flow (engagement & documents)

**Engagement** (Doc-4F §F5.2): `open → in_delivery → completed → closed` (terminal). A dispute is an
**audit action + `DisputeRecorded` event**, not an engagement state.

| Document | Model | Governance |
|---|---|---|
| LOI · PO · WCC | **Versioned** (no status machine); `issue_*` / `revise_*` (reason) | Immutable; **overwrite forbidden** (Invariant #8); PO needs `can_approve_po`; **WCC** emits `WorkCompletionIssued` |
| Challan | Versioned; `record_delivery` | Emits `DeliveryRecorded` |
| Trade invoice | `issued → partially_paid → paid \| disputed \| cancelled` | **Records only — DF-6: not `billing.platform_invoices`, no funds custody**; `disputed` emits `DisputeRecorded` |
| Payment | `recorded → confirmed` | **Record-only, no funds movement**; `confirm_payment` needs `can_approve_payment` |

- **Governance:** the platform **records** post-award documents, **never settles money** (R8 / DF-6).
  `{amount, currency}` per field, BDT default; all docs versioned + immutable.

---

## 9. Mobile Interaction Library

Realizes the responsive/mobile shell of [`information_architecture.md`](information_architecture.md) §7
as reusable interactions. Touch targets + focus order meet the a11y baseline (`design_philosophy.md` §11).

| Pattern | Use |
|---|---|
| **Bottom sheet** | Contextual actions, detail peeks, pickers |
| **Filter sheet** | The mobile form of the filter rail (§2.2) |
| **Drawer** | Primary navigation off-canvas (IA §7.3) |
| **FAB** | Single primary mobile action (ties to Quick Create, IA §4.9) — one per screen, never a cluster |
| **Swipe actions** | Row quick-actions — **must** have a visible non-swipe alternative (a11y) |
| **Sticky CTA** | Pin the primary action (e.g. "Submit RFQ", "Send quotation") above the fold |
| **Keyboard handling** | Inputs never obscured by the on-screen keyboard; sticky CTA repositions |

---

## 10. Cross-cutting Pattern Rules

1. **State-machine fidelity** — offer only Doc-4M-permitted transitions; invent no state/edge (Doc-7A §7).
2. **Content ≠ Presentation** — search/sort/filter is presentation; **never re-ranks M3** (Doc-7A §6).
3. **Cursor-only lists** — POLICY `page_size`, opaque cursor; **no offset/page-number** (Doc-7C §5.3).
4. **Error by class, not status** — branch on `error_class`; no invented class; no protected
   enrichment; surface `reference_id` (Doc-7A §5.3–5.4).
5. **Non-disclosure / byte-equivalence** — no list, count, facet, empty-state, notification, or error
   reveals an excluded/blacklisted/buyer-private signal; not-found ≡ absence (Invariant #11; CHK-7-040/041).
6. **Server owns state** — optimistic UI reconciles on 409; idempotency key per submission (Doc-7A §7).
7. **Files & async** — blobs to Storage (`file_ref` only); `ASYNC_PENDING` → poll; upload-grant gap =
   `[ESC-7-API]` (Doc-7C §8).
8. **AI suggests; modules decide** — comparison/AI/wizard never recommend-to-winner, auto-select, or
   execute actions (Invariant #12; R6) (§5.5).
9. **Currency per field** — `{amount, currency}`, BDT default, never hardcoded (Doc-2 §0.4).
10. **Read-only governance signals** — trust/performance/tier are displayed, never computed (M5-owned).

---

## 11. Handoff to Next Waves

| Wave | Builds on these patterns |
|---|---|
| **0E — Marketplace UX** | Composes §7 discovery + §8 flows into Buyer/Vendor/Guest/Admin journeys |
| **0F — Page Inventory** | Each page declares which patterns (§2–§9) it uses |
| **0G — Templates** | Page templates wire patterns into layouts (`design_philosophy.md` §6) |
| **0H — Screen Design** | Screens instantiate patterns — consistent by construction |

---

## 12. Governance Alignment & Precedence

Constraints honored **by pointer** (reference-never-restate):

| Constraint | Source | Where honored |
|---|---|---|
| State-machine UI: permitted transitions only; no invented state/edge | Doc-7A §7 / Doc-4M | §5.1, §5.3, §6.1, §8 |
| Error by `error_class`, no protected enrichment, no invented class | Doc-7A §5.3–5.4 / Doc-5A §6.2 | §4.3, §4.4 |
| State primitives (loading/empty/error/not-found) | Doc-7B §6 | §4 |
| Cursor pagination; offset/page-number forbidden; POLICY page_size | Doc-7C §5.3 / Doc-3 §12 | §2.4, §2.5, §2.6 |
| Content ≠ Presentation; never re-rank M3 | Doc-7A §6 / Golden Rule #4 | §2.1–2.3, §2.6, §2.7, §7.5 |
| Comparison read-only, System-generated, non-recommending | Doc-7F §6 / Doc-3 §9.1 / R6 | §2.7, §5.5, §8.4 |
| AI suggests; modules decide; never executes; non-recommending; future | Invariant #12 / GR #6 / `Doc-5K` | §5.5, §2.7 |
| Award explicit, unranked, 1:1; reissue not multi-award | Doc-2 §5.4 / Doc-3 §9.1 | §8.4 |
| Post-award records only; no funds movement (DF-6 / R8) | Doc-4F §F5 / Doc-2 | §8.5 |
| Versioned, immutable, never overwrite; immutable audit | Invariant #8 | §6.1, §8.3, §8.5 |
| Non-disclosure / byte-equivalence (lists, empties, export, counts) | Invariant #11 / CHK-7-040/041 | §2.6, §4.2, §4.4, §7, §8.3 |
| Notification center M6-owned; Realtime=transport | Doc-7C §6 / `Doc-5H` | §4.5 |
| Optimistic reconcile on 409; idempotency key | Doc-7A §7 / §5.6 | §5.3 |
| Nav/palette gating via wired contracts, not name-strings | Invariant #10 | §3.1 |
| Read-only trust/score signals (M2 reads, M5 owns) | Governance Signals §4 | §6.2, §7.3 |
| Currency per field, BDT default | Doc-2 §0.4 | §6.2, §8.5 |

### `[ESC-7-*]` register (gaps flagged, never coined)

| Tag | Gap | Interim |
|---|---|---|
| `[ESC-7-API]` (file-upload grant) | No client-facing upload-grant (signed-URL) in the wired surface | Blobs to Storage; `file_ref` only; await additive patch (§5.2, §6.1) |
| `[ESC-7-API]` (export grant) | No dedicated bulk-export contract | Export only user-readable data; large export via create-then-poll (§2.6) |
| `[ESC-7-API]` (related/similar) | No "related products" / "similar suppliers" recommendation contract | Same-category facets, labeled "Same category", never "Recommended" (§7.6) |
| `[ESC-7-API-CATNAV]` | `list_categories` has no Public projection → public Category Explorer tree blocked | Explorer renders `search_catalog` facets only (§3.2) |
| `[ESC-7-API-PRODDETAIL]` | `get_product` is User-only → no anonymous product page | Products render from `search_catalog` results (§7.2) |
| `[ESC-7-AI]` | A global conversational AI navigator beyond `Doc-5K` advisory is absent | AI reserved; limited to `Doc-5K` advisory until an additive patch (§5.5) |
| `[ESC-RFQ-POLICY]` / `[ESC-OPS-POLICY]` | Some idempotency dedup-window POLICY keys not yet registered | Use the named POLICY key once registered; never a UI literal (§5.3) |

> Inherits the cross-doc registers from [`information_architecture.md`](information_architecture.md) §10
> (incl. `[ESC-7-API-ADS]`).

---

*This document is non-authoritative. It describes reusable UX patterns. It operates under the frozen
corpus authority order (CLAUDE.md §7) and the Doc-7 precedence chain (§0); it introduces no
architecture change and coins no state, transition, contract, or permission. On any conflict, the
frozen document wins and this file is patched to match.*
