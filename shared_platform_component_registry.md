# iVendorz — Shared Platform Component Registry

| Field | Value |
|---|---|
| **Document type** | NON-AUTHORITATIVE cross-team coordination ledger (Frontend Implementation) |
| **Owner** | Frontend Implementation Teams 1–3 (Public · Buyer · Vendor), jointly maintained |
| **Date** | 2026-06-30 · v1.0 |
| **Authority** | Below the frozen corpus. On any conflict the FROZEN **Doc-7B** (Design System & Component Kit) + **Doc-7C** (App Shell) + **`REPOSITORY_STRUCTURE.md`** win, and this file is patched to match. **Coins nothing.** |
| **Mandate** | CTO cross-team recommendation (2026-06-30): *"Before Milestone 2 begins, establish a Shared Platform Component Registry … to prevent duplication across Teams 1–3."* |

> **What this is.** A single ledger that records, for every reusable frontend component, **where it lives and why**, so the three parallel FE teams never duplicate a component or silently fork the design system. It is a *decision-support + inventory* tool — it grants **no** authority to modify the FROZEN Doc-7B kit (that remains a kit-owner / Board action; see §4) and it invents no component, contract, or token.

---

## 1. The classification decision (every new reusable component answers these)

Before building any new reusable component, answer the CTO's five questions **in order**. The first "yes" that resolves placement wins.

1. **Does an existing component already do this?** → If yes in the **Doc-7B kit** (`src/frontend/`), **reuse it** (compose; never duplicate). If yes in **another team's workspace scope**, see §4 (promote, don't copy).
2. **Is it Public-only?** → lives in `app/(public)/_components/` (Team 1).
3. **Is it Buyer-only?** → lives in `app/(app)/(buyer)/_components/` (Team 2).
4. **Is it Vendor-only?** → lives in `app/(app)/_components/vendor/` (Team 3).
5. **Is it shared chrome** (topbar/sidebar/org-switcher/notification-center/command-center frame)? → it belongs to the **Platform Shell (Doc-7C)** — coordinate cross-team before building; do not fork per workspace.
6. **Should it move into Doc-7B?** → only if it is a **presentation primitive/app-component proven reusable across ≥ 2 workspaces** AND it carries no workspace-specific business shaping. Promotion is a **frozen-foundation change** → §4.

### Placement decision table

| If the component is… | It lives in… | Owner | Notes |
|---|---|---|---|
| A generic presentation primitive/app-component (button, table, field, badge, skeleton, empty/error/not-found) | **Doc-7B kit** `src/frontend/` | Kit owner (Doc-7B) | **FROZEN** — add/modify only via §4 (kit-owner + Board) |
| Shared authenticated chrome (topbar, sidebar frame, org-switcher, notification center, ⌘K) | **Platform Shell** (Doc-7C) | Cross-team (Doc-7C) | Build once; never one-per-workspace |
| Anonymous/public-surface composition | `app/(public)/_components/` | Team 1 (Public) | |
| Buyer-workspace composition | `app/(app)/(buyer)/_components/` | Team 2 (Buyer) | |
| Vendor-workspace composition | `app/(app)/_components/vendor/` | Team 3 (Vendor) | |
| Single-owned embedded module surface (trust-badge, conversation-thread, ai-advisory-panel, billing-indicator) | **Doc-7B `§5` embedded** | Owning module via Doc-7B | Read-only; single-owned (Doc-7B §5) |

> **Default bias:** build at the **narrowest** scope that satisfies the need (workspace-scoped), and **promote upward only when reuse is proven** (§4). A buyer-scoped composition that *might* be reused later is **not** yet a kit component.

---

## 2. Tiers (most-shared → least-shared)

