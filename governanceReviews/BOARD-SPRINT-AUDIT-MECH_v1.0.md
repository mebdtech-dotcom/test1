# BOARD SPRINT — Platform Audit Mechanism (`SPRINT-AUDIT-MECH`) v1.0

> **A platform milestone, not an application feature.** This sprint exists to resolve **one** systemic
> gap before any further feature work proceeds. It ships no product surface — its product is a ratified,
> realized, tested **platform audit-write mechanism**.

| Field | Value |
|---|---|
| **Type** | Board Sprint (platform milestone) |
| **Owner** | **Architecture Board** (presiding authority — CLAUDE.md §7); realization by Engineering once ruled |
| **Status** | **✅ EXITING — D1–D6 COMPLETE (2026-06-30).** R-b ruled (D1); D2/D3 + ADR-021 folded into the corpus (`generatedDocs/Doc-4B_AuditAppendRLS_Patch_v1.0.1.md` · `Doc-6B_Structure_Additive_Patch_v1.0.1.md` · `ADR-021_Audit-Records-RLS-Asymmetry.md`, registered in `00_AUTHORITY_MAP.md`; Compendium-v2 / SERIES-manifest consolidation deferred to a human re-freeze); D4 realized (migration + non-`RETURNING` `createMany` service + facade); **D5 conformance suite GREEN against real PostgreSQL — 16/16 audit, full suite 52/52, idempotent re-runs; 4/4 adversarial lenses PASS**; **D6: `ESC-W2-AUDIT-RLS` RESOLVED + `WP-AUDIT-MECH` CLOSED.** The platform audit-write mechanism is a **stable, proven capability** — the feature-work freeze (§7) **LIFTS**. **D7 (resume the M1 buyer-profile write vertical) is now unblocked and is the next step.** |
| **Single objective** | **Resolve [`ESC-W2-AUDIT-RLS`](ESC-W2-AUDIT-RLS_v1.0.md).** Nothing else. |
| **Date opened** | 2026-06-30 |
| **Feature-work freeze** | **ALL feature work is paused** for the duration of this sprint (owner directive, 2026-06-30). No new application surfaces; no resumption of the M1 buyer-profile write or any other feature until the sprint exits. |
| **Work definition** | [`WP-AUDIT-MECH_v1.0`](WP-AUDIT-MECH_v1.0.md) (the work package — scope, decision, acceptance) |
| **Resolves / closes** | `ESC-W2-AUDIT-RLS` (BLOCKER) |
| **Authority** | CLAUDE.md §7 (Authority Order), §8 (architecture-affecting → **human approval**), §11 (Flag-and-Halt), §13 (Raise ≠ Accept) |
| **Change class** | **Additive patches only** (Doc-4B / Doc-6B). Never an edit that reopens a frozen decision. |

---

## 1. Why a sprint (and not a task inside M1)

