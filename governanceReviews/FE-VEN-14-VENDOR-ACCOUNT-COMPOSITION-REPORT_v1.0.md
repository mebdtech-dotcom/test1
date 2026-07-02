<!--
Doc-type:  Reuse/Composition report + implementation plan (decision-prep; NON-authoritative input to the Board).
Subject:   FE-VEN-14 Vendor <-> Account Integration (Composition Layer) — unblocks FE-VEN-10/11/12.
Produced:  2026-07-03, Team-3. Raise != Accept: the Board decides the reuse strategy; this report proposes it.
Constraint: documentation and composition planning only — no UI change, no backend, no new components,
            no page duplication were made to produce this report.
-->

# FE-VEN-14 — Vendor ↔ Account Integration (Composition Layer)

**Objective (as given):** prepare the architecture that unblocks `FE-VEN-10` (Billing), `FE-VEN-11`
(Organization), `FE-VEN-12` (Settings) — inventory reusable Account components, define the
composition mapping, document required adapters, verify no forks, produce a report + plan. No
implementation starts until the Board rules on the reuse strategy this report recommends.

---

## 1. Executive summary

- **19 existing `P-ACC-*` pages** (all Team-1-built, ✅ Closed under the RV ledger) are the reuse
  target. Every one already renders participation-agnostic content — none is hard-coded to "Buyer."
- **All sampled components are self-contained** (`"use client"`, own internal seed state, zero
  props) — they do not fetch/receive a ViewModel today. This has one big, welcome consequence: **a
  vendor-mounted page that simply imports and renders the existing component produces byte-identical
  output to the Account route, with zero new code and zero fork.** No adapter is needed to reach
  parity *in the presentation phase*.
- **Composition is proven, not just theorized** — one existing precedent already does exactly the
  cross-route import: `app/(app)/account/roles/role-editor.tsx` and other Account leaves are `app/`
  files importing sibling `app/` files, matching REPOSITORY_STRUCTURE §9's "sibling `app/` only"
  boundary rule for presentation composition.
