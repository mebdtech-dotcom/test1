# Review Log — Team-4 QCT

**Owner:** Team-4 (Quality & Conformance). **Reviews only** `🔵 Ready for Review` pages; **never
edits implementation** (Raise ≠ Accept — CLAUDE.md §13). Each review gets a sequential **`RV-####`**.

> **Amendment (FE Program Management v1.0 cutover, 2026-07-02 — additive; entries RV-0001..0100
> and the v1 template below are untouched):** from **RV-0101** the program is milestone-driven;
> Team-4 continues as **Review Team B** (`governanceReviews/TEAM-4-QCT-CHARTER_AMENDMENT_v1.1.md`)
> after the new **Review Team A** (`governanceReviews/REVIEW-TEAM-A-CHARTER_v1.0.md`). Both teams
> log here under ONE RV-#### per review cycle using the **milestone entry template v2**:
>
> **Numbering correction (owner diagram, same day — `TEAM-4-QCT-CHARTER_AMENDMENT_v1.2.md`):**
> the sentence above is superseded. **Team-4 = Review Team 4 (Architecture & Governance, the
> Review-A lane, reviews FIRST)**; the quality lane (Review-B fields below) is the new
> **Review Team 5** (`governanceReviews/REVIEW-TEAM-5-CHARTER_v1.0.md`). "Review-A/Review-B" in
> the template are lane names and stay as-is.
>
> ```
> ### RV-#### · FE-XXX-NN · <Milestone title> · Team-<n>
> - Date · Pages in scope: P-… · Reviewed SHA: <checkpoint sha> (stable-target)
> - Review-A (Architecture & Governance): PASS | REVISION | BLOCKER
>   Findings: numbered, severity ladder BLOCKER/MAJOR/MINOR/NIT/OBS
> - Review-B (Quality & Adversarial): PASS | ISSUES | REGRESSION
>   Findings: numbered, same ladder (B opens only after A pass-class)
> - Disposition (author/authority): per the Validate-Findings gate
> - Board: APPROVED | RETURNED | ESCALATED (+ decision ref)
> - Result: milestone → ✅ Closed | 🟠 Revising | 🟥 Blocked
> ```
>
> Gate to Board = **A:PASS ∧ B: BLOCKER = MAJOR = MINOR = 0** (§13 unchanged). Page-scoped
> checkpoint reviews use the same template with `Pages: <single page>`. Full process:
> [`review-process.md`](review-process.md).

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

### RV-0007 · P-AUTH-03 · Org setup (post-signup) · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/org-setup/{page,org-setup-wizard}.tsx`
- Verdict: **PASS**
- Findings:
  1. [NIT] Generic `[ESC-7-API]` marker for "participation not sent" (page.tsx:14, wizard:16) — participation not being a `create_organization` field is a design fact, not a deferred-API gap; cite a specific registered handle or drop the marker.
  2. [NIT] Usage step is a hand-rolled native radio group (no kit RadioGroup primitive) — a11y-correct (fieldset/legend, sr-only radios in labelled cards, focus-within, error wiring). Same kit-gap class as the signup checkbox.
  3. [OBS] EXEMPLARY field discipline: collects only frozen `name`; omits `org_type`/address/contact_info (unenumerated → not invented); `is_personal_org` server-set; usage = onboarding INTENT, never submitted. Functional client wizard; `info-muted` notice (P-4 convention); honest interim (creates no org); binds real `create_organization` (J-BUY-02); `(auth)` group, no sibling-disturbing layout.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-04).

### RV-0008 · P-ADM-03 · Moderation case detail · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/moderation/[caseId]/page.tsx`, `_components/admin/moderation/moderation-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS — reinforces RV-0003 deferred MINOR] Reuses `vendor/dashboard/DashboardSection` + `vendor/shared/{DescriptionList,PresentationFormNote}` — now cross-WORKSPACE (vendor + admin). Reuse-not-duplicate is correct; the shared-extraction promotion candidate (→ neutral shared / platform) grows stronger. Deferred to the shared-extraction pass; non-blocking.
  2. [NIT] No route-level `loading.tsx` for `[caseId]` — add before the `J-ADM-01` read is wired (sync seed today).
  3. [OBS] Strong: R5 (decision affordances rendered-but-DISABLED + `PresentationFormNote`); `notFound()` on unknown id (Inv #11 byte-identical absence); firewall (no Trust/Perf/Tier); shares the P-ADM-02 seed (no duplicate case data); PageHeader h1 → section h2s; `<ol>` activity; good reuse + responsive.
- Disposition (author/authority): OBS-1 deferred (shared extraction, cross-surface promotion — not a P-ADM-03 defect); NIT non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-04).

### RV-0009 · P-BUY-18 · Close lost · Team-2
- Date: 2026-07-01 · Reviewed: `.../close-lost/{page,loading}.tsx`, `_components/close-lost/{close-lost-view.tsx,close-lost-view-models.ts}`
- Verdict: **PASS**
- Findings:
  1. [OBS] `reason_code` enum is VERBATIM-correct vs frozen Doc-4E §E8.5 POLICY list — `budget_dropped|requirement_changed|no_suitable_quotes|sourced_off_platform|other` (exact, in order; labels presentation-only); `reason_text` required-iff-`other` captured. Coins nothing.
  2. [OBS] Non-penalizing (Doc-3 §9.5) EXEMPLARY: uniform closure note on both steps ("no penalty to any vendor… never told a buyer 'chose someone else'… for your own records"); no per-vendor outcome; no firewalled signal. `notFound()` byte-identical (Inv #11); `loading.tsx` present; functional GET-form confirm; inert destructive Close honestly parked.
  3. [NIT] Conditional-required `reason_text` (iff `other`) and the reason `Select` are not natively `required` — submitting empty returns to the form (server is authoritative; UI states the rule via description). Consistent with the award GET-form pattern. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-19).

### RV-0010 · P-AUTH-04 · Password reset — request · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/forgot-password/{page,forgot-password-form}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Non-disclosure EXEMPLARY (Doc-7A §4.3/§8): a valid submit ALWAYS resolves to the uniform "If an account exists…" confirmation — existence never checked or revealed (no account-existence side-channel). Presentation-only (sends nothing; honest "nothing was sent"); `text-iv-success-muted`; `role="status"`; page h1 present (success h2 nested correctly); FormField a11y + autocomplete; binds Supabase Auth recovery.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-05).

### RV-0011 · P-BUY-19 · Engagements · Team-2
- Date: 2026-07-01 · Reviewed: `app/(app)/(buyer)/engagements/{page,engagements-list-view,loading}.tsx`, `_components/engagement-list-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Projection discipline EXEMPLARY: VM + view render EXACTLY the 3 frozen `ops.list_engagements.v1` fields {engagement_id, human_ref, status} (Doc-4F §F5.8) — no coined counterparty/value/rfq_id/date (detail-only, P-BUY-20). Party-scoped genuine-empty (Inv #11); cursor pagination, no grand total (GI-03); contract order never re-ranked (GI-04); NO free-text search (status-enum filter only). PageHeader h1, DataListTable reuse, loading.tsx, honest empty variants.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-20).

### RV-0012 · P-ADM-04 · RFQ moderation · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/rfq-moderation/page.tsx`, `_components/admin/admin-queue-table.tsx`, `_components/admin/moderation/moderation-queue-table.tsx` (refactor), `.../rfq-moderation/rfq-moderation-seed.ts`
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MINOR] Shared `AdminQueueTable` applies each column's `className` to BOTH `<th>` and `<td>` (admin-queue-table.tsx:52,66), so cell-oriented classes leak onto headers: the `ref` column's `font-mono` renders the "Case"/"RFQ" HEADERS in monospace. For P-ADM-02 this is a visual REGRESSION vs the approved pre-extraction table (sans header) — the "render-equivalent" refactor claim is falsified; for P-ADM-04 it's an unintended monospace header. Fix: apply `className` to `<td>` only + add an optional `headerClassName`. High-leverage — every future admin queue inherits this table.
  2. [OBS] Otherwise excellent and exactly the recommended extraction: `AdminQueueTable` correctly placed in the shared admin location (not a feature folder), generic over row type, RSC, composes kit Card; P-ADM-04 honors R5 (Pass/Reject rendered-but-DISABLED; PASS→matching / REJECT→draft), firewall (no signal), URL filter, cursor pagination, EmptyState; P-ADM-02 refactor otherwise reproduces the prior cells faithfully.
- Disposition (author/authority = Team-3): patch the th/td className handling (restores P-ADM-02 equivalence + removes monospace headers).
- Result: page → 🟥 Patch Required. Queue NOT advanced; returned to Team-3.

### RV-0013 · P-ADM-04 · RFQ moderation · Team-3 (re-review of RV-0012)
- Date: 2026-07-01 · Reviewed: `_components/admin/admin-queue-table.tsx` (patch), `.../moderation/moderation-queue-table.tsx`, `admin/rfq-moderation/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED] MINOR (RV-0012) — `AdminQueueColumn` now splits `className` (td-only) from `headerClassName` (th-only); header = `cn("px-4 py-3 font-medium", col.headerClassName)`, and NO column sets `headerClassName` → every header is `px-4 py-3 font-medium` (sans). Diff-verified: P-ADM-02's "Case" header is byte-identical to its approved pre-extraction markup (equivalence restored); P-ADM-04's "RFQ" header no longer monospace. `tsc --noEmit` EXIT 0. Page + column configs untouched.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-05). P-ADM-02 stays ✅ Approved (render restored).

### RV-0014 · P-AUTH-05 · Password reset — confirm · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/reset-password/{page,reset-password-form}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Non-disclosure EXEMPLARY (Doc-7A §4.3/§8): invalid/expired resolves to a UNIFORM notice with no account-existence wording; the recovery token is server-authoritative (client checks UX-only, never trusts/validates a token). Presentation-only (sets no password; honest "Nothing was changed"); `info-muted`; `role="status"`; each state carries an h1; `new-password` autocomplete + min-length/match UX validation.
  2. [OBS] `?state=` dev preview harness is correctly PROD-GATED (`process.env.NODE_ENV !== "production"`) — a real visitor is never shown a fabricated state. The RIGHT dev-preview pattern (contrast: the committed `previewpf` route flagged in the platform review).
  3. [NIT] In the completed/interim state the page h1 stays "Set a new password" while the panel reads "Almost there — nothing was changed" (slight heading/content mismatch). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-06).

### RV-0015 · P-BUY-20 · Engagement detail · Team-2
- Date: 2026-07-01 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/{page,engagement-detail-view,loading,not-found}.tsx`, `_components/engagement-detail-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] EXEMPLARY field/contract discipline vs frozen `ops.get_engagement.v1` (Doc-4F §F5.8): VM carries only surfaced projected fields; `buyer_organization_id`/`vendor_controlling_org_id` deliberately OMITTED (not coined); `award_value_snapshot`+`currency` → `Money` (currency-driven, BDT never assumed); counterparty = OPAQUE `vendor_profile_id` ref + plain-language "display name isn't shown" (NO coined name); `rfq_id` interim link (not projected); documents section GATED not faked. All three gaps cite REGISTERED handles `ESC-7G-ENG-01/02/03` — kept in-code, never in user copy (self-review leak fixed).
  2. [OBS] MONEY BOUNDARY (DF-6/R8) exemplary: "record only… never holds, escrows, or moves funds… settled directly between the parties." `notFound()` + `not-found.tsx` byte-identical (Inv #11/H.9); party-scoped note; loading.tsx; strong reuse. A model for the remaining detail pages.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-21).

### RV-0016 · P-ADM-05 · Bans · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/bans/page.tsx`, `_components/admin/bans/bans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Governance CORRECT — the register shows PLATFORM bans (`VendorBanned`/M8 enforcement, admin-visible by design), explicitly NOT the buyer-private blacklist (Inv #11 governs the M4 CRM; documented in page + seed). Firewall (no Trust/Perf/Tier); R5 (rows→P-ADM-06 detail; the listing issues nothing); no fabricated totals; URL filter; cursor pagination; realistic BD-industrial seed (BAN-2026-* refs).
  2. [OBS] 3rd `AdminQueueTable` consumer — patched table proven: the `ref` column's `font-mono` is td-only, so the "Ban" header stays sans (RV-0013 fix holds); columns-only config, custom `minWidthClassName`, no new table markup; a11y via the shared table.
  3. [NIT] No route-level `loading.tsx` for /admin/bans — consistent with the other admin queues; add before the `J-ADM-04` read is wired (sync seed today). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-06).

### RV-0017 · P-AUTH-06 · 2FA challenge · Team-1
- Date: 2026-07-01 · Reviewed: `app/(auth)/2fa/{page,two-factor-form}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Server-authoritative + presentation-only (verifies nothing; honest "Nothing was verified"). `?state=` dev harness PROD-GATED (`NODE_ENV !== "production"`). TOTP (6-digit, inputMode numeric, `one-time-code`) + backup-code toggle; uniform `role="alert"` error using `danger-muted`; interim `info-muted` (P-4 convention); h1 per state; FormField a11y; auth-shell reuse.
  2. [NIT] Done/interim state keeps the page h1 "Two-factor authentication" (same benign heading/content mismatch as P-AUTH-05). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-07).

### RV-0018 · P-ADM-06 · Ban detail / issue · Team-3
- Date: 2026-07-01 · Reviewed: `app/(app)/admin/bans/[banId]/page.tsx`, `_components/admin/bans/bans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] R5 — Lift/Re-issue/Extend rendered-but-DISABLED (`issue_ban`/`lift_ban` owned by M8, emit `VendorBanned`) + PresentationFormNote; `notFound()` byte-identical (Inv #11); platform-ban ≠ buyer-private blacklist (documented, line 84); firewall (no Trust/Perf/Tier); extends the P-ADM-05 seed (getBan/getBanDetail — no duplicate data); PageHeader h1 → section h2s; activity `<ol>`.
  2. [OBS] Cross-workspace reuse of `vendor/dashboard/DashboardSection` + `vendor/shared/{DescriptionList,PresentationFormNote}` continues (now 4+ admin consumers) — reinforces the RV-0003/0008 deferred shared-extraction promotion candidate. Non-blocking.
  3. [NIT] No route-level `loading.tsx` for `[banId]` — consistent with the other admin details; add before wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-07).

### RV-0019 · P-AUTH-07 · Accept invitation / join org · Team-1
- Date: 2026-07-02 · Reviewed: `app/(auth)/accept-invitation/{page,invitation-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Governance clean: binds real `accept_invitation` (Doc-4C §C6); Org Role uses the FROZEN set (Manager — Inv #2, not invented); Users-act/Orgs-own note (Inv #5 — "Organizations own their records; by joining you act on behalf of this one"). Server-authoritative token (page validates/trusts nothing; org/role/inviter = realistic mock). Non-disclosure: invalid/expired → uniform notice, no org/account leak. `?state=` harness PROD-GATED (NODE_ENV); single h1 per state; `info-muted`/`warning-muted` (P-4); presentation-only accept/decline (honest interim, joins nothing).
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-AUTH-08).

### RV-0020 · P-ADM-07 · Vendor approval queue · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/vendor-approval/page.tsx`, `_components/admin/vendor-approval/vendor-approval-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] FIREWALL exemplary — approval is a PROFILE-STATUS decision (M2 claim lifecycle + visibility, Inv #3), explicitly NOT a trust/performance score or financial tier (M5 owns the score; verification is separate, P-ADM-12/13). Seed carries no signal (grep-verified). R5: Approve/Reject rendered-but-DISABLED (`set_vendor_profile_status`→M2, real contract Doc-4D). URL filter; no fabricated total; cursor pagination; 4th `AdminQueueTable` consumer (patched table — "Ref" header sans).
  2. [NIT] No route-level `loading.tsx` — consistent with the other admin queues; add before wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-08).

