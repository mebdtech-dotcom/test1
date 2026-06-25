# iVendorz — Implementation Roadmap

| Field | Value |
|---|---|
| **Status** | NON-AUTHORITATIVE — mirrors program state; patched to match corpus on conflict |
| **Date** | 2026-06-24 |
| **Authority** | `Doc-5_Program_Governance_Note_v1.0` · `generatedDocs/00_AUTHORITY_MAP.md` |
| **Conforms To** | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-4 series (all FROZEN) |

> On any conflict, the frozen corpus wins and this file is patched to match.
> Architecture is COMPLETE/FROZEN. All Doc-4A…4M ratified. Project is in **Implementation Governance**.
> Doc-5A — API Realization Standards: **FROZEN** (patches ratified 2026-06-24). Doc-5B (M0 `core`): **FROZEN** (`Doc-5B_SERIES_FROZEN_v1.0`; R1 precedent). Doc-5C (M1 Identity): **FROZEN** (`Doc-5C_SERIES_FROZEN_v1.0`; 42 contracts). Doc-5D (M2 Marketplace): **FROZEN** (`Doc-5D_SERIES_FROZEN_v1.0`; 71 contracts). Doc-5E (M3 RFQ): **FROZEN** (`Doc-5E_SERIES_FROZEN_v1.0`; 38 contracts; matching/routing engine out-of-wire). Doc-5G (M5 Trust): **FROZEN** (`Doc-5G_SERIES_FROZEN_v1.0`; 40 contracts; governance-signal owner). Doc-5F (M4 Operations): **FROZEN** 2026-06-25 (`Doc-5F_SERIES_FROZEN_v1.0`; 50 contracts; non-disclosure + money-boundary firewalls). Active deliverable next: **Doc-5H (M6 Communication)**. *Separate Board items: additive Doc-4M correction for M5 delegation rows (O-01); Doc-5D DD-7 `vendor_claim_records` tenancy reconciliation.*

---

## Current State

| Artifact | Status |
|---|---|
| Master System Architecture | CANONICAL / FROZEN |
| ADR Compendium | FROZEN |
| Doc-2 (Domain Model) v1.0.3 | FROZEN |
| Doc-3 (RFQ Operational Spec) v1.0.2 | FROZEN |
| Doc-4A (API Metastandard) | FROZEN (structure + content Pass-1…6) |
| Doc-4B…4M (Module Contracts) | ALL FROZEN |
| Doc-5A Structure | FROZEN (+ `PATCH-D5A-STRUCT-02`) |
| **Doc-5A (§0–§12 + App A/B/C)** | **FROZEN** (`Doc-5A_SERIES_FROZEN_v1.0`); Pass-1…12; freeze audit clean (0 B/M/m); freeze patches ratified 2026-06-24 |
| Doc-5A Content §0–§2 (Pass-1) | APPROVED — M6 family-map label fixed |
| Doc-5A Content §3–§4 (Pass-2) | APPROVED — `PATCH-D5A-0D` (§4.4↔B.4) applied |
| Doc-5A Content §5–§6 (Pass-3) | APPROVED — `reference_id` top-level (§5.6/§6.1) applied |
| Doc-5A Content §7 (Pass-4) | APPROVED — §7 F-001…F-005 applied |
| Doc-5A Content §8–§9 (Pass-5/6) | APPROVED |
| Doc-5A Content §10–§12 (Pass-7/8/9) | APPROVED |
| Doc-5A Appendices A–C (Pass-11/10/12) | APPROVED |
| **Doc-5B (M0 `core`)** | **FROZEN** (`Doc-5B_SERIES_FROZEN_v1.0`); §0–§7 + Appendix A; freeze audit clean (0 B/M/m); one carried item D-2 (non-gate); R1 out-of-wire precedent |
| **Doc-5C (M1 Identity)** | **FROZEN** (`Doc-5C_SERIES_FROZEN_v1.0`; §0–§8 + App A; 42 contracts; User-primary/active-org; R1–R6; freeze audit clean 0 B/M/m); carried DC-1…DC-5 (non-gate) |
| **Doc-5E (M3 RFQ — the moat)** | **FROZEN** (`Doc-5E_SERIES_FROZEN_v1.0`; §0–§9 + App A; 38 contracts; matching/routing engine out-of-wire; R1–R7; non-disclosure + engine-execution attestations; freeze audit clean 0 B/M/m); carried DE-1…DE-8 (non-gate); applied `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ` (cleared `[ESC-RFQ-POLICY]`) |
| **Doc-5D (M2 Marketplace)** | **FROZEN** (`Doc-5D_SERIES_FROZEN_v1.0`; §0–§10 + App A; 71 contracts = 64 caller-facing + 7 out-of-wire; tri-actor Public/User/Admin; R1–R10; R5 projection-separation + R9 non-disclosure attestations; freeze audit clean 0 B/M/m); applied `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` (cleared DD-6); DD-7 tracked (`claim_vendor_profile` content-finalization only, Board-gated) |
| **Doc-5G (M5 Trust — governance-signal owner)** | **FROZEN** (`Doc-5G_SERIES_FROZEN_v1.0`; §0–§9 + App A; 40 contracts = 34 caller-facing + 6 out-of-wire; multi-actor Public/User/Admin; R1–R12; score-computation + governance/Billing firewall + non-disclosure attestations; freeze audit clean 0 B/M/m); applied `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust` (cleared `[ESC-TRUST-POLICY]`); SR-1 reconciled to 40 |
| **Doc-5F (M4 Operations)** | **FROZEN** (`Doc-5F_SERIES_FROZEN_v1.0`; §0–§10 + App A; 50 contracts = 46 caller-facing + 4 out-of-wire; two-sided tenant User, no Admin/public; R1–R10 non-disclosure-load-bearing (R5) + money-boundary (R8) + async doc-gen attestations; freeze audit clean 0 B/M/m); carried DF-1…DF-8 + `[ESC-OPS-AUDIT]`/`[ESC-OPS-SLUG]` (non-gate); applied `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` (cleared `[ESC-OPS-POLICY]`, new `operations` namespace) |
| Doc-5H…5M (Module API Contracts) | NOT STARTED |
| Doc-6 / Doc-7 / Doc-8 | NOT STARTED — planning may proceed in parallel |
| Application Code | NOT STARTED |

