# Team-3 Queue — Vendor / Verification / Admin

**Owns:** `P-VND-*` (Doc-7G) · `P-ADM-*` (Doc-7H). Titles + bindings are the **source record** in
[`page_inventory.md`](../page_inventory.md). Vendor surface is ~complete; the bulk of remaining work
is **Admin (29 pages)**. Every Admin page **invokes** a wired Admin command; the **owning module owns
the effect** (R5) — no page writes Trust/Performance/Tier scores or makes matching/award decisions.
Verification = `P-VND-28` + `P-PUB-18` (Team-1) + `P-ADM-12/13`.

## Vendor Workspace — `P-VND-*` (Doc-7G)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-VND-01 | Vendor dashboard | P1 | Ready | 🟩 Built | |
| P-VND-02 | Profile editor | P1 | Ready | 🟩 Built | claim lifecycle (Inv. #3) |
| P-VND-03 | Capacity profile | P1 | Ready | 🟩 Built | |
| P-VND-04 | Declared financial tier | P1 | Ready | 🟩 Built | declared ≠ verified |
| P-VND-05 | Microsite editor (draft) | P1 | Ready | 🟩 Built | no draft leaks |
| P-VND-06 | Microsite preview | P1 | Ready | 🟩 Built | |
| P-VND-07 | Products | P1 | Ready | 🟩 Built | |
| P-VND-08 | Product create/edit | P1 | Ready | 🟩 Built | versioned |
| P-VND-09 | Spec library | P2 | Ready | ⬜ | wired write (not upload) |
| P-VND-10 | Spec documents | P2 | Waiting API | ⬜ | `ESC-7-API/upload` |
| P-VND-11 | Category assignment | P1 | Ready | 🟩 Built | admin-governed categories |
| P-VND-12 | Ads | P2 | Ready | ⬜ | placeholder page exists |
| P-VND-13 | Ad create/edit | P2 | Ready | ⬜ | |
| P-VND-14 | Ad submission / status | P2 | Ready | ⬜ | admin reviews |
| P-VND-15 | Invitations inbox | P1 | Ready | 🟩 Built | received-only |
| P-VND-16 | Invitation detail | P1 | Ready | 🟩 Built | decline = no penalty |
| P-VND-17 | Quotations | P1 | Ready | 🟩 Built | visibility-gated |
| P-VND-18 | Quotation create/edit | P1 | Ready | 🟩 Built | versioned |
| P-VND-19 | Quotation version history | P2 | Ready | 🟩 Built | |
| P-VND-20 | Quotation actions | P2 | Ready | 🟩 Built | withdraw = zero penalty |
| P-VND-21 | Leads pipeline | P1 | Ready | 🟩 Built | system-created leads |
| P-VND-22 | Lead detail | P1 | Ready | 🟩 Built | |
| P-VND-23 | Engagements (vendor) | P1 | Ready | 🟩 Built | |
| P-VND-24 | Engagement detail (vendor) | P1 | Ready | 🟩 Built | |
| P-VND-25 | Delivery challan | P2 | Ready | 🟩 Built | upload path → `ESC-7-API/upload` |
| P-VND-26 | Trade invoice issue | P2 | Ready | 🟩 Built | records only (DF-6) |
| P-VND-27 | Finance / payments (vendor) | P2 | Ready | ⬜ | placeholder today |
| P-VND-28 | Trust & performance | P1 | Waiting Decision | ⬜ | `ESC-7G-SCORE-DISPLAY` — **band-only, read-only** |

## Admin Console — `P-ADM-*` (Doc-7H · no active-org)

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-ADM-01 | Admin dashboard | P1 | Ready | ✅ Approved | RV-0003 PASS (Team-4). Deferred MINOR: relocate DashboardSection/PipelineLinks to a shared dashboard folder (2nd consumer) |
| P-ADM-02 | Moderation queue | P1 | Ready | ✅ Approved | RV-0006 PASS (Team-4). NIT: add route-level `loading.tsx` before `J-ADM-01` wiring. OBS: extract shared `AdminQueueTable` at 2nd admin queue |
| P-ADM-03 | Moderation case detail | P1 | Ready | ⬜ | |
| P-ADM-04 | RFQ moderation | P1 | Ready | ⬜ | pass→matching / reject→draft |
| P-ADM-05 | Bans | P2 | Ready | ⬜ | |
| P-ADM-06 | Ban detail / issue | P2 | Ready | ⬜ | emits `VendorBanned` |
| P-ADM-07 | Vendor approval queue | P1 | Ready | ⬜ | |
| P-ADM-08 | Category management | P1 | Ready | ⬜ | taxonomy admin-governed |
| P-ADM-09 | Category editor | P1 | Ready | ⬜ | |
| P-ADM-10 | Ad review queue | P2 | Ready | ⬜ | |
| P-ADM-11 | Ad review detail | P2 | Ready | ⬜ | |
| P-ADM-12 | Verification queue | P1 | Ready | ⬜ | M8 queues |
| P-ADM-13 | Verification task detail | P1 | Ready | ⬜ | → M5 owns score (**firewall**) |
| P-ADM-14 | Import jobs | P2 | Ready | ⬜ | |
| P-ADM-15 | Import job — new / detail | P2 | Ready | ⬜ | create-then-poll (async) |
| P-ADM-16 | Outreach campaigns | P3 | Ready | ⬜ | acquisition only |
| P-ADM-17 | Campaign detail | P3 | Ready | ⬜ | |
| P-ADM-18 | Outreach contacts | P3 | Ready | ⬜ | |
| P-ADM-19 | Routing rules | P2 | Ready | ⬜ | stage-gated |
| P-ADM-20 | Routing rule editor | P2 | Ready | ⬜ | |
| P-ADM-21 | Matching results (internal) | P2 | Ready | ⬜ | internal-service leg only |
| P-ADM-22 | Plan management | P2 | Ready | ⬜ | |
| P-ADM-23 | Plan editor | P2 | Ready | ⬜ | `activate_plan` admin-only |
| P-ADM-24 | Entitlements / bundles | P2 | Ready | ⬜ | |
| P-ADM-25 | Identity ops — orgs | P2 | Ready | ⬜ | no active-org |
| P-ADM-26 | Identity ops — users | P2 | Ready | ⬜ | |
| P-ADM-27 | Suggestion triage | P3 | Ready | ⬜ | non-disclosure |
| P-ADM-28 | Link triage | P3 | Ready | ⬜ | non-disclosure |
| P-ADM-29 | Support reads | P3 | Ready | ⬜ | support scope |
