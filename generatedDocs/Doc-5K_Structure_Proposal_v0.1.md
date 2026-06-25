# Doc-5K — AI Layer (M9 `ai`) API Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review applied; REC-1 RECONCILED + 3 MINOR + 1 NITPICK resolved** (Board pre-authoring findings 5 MINOR + 6 NITPICK incorporated; §Board-Findings Map · §Review Disposition). Structure only. **`[REC-AI-WIRE]` SATISFIED — structure freeze UNBLOCKED**; freeze-ready → Structure FROZEN |
| Module | Module 9 — AI Layer (`ai` schema; the reserved advisory / derived-artifact layer) |
| Realizes | `Doc-4K` (M9 contracts, FROZEN — **16 contracts**, 4 families × 4 ops, BC-AI-1…4) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B` (M0) out-of-wire boundary (R1); `Doc-5G` (M5) provisional-classification gate (REC pattern); `Doc-5H` (M6) cross-cutting wire model + route/token discipline + attestation bands |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN — Core consumed), Doc-4C v1.0 (FROZEN — Identity consumed), Doc-4K v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (with section-pointer column), ratified realization decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5K content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape this document (the Doc-5B/5G/5H precedent):

1. **Realize, never re-decide.** Doc-4K fixed *what* M9's 16 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Doc-5K realizes Doc-4K's caller-facing surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4K / corpus by pointer.
2. **Conformance is an obligation.** Doc-5K passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, POLICY key, event, or **score**.

## Decisions ratified at structure freeze (proposed)

- **R1 — Out-of-wire boundary.** Doc-5K realizes only the caller-facing HTTP surface. **Out-of-wire (→ §5):** the 4 `expire_*` (System TTL/regeneration sweep timers, hard-delete), the 4 `generate_*` (AI-Agent on-demand + System scheduled — in-process, **no tenant caller wire** per the Doc-4K actor field; **provisional — REC-1**), and the **internal-service leg** of the dual-audience `get_*`/`list_*` reads (consumed in-process by owning modules). **Flag-and-halt if a caller wire is proposed for any.** (Authority `Doc-5A §1.3/§5/§11`; Doc-5B R1 precedent.)
- **R2 — Actor: User read-only on the wire; AI-Agent/System out-of-wire; no public, no Admin.** The only caller-facing surface is the **User** read of advisory artifacts (server-validated `Iv-Active-Organization`, tenancy `subject_org_id`). The **AI Agent** actor is **M9-internal, never an HTTP caller**; System (generate/expire) is out-of-wire (§5). **No public/anonymous surface; no Admin mutation surface.**
- **R3 — `ai` route prefix; `ai.` Contract-ID token** (token == route — `Doc-5A Appendix B.1` registers the M9 route namespace `ai`, `Doc-2 §0.3`; the Doc-4K token is `ai.<operation>.v1`, error-code namespace `ai_`). Paths derive from `ai` (e.g. `GET /ai/recommendations/{id}`); **the surface version is an `Iv-Api-Version` header / `Doc-5A §12` concern, never a path segment** (there is **no** `/ai/v1/…` path). Coins neither.
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs, §9 audit actions, and the §8 event catalog; carried gaps are bound by pointer and **escalated, never invented**: `[ESC-AI-SLUG]` (Doc-2 §7 — no `ai_` slug; reuse upstream entitlements), `[ESC-AI-AUDIT]` (Doc-2 §9), `[ESC-AI-POLICY]` (Doc-3 §12.2 — TTL keys `policy.ai.<bc>.ttl_seconds`), `[ESC-AI-EVENT]` (Doc-2 §8 — none today) — `CHK-5A-121` (anti-invention) · `CHK-5A-154` (namespace token) · `Doc-4A §6.4`/§18.2.
- **R5 — Advisory / AI-suggests-modules-decide (M9 signature; Invariant #12).** Every artifact is **non-authoritative**; **no caller is bound by it**; **M9 owns only `ai.*` persistence and SHALL NOT directly or indirectly mutate any authoritative table owned by another bounded context** (no indirect-write path); **no authoritative write is ever attributed to the AI Agent** — an authoritative action arising from an AI advisory is executed by a User/System contract in the **owning** module (DF-AI-3). **Expired (or live) artifacts can never become authoritative historical evidence** — they are advisory only. Doc-5K realizes **no** decision, mutation, matching, routing, award, or score surface on any module.
- **R6 — Firewall (DF-AI score/decision boundary).** **AI confidence ≠ Trust score**; M9 computes/owns/re-publishes **no** Trust/Performance/Verification/Governance score, and produces **no** matching/routing/award/eligibility decision (RFQ owns — DF-AI-3). M9 reads published score outputs only where the org is entitled (DF-AI-5 — Trust read-only score output), and **as a point-in-time score *snapshot* only — never a live coupling** to the owning module's score state. Realized as §3 wire constraints, never a gating header/param.
- **R7 — Regenerable disposable cache (M9-unique; NOT append-only).** Artifacts carry a TTL (`expires_at = generated_at + policy.ai.<bc>.ttl_seconds` — `[ESC-AI-POLICY]`) and are **hard-deleted on expiry** by the System `expire_*` sweep — a **legitimate hard-delete** because artifacts are derived, disposable, and regenerable (explicitly **not** the Invariant #8 append-only / soft-delete of the authoritative modules). Generation is an **idempotent upsert** on the **cache identity `(subject_org_id, entity_ref_id, model_version)`, which SHALL be globally unique** (no duplicate advisory artifact). **TTL expiration ≠ business invalidation** (distinct concepts — TTL is cache-freshness, not a business-state change). **Regeneration is deterministic for identical inputs unless `model_version` changes.** The **model-version lifecycle is owned by AI infrastructure, not the API realization** (Doc-5K does not govern model versioning). An artifact has a **cache lifecycle only — `generated → refreshed → expired/invalidated → regenerated` — and NO business state machine** (`Doc-4K §K13`); there is no domain state-edge to realize (distinct from the state-machine-bearing authoritative modules).
- **R8 — No emitted/consumed event surface.** M9 emits and consumes **no** Doc-2 §8 event (pull/derive-on-demand, not event-driven — `[ESC-AI-EVENT]`); the Doc-5A §11 surface is **N/A**; no caller webhook/push.
- **R9 — Tenancy & non-disclosure.** Artifacts are tenancy-scoped (`subject_org_id`); a cross-tenant read collapses to a uniform `NOT_FOUND` (`Doc-5A §6.3/§7`; `Doc-4A §7.5`). `similar_vendors` results hold **bare UUIDv7 refs only** (no vendor-data copies — single-owner boundary).

## M9 surface partition (the structural spine)

> **16 Doc-4K contracts** (4 families × 4 ops, BC-AI-1…4) — **8 caller-facing**, **8 out-of-wire** (**REC-1 RECONCILED — final**). Each row carries an explicit **Doc-5K §** owner; **every contract has exactly one owner section — never partial, duplicated, inherited, or implied** (any ambiguity is a structure defect). §3 is a cross-cutting wire-model section and **owns no endpoint**.
>
> **REC-1 reconciliation (Hard Review):** verified against the Doc-4K per-contract Identity blocks (`B-AI-x`) — `generate_*` carry **Operation `21.4 Command / 21.5 System`, Actor `AI Agent / System`** (**no User, no Admin** caller actor); `get_*`/`list_*` carry **`21.3`, Actor `User / System`**; `expire_*` carry **`21.5`, Actor `System`**. Since `generate_*` has **no caller-facing actor** (User/Admin/Public), it is **out-of-wire** (the "12+4" alternative is refuted — there is no tenant generate wire). The caller-facing surface is the **User leg of the 8 `get_*`/`list_*` reads**; the System/internal-service consumption leg is out-of-wire. **Final split: 8 caller + 8 out = 16.**

| Doc-4K contracts | Nature | **Doc-5K §** |
|---|---|---|
| BC-AI-1…4 `get_recommendation`, `get_prediction`, `get_classification`, `get_similar_vendors` · `list_recommendations`, `list_predictions`, `list_classifications`, `list_similar_vendors` | User read (21.3 User/System — caller-facing User leg) | **§4** `GET` |
| BC-AI-1…4 `generate_recommendation`, `generate_prediction`, `generate_classification`, `generate_similar_vendors` | AI-Agent on-demand + System scheduled (21.4/21.5; Actor AI-Agent/System — no caller actor; in-process — **REC-1 resolved**) | **§5** out-of-wire |
| BC-AI-1…4 `expire_recommendations`, `expire_predictions`, `expire_classifications`, `expire_similar_vendors` | System TTL hard-delete sweep (21.5) | **§5** out-of-wire |
| BC-AI-1…4 `get_*`/`list_*` internal-service leg | dual-audience consumption by owning modules (21.3 System) | **§5** out-of-wire (mechanism) |

> **REC-1 (resolved):** `generate_*` confirmed **out-of-wire** (no User/Admin actor — Doc-4K Identity blocks); the "12+4" alternative is refuted. The get/list internal-service leg is a **mechanism, not a counted contract** — it adds no row to the 16.

### Section-level count reconciliation (FINAL)

| Doc-5K § | Surface | Caller-facing | Out-of-wire (§5) |
|---|---|---|---|
| §4 | Derived-Artifact Reads (`get_*`/`list_*` User leg) | 8 | — |
| §5 | `generate_*` (4) · `expire_*` (4) · get/list internal leg (mechanism) | — | 8 |
| **Total** | | **8** | **8** = **16** |

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5K's precedence (… → Doc-4A → Doc-4K → Doc-5A → **Doc-5K** → Code); conform to Doc-5A in full and pass Appendix A; realize-never-redecide; flag-and-halt.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M9 Surface Partition
- **Purpose:** what Doc-5K governs (the M9 caller-facing read surface — User) and does not; carry the surface-partition + count-reconciliation tables; the **§1.x dependency boundary** (M9 realizes only M9 surfaces; cross-module → owning module's Doc-5x; M9 **reads** other modules' data/scores only where entitled, snapshot only, by pointer, and **writes only `ai.*`**); register carried dependencies **DF-AI-1…N** + `[ESC-AI-AUDIT]` / `[ESC-AI-EVENT]` / `[ESC-AI-POLICY]` / `[ESC-AI-SLUG]` + **`[REC-AI-WIRE]`** by pointer (resolved only via their Doc-4K channels; none resolved here). **No DF-AI rule is restated — only referenced.**
- **Dependencies:** `Doc-5A §1`; `Doc-4K §K0`/Final Freeze Audit. **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `ai`-route HTTP surface — one row per **caller-facing** endpoint (the 8 `get_*`/`list_*` User reads): method (§5.2, `GET`), path grammar (§5.3, prefix `ai`, **no version path segment** — R3), actor (User) + active-org applicability, success status (§5.5, `200`). Command tokens = the exact `ai.<operation>` names **verbatim from the Doc-4K per-contract blocks** (`ai.<operation>.v1`). **Inventory ordering within a section is non-authoritative and informational only; the partition table is authoritative — on conflict the partition table wins; inventory order never implies lifecycle order. Every contract has exactly one owner section — never partial, duplicated, inherited, or implied.** Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`ai`); `Doc-4K` (16-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Actor, Advisory & Firewall Wire Model *(mechanism only — owns no endpoint)*
- **Purpose:** the defining Doc-5K cross-cutting section — realize, on the wire, the mechanism §4 reads depend on (it instantiates no endpoint body): the **User** read actor (no public, no Admin — R2); `Authorization` bearer = authentication only; **`Iv-Active-Organization` server-validated, never client-trusted**; **`check_permission` is the sole authorization authority consumed by M9 surfaces; no parallel or shadow authorization path is permitted (`Doc-4A §5.3`, `Doc-4A §6`)** (reusing upstream entitlements — `[ESC-AI-SLUG]`); the **advisory / non-authoritative** constraint (R5 — artifacts presented non-authoritative; no caller bound; no AI-attributed authoritative write; M9 writes only `ai.*`, no indirect cross-BC mutation); the **score/decision firewall** (R6 — AI confidence ≠ Trust score; snapshot-only score reads; no matching/routing/award); **regenerable-cache** semantics (R7 — TTL hard-delete legitimate; `is_expired` exposed on reads); **non-disclosure `NOT_FOUND`** + tenancy (`subject_org_id`; bare-UUID similar-vendors — R9). **Per-read disclosure-scope rule (binding):** every §4 read declares its scope = **Subject-Org-tenancy** — ambiguity = content blocker. No endpoint is instantiated here.
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §5/§5.3/§6/§7/§7.5`; `Doc-4C §C3/§C8` (consumed authorization root); `Doc-4K` (DF-AI firewall — by pointer). **Detail:** cross-cutting wire-model declaration; bound, not redefined; no endpoint instantiation.