- **Tier 0 — Doc-7B Frozen Kit** (`src/frontend/`): the authoritative, frozen presentation system. Primitives (`primitives/`), app components (`components/`), embedded module surfaces (`embedded/`). **Do not modify without §4.**
- **Tier 1 — Platform Shell** (Doc-7C): the shared authenticated `(app)` chrome. *(Not yet extracted to a shared module — see §5 "Open shared-platform items".)*
- **Tier 2 — Workspace-scoped compositions**: per-team `_components/`. Composed **from** Tier 0/1; own no business logic, no data, no state beyond ephemeral UI.

---

## 3. Registry entry template

```
| Component | Tier/Scope | Composes (Tier-0/1) | Used by | Reuse signal | Promotion candidate? |
|-----------|-----------|---------------------|---------|--------------|----------------------|
| <Name>    | Buyer     | Card, Button        | P-BUY-0x| 1 workspace  | No (single workspace) |
```

`Reuse signal` = how many distinct **workspaces** (Public/Buyer/Vendor) consume it. `Promotion candidate` flips to **Yes** at **≥ 2 workspaces** → open a §4 promotion.

---

## 4. Promotion protocol (workspace-scoped → shared)

A workspace-scoped component is promoted **only when proven reusable across ≥ 2 workspaces** (the CTO rule). Promotion target depends on what it is:

1. **To another team for reuse:** the second team **imports the existing component** (or the two teams jointly lift it to Tier 1/0) — **never copy-paste** a second implementation. Duplication is the failure this registry exists to prevent.
2. **Into the Doc-7B kit (Tier 0):** this is a **change to the FROZEN foundation** (`[[frontend-foundation-frozen]]`). It requires the **kit owner + Board** per `CLAUDE.md §8` (architecture-affecting / frozen-doc change) — it is **not** a team-level decision. Open a promotion request citing: the two consuming workspaces, the generic (business-free) API, and the token usage.
3. **Into the Platform Shell (Tier 1, Doc-7C):** cross-team agreement; the shell is shared chrome, built once.

Until promotion completes, the component stays at its current scope; the second consumer **waits or imports**, it does not fork.

---

## 5. Current inventory

### 5.1 Tier 0 — Doc-7B Frozen Kit (authoritative; by pointer — do not restate)

- **Primitives** (`src/frontend/primitives/`): `button` · `input` · `badge` · `card` · `skeleton` · `separator` · `tooltip` · `dropdown-menu` · `dialog` · `sheet` · `tabs` · `avatar`. *Deferred (kit-owner): `select` · `checkbox` · `radio` · `switch` · `popover` · `toast` · `table`.*
- **App components** (`src/frontend/components/`): `empty-state` · `error-state` · `not-found` · `status-chip` · `currency-display` · `pagination-control` · `file-link` · `form-field`. *Deferred (kit-owner): `data-table`.*
- **Embedded** (`src/frontend/embedded/`): `trust-badge`. *Deferred: `conversation-thread` (M6) · `ai-advisory-panel` (M9, ESC-blocked) · `billing-indicator` (M7).*

### 5.2 Tier 1 — Platform Shell (Doc-7C)

**LANDED 2026-06-30 — the canonical `AppShell` is live** at `app/(app)/_components/shell/` (Doc-7C realization; PLATFORM-owned, cross-team). It frames every authenticated `(app)` surface: skip-link → `Topbar` → optional breadcrumb bar → `Sidebar` + `<main>` + footer → mobile `BottomBar`. Fed by a typed `ShellViewModel`; wires nothing (presentation-only). **Exports (reuse, do not fork):** `AppShell` · `Topbar` · `Sidebar` · `MobileNav` · `BottomBar` · `OrgSwitcher` · `NotificationCenter` · `UserMenu` · `QuickCreate` · **`PageHeader`** (owns the page `<h1>`: title · ref-mono · status · actions) · **`Breadcrumbs`** (IA §4.5, non-disclosing) · types (`ShellViewModel`/`NavSection`/`NavItem`/`BreadcrumbItem`/…) · `NavIconKey` registry.

