# Doc-6C — M1 Identity & Organization (`identity`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `identity` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6C_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied: 1 BLOCKER + 2 MAJOR + 4 MINOR + 1 NIT resolved; history retained there). Certified by `Doc-6C_Structure_Freeze_Audit_v1.0.md` |
| Module | **M1 — Identity & Organization** (`identity` schema; the tenant boundary + authorization substrate). First module with org-anchor RLS, `human_ref`, named state machines, dual-party aggregate |
| Realizes | **Doc-2 §10.2** — 9 tables (`users`/`organizations`/`memberships`/`roles`/`permissions`/`role_permissions`/`organization_workflow_settings`/`buyer_profiles`/`delegation_grants`) as PostgreSQL/Prisma schema, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4C (M1 contracts, consumed); Doc-6B (`core` consumed — DR-6-CORE); Doc-3 §12 (POLICY) |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B/4C v1.0, Doc-4M v1.0, Doc-6A v1.0 (FROZEN), Doc-6B v1.0 (FROZEN) |
| Contains | Structure only — section map, 9-table partition, ratified decisions (DC-CR1–DC-CR11), state-machine plan, Appendix-A applicability map, carried dependencies (incl. the `[ESC-6-POLICY]` identity gate). No DDL/Prisma/RLS bodies (content passes) |
| Module note | The access formula (active membership + permission + delegation) is **app-layer** (Doc-4C `check_permission`); **RLS is the backstop** (Doc-6A §4.5). First real `organization_id` RLS anchor + dual-party `delegation_grants` anchors |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.2 = *what*, FROZEN; Doc-6A = *how*, FROZEN; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named additive channels — the `identity.*` POLICY gate (DC-CR9) is the content-freeze blocker).

## Decisions ratified at structure freeze (DC-CR-set)

