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
| P-ACC-08 | Roles | P2 | Ready | 🟡 In Progress | Building — T-LISTING roles list; frozen `list_roles` (`{role_id,name,is_system_bundle}`, Doc-4C §C7:461); System vs Custom scope chip; New role + row→editor (P-ACC-09); members-count OMITTED (not in list_roles response — spec conflict, contract wins); Empty state |
| P-ACC-09 | Role editor | P2 | Ready | ⬜ | |
| P-ACC-10 | Permissions reference | P2 | Ready | ⬜ | permissions by reference (Inv. #10) |
| P-ACC-11 | Delegation grants | P2 | Ready | ⬜ | |
| P-ACC-12 | Delegation grant editor | P2 | Waiting Decision | ⬜ | `ESC-IDN-DELEG-EXPIRY` (reinstate path) |
| P-ACC-13 | Workflow settings | P2 | Ready | ⬜ | approval chain + threshold |
| P-ACC-14 | Buyer profile settings | P1 | Ready | 🟩 Built | account page (partial) |
| P-ACC-15 | Notification preferences | P2 | Ready | ⬜ | |
| P-ACC-16 | Plans / catalog | P1 | Ready | ⬜ | |
| P-ACC-17 | Subscription | P1 | Ready | ⬜ | entitlements, not plan-name (Inv. #10) |
| P-ACC-18 | Usage & quota | P2 | Ready | ⬜ | |
| P-ACC-19 | Lead credits | P2 | Ready | ⬜ | |
| P-ACC-20 | Platform invoices | P2 | Ready | ⬜ | ≠ trade invoices |
| P-ACC-21 | Platform invoice detail | P2 | Ready | ⬜ | |
| P-ACC-22 | Rewards / referrals | P3 | Ready | ⬜ | |