---

## MVP Scope (v1)

> Tentative — must be ratified by Architecture Board + Product before Phase 4 begins.

**Must Have (MVP)**
- Vendor Profile & Catalog (M2)
- Vendor Verification (M5)
- RFQ Posting, Matching & Routing (M3)
- Quotation & Award (M3)
- Vendor Inbox / Messaging (M6)
- Subscription & Entitlements (M7)
- Admin Moderation & Config (M8)

**Not In MVP**
- Financing / Escrow (platform never handles transaction money — architecture invariant)
- Logistics
- Advanced AI Layer (M9 — reserved, regenerable artifacts only)
- Mobile App
- External webhook push API (ratified exclusion — Doc-5A Structure §decisions)

---

## PHASE 0 — Clear Open Blockers

> **STATUS (2026-06-24): 0-A · 0-B · 0-C · 0-D CLOSED.** STRUCT-02 → `PATCH-D5A-STRUCT-02` (file); Pass-3 §5.6/§6.1 `reference_id` top-level; Pass-4 §7 (F-003 + F-005 applied, F-001/F-002/F-004 already in place); §4.4↔B.4 `Iv-Api-Version` aligned (`PATCH-D5A-0D`, `CHK-5A-153` passes). M6 family-map label `comms`→`communication`.
> **`GAP-D5A-P11-01` CLOSED** (ruling 2026-06-24): Doc-4A C-05 clarified to "every response that carries a body"; `204` exempt → `PATCH-D4A-C05-204` **RATIFIED**. All Phase-0 blockers closed; Doc-5A FROZEN.

### 0-A: Structure Patch — GOVNOTE-D5A-STRUCT-02

**Issue:** `Doc-5A_Structure_v1.0_FROZEN.md` §4 purpose line lists "pagination cursors" as a standard header. Board round-2 M-01 approved removal from §4.4 content (cursor = query parameter per `Doc-4A §9.6`, owned by §8). No structure patch applied yet.

**Actions:**
1. Board approves proposed §4 purpose-line wording in `Doc-5A_Structure_Alignment_GovNote_v1.0.md`
2. Apply `PATCH-D5A-STRUCT-02` to `Doc-5A_Structure_v1.0_FROZEN.md` §4 purpose line
3. Create `Doc-5A_Structure_Patch_STRUCT-02.md`
4. Update `00_AUTHORITY_MAP.md` provenance trail

*Blocked on:* board approval of proposed wording.

---

### 0-B: Pass-3 Patch — §5.6 + §6.1 (`reference_id` violations)

**Issue:** Both sections violate `Doc-4A §22.1 C-05` (top-level `reference_id` required in every response).

