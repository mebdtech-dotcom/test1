# Deliverable 2 — Anchor & Redirect Inventory

**Team 3 · DRAFT v0.1 · pre-ADR · no code changed**
**Purpose:** enumerate every current anchor link and redirect stub, map each to its **provisional**
future route, and become the **end-state removal checklist**. Removal itself is **Phase 4** —
never before Team 1's route nav + real pages are live (F4). Nothing here is implemented.

Legend — **Status:** `Pending` = documented, not migrated. All future targets are **provisional
pending ADR + Doc-7D**.

## A. Redirect stubs on disk (7)

| Current stub route | Current target | Future (provisional) | Action at Phase 3/4 | Status |
|---|---|---|---|---|
| `/vendors/[slug]/about` | `#about` | `/vendors/[slug]/about` | promote stub → real page | Pending |
| `/vendors/[slug]/products` | `#products` | `/vendors/[slug]/products` | promote stub → real page | Pending |
| `/vendors/[slug]/projects` | `#projects` | `/vendors/[slug]/projects` | promote stub → real page | Pending |
| `/vendors/[slug]/industries` | `#industries` | `/vendors/[slug]/industries` | promote stub → real page | Pending |
| `/vendors/[slug]/contact` | `#contact` | `/vendors/[slug]/contact` | promote stub → real page | Pending |
| `/vendors/[slug]/capabilities` | `#capabilities` | **→ `/about`** | re-point redirect (back-compat) | Pending |
| `/vendors/[slug]/certifications` | `#certifications` | **→ `/resources`** | re-point redirect (back-compat) | Pending |

`/resources` = **new** route (no stub exists). Home = `/vendors/[slug]` (unchanged path).

## B. In-page nav anchors → future routes (9)

From [vendor-microsite-navigation.tsx](../../app/(public)/_components/microsite/vendor-microsite-navigation.tsx) `SECTIONS`:

| Nav label | Current anchor | Future route (provisional) | Note |
|---|---|---|---|
| Overview | `#vendor-top` | `/vendors/[slug]` (Home) | hero anchor |
| About | `#about` | `/about` | |
| Capabilities | `#capabilities` | `/about` **or Home** | **T3-P-01 conflict** — plan puts `CapabilitySection` on Home, but `/capabilities`→`/about` |
| Industries | `#industries` | `/industries` | |
| Products | `#products` | `/products` | |
| Projects | `#projects` | `/projects` | |
| Gallery | `#gallery` | `/resources` | gallery moves under Resources |
| Certifications | `#certifications` | `/resources` | |
| Contact | `#contact` | `/contact` | |

## C. Section ids with NO nav entry today (placement to resolve)

These render on the current page but have no nav link (T3-P-02). Provisional future home per plan:

| Section id | Component | Future page (provisional) | Note |
|---|---|---|---|
| `mission` | `MissionVision` | `/about` | |
| `why` | `WhyChooseUs` | **Home** | **T3-P-03** Board rec: Home only, no nav item |
| `statistics` | `CompanyStatistics` | `/about` | |
| `history` | `CompanyTimeline` | `/about` | |
| `management` | `ManagementMessage` | `/about` | |
| `downloads` | `DownloadCenter` | `/resources` | |
| `faq` | `CompanyFaq` | **`/about`** | **T3-P-03** Board rec: About (link from Contact if needed) |

## D. End-state removal checklist (execute in Phase 4 ONLY)

Blocked until: ADR approved · Team 1 route nav live · Team 2 pages complete. Do **not** tick early.

- [ ] Replace 9 anchor `SECTIONS` in `VendorMicrositeNavigation` with the 7 route `<Link>`s.
- [ ] Confirm every old `#anchor` still resolves (or has an intentional redirect) — no dead link.
- [ ] Promote 5 stubs (about/products/projects/industries/contact) to real pages.
- [ ] Re-point `capabilities` → `/about`, `certifications` → `/resources`.
- [ ] Add `/resources`.
- [ ] Remove any anchor-only scroll behavior that no longer has a target.
- [ ] Verify Invariant #11 404 parity across all routes (owned by `layout.tsx`).

**Governance note:** the 7 redirect stubs are **owner-approved M2.5 Hybrid artifacts** (Flag-and-Halt).
Deleting/altering them presupposes the ADR that supersedes the single-page ruling. No removal
before that ADR exists.