### RV-0021 · P-AUTH-08 · Email verification · Team-1
- Date: 2026-07-02 · Reviewed: `app/(auth)/verify-email/{page,email-verification-view}.tsx` (untracked; self-contained — stable target; other teams' in-progress work is in unrelated paths)
- Verdict: **PASS**
- Findings:
  1. [OBS] Governance clean: confirmation token is SERVER-AUTHORITATIVE (page validates/trusts nothing; binds Supabase Auth email confirmation — authentication only). Non-disclosure (Doc-7A §4.3/§8): an invalid/expired link → UNIFORM notice, no account-existence signal. The pending view shows the user's OWN pending address (self-disclosure, not a leak; correctly noted as wired-build behavior, mock seed here). Presentation-only: "Resend" sends nothing + honest inline note; no mutation.
  2. [OBS] `?state=` dev harness PROD-GATED (`process.env.NODE_ENV !== "production"`) — matches P-AUTH-05/06/07, the correct pattern (a real visitor never sees a fabricated state). Exactly one h1 per RENDERED state (the two `<h1>` in page.tsx are mutually-exclusive branches); heading tracks the branch (the benign heading/content mismatch NIT from P-AUTH-05/06 does not recur). P-4 inks honored: `iv-success-muted`/`iv-warning-muted`/`iv-info-muted` on `*-subtle` tints. Contrast independently computed: body `muted-foreground` (#5f6f86) = 4.70:1 on success-subtle, 4.75:1 on warning-subtle, 5.12:1 on Card — all AA-pass. All tokens verified to exist (globals.css + tailwind.config.ts); kit composition (BrandLogo/Card/Button); a11y (icons `aria-hidden`, resent note `role="status"`, focus-visible rings, disabled loading button). No route-level `loading.tsx` needed — no server data fetch to suspend on (the spinner is the dev `?state=loading` preview only).
  3. [OBS] Repo hygiene (NOT part of P-AUTH-08): two stray untracked root scripts `_axe-po.mjs` / `_axe-probe2.mjs` appeared in the tree (likely a11y probe scratch). Gitignore or delete before the commit checkpoint so they are not staged. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-01).

### RV-0022 · P-BUY-21 · Purchase order · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/po/{page,purchase-order-view,loading,not-found}.tsx`, `_components/purchase-order-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Projection discipline EXEMPLARY — VM carries ONLY the six frozen-projected fields of `ops.get_engagement_document.v1`, VERIFIED verbatim against Doc-4F §F5.8 (`document{ document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }`). PO body (`content_jsonb`), monetary total, and a document LIST are all DELIBERATELY omitted with documented reasons — nothing coined; `doc_kind` pinned to the frozen `"po"` enum value. No PO total invented → no BDT/currency assumption (correct: the read projects no amount).
  2. [OBS] `can_approve_po` handled as a DISTINCT slug — confirmed a REAL Doc-2 §7 slug (Doc-2:626; Doc-4F §F5.4 AI-note "do not collapse the two slugs"); gated in PRESENTATION only (both branches: withheld ≠ collapsed), server enforces at wiring; approve affordance DISABLED (Wave-4 write parked). Money boundary (DF-6/R8) standing note — record only, no pay/settle/escrow anywhere. Versioned/immutable (Inv #8) — active revision shown, `revision_reason` on revise, superseded retained.
  3. [OBS] `notFound()` collapse byte-identical (Inv #11/GI-12/H.9): unknown/absent PO AND non-party engagement resolve identically; `not-found.tsx` breadcrumb shows only the `Engagements` ancestor — NO leaf engagement/document ref leaks. `ESC-7G-ENG-03` registered (esc_registry.md:63) and kept in-code only (never user copy). `loading.tsx` present (SK-DETAIL); single h1 (PageHeader) → h2 CardTitles; strong reuse (no new primitive); disabled affordances carry WHY hints; GI-02 data layer parked (Wave 4) — presentation-only honored. A model detail page, on par with P-BUY-20 (RV-0015).
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-22).

### RV-0023 · P-ADM-08 · Category management · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/{page,loading}.tsx`, `_components/admin/categories/categories-seed.ts` · (shared `AdminQueueTable` verified UNCHANGED vs HEAD — `srHeader` pre-existing; no approved-component modification)
- Verdict: **PATCH REQUIRED** (BLOCKER 1 · MAJOR 1 · MINOR 1)
- Findings:
  1. **[BLOCKER] Invented category status vocabulary contradicts the FROZEN state machine.**
     - *Finding:* seed/page define `CategoryStatus = "active" | "hidden" | "archived"` with per-row actions Hide / Activate / Archive / Restore.
     - *Evidence:* Doc-2 §3.3 (line 280) categories `draft → active → retired`; entity columns `name, slug, level(1–4), path` (Doc-2 line 737, "YES (retire)"). Doc-4D `marketplace.set_category_status.v1` = **"Category Status (Approve / Retire)"** — `draft→active` (approve, the DD-4 staff act) and `active→retired` (retire) (Doc-4D PassA §153/§155; PassB §36; Hard-Review §64). Corpus grep for a category `hidden`/`archived` state → **ZERO hits** ("hidden" only appears as "no hidden ownership"; "archive" is RFQ, not categories).
     - *Reason:* `hidden` and `archived` are coined states with no frozen basis; `retired` is renamed to `archived`; **`draft` — the pre-approval state where category governance actually happens — is omitted entirely**; Hide/Activate/Restore are invented transitions. Violates Golden Rule 10 (Frozen Documents Are Authoritative) + frozen-enum-verbatim; misrepresents the real approve/retire governance workflow.
     - *Recommendation:* Model the frozen enum verbatim — `draft | active | retired`; actions **Approve** (`draft→active`) and **Retire** (`active→retired`), rendered-but-disabled (R5). Seed a `draft` (pending-approval) exemplar. Remove Hide/Activate/Archive/Restore.
  2. **[MAJOR] `specialized` rendered as a category attribute — it is an assignment-level flag.**
     - *Finding:* `CategoryVM.specialized` renders a "Specialized" marker on category NODES.
     - *Evidence:* `is_specialized` is a **`category_assignments`** column (vendor↔category) — Doc-2 §10.3 (line 738: `category_assignments | level, is_specialized, status(proposed/active/removed)`); Doc-4D `assign_category` Request `is_specialized : boolean` (PassB §46). The category entity has only `name, slug, level, path` (Doc-2 line 737) — no specialization flag.
     - *Reason:* Attributes an assignment-scoped concept to the taxonomy entity — a coined field on the category read.
     - *Recommendation:* Remove `specialized` from the taxonomy row; it belongs to a vendor's category assignment (e.g. P-VND-11), not the admin tree.
  3. **[MINOR] `code` is not a frozen category field; the frozen ref is `slug`.**
     - *Finding:* `CategoryVM.code` ("CAT-FAB", "CAT-VLV-CTL") drives a "Code" column.
     - *Evidence:* the category entity carries `slug` (Doc-2 line 737; `marketplace_category_slug_conflict`; `update_category` edits name/slug), not a "code."
     - *Reason:* coined display field; the taxonomy's human ref is `slug`.
     - *Recommendation:* use the frozen `slug` (label "Slug") or drop the column.
  4. [OBS] Structure otherwise sound — legitimate 5th `AdminQueueTable` consumer (uses the pre-existing `srHeader` for the actions column, good a11y; shared table byte-unchanged, git-verified); R5 disabled actions; firewall (no Trust/Perf/Tier); `loading.tsx` added (discharges the standing admin-queue NIT); URL status filter with allowlist + `aria-current`; depth-first indentation; no fabricated grand total. Once the status model + `specialized`/`code` are corrected the page is close. Wiring note: the frozen authz slug is `staff_can_manage_categories` (Doc-4D) — Admin/staff, no active-org.
- Result: page → 🟥 Patch Required. NOT advanced; returned to Team-3 (P-ADM-08 stays with Team-3; P-ADM-09 remains blocked until re-review PASS).

### RV-0024 · P-BUY-22 · Payments · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/payments/{page,payments-view,loading,not-found}.tsx`, `_components/payment-view-models.ts` (+ additive `view-models.ts` `PaymentStatus`, `state-display.ts` `paymentStatusDisplay`)
- Verdict: **PASS**
- Findings:
  1. [OBS] `payment_records` projection VERIFIED VERBATIM against Doc-2 line 783 / Doc-4F §F5.6 line 37 — `amount, currency, paid_at, method_note, status enum<recorded|confirmed>` — records only, no funds custody. VM carries exactly those fields; nothing coined; state machine `recorded → confirmed` (Doc-2 line 328). No `list_payment_records` read is frozen (ENG-03-class gap) — the list is a presentation stand-in, flagged in-code, no coined list contract.
  2. [OBS] Distinct slugs VERIFIED — Doc-4F §F5.6 line 373/400: `can_record_payments` (record) / `can_approve_payment` (confirm), *"distinct from"*, never collapsed. Record affordance gates on the former (de-duplicated: header XOR empty-state, never twice); per-row Confirm gates on the latter AND only on `recorded` rows (machine edge). MONEY BOUNDARY (DF-6/R8) standing note — records only, no pay/settle/escrow; writes PARKED (Wave 4). `notFound()` byte-identical (Inv #11/GI-12/H.9), no leaf-ref leak; `loading.tsx`.
  3. [OBS] Shared-file touches ALL git-verified safe: `PaymentStatus` (view-models.ts) + `paymentStatusDisplay` (state-display.ts) are PURELY ADDITIVE (no existing export changed; values match the frozen union, honoring the file's "no state without the frozen union" rule). `stickyFirstColumn` is a PRE-EXISTING `DataListTable` prop (file unchanged vs HEAD) — used for WCAG 2.1.1 keyboard-focusable scroll region; no approved-component modification. Model detail page, on par with P-BUY-20/21.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-23).

### RV-0025 · P-ACC-01 · Account overview · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/overview/{page,layout,account-overview-view}.tsx`, `account-nav-model.ts` (+ additive `_components/shell/icons.ts`)
- Verdict: **PASS**
- Findings:
  1. [OBS] Invariant #2 rendered correctly — Platform Participation (Buyer/Vendor badges) and Org Role (StatusChip "Owner") shown DISTINCTLY with explanatory copy ("separate from participation"), never conflated; frozen role set (Owner) + frozen participation set (`buyer|vendor|hybrid|staff`, shell/types.ts:12). Invariant #10 exemplary — entitlements are numeric (seats 8/25, credits 320/500) + enum StatusChip "Active", NEVER a plan-name; nav-model comment reinforces server-side entitlement gating via wired contracts ("hiding a link is convenience only; the server re-validates"). Firewall clean (no Trust/Perf/Tier); Users-act/Orgs-own (Inv #5 — client org id never trusted, server-resolved at wiring).
  2. [OBS] Shell `icons.ts` change git-verified PURELY ADDITIVE (2 lucide imports + 4 NAV_ICONS keys `account/members/roles/delegation`; existing keys untouched) — other nav consumers unaffected; all account-nav icon keys resolve. AppShell/PageHeader own the single h1 → h2 sections; kit reuse (no new primitive). `account-nav-model` grounded in page_inventory §12 nav; layout scoped to `/account/overview` only (does not wrap sibling P-ACC-14).
  3. [OBS] Forward links (Organization/Members/Roles/Delegation/Billing/Workflow) 404 until those P-ACC pages land — the accepted "overview-first / dashboard-first sub-routes" pattern (as P-ADM-01), honestly documented in both the view and the nav-model. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-02).

### RV-0026 · P-ADM-08 · Category management (re-review of RV-0023 patch) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/page.tsx`, `_components/admin/categories/categories-seed.ts`
- Verdict: **PATCH REQUIRED** (MAJOR 1) — RV-0023's 3 findings all RESOLVED; 1 new MAJOR surfaced by the corrected vocabulary
- Prior findings — resolved:
  - [RESOLVED BLOCKER RV-0023#1] status enum now FROZEN `draft | active | retired` (Doc-2 §3.3 line 280); META + FILTERS include `draft`; seed carries draft/active/retired exemplars.
  - [RESOLVED MAJOR RV-0023#2] `specialized` removed (it is a `category_assignments` flag, Doc-2 §10.3 — not a category attribute).
  - [RESOLVED MINOR RV-0023#3] `code` → `slug` (frozen `categories.slug`, Doc-2 line 737); slug column `font-mono` is td-only so the "Slug" header stays sans (RV-0013 split holds).
- New finding:
  1. **[MAJOR] `ACTIONS_BY_STATUS` offers transitions outside the frozen state machine.**
     - *Finding:* `draft: ["Approve","Retire"]`, `active: ["Retire"]`, `retired: ["Approve"]`.
     - *Evidence:* Doc-4D `marketplace.set_category_status.v1` — Request `target_status : enum(active|retired)`, STATE validation `draft → active → retired`; **retired is "terminal-for-discovery"** (Doc-4D PassB §38/§39/§41; Hard-Review §64 enumerates exactly two edges: `draft→active` approve, `active→retired` retire). No `draft→retired` and no `retired→active` (reactivate) edge exists; `target_status` cannot be `draft`.
     - *Reason:* "Retire" on a `draft` (draft→retired) and "Approve" on a `retired` (retired→active) are edges the frozen machine forbids — the command would return `STATE`. The page misrepresents the governance transitions available per state (and contradicts its own seed comment "retired is terminal-for-discovery"). Central governance affordance of the page → conformance-degrading (MAJOR), though contained (disabled/presentation, coins no data).
     - *Recommendation:* `ACTIONS_BY_STATUS = { draft: ["Approve"], active: ["Retire"], retired: [] }`; render the retired actions cell as a neutral "—" (as P-BUY-22 does for non-actionable rows). Keep the affordances disabled (R5).
  2. [OBS] Everything else conforms — frozen enum/labels correct, AdminQueueTable reuse (5th consumer; shared table byte-unchanged), R5 disabled, firewall clean, `loading.tsx`, URL filter allowlist + `aria-current`, no fabricated total. A one-map fix from PASS.
- Result: page → 🟥 Patch Required. NOT advanced; returned to Team-3 (fix the action map, then re-review).

### RV-0027 · P-ADM-08 · Category management (re-review of RV-0026 patch) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED MAJOR RV-0026#1] `ACTIONS_BY_STATUS = { draft: ["Approve"], active: ["Retire"], retired: [] }` — now exactly the two frozen linear edges (`draft→active` approve, `active→retired` retire; Doc-4D `target_status enum(active|retired)`); `retired` is terminal, no forward action. The actions cell renders a neutral `—` for the empty (terminal) case (`if (actions.length === 0) return "—"`) — same non-actionable pattern as P-BUY-22; affordances stay disabled (R5). No draft→retired / retired→active edge offered.
  2. [OBS] RV-0023's three findings remain resolved (frozen enum `draft|active|retired`, `specialized` absent, `slug` not `code`); AdminQueueTable reuse (5th consumer, shared table byte-unchanged), firewall clean, `loading.tsx`, URL filter allowlist + `aria-current`, no fabricated total. Clean.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-09).

### RV-0028 · P-BUY-23 · Trade invoice review · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/trade-invoice/{page,trade-invoice-view,loading,not-found}.tsx`, `_components/trade-invoice-view-models.ts` (+ additive `view-models.ts` `TradeInvoiceStatus`, `state-display.ts` `tradeInvoiceStatusDisplay`)
- Verdict: **PASS**
- Findings:
  1. [OBS] `trade_invoices` projection VERIFIED VERBATIM — Doc-2 line 782 / Doc-4F §F5.5 line 36/295: `human_ref (INV-…), amount, currency, status enum<issued|partially_paid|paid|disputed|cancelled>, due_date` — **≠ `billing.platform_invoices`**. VM carries exactly those fields; no line-items/breakdown coined. The M4↔M7 boundary (DF-6, no funds) is documented AND rendered (money-boundary note distinguishes trade vs platform invoice).
  2. [OBS] NO coined "approved" status — the VM explicitly flags page_inventory's `approve_trade_invoice`/`get_invoice` as LABELS, not contract IDs; the real writes are `issue_trade_invoice`/`update_trade_invoice_status` (Doc-4F §F5.5) and the machine has no "approved" state. Buyer review transition = a `disputed` raise: `update_trade_invoice_status` `target_status=disputed`, slug **`can_record_payments`** (VERIFIED — §F5.5 Authorization Matrix "slug held (trade invoices / payment records)"), gated `DISPUTABLE={issued,partially_paid}` (non-terminal), disabled/parked. `→ disputed` emits **`DisputeRecorded`** (Trust input DF-4, server-side, line 316) — never a locally-computed score; `disputed` is a trade-invoice status, not an engagement state.
  3. [OBS] Shared-state additions git-verified PURELY ADDITIVE (`TradeInvoiceStatus` in view-models.ts; `tradeInvoiceStatusDisplay` + import in state-display.ts — no existing export changed; values = the frozen union, honoring "no state without the frozen union"). `notFound()` byte-identical (Inv #11/H.9), no leaf-ref leak; `loading.tsx`; single h1 (PageHeader) → h2 CardTitles; reuse (no new primitive); cross-link to Payments (P-BUY-22). Note: exact legal source-states for `→ disputed` are server-enforced at wiring (the disabled affordance can't trigger an illegal edge). Model detail page.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-24).

### RV-0029 · P-ADM-09 · Category editor (create form) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/categories/new/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] `create_category` request bound VERBATIM (Doc-4D CatalogProductSpec §create_category): `name : string : required`, `slug : string : required` (unique), `parent_id : uuid : optional` (self-FK, ≤4-level), `level : integer : required` (1–4). Form fields = exactly those four; nothing missing/coined. New category enters at `draft` (Doc-2 §3.3 `→ draft`; Response `status enum(=draft)`) — page states it's approved later from Category management via `set_category_status`, never here.
  2. [OBS] R5 — Create rendered-but-DISABLED (`create_category` is M2/Marketplace-owned, DD-4 "category approval governance is Admin's; entity Marketplace-owned"; Admin decides, module applies) + `PresentationFormNote`. Firewall clean (no Trust/Perf/Tier). Boundary discipline EXEMPLARY — a native `<select>` styled to the kit Input, explicitly NOT importing the buyer surface's Select (surfaces stay decoupled); no new primitive. Parent select excludes `retired` nodes (safe subset; the frozen REFERENCE rule only requires parent existence — server-authoritative at wiring). PageHeader h1 → DashboardSection; FormField label/id association correct.
  3. [OBS] Cross-workspace reuse of `DashboardSection`/`PresentationFormNote` (vendor/ atoms imported into admin) continues — reinforces the standing shared-atom promotion candidate; a kit `Select` primitive is a promotion-watchlist item if selects proliferate. Wiring note: authz slug `staff_can_manage_categories`, no active-org (§5.6). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-10).

### RV-0030 · P-ACC-02 · User profile · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/profile/{page,layout,user-profile-form}.tsx` (+ shared `account-nav-model.ts` one-line repoint)
- Verdict: **PASS**
- Findings:
  1. [OBS] Field discipline VERIFIED verbatim — edits exactly `update_user_profile.v1` writable fields (Doc-4C §C4 PassB:174–175: `display_name : optional : bounded`, `phone : optional : E.164`); the form's `PHONE_RE` is E.164. EMAIL is auth-managed (DC-4) → rendered READ-ONLY, never mutated ("never password/2FA-secret fields", line 117). Avatar change deferred `[ESC-7-API/upload]` (disabled). Presentation-only: save writes nothing, shows an honest interim; discard-confirm Dialog; save bar only when dirty; single h1 (PageHeader); firewall clean.
  2. [OBS] Shared `account-nav-model.ts` change git-verified = a ONE-LINE href repoint (`Profile` `/account` → `/account/profile`, which now exists as this page); safe — no other consumer breaks, P-ACC-01's layout still resolves. (Forward-consistency nit: P-ACC-01's overview "Edit profile" still points to `/account`/P-ACC-14 — a product call, non-gating.) `--iv-form-max` token is undefined in the design system → team used `max-w-2xl` and flagged it to the token owner (honest; no coined token). Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-03).

### RV-0031 · P-BUY-24 · Challan · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/engagements/[engagementId]/challan/{page,challan-view,loading,not-found}.tsx`, `_components/challan-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] PO-parity (RV-0022 pattern) minus the financial card — VM carries ONLY the 6 `get_engagement_document.v1` projected fields (Doc-4F §F5.8, verified at RV-0022), `doc_kind` pinned to the frozen `"challan"` enum value; challan BODY (`content_jsonb`, delivery line items/quantities) deliberately omitted — nothing coined. READ-ONLY for the buyer: deliveries are recorded by the delivering party via `record_delivery` (slug `can_create_documents`) → `DeliveryRecorded` (a frozen BC-OPS-2 Trust input, DF-4; server-side, no score computed). page_inventory's `get_challan` correctly flagged as a LABEL.
  2. [OBS] Versioned/immutable (Inv #8); `notFound()` byte-identical, no leaf-ref leak (Inv #11/H.9); `loading.tsx`; ZERO shared-file edits; non-financial (no money surface). Structurally a versioned-engagement-document promotion candidate once WCC lands (noted). Model detail page.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-25).

### RV-0032 · P-ADM-10 · Ad review queue · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/ads/{page,loading}.tsx`, `_components/admin/ad-review/ad-review-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] `advertisements` fields VERIFIED verbatim (Doc-2:749 / Doc-4D PassB Advertising:21): `creative_ref` (the identifier — ads have NO human_ref, correctly stated), `placement enum{landing|bottom|search|vendor_profile}`, `schedule`, `status(§5.8)`, optional `vendor_profile_id` (→ advertiser display). Nothing coined. Status subset = the review-relevant `pending_review|scheduled|rejected` (frozen §5.8 machine, `review_advertisement`: `pending_review→scheduled` approve / `→rejected`). R5 — per-row Review DISABLED (decision is `review_advertisement`, Admin, on P-ADM-11 detail; queue invokes nothing).
  2. [OBS] FIREWALL §B.11 EXACT (Doc-4D PassB Advertising:20): "ads are visibility/placement, never gate trust/eligibility/routing/matching" — no governance signal in the queue. 6th `AdminQueueTable` consumer (shared table byte-unchanged); `loading.tsx`; URL filter allowlist + `aria-current`; no fabricated total (GI-03). Wiring note: review slug carries `[ESC-MKT-SLUG-note]` (under-specified in corpus) — server-authoritative at wiring.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-11).

### RV-0033 · P-ADM-11 · Ad review detail · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/ads/[adId]/page.tsx`, `_components/admin/ad-review/ad-review-seed.ts` (extend)
- Verdict: **PATCH REQUIRED** (MINOR 1)
- Findings:
  1. **[MINOR] `invoiceRef` coins a cross-module (M7 Billing) human ref not in the ad's frozen projection.**
     - *Finding:* the detail renders "Billing invoice: `INV-2026-004512`" from `AdDetailVM.invoiceRef`.
     - *Evidence:* the frozen `advertisements.platform_invoice_id` is a **bare UUID ref (DD-5, explicit — Doc-4D PassB Advertising:21 "bare UUID"; Doc-2:749)**; the ad projection carries the UUID, not a resolved Billing `human_ref`. The seed comment itself labels the value `platform_invoice_id (DD-5 …)` yet stores a human `INV-…` ref — an internal mismatch.
     - *Reason:* renders a cross-module human_ref the ad read doesn't own/project — the same "display value from a bare cross-module UUID" case the engagement pages handled by registering **ESC-7G-ENG-02** + using an opaque ref, never coining. (Contained: one admin-detail field, presentation seed, disabled surface — hence MINOR.)
     - *Recommendation:* render the bare `platform_invoice_id` as an opaque ref (e.g. `Invoice #<id>`), OR if admins should see the Billing human_ref, register an ESC handle for the Billing-ref resolution (as ENG-02) and keep it in-code — don't silently coin `INV-…`. Fix the seed comment to match.
  2. [OBS] Everything else conforms — `review_advertisement` bound VERBATIM (Doc-4D §B: `decision enum(approve|reject)`, `reason` REQUIRED on reject; state `pending_review → scheduled|rejected`, §5.8; decision offered ONLY while pending). Authz slug `staff_super_admin` is CORPUS-ACCURATE (Doc-4D §B.9 "nearest existing platform-staff slug; not invented; least-privilege ad-review slug is a future §7 additive, D-2") — and the code bakes in no slug (actions disabled, R5). Seed extension git-verified PURELY ADDITIVE (new `AdDetailVM`/`AD_DETAILS`/`getAd`/`getAdDetail`; P-ADM-10 exports untouched). Firewall §B.11 note; `notFound()` Inv #11; reason textarea label/id associated + disabled; single h1 (PageHeader → DashboardSection). `purchaser`/`advertiser` name-resolution from org/profile UUIDs is accepted admin-surface display (consistent with P-ADM-10 RV-0032). One-field fix from PASS.
- Result: page → 🟥 Patch Required. NOT advanced; returned to Team-3 (fix `invoiceRef`, then re-review).

### RV-0034 · P-ACC-03 · Security & 2FA · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/security/{page,layout,security-settings}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Field discipline VERIFIED verbatim — 2FA toggle → `update_user_2fa_settings.two_fa_enabled` (Doc-4C §C4 PassB:192: `two_fa_enabled : boolean : required`, `recovery_method : enum : optional`); the TOTP challenge/verification is Supabase Auth infra (DC-4) and correctly NOT represented (matches the frozen note exactly); no 2FA secret shown (DC-4). Deactivation → `deactivate_own_account.v1` (real frozen contract, §C4 PassB:201). Presentation-only: save + deactivate write nothing (honest interims, `role="status"`).
  2. [OBS] Exemplary destructive pattern — "Deactivate" behind a TYPED-confirm ("DEACTIVATE") Dialog (button disabled until the phrase matches); danger conveyed by heading + label + typed-confirm, NOT colour alone (a11y); P-4 danger inks (`iv-danger-subtle`/`iv-danger-muted`). Accessible hand-wired `role="switch"` (aria-checked/aria-labelledby) since no kit `Switch` exists — flagged for the kit owner (boundary discipline, promotion-watchlist). Single h1 (PageHeader) → `CardTitle as="h2"`; firewall clean; shared account nav/shell reused.
  3. [NIT] The page comment cites "(Doc-5C)" for `deactivate_own_account` while the authoritative contract is **Doc-4C §C4** (the page also correctly cites Doc-4C §C4 for the 2FA command) — pointer inconsistency in a comment; contract itself real + correctly named. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-04).

### RV-0035 · P-ADM-11 · Ad review detail (re-review of RV-0033 patch) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/ads/[adId]/page.tsx`, `_components/admin/ad-review/ad-review-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED MINOR RV-0033#1] `invoiceRef` → `platformInvoiceId`: the detail now renders the OPAQUE `advertisements.platform_invoice_id` (bare UUID, DD-5) in `font-mono`, labelled "Billing purchase ref" — no coined M7 "INV-…" human ref. Seed values are now real UUIDs (e.g. `9f2c1a7e-4b83-…`), and the seed comment is corrected ("a BARE UUID (DD-5) … never coin an 'INV-…'"). Matches the recommendation exactly.
  2. [OBS] Unchanged and still conformant (per RV-0033): `review_advertisement` bound verbatim (decision `approve|reject`, reason required on reject, `pending_review→scheduled|rejected`); slug `staff_super_admin` corpus-accurate + not baked into code (actions disabled, R5); seed extension additive; firewall §B.11; `notFound()` Inv #11; single h1. Clean.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-12).

### RV-0036 · P-ACC-04 · Organization profile · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/organization/{page,layout,organization-profile}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] `update_organization_profile` fields VERIFIED verbatim (Doc-4C §C5:255): `name : optional : bounded`, `address : Address VO : optional`, `contact_info : ContactInfo VO : optional`, `brand_assets_ref : optional`, optimistic `updated_at`. Only scalar `name` edited inline; Address/ContactInfo VO editor + logo `brand_assets_ref` upload DEFERRED (`[ESC-7-API]`/`[ESC-7-API/upload]`; VO sub-shape → Doc-2 §2, presented read-only, not coined). `verification_level` NEVER mutated here (read-only Badge) — verification changes only via verification flows (FIREWALL); `human_ref`/`org_status` read-only.
  2. [OBS] `transfer_ownership` EXEMPLARY (Doc-4C §C5:267–279): `can_transfer_ownership` Owner-only + **Delegation not eligible** (ownership-class never delegable, Doc-2 §5.10); `new_owner_user_id` must hold an ACTIVE membership (active-member radio picker); `reason_code` required structured succession (Architecture §5.5); **Last Owner Protection** warned ("always keeps at least one owner"); destructive TYPED confirm ("TRANSFER"), not colour-only. Frozen Org Roles in the picker (Inv #2). Presentation-only (honest interims); single h1 (PageHeader → CardTitle as="h2"); firewall clean.
  3. [OBS] Non-gating: "you become a Director" post-transfer copy predicts the outgoing-owner role — confirm against Architecture §5.5 succession at wiring (corpus doesn't state the demotion role explicitly). `--iv-form-max` undefined → `max-w-2xl` (flagged); hand-rolled radios (no kit Radio — promotion-watchlist).
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-05).

### RV-0037 · P-ADM-12 · Verification queue · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/verification/{page,loading}.tsx`, `_components/admin/verification/verification-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Frozen bindings VERIFIED verbatim — `verification_tasks` states `queued → in_review → decided` (Doc-2:390/847); `verification_type` enum `contact|business|factory|organization|tier|capacity` (Doc-2:795); subject types vendor profile/organization/capacity claim/declared tier (Doc-2:547). FILTERS = the 3 frozen states. Nothing coined.
  2. [OBS] FIREWALL exemplary (Inv #6 / Architecture §1.5) — NO Trust Score, NO Performance Score, NO Financial-Tier BAND anywhere; `verification_type: "tier"` is the verification KIND ("Financial tier"), NOT a tier band value — the careful distinction is correct. R5 — Assign rendered-but-DISABLED (`assign_verification_task`→M5; the `decide_verification_task` decision lives on P-ADM-13); "Admin decides; Trust stores" (Doc-2:108/227) rendered in the description. 7th `AdminQueueTable` consumer (shared table byte-unchanged); `loading.tsx`; URL filter allowlist + `aria-current`; no fabricated total (GI-03). Wiring note: staff slug `staff_can_verify` (Doc-2:645, Verification Admin).
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-13).

### RV-0038 · P-BUY-25 · WCC (Work Completion Certificate) + `EngagementDocumentFileCard` extraction · Team-2
- Date: 2026-07-02 · Reviewed: `.../wcc/{page,wcc-view,loading,not-found}.tsx`, `_components/wcc-view-models.ts`, NEW `_components/engagement-document-file-card.tsx`; **blast-radius re-verify:** `.../po/purchase-order-view.tsx` (P-BUY-21), `.../challan/challan-view.tsx` (P-BUY-24)
- Verdict: **PASS**
- Findings:
  1. [OBS] WCC follows PO/Challan discipline — VM carries ONLY the 6 `get_engagement_document.v1` projected fields (Doc-4F §F5.8), `doc_kind` pinned frozen `"wcc"`; `content_jsonb` body omitted (not coined); `get_wcc` flagged as a LABEL (real read = `get_engagement_document`). READ-ONLY (WCC issued by the certifying party; `WorkCompletionIssued` = a frozen BC-OPS-2 Trust input, server-side, no score computed); versioned Inv #8; `notFound()` byte-identical (Inv #11/H.9); `loading.tsx`; non-financial (no money surface).
  2. [OBS] **Shared `EngagementDocumentFileCard` extraction (rule of three: PO+Challan+WCC) — byte-equivalence GIT-VERIFIED.** The shared card reproduces the prior inline markup exactly; `git diff HEAD` on both approved consumers shows ONLY: (a) REUSE comment, (b) import prune (drop now-unused `FileText`/`EmptyState`; PO keeps `Button` for its approval card, Challan drops it), (c) the inline "Document file" `<Card>` replaced by `<EngagementDocumentFileCard storageRef … documentNoun=…>`. `documentNoun="purchase order"`/`"delivery challan"` reproduce the exact original copy strings ("The generated … document." / "The rendered … will appear here once it is generated."). No rendered-output change → **P-BUY-21 (RV-0022) and P-BUY-24 (RV-0031) remain valid**; nothing else in either file touched.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-26). P-BUY-21/P-BUY-24 stay ✅ Approved (extraction byte-equivalent).

### RV-0039 · P-ADM-13 · Verification task detail · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/verification/[taskId]/page.tsx`, `_components/admin/verification/verification-seed.ts` (extend)
- Verdict: **PASS**
- Findings:
  1. [OBS] `decide_verification_task` decision set VERBATIM — `approve | reject | confirm | downgrade | request_info` (Doc-2:796 `verification_decisions.decision`); rendered as DISABLED affordances (R5 — M5 Trust owns the effect) + disabled reason textarea + `PresentationFormNote`, offered ONLY while the task is not `decided` (Doc-2:390); a `decided` task shows the recorded decision/reason/decided_by read-only. Evidence = `verification_records.evidence_document_refs[]` opaque doc IDs (font-mono, display only); `requested_by`/`expires_at` frozen `verification_records` fields; `decided_by` = staff decider (Doc-2:796). Nothing coined.
  2. [OBS] FIREWALL exemplary (Inv #6 / Architecture §1.5) — NO Trust Score, NO Performance Score, NO Financial-Tier BAND rendered anywhere; explicit note "No trust, performance, or financial-tier score is shown or set here — Trust owns and computes the score." "downgrade" is the frozen decision VERB (Admin decides), not a band/score readout. `notFound()` Inv #11; single h1 (PageHeader → DashboardSection); reason textarea label/id associated + disabled.
  3. [OBS] Seed extension git-verified PURELY ADDITIVE — new `VerificationDecision`/`VERIFICATION_DECISION_LABEL`/`VerificationDetailVM`/`VERIFICATION_DETAILS`/`getVerificationTask`/`getVerificationDetail` appended; existing `VERIFICATION_TASKS`/`_STATUS_META`/`_TYPE_LABEL`/`VerificationTaskVM` untouched → P-ADM-12 (RV-0037) unaffected. Wiring note: `staff_can_verify`. Completes the P-ADM-12/13 verification pair.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-14).

### RV-0040 · P-BUY-26 · CRM — vendor list (buyer-private, non-disclosure crux) · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/crm/{page,crm-list-view,loading}.tsx`, `_components/crm-list-view-models.ts` (+ additive `view-models.ts`/`state-display.ts`)
- Verdict: **PASS**
- Findings:
  1. [OBS] **NON-DISCLOSURE crux handled exactly (Inv #11 / §7.5).** `list_private_vendors.v1` Response Schema projects EXACTLY `{ private_vendor_record_id, name, link_status, state }` (Doc-4F §F4.9:466 — VERIFIED); the VM/view carry ONLY those four. The buyer's CRM approval status (`approved|conditional|blacklisted`) is a SEPARATE aggregate (`buyer_vendor_statuses`), NOT in the list projection → NOT modeled, NOT rendered → a blacklist stays UNDETECTABLE (H.9: "never a vendor-detectable or buyer-list-detectable fact"; only egress is the internal read-service to RFQ routing, §F4.6). `link_status` (none/suggested/linked) is the private↔public LINK state, explicitly NOT an approval signal (called out in code).
  2. [OBS] Own-org only; genuine-empty never implies exclusion ("No vendors in your CRM yet"); NO free-text search box (only the frozen `filter.link_status` allowlist — avoids implying an unprojected read); cursor pagination (GI-03, no grand total); contract order (GI-04); opaque id → /crm/{id} detail (P-BUY-27). Shared-state additions git-verified ADDITIVE (`PrivateVendorLinkStatus`/`PrivateVendorState` + `privateVendorLinkStatusDisplay`; comments reinforce link≠approval). A model non-disclosure listing.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-27).

### RV-0041 · P-ACC-05 · Organization lifecycle · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/organization-lifecycle/{page,layout,organization-lifecycle}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] `soft_delete_organization`/`restore_organization` VERIFIED verbatim (Doc-4C §C5:281–304): Owner-only slug `can_delete_organization` (never delegable); `confirmation : boolean` (expressed as a destructive TYPED "DELETE" confirm, not colour-only) + `reason` required; state `active → soft_deleted`. SOFT-DELETE ONLY — recoverable, IDs never reused (Inv #8). Restore: `soft_deleted → active`; reused slug regenerated ("a new web address is generated" = frozen `slug_regenerated`/§5.1 restore-conflict). Cross-module cascade (vendor profile/RFQs) correctly BLOCKED pending [DC-1] — not synthesized.
  2. [OBS] `?state=deleted` preview PROD-GATED (`NODE_ENV !== "production"`) — mirrors the auth `?state=` pattern; a real visitor never sees a fabricated lifecycle state. Presentation-only (honest interims, `role="status"`); danger conveyed by heading + label + typed-confirm (P-4 `iv-danger-subtle`/`iv-danger-muted`); single h1 (PageHeader) → `CardTitle as="h2"`; shared account shell/nav reused.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-06).

### RV-0042 · P-ADM-14 · Import jobs · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/imports/{page,loading}.tsx`, `_components/admin/imports/imports-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Frozen bindings verbatim — `import_jobs` states `queued → processing → completed / failed` (Doc-2:389 / Doc-4J H.5:25); `job_type` enum `categories | vendor_seed` (Doc-4J:247); list-view fields id/job_type/initiated_by/created_at only. `import_jobs` carry NO human_ref → `id` shown OPAQUE (bare UUID, font-mono) — not a coined ref. `stats_jsonb` correctly deferred to the detail (P-ADM-15) — no fabricated row/stat totals (GI-03). Firewall + moat: import LOADS data, owns no seeded entity (Marketplace owns those); no score, no procurement decision.
  2. [OBS] R5 — "New import job" rendered-but-DISABLED (`submit_import_job` is the separate P-ADM-15 wizard, BC-ADM-4-owned). 8th `AdminQueueTable` consumer (shared table byte-unchanged); `loading.tsx`; URL filter allowlist + `aria-current`; single h1. Wiring note: `[ESC-ADM-SLUG]` (Doc-4J — no §7 import slug; carried, not invented).
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-15).

### RV-0043 · P-BUY-27 · CRM — vendor detail (buyer-private, highest-stakes non-disclosure) · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/crm/[recordId]/{page,crm-detail-view,loading,not-found}.tsx`, `_components/crm-detail-view-models.ts` (+ additive `view-models.ts`/`state-display.ts`)
- Verdict: **PASS**
- Findings:
  1. [OBS] **NON-DISCLOSURE handled exactly (Inv #11 / §7.5 / firewall M4).** Composes `get_private_vendor.v1` + `get_buyer_supplier_relationship.v1` (Doc-4F §F4.9:466) — renders only projected fields (record {name,email,phone,source,link_status,state} + notes{note_id,note} + ratings{rating_id,score,comment} + relationship {current_status,is_favorite}). `details_jsonb` (unstructured, dev-doc) and `caveat_note` (write-side field on set_buyer_vendor_status, not in either read) correctly OMITTED — not coined. `current_status` (approved|conditional|blacklisted|none) is shown ONLY when LINKED and ONLY to the OWNING buyer, with explicit rendered framing "private to your organization… never shown to the vendor… never affects any platform-wide score." A non-owned/absent record → `notFound()` byte-identical (H.9; not-found breadcrumb shows only the `Vendor CRM` ancestor) — a vendor can never reach this page. `blacklisted`→danger tone is for the owning buyer's clarity; stays undetectable to the vendor (only egress = internal RFQ-routing read §F4.8).
  2. [OBS] DISTINCT slugs gated SEPARATELY — status set/clear on `can_manage_vendor_status` (O,D,M), notes/ratings/favorite on `can_manage_private_vendors` (O,D,M,F) (Doc-2:623/624 — real, distinct, never collapsed); all writes PARKED/disabled; "Clear status" shown only when a non-`none` status exists. `source` enum manual|email_list|excel verbatim; opaque IDs (Inv #5); single h1 (PageHeader); shared-state additions git-verified ADDITIVE (`BuyerVendorStatus`/`PrivateVendorSource` + `buyerVendorStatusDisplay`; comments reinforce firewall). Completes the buyer-private CRM pair (P-BUY-26/27) — a model for non-disclosure surfaces.
- Result: page → ✅ Approved. Team-2 buyer queue COMPLETE (P-BUY-27 was the last tracker page).

### RV-0044 · P-ACC-06 · Members · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/members/{page,layout,members-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] `set_membership_status` (target_status ∈ {suspended, active}; `active ⇄ suspended`) + `remove_member` (`active|suspended → removed`, terminal) VERIFIED verbatim (Doc-4C §C6:387/401; Doc-2 §5.2); both slug `can_manage_users`. **LAST OWNER PROTECTION (§5.5)** — the sole active Owner's Suspend AND Remove are disabled (`protectedOwner`); server also enforces. Frozen Org Roles (Owner/Director/Manager/Officer, Inv #2) + membership states; presentation-only (all actions honest interims, `role="status"`); remove-confirm dialog (reason optional, "history retained, can be re-invited" = frozen "audit retained; never reopens").
  2. [OBS] Good a11y — semantic `<table>` + caption + `scope="col"` + sr-only Actions header; DropdownMenu row actions with `aria-label`; filter selects with sr-only labels; search `aria-label`. Own-org member search is benign (not the CRM/engagements cross-tenant case). Hand-rolled table correctly NOT importing the admin `AdminQueueTable` (surface-scoped). Single h1 (PageHeader).
  3. [OBS] "Invited" rows represent outstanding invitations (frozen membership machine is `pending → active`); they carry NO membership actions here and are explicitly routed to the invite flow (`revoke_invitation`, P-ACC-07) — honestly scoped, not a coined membership status. Non-gating.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-07).

### RV-0045 · P-ADM-15 · Import job — new / detail · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/imports/new/page.tsx`, `app/(app)/admin/imports/[jobId]/page.tsx`, `_components/admin/imports/imports-seed.ts` (extend)
- Verdict: **PASS**
- Findings:
  1. [OBS] (create) `submit_import_job` request VERBATIM (Doc-4J:247): `job_type enum<categories|vendor_seed>` + `file_ref`; submitted → `queued`, processed async by System (`process_import_job`) — create-then-poll documented. Start rendered-but-DISABLED (R5, BC-ADM-4-owned); Admin-self-contained native `<select>` (no cross-surface import). (detail) `get_import_job` + `list_import_rows`: `stats` binds to `import_jobs.stats_jsonb` (per-JOB detail field — legitimately on the detail, NOT a query grand-total); per-row outcomes = `import_rows` RowError VO (row/outcome/detail); read surface, no action invoked (R5; System advances); `notFound()` Inv #11; reflects "latest recorded state" (honest async).
  2. [OBS] Firewall+moat (import loads data; seeded records Marketplace-owned; no score/procurement). Seed extension git-verified PURELY ADDITIVE (`ImportRowVM`/`ImportStats`/`ImportJobDetailVM`/`IMPORT_DETAILS` + getters; P-ADM-14 exports untouched). Reuses AdminQueueTable (row-errors) + DashboardSection/DescriptionList; single h1. Completes the P-ADM-14/15 import pair. Wiring: `[ESC-ADM-SLUG]`.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-16).

### RV-0046 · P-ADM-16 · Outreach campaigns · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/outreach/{page,loading}.tsx`, `_components/admin/outreach/outreach-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] `outreach_campaigns` states `draft → running → completed` verbatim (Doc-2:391 / Doc-4J H.5:25 / §303); list view projects only `id`, `state`, `created_at` (Doc-4J:326) — `outreach_campaigns` has NO name field → `id` shown OPAQUE (bare UUID, font-mono); nothing coined. R5 — "New campaign" rendered-but-DISABLED (`create_outreach_campaign` actioned on the P-ADM-17 detail, BC-ADM-6-owned). No fabricated contact/total counts (GI-03 — contacts live on the detail). 9th `AdminQueueTable` consumer; `loading.tsx`; URL filter allowlist + `aria-current`; single h1.
  2. [OBS] **MOAT guard exact (Doc-4J §BC-ADM-6):** rendered "Outreach is informational only — it never affects matching, routing, ranking, or supplier selection"; no score (firewall); target vendors are Marketplace-owned (referenced by UUID, never owned by Admin — the list shows campaigns only). Wiring: `[ESC-ADM-SLUG]` / `[ESC-ADM-AUDIT]` (no §7 outreach slug / not §9-enumerated).
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-17).