> **Buyer M1's bespoke shell (`BuyerTopbar`/`BuyerSidebar`/`BuyerMobileNav`) was RETIRED into this canonical `AppShell`** — exactly the Tier-1 promotion this registry's §4.3 anticipated (one shell, multiple workspaces). The buyer `layout.tsx` now mounts `<AppShell vm={BUYER_SHELL_VM}>`; `buyer-nav-model.ts` expresses the nav as the shell's `NavSection[]` with serializable icon keys. **Team 3 (Vendor) must mount this same `AppShell` with its own nav VM — never build a second shell.**

### 5.3 Tier 2 — Buyer-scoped compositions (Team 2)

| Component | Composes | Used by | Reuse signal | Promotion candidate? |
|---|---|---|---|---|
| ~~`BuyerTopbar`/`BuyerSidebar`/`BuyerMobileNav`~~ **RETIRED** → Tier-1 `AppShell` | — | — | — | **Promoted** to Tier 1 (§5.2) |
| `KpiStatCard` | Card | P-BUY-01 | 1 (Buyer) | No |
| `WorkQueueCard` | Card, Button, EmptyState, `DataListTable` | P-BUY-01 | 1 (Buyer) | No |
| `DataListTable<T>` | (semantic table) | P-BUY-01, P-BUY-06 | 1 workspace (2 screens) | **Watch** — generic; **Doc-7B `data-table` candidate** if Vendor/Public need it (→ §4.2) |
| `ListToolbar` | Input, Button | P-BUY-06 | 1 (Buyer) | Watch |
| `ActivityTimeline` | Card, EmptyState | P-BUY-01, P-BUY-08 (lifecycle) | 1 workspace (2 screens) | Watch |
| `format` (Money/Ref/formatDate/formatInstant) | CurrencyDisplay | P-BUY-01/06/08 | 1 (Buyer) | Watch |
| `RfqDetailTabs` (client tab chrome) | Tabs | P-BUY-08 | 1 (Buyer) | No (RFQ-specific) |
| `state-display` (Doc-4M state → label/tone) | — | P-BUY-01/06/08 | 1 (Buyer) | No (domain mapping) |
| list/detail/dashboard skeleton presets | Skeleton, Card | P-BUY-01/06/08 | 1 (Buyer) | Watch |

> **Reused, NOT rebuilt (P-BUY-06/08):** the page `<h1>` + detail hero use the **shell `PageHeader`**; the detail breadcrumb uses the **shell `Breadcrumbs`** — Team 2's earlier plan to build a bespoke `DetailHero`/`Breadcrumbs` was **dropped** in favour of the canonical shell components (search-before-build, §6.1).
> **Note (DataListTable):** Doc-7F §11.3 lists `data-table` as a Doc-7B-kit (Tier 0) item not yet on disk. Team 2 realized it as a **buyer-scoped** `DataListTable` (Tier 2) to avoid unilaterally modifying the frozen kit — an explicit **Doc-7B promotion candidate** (§4.2) the moment a second workspace needs a cursor-paginated table.

### 5.4 Tier 2 — Public-scoped (Team 1) · Vendor-scoped (Team 3)

*Placeholders for Teams 1 & 3 to populate.* (Observed in the shared working copy: `app/(public)/_components/landing/*` (Public) · `app/(app)/_components/vendor/*` (Vendor).) Each team records its scoped compositions here so duplication is visible across teams.

---

## 6. Anti-duplication rules (binding for Teams 1–3)

1. **Search before build** — search the Doc-7B kit, then this registry's §5, before creating any component. Reuse beats re-create.
2. **Never copy across workspaces** — if another team's component fits, promote it (§4), don't paste a second copy.
3. **Never modify the FROZEN Doc-7B kit** without §4.2 (kit owner + Board).
4. **Register on create** — every new reusable component gets a §5 row in the same change that introduces it.
5. **Promote on the 2nd consumer** — the first cross-workspace reuse triggers a §4 promotion, not a fork.

---

*Non-authoritative coordination ledger. Conforms upward; coins nothing. On any conflict the frozen document wins and this file is patched to match.*
