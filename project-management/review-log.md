# Review Log — Team-4 QCT

**Owner:** Team-4 (Quality & Conformance). **Reviews only** `🔵 Ready for Review` pages; **never
edits implementation** (Raise ≠ Accept — CLAUDE.md §13). Each review gets a sequential **`RV-####`**.

## Governance (per CLAUDE.md §13)

- **Severity ladder:** `BLOCKER` · `MAJOR` · `MINOR` · `NIT` · `OBS`.
- **Gate to Approve:** `BLOCKER = 0 · MAJOR = 0 · MINOR = 0`. NIT/OBS never block.
- **Raise ≠ Accept:** the reviewer raises findings with a severity; the **author/authority rules**
  on each via the Validate-Findings gate (Valid? Applicable? Best for product? Corpus-consistent?).
- Verdict is exactly `PASS` or `PATCH REQUIRED` (with numbered findings).

## Entry template

```
### RV-0001 · P-<ID> · <Page title> · Team-<n>
- Date: YYYY-MM-DD
- Verdict: PASS | PATCH REQUIRED
- Findings:
  1. [BLOCKER|MAJOR|MINOR|NIT|OBS] <one-line defect> — <file:line if applicable>
- Disposition (author/authority): <accepted/deferred/rejected + why>
- Result: page → ✅ Approved | 🟥 Patch Required
```

---

## Reviews

### RV-0001 · P-AUTH-02 · Signup · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/signup/{page,signup-form}.tsx` (screenshots: `governanceReviews/milestones/team1-auth-02-signup/`)
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] `[ESC-7-API-SIGNUP]` cited (page.tsx:7, signup-form.tsx:5) is **not in `esc_registry.md`** — invented handle (guardrail: cite a real registry handle, never invent). Registry has `ESC-7-API-{CATNAV,PRODDETAIL,ADS}`, `/upload`, … — no signup/provision handle.
  2. [MINOR] Interim notice uses deprecated `text-iv-info-base` on `bg-iv-info-subtle` (signup-form.tsx:62) — 4.65:1 (clears AA on white but fragile + off-convention). Post-P-4 convention is `text-iv-info-muted` (10.34:1).
  3. [NIT] Terms checkbox is a native hand-rolled control (no kit primitive; a11y-correct) — form comment claims "composes the kit"; kit gap cites no ESC handle. (signup-form.tsx:122)
  4. [NIT] Terms/Privacy links → `/` placeholders (P-PUB-21/-22 unbuilt) — honest but dead.
  5. [OBS] Otherwise strong: RSC/client split, `FormField` a11y wiring, autocomplete tokens, honest interim (fabricates no account), responsive.
- Disposition (author/authority = Team-1): register `ESC-7-API-SIGNUP` in `esc_registry.md` OR re-cite the correct existing handle (MAJOR); switch to `text-iv-info-muted` (MINOR).
- Result: page → 🟥 Patch Required. Queue NOT advanced; returned to Team-1.

### RV-0002 · P-BUY-17 · Award · Team-2
- Date: 2026-07-01 · Reviewed: `app/(app)/(buyer)/rfqs/[rfqId]/award/{page,loading}.tsx`, `_components/award/*` (no screenshots captured)
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] Core award UX is **not presentable**. `page.tsx:27` seeds `candidates: []` (only the empty state ever renders); `AwardView` is a Server Component with inert `Continue`/`Confirm` buttons (no client handler/href), so the `T-WIZARD` select→confirm never advances (`?step=confirm` falls through without a `selectedQuotationId`). No screenshots. Fails DoD "Mock data realistic". → seed realistic mock shortlisted candidates (System order, unranked) AND wire client-side select→continue→confirm so the award UX is reviewable (as the sibling pages do).
  2. [MINOR] Candidate radio group has no programmatic group label — no `<fieldset>`/`<legend>` or `role="radiogroup"` + `aria-label` (award-view.tsx:199-212). SR users get per-option labels but not the group purpose.
  3. [OBS] Governance EXEMPLARY: R6/Inv#12 honored — explicit, unranked, 1:1, "no recommended winner", System order never re-ranked; irreversibility + org-threshold + money-boundary (R8) notices; firewall (no trust/score/tier); not-found byte-identical; grounded `rfq.award_rfq.v1` (Doc-4E §E8.4) honestly parked; strong reuse; good loading skeleton.