### RV-0047 · P-ACC-07 · Invite member · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/members/invite/{page,invite-member-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] `invite_member` VERIFIED verbatim (Doc-4C §C6:344): `email` (required, format-validated) + `role_id` (required, REF → identity.roles same org; seed stand-ins for `list_roles`) + `department` (optional); state `→ invited` (Doc-2 §5.2); slug `can_manage_users`. Owner correctly EXCLUDED from invitable roles (Owner is minted via succession/`transfer_ownership`, not invite). `revoke_invitation` verbatim (§C6:415): `invited → removed` (terminal), `can_manage_users`, valid only on a not-yet-accepted invite. ORG MEMBERS ONLY — never vendor invitations (engine-only). Presentation-only (honest interims); revoke-confirm dialog.
  2. [OBS] Seats shown as a NUMERIC entitlement (8 of 25) + "Manage seats" → Billing (Invariant #10, never a plan-name). Semantic pending-invites table (caption, `scope="col"`, sr-only Actions); FormField label/error a11y; single h1 (PageHeader → CardTitle as="h2" + section h2). NOTE (self-correction of RV-0044 OBS#3): `invited` IS a frozen membership state (`invite_member` → `invited`, §5.2) — P-ACC-06's "invited" rows were on frozen ground; PASS stands, no action.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-08).

### [PLAT-P7] — Team-4 corroboration of a Team-2-raised FROZEN-KIT a11y finding (NOT a page verdict)
- Date: 2026-07-02 · Raised by Team-2 (blocking P-BUY-02 Discover vendors) · Reviewed by Team-4 (QCT)
- **VALID (contrast independently recomputed).** `CapabilityMatrix` compact OFF-chip ink = `text-muted-foreground` (`--iv-fg-muted` = `#5f6f86`) at `opacity-70` → effective `#8f9aaa` on white = **2.85:1** — FAILS WCAG AA (4.5:1 normal text). It is a FROZEN-KIT primitive rendered on EVERY `VendorCard` consumer — so this also affects already-built public pages (P-PUB-12 vendor directory, P-PUB-16 microsite capabilities), not only P-BUY-02.
- **Disposition:** Team-2's **FLAG-AND-HALT is correct** — a page cannot pass the a11y gate over an AA failure, and Team-2 must NOT modify the frozen foundation. **Team-4 does NOT authorize the fix** — modifying the frozen kit is human/kit-owner-gated (CLAUDE.md §7/§8; foundation-frozen). Recommended fix (for the kit-owner): drop `opacity-70` and use an AA-safe muted ink (the P-4 `*-muted` pattern) on the compact OFF-chip. **Escalated to owner/kit-owner; P-BUY-02 stays 🟡 blocked (not a Team-2 defect).**
- **2026-07-02 · RESOLUTION — OWNER APPROVED (Kit Owner authorized).** The frozen-kit change is now sanctioned (genuine architectural reason = WCAG AA remediation; human approval on record per §8).
  - **Sanctioned scope (exact, minimal):** ONLY the `CapabilityMatrix` compact OFF-chip ink — remove `opacity-70` and set an AA-safe muted ink (P-4 `*-muted`, ≥4.5:1 on white). NO other change to the primitive (ON-chip, layout, API, non-compact variant all unchanged). Applied by the **Kit Owner** (src/frontend/), NOT Team-4 (review-only; SoD — the reviewer never implements).
  - **Team-4 re-review gate when it lands (platform-primitive change):** (1) recompute contrast — new OFF-chip ink ≥ 4.5:1 on white; (2) git-diff the kit file — the ONLY change is that ink (no behavior/API/layout change); (3) confirm all `VendorCard` consumers benefit — P-PUB-12, P-PUB-16 (already-approved, so re-affirm they're unchanged except the AA fix) + P-BUY-02/03; (4) then Team-2 re-runs axe → flips P-BUY-02 🔵 → normal page review.
  - **Status:** authorization RECORDED; awaiting the Kit Owner's one-line change, then Team-4 platform re-verify. P-BUY-02 remains 🟡 until the fix lands + re-axe.
- **2026-07-02 · VERIFIED ON LANDING — Team-4 platform re-review: PASS.** Kit Owner applied the fix to `src/frontend/components/capability-matrix.tsx`. Git-diff = EXACTLY the sanctioned scope: the OFF-chip class dropped `opacity-70` (now `border-dashed border-border text-muted-foreground`) + an explanatory comment; ON-chip (`border-border text-foreground`), layout, API, and non-compact rendering all UNCHANGED. Contrast recomputed: OFF-chip ink = `muted-foreground` `#5f6f86` (full opacity) on white = **5.12:1** ≥ AA 4.5:1 (small `text-2xs`) — resolved. All `VendorCard` consumers benefit (P-PUB-12, P-PUB-16, P-BUY-02/03); the two already-approved public pages remain ✅ (this is the authorized AA remediation, a strict improvement, not a regression). **PLAT-P7 CLOSED.**

### RV-0048 · P-BUY-02 · Discover vendors · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/discover/{page,discover-view,loading}.tsx`, `_components/discover-view-models.ts` (unblocked by the PLAT-P7 kit fix)
- Verdict: **PASS**
- Findings:
  1. [OBS] Grounded in `list_vendor_directory`/`search_catalog` (Doc-4D §B.3) — VendorCardVM maps only the public projection (`name, human_ref, capability_flags, geography, categories`). TRUST = BINARY "Verified" only — NO numeric/band score (respects `[ESC-7G-SCORE-DISPLAY]`, the open score/band-display decision); "displayed never computed" (M5 owns it, firewall). CAPABILITY = the 4-flag matrix (Inv #1) via the now-AA-fixed `CapabilityMatrix`.
  2. [OBS] DISCOVERY ≠ MATCHING (DD-2/moat) — cards render in contract order, never re-ranked/scored/recommended client-side; cursor pagination (Doc-4D §B.6), no grand total. NON-DISCLOSURE (Inv #11/§7.5) — a blacklisted/never-matched vendor appears byte-identical (no buyer-private field on the card); empty state never implies exclusion. Search box is contract-legitimate (frozen `search_catalog.query`) — the VM explicitly distinguishes this from the attribute-only CRM/engagement lists (sharp discipline). Heading order h1→(sr-only h2)→VendorCard h3; opaque slug routes (Inv #5); shared kit reuse.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-03).

### RV-0049 · P-ADM-17 · Campaign detail · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/outreach/[campaignId]/page.tsx`, `_components/admin/outreach/outreach-seed.ts` (extend)
- Verdict: **PASS**
- Findings:
  1. [OBS] `get_outreach_campaign` detail = campaign (id/state/created — no name field → opaque id, nothing coined) + contacts (`outreach_contacts`: target vendor referenced by OPAQUE UUID — Marketplace-owned, never owned by Admin; invite stage). R5 — Run/Complete rendered-but-DISABLED per the frozen machine (Run only from `draft`, Complete only from `running`, `completed` terminal; BC-ADM-6-owned). `notFound()` Inv #11. MOAT guard exact — "informational only; never affects matching/routing/ranking/supplier selection; no score (firewall)." Contacts via `AdminQueueTable`; single h1.
  2. [OBS] Seed extension git-verified PURELY ADDITIVE (`OutreachContactVM`/`OutreachCampaignDetailVM`/`OUTREACH_DETAILS`/`getOutreachCampaign`/`getOutreachCampaignDetail`; P-ADM-16 exports untouched). Completes the P-ADM-16/17 outreach pair. Wiring: `[ESC-ADM-SLUG]`/`[ESC-ADM-AUDIT]`.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-18).

### RV-0050 · P-ACC-08 · Roles · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/roles/{page,layout,roles-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Rows map EXACTLY to `list_roles` items `{ role_id, name, is_system_bundle }` (Doc-4C §C7:465; Doc-2 §10.2). `is_system_bundle` → System (Owner/Director/Manager/Officer seeds) vs Custom (org-authored) chip; System → "View" (read-only), Custom → "Edit" (management applies to custom roles only, §C7). No inline permissions — those are the separate `list_permissions` slug catalog (Inv #10 by-reference, P-ACC-10); nothing coined. Presentation-only; opaque role_id → /account/roles/{id} (P-ACC-09).
  2. [OBS] EXEMPLARY authority-order discipline — per-role MEMBER COUNT deliberately OMITTED with an explicit citation: "`list_roles` returns no count (§C7:465), so surfacing one would fabricate a field the contract can't supply — the frozen contract outranks the Doc-7E planning note that mentions a count." (Reference-never-restate / §7 authority applied proactively.) Semantic table (caption, `scope="col"`, sr-only Open header); own-org role search benign; single h1; PaginationControl no total.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-09).

### RV-0051 · P-ADM-18 · Outreach contacts · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/outreach/contacts/{page,loading}.tsx`, `_components/admin/outreach/outreach-seed.ts` (extend)
- Verdict: **PATCH REQUIRED** (MINOR 1)
- Findings:
  1. **[MINOR] Cross-campaign contacts enumeration has NO frozen read — coined read surface, gap not flagged.**
     - *Finding:* the page renders a flat cross-campaign list via `listOutreachContacts()` and cites only the WRITE contracts (`add/update_outreach_contact`) in its header — no read contract, because none exists.
     - *Evidence:* BC-ADM-6 read models (Doc-4J:303 + Read Models) are ONLY *list view* (campaigns: id/state/created_at), *detail view* (campaign + ITS contacts, via `get_outreach_campaign`), *admin search view* (by `state`), *audit view*. There is NO `list_outreach_contacts` / cross-campaign contacts read; `outreach_contacts` is a campaign CHILD reachable only through its parent campaign. (Contrast: imports have a frozen per-job `list_import_rows`; outreach has no contacts index.)
     - *Reason:* every other approved list page cited its frozen list read (list_private_vendors / list_engagements / list_import_jobs / list_outreach_campaigns …); this page implies a cross-campaign contacts read the corpus doesn't provide, WITHOUT flagging the gap — the inverse of the sanctioned ENG-03/CRM enumeration-gap discipline (which flags "no list read exists" in-code). It also has no real pagination story (an N+1 aggregation over per-campaign detail can't cursor-paginate).
     - *Recommendation:* either (a) flag the enumeration-gap in-code — "no frozen `list_outreach_contacts`; contacts are campaign children via `get_outreach_campaign`; this cross-campaign view is a presentation aggregation / needs an additive read" — and register the ESC (as ENG-03 did), OR (b) scope contacts to the campaign detail (P-ADM-17) and drop the standalone cross-campaign index. Then re-review.
  2. [OBS] Everything else is fine — contact fields are real `outreach_contacts` (target vendor Marketplace-ref name+opaque id, parent `outreach_campaign_id` linked to P-ADM-17, invite stage = illustrative string over unstructured `jsonb`, correctly noted); R5 "Add contact" disabled; MOAT guard exact; seed extension git-verified additive (P-ADM-16/17 exports untouched). One-flag/scope fix from PASS.
- Result: page → 🟥 Patch Required. NOT advanced; returned to Team-3 (flag the read-gap or rescope, then re-review).

### RV-0052 · P-BUY-12 · Internal approval · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/approvals/{page,approvals-view,loading}.tsx`, `_components/approvals-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **NO AUTO-APPROVE rendered explicitly (Doc-3 §1.2 FIXED / Doc-4E AI-note):** "an RFQ is never approved automatically… no timeout/silence path." Decisions = `approve_rfq` (`pending_internal_approval → submitted`) / `reject_internal_rfq` (`→ draft`, **reject REQUIRES a reason**, §E4.4) — both PARKED/disabled, gated on `can_approve_rfq` (Doc-2 §7); non-holder sees "Approval permission required." Queue = `list_rfqs` scoped `state=pending_internal_approval`, OWN-ORG; the "assigned-to-me" step follows the Identity-owned `organization_workflow_settings.approval_chain` (consumed server-side, not coined here).
  2. [OBS] Own-org only; genuine-empty ("Nothing to approve") never implies exclusion; cursor pagination (GI-03), contract order never re-ranked (GI-04); rows → /rfqs/{id} by opaque id (Inv #5); currency-driven `Money` (BDT not assumed); `stickyFirstColumn` (pre-existing DataListTable prop, WCAG 2.1.1 scroll-focus — no kit change); VM carries only RFQ display projection (no coined field). Presentation-only. R6-consistent (human decision, never a system recommendation). Model management page.
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-13).

### RV-0053 · P-ADM-18 · Outreach contacts (re-review of RV-0051 patch) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/outreach/contacts/page.tsx`, `_components/admin/outreach/outreach-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED MINOR RV-0051#1] The fabricated cross-campaign read is GONE — `listOutreachContacts` removed (grep-verified). The page is now CAMPAIGN-SCOPED: a `?campaign=<id>` picker reads the selected campaign's contacts via the frozen `get_outreach_campaign` detail (`getOutreachCampaignDetail`, Doc-4J:326 = campaign + contacts); no invented global list. An in-code note documents the read-binding ("no frozen `list_outreach_contacts` exists"). "Select a campaign" empty state before a pick; per-campaign contacts after.
  2. [OBS] Rest unchanged and conformant — R5 "Add contact" disabled (`add_outreach_contact`→BC-ADM-6); target vendor = Marketplace-ref (name + opaque id); invite stage illustrative over `jsonb`; MOAT (acquisition only, no score); no fabricated total. Correctly grounds in a frozen read rather than coining one — the exact discipline asked for.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-19).

