# W2-CORE-4 — CLOSE REPORT v1.0 (M0 hardening + [D-5] outbox audit leg)

| Field | Value |
|---|---|
| **Work item** | W2-CORE-4 — M0 hardening + the `[D-5]` outbox audit leg |
| **Wave / Stage** | Wave 2 — Core Platform · **Stage A (M0 `core`)** — this closes the LAST M0 build WP |
| **Date** | 2026-07-10 |
| **Status** | ✅ **CLOSED** (owner-authorized ruling + clean review pipeline) |
| **Supersedes** | `HANDOFF-NOTE.md` (the 2026-07-10 Flag-and-Halt SUSPEND state — now resolved) |
| **Conforms to** | `Build_Roadmap_v1.0` Wave-2 · `backend_build_plan.md` §W2-CORE-4 · CLAUDE.md §7/§8/§13. Coins nothing; edits no frozen text; binds by pointer. |

> This report closes W2-CORE-4 on top of the builder's `COMPLETION-REPORT.md` (fold-ins delivered) +
> `HANDOFF-NOTE.md` (the audit-leg Flag-and-Halt). It records the owner ruling that resolved the halt,
> the realization, and the RV-0161 review pipeline.

## 1. What was delivered

**(a) Fold-ins (already delivered at the halt; verified on the canonical branch).**
- **WI-CAS-FLAKE** — deterministic barrier for `outbox-dispatch-hardening.test.ts` (racer-PID-scoped,
  wall-clock-bounded + pre-start lock handshake). 8/8 isolated · 9/9 with an unrelated blocked backend.
- **RV-0145 NIT-1 / OBS-2** — four-edge comment inventory + `test.w2core3.*` fixture prefix.

**(b) The `[D-5]` audit leg — realized per the owner ruling.**
The builder Flag-and-Halted because 3 of Board Option-A's 5 legs had no realizable transition without
inventing frozen state or altering frozen dispatch mechanics (`HANDOFF-NOTE.md`). The owner ruling
`BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1` (refines v1.0) resolved it:

| Leg | Disposition |
|---|---|
| 3 — dispatch success (`pending → dispatched`) | ✅ **Realized** — run/batch audited write |
| 5 — archive (`dispatched → archived`) | ✅ **Realized** — run/batch audited write |
| 2 — attempt | **Folded** into the CAS-winning advance (no separate row) |
| 1 — created | **Carried** `[D-5-LEG1-CREATED]` — frozen §B10 `Audit-Required: n/a`; needs additive Doc-4B §B10 patch + a producer ([DC-1]) |
| 4 — permanent-failure/park | **Carried** `[D-5-LEG4-PARK]` — no organic transition (park = retained `pending`); needs additive §B6/Doc-2 §10.1 patch |

Realization: each worker appends **one** System-attributed immutable audit record per run that advanced
≥ 1 row (`if (dispatched|archived >= 1)`), on the worker's **own transaction** (atomic with the
advances — D7 rule 5: rollback ⇒ zero advances + zero audit), non-`RETURNING`, via
`core.append_audit_record.v1`. Empty passes write nothing; dead-letter/reconciliation counts are
§B6/§17.1 telemetry, never audited. **Dispatch mechanics unchanged byte-for-byte.** Serialization pinned
by `Doc-4B_OutboxAuditToken_Patch_v1.0` (tokens `outbox_events_dispatched`/`outbox_events_archived`;
entity_type `outbox_dispatch_run`/`outbox_archive_run`; per-run UUIDv7 `entity_id`) — bound by pointer to
the enumerated Doc-2 §9 Platform "service-role sensitive operations" family (no Doc-2 patch). M0 constants
in `src/modules/core/domain/audit-actions.ts`; nothing coined in code.

## 2. Governance artifacts (all owner/Board-authorized, additive, no frozen edit)
- `BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1.md` — scope + granularity ruling + §5 entity-model ratification.
- `Doc-4B_OutboxAuditToken_Patch_v1.0.md` — **APPROVED + folded + Authority-Map-registered**; provenance
  `governanceReviews/Doc-4B_OutboxAuditToken_Patch_v1.0_PROPOSAL.md`.

## 3. RV-0161 review pipeline (owner-directed order)

| Review | Lane | Verdict |
|---|---|---|
| **Review-A** | Team-4 Architecture & Governance | ✅ **PASS 0/0/0** — no coinage, no frozen edit, mechanics preserved, atomicity/attribution/immutability correct, no recursion. 1 NIT + 3 OBS folded (`4f97a9e`). |
| **Team-6** | Security | ✅ **PASS 0/0/0** — RLS staff-leg fail-closed (System cannot ride tenant leg), no GUC bleed, no forgery surface, data-minimized, atomic/no-orphan, immutability intact, no DoS amplification. 2 OBS folded (`0867758`). |
| **Review-B** | Team-5 Code & Conformance | ✅ **PASS 0/0/0** — ran tsc 0 + outbox 13/13 + full 386/33; doc↔code exact; delta-count test approach sound. 1 MINOR (one-per-run determinism) folded (`16146c4`). |

**§13 freeze/merge gate MET: BLOCKER 0 · MAJOR 0 · MINOR 0.**

## 4. Gates
tsc 0 · eslint 0 · prettier clean · full suite **386/33 ALL PASS** (+4 audit tests vs the 382/33 M1-gate
baseline; zero regressions). Real local PostgreSQL.

## 5. Provenance (commit chain)
`5846f1c` (consolidation) → `01415d6` (audit leg + patch + ruling) → `a056e59` (entity-model ratification)
→ `4f97a9e` (Review-A fold) → `0867758` (Team-6 fold) → `16146c4` (Review-B fold) → this close (records +
Authority-Map registration + corpus fold).

## 6. Scope fence — what this close does NOT do
- **Not the Wave-2 exit.** With M1 (closed 2026-07-10) + M0 Stage A now complete, Wave 2 (M0 → M1)
  requires only the **Wave Integration Audit** before the single `wave/2-core-platform → main` PR
  (`Build_Roadmap` §9 milestone 3). No further build WP remains in Wave 2.
- **Does not close [D-5] Legs 1 + 4.** They stay carried on the Board channel (future additive frozen
  patch + human approval); no audit is written for them (fail-closed).

---

**W2-CORE-4 — ✅ CLOSED 2026-07-10.** M0 Stage A complete. Next: Wave-2 Integration Audit → Wave-2 exit PR.

*Non-authoritative close record. Conforms upward; coins nothing; edits no frozen text. Authorized by the
human owner per CLAUDE.md §7/§8/§13.*
