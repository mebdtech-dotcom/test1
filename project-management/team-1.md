# Team-1 Queue — Public / Shared / Identity

**Owns:** `P-PUB-*` (Doc-7D) · `P-SH-*` (Doc-7C) · `P-AUTH-*` (Doc-7E) · `P-ACC-*` (Doc-7E).
Titles + bindings are the **source record** in [`page_inventory.md`](../page_inventory.md) — this is
the status layer only. Work highest-priority `Ready` first; skip `Dependency ≠ Ready`.

## Public — `P-PUB-*` (Doc-7D)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-PUB-01 | Home / Landing | P1 | Ready | 🟩 Built | polish item (owner-named) |
| P-PUB-02 | About | P2 | Ready | ⬜ | static |
| P-PUB-03 | How it works | P2 | Ready | ⬜ | static |
| P-PUB-04 | Pricing / Plans (public) | P1 | Ready | ⬜ | marketing of plans |
| P-PUB-05 | For Buyers (segment) | P2 | Ready | ⬜ | static |
| P-PUB-06 | For Vendors (segment) | P2 | Ready | ⬜ | static |
| P-PUB-07 | Categories index | P1 | Ready | 🟩 Built | facets |
| P-PUB-08 | Category page | P1 | Ready | 🟩 Built | partial — verify facets |
| P-PUB-09 | Industry page | P2 | Waiting API | ⬜ | `ESC-7-API-CATNAV` |
| P-PUB-10 | Catalog search results | P1 | Ready | 🟩 Built | |
| P-PUB-11 | Product detail (public) | P1 | Waiting API | ⬜ | `ESC-7-API-PRODDETAIL`; modal-only today |
| P-PUB-12 | Vendor directory | P1 | Ready | 🟩 Built | |
| P-PUB-13 | Vendor profile / microsite | P1 | Ready | 🟩 Built | |
| P-PUB-14 | Microsite — Products | P1 | Ready | 🟩 Built | |
| P-PUB-15 | Microsite — Projects | P1 | Ready | 🟩 Built | |
| P-PUB-16 | Microsite — Capabilities | P1 | Ready | 🟩 Built | 4-flag matrix |
| P-PUB-17 | Microsite — Contact | P1 | Ready | 🟩 Built | |
| P-PUB-18 | Trust & verification explainer | P2 | Ready | ⬜ | verification surface |
| P-PUB-19 | Industrial / advanced search | P2 | Ready | 🟩 Built | |
| P-PUB-20 | Compare (public) | P3 | Ready | ⬜ | ungoverned; no matching |
| P-PUB-21 | Legal — Terms | P2 | Ready | ⬜ | static |
| P-PUB-22 | Legal — Privacy | P2 | Ready | ⬜ | static |
| P-PUB-23 | Resources / Blog | P3 | Ready | ⬜ | optional, SEO |
| P-PUB-24 | Contact / Support | P2 | Ready | ⬜ | static |

## Shell — `P-SH-*` (Doc-7C)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-SH-01 | Global search results | P2 | Ready | ⬜ | never re-ranks M3 |
| P-SH-02 | Notification center (full) | P2 | Ready | ⬜ | non-disclosure-bound |
| P-SH-03 | Not-found (404) | P1 | Ready | 🟩 Built | byte-identical to absence |
| P-SH-04 | Error (500) | P1 | Ready | 🟩 Built | |
| P-SH-05 | Maintenance / unavailable | P3 | Ready | ⬜ | |
| P-SH-06 | Forbidden | P2 | Ready | ⬜ | collapses to 404 where no right-to-know |

