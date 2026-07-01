# Deliverable 1 — Regression Baseline (current single-page microsite)

**Team 3 · DRAFT v0.1 · pre-ADR · no code changed**
**Purpose:** freeze the current state as the **Phase-1 visual-parity reference**. Phase 1 (shell
extraction) must render byte/visually identical to this before Phase 2 nav work begins.

Captured from the tree on disk — not from the plan. Source of truth:
[page.tsx](../../app/(public)/vendors/[slug]/page.tsx) ·
[microsite/index.ts](../../app/(public)/_components/microsite/index.ts).

## 1. Current route tree

| Route file | Kind | Behavior |
|---|---|---|
| `vendors/page.tsx` | listing | public vendor directory (out of migration scope) |
| `vendors/[slug]/page.tsx` | **real page** | single page, 16 bands, owns `notFound()` |
| `vendors/[slug]/about/page.tsx` | stub | `redirect(/vendors/{slug}#about)` |
| `vendors/[slug]/capabilities/page.tsx` | stub | `redirect(→ #capabilities)` |
| `vendors/[slug]/industries/page.tsx` | stub | `redirect(→ #industries)` |
| `vendors/[slug]/products/page.tsx` | stub | `redirect(→ #products)` |
| `vendors/[slug]/projects/page.tsx` | stub | `redirect(→ #projects)` |
| `vendors/[slug]/certifications/page.tsx` | stub | `redirect(→ #certifications)` |
| `vendors/[slug]/contact/page.tsx` | stub | `redirect(→ #contact)` |

7 stubs. No `/resources` route exists today.

## 2. Current rendered bands (order, as authored)

`VendorHero` + 15 `VendorSection`:

| # | Section `id` | Title | Component |
|---|---|---|---|
| — | (hero) | — | `VendorHero` |
| 1 | `about` | Overview | `CompanyOverview` |
| 2 | `mission` | Mission & vision | `MissionVision` |
| 3 | `why` | Why choose us | `WhyChooseUs` |
| 4 | `capabilities` | Capabilities | `CapabilitySection` (+ categories) |
| 5 | `industries` | Industries served | `IndustryGrid` |
| 6 | `products` | Products | `ProductShowcase` |
| 7 | `projects` | Projects | `ProjectShowcase` |
| 8 | `gallery` | Factory & gallery | `CompanyGallery` |
| 9 | `statistics` | At a glance | `CompanyStatistics` |
| 10 | `history` | Company history | `CompanyTimeline` |
| 11 | `management` | Message from management | `ManagementMessage` |
| 12 | `certifications` | Certifications & licenses | `CertificationGrid` |
| 13 | `downloads` | Downloads | `DownloadCenter` |
| 14 | `faq` | Frequently asked questions | `CompanyFaq` |
| 15 | `contact` | Get in touch | `CompanyContact` |

Total = 16 bands (hero + 15).

## 3. Current navigation behavior

`VendorMicrositeNavigation` — client component (mobile drawer only). **9** anchor entries:

`#vendor-top` (Overview) · `#about` · `#capabilities` · `#industries` · `#products` ·
`#projects` · `#gallery` · `#certifications` · `#contact`.

- Desktop: sticky horizontal ghost-button anchor bar below platform header (`top-14`).
- Mobile: kit `Sheet` drawer, same 9 anchors.
- **Gap (T3-P-02):** 6 rendered sections have no nav entry — `mission`, `why`, `statistics`,
  `history`, `management`, `downloads`, `faq`. (`#vendor-top` targets the hero, not a section id.)

## 4. Current component hierarchy

```
VendorMicrositeLayout                (invoked INSIDE page.tsx — becomes layout.tsx in Phase 1)
├─ VendorMicrositeHeader             (vendor-branded content band)
├─ VendorMicrositeNavigation         (9 anchors, client)
├─ {children}
│   ├─ VendorHero
│   └─ VendorSection × 15            (see §2)
└─ VendorMicrositeFooter
```

`VendorBreadcrumb` and `VendorVerifiedBadge` are exported/available; breadcrumb is not the
subtree 404 owner today (page.tsx owns `notFound()`).

## 5. Governance behavior to preserve (must not regress)

- **Invariant #11 — byte-equivalent 404:** unknown/draft/unpublished/banned slug → `notFound()`.
  In multi-page, this ownership moves to `layout.tsx` (single 404 owner for the whole subtree).
- **Invariant #1 — capability = 4-flag matrix** via `CapabilitySection` (`profile.capability`).
- **Invariant #9 — Content ≠ Presentation:** public projection only.
- Only trust signal = **binary Verified badge**. No trust/performance score, no financial tier,
  no turnover, no verification workflow.
- Anonymous intents route to `(auth)` (`/login`) — never a mutation on the microsite.

## 6. Existing screenshot captures (reuse as baseline images)

Present under `governanceReviews/milestones/public-m2-4/`:
`profile-desktop.png` · `profile-unverified.png` · `profile-empty-products.png` · `profile-404.png`.

- Covers: desktop happy path + unverified + empty-products + 404 states.
- **Gap:** no tablet/mobile capture of the profile in that set. If Board wants full-viewport
  parity evidence, capture desktop/tablet/mobile of the current page before Phase 1 starts.
