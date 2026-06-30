# WORK PACKAGE — Platform Audit-Write Mechanism (`WP-AUDIT-MECH`) v1.0

| Field | Value |
|---|---|
| **Type** | Architecture Board work package (additive resolution of a Flag-and-Halt) |
| **Owner** | **Architecture Board** (presiding authority — CLAUDE.md §7); realization by Engineering once ruled |
| **Status** | **✅ CLOSED — Definition of Done met (2026-06-30).** Board ruled **R-b** (D1); D2/D3 + **ADR-021** folded into the corpus (`generatedDocs/Doc-4B_AuditAppendRLS_Patch_v1.0.1.md` · `Doc-6B_Structure_Additive_Patch_v1.0.1.md` · `ADR-021_Audit-Records-RLS-Asymmetry.md`, registered in `00_AUTHORITY_MAP.md`); M0 mechanism realized (D4 — context-bound INSERT policy + non-`RETURNING` `createMany` append + `appendAuditRecord` facade); **conformance suite GREEN against real PostgreSQL (D5 — 16/16 audit, full suite 52/52, idempotent)**; **`ESC-W2-AUDIT-RLS` RESOLVED (D6).** The reusable platform audit-write mechanism is proven; **D7 (resume the M1 buyer-profile write) unblocked.** |
| **Opened by** | Wave 2 execution, M1 buyer-profile WRITE slice |
| **Date** | 2026-06-30 |
| **Resolves** | [`ESC-W2-AUDIT-RLS_v1.0`](ESC-W2-AUDIT-RLS_v1.0.md) (BLOCKER) — full problem statement + evidence there; **referenced by pointer, not restated** |
| **Blocks** | `upsert_buyer_profile` and **every Audit-Required tenant-scoped write** (all M1 `create_*`/`update_*`/membership/role/delegation commands; later M2–M9 tenant writes) |
| **Authority** | CLAUDE.md §7 (Authority Order), §8 (architecture-affecting → **human approval**; AI Coding Supervisor sign-off does not substitute), §11 (Flag-and-Halt), §13 (Raise ≠ Accept) |
| **Change class** | **Additive patch only** (Doc-4B / Doc-6B). Never an edit that reopens a frozen decision (CLAUDE.md §11; ranks 0–1 immutable). |

---

## 1. Objective

Ratify and realize the **single platform mechanism** by which a **tenant-scoped business write** satisfies its **Audit-Required** obligation (Doc-4C §C10; Doc-4B §A10 atomicity) given that `core.audit_records` RLS currently admits writes **only under platform-staff** — the gap raised in `ESC-W2-AUDIT-RLS`. The outcome is a mechanism every module reuses, not an M1-local fix.

## 2. Problem

See `ESC-W2-AUDIT-RLS_v1.0.md` §1–§2 (cited by pointer). In one line: a tenant write runs with `app.is_platform_staff = false`, but the atomic audit append the write must perform is denied by the `core.audit_records` platform-staff RLS — and **no business command audits yet**, so this is the first exercise of the path.

## 3. Scope

**In:** the platform audit-WRITE path for tenant business writes — the Board ruling, the additive Doc-4B/Doc-6B patch, the M0 realization, and a conformance test.
**Out:** audit READ/redaction surfaces (unchanged); the audit field set / action catalog (Doc-2 §9 — owned elsewhere; `[ESC-IDN-AUDIT]` action-binding is a separate interim); any change to tenant-table RLS; reopening any frozen decision.

## 4. Decision required (Board selects; do not pre-decide)

Choose one mechanism from `ESC-W2-AUDIT-RLS` §4 (or a Board-authored alternative):
- **R-a** — M0 audit service elevates `app.is_platform_staff` transaction-local for its own platform-owned insert (+ an ordering rule: audit is the last write, or save/restore the GUC).
- **R-b** — a dedicated **append-only INSERT policy** on `core.audit_records` with a context-bound `WITH CHECK` (e.g. `actor_id = app.user_id`, `organization_id = app.active_org`); SELECT stays staff-only; UPDATE/DELETE stay blocked by the Doc-6B §4.1 immutability triggers.
- **R-c** — a `SECURITY DEFINER` audit-append routine owned by M0.
- **R-d** — async/outbox decoupling — **recorded as likely non-viable** (breaks Doc-4B §A10 / §17.1 atomicity); ruled out explicitly or justified.

The Board records the ruling in `ESC-W2-AUDIT-RLS` §7 (mirroring the `ESC-W1-OUTBOX` resolution pattern), with binding conditions.

## 5. Deliverables (after the ruling)

1. **Additive Doc-4B/Doc-6B patch** authored + frozen via the corpus's additive-patch process (human-approved; never an in-place edit of a frozen doc).
2. **M0 realization** of the ratified mechanism (in `src/modules/core`), realized **once** for all callers.
3. **Expose the concrete `appendAuditRecord` facade** on `core/contracts/services.ts` (mirroring `allocateHumanReference`) — currently only the `AppendAuditRecord` type exists.
4. **Conformance test** proving a **tenant-context** write (`is_platform_staff = false`) appends exactly one audit row **atomically** with the business write, and that a forged/cross-tenant audit row is rejected (per the chosen `WITH CHECK`, if R-b).
5. **`ESC-W2-AUDIT-RLS` marked RESOLVED** with the ruling recorded.

## 6. Definition of Done

- ✅ Board ruling recorded (additive disposition; no frozen edit).
- ✅ Additive Doc-4B/Doc-6B patch frozen via the proper (human-approved) process.
- ✅ M0 mechanism realized once + `appendAuditRecord` facade exposed.
- ✅ Tenant-write audit conformance test green (atomic append under tenant context; no privilege leak to subsequent writes; forged/cross-tenant insert rejected).
- ✅ `ESC-W2-AUDIT-RLS` RESOLVED; the blocked tenant writes unblocked.
- ✅ Coins nothing beyond the ratified additive; no tenant-table RLS weakened.

## 7. On completion — what unblocks

The `upsert_buyer_profile` slice resumes per its approved plan (see the buyer-profile WRITE-vertical plan): it wires the audit append through the ratified mechanism and ships **with** audit. All other Audit-Required tenant writes inherit the same path.

---

*Opened under Flag-and-Halt / Raise ≠ Accept (CLAUDE.md §11/§13). The reviewer raises and frames; the **Architecture Board rules**; only a validated, additive, human-approved resolution is implemented. Until then the dependent slice stays parked.*