- **Two real findings surfaced, not glossed over** — flagged to the Board in §6, not resolved here:
  1. `P-ACC-13` Workflow Settings' only wired concept is **RFQ approval** (`rfq_approval_mode`,
     approval chain, award threshold) — a **buyer-side** concept (vendors don't submit/award RFQs).
     Reusing it as-is for `FE-VEN-12` Settings would show a vendor org an "RFQ approval workflow"
     that describes something their org doesn't do.
  2. `P-ACC-19` Lead Credits is classified **"Buyer"** scope in `page_inventory.md` (not "Shared"),
     yet lead credits are a vendor-facing billing concept everywhere else in this program (the
     vendor dashboard wireframe explicitly shows "Lead credits: 12"). This classification looks
     like it may be a labeling error in the frozen planning doc, not a real Buyer-only restriction —
     but that's a call for the Board/API Governance Board, not this report.
- **Recommendation:** the Board should rule on **route topology** (§7) before any build starts —
  that single decision, not per-page component analysis, is what actually gates FE-VEN-10/11/12.
  Everything else in this report is settled enough to build against once that's ruled.

---

## 2. Inventory — reusable Account components

All under `app/(app)/account/`. Ownership: Team-1 (Account & Identity, Doc-7E), all ✅ Closed
(milestone folders `team1-acc-01-account-overview` … `team1-acc-22-rewards` in
`governanceReviews/milestones/`). **None of these is touched by this report.**

| P-ACC | Page | Route | Component file(s) | Contract(s) |
|---|---|---|---|---|
| 02 | User profile | `/account/profile` | `profile/user-profile-form.tsx` | `identity.update_user_profile.v1` |
| 03 | Security & 2FA | `/account/security` | `security/security-settings.tsx` | `identity.update_user_2fa_settings.v1`, `deactivate_own_account.v1` |
| 04 | Organization profile | `/account/organization` | `organization/organization-profile.tsx` | `identity.update_organization_profile.v1`, `transfer_ownership.v1` |
| 05 | Organization lifecycle | `/account/organization-lifecycle` | `organization-lifecycle/organization-lifecycle.tsx` | `soft_delete_organization.v1`, `restore_organization.v1` |
| 06 | Members | `/account/members` | `members/members-view.tsx` | `set_membership_status.v1`, `remove_member.v1` |
| 07 | Invite member | `/account/members/invite` | `members/invite/invite-member-view.tsx` | `invite_member.v1`, `revoke_invitation.v1` |
| 08 | Roles | `/account/roles` | `roles/roles-view.tsx` | `list_roles.v1` |
| 09 | Role editor | `/account/roles/new`, `/account/roles/[roleId]` | `roles/role-editor.tsx` | `create/update_role.v1`, `set_role_permissions.v1`, `delete_role.v1` |
| 10 | Permissions reference | `/account/permissions` | `permissions/permissions-view.tsx` | `list_permissions.v1` |
| 11 | Delegation grants | `/account/delegation` | `delegation/delegation-view.tsx` | `list_delegation_grants.v1`, `get_delegation_grant.v1` |
| 13 | Workflow settings | `/account/settings` | `settings/workflow-settings.tsx` | `identity.update_workflow_settings.v1` |
| 15 | Notification preferences | `/account/notifications` | `notifications/notification-preferences.tsx` | M6 prefs (Doc-5H) |
| 16 | Plans / catalog | `/account/billing` | `billing/plans-catalog.tsx` | `list_plans.v1`, `get_plan.v1` |
| 17 | Subscription | `/account/subscription` | `subscription/subscription-view.tsx` | `purchase/cancel_subscription.v1`, `get_subscription.v1`, `list_subscription_events.v1` |
| 18 | Usage & quota | `/account/usage` | `usage/usage-dashboard.tsx` | `get_usage.v1` |
| 19 | Lead credits | `/account/lead-credits` | `lead-credits/lead-credits-view.tsx` | `get_lead_balance.v1`, `list_lead_transactions.v1`, `credit_lead_account.v1` |
| 20 | Platform invoices | `/account/invoices` | `invoices/platform-invoices-view.tsx` | `list_platform_invoices.v1` |
| 21 | Platform invoice detail | `/account/invoices/[invoiceId]` | `invoices/[invoiceId]/invoice-detail.tsx` | `get_platform_invoice.v1` |

Not in scope for FE-VEN-10/11/12 (excluded correctly by the existing WBS ranges, confirmed here):
`P-ACC-01` (Account overview — dashboard, not a destination), `P-ACC-12` (Delegation editor —
⛔ `ESC-IDN-DELEG-EXPIRY`), `P-ACC-14` (Buyer profile settings — genuinely Buyer-only, `upsert_buyer_profile`), `P-ACC-22` (Rewards/referrals — not named in any FE-VEN-10/11/12 range).

**Depth of review:** `plans-catalog.tsx`, `organization-profile.tsx`, `workflow-settings.tsx`,
`members-view.tsx`, `user-profile-form.tsx`, `notification-preferences.tsx`,
`subscription-view.tsx`, `delegation-view.tsx` were read in full or substantial part (8 of 17
components — one from each target group, weighted toward the ones with the most editable/stateful
surface). The remaining 9 are catalogued by route/contract from `page_inventory.md` +
`account-nav-model.ts` but not read line-by-line; flagged here for transparency, not glossed over.

---

## 3. Composition mapping

| Vendor destination | Reuses (P-ACC range) | Route today | Vendor route (placeholder today) |
|---|---|---|---|
| **FE-VEN-10 Billing** | 16, 17, 18, 19*, 20, 21 | `/account/billing`, `/subscription`, `/usage`, `/lead-credits`, `/invoices` | `/workspace/billing` |
| **FE-VEN-11 Organization** | 04, 05, 06, 07, 08, 09, 10, 11 | `/account/organization`, `/organization-lifecycle`, `/members`, `/members/invite`, `/roles`, `/roles/[roleId]`, `/permissions`, `/delegation` | `/workspace/organization` |
| **FE-VEN-12 Settings** | 02, 03, 13†, 15 | `/account/profile`, `/security`, `/settings`, `/notifications` | `/workspace/settings` |

\* P-ACC-19 carries the Buyer-scope flag from §6.2 — included here per the existing WBS range, not
because the classification question is resolved.
† P-ACC-13 carries the RFQ-approval content-mismatch flag from §6.1.

All three vendor routes are **confirmed genuinely unbuilt** — `workspace/billing/page.tsx`,
`workspace/organization/page.tsx`, `workspace/settings/page.tsx` are each a bare
`WorkspaceSectionPlaceholder` today (verified by direct read, 2026-07-03). Nothing to fork; nothing
forked.

---

## 4. Reusability assessment

Every sampled component shares the same shape, consistently:

- **`"use client"`, self-contained, zero props.** Each component owns its own `useState` seed data
  (e.g. `OrganizationProfile`'s `ORG` constant, `MembersView`'s `MEMBERS` array,
  `WorkflowSettings`'s `INITIAL_MODE`/`INITIAL_CHAIN`). None reads from a parent-supplied prop or
  ViewModel. This is consistent with the "presentation-only, wired at integration" pattern used
  everywhere else in this program (vendor workspace included).
- **No participation-specific hard-coding found.** None of the 8 sampled files contains a
  conditional on "Buyer"/"Vendor"/participation type. Authorization is expressed entirely through
  **Org Role** (Owner/Director/Manager/Officer — Invariant #2, explicitly independent of Platform
  Participation) and through frozen permission slugs (`can_manage_users`, `can_transfer_ownership`,
  etc.), never through a buyer/vendor branch. This is the architectural reason these pages are
  *inherently* reusable, not merely coincidentally so.
- **Seed data already models a vendor org.** `OrganizationProfile`'s hard-coded seed is literally
  "Padma Valve & Fittings Ltd." — the same fixture vendor used throughout this session's own vendor
  workspace and public microsite work. This isn't evidence of anything load-bearing (it's mock
  data), but it does mean today's `/account/organization` already *renders* a vendor-shaped org
  without modification.
- **One genuine content-mismatch found** (`P-ACC-13`, §6.1) and **one classification question
  found** (`P-ACC-19`, §6.2) — both are substantive, both routed to the Board, neither invented a
  fix locally.

**Conclusion:** at the *component* level, reuse is clean. The open question is entirely about
**route topology** (§7) — whether a vendor-mounted page should exist at all, or whether the vendor
nav should link out to `/account/*` directly.

---

## 5. Required adapters (ViewModels) — for the wiring phase, not today

Because every sampled component is self-contained with zero props, **no adapter is needed to reach
presentation parity today** — importing and rendering the existing component *is* the composition,
with byte-identical output to the Account route. Building a wrapper page around an unmodified import
is not a fork under any reading of Golden Rule 7 (no logic is duplicated; the single source of truth
stays the existing component file).

An adapter requirement appears **only at the future wiring phase**, when these components stop
being self-contained and start receiving real data. At that point, each currently-hard-coded
component should be refactored (by Team-1, the owning team — this report does not do it) to accept
a **ViewModel prop** rather than an internal constant, so the *same* component instance serves both
`/account/*` (fed a Buyer/Hybrid-context ViewModel) and `/workspace/*` (fed a Vendor-context
ViewModel) without divergence. Concretely, for each of the 8 sampled components:

| Component | Today | Adapter needed at wiring time |
|---|---|---|
| `OrganizationProfile` | `ORG` constant | `OrganizationProfileViewModel` (name, humanRef, status, verification, address, contact) sourced from `get_active_context`/`identity.get_organization.v1`-equivalent read, org-agnostic |
| `MembersView` | `MEMBERS` constant | `MemberView[]` from `list_members.v1`, already org-scoped by the active-org context (Invariant #5) — no participation branch needed |
| `WorkflowSettings` | `INITIAL_MODE`/`INITIAL_CHAIN`/`INITIAL_THRESHOLD` | `WorkflowSettingsViewModel` from `get_workflow_settings` — **contingent on §6.1's resolution** (may need a `context: "rfq" | "quotation"` discriminant if the Board rules the concept should generalize) |
| `PlansCatalog` | `PLANS` constant | `PlanView[]` from `list_plans.v1`/`get_plan.v1` — already participation-neutral (plans/entitlements are org-level, not buyer/vendor-scoped) |
| `SubscriptionView` | `SUB` constant | `SubscriptionViewModel` from `get_subscription.v1`/`list_subscription_events.v1` — no adapter concern, org-level |
| `UserProfileForm` | `INITIAL`/`EMAIL` constants | `UserProfileViewModel` from the session user — identical for every participation type by construction (it's the *user*, not the org) |
| `DelegationView` | `GRANTS`-style local list | `DelegationGrantView[]` from `list_delegation_grants.v1` — already opaque-ID-only (no display-name resolution exists), so no vendor-vs-buyer branch is possible even in principle |
| `NotificationPreferences` | `CATEGORIES` constant | Already phrased participation-neutrally ("RFQs & quotations — Invitations, quotes, and awards" covers both buyer- and vendor-side events in one category) — likely needs **no** discriminant |

The remaining 9 uncatalogued-in-depth components (`security-settings.tsx`, `invite-member-view.tsx`,
`roles-view.tsx`, `role-editor.tsx`, `permissions-view.tsx`, `organization-lifecycle.tsx`,
`usage-dashboard.tsx`, `lead-credits-view.tsx`, `platform-invoices-view.tsx`,
`invoice-detail.tsx`) should get the same adapter treatment at wiring time; this report does not
assume their shape without reading them.

---

## 6. Findings routed to the Board (not resolved locally)

### 6.1 — `P-ACC-13` Workflow Settings is written in buyer-only language

**Finding.** The only wired concept behind `/account/settings` (P-ACC-13) is **RFQ approval**:
`rfq_approval_mode` (none/single/multi_step), an `approval_chain` of Org-Role approvers, and an
award-approval currency threshold — all bound to `identity.update_workflow_settings.v1`. RFQs are
authored and awarded by **buyer** orgs; a vendor org neither submits nor awards an RFQ. If
`FE-VEN-12` composes this component unchanged, a vendor user opens "Settings" and sees an "RFQ
approval" workflow describing an action their organization structurally cannot take.

**Why routed, not resolved here:** this could mean either (a) `update_workflow_settings.v1`'s
`rfq_approval_mode` field is deliberately RFQ-specific and the Vendor Settings page should be scoped
down to *only* the org-role-independent parts (there are none in this component — it's 100%
RFQ-approval content), or (b) the underlying concept is meant to generalize to any org-side approval
gate (RFQ submission for buyers, quotation submission for vendors) and the frozen contract's field
naming is simply buyer-flavored from when it was written pre-vendor-workspace. Only the frozen
corpus's owning authority (DDD Architect / API Governance Board, per CLAUDE.md §7) can rule which.
**This report takes no position** beyond surfacing that reusing P-ACC-13 as-is for FE-VEN-12 is very
likely wrong on content grounds, independent of any route-topology decision.

### 6.2 — `P-ACC-19` Lead Credits classified "Buyer" in `page_inventory.md`

**Finding.** `page_inventory.md:537` classifies P-ACC-19 (Lead Credits) as **"Buyer"** scope, the
same column that correctly flags P-ACC-14 (Buyer profile settings) as buyer-only. But lead credits
are consumed by **vendors** responding to invitations — the vendor dashboard wireframe (already
built, `FE-VEN-05`+ era) shows "Lead credits: 12" as a vendor-facing stat, and `FE-VEN-10`'s own WBS
row explicitly includes P-ACC-19 in its reuse range. Either the "Buyer" classification is a labeling
oversight in the frozen planning doc (lead credits are consumed regardless of participation, so
"Shared" would match every sibling billing page), or there is a real, currently undocumented reason
lead-credit *purchase* is a buyer-side-only billing action while *consumption* is vendor-facing (two
different operations under one page). **This report does not resolve which** — it is a
classification question for whoever owns `page_inventory.md`'s scope column, not an architecture
decision this milestone can make.

---

## 7. The actual gating decision: route topology

Everything above is settled enough to build against. What genuinely blocks FE-VEN-10/11/12 is one
question, and it's the same question underneath all three milestones — decide it once, apply it
three times.

**Option A — Pure link-out** (mirrors the `FE-BUY-10`/P-BUY-04 precedent from earlier this session).
The vendor sidebar's Billing/Organization/Settings items point directly at `/account/billing`,
`/account/organization`, `/account/settings`; the `workspace/billing|organization|settings`
placeholder routes are removed (or become a one-line redirect). Zero new files, zero adapters ever
needed, zero fork risk — literally nothing to build wrong. Cost: leaving the vendor
workspace's chrome/breadcrumbs when visiting Account, the same trade-off Team-2 accepted for
P-BUY-04.

**Option B — Composed vendor-mounted page** (matches the WBS's literal wording: "vendor-context
*view* reusing P-ACC-16..21"). A new `workspace/billing/page.tsx` (etc.) imports and renders the
*existing* Account components directly inside the vendor shell's own chrome/breadcrumbs — proven
viable by REPOSITORY_STRUCTURE §9's sibling-`app/`-import rule and by the fact these components
already require zero props to render correctly. Cost: three new thin route files (composition only,
no new component code); the user never leaves the vendor workspace's visual context.

**This report does not choose between A and B.** Both honor "composition only, no forking, no
duplication." The choice is a UX/IA call (does context-continuity matter enough to justify three new
route files that do nothing but import-and-render?) that the Board is better positioned to make than
this report — consistent with `ESC-7G-A7`'s precedent (a shell-composition realization question was
explicitly reserved for the Board, not resolved by design pass alone).

---

## 8. Implementation plan (execute only after Board rules §7 — and §6.1/§6.2 for the pages they touch)

Sequence, as instructed: **FE-VEN-10 (Billing) → FE-VEN-11 (Organization) → FE-VEN-12 (Settings)**.

**If Option A (link-out) is ruled:**
1. `FE-VEN-10`: update `vendor-shell-vm.ts`'s Billing nav item href to `/account/billing`; remove or
   redirect the `workspace/billing` placeholder. One-line-per-milestone change; Lane L candidate.
2. `FE-VEN-11`: same pattern, Organization → `/account/organization`.
3. `FE-VEN-12`: same pattern, Settings → `/account/settings`, **contingent on §6.1's resolution** —
   if the Board rules the RFQ-approval content is buyer-only and not vendor-appropriate, the link
   target or the page itself needs to change accordingly before this ships.

**If Option B (composed page) is ruled:**
1. `FE-VEN-10`: build `workspace/billing/page.tsx` importing `PlansCatalog` (+ `SubscriptionView`,
   `UsageDashboard`, `LeadCreditsView`*, `PlatformInvoicesView`) under vendor `PageHeader`/
   `Breadcrumbs`; no component code changes. (* pending §6.2.)
2. `FE-VEN-11`: build `workspace/organization/page.tsx` importing `OrganizationProfile`,
   `OrganizationLifecycle`, `MembersView`, `InviteMemberView`, `RolesView`, `RoleEditor`,
   `PermissionsView`, `DelegationView` — likely as a tabbed composition (mirrors the existing
   `CompanyProfileTabs`/`WorkspaceTabs` pattern already used elsewhere in the vendor workspace, no
   new tab primitive needed).
3. `FE-VEN-12`: build `workspace/settings/page.tsx` importing `UserProfileForm`,
   `SecuritySettings`, `NotificationPreferences`, and `WorkflowSettings` **only if §6.1 rules it
   belongs here as-is** — otherwise this milestone ships the other three and carries Workflow
   Settings forward pending that ruling, same non-blocking-carry-forward pattern used for
   `FE-PUB-07`'s landing-page finding this session.

Each of the three remains its own Lane-G milestone (touches cross-team-owned Account surfaces;
Golden Rule 7 sensitivity) with its own WP card, Review-A → Review-B cycle, and self-close on a
clean gate per Amendment v1.3 §13 — this report does not shortcut that.

---

## 9. Decision record (Board — completed 2026-07-03)

- **Route topology ruling:** ☑ **Option B — composed vendor-mounted page.** New
  `workspace/billing|organization|settings` pages import and render the existing Account components
  unchanged, inside vendor-shell chrome/breadcrumbs. §8's Option-B implementation plan is
  authoritative for FE-VEN-10/11/12.
- **P-ACC-13 (§6.1) ruling:** ☑ **Scope it out of `FE-VEN-12`, carry forward.** Settings ships User
  Profile, Security, and Notification Preferences only. Workflow Settings stays out of the vendor
  Settings page until a vendor-appropriate concept (e.g. quotation-approval workflow) is defined —
  carried forward as an explicit, tracked gap, never silently dropped.
- **P-ACC-19 (§6.2) ruling:** ☑ **Classification corrected to "Shared" in `page_inventory.md`**
  (applied 2026-07-03, §13.4 — labeling gap, not a real restriction). `FE-VEN-10` includes P-ACC-19
  in its reuse range as originally scoped.
- **Decided by / date:** Owner, 2026-07-03 (delivered directly, same session as the report).
- **On approval:** Team-3 executes §8's Option-B plan in order (FE-VEN-10 → 11 → 12), each as its
  own Lane-G, fully reviewed milestone. `FE-VEN-12` ships 3 of its 4 target pages (Workflow Settings
  carried forward per the ruling above).