- Disposition (author/authority = Team-2): seed mock candidates + wire the wizard nav (MAJOR); add the radio group label (MINOR).
- Result: page → 🟥 Patch Required. Queue NOT advanced; returned to Team-2.

### RV-0003 · P-ADM-01 · Admin dashboard · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/{page,layout}.tsx`, `_components/admin/admin-shell-vm.ts`
- Verdict: **PASS**
- Findings:
  1. [MINOR — deferred] Reuses `DashboardSection` + `PipelineLinks` from `_components/vendor/dashboard/` (page.tsx:11) — generic components now consumed by a 2nd surface (admin). Reuse (not duplication) is correct; placement is the issue → extract to a neutral shared dashboard location (2nd-consumer promotion trigger).
  2. [NIT] Sidebar + `PipelineLinks` point to `/admin/*` sub-routes (P-ADM-02…29) not yet built → 404 until they land (expected, dashboard-first).
  3. [OBS] Governance exemplary: no Trust/Performance/Tier, no fabricated counts (honest EmptyStates), R5 honored (routes into queues, owns no effect), firewall respected. Shell correctly wired (`admin/layout.tsx` mounts `AppShell` + `ADMIN_SHELL_VM`); heading order h1→h2 correct (PageHeader + CardTitle); responsive grid.
- Disposition (author/authority): MINOR-1 deferred to a shared-dashboard extraction (cross-surface promotion candidate — NOT a P-ADM-01 code defect; reuse-over-duplication is correct). NIT/OBS non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-02).

### RV-0004 · P-AUTH-02 · Signup · Team-1 (re-review of RV-0001)
- Date: 2026-07-01 · Reviewed: `app/(auth)/signup/signup-form.tsx`, `esc_registry.md`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED] MAJOR (RV-0001#1) — `ESC-7-API-SIGNUP` now registered in `esc_registry.md:30` with a proper entry (out-of-band M1 lazy-provisioning; additive Doc-5C/7E patch). Real handle; no longer invented.
  2. [RESOLVED] MINOR (RV-0001#2) — interim notice now `text-iv-info-muted` (signup-form.tsx:63) → 10.34:1, on-convention.
  3. [OBS] Carried NITs (native checkbox; Terms/Privacy → `/` until P-PUB-21/-22) remain — non-gating. No regression.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-03).

### RV-0005 · P-BUY-17 · Award · Team-2 (re-review of RV-0002)
- Date: 2026-07-01 · Reviewed: `.../award/page.tsx`, `_components/award/award-view.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED] MAJOR (RV-0002#1) — award UX now presentable: `MOCK_SHORTLIST` (3 vendors) renders; step 0 is a native `<form method="get">` submitting the chosen radio to `?step=confirm&sel=<id>` (server nav, no client state); confirm step reachable. R6 preserved — no default winner (nothing pre-checked).
  2. [RESOLVED] MINOR (RV-0002#2) — radios wrapped in `<fieldset><legend>Choose one vendor to award</legend>` (award-view.tsx:205).
  3. [NIT] Radios not `required` — hitting Continue with nothing selected silently returns to the select step (no hint). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-18).

### RV-0006 · P-ADM-02 · Moderation queue · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/moderation/page.tsx`, `_components/admin/moderation/{moderation-queue-table.tsx,moderation-seed.ts}`
- Verdict: **PASS**
- Findings:
  1. [NIT] No route-level `loading.tsx` skeleton in the moderation route — the sibling award route has one; add before the `J-ADM-01` read is wired (currently synchronous seed, so not observable yet). Non-gating.
  2. [OBS] Promotion watchlist: bespoke `ModerationQueueTable` is the 1st admin worklist table — when a 2nd admin queue lands (P-ADM-07/-10/-12), extract a shared `AdminQueueTable`. Horizontal-scroll on mobile is acceptable (admin desktop-first, PI §13.7).
  3. [OBS] Strong: R5 (queue decides nothing; rows→P-ADM-03), firewall (no Trust/Perf/Tier; status is case-state), no fabricated totals, realistic BD-industrial seed, real `J-ADM-01`; a11y — `<caption>`/`scope="col"`, filter `role="group"`+`aria-current`, sr-only action names; URL-driven filter; kit reuse (PageHeader/StatusChip/PaginationControl/EmptyState).
- Disposition (author/authority): NIT/OBS non-gating; loading skeleton recommended before wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-03).