| Section | Problem | Fix |
|---|---|---|
| §5.6 (single-entity success shape) | `reference_id` absent entirely | Add top-level `reference_id` (platform-assigned UUIDv7) |
| §6.1 (error envelope) | `error.reference_id` nested inside `error` object | Move to top-level |

**Actions:**
1. Apply patch to `Doc-5A_Content_v1.0_Pass3.md` (§5.6 + §6.1)
2. Pass-3 Patch Verification
3. Pass-3 → APPROVED

*Note:* resolves the governance flag carried forward in Pass-5 §8.6.

---

### 0-C: Pass-4 Patch — §7 (5 findings)

| ID | Severity | Location | Problem | Fix |
|---|---|---|---|---|
| F-001 | MAJOR | §7.1 Binds | `Master Architecture §1.3` (Technology Stack) cited for auth/authz boundary | Replace with `Master Architecture §13` (Permission & Authorization Model) |
| F-002 | MINOR | §7.3 Binds | `Master Architecture §6.3` (Row-Level Security) cited for server-validated org context | Replace with `Master Architecture §6.1` (Isolation Principle) |
| F-003 | MINOR | §7.2 Binds | `Master Architecture §14.2` (Minimum Audit Fields) cited as primary actor-type definition | Replace with `Master Architecture §13.5` (Platform Roles) |
| F-004 | MINOR | §7.5 | "beyond what §10 representation rules already permit" — §10 not yet authored | Change to "beyond what §10 (later pass) will permit" |
| F-005 | NITPICK | §7.2 Binds | `staff_*` slug pattern used without citing `Doc-2 §7` as catalog owner | Add `Doc-2 §7` to Binds |

**Actions:**
1. Apply all five fixes to `Doc-5A_Content_v1.0_Pass4.md`
2. Pass-4 Patch Verification
3. Pass-4 → APPROVED

---

### 0-D: B.4 ↔ §4.4 `Iv-Api-Version` wording alignment

**Issue:** Pass-10 PATCH-02 set Appendix B.4's `Iv-Api-Version` classification cell to "Version-carriage header (owned by §12)", diverging from §4.4's "Conditional — per §12 rules". The §4.5 normative synchronization requirement (`CHK-5A-153`) requires the two be identical.

**Actions:**
1. Apply a parallel wording-alignment amendment so §4.4 and B.4 agree (ownership-only wording)
2. Re-verify `CHK-5A-153`
3. Record in `00_AUTHORITY_MAP.md` provenance trail

*Freeze-gate item; substance unchanged.*

---

## PHASE 1 — Complete Doc-5A Content (§10–§12)

### Pass-7: §10 + §11 (co-authored)

§10 and §11 have mutual dependency (§10 depends on §11 for event observation; §11 depends on §10 for async pattern). Author in a single pass to resolve the circular forward reference.

| Section | Purpose | Key binds |
|---|---|---|
| **§10** Async Operation Realization | Accepted-then-processing wire pattern; status-resource representation; no synchronous facades over async engines; no fabricated activity (`Doc-3 §12.1`); Supabase Realtime = delivery channel only (not a push API) | §5, §6, §11; `Doc-4A §15`; `Doc-3 §12.1` |
| **§11** Event Surface Realization | How event-driven completion is observed by API callers (binds §10); event catalog + outbox ownership stays with `Doc-2 §8`/`Doc-4J`/`Doc-4L` — not restated; no webhook (ratified exclusion) | §10; `Doc-4A §16`; `Doc-2 §8`; `Doc-4J`, `Doc-4L` |

Note: §11 also closes the forward-verification note in Pass-6 §9.7 (joint no-duplicate transport/event-surface consistency).

**Lifecycle:** Draft → Hard Review → Patch → Verification → APPROVED

---

### Pass-8: §12 — API Versioning & Evolution

| Purpose | Key binds |
|---|---|
| Surface-version identifier carriage (from Appendix B); backward-compatible vs breaking-change rules; deprecation signalling on the wire; API version ≠ domain version (entities/state machines change only via corpus patches — `Doc-2 §5`, `Doc-4A §20`) | §0, §5, §11; `Doc-4A §§16, 20` |

**Lifecycle:** Draft → Hard Review → Patch → Verification → APPROVED

---

## PHASE 2 — Appendices

All three required for Doc-5A freeze. Appendix A gates every downstream Doc-5B…5M freeze.

### Pass-9: Appendix A — Machine-Executable Conformance Checklist

- `CHK-5A-xxx` stable IDs, binary pass/fail per check
- Each check names its authoritative source
- Gates every Doc-5B…5M freeze — failing check blocks freeze
- Mirrors `Doc-4A Appendix A` discipline
- Depends on: all §0–§12

