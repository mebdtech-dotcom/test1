# Doc-6C — M1 Identity & Organization (`identity`) Schema Realization — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 4 MINOR + 1 NITPICK dispositioned; §Review Disposition). Freeze-ready → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Module | **Module 1 — Identity & Organization** (`identity` schema; users, orgs, memberships, roles, permissions, delegation — the tenant boundary + the authorization substrate). The first module with org-tenant-anchored RLS, `human_ref` carriers, named state machines, and a dual-party aggregate |
| Realizes | **Doc-2 §10.2** — **9 tables**: `users` · `organizations` · `memberships` · `roles` · `permissions` · `role_permissions` · `organization_workflow_settings` · `buyer_profiles` · `delegation_grants` (Doc-2 §2/§3.2/§5.1/§5.2/§5.10/§6/§7/§10.2) — as physical PostgreSQL/Prisma schema, **against the frozen `Doc-6A` conventions** |
| Authority | **`Doc-6A_SERIES_FROZEN_v1.0` governs** (Appendix A = freeze gate); **Doc-2 v1.0.3 = binding *what*-authority**; `Doc-4C` (M1 contract owner — consumed); `Doc-3 §12` POLICY; `Doc-6B` (`core.allocate_human_ref` consumed — DR-6-CORE) |
| Precedent (informational, not authority) | `Doc-6B` (the first per-module schema; CR4′ flag-and-halt; per-pass cycle); force derives from `Doc-6A`, never from Doc-6B |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0 (Core consumed), Doc-4C v1.0 (FROZEN — M1 contracts), Doc-4M v1.0 (state-machine index), Doc-6A v1.0 (FROZEN), Doc-6B v1.0 (FROZEN — `core` consumed) |
| Contains | Structure only — section map, the 9-table partition, proposed ratified realization decisions (DC-CR-set), the state-machine realization plan, the Appendix-A applicability map, carried dependencies (incl. the **`[ESC-6-POLICY]` identity gate**). No DDL/Prisma/migration/RLS bodies (content passes) |
| Audience | Architecture Board · DDD/Security Architect · Doc-6C content authors (human + AI) · AI Coding Supervisor · backend, DBA |
| Module note | `identity` is the **authorization substrate**: the access formula (active membership + permission + delegation) is **app-layer** (Doc-4C `check_permission` §C3); **RLS is the defense-in-depth backstop** (Doc-6A §4.5). The **first real `organization_id` RLS anchor** lands here, plus the **dual-party** `delegation_grants` anchors |

Two governing rules:

1. **Realize, never re-decide.** Doc-2 §10.2 fixed *what* `identity` persists (9 tables, columns, 3 state machines — FROZEN); Doc-6A fixed *how* (FROZEN). Doc-6C realizes; coins no table/column/state/event/audit-action/POLICY-key.
2. **Conformance is an obligation.** Doc-6C passes Doc-6A Appendix A (`CHK-6-xxx`) before content freeze, and clears its `[ESC-6-*]` via named additive channels — **the `identity.*` POLICY gate (DC-CR9) is the content-freeze blocker**.

## Decisions proposed for ratification at structure freeze (DC-CR-set)