## Auth — `P-AUTH-*` (Doc-7E)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-AUTH-01 | Login | P0 | Ready | 🟩 Built | |
| P-AUTH-02 | Signup | P0 | Ready | ✅ Approved | RV-0004 PASS (re-review) — `ESC-7-API-SIGNUP` registered; notice → `text-iv-info-muted`. Both RV-0001 findings resolved |
| P-AUTH-03 | Org setup (post-signup) | P0 | Ready | ✅ Approved | RV-0007 PASS (Team-4). Exemplary field discipline (frozen `name` only; usage = intent, not sent). NIT: generic `[ESC-7-API]` marker; hand-rolled radio group |
| P-AUTH-04 | Password reset — request | P1 | Ready | ✅ Approved | RV-0010 PASS (Team-4). Non-disclosure exemplary — uniform "if an account exists" confirmation, no existence leak; info-muted, role=status |
| P-AUTH-05 | Password reset — confirm | P1 | Ready | ✅ Approved | RV-0014 PASS (Team-4). Non-disclosure exemplary (uniform invalid/expired); `?state=` harness PROD-GATED (NODE_ENV) — the right dev-preview pattern; server-authoritative token |
| P-AUTH-06 | 2FA challenge | P2 | Ready | ✅ Approved | RV-0017 PASS (Team-4). Server-authoritative; `?state=` PROD-GATED; TOTP+backup toggle; uniform role=alert error (danger-muted); P-4 inks. NIT: h1 in done state |
| P-AUTH-07 | Accept invitation / join org | P1 | Ready | ✅ Approved | RV-0019 PASS (Team-4). Real `accept_invitation`; frozen Org Role (Manager, not invented); Users-act/Orgs-own; non-disclosing invalid; `?state=` PROD-GATED |
| P-AUTH-08 | Email verification | P1 | Ready | ✅ Approved | RV-0021 PASS (Team-4). Server-authoritative token; non-disclosing invalid/expired; `?state=` PROD-GATED (NODE_ENV); one h1 per state; P-4 inks (AA-verified 4.70/4.75:1 on tints); Resend sends nothing (honest). Completes the Auth cluster |