**Lifecycle:** Draft → Hard Review → Patch → Verification → APPROVED

---

### Pass-10: Appendix B — Reserved API-Surface Namespace Registry

- API namespace / route prefixes (per module)
- Per-module error-code prefixes (pointer to `Doc-4A Appendix B`)
- Surface-version identifiers
- Standard header names (§4 registry)
- New registrations require Doc-5A amendment — never module-doc invention
- Depends on: §4, §5, §6, §12; `Doc-4A Appendix B`

**Lifecycle:** Draft → Hard Review → Patch → Verification → APPROVED

---

### Pass-11: Appendix C — Cross-Reference Index

- One table: every Doc-5A realization point → the abstract standard it realizes (`Doc-4A §X` / Doc-2 / Doc-3 / ADR)
- Makes realize-never-redecide auditable
- Depends on: all sections (authored last)

**Lifecycle:** Draft → Hard Review → Patch → Verification → APPROVED

---

## PHASE 3 — Doc-5A Freeze

**Pre-conditions (`Doc-5_Program_Governance_Note_v1.0 §8`):**
- All sections (§0–§12) + appendices (A–C): no open BLOCKER / MAJOR / MINOR (NITPICKs deferrable)
- GOVNOTE-D5A-STRUCT-02 / PATCH-D5A-STRUCT-02 applied

**Steps:**
1. Freeze Readiness Audit (`Doc-5A_Freeze_Readiness_Audit_v1.0.md`)
2. Any blocking findings → additive patch → verification
3. Consolidated `Doc-5A_FROZEN` artifact (base + all approved patches merged; review commentary stripped; anchors verified verbatim)
4. Update `00_AUTHORITY_MAP.md` (add Doc-5A FROZEN entry) + `CORPUS_INDEX.md` (§5 Doc-5 family) + `IMPLEMENTATION_START_HERE.md` + `CLAUDE.md`
5. Doc-5A program close

---

## PHASE 4 — Doc-5B…5M (Module API Contracts)

Begins only after Doc-5A FROZEN. All artifacts conform to Doc-5A; Appendix A checklist gates every freeze. Can be authored in parallel (modules are independent).

**Recommended sequencing by dependency depth:**

| Priority | Document | Module | Rationale |
|---|---|---|---|
| 1 | Doc-5B | M0 Platform Core | Audit, outbox, ID gen — foundational for all — **✅ FROZEN 2026-06-24** |
| 2 | Doc-5C | M1 Identity | Auth, org context, permissions — prerequisite pattern — **✅ FROZEN 2026-06-24** |
| 3 | Doc-5E | M3 RFQ | Platform moat — highest complexity, highest business value — **✅ FROZEN 2026-06-24** |
| 4 | Doc-5D | M2 Marketplace | Vendor profile / discovery — large surface, feeds M3 — **✅ FROZEN 2026-06-25** |
| 5 | Doc-5F | M4 Operations | Post-award, CRM — depends on M3 award flow — **✅ FROZEN 2026-06-25** |
| 6 | Doc-5G | M5 Trust | Scores / verification — governance-signal owner — **✅ FROZEN 2026-06-25** |
| 7 | Doc-5H | M6 Communication | Chat / notifications — cross-cutting delivery |
| 8 | Doc-5I | M7 Monetization | Billing / entitlements — commercial layer |
| 9 | Doc-5J | M8 Admin | Moderation / config — governance surface |
| 10 | Doc-5K | M9 AI | Thin / reserved — owns no authoritative data |
| 11 | Doc-5L | Integration Index | Realizes `Doc-4L` — after all module contracts |
| 12 | Doc-5M | State-Machine Surface | Realizes `Doc-4M` — after all module contracts |

**Each artifact lifecycle:**
```
Structure Proposal → Hard Review → Structure Patch → Structure FROZEN
  → Content Pass-A → Hard Review → Patch → Verification → APPROVED
  → Content Pass-B → Hard Review → Patch → Verification
  → Freeze Audit → FROZEN
```

---

## PHASE 5 — Doc-6, Doc-7, Doc-8 + Code

Planning may start in parallel with Doc-5 (not hard-blocked). Implementation starts after relevant module contracts frozen.

| Program | Covers | Blocked on |
|---|---|---|
| **Doc-6** Database | Prisma schema per module; one namespace per module; migration contracts | Doc-5A FROZEN (API drives DB shape) |
| **Doc-7** Frontend | Next.js App Router contracts; server actions; component contracts | Doc-5B…5M (module API surface) |
| **Doc-8** Tests | Test contracts; API conformance tests; integration harness | Doc-5A Appendix A (gates test scaffold) |
| **Code** | Next.js + Supabase + Prisma + Inngest implementation | Relevant module Doc-5 + Doc-6 FROZEN |