- **DC-CR1 — Nine tables (Doc-2 §10.2), coin nothing.** Exactly: `users`, `organizations`, `memberships`, `roles`, `permissions`, `role_permissions`, `organization_workflow_settings`, `buyer_profiles`, `delegation_grants` (Doc-4C §C1 ownership). 4 aggregate roots (User, Organization, Role, Delegation Grant); `permissions` is a platform-owned reference catalog, not an aggregate (Doc-2 §2). A tenth table is non-conformant.
- **DC-CR2 — Tenancy is mixed; the first real `organization_id` RLS anchor (Doc-2 §6 — binding).** Three classes: **platform-owned** (`users`, `permissions` — **no org anchor**); **tenant-owned** (`memberships`, `roles`, `role_permissions`, `organization_workflow_settings`, `buyer_profiles` — carry `organization_id`, RLS `= active org`); **shared dual-party** (`delegation_grants` — DC-CR7). **`roles` nuance (F-2):** `roles` is tenant-owned **with platform-seeded system bundles at `organization_id IS NULL`** (Doc-2 §10.2) — so its RLS read predicate is **`organization_id = active_org OR organization_id IS NULL`** (system bundles are globally readable; org-custom roles are org-scoped), and **writes to `organization_id IS NULL` rows are System-only** (the seed; an org may clone into its own `organization_id`, never mutate a system bundle). This is a §2.5 realization of the Doc-2 §10.2 NULL-seed model, **not** a contradiction of the tenant-owned class. RLS is the app-layer-authz **backstop** (Doc-6A §4.5); the active-org is server-validated, never client-supplied (Invariant #5). No cross-schema ownership traversal in any RLS policy (Doc-2 §6).
- **DC-CR3 — `users` platform-owned + personal-data; the auth boundary (Doc-4C DC-4).** `email UNIQUE WHERE deleted_at IS NULL`; **soft-delete = anonymize-on-departure** (not hard-delete; Doc-2 §10.2/§3.2). **Supabase Auth = authentication only** (login/password/2FA-challenge/session = infrastructure); `identity.users` owns the user record, preferences, and **2FA settings**, never the auth secret. `password(auth-managed)` is not a stored secret column — it is auth-managed (DC-4). No org anchor (platform-owned); RLS = self/platform-staff scope.
- **DC-CR4 — Soft-delete + partial-unique-live (the FIRST real use of Doc-6A §3.5).** Every soft-deletable unique is a partial unique index `WHERE deleted_at IS NULL`: `users.email`, `organizations.slug`, `memberships (user_id, organization_id)` (Doc-2 §10.2). SD=YES: users, organizations, memberships, roles, organization_workflow_settings, buyer_profiles, delegation_grants (roles SD=YES covers org-custom roles; the system-bundle seeds are platform seed data, not user-deleted — F-4). SD=NO: `permissions` (reference data) + `role_permissions` (row removal = revoke, audited) → plain constraints. `delete_reason` per Doc-6A §3.3.
- **DC-CR5 — `organizations` = the tenant root; `human_ref ORG-…` via `core.allocate_human_ref` (DR-6-CORE).** The first `human_ref` carrier — allocated by `core.allocate_human_ref('ORG', year)` (Doc-6B §3.3; consumed by pointer, not re-implemented). Self-tenant root (`organization_id` = own `id`); §5.1 state machine (DC-CR6); `slug UNIQUE(partial)` with the **restore-conflict regeneration** rule (Doc-2 §5.1 — on restore, regenerate a reused slug; the detection + regeneration algorithm is a §2.5 content realization choice, F-3); **cascade-on-soft-delete** (memberships→soft-deleted, vendor profile→suspended via M2 service, RFQs→archived via M3, quotations→preserved) is **service-orchestrated** (Doc-2 §5.1), never a cross-schema DB cascade.
- **DC-CR6 — Three named state machines (Doc-2 §5.1/§5.2/§5.10) + the simple `users` lifecycle, realized as enum status columns + CHECK; transition enforcement split (DR-6-STATE; Doc-6A §5.4).** Realize the status columns with the verbatim Doc-2 value sets — Organization `active|suspended|soft_deleted` (§5.1); Membership `invited|pending|active|suspended|removed` (§5.2); Delegation Grant `draft|active|suspended|revoked|expired` (§5.10) — each a CHECK against its value set. `users` carries the **simple** lifecycle `active|suspended|soft_deleted` (Doc-2 §3.2 — not a §5 named machine; F-8). **Simple invariants** (valid value set, terminal states) → DB CHECK; **complex governance guards** (Last-Owner Protection ≥1 active Owner; ownership succession before owner removal; dual-party authority; "only `active` participates in the access formula") → **service-layer** (the access formula is app-layer; a pure-DB trigger cannot express them). No state coined; edges bound to Doc-2 §5 / Doc-4M by pointer.
- **DC-CR7 — `delegation_grants` dual-party (Doc-2 §10.2/§5.10/§6 — binding).** Explicit party columns `controlling_organization_id` + `representative_organization_id` (the §6 RLS anchors — **both orgs read; only the controlling org creates/suspends/revokes/renews**, unless explicitly delegated). `vendor_profile_id` = **cross-module bare UUID** (M2 Marketplace; validated at issue against the Vendor Service — Doc-4C; **no FK**). `permission_set_jsonb` = a slug array (delegated authority ⊆ existing; **never ownership-class**). On revoke/expiry, the derived **`rfq_invitation_grantees` (M3-owned)** rows + visibility records for that representative are removed **via service/event** (refresh-on-revocation — Doc-2 §6/§5.10), never a cross-schema write. The grant **delegates** authority, never **creates** it.
- **DC-CR8 — Roles / permissions / role_permissions; two role dimensions (Invariant #2).** `roles` tenant-owned (`organization_id`; the Owner/Director/Manager/Officer **platform seeds** carry `org_id NULL` — A-08; `is_system_bundle`); `permissions` platform catalog (`slug UNIQUE`, `space ∈ {tenant, staff}`); `role_permissions` N:N (PK `(role_id, permission_id)`, `organization_id`; row-removal = revoke, audited). **Two independent dimensions** (Invariant #2): Platform Participation (the `staff_*` slug space — platform operators) vs Org Role (Owner/Director/Manager/Officer + org-custom). The **45 permission slugs** (38 tenant + 7 staff — Doc-2 §7) + the role bundles are **seed data, by pointer to Doc-2 §7 / A-08, none coined** (DC-CR9-seed in §5).
- **DC-CR9 — `[ESC-6-POLICY]` (identity) — the LOAD-BEARING content-freeze gate.** Doc-4C `[DC-5]` references multiple `identity.*` POLICY keys by name — known to include `identity.user_update_dedup_window`, `identity.command_dedup_window`, `identity.membership_invite_dedup_window`, `identity.membership_invite_expiry_window`, `identity.ownership_succession_reminder_cadence`, `identity.delegation_validity_default`, `identity.delegation_expiry_sweep_cadence`, plus a **conditional per-user org-count cap** key (F-1) — but **none is registered** (there is **no `Doc-3_Policy_Key_Registration_Patch` for identity**; v1.0–v1.8 skip it — the open question Doc-6A flagged). **The authoritative, exhaustive key set is enumerated in Doc-4C `[DC-5]` (bound by pointer here, not closed/restated)** — the list above is indicative, not exhaustive. **Resolution = an additive `Doc-3 §12.2` patch (next sequence number at authoring — `v1.9_Identity` by current count, F-6), human/Board-approved**, registering the **complete** Doc-4C `[DC-5]` set + start values before content freeze. **Doc-6C coins no key and invents no value** (Doc-6A §9; Doc-3/Doc-4C is authority). Persistence that references these keys (idempotency-dedup store; the org-count-cap check on `create_organization`; the membership-invite + delegation-validity/expiry timers) reads them from `core.system_configuration`, never a literal.
- **DC-CR10 — Intra-schema FKs permitted; the sole cross-module ref is bare UUID.** All identity relationships are **same-schema** (Doc-6A §5.2 permits real FKs within a module): `memberships → organizations, users`; `roles → organizations`; `role_permissions → roles, permissions`; `organization_workflow_settings → organizations`; `buyer_profiles → organizations`; `delegation_grants → organizations ×2`. The **only cross-module reference** is `delegation_grants.vendor_profile_id` (M2) — **bare UUID, no cross-schema FK** (Doc-2 §0.3; service-validated; orphan-scan reconciled — Doc-6A §5.5).
- **DC-CR11 — Consumed-not-coupled (Doc-4C obligations + DR-6-CORE).** The authorization reads (`check_permission`, `get_user`, `get_organization`, `get_membership` — internal-service, no wire — Doc-4C §C3/R1) and the Supabase Auth boundary (DC-4) are **Doc-4C code, referenced not re-authored**; `human_ref`/UUIDv7/audit/outbox/POLICY come from `core` (Doc-6B, by pointer). The access formula is app-layer; RLS is the backstop (Doc-6A §4.5).

## The `identity` schema partition (the structural spine)

> **9 Doc-2 §10.2 tables**, each realized in exactly one §3.x. Tenancy mixed (2 platform-owned · 5 tenant-owned · 1 shared dual-party); 3 state machines; 1 `human_ref` carrier; the only cross-module ref is `delegation_grants.vendor_profile_id`.

| Doc-2 §10.2 table | Tenancy (RLS anchor) | SD | FK (intra) / Ref (cross) | human_ref | State machine | Doc-6C § |
|---|---|---|---|---|---|---|
| `identity.users` | platform-owned (self/staff) | YES (anonymize) | — | — | simple (active/suspended/soft-deleted) | **§3.1** |
| `identity.organizations` | self (tenant root) | YES (cascade) | — | **`ORG-…`** | **§5.1 Organization** | **§3.2** |
| `identity.memberships` | tenant (`organization_id`) | YES | → organizations, users | — | **§5.2 Membership** | **§3.3** |
| `identity.roles` | tenant (`organization_id`; seeds NULL) | YES | → organizations | — | simple | **§3.4** |
| `identity.permissions` | platform-owned (catalog) | NO | — | — | simple | **§3.5** |
| `identity.role_permissions` | tenant (`organization_id`) | NO (revoke=audited) | → roles, permissions | — | simple | **§3.6** |
| `identity.organization_workflow_settings` | tenant (`organization_id`) | YES | → organizations | — | simple | **§3.7** |
| `identity.buyer_profiles` | tenant (`organization_id`) | YES | → organizations | — | simple | **§3.8** |
| `identity.delegation_grants` | **shared dual-party** (`controlling_organization_id` / `representative_organization_id`) | YES | → organizations ×2 / **`vendor_profile_id` (M2)** | — | **§5.10 Delegation Grant** | **§3.9** |

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4B/4C → **Doc-6A → Doc-6B → Doc-6C** → Code; Doc-6C consumes Doc-4C + Doc-6B `core`, gated by Doc-6A Appendix A); realize-never-redecide; conform to Doc-6A + pass Appendix A; flag-and-halt. State the two freeze obligations up front, and that **`[ESC-6-POLICY]` (identity, DC-CR9) is a content-freeze blocker** resolved only via the additive `Doc-3 §12.2` v1.9 patch.
- **Dependencies:** `Doc-6A §0/§13`; `Doc-2 §10.2`; `Doc-4C §0.2/§C1`. **Detail:** short, normative.

## §1 — Scope & the `identity` Table Partition
- **Purpose:** what Doc-6C governs (9 `identity` tables) and not (the Doc-4C *contracts/obligations* + Supabase Auth = referenced, not re-authored — DC-CR11; the only cross-module ref `vendor_profile_id` → M2/Doc-6D by pointer); carry the partition table; register carried dependencies (`DR-6-CORE` consumed; `[ESC-6-POLICY]` identity gate; `[ESC-6-API]` Doc-5C cross-check; `DR-6-STATE`).
- **Dependencies:** `Doc-2 §2/§3.2/§10.2`; `Doc-4C §C1`; `Doc-6A §1`. **Detail:** scope + partition + carried-dependency table.

## §2 — Tenancy & RLS Realization Model *(mechanism only — the load-bearing section)*
- **Purpose:** realize Doc-2 §6 + Doc-6A §4 for the first real tenant surface, with an **explicit per-class RLS policy plan** (F-5):
  - **Tenant-owned (5 tables):** RLS `USING (organization_id = active_org)` (server-set GUC — Doc-6A §4.2; never client-supplied — Invariant #5).
  - **`roles` (tenant-owned + system seeds):** read `USING (organization_id = active_org OR organization_id IS NULL)`; write to NULL-org system bundles = System-only (F-2/DC-CR2).
  - **`delegation_grants` (dual-party — the most complex):** read `USING (active_org IN (controlling_organization_id, representative_organization_id))`; write/manage `USING (active_org = controlling_organization_id)` (DC-CR7; Doc-2 §5.10/§6). Anchors on the explicit party columns — **no cross-schema ownership traversal** (Doc-2 §6).
  - **Platform-owned (`users`, `permissions`):** no org anchor; self/platform-staff scope.
  Authorization is **app-layer** (Doc-4C `check_permission`); RLS is the backstop (Doc-6A §4.5). The **refresh-on-revocation** obligation (delegation revoke/expiry → remove derived M3 `rfq_invitation_grantees` + visibility rows via service/event — DC-CR7) is realized in code, not a cross-schema write. The positive/negative/cross-tenant RLS **tests** are Doc-8's gate (Doc-6A §11.5), referenced; the schema must make them satisfiable.
- **Dependencies:** `Doc-2 §6/§10.2`; `Doc-6A §4`; `Doc-4C §C3` (authz root). **Detail:** tenancy classes + RLS policy plan (per-table) + dual-party model.

## §3 — Per-Table Realization (§3.1 `users` … §3.9 `delegation_grants`)
- **Purpose:** one subsection per table — columns verbatim (Doc-2 §10.2), tenancy/RLS posture (§2), SD + partial-unique-live (DC-CR4), intra-schema FKs (DC-CR10), state column + CHECK where applicable (DC-CR6, §4), `human_ref` on `organizations` (DC-CR5), the dual-party + cross-module-UUID on `delegation_grants` (DC-CR7), indexes for the Doc-5C reads (Band H — §C3 internal-service + the GET list endpoints). Each binds Doc-2 §10.2 by pointer; physical specifics §2.5-tagged.
- **Dependencies:** `Doc-2 §10.2`; `Doc-4C` (per-entity contracts); `Doc-6A §3/§5/§6/§10`; `Doc-6B §3.3` (`allocate_human_ref`). **Detail:** 9 per-table realizations (content pass).

## §4 — State Machine Realization (Doc-2 §5.1 · §5.2 · §5.10)
- **Purpose:** realize the 3 named machines (DC-CR6) — status enum columns + CHECK against the verbatim Doc-2 value sets; the **split**: simple invariants (value set, terminal `removed`/`revoked`/`expired`) at the DB; complex governance guards (Last-Owner Protection, ownership succession, dual-party authority, "only `active` participates") at the **service layer** (DR-6-STATE; bound to Doc-2 §5 / Doc-4M by pointer); transitions emit Doc-2 §8 events via the `core.outbox_events` transactional contract (Doc-6B §3.2) where Doc-2 §8 declares one — **no event coined**.
- **Dependencies:** `Doc-2 §5.1/§5.2/§5.10/§8`; `Doc-4M`; `Doc-6A §5.4/§6/§7`. **Detail:** state-column realization + guard-placement plan.

## §5 — Permissions, Roles & Seed (A-08 / Doc-2 §7)
- **Purpose:** realize the role/permission model (DC-CR8) — the `permissions` catalog seed (45 slugs: 38 tenant + 7 staff, `space ∈ {tenant, staff}` — Doc-2 §7 by pointer); the role-bundle platform seeds (Owner/Director/Manager/Officer, `org_id NULL`, `is_system_bundle` — A-08) + their `role_permissions` composition (per Doc-2 §7 bundle defaults); the two-dimension invariant (#2). All **seed data, idempotent forward-only, by pointer, none coined** (Doc-6A §9.4/§11.3).
- **Dependencies:** `Doc-2 §7`; A-08; `Doc-6A §9.4/§11.3`. **Detail:** permission/role seed plan.

## §6 — POLICY & Migration *(incl. the `[ESC-6-POLICY]` identity gate)*
- **Purpose:** the `identity` structural migration (forward-only, non-destructive — Doc-6A §11; order: schema → enums → 9 tables → intra-FKs → partial-unique-live indexes → state CHECKs → RLS policies → seeds); codegen → gitignored registry. **The `[ESC-6-POLICY]` identity gate (DC-CR9):** the `identity.*` keys (`user_update_dedup_window`, `command_dedup_window`, `membership_invite_dedup_window`, `ownership_succession_reminder_cadence`, per-user org-count cap) are **registered via an additive `Doc-3 §12.2` Patch v1.9_Identity (human/Board-approved)** before content freeze; the idempotency-dedup store + the org-count-cap check read them from `core.system_configuration`, never literals. **No key/value coined here.**
- **Dependencies:** `Doc-6A §9/§10/§11`; `Doc-3 §12.2`; `Doc-4C §DC-5`. **Detail:** migration order + the POLICY-gate resolution plan.

## §7 — Conformance & Carried Items
- **Purpose:** the attestation map against Doc-6A Appendix A (which checks apply / N/A-with-reason — **Band C Tenancy/RLS is now mostly PASS**, the first real org-anchor surface, unlike `core`); the carried register; Doc-6C coins nothing. Name the freeze obligation: pass Appendix A **and** clear `[ESC-6-POLICY]` via the v1.9 Doc-3 patch.
- **Dependencies:** `Doc-6A Appendix A`; `Doc-2 §10.2`. **Detail:** attestation map + register.

## Appendix A — Doc-6C Conformance Attestation (Doc-6A `CHK-6-xxx`)
- **Purpose:** per-check PASS / N/A-with-reason. Expected highlights: **Band A** PASS (`human_ref` on organizations — CHK-6-002 now PASS, the downstream signal Doc-6B flagged; partial-unique-live CHK-6-005 PASS, first real use) · **Band B** PASS (intra-schema FKs ok; sole cross-module ref = bare UUID) · **Band C** **PASS** (org-anchor RLS on 5 tenant-owned; dual-party on delegation; platform-owned on users/permissions; non-disclosure N/A — no blacklist content in identity) · **Band D** PASS (soft-delete; no authoritative hard-delete; anonymize-on-departure) · **Band E** PASS (state transitions → outbox; audit) · **Band F** N/A (no money) · **Band G** PASS **pending the v1.9 POLICY patch** (DC-CR9) · **Band H** PASS (Doc-5C reads — list_roles/permissions/delegation_grants/my_organizations/buyer_profile/workflow_settings + internal-service §C3) · **Band I** PASS · **Band J** PASS (B.1 base model, B.2 types, B.3 `actor_type` reuse, B.4 names).
- **Dependencies:** `Doc-6A Appendix A`; `Doc-5C` (M1 surface). **Detail:** attestation table (content pass).

---

## Open Carried Items

| ID | Item | Doc-6C handling | Freeze gate? |
|---|---|---|---|
| **DR-6-CORE** | `core` (id/human_ref/audit/outbox/POLICY) consumed | Referenced by pointer (Doc-6B); `organizations.human_ref` via `core.allocate_human_ref` | No |
| **DR-6-STATE** | 3 state machines (Doc-2 §5.1/§5.2/§5.10 / Doc-4M) | Status enum + CHECK (DB) + service-layer guards (DC-CR6); no edge coined | No |
| **DR-6-API** | Doc-5C (M1 API) persistable | Band H cross-check (reads + internal-service §C3) | No (per-module cross-check) |
| **DR-6-MKT** | `delegation_grants.vendor_profile_id` → M2 | Bare UUID, service-validated, no FK (DC-CR7/DC-CR10); orphan-scan | No |
| `[ESC-6-POLICY]` (identity) | `identity.*` keys ([DC-5]) **unregistered** — no Doc-3 identity patch | **Resolved via additive `Doc-3 §12.2` Patch v1.9_Identity (human/Board-approved)** before content freeze; no key/value coined | **Structure: No. Content: YES** — the load-bearing gate (DC-CR9) |
| `[ESC-6-SCHEMA]` | Any `identity` need with no Doc-2 §10.2 source | None expected; additive Doc-2 patch if any | Possible (none expected) |
| `[ESC-6-API]` | A Doc-5C surface not persistable | None expected; flag-and-halt if any | Possible |

## Fences / Out of scope

Authoring any non-`identity` table · the Doc-4C contracts/obligations + Supabase Auth (code, referenced) · coining any table/column/state/event/audit-action/POLICY-key · registering POLICY keys (Doc-3's additive channel — DC-CR9, human-approved) · changing any Doc-2 declaration · a cross-schema FK (the only cross-module ref is bare-UUID `vendor_profile_id`) · cross-schema ownership traversal in RLS (delegation anchors on explicit party columns) · a delegation grant creating ownership-class authority (DC-CR7) · expressing the full access formula or Last-Owner Protection as pure DB (service-layer — DC-CR6) · DDL/Prisma/migration bodies (content passes).

---

## Provenance & next steps

- **Provenance:** first Doc-6C artifact. Grounded in Doc-2 §10.2 (9 tables, the *what*), Doc-6A (the *how*, FROZEN), Doc-6B (`core` consumed), Doc-4C (M1 ownership/obligations + the `[DC-5]` POLICY needs). No frozen doc edited; nothing coined.
- **Status:** **PROPOSAL v0.1 — pre-review.** DC-CR1–DC-CR11; partition = 9 tables; section map §0–§7 + Appendix A. **Load-bearing carried gate: `[ESC-6-POLICY]` identity (DC-CR9) → additive Doc-3 v1.9 patch at content.**
- **Next:** Independent Hard Review (v0.1 → v0.2) → Structure Freeze Audit → `Doc-6C_Structure_v1.0_FROZEN` → content passes (per-table DDL/Prisma + RLS + state CHECKs + the permission/role seed) + the **Doc-3 v1.9_Identity POLICY patch** → Content Freeze Audit → `Doc-6C_SERIES_FROZEN`.

## Review Disposition (Independent Hard Review — Structure v0.1 → v0.2)

Reviewer: independent (Architecture Board / DDD / Security). Verified CORRECT: 9-table set (Doc-2 §10.2 / Doc-4C §C1); 3 state-machine value sets verbatim (§5.1/§5.2/§5.10); tenancy classes (§6); sole cross-module ref `delegation_grants.vendor_profile_id` (M2); `human_ref` on organizations only; intra-schema FKs all same-schema.

| Finding | Sev | Disposition |
|---|---|---|
| **F-1** `[ESC-6-POLICY]` key list incomplete (Doc-4C `[DC-5]` names more `identity.*` keys: delegation_validity_default, delegation_expiry_sweep_cadence, membership_invite_expiry_window; org-count cap conditional) | BLOCKER | **FIXED** — DC-CR9 now binds the **full Doc-4C `[DC-5]` set by pointer** (indicative, non-exhaustive list expanded); the v1.9 patch enumerates authoritatively. Coins nothing. |
| **F-2** `roles` `org_id NULL` platform seeds break `organization_id = active org` RLS | MAJOR | **FIXED** — DC-CR2 + §2: roles RLS read `= active_org OR organization_id IS NULL` (system bundles global-read; NULL-org writes System-only). §2.5 realization of the Doc-2 §10.2 NULL-seed model. |
| **F-5** delegation_grants RLS stated as business rule, not a §2 policy plan | MAJOR | **FIXED** — §2 now carries an explicit per-class RLS policy plan (tenant-owned; roles NULL-seed; delegation dual-party read/write; platform-owned). |
| **F-3** restore-conflict slug regeneration under-specified | MINOR | **FIXED** — DC-CR5 flags detection+regeneration as a §2.5 content choice. |
| **F-4** roles SD justification absent | MINOR | **FIXED** — DC-CR4: roles SD=YES covers org-custom; system bundles = seed, not user-deleted. |
| **F-6** v1.9 patch numbering assumption | MINOR | **FIXED** — DC-CR9: "next sequence number at authoring (v1.9 by current count)." |
| **F-8** users state set missing from DC-CR6 narrative | NIT | **FIXED** — DC-CR6 adds the `users` simple lifecycle (§3.2). |
| **F-7** partition-table dual-party notation shorthand | NIT | **FIXED** — expanded to `controlling_organization_id / representative_organization_id`. |

**Net:** BLOCKER (POLICY key set) + 2 MAJOR (roles-NULL RLS, delegation RLS plan) fixed; MINOR/NIT applied. Coins nothing; the v1.9 Doc-3 patch (authoritative `[DC-5]` enumeration) remains the content-freeze gate. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6C Canonical Structure **Proposal v0.2** — structure only; Independent Hard Review applied (0 open BLOCKER/MAJOR/MINOR — freeze-ready). On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6C realizes the 9 `identity` tables verbatim from Doc-2 §10.2 against the frozen Doc-6A conventions; first real org-anchor RLS + dual-party delegation + `human_ref` + state machines; coins nothing. The `[ESC-6-POLICY]` identity gate (DC-CR9) is the load-bearing content-freeze blocker.*