## Account & Identity — `P-ACC-*` (Doc-7E)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-ACC-01 | Account overview | P1 | Ready | ✅ Approved | RV-0025 PASS (Team-4). Inv#2 (participation Buyer/Vendor ≠ org-role Owner, shown distinctly) + Inv#10 (numeric/enum entitlements, never plan-name) exemplary; firewall clean; Inv#5 (client org id never trusted). Shell `icons.ts` git-verified ADDITIVE (2 imports + 4 keys); scoped layout (doesn't wrap P-ACC-14); single h1. OBS: quick-links 404 until pages land (overview-first pattern) |
| P-ACC-02 | User profile | P1 | Ready | ✅ Approved | RV-0030 PASS (Team-4). Field discipline verified verbatim (Doc-4C §C4: `display_name`/`phone` E.164 only); email READ-ONLY (auth-managed DC-4); avatar deferred `[ESC-7-API/upload]`; honest interim save + discard Dialog; single h1; firewall clean. Nav-model repoint git-verified safe (one-line href). OBS: `--iv-form-max` undefined → `max-w-2xl` flagged to token owner |
| P-ACC-03 | Security & 2FA | P2 | Ready | ✅ Approved | RV-0034 PASS (Team-4). 2FA toggle = frozen `two_fa_enabled` (Doc-4C §C4:192; `recovery_method` opt; TOTP = Supabase infra DC-4, correctly not represented; no secret shown); `deactivate_own_account` (§C4:201) behind TYPED-confirm Dialog (danger not colour-only). Shell `icons.ts`(+`security:Lock`)/nav-model(+Security item) git-verified ADDITIVE. Accessible `role=switch` (no kit Switch → flagged). NIT: comment cites Doc-5C for deactivate (it's Doc-4C §C4) |
| P-ACC-04 | Organization profile | P1 | Ready | ✅ Approved | RV-0036 PASS (Team-4). `update_organization_profile` fields verbatim (Doc-4C §C5: name/address VO/contact_info VO/brand_assets_ref; VOs deferred, not coined); `verification_level` read-only (firewall). `transfer_ownership` EXEMPLARY (§C5:267–279: `can_transfer_ownership` Owner-only + never delegable, `new_owner_user_id` active, `reason_code` succession Arch §5.5, Last Owner Protection, TYPED-confirm not colour-only); frozen Org Roles (Inv #2). OBS: "become Director" post-transfer copy — confirm §5.5; `max-w-2xl`; hand-rolled radios |
| P-ACC-05 | Organization lifecycle | P2 | Ready | ✅ Approved | RV-0041 PASS (Team-4). `soft_delete_organization`/`restore_organization` verbatim (Doc-4C §C5:281–304): Owner-only `can_delete_organization`, `confirmation`(TYPED)+`reason`, `active→soft_deleted`; SOFT-delete only, recoverable, IDs never reused (Inv #8); restore `soft_deleted→active` + slug regenerated; cross-module cascade BLOCKED [DC-1] (not synthesized). `?state=deleted` PROD-GATED (NODE_ENV); danger not colour-only (P-4 inks); single h1. OBS: `max-w-2xl` |
| P-ACC-06 | Members | P1 | Ready | ✅ Approved | RV-0044 PASS (Team-4). `set_membership_status` (active⇄suspended) + `remove_member` (→removed terminal) verbatim (Doc-4C §C6, `can_manage_users`, Doc-2 §5.2); **Last Owner Protection §5.5** — sole Owner Suspend+Remove disabled; frozen Org Roles (Inv #2); semantic-table a11y; presentation-only. OBS: "invited" rows = outstanding invitations, scoped to invite flow (revoke_invitation/P-ACC-07), not this page's contracts |
| P-ACC-07 | Invite member | P1 | Ready | ✅ Approved | RV-0047 PASS (Team-4). `invite_member` verbatim (§C6:344: email + role_id REF→roles + department opt → invited, `can_manage_users`); Owner excluded (succession-only); `revoke_invitation` (invited→removed terminal, §C6:415) behind confirm; org-members-only (never vendor invites); seats NUMERIC (Inv #10) + Billing link; semantic-table a11y; presentation-only; single h1. OBS: `max-w-2xl` |
| P-ACC-08 | Roles | P2 | Ready | ✅ Approved | RV-0050 PASS (Team-4). Rows = `list_roles` `{role_id,name,is_system_bundle}` verbatim (§C7:465); System (Owner/Director/Manager/Officer) vs Custom chip, System→View/Custom→Edit; no inline permissions (separate list_permissions catalog, Inv #10). **EXEMPLARY: member-count OMITTED with explicit authority-order citation (frozen contract > Doc-7E note; don't coin).** Semantic-table a11y; single h1. OBS: row-editor links 404 until P-ACC-09 (overview-first) |
| P-ACC-09 | Role editor | P2 | Ready | ✅ Approved | RV-0054 PASS (Team-4). `create_role`/`update_role`/`set_role_permissions`/`delete_role` verbatim (§C7); error codes match frozen registers. **Inv #10 verified — checkbox-per-FROZEN-SLUG; all 7 catalog slugs confirmed real Doc-2 §7 tenant-space (Doc-2:630–636), nothing coined, no staff_* leaked.** SYSTEM bundles read-only (name+grid disabled, not deletable); custom editable + delete-confirm (`identity_role_in_use`); `[ESC-IDN-SLUG]` carried; notFound for unknown roleId; presentation-only; single h1. OBS: `max-w-2xl`, native checkbox grid |
| P-ACC-10 | Permissions reference | P2 | Ready | ✅ Approved | RV-0057 PASS (Team-4). Rows = `list_permissions` `{slug,description,space}` (§C7:454); permissions BY SLUG (Inv #10, mono); tenant-space only (staff = platform-admin, excluded); reuses P-ACC-09 catalog (RV-0054-verified real §7 slugs, single source). **EXEMPLARY don't-coin — Doc-7E "group" column refused (no group field in contract); uses frozen `space` dimension instead.** Read-only; semantic-table a11y; single h1 |
| P-ACC-11 | Delegation grants | P2 | Ready | ✅ Approved | RV-0062 PASS (Team-4, re-review of RV-0059). **[MAJOR] RESOLVED** — list renders OPAQUE refs only (`controlling_organization_id`/`representative_organization_id`/`vendor_profile_id`, mono) + "Display names aren't part of this list" note; no resolved name/scope label; matches `delegation_grant` DTO (Doc-4C:648/659) + engagements opaque-counterparty precedent. **[MINOR] RESOLVED** — `GrantStatus` = full §5.10 set draft/active/suspended/revoked/expired, all chip-mapped (draft=info, seeded) → no unmapped-status crash. [OBS] intra-corpus tension `draft` (Doc-2 §5.10:581, authoritative machine, page grounds here) vs `pending` (Doc-4M:166) — frozen-doc reconciliation for wiring/API-Gov (Flag-and-Halt at wiring), not a page defect. Queue advanced → P-ACC-13 (P-ACC-12 skipped, Waiting-Decision `ESC-IDN-DELEG-EXPIRY`). |
| P-ACC-12 | Delegation grant editor | P2 | Waiting Decision | ⬜ | `ESC-IDN-DELEG-EXPIRY` (reinstate path) |
| P-ACC-13 | Workflow settings | P2 | Ready | ✅ Approved | RV-0066 PASS (Team-4). `update_workflow_settings.v1` §C11 verbatim (21.4 Command, `can_manage_workflow_settings` O,D, active-org); `rfq_approval_mode` none/single/multi_step VERBATIM (Doc-2:723); approval_chain=list<object> (approval_chain_jsonb), financial_permissions threshold. **NO-AUTO-APPROVE exemplary** (rendered note; §6.2 "add approvals never remove a required slug"; Doc-3 §1.2/§5). Approval-chain role-per-step grounded in Doc-3 §107/§110 (can_approve_rfq holders, Owner escalation, Org Roles Inv#2); jsonb sub-shape unenumerated → presentation latitude honestly flagged for wiring (OBS). Tenant-owned, presentation-only honest interim; threshold BDT/multi-currency; firewall clean; a11y (radiogroup/fieldset, keyboard reorder, muted P-4 inks). OBS: native-select, max-w-2xl. Queue advanced → P-ACC-15 (P-ACC-14 Built, P-ACC-12 Waiting-Decision) |
| P-ACC-14 | Buyer profile settings | P1 | Ready | 🟩 Built | account page (partial) |
| P-ACC-15 | Notification preferences | P2 | Ready | ✅ Approved | RV-0067 PASS (Team-4). **Ownership boundary EXEMPLARY (corpus-verified)** — prefs DATA = `users.NotificationPreferences` JSONB VO, Identity-owned M1 (Doc-2:122; edit Doc-4C:151); M6 consumes read-only + delivery-only, owns NO prefs aggregate (Doc-4H B.7/DH-1/Freeze-Audit:60). Channels frozen: in-app (Doc-2:814) + email/SMS/WhatsApp logs (Doc-2:197/361/815); SMS+WhatsApp disabled "coming soon" (rollout, not coined). Types = presentation grouping over §8 catalog (M3/M4/M5/M6/M1), no event coined. Presentation-only honest interim; firewall clean (no plan gates channel); self-scope (not the P-SH-02 non-disclosure list); a11y role=switch aria-labelled per type×channel, semantic table, not colour-only. OBS(wiring): write seam/JSONB shape (Doc-5H); "critical security always sent" note vs toggleable Account row — enforce non-suppressible server-side. OBS: hand-rolled switch, max-w-2xl |
| P-ACC-16 | Plans / catalog | P1 | Ready | ✅ Approved | RV-0068 PASS (Team-4). **Inv #10 EXEMPLARY** — `list_plans`/`get_plan` (BC-BILL-1, Doc-4I, User-readable `[ESC-BILL-SLUG]`); features = ENTITLEMENT VALUES (seats/credits/quota/microsite/support numeric/enum/boolean), never plan-name gating; "Current plan" derived from entitlements not name-check; plan≠tier; "never affect RFQ matching/awards" note (Doc-3 §11.8). Firewall clean; read-only; Select→/account/subscription (P-ACC-17 404 until built). a11y radiogroup + Check/Minus icons (not colour-only). **OBS(wiring): monthly/annual toggle collapses 2 plan cards but frozen `plans` = 1 billing_cycle PER ROW (Doc-2:823), no frozen family key → wiring must group by family key or 1-card-per-row (coins no field, standard pricing pattern).** OBS: illustrative entitlement labels (exact slugs=catalog); status correctly not shown (active-only catalog); price toLocaleString en-US. Queue advanced → next Ready |
| P-ACC-17 | Subscription | P1 | Ready | ✅ Approved | RV-0069 PASS (Team-4). **CANCEL exemplary/correctness-critical** — `cancel_subscription` sets auto_renew=false → runs to period end, NO immediate expire (Doc-4I §HB-2.2:372/394; Doc-2 §5.7 A-06); dialog states exactly that. Status = §5.7 (active chip); events "Subscribed"/"Renewed" = display labels for frozen SubscriptionPurchased/Renewed (Doc-2:671), no event coined. **Inv#10** usage NUMERIC used/total role=progressbar, from entitlements not plan-name; plan≠tier. Money-boundary (platform revenue only, DF-6). `?state=none` PROD-GATED (NODE_ENV). Presentation-only honest interim; a11y solid. OBS(wiring): cancel is Owner-only (§HB-2.2) → Owner-gate the affordance; exact get_subscription/events projection + usage quota_keys at wiring. Queue advanced → P-ACC-18 |
| P-ACC-18 | Usage & quota | P2 | Ready | 🟡 In Progress | Building — T-DASHBOARD usage/quota at /account/usage; frozen `get_usage` (BC-BILL-3 read); stat-cards + progress bars WITH TEXT VALUES (not colour-only); **numeric/enum entitlement consumption ONLY, never plan-name (Inv #10); quota = entitlement check, never routing/eligibility (BC-BILL-3 resolves none, moat)**; billing-indicator + link; read-only |
| P-ACC-19 | Lead credits | P2 | Ready | ⬜ | |
| P-ACC-20 | Platform invoices | P2 | Ready | ⬜ | ≠ trade invoices |
| P-ACC-21 | Platform invoice detail | P2 | Ready | ⬜ | |
| P-ACC-22 | Rewards / referrals | P3 | Ready | ⬜ | |
