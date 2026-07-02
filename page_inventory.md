# iVendorz — Page Inventory

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Page Inventory (non-authoritative companion; the **single source for per-page planning metadata**)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (foundation)
**Companions:** [`shared_conventions.md`](shared_conventions.md) (**SC** — planning vocab, presets, cross-ref codes) · [`design_philosophy.md`](design_philosophy.md) · [`information_architecture.md`](information_architecture.md) · [`ux_patterns.md`](ux_patterns.md) · [`marketplace_ux.md`](marketplace_ux.md) · [`page_templates.md`](page_templates.md) (**PT** — `T-*`) · [`esc_registry.md`](esc_registry.md) (**ER**) · [`glossary.md`](glossary.md) (**GL**)
**Revision v0.3:** governance refactor — §13 extended into the **single planning matrix** (adds `Complexity · Priority · Interaction · Visual-hierarchy` from `SC §8` to the existing Actor/Devices/Search/Nav for all 144 pages); §11 ESC register replaced by a pointer to `ER`; a **Depends-on rule** stated once; cross-refs migrated to `SC §6` codes. Inventory tables (§2–§8) and the §12 Master Navigation Matrix are **unchanged**. Coins nothing.

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion**. It **enumerates every page** of the product and slots each into a
surface (`IA §6`), a journey step (`MX` `J-*`), a template (`PT` `T-*`), and the **wired Doc-5
contract(s)** it binds; v0.3 also makes it the **single home for per-page planning metadata** (§13). It
**coins no architecture, route, contract, page, or ESC tag** — pages needing an absent contract point
at the handle in [`ER`](esc_registry.md) (§11), never invent one.

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

- Page IDs (`P-*`) and routes are **document-internal handles + illustrative segments**; the
  authoritative route topology is **Doc-7C / Doc-7D…7H**. **Routes carry opaque IDs (UUIDs), never human
  refs** (`IA §8`); human refs like `RFQ-2026-000123` are display labels only.
- **On any conflict, the frozen corpus wins and this doc is corrected** (CLAUDE.md §7, §11). ESC handles
  are defined once in [`ER`](esc_registry.md); terms in [`GL`](glossary.md).

> **Scope of this inventory:** the *complete page list* — the unit that `PT` turns into templates and
> `SS` turns into screens. **Page-level**, not component- or state-level: loading / empty / error /
> not-found are **pattern states** (`UX §4`) of each page, not separate inventory rows; the command
> palette, org-switcher, toasts, and most create/edit modals are **overlays/components**, not pages.

---

## 1. Purpose & Scope

### 1.1 Legend

- **Template** (`PT §0.1` `T-*`; `DP §6` names): `Landing · Listing · Details · Wizard · Settings ·
  Dashboard · Analytics · Management · Auth` (+ `Static` marketing, `State` system page). Each value
  resolves 1:1 to a `PT` template ID.
- **Binds:** the wired Doc-5 contract(s) or source the page reads/writes (by pointer).
- **Journey:** the Marketplace UX step(s) (`MX` `J-*`) the page realizes.
- **⚠ ESC:** the page (or part of it) depends on a gap in the frozen wired surface — handle defined in
  [`ER`](esc_registry.md); referenced here, never re-explained.

Forward-looking per-page attributes are **consolidated in the §13 planning matrix** (the single source
used by `PT`/`SS` + permissions/analytics/testing/search). Their vocabularies are owned by `SC §8`:

