# Doc-6B — M0 Platform Core (`core`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6B Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M0 — Platform Core / Shared Kernel** (`core` schema; infra-only shared kernel). The **DR-6-CORE** foundation every other module schema references |
| Realizes | **Doc-2 §10.1** — 5 platform-owned tables (`audit_records` · `outbox_events` · `id_sequences` · `system_configuration` · `feature_flags`) as physical PostgreSQL 15+/Supabase schema + Prisma `multiSchema`, against the frozen **Doc-6A** conventions |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A = freeze gate, 37/37 dispositioned); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with (not conformant-to) the frozen Doc-5B surface |
| Freeze evidence | `Doc-6B_Content_Freeze_Audit_v1.0.md` — APPROVE FOR FREEZE; 0 open BLOCKER/MAJOR/MINOR/NITPICK; 8 audit dimensions PASS |

---

## Effective set (the authoritative Doc-6B)

| Artifact | Role |
|---|---|
| `Doc-6B_Structure_v1.0_FROZEN.md` | Frozen structure — CR1–CR10, 5-table partition, Appendix-A applicability map |
| `Doc-6B_Structure_Additive_Patch_v1.0.md` | **CR4′** (APPROVED) — append-only refined to no-DELETE + immutable-payload + bounded operational updates (column-scoped); the effective CR4 |
| `Doc-6B_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6B_Content_v1.0_Pass1.md` | §0–§2 posture · §3.1 `audit_records` · §3.2 `outbox_events` · §4 shared functions + 4 trigger attachments |
| `Doc-6B_Content_v1.0_Pass2.md` | §3.3 `id_sequences` (+ allocator + DELETE-block) · §3.4 `system_configuration` · §3.5 `feature_flags` · §5 seed/migration · §6 · Appendix A (37 checks, 0 FAIL) |
| `Doc-6B_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

*(No Doc-2/Doc-3 patch required — Doc-6B coins nothing; `core.*` POLICY keys were registered in Doc-3 v1.0. The CR4 → CR4′ refinement is a Doc-6B-internal realization patch, not a corpus change.)*

---

## What Doc-6B realizes (the `core` schema)

- **5 platform-owned tables** (Doc-2 §10.1), columns verbatim (Doc-2 §9/§10.1); PKs Doc-2-noted (CR3 — `audit_records.audit_id`, `id_sequences` composite `(entity_type, year)`).
- **CR4′ column-scoped immutability:** one generic M0-owned function `core.raise_immutable_violation()` (jsonb-safe `->` comparison; DELETE-block + immutable-payload) + `core.outbox_status_forward_only()` + `core.audit_archive_set_once()`; **5 triggers** attached with load-bearing event bindings (OLD-deref guards `BEFORE UPDATE` only → INSERT-safe; payload guards `BEFORE UPDATE OR DELETE`; `id_sequences_block_delete` `BEFORE DELETE`).
- **`core.audit_records`** — immutable audit stream; monthly-partitioned (`PARTITION BY RANGE (audit_id)`); redaction = new row; no blobs; `actor_type` = the B.3 shared enum.
- **`core.outbox_events`** — transactional outbox; `status` enum (forward-only, not a §5 machine); transactional write+emit (Doc-6A §7.1); dispatcher-poll index; bounded by `core.outbox_*` POLICY keys.
- **`core.id_sequences`** — the human-reference allocator: `core.allocate_human_ref()` (SECURITY DEFINER + pinned `search_path` + NULL-guard; row-locked, gap-tolerant, never-reused; `TYPE-YEAR-000001`); DELETE-blocked.
- **`core.system_configuration`** — POLICY store; seeds the **18 registered `core.*` keys** (Doc-3 v1.0) by idempotent upsert; read by all modules (Doc-4B §18).
- **`core.feature_flags`** — rollout control, firewalled (visibility/rollout only; never trust/verification/eligibility/routing/matching — Doc-4B §B9).
- **Platform-owned** (no org RLS anchor; platform-staff RLS backstop, app-layer authz); **no cross-schema FK** (bare-UUID refs); the cross-cutting **Doc-4B obligations** (audit-write/outbox-write/ID/POLICY/flag) are code, referenced (CR9 — DR-6-CORE resolved as the owner).

## Carried items

`DR-6-CORE` — **resolved** (this is the owner; other Doc-6x reference `core.*` by pointer). `DR-6-API` — Doc-5B persistable (Band H). `[ESC-6-POLICY]` (core) — **cleared** (Doc-3 v1.0). `[ESC-6-SCHEMA]` — none. Carry-forward to **Doc-8**: partition-boundary + RLS-policy concrete DDL and the migration/RLS test obligation (Doc-6A §11.5) — the schema is satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (0 findings) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. **CR4 → CR4′:** flag-and-halt during content authoring → additive structure patch → Board-approved. Content: Pass-1 (per-pass hard review — forward-only/jsonb-safe/attribution) · Pass-2 (per-pass hard review — SECURITY DEFINER/allocator-guard/id_sequences-DELETE) · cross-pass Content Hard Review (trigger-DDL completeness + search_path) · Content Freeze Audit (APPROVE).

---

*Doc-6B (M0 `core` schema) is FROZEN. Realizes Doc-2 §10.1's 5 platform-owned tables on PostgreSQL/Supabase + Prisma `multiSchema` against the frozen Doc-6A conventions; column-scoped append-only immutability (CR4′); platform-owned; coins nothing. The DR-6-CORE foundation. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6C (M1 `identity`) — incl. the open `[ESC-6-POLICY]` identity-namespace cross-check.*