### RV-0054 · P-ACC-09 · Role editor · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/roles/{new/page,[roleId]/page,role-editor}.tsx`, `role-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] Contracts VERBATIM (Doc-4C §C7): `create_role` (name unique-per-org + optional `permission_slugs`, each ∈ §7 catalog), `update_role` (rename), `set_role_permissions` (add/remove slugs), `delete_role`; error codes match the frozen registers (`identity_role_system_protected`, `identity_role_in_use`, `identity_permission_slug_unknown`, `identity_role_name_conflict`, CONFLICT on stale). Role-admin slug `[ESC-IDN-SLUG]` (interim `can_manage_users`; no dedicated §7 slug — carried, not invented).
  2. [OBS] **Inv #10 verified — permission grid is checkbox-per-FROZEN-SLUG, nothing coined.** All 7 catalog slugs confirmed real Doc-2 §7 tenant-space (Doc-2:630–636 / Doc-4C:56): `can_manage_users`, `can_manage_workflow_settings`, `can_manage_delegations`, `can_manage_vendor_profile`, `can_submit_verification`, `can_transfer_ownership`, `can_delete_organization` — tenant-space only (no staff_* leaked into org roles); each row shows `description` + the slug as the reference (never a name-string decision). SYSTEM BUNDLES read-only (name + `fieldset disabled` permissions + not deletable, Lock note); delete only for custom (danger zone, `identity_role_in_use` blocked server-side); presentation-only honest interims; single h1.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-10).

### RV-0055 · P-ADM-19 · Routing rules · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/routing/{page,loading}.tsx`, `_components/admin/routing/routing-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] `routing_rules` is a real RFQ/M3-owned, platform-owned, "simple"-lifecycle entity (Doc-2:155/305/602/762); the corpus does NOT enumerate rule fields ("parameters resolve from `core.system_configuration`", Doc-2:762). Team-3 EXPLICITLY flags this in the seed and grounds the illustrative rule labels in cited FROZEN Doc-3 routing-governance dimensions (capacity-aware §7.3, fairness rotation/LRR §3.3, wave sizing §5.2, vendor self-throttle/no-penalty §3.5, prioritization §7) — nothing coined; `enabled` on/off flagged as an illustrative framing of the "simple" lifecycle, NOT a coined status enum. (Model handling of a schema-unfrozen surface — the exact discipline the RV-0051 bounce was about.)
  2. [OBS] **MOAT (R7) intact** — no score, no matching/fairness math re-derived, NO award/winner (RFQ owns selection/fairness/routing); `get_matching_results`-class observability not surfaced. **STAGE-GATED** — explicit dashed-card notice (Doc-3 §0.1/§18B operating-stage); R5 — Manage/New rendered-but-DISABLED (`manage_routing_rule` owned by RFQ, `staff_super_admin`, §5.6). Opaque id (no human_ref); no fabricated total; 11th `AdminQueueTable` consumer; `loading.tsx`.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-20).

### RV-0056 · P-BUY-10 · RFQ detail — activity · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/rfqs/[rfqId]/{rfq-detail-view,rfq-detail-tabs}.tsx` (Activity tab realized), shared `activity-timeline.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **DEFERRAL/EXCLUSION INVISIBLE (Inv #11 / Doc-3 §4.2 / Doc-4E B.7 — FIXED):** the Activity tab feeds only `data.lifecycle` (disclosed immutable M0 audit, Inv #8) to the shared `ActivityTimeline`, which "computes/infers nothing"; a not-invited or deferred vendor is NEVER shown — and the tab renders an explicit user-facing statement to that effect. Grep confirmed no deferral/excluded/routed-vendor data leaks (only the guard comments + the "never shown" note). R6 honored (buyer never dispatches; no engine-bypass control).
  2. [OBS] Additive realization of the Activity tab slot in the already-built RFQ detail (P-BUY-08) — Overview/Quotations tabs unchanged; `ActivityTimeline` is the shared read-only timeline (Inv #8 audit source, non-disclosure-safe by construction, reused by P-BUY-01/08/14); `<ol>`/`<time>` a11y. Presentation-only (wired later).
- Result: page → ✅ Approved. Queue advanced (Team-2 → P-BUY-11).

### RV-0057 · P-ACC-10 · Permissions reference · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/permissions/{page,layout,permissions-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] Rows map to `list_permissions` `{ slug, description, space }` (Doc-4C §C7:454); permissions shown BY SLUG (Inv #10 — slug is the compose-time reference, `description` display only); reuses the P-ACC-09 catalog (RV-0054-verified real §7 slugs) — no duplicated/coined slug list. Tenant-space only (org-assignable; staff_* is platform-admin scope, correctly excluded). Read-only catalog, no actions.
  2. [OBS] EXEMPLARY don't-coin discipline — the Doc-7E-note "group" column is REFUSED because `list_permissions` returns no group field; the page uses the frozen `space` dimension (tenant|staff) instead and coins no semantic groups (same authority-order call as P-ACC-08's omitted member-count). Semantic table (caption, `scope="col"`); own-catalog search benign; single h1.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-11).

### RV-0058 · P-ADM-20 · Routing rule editor · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/routing/[ruleId]/page.tsx` (new) + additive `getRoutingRule` in `_components/admin/routing/routing-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **MOAT (R7) intact** — the editor renders only a rule's `{id, label, summary, status}`; NO matching/fairness math re-derived, NO score, NO `matching_results` (which carry `confidence_score`) touched. RFQ/M3 owns selection/fairness/routing (BC-7; ADR:840 "nobody else may own routing_rules"). Descriptive Doc-3-grounded summaries compute nothing.
  2. [OBS] **STAGE-GATED + R5 (owning-module-owns)** — `manage_routing_rule` (Save/Enable/Disable) and `assist_routing` (Assist routing) are RENDERED-BUT-DISABLED; both are real frozen 21.6-Admin RFQ contracts (Doc-4E §E6.5/§E6.6) bound to `staff_super_admin`/§5.6 platform-staff (nearest slug pending `[ESC-RFQ-SLUG]`); `assist_routing` carries the Stage-gated marker (Doc-4E:348). Header + Configuration section state the stage-gate explicitly. Admin surface renders/gates but does NOT own or bypass RFQ's domain.
  3. [OBS] **No coined rule-field schema** — Doc-2:762 confirms `routing_rules` = "rule definitions; parameters resolve from `core.system_configuration`" (fields NOT enumerated). Page renders only id/label/summary/status and states "parameters … governed centrally, not edited free-form here"; the actual `manage_routing_rule` input shape (`rule_id`, `operation` enum) is deliberately NOT exposed as an editable form (more conservative than the contract). `enabled` on/off = illustrative framing of the "simple" lifecycle (Doc-2 §3.4), flagged in-seed, not a coined status enum. Same disposition accepted at RV-0055.
  4. [OBS] Additive-only: seed diff git-verified = `getRoutingRule` lookup appended; `ROUTING_RULES`/`RoutingRuleVM`/`ROUTING_STATE_META` byte-identical to committed P-ADM-19 (a127993), list page untouched. `notFound()` Inv #11 for unknown id (byte-equivalent). Reuses shell PageHeader + shared DashboardSection/DescriptionList/PresentationFormNote + kit StatusChip/Button — no duplication, no frozen-kit change. Opaque id (font-mono), no human_ref, no fabricated total.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-21).

### RV-0059 · P-ACC-11 · Delegation grants · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/delegation/{page,delegation-view}.tsx`
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] **Projection over-render — resolved names/labels not in the frozen DTO.** The frozen `identity.list_delegation_grants.v1` returns `items : list<delegation_grant>`, and the `delegation_grant` DTO is closed-enumerated as `{ delegation_grant_id, controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set, valid_from, valid_to, status }` (Doc-4C:648/659; Doc-2 §10.2 / §5.10 columns Doc-2:725). Those are **opaque org IDs + `vendor_profile_id`** — NOT names. The page renders full organization **names** for BOTH delegator (`controlling_organization_id`) and delegatee (`representative_organization_id`) and a composed scope **label** ("{org} — {category}") for `vendor_profile_id`. At least one party per row is a **counterparty** whose name the DTO does not project; `list_delegation_grants` cannot populate it (the in-file comment "a wired build resolves these from `list_delegation_grants`" is factually wrong about the contract). **Evidence:** DTO enumeration Doc-4C:648/659; seed renders `delegator`/`delegatee`/`scope` as display strings. **Reason:** violates render-only-projected-fields discipline; inconsistent with the ESTABLISHED engagements precedent (P-BUY-19/20 — counterparty shown as **opaque ref, no coined name**) and the P-BUY-05 IDs-only projection flag. **Recommendation:** render the projected opaque `controlling_organization_id` / `representative_organization_id` / `vendor_profile_id` refs (engagements pattern) — OR, if a sanctioned resolution read exists for a counterparty org name / vendor-profile label, cite it (vendor_profile_id *may* be resolvable via a public M2 read; the counterparty **org name** has no cited projection). Reference-never-restate: coin no display field the contract omits.
  2. [MINOR] **Status set omits the §5.10 pre-active state.** `GrantStatus` is a closed union `active|suspended|revoked|expired`, but the frozen delegation-grant lifecycle carries a pre-active state — `draft` (Doc-2 §5.10:581) / `pending` (Doc-4M:166 `pending → active`, "User (delegatee accepts)"). A **delegatee** is a party and must see a pending grant to accept it, so `list_delegation_grants` (`role_filter=as_representative`) can return one; `STATUS_META[g.status]` would then be `undefined` → `.label` throws (render crash when wired). **Evidence:** Doc-2:581 machine (`draft → active`); Doc-4M:166. **Recommendation:** reconcile the status set + `status_filter` options to the full §5.10 machine, and confirm which states `list_delegation_grants` actually surfaces to each party role.
  3. [OBS] Otherwise conformant: LIST-ONLY (no mutation; issue/suspend/revoke correctly deferred to editor P-ACC-12), "Slug none" honored, cursor `PaginationControl` (no grand total, GI-03), semantic table a11y, single h1, EmptyState. `New grant` / row-open links to P-ACC-12 routes (404 until built) acceptable overview-first. Non-disclosure/firewall/moat n/a (identity data, party-scoped). These are unaffected by the patch.
- Result: page → 🟥 **Patch Required**. Bounced to Team-1; **queue NOT advanced** (Team-1 stays on P-ACC-11).