---

## Security Baseline

> Implementation policy. Architecture-level security owned by `Master Architecture §§13, 16, 22` and the frozen corpus. This section is the wire-up checklist for code — not restated architecture.

| Concern | Policy |
|---|---|
| Authentication | Supabase Auth; Bearer carriage only (Doc-5A §7.1); no session logic in contracts |
| Authorization | Server-side 3-layer check (`Doc-4A §6.1`); never derived from wire headers |
| Row-Level Security | Defense-in-depth backstop — NOT the authorization model (`Master Architecture §16`) |
| Secrets | Environment variables only; never in code, commits, or logs |
| Audit Logging | M0 owns; every mutation produces exactly one audit record (`Doc-4A §17`) |
| Rate Limits | POLICY-bound (`Doc-4A §19`); keys in `Doc-3 §12` — never hardcoded |
| Non-Disclosure | Blacklist/exclusion undetectable on the wire (Doc-5A §6.3, §8.7) |

---

## Release Strategy

**Environments**

| Environment | Purpose | Deploy trigger |
|---|---|---|
| Local | Developer machine | `next dev` |
| Preview | PR-level Vercel preview | Auto on PR open |
| Staging | Pre-production integration | Manual promote |
| Production | Live | Manual promote + approval |

**Branch Strategy**
- `main` = production; protected; no direct push
- Feature branches off `main` → PR → review → merge
- Module boundaries = branch discipline (one module per PR preferred)

**Migration Policy**
- Schema changes: additive only — no column drops in same PR as code change
- Rollback: Vercel instant rollback for app layer; DB rollback via migration script (never auto)
- Breaking API changes: surface-version bump per Doc-5A §12 — no silent breaks

**Feature Flags**
- M0 owns platform-level feature flags (`Doc-4B`)
- New surfaces shipped behind flags; flags removed after rollout confirmed

---

## Priority Order — At a Glance

```
NOW    Phase 0-A  Board approves PATCH-D5A-STRUCT-02 (structure fix)
       Phase 0-B  Pass-3 patch — §5.6 + §6.1 reference_id
       Phase 0-C  Pass-4 patch — §7 F-001…F-005

NEXT   Phase 1    Pass-7 (§10 + §11 co-authored)
                  Pass-8 (§12)

THEN   Phase 2    Pass-9  (Appendix A — Conformance Checklist)
                  Pass-10 (Appendix B — Namespace Registry)
                  Pass-11 (Appendix C — Cross-Reference Index)

THEN   Phase 3    Doc-5A Freeze Audit → FROZEN

THEN   Phase 4    Doc-5B…5M (module contracts — parallel, priority order above)

THEN   Phase 5    Doc-6 / Doc-7 / Doc-8
                  Application Code
```

---

## Exit Gates (Phase Completion Criteria)

A phase does NOT close until ALL gates pass. NITPICKs deferrable; BLOCKER / MAJOR / MINOR block exit.

| Gate | Phase exits when... |
|---|---|
| **G-0** Phase 0 | All 3 open findings patched + verified; GOVNOTE-D5A-STRUCT-02 closed |
| **G-1** Phase 1 | §10 + §11 + §12 authored, hard-reviewed, patched, verified — no open BLOCKER/MAJOR/MINOR |
| **G-2** Phase 2 | Appendices A + B + C authored, reviewed, verified — no open BLOCKER/MAJOR/MINOR |
| **G-3** Doc-5A Freeze | Freeze Readiness Audit passes; `Doc-5A_FROZEN` consolidated artifact created; authority map + corpus index updated |
| **G-4** Module Contracts | All Doc-5B…5M FROZEN; Appendix A conformance checklist passes for each |
| **G-5** Implementation Contracts | Doc-6 + Doc-7 + Doc-8 all complete + approved |
| **G-6** MVP Ready | All MVP-scope modules code-complete; security baseline verified; all tests pass |
| **G-7** Beta Ready | Staging stable; audit logging live; feature flags operational; no open SEV-1/SEV-2 |
| **G-8** Production Ready | Penetration test passed; SLA defined; runbook complete; rollback tested |

---

*Non-authoritative roadmap. On any conflict, the frozen corpus and `Doc-5_Program_Governance_Note_v1.0` win. Patch this file to match on any divergence.*
