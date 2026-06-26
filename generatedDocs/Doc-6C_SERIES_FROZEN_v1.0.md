# Doc-6C — M1 Identity & Organization (`identity`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6C Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M1 — Identity & Organization** (`identity` schema; the tenant boundary + authorization substrate) — the first org-tenant-anchored, dual-party, `human_ref`-carrying, state-machine module |
| Realizes | **Doc-2 §10.2** — 9 tables (`users`/`organizations`/`memberships`/`roles`/`permissions`/`role_permissions`/`organization_workflow_settings`/`buyer_profiles`/`delegation_grants`) as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with the frozen Doc-5C surface |
| Freeze evidence | `Doc-6C_Content_Freeze_Audit_v1.0.md` — APPROVE FOR FREEZE; 0 open BLOCKER/MAJOR/MINOR/NITPICK; 8 audit dimensions PASS |

---

## Effective set (the authoritative Doc-6C)

| Artifact | Role |
|---|---|
| `Doc-6C_Structure_v1.0_FROZEN.md` | Frozen structure — DC-CR1–CR11, 9-table partition, explicit per-class RLS plan, Appendix-A map |
| `Doc-6C_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-3_Policy_Key_Registration_Patch_v1.9_Identity.md` | **RATIFIED** — registers the 7 `identity.*` POLICY keys; clears `[ESC-6-POLICY]` (DC-CR9) |
| `Doc-6C_Content_v1.0_Pass1.md` | §0–§2 RLS model · `users` (auth boundary) · `organizations` (human_ref, §5.1) · `memberships` (§5.2) |
| `Doc-6C_Content_v1.0_Pass2.md` | `roles` (NULL-seed) · `permissions` · `role_permissions` · `organization_workflow_settings` · `buyer_profiles` · §4 state · §5 permission/role seed |
| `Doc-6C_Content_v1.0_Pass3.md` | `delegation_grants` (dual-party) · §6 POLICY/migration · **§6.2a consolidated RLS DDL (all 9)** · §7 · Appendix A (37/37, 0 FAIL) |
| `Doc-6C_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6C realizes (the `identity` schema)

- **9 tables** (Doc-2 §10.2), columns verbatim; 4 aggregate roots + a platform permission catalog.
- **First real org-anchor RLS** (Doc-2 §6) — explicit `CREATE POLICY` DDL for **all 9 tables** (§6.2a): tenant-owned `= active_org`; `roles` NULL-seed (`active_org ∨ NULL` read, NULL-org write System-only); **dual-party `delegation_grants`** (both-read / controlling insert+update+delete); platform-owned `users`/`permissions`. `memberships_read` includes `user_id` so `list_my_organizations` works (the org membership-EXISTS subquery is RLS-safe). Authorization app-layer (`check_permission`); RLS = backstop.
- **Auth boundary (DC-4):** `users` stores **no secret** — `auth_user_id` links to Supabase `auth.users`; 2FA settings (not secrets); soft-delete = anonymize-on-departure.
- **First `human_ref` carrier:** `organizations.human_ref` (`ORG-2026-000001`) via **`core.allocate_human_ref`** (Doc-6B — DR-6-CORE consumed).
- **3 state machines** (Organization §5.1, Membership §5.2, Delegation §5.10) + the simple `users` lifecycle — enum + CHECK at the DB; complex governance guards (Last-Owner Protection, dual-party authority, only-active-participates, cascade-on-soft-delete) **service-layer** (DR-6-STATE).
- **Dual-party `delegation_grants`:** explicit party columns; `vendor_profile_id` = **cross-module bare UUID** (M2, no FK); `permission_set_jsonb` (delegated ⊆ existing, never ownership-class); `valid_to` CHECK; refresh-on-revocation removes M3 `rfq_invitation_grantees` via service/event.
- **Role/permission model:** the **45 slugs** (38 tenant + 7 staff) + **4 system bundles** (Owner/Director/Manager/Officer, A-08) seeded by pointer (Doc-2 §7); **two role dimensions** (Invariant #2 — staff slugs never in org bundles).
- **7 `identity.*` POLICY keys** (Doc-3 v1.9 RATIFIED) — dedup windows + invite/delegation timers + validity/cadence — read from `core.system_configuration`, never literals.
- **Partial-unique-live** (first real use); **intra-schema FKs only** (sole cross-module = `vendor_profile_id`); coins nothing.

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (3 machines) · `DR-6-API` (Doc-5C Band H) · `DR-6-MKT` (`vendor_profile_id`) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.9) · `[ESC-6-SCHEMA]`/`[ESC-6-API]` none. Carry-forward to **Doc-8**: RLS byte-equivalence + migration tests (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 BLOCKER + 2 MAJOR + MIN/NIT) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. **Doc-3 v1.9_Identity:** flag-and-halt (Doc-4C `[DC-5]` keys unregistered) → additive patch → Board-RATIFIED (7-vs-6 confirmed). Content: Pass-1/2/3 each per-pass-reviewed (auth-linkage, FK-ordering, ON-CONFLICT inference, valid_to CHECK, dual-party RLS) · cross-pass Content Hard Review (**HQ-001** RLS-DDL completeness + **HQ-003** memberships-RLS org-visibility correctness bug — both caught here, invisible to per-pass) · Content Freeze Audit (APPROVE).

---

*Doc-6C (M1 `identity` schema) is FROZEN. Realizes Doc-2 §10.2's 9 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A; first real org-anchor + dual-party + roles-NULL-seed RLS (all 9 tables explicit DDL); auth boundary (no secret); 3 state machines; `human_ref` via `core`; 7 `identity.*` POLICY keys (Doc-3 v1.9 RATIFIED); coins nothing. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6D (M2 `marketplace`) — the first public/anonymous surface.*