### RV-0060 · P-ADM-21 · Matching results (internal) · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/matching/page.tsx` + `_components/admin/matching/matching-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Actor/visibility exact** — `rfq.get_matching_results.v1` is a real 21.3 Query, Actor **internal-service / Admin**, NEVER tenant-vendor exposed (Doc-4E §E5.3:149 / H.3:29). Page lives under `/admin/` (no active-org). DTO rendered verbatim: response `items[]{vendor_profile_id, confidence_score, breakdown(tier/capacity/performance/trust/geography), formula_version}` (Doc-4E PassB-Part2 review:180; fields Doc-4E H.9:35 / Doc-2 §10.4). RFQ-scoped via `?rfq=<id>` — `get_matching_results` reads ONE RFQ; no invented cross-RFQ aggregate list; `?rfq=` is a resource selector (not a `?state=` dev harness, no prod-gate needed — cf. RV-0053 `?campaign=`).
  2. [OBS] **FIREWALL (Inv #6) intact** — breakdown factors (tier/capacity/performance/trust/geography) are the frozen `breakdown_jsonb` per-factor CONFIDENCE CONTRIBUTIONS, explicitly framed "not the underlying Trust or Performance scores"; corpus confirms signals are scoring INPUTS never mutated + no paid plan gates confidence (Doc-4E BC-2 char:19). Read-only, no signal write. **MOAT (R7) intact** — explicitly "not a buyer/vendor-facing ranking; no award/winner/selection decided here"; RFQ owns matching; the confidence order is the engine's own output, not a page re-rank.
  3. [OBS] **NON-DISCLOSURE (Inv #11 / §7.5) by construction** — `matching_results` "contains only vendors that passed every gate" (Doc-2 §10.4 constraint, PassB-Part2 review:360); gate-excluded (blacklist/deferral/ineligible) vendors are ABSENT, so nothing leaks; `getMatchingResult` → undefined for unknown/absent RFQ → EmptyState. Reuses shell PageHeader + shared AdminQueueTable + kit; `formula_version` as opaque Badge.
  4. [OBS] Resolution dependency (acceptable on this surface): `vendorName` / `subject` / `rfqRef` are NOT `matching_results` fields — the DTO projects `vendor_profile_id` (opaque); names resolve from M2 (PUBLIC vendor profile) + RFQ (admin-readable). Consistent with the admin-queue precedent (P-ADM-07 etc. show vendor names); distinct from the RV-0059 delegation case (that was a TENANT surface + a tenant-private COUNTERPARTY ORG name with no cited resolution). `vendorRef` (UUID) shown mono, display-only.
- Result: page → ✅ Approved. Queue advanced (Team-3 → next admin page).

### RV-0061 · P-BUY-11 · RFQ version history · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/rfqs/[rfqId]/versions/{page,rfq-versions-view}.tsx` + `_components/rfq-version-view-models.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Contract exact** — `rfq.get_rfq_version.v1` §E4.8 (21.3 Query, Actor User(buyer)/internal-service, BC-1); projection = `rfq_id, human_ref, state, current_version_no, scope-appropriate version content, reference_id` (Doc-4E:387/389/§3). Two DISTINCT slugs cited `can_view_rfq` (own-RFQ) / `can_view_all_rfqs` (all-org) (Doc-4E §E4.8 AuthZ). Presentation-only (PARKED, Wave 4); opaque route id (Inv #5), humanRef display-only; browser sets no active-org header.
  2. [OBS] **Inv #8 immutability load-bearing** — READ-ONLY, NO version edit/rollback affordance; `rfq_versions` immutable + append-only (Doc-2:301/758/863). Version chain renders in intrinsic `version_no` order, explicitly "not a re-rank of a governed result set" (GI-04); field diff is pure presentation over two DISCLOSED versions and recommends no version (R6). Change markers are text badges "Changed"/"Unchanged" — never color-only (GI-06).
  3. [OBS] **notFound byte-identical (Inv #11 / §7.5)** — `data===null` → NotFoundState with breadcrumb showing only the `/rfqs` parent (never a leaf ref implying the RFQ exists); "no-access ≡ not-found" (Doc-4E §E4.8 §12). Currency-driven `Money` (BDT not assumed) via shared component; `?v=` is a server-guarded positive-int version selector (native GET, "never trust the raw query"), not a dev harness.
  4. [OBS] **Coins nothing** — content fields (title/summary/category/value/deliveryLocation/neededBy) map BY INTENT to the RFQ `content_jsonb` body (internal jsonb schema = dev-doc, cf. `price_breakdown_jsonb`), all OPTIONAL, view-model states "exact DTO field names bind at wiring"; NO per-version author/timestamp modelled because the §E4.8 projection enumerates none (omit-not-coin — `rfq_versions.created_by` exists in DB but not in the contract projection). Reuses shell + shared DescriptionList/format/state-display.
- Result: page → ✅ Approved. Queue advanced (Team-2 → next buyer page).

### RV-0062 · P-ACC-11 · Delegation grants · Team-1 — RE-REVIEW (RV-0059 patch)
- Date: 2026-07-02 · Reviewed: `app/(app)/account/delegation/{page,delegation-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED ← MAJOR] Projection over-render FIXED. The list now renders OPAQUE refs only — `controllingOrgRef`/`representativeOrgRef`/`vendorProfileRef` mapped to `controlling_organization_id`/`representative_organization_id`/`vendor_profile_id` (mono `Ref`, bare UUIDs), columns relabelled "Delegator (controlling org)"/"Delegatee (representative org)"/"Scope (vendor profile)", with an explicit "Display names aren't part of this list" note; search filters by reference. No resolved org/profile name or composed scope label remains. Exactly matches the frozen `delegation_grant` DTO (Doc-4C:648/659) and the engagements opaque-counterparty precedent (P-BUY-19/20). ✔
  2. [RESOLVED ← MINOR] Status set FIXED. `GrantStatus` = full frozen §5.10 set `draft|active|suspended|revoked|expired` (Doc-2 §5.10:581); `STATUS_META` maps all five (draft=info), `STATUS_OPTIONS` includes draft, a draft row is seeded → no unmapped-status crash when wired. ✔
  3. [OBS] **Intra-corpus tension for wiring (not a page defect):** Doc-2 §5.10 names the pre-active state `draft` (`draft → active`), while Doc-4M:166 names it `pending` (`pending → active`, "delegatee accepts"). The page correctly grounds its choice in Doc-2 §5.10 (the aggregate's authoritative domain state machine). The `draft` vs `pending` naming (and whether both exist) is a frozen-doc reconciliation for the wiring team / API-Gov — Flag-and-Halt at wiring, not resolvable by presentation. Not blocking.
- Result: page → ✅ Approved (both RV-0059 findings resolved). Queue advanced (Team-1 → P-ACC-13; P-ACC-12 skipped, Waiting-Decision `ESC-IDN-DELEG-EXPIRY`).

### RV-0063 · P-ADM-22 · Plan management · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/plans/page.tsx` + `_components/admin/plans/plans-seed.ts`
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] **List over-renders `is_active` — not in the `list_plans` projection.** The frozen `billing.list_plans.v1` output is `items : list<object{ plan_id, name, billing_cycle, price, currency, status }>` (Doc-4I §HB-1.4:292) — `is_active` is **absent**. `is_active` is projected ONLY by `get_plan` (`plan : object{ …, status, is_active, entitlements[] }`, same line) and is otherwise only a `list_plans` **filter** input (`filter{ billing_cycle?, is_active?, status? }`, :270). The page renders a **"Visibility" column** (`isVisible` = is_active) in the LIST table — a field the list read does not return; when wired, `list_plans` cannot populate it (would force N× `get_plan`). **Evidence:** Doc-4I:270/292; page COLUMNS include the `visibility` cell. **Reason:** same list-projection over-render class as RV-0059 (render only fields THIS surface's contract projects). **Recommendation:** drop the Visibility column from the list; surface `is_active` on the P-ADM-23 plan editor / detail (which maps `get_plan`, where is_active IS projected). Preserve the (correct) is_active≠status distinction there. The team may keep `is_active` as a list **filter** (it's an allowlisted filter input) — just not as an output column.
  2. [OBS] Everything else conformant: list fields `name, billing_cycle(monthly/annual), price, currency, status` verbatim (Doc-2:823 / Doc-4I:292); lifecycle `draft→active→retired` (Doc-2 §3.8/:368) all mapped; **Inv #10 exemplary** — "a plan is a commercial package, not a capability/financial tier; entitlements granted by value, never plan name," no plan-name gating expressed; R5 "New plan" disabled (`create_plan`→P-ADM-23, M7-owned); currency-driven price; `?status=` URL filter allowlisted (not a dev harness); opaque `plans.id`. These are unaffected by the patch.
  3. [OBS] Pagination count: `list_plans` is cursor-paginated (`next_page_token`); the "Showing N plans" label describes rendered rows with `hasMore=false` — fine for the seed, but when wired ensure it reflects page rows, never an implied grand total (GI-03).
- Result: page → 🟥 **Patch Required**. Bounced to Team-3; **queue NOT advanced** (Team-3 stays on P-ADM-22).

### RV-0064 · P-BUY-13 · Routing log / invitations · Team-2
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/rfqs/[rfqId]/routing/{page,routing-view}.tsx` + `_components/routing-view-models.ts`; shared `view-models.ts` (RoutingMode/InvitationState), `state-display.ts` (invitationStateDisplay)
- Verdict: **PASS** — NON-DISCLOSURE surface, exemplary
- Findings:
  1. [OBS] **NON-DISCLOSURE (Inv #11 / §7.5 / Doc-3 §4.2) — exemplary.** Invitation projection = `{state, delivered_at, responded_at}` with **NO vendor field** (frozen §E6.7:346 response schema); the screen-spec "vendor" column was DROPPED because the frozen contract projects no vendor — omitting is the non-disclosure-correct direction and the frozen corpus governs the looser screen-spec (§7). Routing log = aggregate `{routing_mode, executed_at}`; `pipeline_counts` (a jsonb whose sub-shape §E6.7 does NOT enumerate) is deliberately NOT broken out (coining sub-fields + per-step counts would risk implying exclusion). Buyer read is delivered-onward only; fixture shows accepted/declined/delivered — **deferral invisible** (a deferred/gate-excluded vendor indistinguishable from non-match). Explicit rendered note: "Invitations are issued by the routing engine — not chosen here. Vendor identities aren't listed, and vendors who were not invited (or whose invitation was deferred) are never shown."
  2. [OBS] **Contract/enum verbatim.** `rfq.get_routing_log.v1`/`list_invitations.v1` §E6.7 (21.3 Query, buyer-via-own-RFQ, `can_view_rfq`/`can_view_all_rfqs`, routing-log = buyer+compliance visibility). `routing_mode` union = frozen `approved_only/approved_conditional/approved_open/open_market` (Doc-2:757); `InvitationState` = frozen `draft/selected/deferred/delivered/accepted/declined/expired` (Doc-4M:120). ROUTING_MODE_LABEL/INVITATION_STATE_DISPLAY coin no value. **Non-penalizing** (Doc-3 §4.1): declined=neutral, expired=neutral (never danger) — matches vendor-side P-VND-16.
  3. [OBS] **R6/moat + read discipline.** Engine owns invitations — zero buyer dispatch/select/exclude/re-rank affordance; contract order preserved (GI-04, keyed by index — projection carries no id); cursor pagination modelled (routing/invitations NextCursor), no grand total (GI-03); reads-not-audited; opaque route id (Inv #5); notFound `data===null` byte-identical, breadcrumb no leaf ref. Reuses shared ActivityTimeline (waves) + DataListTable (stickyFirstColumn scroll-region a11y, WCAG 2.1.1/1.4.10) + shell/format/state-display. **Shared edits git-verified ADDITIVE** (+19 view-models, +21 state-display, 0 deletions — no approved consumer affected).
  4. [OBS → wiring hardening] The BUYER view-model `InvitationState` union includes the pre-delivery states (`draft`/`selected`/`deferred`) "for type fidelity," and `INVITATION_STATE_DISPLAY` maps them (neutral). Correct today (fixture is delivered-onward; server enforces the projection), but a wiring-time server bug returning a deferred row would then render "Deferred" to a buyer — a non-disclosure breach. Recommend the wiring team enforce the delivered-onward filter server-side and consider a buyer-facing delivered-onward subtype so the type system itself precludes rendering pre-delivery states. Non-blocking (presentation is correct).
- Result: page → ✅ Approved. Queue advanced (Team-2 — buyer queue complete except owner-gated P-BUY-03/04/05).

### RV-0065 · P-ADM-22 · Plan management · Team-3 — RE-REVIEW (RV-0063 patch)
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/plans/page.tsx` + `_components/admin/plans/plans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED ← MAJOR] The "Visibility" (is_active) column is REMOVED. `COLUMNS` now = `plan(name)` · `cycle(billing_cycle)` · `price(currency+price)` · `status` — matching the frozen `list_plans` output `{plan_id, name, billing_cycle, price, currency, status}` (Doc-4I §HB-1.4:292; plan_id = rowKey). An inline NOTE cites RV-0063 and correctly states is_active is a `get_plan`/detail field surfaced on the P-ADM-23 editor. Surgical fix (one column dropped + note); nothing else changed. ✔
  2. [OBS] Seed VM still carries `isVisible` (unused in the list now). Harmless — can drive the allowlisted `is_active` list *filter* or move to the P-ADM-23 detail VM at wiring. Non-blocking. All RV-0063 OBS unchanged (fields verbatim; `draft→active→retired`; Inv #10 plan≠tier/no plan-name gating; R5 New-plan disabled; currency-driven; `?status=` allowlisted).
- Result: page → ✅ Approved (RV-0063 MAJOR resolved). Queue advanced (Team-3 → P-ADM-23).

### RV-0066 · P-ACC-13 · Workflow settings · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/settings/{page,workflow-settings}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Contract verbatim.** `identity.update_workflow_settings.v1` §C11 (21.4 Command, Actor User, Slug `can_manage_workflow_settings` O,D, active-org scope) — request contract mapped faithfully: `rfq_approval_mode : enum(none|single|multi_step)` (the three radio values verbatim, Doc-2:723 / Doc-4C §C11), `approval_chain : list<object> (approval_chain_jsonb)`, `financial_permissions (thresholds)` (award threshold). `organization_workflow_settings` is tenant-owned (Doc-2:266/600/723); page is presentation-only (honest interim "nothing was saved"; server owns the write, the single write path). Out-of-scope fields (`default_routing_mode`/`notification_rules`/`buyer_courtesy_options`) omitted, not coined.
  2. [OBS] **NO AUTO-APPROVE — exemplary.** Explicit rendered note "RFQs never auto-approve — an approver must act, and silence is never treated as consent" (Doc-3 §1.2/§5). Matches §C11's binding rule that an ORG setting "may **add** required approvals but **never remove** a required slug" (§6.2) — a workflow setting strengthens, never weakens FIXED authz. Consistent with P-BUY-12 (no-auto-approve).
  3. [OBS] **Approval-chain modelling grounded + honestly flagged.** `approval_chain_jsonb` object shape is NOT field-enumerated in the contract (`list<object>`), so each step is modelled by its approver = frozen Org Role (Owner/Director/Manager/Officer, Inv #2) whose holder must carry `can_approve_rfq`, escalating to Owner — grounded in Doc-3 §107 (submitter lacking `can_approve_rfq`; self-approve if held) + §110 (stepwise escalation; re-route to next `can_approve_rfq` holder / Owner). The role-per-step + single-threshold shape is presentation latitude over an unenumerated jsonb (same standard as content_jsonb/price_breakdown_jsonb) — the team flags it for wiring [OBS]. Coins no contract field.
  4. [OBS] Award threshold numeric + BDT (financial_permissions_jsonb thresholds, multi-currency-ready); firewall clean (identity touches no governance signal, §B.7 default none — no trust/tier/plan); a11y (radiogroup + fieldset/legend; keyboard chain reorder up/down with aria-labels, disabled at ends; `<ol>`; FormField labels; muted P-4 inks `text-iv-info-muted`/`text-iv-danger-muted`, error is text not color-only); inline validation (single=1 approver, multi≥1, threshold≥0). OBS (non-blocking): native `<select>` for role pickers; `max-w-2xl`.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-ACC-15; P-ACC-14 already Built, P-ACC-12 Waiting-Decision `ESC-IDN-DELEG-EXPIRY`).

### RV-0067 · P-ACC-15 · Notification preferences · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/notifications/{page,notification-preferences}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Ownership boundary EXEMPLARY — corpus-verified.** Preference DATA is `users.NotificationPreferences (JSONB)`, a value object on the User aggregate (Doc-2:122) — **Identity-owned (M1)**, edited self-scope (Doc-4C:151 "edit own profile fields, personal settings, and notification preferences"). M6/Communication **consumes read-only + executes delivery, owns no preferences aggregate** — corroborated verbatim by Doc-4H (B.7: "no notification preferences (Identity-owned, consumed read-only — DH-1)"; Structure Freeze Audit:60; DH-1). The page (under `/account`, self settings) correctly sites the data in M1 and treats M6 as delivery-only. The exact write seam + JSONB key shape (page_inventory Doc-5H) flagged for wiring [OBS] — honest, not coined. Presentation-only (honest interim "nothing was saved"; server owns the write).
  2. [OBS] **Channels frozen, not coined.** in-app (`communication.notifications channel(in_app)`, Doc-2:814) + email/SMS/WhatsApp (`email_logs/sms_logs/whatsapp_logs`, Doc-2:197/361/815; Doc-4H "fan-out in-app + email/SMS/WhatsApp"). Page shows in-app + email active, SMS + WhatsApp DISABLED "coming soon" (Doc-7E Future) — a rollout choice on frozen channels, never a coined live control.
  3. [OBS] **Types = presentation grouping over the §8 catalog.** The 5 category rows (RFQs&quotations/Orders&documents/Verification&trust/Messages/Account&security) group by FROZEN module domains (M3/M4/M5/M6/M1); the fine per-event taxonomy is the §8 event catalog (Doc-2 §8 / Doc-4J) — honestly flagged, coins no event name. Same latitude standard as P-ACC-13's approval_chain_jsonb.
  4. [OBS → wiring] The "Critical security messages are always sent" note co-exists with a toggleable "Account & security" row (in_app/email switches). Honest as a safety note, but at wiring ensure non-suppressible security notifications are not presented as opt-out-able (enforce server-side). Non-blocking. Firewall clean (no plan/entitlement gates a channel, Doc-4A §4B); self-scope only (no cross-tenant/vendor disclosure — this is a prefs setting, not the notification-center list P-SH-02); a11y (role=switch + aria-checked/aria-label per type×channel; disabled toggles labelled "(coming soon)"; semantic table caption/scope; not color-only). OBS: hand-rolled switch (no kit Switch, carried from P-ACC-03); `max-w-2xl`.
- Result: page → ✅ Approved. Queue advanced (Team-1 → next `P-ACC`/`P-PUB`/`P-SH` Ready page).

### RV-0068 · P-ACC-16 · Plans / catalog · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/billing/{page,plans-catalog,layout}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Inv #10 exemplary.** `list_plans`/`get_plan` (BC-BILL-1, Doc-4I §HB-1.4) are User-readable (`[ESC-BILL-SLUG]` public read); card fields = frozen projection (name, price, currency, billing_cycle). Features listed as ENTITLEMENT VALUES (seats/lead-credits/RFQ-quota/microsite/support = numeric/enum/boolean, Doc-4I `entitlements`), never plan-name gating; "Current plan" derived from org entitlements (subscription), NOT a plan-name check; plan (commercial) ≠ financial tier. Explicit rendered note "Plans … never affect RFQ matching or awards" (Doc-3 §11.8). Firewall clean. Presentation-only (reads/mutates nothing); Select plan → `/account/subscription?plan=&cycle=` (P-ACC-17, 404 until built, overview-first); current plan → disabled.
  2. [OBS → wiring] **Monthly/annual grouping model.** The page models one plan card with both `priceMonthly`+`priceAnnual` and a client toggle, but the frozen `plans` model carries ONE `billing_cycle(monthly/annual)` PER ROW (Doc-2:823; cf. P-ADM-22 seed "Professional" vs "Professional (Annual)" = separate rows). There is no frozen plan-family grouping key, so a wired build must either group `list_plans` rows by an explicit family key or render one card per row (and handle plans offering only one cycle). Presentation is a standard pricing pattern and coins no field (price/currency/billing_cycle all projected) — flagged for wiring, non-blocking.
  3. [OBS] Seed entitlement labels illustrative (exact slugs = entitlement catalog, Doc-4I BC-BILL-1 — team-flagged); `status` correctly not shown (user catalog lists purchasable/active plans — server filters status=active/is_active); a11y (billing-cycle role=radiogroup/radio + aria-checked; h2 per card under the shell h1; included/excluded = Check vs Minus icon + text, NOT color-only, GI-06); price `toLocaleString("en-US")` grouping (display only, currency from `plan.currency`).
- Result: page → ✅ Approved. Queue advanced (Team-1 → next Ready page).

### RV-0069 · P-ACC-17 · Subscription · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/subscription/{page,subscription-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **CANCEL semantics — exemplary + correctness-critical.** `cancel_subscription` (BC-BILL-2, Doc-4I §HB-2.2) sets `auto_renew=false` and **runs to period end — NO immediate state change** (§HB-2.2:372/394/396; Doc-2 §5.7 A-06 "active ──cancel [Owner only]──▶ active (auto_renew=false; runs to period end)"). The confirm dialog states this precisely ("stays active until {periodEnd} and won't renew … you keep full access until then") — the cancel≠immediate-expiry distinction is correct, not a naive revoke. Hero renewal copy flips on `autoRenew` (Renews vs "Active until … won't renew"). Presentation-only (honest interim; cancel writes nothing).
  2. [OBS] **Status + events frozen.** Status = §5.7 set (pending_payment/active/expired); seed shows `active` chip. Billing history "Subscribed"/"Renewed" are display labels for the frozen events `SubscriptionPurchased`/`SubscriptionRenewed` (Doc-2:671; `subscription_events` append-only Doc-2:372/827) — no event name coined. get_subscription/list_subscription_events exact projection resolved at wiring [OBS, team-flagged].
  3. [OBS] **Inv #10 + money-boundary.** Usage = NUMERIC entitlement consumption (seats 8/25, lead credits 320/500, RFQs 12/50) via `role=progressbar` (aria-valuenow/min/max/label), resolved from entitlements (BC-BILL-3 usage/get_usage), never a plan-name check; plan≠tier. Platform bills only its own subscription revenue — no buyer↔vendor money (DF-6). `?state=none` empty preview PROD-GATED (`NODE_ENV !== "production"`, P-4 pattern). a11y: h2 sections under shell h1, Dialog title/description, destructive cancel, role=status notice.
  4. [OBS → wiring] `cancel_subscription` is **Owner-only** (§HB-2.2 Actor User(Owner)); the Cancel affordance renders unconditionally here — gate it to Owner at wiring. Non-blocking (presentation-only; server enforces authz). Illustrative usage labels → exact quota_keys from the entitlement/usage catalog at wiring.
- Result: page → ✅ Approved. Queue advanced (Team-1 → next Ready page).

### RV-0070 · BX-01 · Buyer dashboard enhancement / Sourcing Pipeline widget · Team-2 (owner-directed F2)
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/_components/sourcing-pipeline-card.tsx` (new) + `dashboard/{dashboard-view,page}.tsx` + `_components/view-models.ts` (additive)
- Verdict: **PASS**
- Findings:
  1. [OBS] **No frozen-kit/foundation change** — `git status src/frontend/` clean; the widget is a BUYER-SCOPED composition of the existing kit `Card` + `StatusChip` (no new primitive, no token change). No Flag-and-Halt needed. VM change git-verified ADDITIVE: new `RfqPipelineStage {state, count}` + optional `rfqPipeline?` on `BuyerDashboardViewModel` (no field removed/altered). Dashboard integration additive — import + destructure + a conditional block; the first-run `data===null` empty state is untouched, and the funnel renders ONLY when `rfqPipeline.length > 0` (omitted otherwise → no fabricated funnel; genuine-empty).
  2. [OBS] **Governance clean.** Stages use frozen Doc-4M RFQ states via `rfqStateDisplay` (`RfqState` union — no coined state); rendered in supplied/contract order, keyed by state, computes nothing (GI-04, R6 observe-only "decides/recommends nothing"). Counts are contract-provided WIRED reads, **never client-computed** (R7 — RFQ lifecycle counts, not matching/ranking re-derivation); carry NO excluded/blacklist figure (Inv #11). a11y `<ol>` funnel, StatusChip labels, tabular-nums; axe own-content 0 (390/768/1280, team-reported).
  3. [OBS → wiring] The per-state count is a DASHBOARD AGGREGATE KPI over the buyer's OWN bounded RFQ set — the same class as the page's existing win-rate KPI band — NOT a GI-03 paginated-list grand total (GI-03 governs cursor lists implying scale/expense; this is own-data aggregate). The exact aggregate/facet read (the VM flags "e.g. `list_rfqs` state facets") is not pinned to a specific frozen contract (`list_rfqs` returns items+cursor, not facet counts) — flag for wiring: server-provided count of own-org RFQs; coins no contract/field. Non-blocking.
- Result: page → ✅ Approved. Queue advanced (Team-2 F2 refinement track).

### RV-0071 · P-ACC-18 · Usage & quota · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/usage/{page,usage-dashboard}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Inv #10 clean.** `get_usage` (BC-BILL-3, Doc-4I §HB-3) read; every figure is a NUMERIC quota (seats/lead-credits/RFQs/listings used vs resolved entitlement limit) or a BOOLEAN feature (microsite Included / support Not included) — entitlement VALUES, never a plan-name check. Plan name ("Growth") shown as informational context + Manage-plan link only (display, not a gate); plan ≠ tier. Consistent with P-ACC-16/17.
  2. [OBS] **MOAT explicit.** Rendered note "Quotas are entitlement limits for platform features. They never affect RFQ matching, routing, or awards" — BC-BILL-3 consumes entitlement truth and resolves none (Doc-4I: quota is an entitlement check, never routing/eligibility/supplier-selection). No governance signal touched; firewall clean.
  3. [OBS] Progress bars carry TEXT values (used/limit + "N remaining" + reset date) with `role=progressbar` (aria-valuenow/min/max/label); the ≥80% warning fill color is a supplementary cue, NOT the sole signal (GI-06). SERVER component, read-only (no client JS/mutation); single h1 (PageHeader), h2 "Plan features", success/neutral Badges. Own-data usage dashboard (not a GI-03 paginated grand total — same class as the P-ACC-17 usage band).
  4. [OBS → wiring] Exact `get_usage` projection + quota_keys resolve from the entitlement/usage catalog at wiring (team-flagged); seed quota labels illustrative. Non-blocking.
- Result: page → ✅ Approved. Queue advanced (Team-1 → next Ready page).

### RV-0072 · P-ACC-19 · Lead credits · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/lead-credits/{page,lead-credits-view}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Contracts real (BC-BILL-4) — prior watch-note resolved.** `billing.get_lead_balance.v1` + `billing.list_lead_transactions.v1` are real 21.3 Query reads (Doc-4I §HB-4.2:885); `billing.credit_lead_account.v1` is real (§HB-4.1:823, actor-branched org `can_manage_billing` 21.4 / System shortfall 21.5). **"BC-BILL-4" is a genuine frozen BC** (Lead Credit Account) — Doc-4I has 6 BCs (Final Freeze Audit:10/71); my earlier concern (only BILL-1/2/3) was from the Part-1 inventory; Part-2 covers BILL-4/5/6. `lead_credit_accounts`(balance head)+`lead_credit_transactions`(append-only credit/debit) tenant-owned (Doc-2:374/600/829-830). Nothing coined.
  2. [OBS] **Inv #10 + money-boundary + moat.** Balance = NUMERIC credit count (never plan-name). Money-boundary explicit: "Lead packages are the platform's OWN revenue (M7) … never buyer↔vendor money" + rendered "Lead packages are billed by iVendorz" (Doc-4I: lead credits = commercial balance, no escrow/wallet/settlement). Moat: credits never procurement standing (Doc-4I H.9:814) — the page is a balance/ledger view, no eligibility tie. `credit_lead_account` = gated command, NO buyer mutation affordance (read-only, R5). Shortfall credit grounded in Doc-3 §11.7/§745 (shortfall × `leads.credit_value`).
  3. [OBS] Transaction deltas carry an explicit +/- SIGN + tabular-nums (NOT colour-only — success tint on positive is supplementary, GI-06); semantic table (caption/scope), search+type filter, cursor `PaginationControl` (no grand total, GI-03 — the balance is the `get_lead_balance` head field, not a list total); single h1; own-org tenant data (no disclosure surface).
  4. [OBS → wiring] tx-type labels (package_credit/shortfall_credit/lead_unlocked) are ILLUSTRATIVE — `lead_credit_transactions` type/source not field-enumerated in Doc-2 ("credit/debit rows") — team-flagged; grounded in real movement kinds (package purchase / Doc-3 shortfall / lead-access debit). Minor: the in-code comment calls `credit_lead_account` "admin" — the org-initiated branch is `can_manage_billing` (org billing role), not platform-admin; rendered page is read-only so no behavioral impact. Non-blocking.
- Result: page → ✅ Approved. Queue advanced (Team-1 → next Ready page).

### RV-0073 · P-ADM-23 · Plan editor · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/plans/[planId]/page.tsx` (new) + additive `getPlan`/`getPlanDetail`/`PLAN_ENTITLEMENTS` in `_components/admin/plans/plans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Closes the RV-0063/0065 loop — `is_active` correctly on the DETAIL.** Editor binds the full frozen `get_plan` projection (Doc-4I §HB-1.4:292: plan_id/name/billing_cycle/price/currency/status/is_active/entitlements); `is_active` ("Marketing visibility") surfaces HERE (get_plan detail field), NOT in the list (per RV-0063). Rendered as a select **decoupled from lifecycle status** — matches `activate_plan` §HB-1.1a "no `is_active` (marketing-visibility) coupling" exactly.
  2. [OBS] **R5 + lifecycle exact.** Save (`update_plan`) / Activate (`activate_plan`) / Retire (`retire_plan`) rendered-but-DISABLED, owned by M7/Billing. **Activate shown ONLY when `draft`** — matches `billing.activate_plan.v1` (BC-BILL-1, 21.6 Admin platform-staff; precondition plan is `draft`; active/retired not valid sources — Doc-4I ActivatePlan Patch §HB-1.1a:25/43). Retire shown when `draft|active` (retire_plan); "No lifecycle actions" when `retired` (terminal). "Admin decides; Billing applies the effect" framing correct.
  3. [OBS] **Inv #10 entitlements by value.** Entitlements read-only `{slug, type(boolean/numeric/enum), value}` — `EntitlementType` = frozen enum (Doc-2:369 / get_plan `entitlements:list<{entitlement_id, slug, type, value}>`); slugs illustrative (platform-owned catalog not enumerated — team-flagged), value-based never plan-name; bundling deferred to P-ADM-24. notFound Inv #11 (getPlanDetail → notFound). Composes shell PageHeader + shared DashboardSection/DescriptionList/PresentationFormNote + kit FormField — no new primitive, no kit change.
  4. [OBS] Seed diff git-verified ADDITIVE (+85/-0; `EntitlementType`/`EntitlementRefVM`/`PlanDetailVM`/`PLAN_ENTITLEMENTS`/`getPlan`/`getPlanDetail` appended; P-ADM-22 `PLANS`/`PlanVM`/`PLAN_STATUS_META` untouched). Minor: SELECT uses `text-iv-ink-strong` where sibling pages use `text-foreground` (token-consistency nit, non-gating).
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-24).

### RV-0074 · P-ADM-24 · Entitlements / bundles · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/entitlements/page.tsx` (new) + additive `listEntitlementCatalog`/`EntitlementCatalogRowVM` in `_components/admin/plans/plans-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Don't-invent-a-read discipline EXEMPLARY (RV-0051 lesson).** There is NO standalone `list_entitlements` contract — Doc-4I:56 states verbatim that `get_entitlement`/`list_entitlements` were NOT authored and the frozen read pair `get_plan`/`list_plans` "already serves entitlement definitions" (§A4.1). The page DERIVES the catalog from the plan reads (`listEntitlementCatalog` = distinct `{slug, type}` across every plan's `get_plan.entitlements`, with bundling plan names) and renders an explicit "Read via the plan catalog — there is no separate entitlements list" notice. No invented read, no coined contract.
  2. [OBS] **Fields + Inv #10.** Entitlement rows = `{slug (mono, UNIQUE — dedup-by-slug), type<boolean|numeric|enum>}` (Doc-2:823) + "Bundled in" plan chips; per-plan value lives on P-ADM-23 (plan_entitlements), correctly not duplicated here. "Granted by value — boolean/numeric/enum — never by plan name" rendered + in-comment (Inv #10). R5 — "New entitlement" (`create_entitlement`) + "Bundle to plan" (`bundle_plan_entitlement`) rendered-but-DISABLED, M7/Billing-owned.
  3. [OBS] Seed diff git-verified ADDITIVE (+30/-0; `EntitlementCatalogRowVM` + `listEntitlementCatalog` appended; `PLANS`/`PLAN_ENTITLEMENTS`/`getPlan`/`getPlanDetail` from P-ADM-22/23 untouched). 14th `AdminQueueTable` consumer (shared table byte-unchanged); `loading.tsx`; EmptyState; single h1; no fabricated total (GI-03).
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-25).

### RV-0075 · BX-02 · Buyer RFQ detail — Overview enhancement · Team-2 (owner-directed F2)
- Date: 2026-07-02 · Reviewed: `app/(app)/(buyer)/rfqs/[rfqId]/{page,rfq-detail-view}.tsx` + `_components/rfq-view-models.ts` + `_components/rfq-create/rfq-options.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Inv #1 exemplary — capability rendered as a MATRIX, not a label.** New `WorkNatureChips` renders `work_nature[]` as a SET of neutral chips ("Request type"); values via `WORK_NATURE_LABEL` derived single-source from the frozen `WORK_NATURE_OPTIONS` (supply/service/fabricate/consult) — no coined flag, never collapsed to one label. Maps by intent to `get_rfq.work_nature[]` (Doc-2 §10.4:757).
  2. [OBS] **routing_mode observe-only (R6) + version cross-link (Inv #8).** "Routing" row = `ROUTING_MODE_LABEL[routing_mode]` display-only (frozen enum Doc-2:757; buyer set breadth at authoring, the engine decides who is invited — no re-rank/award/matching surfaced). "Version" row shows `v{current_version_no}` + a "Version history" Link → `/rfqs/[id]/versions` (P-BUY-11, RV-0061); `current_version_no` frozen (Inv #8). Summary promoted to a lead paragraph (hierarchy only).
  3. [OBS] **No frozen-kit change; additive.** `git status src/frontend/` clean; reuses StatusChip/DescriptionList/Link. VM diff additive (optional `workNature?`/`routingMode?`/`currentVersionNo?` on `RfqDetailData`); options diff additive (`WORK_NATURE_LABEL` derived map). Detail-view: rows added conditionally (included only when the read supplies them — no fabricated value); Overview/Quotations/Activity tab structure preserved.
  4. [OBS] page.tsx now passes a presentation SEED fixture (was `data={null}`) so the enriched detail renders for review — honestly flagged ("replaced by the mapped `get_rfq` projection at wiring"); the not-found ≡ genuine-absence path (`data===null`) is preserved in `RfqDetailView` (Inv #11/GI-12); opaque route id threaded (Inv #5). Quotation vendor names in the fixture are legitimately buyer-disclosed (submitted quotes are visibility-gated to the buyer — P-BUY-09); no deferred/excluded vendor shown anywhere (Overview/Activity remain non-disclosure-safe).
- Result: page → ✅ Approved. Queue advanced (Team-2 F2 sprint).

### RV-0076 · P-ACC-20 · Platform invoices · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/invoices/{page,platform-invoices-view}.tsx`
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MAJOR] **`human_ref` hidden + FALSE corpus claim; opaque UUID shown as the reference.** The frozen `billing.list_platform_invoices.v1` output is `items : list<object{ invoice_id, human_ref, purpose, amount, currency, status }>` (Doc-4I §HB-5.4:1143), and `platform_invoices` carries **`human_ref INV-P-…`** (Doc-2:831). The page renders the opaque `platform_invoice_id` (bare UUID) as the "Reference" column and its in-code comment asserts *"the frozen field has no human ref"* — **factually wrong**: the invoice HAS a human_ref (INV-P-…) and the list PROJECTS it. **Evidence:** Doc-2:831; Doc-4I §HB-5.4:1143. **Reason:** the customer-facing invoice number is `human_ref` (projected precisely to be shown); hiding it behind a UUID degrades a financial surface and rests on a false corpus statement — inconsistent with P-BUY-23 (trade-invoice `human_ref` rendered). **Recommendation:** render the projected `human_ref` as the reference; correct the comment. (`invoice_id` may still key the row / drive the detail link.)
  2. [MAJOR] **Coined "Date" column — not in the projection.** `list_platform_invoices` projects no date/issued_at/created_at (output = `{invoice_id, human_ref, purpose, amount, currency, status}`; `get_platform_invoice` also has none). The page renders a "Date" column from a fabricated `inv.date`. Same render-only-projected-fields class as RV-0063 (is_active) / RV-0059 (names). **Recommendation:** drop the Date column; render the PROJECTED `purpose` (subscription/lead_package/advertising/microsite/service, Doc-2:831) instead — it's both projected and more useful. If an issue date is genuinely required, flag it as a projection gap for wiring, don't fabricate.
  3. [OBS] Otherwise exemplary and unaffected: **money-boundary** — `platform_invoices ≠ operations.trade_invoices` (Doc-4I H.9 FIXED) stated in comment + rendered ("They aren't trade invoices between you and vendors"); no escrow/wallet/settlement. Status enum verbatim `issued/paid/overdue/void` (Doc-2:375/831); currency-driven amounts; read-only (list_platform_invoices = `can_view_billing` debtor-org read, §HB-5.4); cursor pagination no grand total (GI-03); semantic table a11y; single h1.
