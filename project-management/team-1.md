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
| P-AUTH-03 | Org setup (post-signup) | P0 | Ready | ⬜ | every user ≥1 org |
| P-AUTH-04 | Password reset — request | P1 | Ready | ⬜ | |
| P-AUTH-05 | Password reset — confirm | P1 | Ready | ⬜ | |
| P-AUTH-06 | 2FA challenge | P2 | Ready | ⬜ | |
| P-AUTH-07 | Accept invitation / join org | P1 | Ready | ⬜ | |
| P-AUTH-08 | Email verification | P1 | Ready | ⬜ | |

## Account & Identity — `P-ACC-*` (Doc-7E)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-ACC-01 | Account overview | P1 | Ready | ⬜ | |
| P-ACC-02 | User profile | P1 | Ready | ⬜ | |
| P-ACC-03 | Security & 2FA | P2 | Ready | ⬜ | |
| P-ACC-04 | Organization profile | P1 | Ready | ⬜ | |
| P-ACC-05 | Organization lifecycle | P2 | Ready | ⬜ | soft-delete (Inv. #8) |
| P-ACC-06 | Members | P1 | Ready | ⬜ | |
| P-ACC-07 | Invite member | P1 | Ready | ⬜ | |
| P-ACC-08 | Roles | P2 | Ready | ⬜ | |
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
