# Doc-6C — M1 Identity (`identity`) Schema Realization — Content Freeze Audit v1.0

| Field | Value |
|---|---|
| Document | Doc-6C Content Freeze Audit v1.0 |
| Audits | `Doc-6C_Content_v1.0_Pass1.md` (§0–§2 · users · organizations · memberships) · `…Pass2.md` (roles · permissions · role_permissions · ows · buyer_profiles · §4 · §5) · `…Pass3.md` (delegation_grants · §6 + §6.2a RLS DDL · §7 · Appendix A) |
| Verdict | **APPROVE FOR FREEZE** |
| Findings | **0 BLOCKER · 0 MAJOR · 0 MINOR · 0 NITPICK open** |
| Freeze date | 2026-06-26 |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 (Appendix A = gate)**; **Doc-2 v1.0.3 §10.2 (binding *what*-authority)**; `Doc-6C_Structure_v1.0_FROZEN` (DC-CR1–CR11); `Doc-3_Policy_Key_Registration_Patch_v1.9_Identity` (RATIFIED); Doc-4C (consumed); Doc-6B (`core` consumed) |
| Prior gates | Structure (Proposal v0.2 1B+2MAJ+MIN/NIT → Freeze Audit PASS → FROZEN) · **Doc-3 v1.9_Identity** POLICY patch (Board-RATIFIED — clears `[ESC-6-POLICY]`) · Content Pass-1 (2B+4MAJ → fixed) · Pass-2 (0B+4MAJ → fixed) · Pass-3 (2B[1 corrected]+3MAJ → fixed) · **cross-pass Content Hard Review** (1 BLOCKER RLS-DDL + the HQ-003 correctness bug + HQ-002 consistency → all fixed; 1 MAJOR rejected-false) |

---

## Audit 1 — Hard-Review Finding Resolution