- Result: page → 🟥 **Patch Required**. Bounced to Team-1; **queue NOT advanced** (Team-1 stays on P-ACC-20).

### RV-0077 · P-ADM-25 · Identity ops — orgs · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/identity/orgs/page.tsx` + `_components/admin/identity/org-ops-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Cross-module boundary R5 EXEMPLARY.** Organizations are M1/Identity-owned; the page states + renders "Admin decides; Identity applies the effect — Admin never bypasses the Identity domain." Governance mutations `set_organization_status` (suspend/reinstate, Doc-4C §C5:310, 21.6 Admin) + `admin_recover_ownership` (ownership-succession recovery, §C5:324, Arch §5.5) are real, rendered-but-DISABLED; `staff_super_admin` interim authz corpus-accurate (DC-3; least-privilege `staff_can_manage_organizations` a future §7 additive). Red-Flag "Admin (M8) bypasses an owning module's domain" AVOIDED. Firewall: no governance score.
  2. [OBS] **Fields + states verbatim.** `organizations` fields (Doc-2:718): `human_ref ORG-…` (correctly SHOWN as the ref — good contrast with P-ACC-20/RV-0076), `name`, `org_status`, `participation` (derived from has_buyer_profile/has_vendor_profile flags — honestly framed). §5.1 machine exact: `active ⇄ suspended`, `active|suspended → soft_deleted`; `soft_deleted` terminal for these ops (actions "—"). URL `?status=` filter allowlisted; 15th `AdminQueueTable` consumer; loading.tsx; no active-org (§5.6).
  3. [OBS → wiring] **Admin org-list READ binding unidentified.** The worklist lists orgs across the platform, but NO frozen admin cross-tenant org-list read exists — `identity.get_organization.v1` is 21.3 **internal-service** single-read (Doc-4C:124/574) and `identity.list_my_organizations.v1` is 21.3 **User** self-scoped (Doc-4C:554/629); neither backs an admin worklist. The seed says only "the unwired read" without identifying/flagging this. Recommend (mirroring P-ADM-24's derive-note + the DC-3 slug-gap pattern): add an explicit read-binding note and register an ESC for a future admin org-management list read — don't silently presume one. Non-blocking (presentation-only; all rendered fields/mutations are frozen-real; no contract name coined). Same class as the P-ADM-19/21 read/schema OBS.
  4. [OBS] "Showing N organizations" count — when wired ensure it reflects page rows, not an implied grand total (GI-03; cursor list). Consistent with the P-ADM-22 note.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-26).

### RV-0078 · P-ACC-20 · Platform invoices · Team-1 — RE-REVIEW (RV-0076 patch)
- Date: 2026-07-02 · Reviewed: `app/(app)/account/invoices/platform-invoices-view.tsx`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED ← MAJOR] `human_ref` now rendered. The "Reference" column shows the projected `humanRef` (INV-P-2026-…, Doc-2:831); the opaque `invoice_id` is demoted to route-key only (`/account/invoices/{invoice_id}`). The false comment is corrected ("Earlier build wrongly hid human_ref behind the opaque id — human_ref IS [projected]"). Search filters by humanRef + purpose. ✔
  2. [RESOLVED ← MAJOR] Coined "Date" column removed; replaced with the PROJECTED `purpose` enum `<subscription|lead_package|advertising|microsite|service>` (Doc-2:831/§10.8), with a note "There is NO date field in the list projection — none is fabricated." Columns now = exactly the frozen `list_platform_invoices` projection {human_ref, purpose, amount, currency, status} (invoice_id = key). ✔
  3. [OBS] Unchanged & still exemplary: money-boundary (platform_invoices ≠ operations.trade_invoices, Doc-4I H.9); status enum verbatim (issued/paid/overdue/void); currency-driven; read-only (`can_view_billing`); cursor no grand total (GI-03); semantic table a11y.
- Result: page → ✅ Approved (both RV-0076 MAJORs resolved). Queue advanced (Team-1 → P-ACC-21).

### RV-0079 · P-ADM-26 · Identity ops — users · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/identity/users/page.tsx` + `_components/admin/identity/user-ops-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **R5 cross-module boundary EXEMPLARY (mirrors P-ADM-25/RV-0077).** Users are M1/Identity-owned; the page states + renders "Admin decides; Identity applies the effect — Admin never bypasses the Identity domain." `set_user_account_status` (suspend/reinstate) is real (Doc-4C §C4:215, 21.6 Admin, `staff_super_admin` interim DC-3), rendered-but-DISABLED. Firewall: no governance score.
  2. [OBS] **Status + PII discipline.** `users` status `active / suspended / soft_deleted (anonymizable on departure)` verbatim (Doc-2:260); `soft_deleted` terminal (actions "—"). PII limited to login identity — name (display_name) + email, with email→"—" when anonymized; no phone/other PII enriched. Appropriate for an admin governance surface. `?status=` allowlisted filter; 16th `AdminQueueTable` consumer; loading.tsx; no active-org (§5.6).
  3. [OBS → wiring] **Admin user-list READ binding unidentified (recurs from RV-0077).** No frozen admin cross-tenant user-list read exists (`get_user` is 21.3 internal-service single-read; no `list_users`). The seed says only "the unwired read." Same recommendation as RV-0077: the admin identity-ops read surface (org + user lists) needs an explicit read-binding note + a single ESC for a future admin identity-ops list read — carry it across the P-ADM-25/26 cluster, don't presume silently. Non-blocking (presentation-only; fields/mutations frozen-real; no contract coined).
  4. [OBS] "Showing N users" — when wired, page rows not an implied grand total (GI-03), per the P-ADM-22/25 note.
- Result: page → ✅ Approved. Completes the Identity-ops pair (P-ADM-25/26). Queue advanced (Team-3 → P-ADM-27).

### RV-0080 · P-ACC-21 · Platform invoice detail · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/invoices/[invoiceId]/{page,invoice-detail,invoice-detail-data}.tsx/.ts`
- Verdict: **PATCH REQUIRED**
- Findings:
  1. [MINOR] **Payment status enum mismatch — coined value + missing frozen states.** The `get_platform_invoice` payments projection status comes from `platform_payments.status`, frozen as **`initiated | succeeded | failed | refunded`** (Doc-2:832). The page's `PaymentStatus` type is `succeeded | pending | failed` — it **coins "pending"** (the frozen pre-success value is `initiated`) and **omits `initiated` and `refunded`**. `PAYMENT_META` maps only succeeded/pending/failed, so a wired payment in `initiated` or `refunded` has no chip mapping (`PAYMENT_META[...]` undefined → render crash). Same class as RV-0059 (missing §5.10 state). **Evidence:** Doc-2:832; `PaymentStatus`/`PAYMENT_META` in invoice-detail. **Recommendation:** set `PaymentStatus = initiated | succeeded | failed | refunded` (frozen), map all four in `PAYMENT_META` (a friendly label like "Pending" for `initiated` is fine — but the TYPE/value must be the frozen `initiated`); add `refunded`.
  2. [OBS] Otherwise EXEMPLARY — RV-0076 lesson applied. `get_platform_invoice` projection verbatim `{invoice_id, human_ref, organization_id, purpose, amount, currency, status, payments:[{gateway, gateway_ref, status}]}` (Doc-4I §HB-5.4:1143); **`human_ref` (INV-P-…) rendered** as the reference (invoice_id keys the route only); invoice `status` enum verbatim (paid/issued/overdue/void); `purpose` frozen enum; payments show gateway + opaque gateway_ref + status only. **No line_items coined** (single-purpose fee → one purpose→amount row + total, explicitly noted); **no file_ref coined** (PDF is a DISABLED, flagged affordance, not a fabricated link). Money-boundary exemplary (platform_invoices ≠ operations.trade_invoices, Doc-4I H.9; no escrow/wallet); org opaque; notFound Inv #11; currency-driven; semantic table + h2 + single h1 a11y.
- Result: page → 🟥 **Patch Required**. Bounced to Team-1; **queue NOT advanced** (Team-1 stays on P-ACC-21).

### RV-0081 · P-ACC-21 · Platform invoice detail · Team-1 — RE-REVIEW (RV-0080 patch)
- Date: 2026-07-02 · Reviewed: `app/(app)/account/invoices/[invoiceId]/{invoice-detail-data.ts,invoice-detail.tsx}`
- Verdict: **PASS**
- Findings:
  1. [RESOLVED ← MINOR] `PaymentStatus` = frozen `platform_payments.status` enum `initiated | succeeded | failed | refunded` (Doc-2:832); `PAYMENT_META` maps all four (initiated="Initiated"/info, succeeded, failed, refunded="Refunded"/neutral); coined "pending" removed → no unmapped-status crash when wired. ✔
  2. [OBS] All RV-0080 exemplary points unchanged: `get_platform_invoice` projection verbatim (§HB-5.4); `human_ref` rendered as reference (invoice_id = route key); no line_items/file_ref coined (PDF disabled+flagged); money-boundary (platform_invoices ≠ trade_invoices, Doc-4I H.9); notFound Inv #11; SERVER read-only; a11y.
- Result: page → ✅ Approved (RV-0080 MINOR resolved). Queue advanced (Team-1 → P-ACC-22).

### RV-0082 · P-ADM-27 · Suggestion triage · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/suggestions/page.tsx` + `_components/admin/suggestions/suggestions-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Contracts/states/reads verbatim (BC-ADM-3).** Suggestion is ONE aggregate over 3 roots (category/missing_vendor/link, Doc-4J:132/168); the page scopes to the 2 NON-LINK roots (link → P-ADM-28). States verbatim (Doc-4J H.5:25/132): `category_suggestions submitted→approved/rejected`, `missing_vendor_suggestions submitted→triaged→closed`. Contracts real: `decide_category_suggestion` (`staff_can_manage_categories`, category-decisions ONLY), `triage_/close_missing_vendor_suggestion` (`[ESC-ADM-SLUG]`) (Doc-4J:191-192). **Read binding EXISTS — `list_suggestions`/`get_suggestion` are frozen (Doc-4J:194)** — team verified no read-gap (directly answering the RV-0077/0079 pattern; good). R5 — per-row Approve/Reject/Triage/Close rendered-but-DISABLED, offered only on frozen edges; terminal "—". "Admin decides; the owning module applies" (category→Marketplace service).
  2. [OBS] **Non-disclosure §7.5 + firewall + moat.** Staff-only surface (`/admin/`, no active-org); rendered "Suggestions are visible to platform staff only" (Doc-4J H.4:24/§186). The sensitive LINK-suggestion content (never vendor-visible) is correctly NOT on this page (deferred to P-ADM-28). No governance score (firewall); Admin governs, does not procure — no matching/ranking/award (moat, Doc-4J:196/366). 17th `AdminQueueTable` consumer; loading.tsx; `?kind=` allowlisted filter.
  3. [OBS] "Showing N suggestions" — page rows not an implied grand total when wired (GI-03), per the P-ADM-22/25 note.
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-28).

### RV-0083 · P-ADM-28 · Link triage · Team-3
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/links/page.tsx` + `_components/admin/links/link-suggestions-seed.ts`
- Verdict: **PASS** — NON-DISCLOSURE-CRITICAL surface, exemplary
- Findings:
  1. [OBS] **NON-DISCLOSURE (Inv #11 / §7.5 / Doc-4J:132/168/186/194) — EXEMPLARY.** A link candidate connects a PUBLIC `vendor_profile_id` to a BUYER-PRIVATE `private_vendor_record_id`. The private side renders ONLY as an OPAQUE ref (`privateRecordRef`, `pvr-…`, mono) — the buyer identity and any CRM notes are NEVER exposed. The whole surface is platform-staff-only (Doc-4J:168 read models: link list/detail/search staff-only; unauthorized → NOT_FOUND §7.5), stated + rendered as an explicit ShieldAlert notice ("never shown to any vendor or buyer; owner and notes never exposed"). `match_basis`/`confidence` (LinkMatchBasis, "never vendor-visible") are shown to STAFF only — correct on this admin-only surface.
  2. [OBS] **Fields = frozen `link_suggestions` projection (Doc-4J:156-166).** `match_basis` enum<email|phone|trade_license> (verbatim, Doc-4J:163 — MATCH_BASIS_LABEL coins nothing); `confidence` numeric; `state` enum<suggested|confirmed|dismissed> (verbatim); private record opaque; `confirmed_by` omitted. `vendor_profile_id` resolved to the PUBLIC vendor name (M2/Marketplace — legitimate on an admin surface, P-ADM-07/21/25 precedent; OBS).
  3. [OBS] **R5 + firewall + moat.** `confirm_link_suggestion`/`dismiss_link_suggestion` (`[ESC-ADM-SLUG]`, Doc-4J:193) rendered-but-DISABLED; on confirm the write is via the Operations service (A-03/DR-ADM-OPS — Operations owns `operations.private_vendor_records`; Admin decides, module applies). FIREWALL: `confidence` is link-match evidence, NOT a governance score (no Trust/Perf/Tier). MOAT: CRM linking, NOT RFQ procurement matching (Doc-4J:196 "no procurement decision"). States terminal (confirmed/dismissed) → actions "—"; `?status=` allowlisted; 18th `AdminQueueTable`; loading.tsx.
  4. [OBS] "Showing N candidates" — page rows not an implied grand total when wired (GI-03).
- Result: page → ✅ Approved. Queue advanced (Team-3 → P-ADM-29).

### RV-0084 · P-ADM-29 · Support reads · Team-3 (LAST admin page)
- Date: 2026-07-02 · Reviewed: `app/(app)/admin/support/page.tsx` + `_components/admin/support/support-seed.ts`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Cross-module boundary R5 exemplary.** `support_tickets` are M6/Communication-owned (BC-COMM-4, A-04; Doc-4H review:38/45); Admin has a READ scope only via `staff_can_support` — a real Doc-2 §7 platform-staff slug (Doc-4H B.4: "Support Admin; **no private-RFQ read**"). The page is READ-ONLY with ZERO action controls (no Respond/Resolve/Close) — all support mutations are M6-owned; "responding and resolving happen in the support workflow." Admin reads, Communication owns. No RFQ/private data on the surface (honors "no private-RFQ read").
  2. [OBS] **Fields + states verbatim.** `support_tickets` fields `subject, priority, status, organization_id` (Doc-2:816); states `open → in_progress → resolved → closed` (Doc-2:362) — FILTERS + TICKET_STATUS_META map them verbatim. Firewall: no governance score. Staff-only surface (`/admin/`, no active-org); protected-fact NOT_FOUND collapse at wiring. Read binding EXISTS (BC-COMM-4 reads, staff_can_support) — no read-gap. `id` opaque (mono); org resolved on staff surface (admin precedent). `?status=` allowlisted; 19th `AdminQueueTable`; loading.tsx.
  3. [OBS] "Showing N tickets" — page rows not an implied grand total when wired (GI-03).
- Result: page → ✅ Approved. **Completes the Team-3 Admin console (P-ADM-01…29).** Team-3 admin queue exhausted.

### RV-0085 · P-ACC-22 · Rewards / referrals · Team-1 (LAST P-ACC page)
- Date: 2026-07-02 · Reviewed: `app/(app)/account/rewards/{page,rewards-dashboard}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **BC-BILL-6 verbatim + Inv #10.** `get_reward_balance` → numeric `balance` shown as reward POINTS (not currency, no BDT — rewards are points per Doc-4I §HB-6.1:1203 `points:numeric`; reward_accounts points-balance head, H.10:815); Inv #10 numeric. `list_referrals` items = opaque `referred_organization_id` + frozen `state` only (referrals fields H.10:815 `referrer/referred_organization_id, state`); NO date/reward-amount/org-name coined — referred org shown as OPAQUE ref with an explicit "display names aren't part of this list" note (RV-0059 delegation lesson applied proactively). Referral state `pending → qualified → rewarded` verbatim (Doc-4I H.5:810). SERVER read-only.
  2. [OBS] **Moat + firewall + money-boundary.** Rendered "Reward points are a loyalty perk. They never affect RFQ matching, routing, or awards" — rewards/referrals are promotional, NEVER procurement standing (Doc-4I H.9:814/§31 moat). No governance score (firewall — points ≠ Trust/Perf/Tier). Points are not currency / not buyer↔vendor money (money-boundary). reward_transactions ledger correctly not fabricated (balance + referrals only). a11y: semantic table (caption/scope), h2, single h1; opaque referral ref (mono).
