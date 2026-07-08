# iVendorz Product Status — Snapshot 2026-07-08

**Purpose:** consolidated, verified state of the product across backend waves and the frontend
program — the input document for planning the next moves.
**Non-authoritative.** Status SSoT stays `generatedDocs/00_AUTHORITY_MAP.md` +
`generatedDocs/Program_Status_And_Roadmap.md` (ledger) + `generatedDocs/Build_Roadmap_v1.0.md`
(gated sequence). Page-level SSoT = the team files in this folder + the WBS coverage script. This
snapshot restates counts only; on any conflict those sources win.

> **Supersedes** the 2026-07-02 snapshot. Since then: Journey Atlas frozen, URL/SEO authority
> frozen, Compare Sheet / CS redefinition frozen, repo-structure G2 merged, and three greenfield
> planning+prototype packages (Admin Console pipeline, Review System, Vendor Profile Templates)
> reached Board approval. Branch `wave/2-core-platform` is **318 commits ahead of `main`**
> (working tree clean).

---

## 1. Program at a glance

| Track | State |
|---|---|
| Architecture corpus | **FROZEN, complete** — Doc-2/3 · Doc-4A–4M · Doc-5A–5K · Doc-6A–6K · Doc-7A–7H · Doc-8A–8G (ledger §§1–4d) |
| Wave 0 — Repository Bootstrap | **DELIVERED** to `main` 2026-06-27 (`wave0-complete`, Exit Gate GREEN 5/5) |
| Wave 1 — Foundation (Walking Skeleton) | **DELIVERED** to `main` 2026-06-28 (`wave1-complete`, `3345b00`, Exit Gate GREEN) |
| Wave 2 — Core Platform (M0 → M1) | **IN PROGRESS** on `wave/2-core-platform`. D7 buyer-profile audited-WRITE vertical shipped — canonical audited-write pattern (`governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`); `ESC-W2-AUDIT-RLS` resolved; full suite 58/58 GREEN on real Postgres. Remainder = full M0 → M1 module builds |
| Frontend (owner-authorized parallel stream) | Presentation-only, 3 build teams + Team-4/5 review lanes, ahead of the Wave-3 sequence ("parallelization, not reorder"). **Page universe 151/151** (coverage script PASS, 35 milestones) |
| Frontend foundation | Kit (`src/frontend/`) + public shell + light theme: **built, verified, treated as frozen platform** (extend, never duplicate). Brand logo integrated in code (official SVGs still pending); navy/indigo/gold palette re-skin applied |
| Governance companions | **Journey Atlas v1.0 FROZEN** (51 journeys) · **URL/SEO authority v1.0 FROZEN** · **Compare Sheet / CS v1.0 FROZEN (product)** · repo Structural Constitution **v1.1** (docs/ hierarchy consolidated, G2 merged) |

## 2. Frontend page board — universe 151/151

Coverage verified 2026-07-08: `node scripts/verify-fe-wbs-coverage.mjs` → **PASS 151/151, each page
owned exactly once, across 35 milestones.** The universe grew 144 → 150 (FE-DOC Documents track) →
**151** (FE-PUB-11 Project Detail minted P-PUB-25). The Review System and Admin-review packages
resolved **net-zero new pages** — every new surface is a *face* of an existing page.

**Cluster completions (verified against team files):**

- **Auth cluster COMPLETE** — P-AUTH-01..08 all ✅.
- **Account cluster COMPLETE** — P-ACC-01..22 ✅ (only P-ACC-12 decision-gated, `ESC-IDN-DELEG-EXPIRY`).
- **Admin console COMPLETE (presentation)** — P-ADM-01..29 all ✅ Approved + committed. Backend is
  Wave-5-gated; the 6-stage planning/prototype pipeline (see §2a) governs the production refactor.
- **Buyer page set COMPLETE** — P-BUY-01..27 built/approved except the owner-gated rows. WP-1 Buyer
  LOI view ✅ Closed (`1ce722a`); **WP-2 Comparative Statement built** (`5737c45`, presentation-only
  at the temporary route). Buyer Frontend Freeze Report v1.0 remediation **HELD** by owner for a
  single F2-Z batch.