## §4 — Derived-Artifact Read Surface Realization (BC-AI-1…4)
- **Purpose:** the 8 caller-facing reads across the 4 artifact families (recommendation · prediction · classification · similar_vendors) — **point-lookup** `GET /ai/{artifact-plural}/{id}` (returns `found` + detail | null; carries the `is_expired` flag — R7) and **cursor-paginated** `GET /ai/{artifact-plural}` list (default excludes expired; `include_expired` filter; `Doc-5A §8`), each scoped to `subject_org_id` with optional `entity_ref_id`/`entity_ref_type` filters; each **declares Subject-Org disclosure scope** (§3 rule); **non-authoritative presentation** (R5 — advisory only); cross-tenant → `NOT_FOUND` (R9); reads not audited (`Doc-5A §17.1`). **Expired rows (`expires_at < now()`) may be returned with `is_expired: true` until the System sweep deletes them; a read NEVER extends TTL; callers treat an expired artifact as stale** (`Doc-4K §K13`). The dual-audience internal-service consumption leg is **out-of-wire** (§5).
- **Dependencies:** `Doc-5A §5/§6/§7/§8`; `Doc-4K` BC-AI-1…4; `Doc-4C §C3` (consumed). **Detail:** read realization (point + list, 4 families).

## §5 — Out-of-Wire Boundary (generate · expire · internal-service leg)
- **Purpose:** declare that the out-of-wire contracts have **no HTTP wire** — the 4 `generate_*` (AI-Agent on-demand + System scheduled; idempotent upsert on the globally-unique cache identity — R7; **provisional REC-1**), the 4 `expire_*` (System TTL hard-delete sweep; `Response: none`), and the dual-audience `get_*`/`list_*` **internal-service consumption leg** (in-process reads by owning modules) — are in-process services / background jobs / event-free derivation, never a caller surface. **Out-of-wire contracts have no caller wire in any protocol: no REST endpoint, no SSE stream, no WebSocket, no Webhook, no GraphQL. No streaming protocol today; any future protocol addition requires governance approval (Gov-Note §5 amendment), never a local decision.** **Flag-and-halt if any wire surface in any protocol is proposed.** Implementation is code / Doc-6.
- **Dependencies:** `Doc-4K` BC-AI-1…4 (generate/expire); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §6 — Conformance & Carried Items
- **Purpose:** Doc-5K's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DF-AI-1…N + `[ESC-AI-AUDIT]` / `[ESC-AI-EVENT]` / `[ESC-AI-POLICY]` / `[ESC-AI-SLUG]` + **`[REC-AI-WIRE]`**) by pointer with each named resolution channel; statement that Doc-5K coins nothing and restates no DF-AI rule.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4K` Final Freeze Audit. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5K Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M9 surface; the freeze evidence. Includes dedicated bands for the M9-unique risks: an **advisory / non-authoritative band** (*no caller bound; no AI-attributed authoritative write; M9 writes only `ai.*`, no indirect cross-BC mutation; expired ≠ authoritative evidence*); a **firewall band** (*AI confidence ≠ Trust score; snapshot-only score reads; no matching/routing/award*); a **regenerable-cache band** (*TTL hard-delete legitimate; globally-unique cache identity; TTL ≠ business invalidation; deterministic regen*); a **non-disclosure band** (*tenancy-scoped; `NOT_FOUND` collapse; bare-UUID similar-vendors*). **Appendix A contains only attestations — no normative behavior;** all binding rules live in §0–§6.
- **Dependencies:** `Doc-5A Appendix A`; §3; R5/R6/R7/R9. **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4K — resolved only via named channels, never here; no DF-AI rule restated)