- Result: page → ✅ Approved. **Completes the Team-1 P-ACC section (P-ACC-01…22; P-ACC-12 remains Waiting-Decision `ESC-IDN-DELEG-EXPIRY`).**

### RV-0086 · P-PUB-04 · Pricing / Plans (public) · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/pricing/{page,pricing-plans}.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Anonymous public surface — clean.** SERVER page in the `(public)` shell (SiteHeader/SiteFooter, NOT account AppShell); `PricingPlans` client island holds only the billing-cycle toggle. Binds NO Doc-5 contract, performs NO auth reads; conversion CTAs → `/login?plan=&cycle=` (Doc-7D PR5), signed-in choose → P-ACC-16. No frozen-kit change (`git status src/frontend/` clean; composes Card/Button/Badge). Single h1 (page owns it; plan cards h2).
  2. [OBS] **Inv #10 + moat exemplary.** Features marketed as ENTITLEMENT VALUES (seats/lead-credits/RFQ-quota/microsite/support), never plan-name gating; the "Most popular" featured badge + taglines are marketing copy only; plan ≠ financial tier (no governance/tier band). **Moat stated on the page** (rendered lines 43-44: "Plans … never affect RFQ matching, routing, or awards — sourcing is governed the same way on every plan"; Doc-3 §11.8). Markets the frozen public `list_plans` projection {plan_id, name, billing_cycle, price, currency, status}; currency-driven price (per-plan `currency`, BDT); included/excluded = Check/Minus icons + text (not colour-only, GI-06); P-4 inks.
  3. [OBS → wiring] monthly/annual toggle collapses per-cycle rows into one card (priceMonthly/priceAnnual), same as RV-0068 — frozen `plans` is one `billing_cycle` per row with no family key; even lower-stakes on a T-STATIC marketing page. Seed entitlement labels/taglines are marketing copy. Non-blocking.
- Result: page → ✅ Approved. Queue advanced (Team-1 → next P-PUB/P-SH page).

### RV-0087 · P-PUB-02 · About · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/about/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Static marketing — exemplary honesty, no fabrication.** Pure SERVER component in the `(public)` shell; binds NO Doc-5 contract, fabricates no data. All copy grounded in the frozen product definition: the four surfaces (B2B marketplace / structured RFQ procurement / post-award operations / vendor CRM) map to CLAUDE.md §1; post-award doc list (LOI/PO/challan/invoice/WCC) matches M4; NO invented metrics, customer counts, logos, funding, team, or dates. The three principles are TRUE architectural commitments, not slogans: governed matching "not pay-to-win — a subscription never buys a better RFQ position" (moat, Doc-3 §11.8); "private by default … a buyer's private supplier decisions stay private — forever" (Inv #5 org boundary + Inv #11); "we never touch your transaction money … no escrow/wallet/settlement; we record, never move" (money-boundary/DF-6). No governance signal/score.
  2. [OBS] Anonymous (CTAs → `/login` PR5 + `/marketplace`); no frozen-kit change (`git status src/frontend/` clean; composes Card/Button/icons); single h1 + h2/h3 hierarchy; P-4 inks (iv-ink-heading/secondary).
  3. [OBS, team-flagged, non-blocking] `--iv-reading-max` undefined → `max-w-3xl` used (token-owner flag, RV-0030 pattern). **Shared SiteHeader "Pricing" nav still points to `/` — should target `/pricing` now that P-PUB-04 exists**; a shared-chrome wiring follow-up (not a P-PUB-02 defect). Surfaced for Team-1/chrome owner.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-PUB-03).

### RV-0088 · P-PUB-03 · How it works · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/how-it-works/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **R6 EXEMPLARY (the key check for a flow-describing page).** Step 4 "Award — your decision": "You award the RFQ explicitly. iVendorz never picks a winner for you and never ranks the vendors — the choice is yours"; closing line repeats "never ranks vendors or recommends a winner. The award is always your explicit decision" (Doc-3 §9.1, R6 — the platform never recommends/ranks/auto-awards). Step 3 "Compare quotes" is buyer-driven ("on the details that matter to you"), not a system recommendation. **Coins/restates NO Doc-4M state** — conceptual step titles (Post RFQ / Smart routing / Compare / Award / Deliver), no frozen state names.
  2. [OBS] **Moat stated (Doc-3 §11.8).** Step 2 "Smart routing … the same rules apply to everyone — placement can't be bought"; closing "Matching and routing are governed the same way for everyone — a subscription never buys a better position." No plan/entitlement gates routing/placement.
  3. [OBS] Static marketing — no fabricated metrics/customers/funding/team/dates; binds no Doc-5 contract, no data. GI-07 responsive `<ol>` stepper (step numbers as TEXT not colour-only; icons decorative aria-hidden; horizontal md:grid-cols-5 → vertical mobile). No frozen-kit change (`git status src/frontend/` clean); single h1 + h2 hierarchy; anonymous CTAs → `/login` PR5 + `/marketplace`; P-4 inks. (Recurring chrome OBS still open: shared SiteHeader "Pricing" nav → `/pricing`; not this page.)
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-PUB-05).

### RV-0089 · P-PUB-05 · For Buyers (segment) · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/for-buyers/page.tsx`
- Verdict: **PASS**
- Findings:
  1. [OBS] **Every value prop is a TRUE product commitment — governance-aware copy.** R6 (Award "your explicit decision. iVendorz never picks a winner for you and never ranks the vendors", Doc-3 §9.1); moat ("placement can't be bought", Doc-3 §11.8); **trust DISPLAYED not self-set** ("Trust is shown on the platform, never something a vendor sets for themselves" — M5-owned, firewall Inv #6; no score/band leak — binary "verification you can see"); private CRM ("private to your organization … your supplier decisions stay yours — always", Inv #11); compare objectively (buyer-driven, "on the details that matter — not who shouted loudest"); post-award docs (M4, LOI→delivery). No governance signal/score rendered.
  2. [OBS] Static segment marketing — NO fabricated metrics/customers/funding/team/dates; binds NO Doc-5 contract, no data. Single h1 ("Source with confidence"; "For buyers" eyebrow is a `<p>`, not a competing heading; sections h2, cards h3). No frozen-kit change (`git status src/frontend/` clean; composes Card/Button/icons); anonymous CTAs → `/login` PR5 + `/marketplace` + `/how-it-works`; P-4 inks. (Recurring chrome OBS still open: shared SiteHeader "Pricing" nav → `/pricing`.)
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-PUB-06).