- **DC-CR1 — Nine tables (Doc-2 §10.2), coin nothing.** 4 aggregate roots (User, Organization, Role, Delegation Grant); `permissions` = platform-owned reference catalog (not an aggregate — Doc-2 §2). A tenth table is non-conformant.
- **DC-CR2 — Mixed tenancy; first real `organization_id` RLS anchor (Doc-2 §6).** Platform-owned (`users`, `permissions` — no org anchor); tenant-owned (`memberships`, `roles`, `role_permissions`, `organization_workflow_settings`, `buyer_profiles` — `organization_id`, RLS `= active org`); shared dual-party (`delegation_grants` — DC-CR7). **`roles`:** tenant-owned with platform system-bundle seeds at `organization_id IS NULL` → RLS read `= active_org OR organization_id IS NULL` (system bundles global-read; NULL-org writes System-only) — a §2.5 realization of the Doc-2 §10.2 NULL-seed model. RLS = app-layer-authz backstop (Doc-6A §4.5); active-org server-validated (Invariant #5); no cross-schema ownership traversal (Doc-2 §6).
- **DC-CR3 — `users` platform-owned + personal-data; auth boundary (Doc-4C DC-4).** `email UNIQUE WHERE deleted_at IS NULL`; soft-delete = anonymize-on-departure (not hard). **Supabase Auth = authentication only** (login/password/2FA-challenge/session = infra); `identity.users` owns the user record, preferences, 2FA *settings* — never the auth secret (`password(auth-managed)` ≠ a stored secret column). No org anchor (self/staff scope).
- **DC-CR4 — Soft-delete + partial-unique-live (first real use of Doc-6A §3.5).** Partial unique `WHERE deleted_at IS NULL`: `users.email`, `organizations.slug`, `memberships (user_id, organization_id)`. SD=YES: users, organizations, memberships, roles (org-custom; system bundles are seed), organization_workflow_settings, buyer_profiles, delegation_grants. SD=NO: `permissions`, `role_permissions` (row removal = revoke, audited).
- **DC-CR5 — `organizations` = tenant root; `human_ref ORG-…` via `core.allocate_human_ref` (DR-6-CORE).** First `human_ref` carrier (consumed from Doc-6B §3.3, not re-implemented). Self-tenant root; §5.1 state machine; `slug UNIQUE(partial)` + restore-conflict regeneration (Doc-2 §5.1; algorithm a §2.5 content choice); cascade-on-soft-delete (memberships→soft-deleted; vendor profile→suspended via M2; RFQs→archived via M3; quotations→preserved) is **service-orchestrated**, never a cross-schema DB cascade.
- **DC-CR6 — Three named state machines + `users` simple lifecycle, as enum status + CHECK; transition split (DR-6-STATE; Doc-6A §5.4).** Verbatim value sets — Organization `active|suspended|soft_deleted` (§5.1); Membership `invited|pending|active|suspended|removed` (§5.2); Delegation Grant `draft|active|suspended|revoked|expired` (§5.10); `users` simple `active|suspended|soft_deleted` (§3.2). Simple invariants → DB CHECK; complex governance guards (Last-Owner Protection, ownership succession, dual-party authority, "only `active` participates") → service-layer. No state coined; edges bound to Doc-2 §5 / Doc-4M.
- **DC-CR7 — `delegation_grants` dual-party (Doc-2 §10.2/§5.10/§6).** Party columns `controlling_organization_id` + `representative_organization_id` (§6 RLS anchors — both read; only controlling creates/suspends/revokes/renews). `vendor_profile_id` = cross-module bare UUID (M2; validated at issue against the Vendor Service; no FK). `permission_set_jsonb` = slug array (delegated ⊆ existing; never ownership-class). Revoke/expiry removes derived `rfq_invitation_grantees` (M3) + visibility rows **via service/event** (refresh-on-revocation — Doc-2 §6/§5.10). Delegates authority, never creates it.
- **DC-CR8 — Roles / permissions / role_permissions; two role dimensions (Invariant #2).** `roles` tenant-owned (`organization_id`; system bundles `org_id NULL`, `is_system_bundle`); `permissions` platform catalog (`slug UNIQUE`, `space ∈ {tenant, staff}`); `role_permissions` N:N (PK `(role_id, permission_id)`, `organization_id`; row-removal = revoke, audited). Two independent dimensions: Platform Participation (`staff_*` slugs) vs Org Role (Owner/Director/Manager/Officer + org-custom). The 45 slugs (38 tenant + 7 staff — Doc-2 §7) + role bundles = seed data, by pointer, none coined.
- **DC-CR9 — `[ESC-6-POLICY]` (identity) — LOAD-BEARING content-freeze gate.** Doc-4C `[DC-5]` references multiple `identity.*` keys (incl. `user_update_dedup_window`, `command_dedup_window`, `membership_invite_dedup_window`, `membership_invite_expiry_window`, `ownership_succession_reminder_cadence`, `delegation_validity_default`, `delegation_expiry_sweep_cadence`, + a conditional per-user org-count cap) — **the authoritative exhaustive set is enumerated in Doc-4C `[DC-5]`** (bound by pointer; the list here is indicative). **None registered** (no Doc-3 identity patch; v1.0–v1.8 skip it). **Resolution = an additive `Doc-3 §12.2` patch (next sequence number; `v1.9_Identity` by current count), human/Board-approved**, registering the complete set + start values before content freeze. Coins no key/value (Doc-3/Doc-4C authority); persistence reads keys from `core.system_configuration`, never literals.
- **DC-CR10 — Intra-schema FKs permitted; sole cross-module ref is bare UUID.** Same-schema FKs (Doc-6A §5.2): `memberships→organizations,users`; `roles→organizations`; `role_permissions→roles,permissions`; `organization_workflow_settings→organizations`; `buyer_profiles→organizations`; `delegation_grants→organizations ×2`. Only cross-module ref = `delegation_grants.vendor_profile_id` (M2) — bare UUID, no cross-schema FK (Doc-2 §0.3; service-validated; orphan-scan).
- **DC-CR11 — Consumed-not-coupled (Doc-4C + DR-6-CORE).** Authorization reads (`check_permission`/`get_user`/`get_organization`/`get_membership` — internal-service, no wire — Doc-4C §C3/R1) + Supabase Auth boundary (DC-4) = Doc-4C code, referenced; `human_ref`/UUIDv7/audit/outbox/POLICY from `core` (Doc-6B). Access formula app-layer; RLS backstop.

## The `identity` schema partition (the structural spine)

| Doc-2 §10.2 table | Tenancy (RLS anchor) | SD | FK (intra) / Ref (cross) | human_ref | State machine | Doc-6C § |
|---|---|---|---|---|---|---|
| `identity.users` | platform-owned (self/staff) | YES (anonymize) | — | — | simple (active/suspended/soft-deleted) | **§3.1** |
| `identity.organizations` | self (tenant root) | YES (cascade) | — | **`ORG-…`** | **§5.1 Organization** | **§3.2** |
| `identity.memberships` | tenant (`organization_id`) | YES | → organizations, users | — | **§5.2 Membership** | **§3.3** |
| `identity.roles` | tenant (`organization_id`; system seeds NULL → global-read) | YES | → organizations | — | simple | **§3.4** |
| `identity.permissions` | platform-owned (catalog) | NO | — | — | simple | **§3.5** |
| `identity.role_permissions` | tenant (`organization_id`) | NO (revoke=audited) | → roles, permissions | — | simple | **§3.6** |
| `identity.organization_workflow_settings` | tenant (`organization_id`) | YES | → organizations | — | simple | **§3.7** |
| `identity.buyer_profiles` | tenant (`organization_id`) | YES | → organizations | — | simple | **§3.8** |
| `identity.delegation_grants` | **shared dual-party** (`controlling_organization_id` / `representative_organization_id`) | YES | → organizations ×2 / **`vendor_profile_id` (M2)** | — | **§5.10 Delegation Grant** | **§3.9** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4B/4C → Doc-6A → Doc-6B → **Doc-6C** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. `[ESC-6-POLICY]` (DC-CR9) is the content-freeze blocker (→ Doc-3 v1.9 patch). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.2`; `Doc-4C §0.2/§C1`.

## §1 — Scope & the `identity` Table Partition
What Doc-6C governs (9 tables) / not (Doc-4C contracts + Supabase Auth referenced; `vendor_profile_id`→M2 by pointer); the partition; carried dependencies. **Deps:** `Doc-2 §2/§3.2/§10.2`; `Doc-4C §C1`; `Doc-6A §1`.

## §2 — Tenancy & RLS Realization Model *(load-bearing; mechanism only)*
Explicit per-class RLS policy plan: tenant-owned `USING (organization_id = active_org)`; `roles` read `= active_org OR organization_id IS NULL` (NULL-org writes System-only); `delegation_grants` read `active_org IN (controlling_organization_id, representative_organization_id)`, write `active_org = controlling_organization_id`; platform-owned (`users`/`permissions`) self/staff scope. App-layer authz (Doc-4C `check_permission`); RLS backstop (Doc-6A §4.5); refresh-on-revocation (service/event). RLS tests = Doc-8 (Doc-6A §11.5). **Deps:** `Doc-2 §6/§10.2`; `Doc-6A §4`; `Doc-4C §C3`.

## §3 — Per-Table Realization (§3.1 `users` … §3.9 `delegation_grants`)
One subsection per table — columns verbatim (Doc-2 §10.2), tenancy/RLS posture (§2), SD + partial-unique-live (DC-CR4), intra-schema FKs (DC-CR10), state column + CHECK (DC-CR6/§4), `human_ref` on organizations (DC-CR5), dual-party + cross-module-UUID on delegation_grants (DC-CR7), Band-H indexes (Doc-5C reads + §C3). **Deps:** `Doc-2 §10.2`; `Doc-4C`; `Doc-6A §3/§5/§6/§10`; `Doc-6B §3.3`.

## §4 — State Machine Realization (Doc-2 §5.1 · §5.2 · §5.10)
Status enum + CHECK (verbatim value sets); split — simple invariants at DB, complex governance guards (Last-Owner Protection, ownership succession, dual-party authority, "only `active` participates") at service-layer (DR-6-STATE); transitions → `core.outbox_events` where Doc-2 §8 declares an event; none coined. **Deps:** `Doc-2 §5.1/§5.2/§5.10/§8`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Permissions, Roles & Seed (A-08 / Doc-2 §7)
The `permissions` catalog seed (45 slugs; `space ∈ {tenant, staff}`); role-bundle platform seeds (Owner/Director/Manager/Officer, `org_id NULL`, `is_system_bundle`) + `role_permissions` composition; two-dimension invariant (#2). Seed data, idempotent forward-only, by pointer, none coined. **Deps:** `Doc-2 §7`; A-08; `Doc-6A §9.4/§11.3`.

## §6 — POLICY & Migration *(incl. the `[ESC-6-POLICY]` identity gate)*
Forward-only migration (schema → enums → 9 tables → intra-FKs → partial-unique-live → state CHECKs → RLS policies → seeds); codegen → gitignored registry. **The gate (DC-CR9):** the `identity.*` keys registered via additive `Doc-3 §12.2 v1.9_Identity` (human/Board-approved) before content freeze; persistence reads from `core.system_configuration`, never literals. **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 §12.2`; `Doc-4C §DC-5`.

## §7 — Conformance & Carried Items
Attestation map vs Doc-6A Appendix A (Band C now PASS — first real RLS; Band G PASS-pending-v1.9); carried register; coins nothing. Freeze obligation: pass Appendix A + clear `[ESC-6-POLICY]` via the v1.9 patch. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.2`.

## Appendix A — Doc-6C Conformance Attestation (Doc-6A `CHK-6-xxx`)
Per-check PASS / N/A-with-reason (content pass). Highlights: A PASS (CHK-6-002 PASS — organizations human_ref; CHK-6-005 partial-unique-live PASS) · B PASS · **C PASS** (org-anchor + roles-NULL + dual-party RLS) · D PASS · E PASS · F N/A · G PASS-pending-v1.9 · H PASS · I PASS · J PASS. **Deps:** `Doc-6A Appendix A`; `Doc-5C`.

---

## Open Carried Items
| ID | Item | Doc-6C handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE | `core` consumed | `organizations.human_ref` via `core.allocate_human_ref`; refs by pointer | No |
| DR-6-STATE | 3 machines + users lifecycle | enum+CHECK + service guards (DC-CR6) | No |
| DR-6-API | Doc-5C persistable | Band H | No |
| DR-6-MKT | `delegation_grants.vendor_profile_id`→M2 | bare UUID, service-validated, no FK | No |
| **`[ESC-6-POLICY]` (identity)** | `identity.*` keys unregistered | additive **Doc-3 v1.9_Identity** (human/Board-approved); complete Doc-4C `[DC-5]` set; none coined | **Content: YES** |
| `[ESC-6-SCHEMA]` / `[ESC-6-API]` | additive Doc-2 patch / flag-and-halt | Possible (none expected) |

## Fences / Out of scope
Any non-`identity` table · Doc-4C contracts/obligations + Supabase Auth (code) · coining any element · registering POLICY keys (Doc-3's channel — DC-CR9, human-approved) · changing any Doc-2 declaration · a cross-schema FK · cross-schema ownership traversal in RLS · a grant creating ownership-class authority · expressing the access formula / Last-Owner Protection as pure DB · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6C Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2); certified by `Doc-6C_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6C realizes the 9 `identity` tables verbatim from Doc-2 §10.2 against the frozen Doc-6A conventions; first real org-anchor RLS + dual-party delegation + `human_ref` + state machines; coins nothing. The `[ESC-6-POLICY]` identity gate (DC-CR9) → additive Doc-3 v1.9 patch is the content-freeze blocker. Next: content passes + the v1.9 POLICY patch → Content Freeze Audit → `Doc-6C_SERIES_FROZEN`.*