| ID | Item | Doc-5K handling | Freeze gate? |
|---|---|---|---|
| **DF-AI-1** | Identity — `check_permission` / tenancy, consumed | Authorization server-side via Identity (`Doc-4C §C3/§C8`); no shadow authz (§3); no Identity surface realized | **No** |
| **DF-AI-2** | Marketplace — entitled vendor refs (read-only), referenced not restated | Bound by pointer to `Doc-4K`; vendor data by bare UUID (R9) | **No** |
| **DF-AI-3** | RFQ owns matching/routing/ranking/supplier-selection/award/eligibility; AI advisory-only | M9 realizes no matching/routing/award surface (R5/R6); RFQ bound by pointer | **No** |
| **DF-AI-4** | Operations — entitled private-record/engagement reads; buyer-private stays buyer-private | M9 derives from entitled reads only; widens/leaks no protected fact (R9); bound by pointer | **No** |
| **DF-AI-5** | Trust — read-only score output (firewall) | M9 reads a score snapshot only where entitled; computes/owns/re-publishes no score (R6); bound by pointer | **No** |
| **DF-AI-6** | Platform Core — audit-write / UUIDv7, consumed (+ confirm VO-1/VO-2 value-object semantics at content) | Consumed via Doc-4B by pointer; firewall/value-object semantics not restated | **No** |
| `[ESC-AI-AUDIT]` | Doc-2 §9 enumerates no AI audit action | `generate_*`/`expire_*` mutations bound to nearest §9 action by pointer; reads not audited; never invented; channel Doc-2 §9 additive | **No** |
| `[ESC-AI-EVENT]` | M9 emits/consumes no Doc-2 §8 event | §11 N/A (R8); if ever required, additive Doc-2 §8 patch; **never coin an event** | **No** |
| `[ESC-AI-POLICY]` | No `ai` POLICY namespace key (TTL `policy.ai.<bc>.ttl_seconds`) | Referenced by intended key name by pointer; channel Doc-3 §12.2 additive; **`[ESC-AI-POLICY]`-keyed contracts not finalized until registered** | **Tracked** — per-contract finalization; not a structural gate |
| `[ESC-AI-SLUG]` | No `ai_` slug in Doc-2 §7 | Caller-gating reuses upstream entitlements via `check_permission`; channel Doc-2 §7 additive; no slug invented | **No** |
| **`[REC-AI-WIRE]`** | Wire classification of `generate_*` + get/list internal leg (REC-1) | **RESOLVED at Hard Review** — `generate_*` Actor = `AI Agent / System` (no User/Admin caller actor) ⇒ **out-of-wire**; get/list User leg = caller-facing (§4), System leg out-of-wire (§5). Verified against Doc-4K Identity blocks. Final split 8+8 | **Satisfied — gate cleared; reconfirm verbatim at content** |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DF-AI-* / `[ESC-AI-*]` / `[REC-AI-WIRE]` · framework/DB/job/model-infra implementation (code/Doc-6) · giving any out-of-wire contract a wire in any protocol · adding a streaming protocol (governance-gated) · governing model-version lifecycle (AI infrastructure) · authoring any decision/mutation/matching/routing/award/score surface · attributing any authoritative write to the AI Agent · coining any endpoint/status/header/error-class/slug/POLICY key/event/**score**.

---

## Board-Findings Map (pre-authoring; all incorporated)

| Finding | Sev | Encoded at |
|---|---|---|
| **M-1** indirect-write fence | MINOR | R5 — owns only `ai.*`; SHALL NOT directly/indirectly mutate another BC's authoritative table |
| **M-2** score snapshot only | MINOR | R6 — point-in-time snapshot, never live coupling |
| **M-3** exactly-one-owner rule (no partial/dup/inherited/implied) | MINOR | partition spine + §2 |
| **M-4** globally-unique cache identity | MINOR | R7 — `(subject_org_id, entity_ref_id, model_version)` unique |
| **M-5** no DF-AI restate, only reference | MINOR | §1 + carried-items + guardrails |
| **N1** model-version lifecycle = AI-infra | NIT | R7 |
| **N2** TTL expiration ≠ business invalidation | NIT | R7 |
| **N3** deterministic regen unless `model_version` changes | NIT | R7 |
| **N4** expired ≠ authoritative historical evidence | NIT | R5 |
| **N5** Appendix A = attestations only | NIT | Appendix A |
| **N6** no streaming today; future = governance approval | NIT | §5 fence |

---

## Review Disposition (Independent Hard Review v0.1 → v0.2)

| Finding | Sev | Disposition |
|---|---|---|
| **HR-MAJOR-01** REC-1 wire classification unresolved (`[REC-AI-WIRE]` blocking freeze) | MAJOR | **RECONCILED** — verified Doc-4K Identity blocks: `generate_*` Actor `AI Agent / System` (no User/Admin) ⇒ **out-of-wire**; `get/list` `User/System` ⇒ User leg caller-facing; `expire_*` System. Final 8+8; `[REC-AI-WIRE]` satisfied; **structure freeze unblocked**. |
| **HR-m-01** DF-AI-4 (Operations) + DF-AI-5 (Trust) absent from carried-items table | MINOR | **FIXED** — both added verbatim (DF-AI-4 entitled Operations reads; DF-AI-5 Trust read-only score output); "confirm 4/5 at content" placeholder removed. |
| **HR-m-02** "no business state machine" not stated | MINOR | **FIXED** — R7 now states the cache lifecycle (`generated → refreshed → expired → regenerated`) and **no business state machine** (`Doc-4K §K13`); no domain edge to realize. |
| **HR-m-03** read TTL behavior under-specified | MINOR | **FIXED** — §4 now binds: expired rows returned with `is_expired: true` until sweep; a read never extends TTL; callers treat as stale (`Doc-4K §K13`). |
| **HR-NP-01** DF-AI-5 not cited at the score-firewall | NITPICK | **APPLIED** — R6 cites DF-AI-5 (Trust read-only score output) for the snapshot-only read. |

---

## Structure self-audit (post-review v0.2)

| Check | Result |
|---|---|
| Every Doc-4K contract assigned to exactly one section (no partial/dup/inherited/implied — M-3) | ✅ — 8 → §4; 8 → §5 |
| Total = 16 (4 families × 4 ops) | ✅ — 8 caller + 8 out (PROVISIONAL — REC-1) |
| `generate_*` actor = AI-Agent/System (no User/Admin) → out-of-wire (REC-1 **resolved**) | ✅ — R1/REC-1 |
| `[REC-AI-WIRE]` reconciled → satisfied; structure freeze unblocked | ✅ |
| DF-AI-1…6 all registered by pointer (4 Operations, 5 Trust added) | ✅ — HR-m-01 |
| No business state machine (cache lifecycle only) | ✅ — R7/HR-m-02 |
| Read never extends TTL; `is_expired` exposed | ✅ — §4/HR-m-03 |
| Advisory / non-authoritative: no caller bound; no AI-attributed authoritative write; only `ai.*`; no indirect cross-BC mutation | ✅ — R5/M-1 |
| Expired ≠ authoritative historical evidence | ✅ — R5/N4 |
| Firewall: AI confidence ≠ Trust score; snapshot-only reads; no matching/routing/award | ✅ — R6/M-2 |
| Regenerable cache: TTL hard-delete legitimate (not append-only); globally-unique cache identity; TTL ≠ business invalidation; deterministic regen; model-version = AI-infra | ✅ — R7/M-4/N1/N2/N3 |
| No Doc-2 §8 event; §11 N/A | ✅ — R8 |
| Tenancy `NOT_FOUND`; bare-UUID similar-vendors | ✅ — R9 |
| Route prefix `ai` (App B.1); token `ai.`; no `/ai/v1/` version path segment | ✅ — R3 |
| `check_permission` sole authority; no shadow path; no `ai_` slug (reuse upstream) | ✅ — §3/R4 |
| §5 5-protocol fence + no-streaming/governance-gated | ✅ — N6 |
| §2 ordering non-authoritative + partition-wins + order≠lifecycle | ✅ |
| No DF-AI rule restated; carried by pointer | ✅ — M-5 |
| Appendix A attestations only (no normative behavior) | ✅ — N5 |
| Nothing coined; no event/score; bound to registries | ✅ — R4/R8 |

---

*End of Doc-5K Structure Proposal v0.1. Structure only; Board pre-authoring findings (5 MINOR + 6 NITPICK) incorporated. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. **Structure freeze is BLOCKED on `[REC-AI-WIRE]`** (REC-1 — reconcile `generate_*` + get/list internal-leg wire classification against Doc-4K PassB Actor/Audience fields verbatim); content authoring may proceed against the provisional partition. Next: Independent Hard Review → reconcile REC-1 → Structure Patch → promote to `Doc-5K_Structure_v1.0_FROZEN`.*