### RV-0090 · P-PUB-06 · For Vendors (segment) · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/for-vendors/page.tsx`
- Verdict: **PASS** — vendor-side firewall/moat/Inv#1 landmines all cleared
- Findings:
  1. [OBS] **Vendor-side governance EXEMPLARY.** Capability = 4-flag MATRIX "not a label" (supply/service/fabricate/consult, Inv #1). **Verification DISPLAYED not self-set** — "earned and displayed, never something set by hand" (M5-owned, firewall Inv #6; NO score/band/number shown or implied). **Moat** — "placement can't be bought, so work is won on the merits"; buyers award explicitly (Doc-3 §11.8, R6). **Received-only** — "RFQs come to you … you choose which to pursue" (M3 invitations / M7 leads; no vendor self-create). Discovery + public microsite (M2); respond with quotations (M3). **NO buyer-private CRM / blacklist exposure** (Inv #11 §7.5) — nothing implies a vendor can see their standing with a buyer.
  2. [OBS] Static segment marketing — NO fabricated metrics/customers/funding/team/dates; binds NO Doc-5 contract, no data. Single h1 ("Get found. Win real work."; "For vendors" eyebrow is `<p>`; sections h2, cards h3). No frozen-kit change (`git status src/frontend/` clean); anonymous CTAs → `/login` PR5 + `/vendors` + `/how-it-works`; P-4 inks. (Recurring chrome OBS still open: shared SiteHeader "Pricing" nav → `/pricing`.)
- Result: page → ✅ Approved. Completes the segment pages (P-PUB-05/06). Queue advanced (Team-1 → next Ready P-PUB/P-SH).

### RV-0091 · P-PUB-18 · Trust & verification explainer · Team-1 (FIREWALL-CRITICAL)
- Date: 2026-07-02 · Reviewed: `app/(public)/trust/page.tsx` + reuse of `_components/microsite/vendor-verified-badge`
- Verdict: **PASS** — strongest firewall/non-disclosure demonstration in the public set; Raise≠Accept override RATIFIED
- Findings:
  1. [OBS — RATIFIED OVERRIDE] **Team-4 adjudication of the flagged spec↔governance tension: the team's Raise≠Accept override is CORRECT; I RATIFY it.** The screen_specifications §P-PUB-18 Required set lists "score-ring (illustrative)"; the team rendered NO numeric score/band/tier/ring and deferred public score display behind `[ESC-7G-SCORE-DISPLAY]`. **Grep-verified: ZERO rendered score/band/tier/ring/number** — every "score/band" token is a NEGATION ("not a public score", "no public score, band, or leaderboard", "not a score you have to decode"). Authority order §7: the firewall (Inv #6, immutable architecture) + `[ESC-7G-SCORE-DISPLAY]` (Board-gated) + non-disclosure §7.5 OUTRANK the screen_specifications (a NON-authoritative Doc-7 companion, patched-to-corpus). Rendering an "illustrative" trust number would pre-empt the withheld ESC and contradict every approved public surface (P-BUY-02/RV-0048, P-PUB-06/RV-0090 — binary Verified only). Validate-Findings gate all pass (valid/applicable/best-for-product/corpus-consistent). NOT a Flag-and-Halt — spec is non-authoritative, resolved upward correctly. Exemplary governance discipline.
  2. [OBS] **Binary Verified only + M5 + firewall stated without leaking internals.** The sole public trust signal is the BINARY `VendorVerifiedBadge` (git-verified: `git status src/frontend/` clean, badge unchanged; `<VendorVerifiedBadge verified />`). "A supplier either carries the Verified mark or they don't — no 'pending'/'unverified' … the only trust signal we show publicly, on purpose." Verification DISPLAYED not self-set ("shown by the platform based on checks it performs; a supplier can never grant it to themselves", M5). Firewall (Inv #6) stated WITHOUT enumerating the private internals: "keeps its trust factors independent, so no single factor can inflate another and none can be gamed." No ranking + standing can't be bought (R6/moat).
  3. [OBS] **Buyer Vendor Status PRIVATE never surfaced (Inv #11).** "Your private view stays private: anything you decide about a supplier for your own organization stays private to you — it never becomes a public signal, and it never affects anyone else's standing" → describes the private-view concept WITHOUT naming Buyer Vendor Status; blacklist stays undetectable (§7.5). No fabrication; binds no Doc-5 contract, no data; single h1 (eyebrow `<p>`; sections h2, cards h3); anonymous CTAs → `/vendors` + `/how-it-works`; P-4 inks. (Recurring chrome OBS still open: SiteHeader "Pricing" nav → `/pricing`.)
- Result: page → ✅ Approved. Queue advanced (Team-1 → next Ready P-PUB/P-SH).

### RV-0092 · P-PUB-21 · Legal — Terms (placeholder scaffold) · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/legal/terms/page.tsx` + reusable `app/(public)/legal/_components/legal-document.tsx`
- Verdict: **PASS** — honest placeholder scaffold; the "fabricated-legal-content" landmines are all cleared
- Findings:
  1. [OBS] **No fabricated binding legal content — the core risk for this page is cleanly avoided.** Every section body is descriptive-future ("This section *will describe/list/set out* …") + "Final wording is pending Legal review." **No governing law, no jurisdiction, no legal entity, no address, no effective date, no warranty/liability language is coined.** `lastUpdated="Pending"` is a placeholder token, NOT a fabricated date. Prominent `role="note"` amber notice states the wording "is pending Legal review and is not yet binding — shown to preview the structure only." The Disclaimers section says the section "*will* set out disclaimers … to the extent permitted by applicable law" — describes intent, does NOT actually disclaim. Binds no Doc-5 contract, no data.
  2. [OBS] **Only TRUE corpus facts stated, and stated descriptively.** Money-boundary — "never handles payment between buyers and vendors — no escrow, wallet, or settlement" (CLAUDE.md §1, DF-6) — with explicit deferral "this will be reflected in the final terms." Users-act/orgs-own — "every business record belongs to an organization, which is the tenant boundary" (Inv #5). No legal obligation asserted. Contact section points to the Contact page WITHOUT coining phone/email/address.
  3. [OBS] **Reusable scaffold clean; structure sound.** `legal-document.tsx` = pure SERVER component, presentation-only; Privacy (P-PUB-22) reuses it (reuse-not-duplicate — will git-verify byte-equivalence when P-PUB-22 lands). Single `<h1>` owned by the scaffold; sections `<h2>` with document landmarks (`id` + `aria-labelledby` + `scroll-mt-20`); in-page anchor nav (`#id`) + kit `Separator`. Tokens all from the established set (ink/brand/amber/muted); `--iv-reading-max` correctly avoided via `max-w-3xl` utility + flagged to token owner (recurring RV-0030 follow-up — surface, not bounce). No frozen-kit change (`git status src/frontend/` clean); anonymous public shell, footer-reached.
- Result: page → ✅ Approved. Queue advanced (Team-1 → next Ready P-PUB/P-SH). **NOTE for P-PUB-22 Privacy:** git-verify byte-equivalence of the shared `legal-document.tsx` scaffold (must be reused unchanged, not forked).

### RV-0093 · P-PUB-22 · Legal — Privacy (placeholder scaffold, reuse) · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/legal/privacy/page.tsx` (reuses `app/(public)/legal/_components/legal-document.tsx`)
- Verdict: **PASS** — byte-identical scaffold reuse CONFIRMED; same honest-placeholder discipline as P-PUB-21
- Findings:
  1. [OBS] **Byte-identical scaffold reuse VERIFIED (reuse-not-duplicate).** `git status --porcelain app/(public)/legal/_components/legal-document.tsx src/frontend/` = EMPTY and `git diff` on the scaffold = EMPTY → the shared `legal-document.tsx` is untouched from its RV-0092 committed form (no fork, no drift). `privacy/page.tsx` is the ONLY new file; the single `<h1>` is scaffold-owned. No frozen-kit change.
  2. [OBS] **No fabricated privacy content — the core risk is cleanly avoided.** Every section body is descriptive-future ("This section *will describe* …") + "Final wording is pending Legal review." **No retention periods, no third-party/service-provider names, no governing law, no legal entity, no address, no effective date is coined.** `lastUpdated="Pending"` is a placeholder token, NOT a date. Contact section points to the Contact page WITHOUT coining phone/email/address. Binds no Doc-5 contract, no data.
  3. [OBS] **Only TRUE corpus facts, stated descriptively.** Org tenant boundary + default-private ("business records belong to an organization, which is the tenant boundary, and the platform is default-private", Inv #5 / CLAUDE.md §1); money-boundary consequence ("never handles payment between buyers and vendors — no escrow, wallet, or settlement — so no payment data flows through the platform", DF-6) — a correct, defensible statement of fact, not a legal obligation. No obligation asserted; all deferred to "pending Legal review".
- Result: page → ✅ Approved. Completes the Legal pair (P-PUB-21/22). Queue advanced (Team-1 → P-PUB-24 Contact).

### RV-0094 · P-PUB-24 · Contact / Support · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/contact/page.tsx` + `app/(public)/contact/contact-form.tsx`
- Verdict: **PASS** — honest no-op form; no fabricated contact details; no kit change
- Findings:
  1. [OBS] **Submit is an HONEST NO-OP — the core risk (faked success on an unwired form) is cleanly avoided.** `onSubmit` calls `preventDefault()` and only flips a local `submitted` flag — NO fetch/POST, NO fabricated ticket id or success toast. Disclosure is doubled and unambiguous: an ALWAYS-VISIBLE helper ("we'll add live messaging soon — for now this is a preview") + an inline `role=status` on submit ("messaging isn't connected yet, so nothing was sent. This form is a preview"). Correctly deferred behind `[ESC-7-API]` — a wired build POSTs a real endpoint. Client island holds only ephemeral form state + the preview flag (Doc-7C §2.3). Binds no Doc-5 contract, no data.
  2. [OBS] **No fabricated contact details; FAQ = TRUE facts only.** No phone number, email address, office location, or support SLA is coined anywhere. The 3 FAQ items are all TRUE corpus facts: money-boundary ("never handles payment … no escrow, wallet, or settlement", CLAUDE.md §1 / DF-6); audience ("factories, plants, EPC contractors, procurement teams … and the suppliers who serve them", §1); get-started (create an account to post an RFQ or build a supplier microsite — true product description). No metrics/customers/dates fabricated.
  3. [OBS — watch-item, kit-owner gated] **Hand-rolled `<textarea>` is a page-LOCAL control, not a kit change.** `git status --porcelain src/frontend/` = EMPTY → frozen kit untouched. There is no kit `Textarea` primitive, so the Message control is a local `<textarea>` passed as a `FormField` child, its className replicating the kit `Input` styling (border-input/bg-background/shadow-iv-xs/ring-ring/border-destructive — established tokens). This is the correct HONEST choice today (a kit Textarea would be a frozen-foundation change — kit-owner gated). **Watch:** the replicated Input className can drift if kit `Input` styling changes; if a textarea is needed repeatedly, promote a kit `Textarea` primitive (kit-owner decision, demand-driven). NOT a bounce — page-local, no duplication into the kit.
  4. [OBS] Single `<h1>` ("Get in touch"; eyebrow = `<p>`; FAQ = `<h2>`); public shell, footer-reached; required fields → native validation; iv-info tokens = established note idiom. No governance-signal / non-disclosure / firewall surface (static contact page).
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-SH-* shell cluster).

### RV-0095 · P-SH-01 · Global search results · Team-1
- Date: 2026-07-02 · Reviewed: `app/(app)/account/search/{layout,page}.tsx`
- Verdict: **PASS** — discovery≠matching clean, non-disclosure absolute, honest interim; shell-mount question adjudicated (corpus silent → least-invention OK)
- Findings:
  1. [OBS — shell mount, owner/corpus decision] **The `/account/search` placement is adjudicated CORRECT for a presentation-only build; corpus is genuinely silent.** Verified against the frozen corpus: **ZERO "search" hits in Doc-7C frozen Structure AND Content** — no canonical global-search mount/URL/nav model is specified. The cited "IA §5.1" governs the searchable SCOPE tabs (Products/Vendors/RFQs/Quotations/Documents), not the route. The team's `/search`-collision premise is FACTUALLY VERIFIED: `app/(public)/search/page.tsx` already exists and owns `/search`; route groups `(public)`/`(app)` do NOT change the URL, so a second `(app)/search` resolves to the same `/search` path → a real Next parallel-pages collision. Mounting at `/account/search` + reusing the `ACCOUNT_NAV`/`ACCOUNT_QUICK_BAR` VM is **least-invention** (coins no nav model). Per Team-4 review focus: corpus-silent → defensible → **OBS, NOT a bounce**; the authoritative mount/nav model is a topology decision for the owner/corpus (same class as the owner-gated P-BUY-03/04 route topology). Self-flagged honestly in both layout + page.
  2. [OBS] **DISCOVERY ≠ MATCHING — zero ranking present (R6/R7).** No result rows exist at all (honest EmptyState), so there is nothing to rank; the page NEVER re-ranks or implies it re-ranks the M3 matching/routing engine. Explicit: "this surface presents hits; it NEVER re-ranks … There is no ranking here at all." No relevance/score/grand-totals/counts (GI-03); no contract order to re-sort (GI-04) since no rows.
  3. [OBS] **Non-disclosure ABSOLUTE + honest interim.** Rendered note "Results only ever include entities you're permitted to see" + code invariant "a hidden entity never appears (absent ≡ excluded — Invariant #11)." No results contract is callable presentation-only, so the results region shows an honest interim EmptyState ("Live search results aren't connected yet — this is a preview") and cites `[ESC-7-API]` — NO fabricated hits/counts/relevance. Reference-never-restate: the eventual wired reads are NAMED (search_catalog / list_vendor_directory / list_rfqs / list_quotations_for_rfq / post-award reads — IA §5.1) but NONE is called.
  4. [OBS] **No frozen-kit change; shell/identity discipline clean.** `git status --porcelain src/frontend/` = EMPTY — kit `SearchBar` (route-agnostic, URL-syncs `?q=`, fetches nothing) + `EmptyState` reused as-is. Single `<h1>` via `PageHeader` (the only `<h1` token in page.tsx is a comment). Org context is a PARKED presentation seed — "a wired build resolves it server-side via get_active_context … client org id never trusted" (Inv #5). Scope tabs are `?scope=` links with `aria-current`; breadcrumb Account›Search.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-SH-02 Notification center). **For owner:** ratify the global-search mount/nav model (corpus-silent; `/account/search` is the interim least-invention placement).

### RV-0096 · P-SH-02 · Notification center (full page) · Team-1 (NON-DISCLOSURE-CRITICAL)
- Date: 2026-07-02 · Reviewed: `app/(app)/notifications/{layout,page,notifications-seed}.tsx`
- Verdict: **PASS** — non-disclosure absolute, firewall clean, field discipline verified against the frozen M6 read; shared-seed single-source confirmed
- Findings:
  1. [OBS] **NON-DISCLOSURE ABSOLUTE + firewall clean.** The seed is 4 benign viewer-OWN-org items (a quotation submitted to your RFQ / your org profile updated by a Director in your org / a new member joined your org / your subscription renews). NONE reveals a hidden, excluded, blacklisted, or buyer-private entity; there is no cross-org leak and NO governance signal (trust/tier/performance/score) in any item. Code invariant + rendered note both state it: "a deferral / blacklist / private exclusion NEVER surfaces" and "You only ever see notifications meant for you" (Invariant #11 · §7.5 · CHK-7-040).
  2. [OBS] **Field discipline VERIFIED against the frozen M6 notification read (Doc-4H BC-COMM-2 Notification: `notifications` = recipient refs / source_event_id / channel(in_app) / title / body / payload_jsonb / read_at; lifecycle unread→read→archived; reads list_notifications/get_notification).** Renders ONLY {id, title, body, read (←read_at), timeLabel (←timestamp)} — all frozen-backed. **NO notification type/category/event/archived field is coined** (the frozen projection has none), so the spec's Archived tab + type filter + per-type columns are correctly DEFERRED [ESC-7-API], not invented. `href` is a presentation-derived deep link (a wired build resolves it from payload_jsonb/source_event_id), set ONLY where a real in-app route exists (→/account/billing) and omitted elsewhere — no fabricated route; not a coined domain field and carries no disclosure risk. Reference-never-restate honored (mutations named: mark_notification_read / archive_notification, Doc-5H §5).
  3. [OBS] **Presentation-only + honest interim.** "Mark all as read" is present but DISABLED; the frozen mutations (Doc-5H §5) are DEFERRED (no wired write); pagination/older-history DEFERRED [ESC-7-API]. The tab counts (All 4 / Unread 2) are LITERAL counts of the rendered seed items — NOT fabricated server-side grand totals (GI-03). Unread is NOT colour-only: a text `StatusChip label="Unread"` labels it (plus font-weight + tint). Preview note is honest ("marking read, archiving, and older history aren't connected yet").
  4. [OBS] **Shared single source VERIFIED; no kit change.** `notifications-seed.ts` feeds BOTH the topbar `NotificationCenter` bell (via `layout.tsx` ShellViewModel → AppShell notificationSlot) AND the full page (direct import) — one source, `UNREAD_COUNT` derived (=2), consistent. The `NotificationCenter` is the PRE-EXISTING Doc-7C-defined shell slot (SR6 · IA §5.4), unmodified and props-driven (`git status --porcelain src/frontend/` = EMPTY; no shell file modified). Single `<h1>` via `PageHeader`; breadcrumb Notifications.
  5. [OBS — shell mount, owner/corpus decision] Top-level `/notifications` full-page feed reuses the `ACCOUNT_NAV` VM — same class as RV-0095 (global search). The topbar dropdown mount IS corpus-defined (Doc-7C SR6 / IA §5.4), but the full-PAGE URL/nav model is corpus-silent → least-invention, **OBS not bounce**; owner to ratify alongside the global-search mount.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-SH-06 Forbidden). **For owner:** ratify the full-page notifications mount/nav model (corpus-silent; top-level `/notifications` is the interim least-invention placement — same decision as global search).

### RV-0097 · P-SH-06 · Forbidden (403) · Team-1 (NON-DISCLOSURE-CRITICAL)
- Date: 2026-07-02 · Reviewed: `app/(public)/forbidden/page.tsx`
- Verdict: **PASS** — EXEMPLARY, corpus-verified non-disclosure implementation of the protected-fact collapse
- Findings:
  1. [OBS] **Non-disclosure model VERIFIED against the FROZEN corpus — exact conformance.** Doc-7A **§8.2 Protected-fact collapse** (FROZEN, Doc-7A_Content_v1.0_Pass2 L96-97) + **CHK-7-041** (Pass3 L94) + class→status map (Pass2 L29): where the caller has NO established right to know a resource exists, the contract returns NOT_FOUND (404), NOT AUTHORIZATION (403), and the UI renders it IDENTICALLY to genuine absence — MUST NOT distinguish "exists but forbidden" from "does not exist" in copy/layout/timing/telemetry; 403 is shown ONLY where right-to-know is established by the caller's own tenancy/grants (Doc-4A §12.4/§12.6; Doc-5A §6.3; Inv #11 · §7.5). The page implements this EXACTLY: the DEFAULT no-right-to-know path calls Next's `notFound()` (rendering kit `NotFound`, which takes NO discriminating prop → byte-identical to absence) so such cases NEVER reach this page; this `/forbidden` route is the right-to-know 403 ONLY.
  2. [OBS] **Copy + telemetry leak-free.** GENERIC copy names NO resource — "You don't have access to this page. If you think this is a mistake, contact an administrator in your organization." reveals nothing beyond "no access"; "your organization" names no resource/other tenant (safe — a 403 is only shown where the viewer's own tenancy is established). NO page-specific analytics fire (telemetry non-leak per CHK-7-041) — pure server component, zero tracking call. Rationale documented in-file.
  3. [OBS] **No frozen-kit change; state discipline clean.** `git status --porcelain src/frontend/` = EMPTY — the kit `NotFound` is deliberately 404-only and UNCHANGED; this 403 is a page-LOCAL state view styled to match (kit `Button` + `next/link` reused, NO primitive duplicated). Single `<h1>` "Access denied" (eyebrow "403" = `<p>`); Back-to-home → `/`. Public `(public)` shell, consistent with the shipped 404 `(public)/not-found`. Binds no Doc-5 contract, no data.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P3 tail: P-PUB-20 Compare / P-PUB-23 Resources / P-SH-05 Maintenance). **Team-1 P2 shell/legal/contact/search/notifications/forbidden set COMPLETE.**

### RV-0098 · P-PUB-20 · Compare (public) · Team-1 (R7-CRITICAL)
- Date: 2026-07-02 · Reviewed: `app/(public)/compare/page.tsx`
- Verdict: **PASS** — the ranking/recommendation landmine is cleanly avoided; firewall + non-disclosure clean
- Findings:
  1. [OBS] **R6/R7 EXEMPLARY — no ranking, no recommendation, no winner, no score.** An UNGOVERNED neutral side-by-side of PUBLIC vendors the visitor chose. Column order = SELECTION order (`?vendors=` resolved in order, deduped, capped 4) — there is NO ordering-by-quality, no "best pick", no relevance/score. Both the intro ("a neutral discovery aid — iVendorz doesn't rank vendors, recommend a winner, or score them here") and the footer ("never ranks suppliers or picks a winner — awarding happens inside a governed RFQ, on your explicit decision", Doc-3 §9.1/§11.8) state it explicitly. DISTINCT from the governed RFQ comparison (P-BUY-15, /rfqs/[rfqId]/compare) and never touches the M3 engine (discovery≠matching).
  2. [OBS] **Firewall / binary-Verified clean.** Verification row = the BINARY `VendorVerifiedBadge` only (reused from P-PUB-18/RV-0091, git-verified unchanged); absence renders "—" with aria-label "No verification badge" — NEVER a fabricated "unverified"/"pending" state; NO trust/performance score, band, or tier appears ([ESC-7G-SCORE-DISPLAY], firewall Inv #6, non-disclosure §7.5).
  3. [OBS] **Capability = 4-flag matrix (Inv #1); reuse coins no field.** can_supply / can_service / can_fabricate / can_consult rendered via `OnOff` = Check/Minus ICON + "Yes"/"No" TEXT (NOT colour-only, GI-06). Reuses the shipped public discovery seed `VENDORS` (VendorCardVM shape — already approved P-BUY-02/RV-0048) — coins NO vendor field; renders only the frozen public projection (Doc-4D §B.3).
  4. [OBS] **Non-disclosure + presentation discipline.** Only public selected-vendor fields (name/category/location/verified/capability) — NO buyer-private/CRM/blacklist data. `?vendors=` selection is presentation-only: deduped, capped MAX_COLUMNS=4, resolved against the seed (unknown slugs dropped), server href recompute for remove/clear/add-more (no fabricated persistence); real per-visitor selection read deferred [ESC-7-API]. Header-associated cells (`scope=col`/`scope=row`) + sr-only `<caption>`; single `<h1>` "Compare vendors"; reading width via the DEFINED `--iv-content-max` token (not the undefined --iv-reading-max). No frozen-kit change (`git status --porcelain src/frontend/` = EMPTY).
- Result: page → ✅ Approved. Queue advanced (Team-1 → P3 tail: P-PUB-23 Resources / P-SH-05 Maintenance — 2 buildable pages left).

### RV-0099 · P-PUB-23 · Resources / Blog · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/resources/page.tsx`
- Verdict: **PASS** — honest SEO stub; the fabricated-content risk is cleanly avoided
- Findings:
  1. [OBS] **No fabricated content — an honest "coming soon" state, which is the correct answer absent a CMS.** There is NO content/CMS contract, so NOTHING is invented: no posts, authors, dates, read-times, categories, or counts. The page shows an honest `EmptyState` ("Resources are coming soon") with CTAs → /how-it-works + /marketplace (real routes). The intro is future-framed marketing ("Practical guides and articles … coming soon") that claims no specific article and states only TRUE facts (verified suppliers = the M5 binary concept; "industrial teams in Bangladesh" = CLAUDE.md §1). Future content read deferred [ESC-7-API]; binds no Doc-5 contract, no data.
  2. [OBS] **Presentation discipline clean.** Single `<h1>` "Procurement resources" (eyebrow "Resources" = `<p>`); anonymous `(public)` shell, footer-reached; reuses kit `EmptyState`/`Button` (coins nothing); defined `--iv-content-max` token; SEO metadata (title/description). No frozen-kit change (`git status --porcelain src/frontend/` = EMPTY). Distinct from the vendor-microsite /vendors/[slug]/resources sub-page.
- Result: page → ✅ Approved. Queue advanced (Team-1 → P-SH-05 Maintenance — the LAST Team-1 buildable page).

### RV-0100 · P-SH-05 · Maintenance / unavailable · Team-1
- Date: 2026-07-02 · Reviewed: `app/(public)/maintenance/page.tsx`
- Verdict: **PASS** — honest 503 state page; no fabricated incident data; no kit change
- Findings:
  1. [OBS] **No fabricated incident data.** A planned-downtime / dependency-unavailable (503) notice: NO ETA, timestamp, incident id, uptime, or status history is invented (a wired build would surface any real window). Generic copy — "iVendorz is briefly unavailable while we carry out scheduled maintenance. We'll be back shortly." The optional "Try again" is a plain navigation → `/` (kit Button, no wired backoff). Binds no Doc-5 contract, no data.
  2. [OBS] **State discipline clean; no frozen-kit change.** Single `<h1>` "Down for maintenance" (eyebrow "Maintenance" = `<p>`; Wrench icon decorative `aria-hidden`). Styled to match the shipped 404/403 state idiom (P-SH-03/06) — a page-LOCAL state view, kit `Button` reused, NO primitive duplicated (`git status --porcelain src/frontend/` = EMPTY). Public `(public)` shell; established tokens only.
- Result: page → ✅ Approved. **Team-1 buildable queue EXHAUSTED** — remaining P-PUB-01/07/08/10/12–17/19 already 🟩 Built; P-PUB-09/11 Waiting-API ([ESC-7-API-CATNAV / PRODDETAIL]); P-ACC-12 Waiting-Decision. Loop idles for Team-1 until a new page flips 🔵.

### RV-0101 · FE-VEN-05 · Vendor RFQ Workspace · Team-3
- Date: 2026-07-02 · Pages in scope: P-VND-15, P-VND-16 · Reviewed SHA: `e2f8642` (stable-target)
- Review-A (Architecture & Governance): **PASS**
  Findings: numbered, severity ladder BLOCKER/MAJOR/MINOR/NIT/OBS
  1. [OBS] **Delta scope matches the WP card exactly; no scope creep.** `git diff --stat c509934~1..e2f8642` touches only the two named files (`invitation-inbox.tsx`, `invitation-response.tsx`); `git diff --stat c509934~1..e2f8642 -- src/frontend/` is EMPTY (no kit/token change); no file under quotation-builder, leads, or any trust/performance/score surface is touched. Both checkpoint commits (`c509934` P-VND-15, `e2f8642` P-VND-16) are correctly page-bounded per the commit-policy amendment.
  2. [OBS] **Byte-equivalence of the rest of the vendor RFQ workspace verified, not re-reviewed (carry-forward rule, review-process.md §6).** `git diff --stat c509934~1..e2f8642 -- "app/(app)/_components/vendor/rfq/" "app/(app)/workspace/rfqs/"` shows only the two in-scope files changed; every other file in the surface (types.ts, state-chips, window-state-chip, quotation-home-summary, workspace/rfqs pages, shared/*) is untouched at the byte level across the milestone.
  3. [OBS] **No coined contract/field/state/enum.** `window_urgency: WindowUrgency` (`"normal"|"soon"|"imminent"`) and `invitation_state === "delivered"` are PRE-EXISTING typed fields in `types.ts` (unchanged by this delta) — grounded in the companion (§7.1 window urgency tiers; §6.4 `delivered` = the vendor-visible invitation entry state, Doc-4M `draft/selected/deferred/delivered/accepted/declined/expired`). The sort/group logic only reorders and labels already-authorized rows; it introduces no new server field, no new Doc-4M token, no new route.
  4. [OBS] **Sort is presentation-only reordering of the vendor's OWN received rows — not a computed rank (R6/R7 moat intact).** `byInformationHierarchy` operates purely client-side over the `items` array already scoped to this vendor's own invitations (received-only, DP1/BE-1); it does not call, simulate, or imply the M3 matching/routing/scoring engine, carries no numeric score, and produces no "of N"/rank/competitor signal. Framing holds.
  5. [OBS] **GI-03 (no fabricated totals) held.** No count or "of N" is introduced; the two group labels ("Needs your response" / "Other invitations") are text-only headers with no numbers. Group visibility (`showGroups`) is derived from the actual filtered array lengths of the given rows, not a separate/fabricated count.
  6. [OBS] **Non-disclosure / byte-equivalence (Invariant #11) of the empty state is untouched.** The `items.length === 0` branch and its `EmptyState` copy/props are byte-identical to the pre-delta version (diff shows zero change to that block) — the canonical never-matched≡blacklisted collapse is preserved.
  7. [OBS] **Grouping/sort logic verified correct by construction and simulation.** `needsResponseItems`/`otherItems` are built via `sorted.filter(needsResponse)` and `sorted.filter(item => !needsResponse(item))` on the SAME boolean predicate — a mathematically exhaustive, non-overlapping partition, so no row can be silently dropped or duplicated (confirmed by simulating 5 rows incl. an item with `invitation_state: undefined`, all 5 preserved, union size == input size). `undefined window_urgency` safely falls back to `UNRANKED_URGENCY` via the guarding ternary — no runtime crash from an unranked lookup. The comparator returns `0` on ties, so `Array.prototype.sort` (stable since ES2019/all evergreen engines) preserves original relative order within a tie — the "stable sort" doc-comment claim is accurate.
  8. [OBS] **Reuse discipline clean; `text-destructive` is a pre-existing kit token, not new.** `variant="outline"` is the existing kit Button variant (no new variant added); `text-destructive`/`hover:text-destructive` are pre-existing Tailwind-mapped classes already used elsewhere in the app (`org-setup-wizard.tsx`, `signup-form.tsx`, buyer RFQ create sections) — confirmed present, not introduced, and the kit `button.tsx` `destructive` variant (`bg-destructive text-destructive-foreground`) confirms `destructive` is an established design token, not fabricated.
  9. [OBS] **`aria-describedby` wiring is correct.** `id="invitation-decline-note"` is applied to the consequence-note `<p>`, which renders unconditionally in both the `responded` and not-responded branches; the Decline button (which carries the `aria-describedby` reference) only renders in the not-responded branch, where the referenced id is always present — no dangling/orphan ARIA reference in either state.
  10. [OBS] **tsc/eslint clean at the checkpoint.** `npx tsc --noEmit -p .` and `npx eslint` on both changed files at `e2f8642` produced no errors/warnings.
  11. [OBS — non-blocking, informational] **`id="invitation-decline-note"` is a static string ID.** `InvitationResponse` is mounted exactly once per `[rfqId]` route today (confirmed single call site, `app/(app)/workspace/rfqs/[rfqId]/page.tsx`), so no duplicate-ID collision exists currently. Flagging only as a latent fragility if this component is ever reused twice on one page in the future — not an active defect, no action required now.
  12. [OBS] **"Appear at the top of your inbox" grounding confirmed.** The delta's stated rationale — fulfilling a promise already made by `QuotationHomeSummary` ("Invitations that need a response appear at the top of your inbox below") — is verified true; that copy is pre-existing and unchanged by this delta, and prior to this commit the inbox did not actually implement that ordering. This delta closes a genuine pre-existing UX gap rather than inventing new behavior.
- Review-B (Quality & Adversarial): **PASS**
  Findings: numbered, severity ladder BLOCKER/MAJOR/MINOR/NIT/OBS
  1. [OBS] **tsc/eslint/prettier independently re-verified clean at `e2f8642`.** `npx tsc --noEmit -p .` (full-repo), `npx eslint` on both changed files, and `npx prettier --check` on both changed files all ran with zero errors/warnings — confirms A's finding #10 independently rather than trusting it.
  2. [OBS] **Render-verified live, not just statically analyzed.** `npm run dev` (Next 15.5.19 / Turbopack) started clean on port 3001 (3000 was occupied by an unrelated process); both in-scope routes returned HTTP 200 (`/workspace/rfqs`, `/workspace/rfqs/test-rfq-123`). Playwright captured 6 screenshots (inbox + detail × desktop 1440/tablet 834/mobile 390) saved to `governanceReviews/milestones/fe-ven-05-rfq-workspace/`. As expected (no seed props passed at either call site), both routes render only the genuine-empty state — confirmed by design, not a defect, per the milestone's received-only/byte-equivalence pattern.
  3. [OBS] **Responsive D/T/M clean at both routes.** No overflow, truncation, or layout breakage at any of the 3 breakpoints on either page; the detail page's two-column grid (`RfqSnapshot` + `InvitationResponse`) collapses to a single column below `lg` as expected, and the Decline button + its consequence note stay visually adjacent at every width (screenshots on file).
  4. [OBS] **Sort/group logic hand-traced independently and confirmed correct.** Built a disposable local harness (deleted after use, never committed) transcribing `needsResponse`/`byInformationHierarchy` verbatim and ran 5 sample `InboxItemView` rows with mixed `invitation_state`/`window_urgency`, including an edge case with both fields `undefined`. Result: `delivered` rows sort first ordered `imminent → soon → normal` (C, E, B), followed by non-delivered/undefined-state rows in original relative order (A, D) — matches Review-A's finding #7 exactly. Union size (5) == input size (5), no overlap between `needsResponseItems`/`otherItems`, no row dropped or duplicated, no crash on `undefined` urgency/state.
  5. [OBS] **No dead code, no duplicate components, no unused imports in either changed file.** The extracted `InvitationRow` function, and the new `needsResponse`/`byInformationHierarchy`/`URGENCY_RANK`/`UNRANKED_URGENCY` symbols in `invitation-inbox.tsx`, are each used exactly once, only within this file (confirmed via repo-wide grep — no other file references them, ruling out an accidental parallel copy). The `WindowUrgency` type-only import addition is consumed by `URGENCY_RANK`'s `Record<WindowUrgency, number>`. `invitation-response.tsx`'s diff is fully additive (`className`, `aria-describedby`, moved `id`) with no orphaned old code left behind.
  6. [OBS] **Extracted `InvitationRow` JSX is byte-identical to the pre-delta inline block.** Diffed the new standalone function's JSX body against the removed inline `<li>...</li>` block from the old single-list render path — identical markup, classNames, and prop wiring, just parameterized by `{ item, basePath }`. This is a pure extract-function refactor, not a rewrite; rules out drifted-copy risk.
  7. [OBS] **`aria-describedby` reference re-confirmed non-orphaned by direct render inspection, not just source reading.** The live Playwright render at all 3 breakpoints shows the "Decline" button and the `id="invitation-decline-note"` paragraph both present and adjacent in the not-responded branch (the only branch queried, since `invitation` prop is undefined in the current call site → `responded` evaluates false) — visually confirms A's finding #9's static-analysis claim.
  8. [OBS] **Colour-only status check: pass.** The new `text-destructive`/`hover:text-destructive` styling on the Decline button is paired with the literal text label "Decline" (confirmed in the desktop/tablet/mobile screenshots) — status/consequence is never conveyed by colour alone. `variant="outline"` is unchanged (no new visual affordance beyond the label's own text colour), so this is a low-risk, appropriately incremental treatment.
  9. [OBS] **Keyboard/tab order unaffected by the JSX restructure.** `invitation-inbox.tsx`'s only interactive element per row is the row's own `<Link>` (unchanged focus-visible ring classes, verbatim in the extracted component); grouping only wraps rows in additional non-interactive `<div>`/`<p>` containers, which do not enter the tab sequence. `invitation-response.tsx`'s two buttons and one link keep their original DOM order; only `className`/`aria-describedby`/`id` attributes were added, no element reordering.
  10. [OBS] **Cross-team regression: none.** `git diff --stat c509934~1..e2f8642` confirms exactly 2 files changed, both inside `app/(app)/_components/vendor/rfq/`; `git diff --name-only c509934~1..e2f8642` grep-excluded against that same path returns empty — no adjacent surface (buyer, public, shared kit, other vendor pages) is touched.
  11. [OBS] **Code-quality read: consistent with surrounding file style.** The new sort/group helpers use the same conventions as the rest of the file (small named functions, JSDoc-style one-line comments above non-obvious logic, no premature abstraction) — `URGENCY_RANK`/`UNRANKED_URGENCY` module-level constants mirror the existing pattern of hoisting lookup tables out of the render path (cf. `state-chips.tsx` in the same directory). The `showGroups` short-circuit (skip group labels when everything's in one bucket) is a good, minimal touch — avoids label noise on trivial lists without adding a new code path shape.
  12. [OBS] **Dev server and scratch artifacts cleaned up.** Playwright verification script and the sort hand-trace harness were written to the session scratchpad only (one copy was transiently placed at repo root to resolve `node_modules`, then deleted immediately after running — confirmed absent from `git status`); the `next dev` process (port 3001) was terminated at the end of the review. Working tree post-review shows only the pre-existing tracker-file modifications plus the 6 new screenshots — no implementation file touched.
- Disposition (author/authority): all 24 findings (12 A + 12 B) are **[OBS]** — neutral/no-action
  observations under the severity ladder (CLAUDE.md §13); none is BLOCKER/MAJOR/MINOR/NIT, so none
  requires the Validate-Findings gate's action path. Two are explicitly flagged non-blocking by
  the reviewers themselves (A#11 latent-fragility watch item on a static `aria` id; B#12 cleanup
  confirmation) — recorded, no ticket needed.
- Board: **APPROVED** (owner, 2026-07-02) — gate confirmed A:PASS ∧ B:PASS, BLOCKER=MAJOR=MINOR=0.
- Result: milestone → **✅ Closed**. Milestone-close commit: `milestone(FE-VEN-05): close — RV-0101 A:PASS B:PASS board-approved`. Queue holds at Team-3's request — FE-VEN-06 kickoff not authorized this cycle.