- **Public COMPLETE** — Team-1's FE-PUB-01..11 all ✅ Closed (incl. Product Detail, Category,
  Vendor Directory, Mega-Menu/Taxonomy, canonical vendor subdomain, **Project Detail** RV-0138).
- **Vendor workspace COMPLETE** — M1–M8 feature set + Settings (FE-VEN-12) + Documents Hub
  (FE-DOC-02) + **VX-01 dashboard/nav redesign** (RV-0137) all ✅ Closed. M2.5 public microsite
  foundation built, **held pending owner approval**.
- **RFQ spine (presentation)** — RFQ creation wizard + vendor quotation submission flow built on the
  shared RFQ surface; interactive item-requirements table with Excel bulk-import.

### 2a. Planning & prototype packages (Board-approved; production NOT authorized)

These are greenfield design/planning deliverables that reached Board approval since 2026-07-02. They
set the visual + governance baseline for a later production build; none authorizes shipping code.

| Package | State | Notes |
|---|---|---|
| **Admin Console 6-stage pipeline** | Stages 1–4 **Board-approved**; **Stage-5 FE Impl Plan v1.0 committed** (`f54dba3`), awaiting Board | Config-driven SPA prototype covering all 29 `P-ADM-*` surfaces (`f61a1e2`); Stage-1 planning + Stage-3 brief (`cfdf4d3`). `P-ADM-07 = vendor MODERATION` (not approval); no review-mod/admin-ratings pages (Board E8). Production **not** authorized |
| **Review System** | Planning frozen + prototype **APPROVED + LOCKED VDB v1.0** (`7464bdd`) | 3 lanes (public M5 · admin staff-only · private CRM M4). **Net-0 new pages** — all 5 surfaces are faces of existing pages; universe stays 151. No author-scoped read (AR-01) |
| **Vendor Profile Template System** | **APPROVED v1.0** (owner Visual Approval Gate, `94b2d8c`) + prototyping harness (`ea5327b`) | 5 layouts sharing ONE data model (Content ≠ Presentation); = **visual baseline** for production refactor (preserve data model/boundaries/routing/tokens; no new business capability) |
| **SEO indexing separation prototype** | Prototype committed (`cfa530e`) | Public `/vendors` (indexable) vs buyer `/discover` (non-indexed) separation |

Prototype infrastructure: `npm run prototype` launcher (`scripts/serve-prototype.mjs`, port 8080)
serves the clickable prototypes — the **primary Stage-4 review artifact** (screenshots are
post-approval evidence only).

## 3. Decision queue (what's blocking work)

**Human / Board decisions (packets prepared where noted):**

1. **Admin Console Stage-5 FE Implementation Plan v1.0** — awaiting Board sign-off before the
   presentation-elevation (Phase A) / Wave-5 wiring (Phase B) build.
2. **Vendor companion freeze** — down to **1 BLOCKER** (`ESC-7G-A7`, human Board); SCORE-DISPLAY +
   TRUSTSCORE resolved by the 2026-07-03 Trust-Score display ruling. Gates the vendor companion
   freeze + P-VND-28.
3. **Board agenda #17 — five `ESC-CS-*` handles** (CS document: DOCKIND · REF · EXPORT · LINEITEMS ·
   LETTERHEAD). Packet `governanceReviews/BOARD-PACKET-CS-DOCUMENT_v1.0.md`. None blocks the current
   presentation build.
4. **ESC-BUY intake — six buyer reserved-route contract gaps** (QUOTES-LIST · PO-LIST · MSG-INBOX ·
   REPORTS · SAVED-VENDORS · SPEC-LIB). Packet `BOARD-PACKET-BUYER-FE-CONTRACT-GAPS_v1.0.md`; each
   resolved individually before the corresponding buyer route is really implemented.
5. **Journey Atlas ESC items** — `ESC-JRN-BUYER-VERIF` · `ESC-JRN-LEAD-DIST` (+ Flag-and-Halt
   `ESC-JRN-TKT-MACHINE`). Separate open decisions; do **not** block use of the frozen atlas.