The gap is **platform-wide**: `core.audit_records` admits writes only under platform-staff, yet **every
Audit-Required tenant write** (all of M1's writes, and later M2–M9) runs under tenant context. Treating it
as an M1 task would either invent a local mechanism (prohibited) or smuggle a platform decision into a
feature. It is therefore elevated to a **milestone** with its own exit gate, ahead of the dependent
features. Problem statement + evidence: `ESC-W2-AUDIT-RLS` §1–§2 (by pointer; not restated).

## 2. Objective

**Ratify, realize, and prove** the single mechanism by which a tenant-scoped business write satisfies its
Audit-Required obligation (Doc-4C §C10 / Doc-4B §A10) under the existing tenant RLS context — then close
the ESC. Out of scope: anything that is not this mechanism (see `WP-AUDIT-MECH` §3).

## 3. Deliverables (strict sequence — each gates the next)

| # | Deliverable | Done when |
|---|---|---|
| **D1** ✅ | **Board decision** | ✅ **DONE — ruled R-b (2026-06-30).** The Board ruled the append-only INSERT-policy mechanism and recorded it in `ESC-W2-AUDIT-RLS` §7 with binding conditions. Additive disposition; no frozen edit. |
| **D2** ✅ | **Additive Doc-4B patch** | ✅ **DONE — APPROVED (human) + FOLDED 2026-06-30** as `generatedDocs/Doc-4B_AuditAppendRLS_Patch_v1.0.1.md` (records the §B10/§17.1 audit-append RLS posture; read stays staff-only; atomicity/no-elevation preserved; no contract-behavior change). Carried alongside the unedited frozen Doc-4B; registered in `00_AUTHORITY_MAP.md`. *(Also produced: **ADR-021** `generatedDocs/ADR-021_Audit-Records-RLS-Asymmetry.md` — the "why".)* |
| **D3** ✅ | **Additive Doc-6B patch** | ✅ **DONE — APPROVED (human) + FOLDED 2026-06-30** as `generatedDocs/Doc-6B_Structure_Additive_Patch_v1.0.1.md`: the append-only context-bound `FOR INSERT` policy (parent + default + every monthly partition; `actor_type='user'` lowercase) on `core.audit_records` (Doc-6B §2.2/§4.1), staff read backstop + CR4′ immutability untouched, + the normative **Deployment Constraint** (D3 migration ships only once D4 eliminates `INSERT … RETURNING`). Registered in `00_AUTHORITY_MAP.md`. |
| **D4** ✅ | **M0 implementation** | ✅ **DONE (2026-06-30).** Realized once in `src/modules/core`: migration `20260630090000_audit_context_append_policy` (the `audit_records_context_append` `FOR INSERT` policy on parent + DEFAULT partition, byte-equivalent to the approved patch); the audit service switched `create` → **`createMany`** (non-`RETURNING`, app-minted UUIDv7, on the caller's executor — Deployment Constraint met); `appendAuditRecord` concrete facade exposed on `core/contracts/services.ts` (mirrors `allocateHumanReference`). Static gates green (tsc/eslint/prettier); **4/4 adversarial verification lenses PASS** (migration-SQL/RLS, Prisma `createMany` non-RETURNING confirmed vs the generated 6.19.3 client, governance/invariants). |
| **D5** ✅ | **Audit conformance tests** | ✅ **GREEN against real PostgreSQL 16 (2026-06-30).** `tests/integration/audit-records-context-append-rls.test.ts` — **16/16 pass**; full integration suite **52/52** (no regression incl. the Wave-1 `buyer_profiles` gate); **idempotent re-runs**. Proved (non-bypassing role): tenant admit via the real service (no-RETURNING/42501 guard), forged actor/org/type reject, fail-closed, staff/NULL-org leg, staff-only read + no-false-pass contrast, immutability. Test-infra fix landed: `asRestrictedRole` now always rolls back (admitted INSERT probes never persist into the append-only table). |
| **D6** ✅ | **Close ESC** | ✅ **DONE (2026-06-30).** `ESC-W2-AUDIT-RLS` marked **RESOLVED**; `WP-AUDIT-MECH` **CLOSED** (DoD met). The feature-work freeze lifts. |
| **D7** ▶️ | **Resume M1** | ▶️ **NEXT (unblocked).** The M1 buyer-profile write slice (`upsert_buyer_profile`) resumes per its approved plan — wiring the audit append through the ratified mechanism (`appendAuditRecord`, in the caller's tx) and shipping **with** audit. |

## 4. Owner recommendation to the Board (Raise ≠ Accept — the Board validates or overrides)

The owner recommends the Board **investigate R-b first** — the dedicated **append-only INSERT policy** on
`core.audit_records` with a **tightly scoped `WITH CHECK`** (e.g. `actor_id = app.user_id`,
`organization_id = app.active_org`; SELECT stays staff-only; UPDATE/DELETE stay blocked by the Doc-6B §4.1
immutability triggers). Rationale: it aims to **preserve Doc-4B §A10 atomicity while avoiding any
privilege-elevation mechanism**. This is a recommendation, not a decision — `WP-AUDIT-MECH` exists
precisely so the Board can **validate R-b or choose another** (R-a/R-c; R-d recorded as likely non-viable)
before any implementation.

## 5. Sprint exit criteria (Definition of Done)

- ✅ D1–D7 complete, in order.
- ✅ Only additive, human-approved patches landed; **no tenant-table RLS weakened**; **no frozen decision reopened**; **coins nothing** beyond the ratified additive.
- ✅ `ESC-W2-AUDIT-RLS` = RESOLVED; `WP-AUDIT-MECH` = CLOSED.
- ✅ Feature-work freeze lifts **only** on sprint exit.

## 6. Post-sprint roadmap (the sequence this unblocks)

```
Board Sprint — Resolve ESC-W2-AUDIT-RLS
        │
        ▼
M0 Audit Mechanism (ratified + realized + tested)
        │
        ▼
Resume M1 Buyer-Profile Write  (ships WITH audit)
        │
        ▼
Wave-2 Complete  (remaining M1 contracts + Doc-8 suites — separate slices)
        │
        ▼
Authenticated Shell  (Doc-7C (app): org-switcher + notification center + write client)
        │
        ▼
M2 Marketplace  (Doc-4D/5D/6D — the Public reads + trust)
        │
        ▼
Public Landing  (P-PUB-01 / Doc-7D — wired against M2, on the frozen kit)
```

## 7. Freeze (binding for this sprint)

No application feature work proceeds while this sprint is OPEN — including the parked M1 buyer-profile
write, the authenticated shell, M2, and the public landing. The only sanctioned work is D1–D7. The
already-built, non-audit-dependent generic `FormField` kit component stands as-is and is **not** further
extended into a surface during the freeze.

## 8. D1 Session Charter

> **A scope-setting charter, not a decision.** This section convenes the D1 session and bounds it. It
> **authors no ruling, selects no mechanism (R-a…R-d or any other), and contains no implementation
> detail** — those are produced **in-session** by the panel below and recorded in `ESC-W2-AUDIT-RLS` §7.

**Session title:** Architecture Board — D1: Platform Audit Mechanism Decision

**Single objective:** Answer — *how does a tenant-scoped business write satisfy a platform-owned audit
obligation while preserving atomicity and security?* Nothing else.

**Review panel** (eight roles; **no frontend / React / UI seats** — this is a platform architecture decision):
1. Architecture Board Chair (presiding — CLAUDE.md §7)
2. Principal Enterprise Architect
3. Principal Security Architect
4. Principal Persistence Architect
5. PostgreSQL / RLS Specialist
6. DDD Architect
7. API Governance Reviewer
8. Virtual CTO

**Inputs** (read-only; bound by pointer, never restated):
- `ESC-W2-AUDIT-RLS_v1.0.md` — the BLOCKER (problem, evidence, and options R-a…R-d).
- `WP-AUDIT-MECH_v1.0.md` — the work package (scope, decision required, acceptance, DoD).
- **Doc-4B** §A10 / §17.1 — `core.append_audit_record.v1` audit append + atomicity (audit atomic with the business write).
- **Doc-6B** §2.2 / §5.1 — `core.audit_records` RLS / platform-staff backstop; §4.1 — audit immutability triggers.
- Context (by pointer): Doc-4C §C10 (the Audit-Required obligation); Doc-6C §2.1 (the tenant GUC context).

**Expected outputs** (produced in-session; the session **authorizes** — it does not pre-author the artifacts):
1. **Board ruling** — the selected mechanism, recorded in `ESC-W2-AUDIT-RLS` §7 with binding conditions.
2. **Additive Doc-4B patch — authorization** to author the audit-write-mechanism patch (human-approved, frozen via the corpus process).
3. **Additive Doc-6B patch — authorization** to author the audit-table RLS / realization patch (human-approved, frozen via the corpus process).
4. **ADR — if required** — authorization to record the decision as an ADR where the ruling sets durable precedent.
5. **M0 implementation authorization** — engineering may realize the mechanism in `src/modules/core` (D4) **only after** the patches are ratified.

**Guardrails:** additive patches only; no frozen decision reopened; no tenant-table RLS weakened; architecture-affecting artifacts require **human approval** (CLAUDE.md §8). Engineering implements **after** the Board rules (D1 → D2/D3 → D4). **This charter selects nothing and designs nothing** — the mechanism decision is the panel's, made in session.

---

*Opened under Flag-and-Halt / Raise ≠ Accept (CLAUDE.md §11/§13). The reviewer frames; the Architecture
Board rules; only validated, additive, human-approved resolutions are implemented. The sprint exits only
when `ESC-W2-AUDIT-RLS` is RESOLVED.*