- **Actor** (audience): `Guest · Shared · Buyer · Vendor · Admin`. **Audience metadata only — NOT an
  authorization source.** Real access is server-validated per wired contract (Invariant #10/#7).
- **Devices** (`SC §8`): `D` desktop · `T` tablet · `M` mobile · `F` future. The shell is mobile-first
  (`IA §7`); this records the *intended* surface set per page.
- **Search** (indexing/AI priority): `Critical · Frequent · Occasional · Rare`.
- **Nav class:** `Primary` (left-nav/top-nav) · `Secondary` (sub-page) · `Contextual` (reached from
  another page) · `Hidden` (states/auth). Presentation only — gated by nav derivation (`IA §4.1`).
- **Complexity · Priority · Interaction · Visual-hierarchy** (`SC §8`): added in v0.3 — see §13.

### 1.2 Summary counts

| Surface | Prefix | Doc | Pages |
|---|---|---|---|
| Cross-cutting / Shell | `P-SH` | 7C | 6 |
| Public | `P-PUB` | 7D | 24 |
| Auth-entry | `P-AUTH` | 7E (auth) | 8 |
| Account & Identity | `P-ACC` | 7E (app) | 22 |
| Buyer Workspace | `P-BUY` | 7F | 27 |
| Vendor Workspace | `P-VND` | 7G | 28 |
| Admin Console | `P-ADM` | 7H | 29 |
| **Total** | | | **144** |

*(In the 120–180 envelope. Counts are pages; realized screen count is higher once per-page states and
modals are added — those are pattern states, not inventory rows.)*

---

## 2. Cross-cutting / Shell — `P-SH-*` (Doc-7C)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-SH-01 | Global search results | Listing | `search_catalog` / surface list reads | all | Presentation; never re-ranks M3 |
| P-SH-02 | Notification center (full) | Listing | M6 `Doc-5H` reads; `mark_notification_read`, `archive_notification` | all | Non-disclosure-bound; Realtime=transport |
| P-SH-03 | Not-found (404) | State | — | all | **Byte-identical to genuine absence** (Doc-7A §8.2) |
| P-SH-04 | Error (500) | State | — | all | Branch on `error_class`; surface `reference_id` |
| P-SH-05 | Maintenance / unavailable | State | — | all | — |
| P-SH-06 | Forbidden | State | — | all | Collapses to 404 where no right-to-know |

> Not pages: command palette, org-switcher, toasts (overlays/components — `UX §3.1`/`§4.5`).

---

## 3. Public Surface — `P-PUB-*` (Doc-7D · Doc-5D public projection)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-PUB-01 | Home / Landing | Landing | marketing | J-GST-01 | SEO-first, light |
| P-PUB-02 | About | Static | — | J-GST-01 | |
| P-PUB-03 | How it works | Static | — | J-GST-01 | |
| P-PUB-04 | Pricing / Plans (public) | Static | `list_plans` (read) | J-GST-01 | Marketing of plans |
| P-PUB-05 | For Buyers (segment) | Static | — | J-GST-01 | |
| P-PUB-06 | For Vendors (segment) | Static | — | J-GST-01 | |
| P-PUB-07 | Categories index | Listing | `search_catalog` facets | J-GST-02 | ⚠ `ESC-7-API-CATNAV` (`ER`) |
| P-PUB-08 | Category page | Listing | `search_catalog` facet | J-GST-02 | ⚠ `ESC-7-API-CATNAV` (`ER`) |
| P-PUB-09 | Industry page | Listing | `search_catalog` facet | J-GST-02 | ⚠ `ESC-7-API-CATNAV`; industry taxonomy not modeled (`ER` · `GL`) |
| P-PUB-10 | Catalog search results | Listing | `search_catalog` | J-GST-03 | |
| P-PUB-11 | Product detail (public) | Details | — | J-GST-03 | ⚠ `ESC-7-API-PRODDETAIL` (`ER`); interim from `search_catalog` |
| P-PUB-12 | Vendor directory | Listing | `list_vendor_directory` | J-GST-03 | |
| P-PUB-13 | Vendor profile / microsite | Details | `get_public_vendor_profile` + trust badge (M5) | J-GST-04 | Published-only; trust read-only |
| P-PUB-14 | Microsite — Products | Listing | `get_public_vendor_profile` / `search_catalog` (vendor-scoped) | J-GST-04 | |
| P-PUB-15 | Microsite — Projects/Portfolio | Details | `get_public_vendor_profile` | J-GST-04 | |
| P-PUB-16 | Microsite — Capabilities/About | Details | `get_public_vendor_profile` | J-GST-04 | Capability = 4-flag matrix |
| P-PUB-17 | Microsite — Contact / enquiry | Details | conversion → `(auth)` | J-GST-06 | |
| P-PUB-18 | Trust & verification explainer | Static | — | J-GST-04 | |
| P-PUB-19 | Industrial / advanced search | Listing | `search_catalog` | J-GST-03 | FTS now |
| P-PUB-20 | Compare (public) | Details | public reads | J-GST-05 | Ungoverned; no matching/recommendation |
| P-PUB-21 | Legal — Terms | Static | — | — | |
| P-PUB-22 | Legal — Privacy | Static | — | — | |
| P-PUB-23 | Resources / Blog | Static | — | J-GST-01 | Optional, SEO |
| P-PUB-24 | Contact / Support (public) | Static | — | — | |

> Public has **zero concept of buyer-private status** (Invariant #11). Ads not rendered anonymously →
> `ESC-7-API-ADS` (`ER`).

---

## 4. Auth-entry — `P-AUTH-*` (Doc-7E · `(auth)`)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-AUTH-01 | Login | Auth | Supabase Auth | J-BUY-01 / J-VND | |
| P-AUTH-02 | Signup | Auth | Supabase Auth | J-GST-06 | |
| P-AUTH-03 | Org setup (post-signup) | Wizard | `create_organization` | J-BUY-02 | Every user ≥1 org |
| P-AUTH-04 | Password reset — request | Auth | Supabase Auth | — | |
| P-AUTH-05 | Password reset — confirm | Auth | Supabase Auth | — | |
| P-AUTH-06 | 2FA challenge | Auth | Supabase / `update_user_2fa_settings` | — | |
| P-AUTH-07 | Accept invitation / join org | Auth | `accept_invitation` | J-BUY-05 | |
| P-AUTH-08 | Email verification | Auth | Supabase Auth | — | |

> No session may be held while authenticating — `(auth)` is distinct from `(app)` (Doc-7C §2.1).

---

## 5. Account & Identity — `P-ACC-*` (Doc-7E · `(app)` · Doc-5C / Doc-5I)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-ACC-01 | Account overview | Dashboard | reads | — | |
| P-ACC-02 | User profile | Settings | `update_user_profile` | J-BUY | |
| P-ACC-03 | Security & 2FA | Settings | `update_user_2fa_settings`, `deactivate_own_account` | — | |
| P-ACC-04 | Organization profile | Settings | `update_organization_profile`, `transfer_ownership` | J-BUY | |
| P-ACC-05 | Organization lifecycle | Settings | `soft_delete_organization`, `restore_organization` | — | Soft-delete (Invariant #8) |
| P-ACC-06 | Members | Listing | `set_membership_status`, `remove_member` | J-BUY-05 | |
| P-ACC-07 | Invite member | Settings | `invite_member`, `revoke_invitation` | J-BUY-05 | |
| P-ACC-08 | Roles | Listing | `list_roles` | J-BUY-05 | |
| P-ACC-09 | Role editor | Settings | `create_role`, `update_role`, `set_role_permissions`, `delete_role` | J-BUY-05 | |
| P-ACC-10 | Permissions reference | Listing | `list_permissions` | — | Permissions by reference (Invariant #10) |
| P-ACC-11 | Delegation grants | Listing | `list_delegation_grants`, `get_delegation_grant` | — | |
| P-ACC-12 | Delegation grant editor | Settings | `create/suspend/revoke_delegation_grant` | — | ⚠ reinstate pending (`ESC-IDN-DELEG-EXPIRY` · `ER`) |
| P-ACC-13 | Workflow settings | Settings | `update_workflow_settings` | J-BUY-04 | Approval chain + award threshold |
| P-ACC-14 | Buyer profile settings | Settings | `upsert_buyer_profile` | J-BUY-04 | |
| P-ACC-15 | Notification preferences | Settings | M6 prefs (`Doc-5H`) | — | |
| P-ACC-16 | Plans / catalog | Listing | `get_plan`, `list_plans` | J-BUY-06 | |
| P-ACC-17 | Subscription | Details | `purchase_subscription`, `cancel_subscription`, `get_subscription`, `list_subscription_events` | J-BUY-06 | Entitlements, not plan-name (Invariant #10) |
| P-ACC-18 | Usage & quota | Dashboard | `get_usage` | — | |
| P-ACC-19 | Lead credits | Listing | `get_lead_balance`, `list_lead_transactions`, `credit_lead_account` | — | |
| P-ACC-20 | Platform invoices | Listing | `list_platform_invoices` | — | Platform-fee only ≠ trade invoices |
| P-ACC-21 | Platform invoice detail | Details | `get_platform_invoice` | — | |
| P-ACC-22 | Rewards / referrals | Dashboard | `get_reward_balance`, `list_referrals` | — | |

---

## 6. Buyer Workspace — `P-BUY-*` (Doc-7F · Doc-5E / Doc-5F / Doc-5D)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-BUY-01 | Buyer dashboard | Dashboard | reads | J-PROC-01 | KPI cards (`UX §6.2`) |
| P-BUY-02 | Discover vendors | Listing | `search_catalog`, `list_vendor_directory` | J-PROC-01 | |
| P-BUY-03 | Vendor directory (in-app) | Listing | `list_vendor_directory` | J-PROC-01 | |
| P-BUY-04 | Vendor profile (in-app) | Details | `get_public_vendor_profile` + trust | J-PROC-01 | Trust read-only |
| P-BUY-05 | Favorites | Listing | `list/add/remove_catalog_favorites` | J-PROC-01 | |
| P-BUY-06 | RFQ list | Listing | `list_rfqs` | J-PROC | Cursor pagination |
| P-BUY-07 | RFQ create wizard | Wizard | `create_rfq`, `update_rfq`, `submit_rfq` | J-PROC-02/03 | Resumable draft |
| P-BUY-08 | RFQ detail — overview | Details | `get_rfq` | J-PROC | Status from Doc-4M |
| P-BUY-09 | RFQ detail — quotations | Listing | `list_quotations_for_rfq` | J-PROC-08 | Visibility-gated |
| P-BUY-10 | RFQ detail — activity | Details | routing / audit reads | J-PROC-07 | Deferral invisible |
| P-BUY-11 | RFQ version history | Details | `get_rfq_version` | J-PROC | Versioned (Invariant #8) |
| P-BUY-12 | Internal approval | Management | `approve_rfq`, `reject_internal_rfq` | J-PROC-04 | No auto-approve |
| P-BUY-13 | Routing log / invitations | Listing | `get_routing_log`, `list_invitations` | J-PROC-07 | No excluded vendor shown |
| P-BUY-14 | Quotation detail | Details | `get_quotation` | J-PROC-08 | |
| P-BUY-15 | Comparison statement | Analytics | `get_comparison_statement` | J-PROC-09 | Read-only, System-gen, **never recommends** (R6) |
| P-BUY-16 | Clarifications / thread | Details | `manage_clarification` (M6) | J-PROC-10 | |
| P-BUY-17 | Award | Wizard | `award_rfq` | J-PROC-12 | Explicit, unranked, 1:1; threshold approval |
| P-BUY-18 | Close lost | Details | `close_lost_rfq` | J-PROC-12b | Non-penalizing |
| P-BUY-19 | Engagements | Listing | engagement reads | J-PROC-13 | |
| P-BUY-20 | Engagement detail | Details | engagement + documents | J-PROC-13 | |
| P-BUY-21 | Purchase order | Details | `issue_po` | J-PROC-13 | `can_approve_po` distinct |
| P-BUY-22 | Payments | Details | `record_payment`, `confirm_payment` | J-PROC-13 | **Records only, no funds** (DF-6) |
| P-BUY-23 | Trade invoice review | Details | `approve_trade_invoice`, `get_invoice` | J-PROC-13 | ≠ platform invoice |
| P-BUY-24 | Challan | Details | `get_challan` | J-PROC-13 | |
| P-BUY-25 | WCC | Details | `get_wcc` | J-PROC-13 | |
| P-BUY-26 | CRM — vendor list | Listing | `get_crm_status` (own-org) | J-PROC-14 | **Buyer-private** (Invariant #11) |
| P-BUY-27 | CRM — vendor detail | Details | `update_crm_status`, `add_crm_note`, `set_approved`, `set_blacklist` | J-PROC-14 | **Never leaks** |

---

## 7. Vendor Workspace — `P-VND-*` (Doc-7G · Doc-5D / Doc-5E / Doc-5F / Doc-5G)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-VND-01 | Vendor dashboard | Dashboard | reads, trust/perf | J-SUP | KPI cards |
| P-VND-02 | Profile editor | Settings | `create/claim/update_vendor_profile` | J-VND-01/02 | Claim lifecycle (Invariant #3) |
| P-VND-03 | Capacity profile | Settings | `upsert_vendor_capacity_profile` | J-VND-02 | |
| P-VND-04 | Declared financial tier | Settings | `set_declared_financial_tier` | J-VND-02 | Declared ≠ verified |
| P-VND-05 | Microsite editor (draft) | Management | `publish_*` / `unpublish_*` | J-VND-03 | **No draft leaks** |
| P-VND-06 | Microsite preview | Details | draft projection | J-VND-03 | |
| P-VND-07 | Products | Listing | product reads | J-VND-04 | |
| P-VND-08 | Product create/edit | Wizard | `create_product`, `update_product`, `set_product_status`, `link/unlink_product_spec` | J-VND-04 | Versioned |
| P-VND-09 | Spec library | Listing | `create/update_spec_library_entry` | J-VND-04 | |
| P-VND-10 | Spec documents | Listing | `add_spec_document`, `supersede_spec_document` | J-VND-04 | ⚠ upload `ESC-7-API/upload` (`ER`) |
| P-VND-11 | Category assignment | Settings | `assign/update/remove_category_assignment`, `list_categories` | J-VND-05 | Admin-governed categories |
| P-VND-12 | Ads | Listing | ad reads | J-VND-06 | |
| P-VND-13 | Ad create/edit | Settings | `create_advertisement` | J-VND-06 | |
| P-VND-14 | Ad submission / status | Details | `submit_advertisement`, `set_advertisement_state` | J-VND-06 | Admin reviews |
| P-VND-15 | Invitations inbox | Listing | `list_invitations`, `get_invitation` | J-SUP-01 | **Received-only** |
| P-VND-16 | Invitation detail | Details | `get_invitation`, `respond_to_invitation` | J-SUP-01/02 | Decline = no penalty |
| P-VND-17 | Quotations | Listing | quotation reads | J-SUP-03 | Visibility-gated |
| P-VND-18 | Quotation create/edit | Wizard | `submit_quotation`, `revise_quotation` | J-SUP-03 | Versioned |
| P-VND-19 | Quotation version history | Details | quotation version reads | J-SUP-03 | |
| P-VND-20 | Quotation actions | Details | `withdraw_quotation`, `request_late_extension` | J-SUP-04 | Withdraw = zero penalty |
| P-VND-21 | Leads pipeline | Management | `update_lead_stage`, `add_lead_activity` | J-SUP-06 | System-created leads |
| P-VND-22 | Lead detail | Details | lead reads | J-SUP-06 | |
| P-VND-23 | Engagements (vendor) | Listing | engagement reads | J-SUP-07 | |
| P-VND-24 | Engagement detail (vendor) | Details | engagement + documents | J-SUP-07 | |
| P-VND-25 | Delivery challan | Details | `upload_delivery_challan`, `record_delivery` | J-SUP-07 | ⚠ upload `ESC-7-API/upload` (`ER`) |
| P-VND-26 | Trade invoice issue | Details | `issue_trade_invoice` | J-SUP-07 | Records only (DF-6) |
| P-VND-27 | Finance / payments (vendor) | Listing | finance reads | J-SUP-07 | |
| P-VND-28 | Trust & performance | Dashboard | `get_trust_score`, `get_performance_score`, `get_verified_tier` | J-VND-07 | **Read-only**; byte-equivalence on analytics |

---

## 8. Admin Console — `P-ADM-*` (Doc-7H · Doc-5J + cross-module Admin legs · no active-org)

| ID | Page | Template | Binds | Journey | Notes |
|---|---|---|---|---|---|
| P-ADM-01 | Admin dashboard | Dashboard | reads | J-ADM | |
| P-ADM-02 | Moderation queue | Management | moderation case reads | J-ADM-01 | |
| P-ADM-03 | Moderation case detail | Details | `create/assign/decide_moderation_case` | J-ADM-01 | |
| P-ADM-04 | RFQ moderation | Management | `moderate_rfq` | J-ADM-01 | pass→matching / reject→draft |
| P-ADM-05 | Bans | Listing | ban reads | J-ADM-04 | |
| P-ADM-06 | Ban detail / issue | Details | `issue_ban`, `lift_ban` | J-ADM-04 | emits `VendorBanned` |
| P-ADM-07 | Vendor approval queue | Management | `set_vendor_profile_status` | J-ADM-03 | |
| P-ADM-08 | Category management | Management | `set_category_status` | J-ADM-03 | Taxonomy Admin-governed |
| P-ADM-09 | Category editor | Settings | `create_category`, `update_category` | J-ADM-03 | |
| P-ADM-10 | Ad review queue | Management | ad reads | J-ADM-03 | |
| P-ADM-11 | Ad review detail | Details | `review_advertisement` | J-ADM-03 | |
| P-ADM-12 | Verification queue | Management | `queue/assign_verification_task` | J-ADM-02 | M8 queues |
| P-ADM-13 | Verification task detail | Details | `decide_verification_task` | J-ADM-02 | → M5 owns score (firewall) |
| P-ADM-14 | Import jobs | Listing | import reads | J-ADM-05 | |
| P-ADM-15 | Import job — new / detail | Wizard | `submit_import_job` | J-ADM-05 | Create-then-poll (ASYNC) |
| P-ADM-16 | Outreach campaigns | Listing | campaign reads | J-ADM-05 | |
| P-ADM-17 | Campaign detail | Details | `create/run/complete_outreach_campaign` | J-ADM-05 | Acquisition only |
| P-ADM-18 | Outreach contacts | Listing | `add/update_outreach_contact` | J-ADM-05 | |
| P-ADM-19 | Routing rules | Management | `manage_routing_rule` | J-ADM-05 | Stage-gated |
| P-ADM-20 | Routing rule editor | Settings | `manage_routing_rule`, `assist_routing` | J-ADM-05 | |
| P-ADM-21 | Matching results (internal) | Details | `get_matching_results` (Admin leg) | J-ADM | Internal-service leg only |
| P-ADM-22 | Plan management | Management | `list_plans` | J-ADM-06 | |
| P-ADM-23 | Plan editor | Settings | `create/update/retire_plan`, `activate_plan` | J-ADM-06 | `activate_plan` Admin-only |
| P-ADM-24 | Entitlements / bundles | Management | `bundle_plan_entitlement`, `create_entitlement` | J-ADM-06 | |
| P-ADM-25 | Identity ops — orgs | Management | `suspend/reinstate_organization`, `recover_organization_ownership` | J-ADM-06 | No active-org |
| P-ADM-26 | Identity ops — users | Management | `suspend/reinstate_user` | J-ADM-06 | |
| P-ADM-27 | Suggestion triage | Management | `decide_category_suggestion`, `triage/close_missing_vendor_suggestion` | J-ADM-07 | Non-disclosure |
| P-ADM-28 | Link triage | Management | `confirm/dismiss_link_suggestion` | J-ADM-07 | Non-disclosure |
| P-ADM-29 | Support reads | Details | `staff_can_support` (Doc-5H) | J-ADM | Support scope |

> **Admin-decides / owning-module-owns (R5):** every page **invokes** a wired Admin command; the owning
> module owns the effect. No page writes Trust/Performance/Tier scores or makes matching/award decisions.

---

## 9. Template coverage

Representative mapping; the authoritative per-page template is the **Template** column (§2–§8), and the
canonical *layout* each value resolves to is defined in **`PT`** (`T-*`, see `PT §13`).

| Template (`PT §0.1` `T-*` · `DP §6`) | Representative pages |
|---|---|
| Landing (`T-LANDING`) | P-PUB-01 |
| Static (`T-STATIC`) | P-PUB-02…06, 18, 21–24 |
| Listing (`T-LISTING`) | search results, RFQ/quotation/vendor/product lists, queues |
| Details (`T-DETAILS`) | profiles, RFQ/quotation/engagement/document details |
| Wizard (`T-WIZARD`) | RFQ create (P-BUY-07), Award (P-BUY-17), Product (P-VND-08), Quotation (P-VND-18), Org setup (P-AUTH-03), Import (P-ADM-15) |
| Settings (`T-SETTINGS`) | profile/org/role/workflow/billing editors |
| Dashboard (`T-DASHBOARD`) | P-BUY-01, P-VND-01, P-ADM-01, P-ACC-01/18/22 |
| Analytics (`T-ANALYTICS`) | P-BUY-15 (comparison) — *more arrive in later analytics waves* |
| Management (`T-MANAGEMENT`) | approval/moderation/verification/routing/plan queues |
| Auth (`T-AUTH`) | P-AUTH-01…08 |
| State (`T-STATE`) | P-SH-03…06 |

---

## 10. Handoff to Next Waves

| Wave | Builds on this inventory |
|---|---|
| **`PT` — Templates** | Each page's **Template** column resolves to a reusable `T-*` layout (`PT §0.1` / `DP §6`) |
| **`SS` — Screen Design** | Each `P-*` page becomes a screen, instantiating its template + patterns, in its journey |

---

## 11. Governance Alignment & Precedence

Constraints honored **by pointer** (reference-never-restate). Planning vocabularies are owned by
`SC §8`; escalation handles are owned by [`ER`](esc_registry.md); terminology by [`GL`](glossary.md).

| Constraint | Source | Where honored |
|---|---|---|
| Every page binds a wired contract or is static/state | Doc-7A §0 / Doc-7D…7H | all tables |
| Routes carry opaque IDs, not human refs | `IA §8` / Doc-4A | §0 |
| Non-disclosure / byte-equivalence (no excluded/blacklist/private pages) | Invariant #11 / CHK-7-040 | P-BUY-13/26/27, P-VND-15/28, P-ADM-27/28 |
| Buyer-private CRM never leaks | Invariant #11 | P-BUY-26/27 |
| No public RFQ board | Doc-3 §5.1 | §3 (no such page) |
| Comparison read-only, System-gen, non-recommending | Doc-7F §6 / R6 | P-BUY-15 |
| Award explicit, unranked, 1:1 | Doc-2 §5.4 / Doc-3 §9.1 | P-BUY-17 |
| Post-award records only; no funds movement | R8 / DF-6 | P-BUY-22, P-VND-26 |
| Versioned/immutable docs & catalog; soft-delete | Invariant #8 | P-BUY-11, P-VND-08/19, P-ACC-05 |
| Declared tier ≠ verified; Admin decides, Trust owns | `SC` governance · Invariant | P-VND-04/28, P-ADM-13 |
| Admin-decides / owning-module-owns; no active-org | R5 / Doc-7C §4 | §8 |
| Cursor pagination on all lists | Doc-7C §5.3 | every Listing |

### ESC handles → see [`ER`](esc_registry.md)

The `[ESC-…]` register **now lives in [`ER`](esc_registry.md)** (the single source: gap · interim
presentation · resolution channel). This inventory **references handles only** and **coins none**.
For orientation, the affected-pages mapping is retained below (the gap/interim prose is **not**
restated — read `ER`):

| Handle (defined in `ER`) | Affected pages |
|---|---|
| `ESC-7-API-CATNAV` | P-PUB-07/08/09 |
| `ESC-7-API-PRODDETAIL` | P-PUB-11 |
| `ESC-7-API-ADS` | P-PUB (ads) |
| `ESC-7-API/upload` | P-VND-10/25, doc attachments |
| `ESC-IDN-DELEG-EXPIRY` | P-ACC-12 |
| Industry/Brand/Standard taxonomies (non-ESC gap, `ER`) | P-PUB-09 |

> `ESC-7-AI` and the export/related gaps are likewise defined in [`ER`](esc_registry.md) and inherited
> by reference (also surfaced via `UX §12`). Each handle resolves only via its named channel — never
> locally (Doc-7C §0.3; CLAUDE.md §11).

---

## 12. Master Navigation Matrix

Primary navigation per surface → destination page (realizes the `IA §6` sitemaps as a flat map).
**Wayfinding only** — every entry is gated by nav derivation (`IA §4.1`) and is **not** an authorization
source. Secondary/contextual pages are reached from these destinations.

**Public — top nav + footer**

| Nav | Destination |
|---|---|
| Marketplace / Catalog | P-PUB-10 |
| Categories | P-PUB-07 |
| Vendors | P-PUB-12 |
| Pricing | P-PUB-04 |
| Resources | P-PUB-23 |
| Sign in | P-AUTH-01 |
| Legal (footer) | P-PUB-21 / P-PUB-22 |

**Account & Identity — settings nav**

| Nav | Destination |
|---|---|
| Account | P-ACC-01 |
| Organization | P-ACC-04 |
| Members | P-ACC-06 |
| Roles | P-ACC-08 |
| Delegation | P-ACC-11 |
| Settings | P-ACC-13 |
| Billing | P-ACC-16 |

**Buyer — left nav**

| Nav | Destination |
|---|---|
| Dashboard | P-BUY-01 |
| Discover | P-BUY-02 |
| Favorites | P-BUY-05 |
| RFQs | P-BUY-06 |
| Approvals | P-BUY-12 |
| Engagements | P-BUY-19 |
| Vendor CRM | P-BUY-26 |

**Vendor — left nav**

| Nav | Destination |
|---|---|
| Dashboard | P-VND-01 |
| Profile | P-VND-02 |
| Microsite | P-VND-05 |
| Products | P-VND-07 |
| Ads | P-VND-12 |
| Invitations | P-VND-15 |
| Quotations | P-VND-17 |
| Leads | P-VND-21 |
| Engagements | P-VND-23 |
| Trust & Performance | P-VND-28 |

**Admin — left nav** *(no active-org)*

| Nav | Destination |
|---|---|
| Dashboard | P-ADM-01 |
| Moderation | P-ADM-02 |
| Bans | P-ADM-05 |
| Vendor approval | P-ADM-07 |
| Categories | P-ADM-08 |
| Ad review | P-ADM-10 |
| Verification | P-ADM-12 |
| Import | P-ADM-14 |
| Outreach | P-ADM-16 |
| Routing rules | P-ADM-19 |
| Plans | P-ADM-22 |
| Identity ops | P-ADM-25 |
| Triage | P-ADM-27 |

---

## 13. Page Attributes Matrix — the single planning matrix

> **Inherits (`SC §2`):** GI · the `SC §8` planning vocabularies (Complexity `Simple/Medium/Complex/Critical`
> · Priority `P0/P1/P2` · Interaction `Read-only/Editable/Transactional/Workflow` · Visual-hierarchy
> `Hero/Primary/Secondary/Support` · Devices `D/T/M/F`). **Deltas only** are recorded per page; an
> attribute left to its inheritance carries the value below — this matrix is where the per-page values live.

The **single source for per-page planning metadata** used by `PT`/`SS` and by permissions / analytics /
testing / search. **Actor = audience, not authorization** (access is server-validated per wired
contract — Invariant #10). Values are drawn **only** from `SC §8`. Reading notes:

- **Priority** — `P0` = walking-skeleton / critical paths (auth, org setup, RFQ create/list/detail,
  quotation create/detail, comparison, award, vendor discovery, vendor profile, invitations inbox,
  dashboards) · `P1` = core supporting · `P2` = later / admin-deep / rare / legal.
- **Complexity / Interaction / Visual-hierarchy** assigned per page role; **Test hooks → Doc-8** (`SC §8`).

### 13.0 Depends-on rule (stated once — not repeated per row)

**Every page depends on:** (a) its **Template** (`PT` `T-*`, the Template column in §2–§8); (b) its
**bound contract(s)** (the Binds column in its inventory row); and (c) the **Doc-7B component kit**
(`SC §7` tiers). Page-specific *extra* dependencies are noted **inline as a delta only**:

- **File upload** (`ESC-7-API/upload`, `ER`): P-VND-10, P-VND-25 (+ any doc-attachment surface).
- **Trust/score embedded reads** (`trust-badge` / `score-ring`, M5, read-only — `SC §7`): P-PUB-13,
  P-BUY-04, P-VND-01/28.
- **Billing embedded** (`billing-indicator`, M7 — `SC §7`): P-ACC-16/17/18, P-ADM-22/23/24.
- **Conversation thread** (`conversation-thread`, M6 — `SC §7`): P-BUY-16.
- **AI advisory** (`ai-advisory-panel`, M9, future — `ESC-7-AI`, `ER`): any page exposing the advisory
  panel per `PT`; non-recommending, graceful-absence.

### 13.1 Shell

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-SH-01 Global search results | Shared | D/T/M | Critical | Contextual | Medium | P1 | Read-only | Primary |
| P-SH-02 Notification center | Shared | D/T/M | Frequent | Secondary | Medium | P1 | Editable | Secondary |
| P-SH-03 Not-found | Shared | D/T/M | Rare | Hidden | Simple | P1 | Read-only | Support |
| P-SH-04 Error | Shared | D/T/M | Rare | Hidden | Simple | P1 | Read-only | Support |
| P-SH-05 Maintenance | Shared | D/T/M | Rare | Hidden | Simple | P2 | Read-only | Support |
| P-SH-06 Forbidden | Shared | D/T/M | Rare | Hidden | Simple | P1 | Read-only | Support |

### 13.2 Public

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-PUB-01 Home | Guest | D/T/M | Critical | Primary | Medium | P0 | Read-only | Hero |
| P-PUB-02 About | Guest | D/T/M | Rare | Secondary | Simple | P2 | Read-only | Support |
| P-PUB-03 How it works | Guest | D/T/M | Occasional | Secondary | Simple | P2 | Read-only | Secondary |
| P-PUB-04 Pricing | Guest | D/T/M | Occasional | Primary | Medium | P1 | Read-only | Primary |
| P-PUB-05 For Buyers | Guest | D/T/M | Occasional | Secondary | Simple | P2 | Read-only | Secondary |
| P-PUB-06 For Vendors | Guest | D/T/M | Occasional | Secondary | Simple | P2 | Read-only | Secondary |
| P-PUB-07 Categories index | Guest | D/T/M | Frequent | Primary | Medium | P1 | Read-only | Primary |
| P-PUB-08 Category page | Guest | D/T/M | Frequent | Secondary | Medium | P1 | Read-only | Secondary |
| P-PUB-09 Industry page | Guest | D/T/M | Occasional | Secondary | Medium | P2 | Read-only | Secondary |
| P-PUB-10 Catalog search | Guest | D/T/M | Critical | Primary | Complex | P0 | Read-only | Hero |
| P-PUB-11 Product detail | Guest | D/T/M | Frequent | Contextual | Medium | P1 | Read-only | Primary |
| P-PUB-12 Vendor directory | Guest | D/T/M | Critical | Primary | Complex | P0 | Read-only | Hero |
| P-PUB-13 Vendor profile/microsite | Guest | D/T/M | Critical | Contextual | Complex | P0 | Read-only | Hero |
| P-PUB-14 Microsite — Products | Guest | D/T/M | Frequent | Contextual | Medium | P1 | Read-only | Primary |
| P-PUB-15 Microsite — Projects | Guest | D/T/M | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-PUB-16 Microsite — Capabilities | Guest | D/T/M | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-PUB-17 Microsite — Contact | Guest | D/T/M | Frequent | Contextual | Simple | P1 | Editable | Secondary |
| P-PUB-18 Trust explainer | Guest | D/T/M | Rare | Secondary | Simple | P2 | Read-only | Secondary |
| P-PUB-19 Industrial search | Guest | D/T/M | Frequent | Primary | Complex | P1 | Read-only | Primary |
| P-PUB-20 Compare (public) | Guest | D/T | Occasional | Contextual | Medium | P2 | Read-only | Secondary |
| P-PUB-21 Terms | Guest | D/T/M | Rare | Hidden | Simple | P2 | Read-only | Support |
| P-PUB-22 Privacy | Guest | D/T/M | Rare | Hidden | Simple | P2 | Read-only | Support |
| P-PUB-23 Resources/Blog | Guest | D/T/M | Occasional | Secondary | Simple | P2 | Read-only | Secondary |
| P-PUB-24 Contact/Support | Guest | D/T/M | Occasional | Secondary | Simple | P2 | Editable | Secondary |

### 13.3 Auth-entry

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-AUTH-01 Login | Shared | D/T/M | Occasional | Hidden | Simple | P0 | Transactional | Hero |
| P-AUTH-02 Signup | Shared | D/T/M | Occasional | Hidden | Medium | P0 | Transactional | Hero |
| P-AUTH-03 Org setup | Shared | D/T/M | Rare | Hidden | Complex | P0 | Workflow | Hero |
| P-AUTH-04 PW reset — request | Shared | D/T/M | Rare | Hidden | Simple | P1 | Transactional | Primary |
| P-AUTH-05 PW reset — confirm | Shared | D/T/M | Rare | Hidden | Simple | P1 | Transactional | Primary |
| P-AUTH-06 2FA challenge | Shared | D/T/M | Rare | Hidden | Medium | P1 | Transactional | Primary |
| P-AUTH-07 Accept invitation | Shared | D/T/M | Rare | Hidden | Medium | P0 | Transactional | Hero |
| P-AUTH-08 Email verification | Shared | D/T/M | Rare | Hidden | Simple | P1 | Transactional | Primary |

### 13.4 Account & Identity

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-ACC-01 Account overview | Shared | D/T/M | Occasional | Primary | Medium | P0 | Read-only | Primary |
| P-ACC-02 User profile | Shared | D/T/M | Occasional | Secondary | Simple | P1 | Editable | Secondary |
| P-ACC-03 Security & 2FA | Shared | D/T/M | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-ACC-04 Organization profile | Shared | D/T | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-ACC-05 Organization lifecycle | Shared | D/T | Rare | Contextual | Complex | P2 | Transactional | Support |
| P-ACC-06 Members | Shared | D/T | Frequent | Secondary | Medium | P1 | Editable | Secondary |
| P-ACC-07 Invite member | Shared | D/T | Occasional | Contextual | Simple | P1 | Transactional | Secondary |
| P-ACC-08 Roles | Shared | D/T | Occasional | Secondary | Medium | P1 | Read-only | Secondary |
| P-ACC-09 Role editor | Shared | D | Occasional | Contextual | Complex | P1 | Editable | Secondary |
| P-ACC-10 Permissions reference | Shared | D/T | Rare | Contextual | Simple | P2 | Read-only | Support |
| P-ACC-11 Delegation grants | Shared | D/T | Rare | Secondary | Medium | P2 | Read-only | Secondary |
| P-ACC-12 Delegation editor | Shared | D | Rare | Contextual | Complex | P2 | Transactional | Secondary |
| P-ACC-13 Workflow settings | Shared | D/T | Occasional | Secondary | Complex | P1 | Editable | Secondary |
| P-ACC-14 Buyer profile settings | Buyer | D/T | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-ACC-15 Notification preferences | Shared | D/T/M | Rare | Secondary | Simple | P2 | Editable | Secondary |
| P-ACC-16 Plans / catalog | Shared | D/T/M | Occasional | Secondary | Medium | P1 | Read-only | Secondary |
| P-ACC-17 Subscription | Shared | D/T | Occasional | Secondary | Complex | P1 | Transactional | Primary |
| P-ACC-18 Usage & quota | Shared | D/T/M | Occasional | Secondary | Medium | P1 | Read-only | Secondary |
| P-ACC-19 Lead credits | Shared | D/T | Occasional | Secondary | Medium | P2 | Transactional | Secondary |
| P-ACC-20 Platform invoices | Shared | D/T | Occasional | Secondary | Medium | P1 | Read-only | Secondary |
| P-ACC-21 Platform invoice detail | Shared | D/T | Rare | Contextual | Simple | P1 | Read-only | Secondary |
| P-ACC-22 Rewards / referrals | Shared | D/T/M | Rare | Secondary | Medium | P2 | Read-only | Secondary |

**Correction (2026-07-03, owner ruling on `FE-VEN-14`'s composition report):** P-ACC-19 Lead
Credits corrected from `Buyer` to `Shared` — labeling gap, not a real restriction; lead credits are
consumed by vendors responding to invitations (already vendor-facing on the vendor dashboard) and
every sibling billing page (P-ACC-16/17/18/20/21) is `Shared`. Full record:
`governanceReviews/FE-VEN-14-VENDOR-ACCOUNT-COMPOSITION-REPORT_v1.0.md` §6.2/§9.

### 13.5 Buyer Workspace

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-BUY-01 Buyer dashboard | Buyer | D/T/M | Critical | Primary | Complex | P0 | Read-only | Hero |
| P-BUY-02 Discover vendors | Buyer | D/T/M | Critical | Primary | Complex | P0 | Read-only | Hero |
| P-BUY-03 Vendor directory | Buyer | D/T/M | Frequent | Primary | Complex | P0 | Read-only | Primary |
| P-BUY-04 Vendor profile | Buyer | D/T/M | Frequent | Contextual | Complex | P0 | Read-only | Primary |
| P-BUY-05 Favorites | Buyer | D/T/M | Frequent | Secondary | Medium | P1 | Editable | Secondary |
| P-BUY-06 RFQ list | Buyer | D/T/M | Critical | Primary | Medium | P0 | Read-only | Hero |
| P-BUY-07 RFQ create wizard | Buyer | D/T | Critical | Contextual | Critical | P0 | Workflow | Hero |
| P-BUY-08 RFQ detail — overview | Buyer | D/T/M | Critical | Contextual | Complex | P0 | Workflow | Hero |
| P-BUY-09 RFQ detail — quotations | Buyer | D/T | Critical | Contextual | Complex | P0 | Read-only | Primary |
| P-BUY-10 RFQ detail — activity | Buyer | D/T | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-BUY-11 RFQ version history | Buyer | D/T | Rare | Contextual | Medium | P1 | Read-only | Secondary |
| P-BUY-12 Internal approval | Buyer | D/T/M | Frequent | Primary | Complex | P1 | Workflow | Primary |
| P-BUY-13 Routing log / invitations | Buyer | D/T | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-BUY-14 Quotation detail | Buyer | D/T | Critical | Contextual | Complex | P0 | Read-only | Primary |
| P-BUY-15 Comparison statement | Buyer | D | Critical | Contextual | Critical | P0 | Read-only | Hero |
| P-BUY-16 Clarifications / thread | Buyer | D/T/M | Frequent | Contextual | Medium | P1 | Transactional | Secondary |
| P-BUY-17 Award | Buyer | D/T | Critical | Contextual | Critical | P0 | Workflow | Hero |
| P-BUY-18 Close lost | Buyer | D/T | Occasional | Contextual | Medium | P1 | Transactional | Secondary |
| P-BUY-19 Engagements | Buyer | D/T/M | Frequent | Primary | Complex | P1 | Read-only | Primary |
| P-BUY-20 Engagement detail | Buyer | D/T | Frequent | Contextual | Complex | P1 | Read-only | Primary |
| P-BUY-21 Purchase order | Buyer | D/T | Frequent | Contextual | Complex | P1 | Transactional | Primary |
| P-BUY-22 Payments | Buyer | D/T | Frequent | Contextual | Complex | P1 | Transactional | Primary |
| P-BUY-23 Trade invoice review | Buyer | D/T | Frequent | Contextual | Complex | P1 | Transactional | Primary |
| P-BUY-24 Challan | Buyer | D/T/M | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-BUY-25 WCC | Buyer | D/T/M | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-BUY-26 CRM — vendor list | Buyer | D/T | Frequent | Primary | Complex | P1 | Editable | Primary |
| P-BUY-27 CRM — vendor detail | Buyer | D/T | Occasional | Contextual | Complex | P1 | Editable | Primary |

### 13.6 Vendor Workspace

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-VND-01 Vendor dashboard | Vendor | D/T/M | Critical | Primary | Complex | P0 | Read-only | Hero |
| P-VND-02 Profile editor | Vendor | D/T | Frequent | Primary | Complex | P1 | Editable | Primary |
| P-VND-03 Capacity profile | Vendor | D/T | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-VND-04 Declared financial tier | Vendor | D/T | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-VND-05 Microsite editor | Vendor | D | Frequent | Primary | Complex | P1 | Workflow | Primary |
| P-VND-06 Microsite preview | Vendor | D/T/M | Occasional | Contextual | Medium | P1 | Read-only | Secondary |
| P-VND-07 Products | Vendor | D/T/M | Critical | Primary | Complex | P1 | Editable | Primary |
| P-VND-08 Product create/edit | Vendor | D/T | Frequent | Contextual | Complex | P1 | Workflow | Primary |
| P-VND-09 Spec library | Vendor | D/T | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-VND-10 Spec documents | Vendor | D/T | Occasional | Contextual | Medium | P1 | Editable | Secondary |
| P-VND-11 Category assignment | Vendor | D/T | Occasional | Secondary | Medium | P1 | Editable | Secondary |
| P-VND-12 Ads | Vendor | D/T | Occasional | Primary | Medium | P2 | Editable | Secondary |
| P-VND-13 Ad create/edit | Vendor | D/T | Occasional | Contextual | Medium | P2 | Editable | Secondary |
| P-VND-14 Ad submission/status | Vendor | D/T | Rare | Contextual | Simple | P2 | Transactional | Secondary |
| P-VND-15 Invitations inbox | Vendor | D/T/M | Critical | Primary | Medium | P0 | Read-only | Hero |
| P-VND-16 Invitation detail | Vendor | D/T/M | Critical | Contextual | Complex | P0 | Workflow | Hero |
| P-VND-17 Quotations | Vendor | D/T/M | Critical | Primary | Medium | P1 | Read-only | Primary |
| P-VND-18 Quotation create/edit | Vendor | D/T | Critical | Contextual | Critical | P0 | Workflow | Hero |
| P-VND-19 Quotation version history | Vendor | D/T | Rare | Contextual | Medium | P1 | Read-only | Secondary |
| P-VND-20 Quotation actions | Vendor | D/T | Occasional | Contextual | Medium | P1 | Transactional | Secondary |
| P-VND-21 Leads pipeline | Vendor | D/T/M | Frequent | Primary | Complex | P1 | Editable | Primary |
| P-VND-22 Lead detail | Vendor | D/T/M | Occasional | Contextual | Medium | P1 | Editable | Secondary |
| P-VND-23 Engagements (vendor) | Vendor | D/T/M | Frequent | Primary | Complex | P1 | Read-only | Primary |
| P-VND-24 Engagement detail (vendor) | Vendor | D/T | Frequent | Contextual | Complex | P1 | Read-only | Primary |
| P-VND-25 Delivery challan | Vendor | D/T/M | Occasional | Contextual | Medium | P1 | Transactional | Secondary |
| P-VND-26 Trade invoice issue | Vendor | D/T | Frequent | Contextual | Complex | P1 | Transactional | Primary |
| P-VND-27 Finance / payments | Vendor | D/T | Occasional | Secondary | Medium | P1 | Read-only | Secondary |
| P-VND-28 Trust & performance | Vendor | D/T/M | Frequent | Primary | Complex | P0 | Read-only | Primary |

### 13.7 Admin Console *(desktop-first; mobile mostly `F`uture)*

| Page | Actor | Devices | Search | Nav | Complexity | Priority | Interaction | Visual-hierarchy |
|---|---|---|---|---|---|---|---|---|
| P-ADM-01 Admin dashboard | Admin | D/T | Frequent | Primary | Complex | P0 | Read-only | Hero |
| P-ADM-02 Moderation queue | Admin | D/T | Critical | Primary | Complex | P1 | Workflow | Primary |
| P-ADM-03 Moderation case detail | Admin | D/T | Frequent | Contextual | Complex | P1 | Workflow | Primary |
| P-ADM-04 RFQ moderation | Admin | D/T | Frequent | Primary | Complex | P1 | Workflow | Primary |
| P-ADM-05 Bans | Admin | D/T | Occasional | Primary | Medium | P2 | Read-only | Secondary |
| P-ADM-06 Ban detail / issue | Admin | D/T | Occasional | Contextual | Complex | P2 | Transactional | Secondary |
| P-ADM-07 Vendor approval queue | Admin | D/T | Critical | Primary | Complex | P1 | Workflow | Primary |
| P-ADM-08 Category management | Admin | D | Occasional | Primary | Complex | P1 | Editable | Primary |
| P-ADM-09 Category editor | Admin | D | Occasional | Contextual | Medium | P1 | Editable | Secondary |
| P-ADM-10 Ad review queue | Admin | D/T | Frequent | Primary | Medium | P2 | Workflow | Secondary |
| P-ADM-11 Ad review detail | Admin | D/T | Occasional | Contextual | Medium | P2 | Transactional | Secondary |
| P-ADM-12 Verification queue | Admin | D/T | Critical | Primary | Complex | P1 | Workflow | Primary |
| P-ADM-13 Verification task detail | Admin | D/T | Frequent | Contextual | Complex | P1 | Workflow | Primary |
| P-ADM-14 Import jobs | Admin | D/T | Occasional | Primary | Medium | P2 | Read-only | Secondary |
| P-ADM-15 Import job — new/detail | Admin | D | Occasional | Contextual | Complex | P2 | Workflow | Secondary |
| P-ADM-16 Outreach campaigns | Admin | D/T | Occasional | Primary | Medium | P2 | Editable | Secondary |
| P-ADM-17 Campaign detail | Admin | D/T | Rare | Contextual | Medium | P2 | Transactional | Secondary |
| P-ADM-18 Outreach contacts | Admin | D/T | Rare | Secondary | Medium | P2 | Editable | Support |
| P-ADM-19 Routing rules | Admin | D | Occasional | Primary | Complex | P2 | Editable | Secondary |
| P-ADM-20 Routing rule editor | Admin | D | Rare | Contextual | Complex | P2 | Editable | Secondary |
| P-ADM-21 Matching results (internal) | Admin | D | Rare | Contextual | Complex | P2 | Read-only | Secondary |
| P-ADM-22 Plan management | Admin | D/T | Occasional | Primary | Complex | P2 | Editable | Secondary |
| P-ADM-23 Plan editor | Admin | D | Occasional | Contextual | Complex | P2 | Editable | Secondary |
| P-ADM-24 Entitlements / bundles | Admin | D | Rare | Contextual | Complex | P2 | Editable | Secondary |
| P-ADM-25 Identity ops — orgs | Admin | D/T | Occasional | Primary | Complex | P2 | Transactional | Secondary |
| P-ADM-26 Identity ops — users | Admin | D/T | Occasional | Secondary | Complex | P2 | Transactional | Secondary |
| P-ADM-27 Suggestion triage | Admin | D/T | Occasional | Primary | Medium | P2 | Workflow | Secondary |
| P-ADM-28 Link triage | Admin | D/T | Rare | Secondary | Medium | P2 | Workflow | Support |
| P-ADM-29 Support reads | Admin | D/T | Occasional | Secondary | Medium | P2 | Read-only | Secondary |

---

*This document is non-authoritative. It enumerates the product's pages and is the single source for
per-page planning metadata (§13). It operates under the frozen corpus authority order (CLAUDE.md §7)
and the Doc-7 precedence chain (§0); it introduces no architecture change and coins no route, contract,
page, or ESC tag without a binding. Planning vocabularies are owned by `SC §8`; escalation handles by
[`ER`](esc_registry.md); terms by [`GL`](glossary.md). On any conflict, the frozen document wins and
this file is patched to match.*
