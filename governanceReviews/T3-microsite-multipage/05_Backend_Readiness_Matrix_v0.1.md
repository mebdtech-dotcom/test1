# Deliverable 5 — Backend Readiness Matrix

**Team 3 · DRAFT v0.1 · pre-ADR · no code changed**
**Purpose:** per future page, record the data owner, projection/contract, and readiness so Team 1
and the backend team have a clear integration target later. Reflects the Board's direction: **each
page resolves its own data** (not layout-level loading) — this makes every page an independently
wireable feature.

**Governance — One Module, One Owner:** the vendor microsite is a **public projection of M2
(Marketplace)** — vendor profiles, microsites, and products all live in **M2** (CLAUDE.md §3).
"Catalog"/"Marketplace" below are **sub-domains of M2**, not separate modules. M2 may **read**
trust but never calculates it; the microsite shows only the **binary Verified** signal.

**Readiness taxonomy (T3-P-04 — Board-accepted four states).** Every page/data slice carries **one
explicit state** so Team 2 never assumes backend integration exists where it does not:

- **UI-ready** — presentation seed/editorial present; renders now. **No backend wiring.**
- **Backend-ready** — bound to a real, wired contract. *(No microsite page is Backend-ready today.)*
- **Blocked-by-ESC** — wiring blocked pending an open ESC / API-Gov intake item.
- **Deferred** — intentionally not wired now (frozen-unwired field or absent field); genuine-empty state held, never padded.

Supporting columns — **Seed:** `Yes`/`Partial`/`No` · **Backend contract:** `Wired`/`Frozen-unwired`/`Open`/`None`.

Current seed sources:
[discovery/seed.ts](../../app/(public)/_components/discovery/seed.ts) (`getPublicVendorProfile`,
`getPublicVendorProducts`) · [company-content-seed.ts](../../app/(public)/_components/microsite/company-content-seed.ts) (`getCompanyContent`).

| Page | Owner (M2 sub-domain) | Projection / content | Seed | Backend contract | **Readiness state** | Note |
|---|---|---|---|---|---|---|
| Home | Marketplace | public vendor profile + featured product/project slice | Yes | Frozen-unwired | **UI-ready** | featured = editorial slice (GI-04), not a rank |
| About | Marketplace | public vendor profile + company-website content | Partial | None | **UI-ready** | company content (overview/mission/history/mgmt/stats) = **editorial stand-in** — coins no frozen field |
| Products | Marketplace (Catalog) | vendor-scoped **published** listing + detail | Yes | Open | **UI-ready** · detail **Blocked-by-ESC** | product detail = `[ESC-7-API-PRODDETAIL]` (open API-Gov intake) |
| Projects | Marketplace | `showcase_projects` (sector/role-client descriptors) | Partial | Frozen-unwired | **UI-ready** · backend **Deferred** | `showcase_projects` frozen but **unwired** — stand-in only |
| Industries | Marketplace | industries served | Partial | None | **UI-ready** | editorial stand-in |
| Resources | Marketplace | certifications · downloads · gallery · videos | Partial / No | None | **UI-ready (partial)** · downloads/videos **Deferred** | certs self-declared (never the badge); downloads **disabled** (no file); gallery decorative; **videos = no component & no frozen field** |
| Contact | Marketplace | contact projection + platform-mediated intents | Partial | None | **UI-ready** | intents route to `(auth)`; no mutation on microsite (lead model) |

**No page is Backend-ready.** "UI-ready" ≠ "wired" — Team 2 builds presentation only; every wiring
step is a later, separately-gated feature.

## Integration constraints to carry into wiring (do not violate)

1. **Published-only + byte-equivalent 404** (Invariant #11) — resolution owned by `layout.tsx`;
   draft/unpublished/banned → `notFound()`.
2. **Verified = binary only.** No trust score, performance score, financial tier, or turnover on
   any page — even after wiring. M2 **reads** the signal, never computes it.
3. **No fabricated data on wiring.** Where a field is unwired (`showcase_projects`) or absent
   (videos, download files), keep the **genuine-empty** state — never pad.
4. **Anonymous, read-only.** Every page is anonymous; all write intents route to `(auth)`.
5. **No cross-module access.** Microsite binds M2 contracts only — no cross-module table/FK/import.

## Open items feeding API-Gov / Board (reference, not new work)

- `[ESC-7-API-PRODDETAIL]` — product detail projection (already in the API-Gov intake queue).
- `showcase_projects` wiring — frozen field, presently unwired.
- **Videos (Resources)** — no frozen field; Board to decide build-later vs omit before this page
  is considered content-complete.