| Stage | Result |
|---|---|
| Structure Hard Review (1 BLOCKER ESC-POLICY list + 2 MAJOR roles-NULL-RLS/delegation-RLS) | **RESOLVED** |
| **Doc-3 v1.9_Identity** (7 `identity.*` keys; 7-vs-6 Board-confirmed) | **RATIFIED** — `[ESC-6-POLICY]` CLEARED |
| Pass-1 (auth linkage AB-1, FK ordering DDL-1, org-RLS RLS-1, citext DDL-2) | **RESOLVED** |
| Pass-2 (role_permissions attribution, roles index/RLS-write, ON-CONFLICT inference) | **RESOLVED** (reviewer's `ON CONSTRAINT` correctly rejected) |
| Pass-3 (valid_to CHECK, attestation wording; RLS-COMP corrected-as-misread) | **RESOLVED** |
| Cross-pass (**HQ-001** RLS-DDL completeness, **HQ-003** memberships-RLS org-visibility bug, **HQ-002** split-consistency) | **RESOLVED**; HQ-006 (count) rejected-false |

**0 open findings. PASS.**

## Audit 2 — Table-Set & Column Fidelity (Doc-2 §10.2 verbatim)

9 tables = exactly the Doc-2 §10.2 `identity` set; columns verbatim (incl. `role_permissions.organization_id` — §10.2 lists it, not coined; `auth_user_id` = §2.5 realization of `password(auth-managed)`/DC-4, no secret stored). 4 aggregate roots + `permissions` reference catalog. No 10th table. **PASS.**

## Audit 3 — DC-CR Realization (DC-CR1–CR11)

| DC-CR | Realized? |
|---|---|
| CR1 nine tables, coin nothing | **PASS** |
| CR2 mixed tenancy; first org-anchor RLS (+ roles NULL-seed clause) | **PASS** (§6.2a explicit DDL) |
| CR3 users platform-owned; auth boundary (no secret; `auth_user_id`) | **PASS** |
| CR4 soft-delete + partial-unique-live (first real use) | **PASS** (users.email lower, organizations.slug, memberships, roles ×2, ows/buyer_profiles) |
| CR5 organizations human_ref via `core.allocate_human_ref`; §5.1; cascade service-orchestrated | **PASS** |
| CR6 3 state machines + users lifecycle (enum+CHECK / service guards) | **PASS** (§4) |
| CR7 delegation dual-party (party columns, both-read/controlling-write, M2 bare-UUID, refresh-on-revocation) | **PASS** (§3.9 + §6.2a) |
| CR8 roles/permissions/role_permissions; two role dimensions (Invariant #2) | **PASS** (§5) |
| CR9 `[ESC-6-POLICY]` → Doc-3 v1.9 | **CLEARED** |
| CR10 intra-schema FKs; sole cross-module = `vendor_profile_id` bare UUID | **PASS** |
| CR11 consumed-not-coupled (Doc-4C authz + Supabase Auth + DR-6-CORE) | **PASS** |

**PASS.**

## Audit 4 — RLS Correctness (whole-module; security-critical)

| Check | Result |
|---|---|
| All 9 tables have explicit `CREATE POLICY` DDL (HQ-001) | **PASS** (§3.2/§3.4/§3.9 inline + §6.2a) |
| Read>write tables split (memberships/roles/role_permissions/delegation/permissions/organizations); single-scope `FOR ALL` (ows/buyer_profiles) | **PASS** (HQ-002 consistency) |
| `memberships_read` includes `user_id` → org membership-EXISTS works; recursion-safe | **PASS** (HQ-003 fixed) |
| dual-party delegation (both-read / controlling insert+update+delete) | **PASS** |
| roles NULL-seed (read active_org∨NULL∨staff; NULL-org write System/staff) | **PASS** |
| active-org server-validated GUC, never client; fail-closed `missing_ok` | **PASS** (Invariant #5) |
| no cross-schema ownership traversal | **PASS** (party columns + intra-schema subquery) |
| authorization app-layer (`check_permission`); RLS backstop | **PASS** (Doc-6A §4.5) |

**PASS.**

## Audit 5 — State Machines & POLICY

| Check | Result |
|---|---|
| org_status/membership_state/delegation_grant_status (+ user lifecycle) verbatim §5.1/§5.2/§5.10/§3.2 | **PASS** |
| value-set DB (enum/CHECK); governance guards service-layer (Last-Owner Protection, dual-party authority, only-active-participates) | **PASS** (DR-6-STATE) |
| transitions → `core.outbox_events`; no event coined | **PASS** |
| 7 `identity.*` v1.9 keys read from `core.system_configuration`, never literal | **PASS** (dedup windows, timers, validity, cadence) |

**PASS.**

## Audit 6 — Seed & Migration

| Check | Result |
|---|---|
| 45 permission slugs (38 tenant + 7 staff) by pointer to Doc-2 §7; none coined | **PASS** |
| 4 role bundles (Owner/Director/Manager/Officer, org_id NULL, is_system_bundle) + composition per Doc-2 §7; Invariant #2 (no staff slug in org bundle) | **PASS** |
| idempotent upserts valid (roles `ON CONFLICT (name) WHERE deleted_at IS NULL AND organization_id IS NULL` matches the partial index) | **PASS** |
| migration order sound (enums → 9 tables → deferred `memberships_role_fk` ALTER → indexes → RLS §6.2a → seeds); roles before memberships; permissions+roles before role_permissions | **PASS** |

**PASS.**

## Audit 7 — Doc-6A Appendix A (37 checks / 10 bands)

37/37 dispositioned (A:5 B:4 C:4 D:4 E:4 F:1 G:3 H:4 I:4 J:4 = **37**); **0 FAIL**. **Band C now PASS** (first real org-anchor RLS); Band G PASS (v1.9 cleared); CHK-6-002 PASS (organizations human_ref — the only identity carrier); CHK-6-005 PASS (partial-unique-live, first real use); CHK-6-021 PASS (explicit party columns); CHK-6-091 PASS (identity enums module-owned, not lifted to B.3). All N/A justified (no money / no versioned / no blacklist content in identity). **PASS.**

## Audit 8 — Coin-Nothing & Carried

| Check | Result |
|---|---|
| No table/column/enum-value/slug/key/state coined | **PASS** (all trace to Doc-2 §10.2/§5/§7 or Doc-3 v1.9; `auth_user_id`/two-roles-indexes/`validity_chk` = §2.5-attributed) |
| Carried: DR-6-CORE/STATE/API/MKT; `[ESC-6-POLICY]` CLEARED; `[ESC-6-SCHEMA]`/`[ESC-6-API]` none | **PASS** |

**PASS.**

---

## Freeze Certification

All 8 audit dimensions pass; 0 open findings. The 9 `identity` tables realized as actual PostgreSQL DDL + Prisma + **complete RLS** (all 9 tables, §6.2a), columns verbatim Doc-2 §10.2, 3 state machines, first real org-anchor + dual-party + roles-NULL-seed RLS (the HQ-003 org-visibility bug fixed), auth boundary (no secret; `auth_user_id` link), 45-slug + 4-bundle seed by pointer, 7 v1.9 POLICY keys (RATIFIED), Appendix A 37/37 (0 FAIL). Coins nothing; no cross-schema FK/write.

**Doc-6C Content v1.0 (§0–§7 + Appendix A, 3 passes, effective with Doc-3 v1.9_Identity) is CERTIFIED FROZEN as of 2026-06-26.**

Carry-forward (non-gating): the RLS positive/negative/cross-tenant byte-equivalence + migration tests are **Doc-8's** gate (Doc-6A §11.5); the schema is satisfiable. The cascade-on-soft-delete + Last-Owner Protection + refresh-on-revocation service orchestration is **code** (Doc-4C; referenced).

**Corpus-fold actions:** produce `Doc-6C_SERIES_FROZEN_v1.0.md` (effective set incl. Doc-3 v1.9); fold Doc-6C + v1.9 into `CORPUS_INDEX.md` + `00_AUTHORITY_MAP.md`; update roadmap + primer (Doc-6C FROZEN; next = Doc-6D).

---

*Freeze certified by this audit. Authoring history retained: Structure (Proposal v0.2 → Freeze Audit → FROZEN) · v1.9_Identity POLICY patch (Board-RATIFIED) · Content Pass-1/2/3 each per-pass-reviewed · cross-pass Content Hard Review (HQ-001/HQ-003 caught + fixed) · this audit. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins and Doc-6C is patched additively — flag-and-halt.*