6. **Buyer freeze remediation** — name BX-03(+) enhancements or skip to the **F2-Z** single batch →
   buyer frontend freeze approval.
7. **P-BUY-03/04 route topology** + **P-BUY-05 favorites** projection gap · **P-ACC-12**
   (`ESC-IDN-DELEG-EXPIRY`) · **M2.5 vendor public microsite** continuation · **taxonomy seeding**
   (human P1 approval) · **official brand SVGs** (unmodified assets under `public/brand/`).

**Engineering blockers:**

- **Board agenda #16 — repo-wide `next build` breakage:** shell `useSearchParams()` without a
  Suspense boundary (`sidebar.tsx:154` / `mobile-nav.tsx:146`). Blocks the RV-0126
  isolated-prod-build review lane for **every** milestone; needs a shell owner.
- **Prod-build EPERM (Windows):** Doc-6A registry path-import bundles the Prisma runtime → `@vercel/nft`
  traces `C:\Users` junctions → EPERM. WI `project-management/wi-prod-build-eperm.md`; fix = Board
  choice (recommended: dual-output `prisma generate`).

**Waiting-API handles (arrive with backend wiring waves, not decisions):**
`ESC-7-API-CATNAV` (P-PUB-09) · `ESC-7-API-PRODDETAIL` (P-PUB-11, resolved via composed read) ·
`ESC-7-API/upload` (P-VND-10 / P-VND-25 upload path).

## 4. Buildable now — no decision needed

| Team | Work |
|---|---|
| Team-1 (Public) | FE-PUB queue fully closed; a proposed **FE-PLAT** track (SEO completion, Storybook, observability init, shared/E2E coverage) is pending Board mint |
| Team-2 (Buyer) | WP-2 CS built + in review; then the F2-Z freeze-remediation batch (owner-paced). BX-07+ enhancements are P2, owner-paced |
| Team-3 (Vendor) | `FE-DOC-03 Templates & Generated Documents` (S-dep on the FE-SH-01 shared-kit-promotion ruling, Board agenda #13) |
| Team-4/5 (Review) | Milestone A/B lanes as work checkpoints; agenda #16 blocks the isolated prod-build lane |

## 5. Backend runway

- **Wave 2 remainder:** full M0 → M1 module builds per `Build_Roadmap_v1.0.md` § Wave 2. D7 is the
  declared **canonical audited-write** — every future audited write (org, vendor, RFQ, quotation,
  product, trust) copies it. Backend build office lives at `docs/backend/` (build-plan / playbook /
  tracker); M0 + M1 emit **zero §8 events** (`[DC-1]`); `check_permission` is app-layer.
- **Wave 3+ (wiring):** the FE program has accumulated a precise wiring queue — every approved page
  carries `OBS(wiring)` notes; gaps registered in `esc_registry.md`. The Admin Console (Stage-5
  Phase B) and Review System (three lanes) wiring are Wave-5-gated.

## 6. What changed since the 2026-07-02 snapshot

- **Journey Atlas** DRAFT → **FROZEN v1.0** (`ca328ba`) — 51 journeys, non-authoritative companion,
  additive-patch-only henceforth.
- **URL naming & SEO authority** adjudicated → **FROZEN v1.0** (`a9de258`).
- **Compare Sheet / CS redefinition** → **FROZEN v1.0 (product)**; WP-1 LOI closed, WP-2 CS built.
- **Repo Structure G2** merged into `wave/2-core-platform`; Structural Constitution **v1.1**;
  ~50 loose docs consolidated into `docs/`; prototypes quarantined under `prototypes/`.
- Three **planning+prototype packages** reached Board approval (§2a): Admin Console pipeline,
  Review System, Vendor Profile Templates; plus the SEO indexing-separation prototype.
- FE closes: Public FE-PUB-05/10/11, Vendor VX-01 + FE-DOC-02, Buyer WP-1/WP-2, RFQ spine.
</content>
</invoke>
