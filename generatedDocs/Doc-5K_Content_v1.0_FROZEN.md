# Doc-5K — AI Layer (M9 `ai`) API Realization — Content v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — consolidated Doc-5K content (Pass-1/2/3 merged; review/disposition commentary stripped; anchors verified verbatim) |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-5K_Content_v1.0_Pass1.md` (§0–§3 + inventory) · `Pass2.md` (§4) · `Pass3.md` (§5–§6 + Appendix A) — authoring history + hard-review dispositions retained there. Freeze readiness certified by `Doc-5K_Content_Freeze_Audit_v1.0.md` |
| Realizes | the full M9 caller-facing surface — **8 read endpoints** (§4) — plus the §5 out-of-wire boundary, §6 conformance, and the Appendix A attestation |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Conforms To | `Doc-5K_Structure_v1.0_FROZEN.md` (+ `Doc-5K_Structure_Patch_CE-01_v1.0`); `Doc-5A v1.0 (FROZEN)`; `Doc-4K v1.0 (FROZEN)`; Doc-2 v1.0.3; Doc-4A v1.0; Doc-4C v1.0 (FROZEN — consumed) |
| Contains | The realized read surface + boundary + attestation. No representations, error codes, POLICY keys, slugs, audit actions, events, scores, value-object semantics, or Doc-4K rules restated — bound by pointer |
| Audience | Architecture / API Governance Boards · Doc-5K implementers (human + AI) · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4K fixed the contracts + artifact representations; Doc-5A fixed the wire mechanics; M9 artifacts carry **no business state machine** (cache lifecycle only; TTL/hard-delete per `Doc-4K §B.12` + `Doc-2 §10.10`). This document realizes the **wire face** and re-decides nothing. Error codes, representations, the (empty) M9 event set, scores, and value objects (VO-1/VO-2) are bound **by pointer, never restated**. The §3 cross-cutting model governs every read; **every read declares its disclosure scope = Subject-Org-tenancy** (§3.3). Transport-level path choices are **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§8/§11/§12/§17.1`, Appendix A; `Doc-4K` BC-AI-1…4, §B.12, §K5-VO; `Doc-2 §10.10/§2`; `Doc-4C §C3/§C8` (consumed); `Doc-4A §7.5/§9.7/§12.4`.

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
`Master Architecture → ADR Compendium → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A → Doc-4K → Doc-5A → **Doc-5K** → Code`. On any conflict, the higher document governs and Doc-5K is corrected; **flag-and-halt**, never resolve locally (`Gov-Note §7`).

### 0.2 Scope of Authority
Doc-5K realizes **only the M9 caller-facing read wire face**. It owns no entity, state edge, event, slug, audit action, POLICY key, or **score** — those are Doc-2/Doc-4K/Doc-3/Trust. It realizes no other module's surface (§1.3) and writes only `ai.*` (R5).

### 0.3 Conformance Obligation
Every section conforms to **Doc-5A** and passes the **Doc-5A Appendix A** `CHK-5A-xxx` checklist (Appendix A). Doc-5K **coins nothing** — no endpoint, status, header, error class, slug, POLICY key, event, or **score** (R4/R8; `CHK-5A-121`) — and **restates no DF-AI rule** (M-5).

### 0.4 Realize-Never-Redecide & Realization Conventions
Where Doc-5A is **silent** on a transport detail, Doc-5K fixes a **[realization convention]** contradicting nothing upstream; the binding rule (method, status, namespace) remains Doc-5A. Where the corpus **decides**, Doc-5K binds by pointer.

---

## §1 — Scope, Audience & M9 Surface Partition

### 1.1 What Doc-5K Governs
The **8 caller-facing** read endpoints (User) across BC-AI-1…4 — the `get_*`/`list_*` reads of the four advisory artifacts (Recommendation, Prediction, Classification Result, Similar-Vendor Result). It does **not** govern the 8 out-of-wire contracts (§5), realtime/streaming (none — §5.4), nor any other module's surface.

### 1.2 M9 Surface Partition (REC-1 resolved: 8 caller + 8 out-of-wire)

| Doc-5K § | Surface | Caller-facing | Out-of-wire (→ §5) |
|---|---|---|---|
| §4 | Derived-Artifact Reads (`get_*`/`list_*` User leg) | 8 | — |
| §5 | `generate_*` (4, AI-Agent/System — no caller actor) · `expire_*` (4, System TTL) · get/list internal leg (mechanism) | — | 8 |
| **Total** | | **8** | **8** = **16** |

The get/list internal-service leg is a **mechanism, not a counted contract**.

### 1.3 Dependency Boundary
M9 realizes only M9 surfaces. M9 **reads** other modules' entitled data/scores by pointer — Identity (`check_permission`/tenancy — DF-AI-1), Marketplace (vendor refs — DF-AI-2), RFQ (refs; RFQ owns matching/award — DF-AI-3), Operations (entitled reads — DF-AI-4), Trust (read-only score **snapshot** — DF-AI-5), Platform Core (audit/UUIDv7 — DF-AI-6) — and **writes only `ai.*`**, never directly or indirectly mutating another BC's authoritative table (R5).

### 1.4 Audience & Carried Items
Carried by pointer (none resolved here; no DF-AI rule restated): **DF-AI-1…6**; `[ESC-AI-AUDIT]` (Doc-2 §9), `[ESC-AI-EVENT]` (Doc-2 §8 — none), `[ESC-AI-POLICY]` (Doc-3 §12.2 — TTL keys), `[ESC-AI-SLUG]` (Doc-2 §7 — no `ai_` slug); **`[REC-AI-WIRE]`** (satisfied — `generate_*` out-of-wire; reconfirmed across Pass-1/2/3).

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace, Path Grammar, Method & `reference_id`
- **Route namespace `ai`** (`Doc-5A Appendix B.1`; `Doc-2 §0.3`). Paths follow `/ai/{artifact-plural}[/{id}]` (`Doc-5A §5.3`); **surface version is the `Iv-Api-Version` header / `Doc-5A §12` — no `/ai/v1/…` path segment** (R3). Path strings are **[realization convention]**; the resource-plural segment derives from the **operation-token stem** (`recommendations` · `predictions` · `classifications` · `similar_vendors`), not the table name.
- **Method mapping (`Doc-5A §5.2`):** every M9 caller-facing contract is a **Query → `GET`**, success **`200`** (`Doc-5A §5.5`). M9 has **no caller-facing command** (all `generate_*`/`expire_*` out-of-wire — §5). List reads use **cursor-based pagination only — opaque `cursor`, no offset** (`CHK-5A-070`; `Doc-5A §8`).
- **Inventory ordering is non-authoritative; the partition table (§1.2) is authoritative; order never implies lifecycle; every contract has exactly one owner section** (M-3).
- **Top-level `reference_id` (C-05):** every body-bearing response carries a top-level `reference_id` (`UUIDv7`) — `Doc-4A §22.1 C-05` / `Doc-4A_Patch_C-05-204_v1.0` (body-bearing only; `204` exempt — N/A, all reads `200`); sibling of `result`, never inside `error` (`CHK-5A-042`).

### 2.2 Inventory — the 8 caller-facing reads (BC-AI-1…4)

| # | Contract | Actor | Method · Path **[rc]** | Active-org | Success |
|---|---|---|---|---|---|
| 1 | `ai.get_recommendation.v1` | User | `GET /ai/recommendations/{id}` (point; representation **or `null` = not-found**; `is_expired`) | Y | `200` |
| 2 | `ai.list_recommendations.v1` | User | `GET /ai/recommendations` (cursor list; `entity_ref_id`/`entity_ref_type`/`include_expired` filters) | Y | `200` |
| 3 | `ai.get_prediction.v1` | User | `GET /ai/predictions/{id}` | Y | `200` |
| 4 | `ai.list_predictions.v1` | User | `GET /ai/predictions` (cursor list; filters) | Y | `200` |
| 5 | `ai.get_classification.v1` | User | `GET /ai/classifications/{id}` | Y | `200` |
| 6 | `ai.list_classifications.v1` | User | `GET /ai/classifications` (cursor list; filters) | Y | `200` |
| 7 | `ai.get_similar_vendors.v1` | User | `GET /ai/similar_vendors/{id}` (result holds **bare UUIDv7 refs only** — R9) | Y | `200` |
| 8 | `ai.list_similar_vendors.v1` | User | `GET /ai/similar_vendors` (cursor list; filters) | Y | `200` |

The 8 out-of-wire contracts (`generate_*` · `expire_*` · get/list internal leg) are **excluded from the inventory** — §5.

---

## §3 — Cross-Cutting Actor, Advisory & Firewall Wire Model *(mechanism only — owns no endpoint)*

### 3.1 Actor Model
**User read-only on the wire — NO public/anonymous, NO Admin actor** (R2). The User carries `Authorization` (authentication) **and** `Iv-Active-Organization` — **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`). The **AI Agent** actor (`generate_*`) is **M9-internal, never an HTTP caller**; System (`generate_*`/`expire_*`) is out-of-wire (§5).

### 3.2 Authorization Authority
Resolved **server-side via Identity's `check_permission`** (`Doc-4C §C3`, consumed — DF-AI-1). **`check_permission` is the sole authorization authority consumed by M9 surfaces; no parallel or shadow authorization path is permitted** (`Doc-4A §5.3`, `§6`). **No `ai_` permission slug exists** — caller-gating reuses the requesting org's upstream entitlements; the gap carries `[ESC-AI-SLUG]` (never invented).

### 3.3 Per-Read Disclosure-Scope Rule (binding)
**Every read declares its disclosure scope = Subject-Org-tenancy** — an artifact is read only by its `subject_org_id`. An ambiguous/undeclared scope is a content-authoring blocker.

### 3.4 Advisory / Non-Authoritative (M9 signature — R5)
Artifacts are **presented non-authoritative**; **no caller is bound**. **M9 owns only `ai.*` persistence and never directly or indirectly mutates another BC's authoritative table; no authoritative write is ever attributed to the AI Agent** — an authoritative action arising from an advisory is executed by a User/System contract in the **owning** module (DF-AI-3). **Expired (or live) artifacts can never become authoritative historical evidence.** M9 realizes no decision/mutation/matching/routing/award surface.

### 3.5 Score / Decision Firewall (R6)
**AI confidence ≠ Trust score.** M9 computes/owns/re-publishes **no** Trust/Performance/Verification/Governance score and produces **no** matching/routing/award/eligibility decision (RFQ owns — DF-AI-3). M9 reads a published score only where entitled (DF-AI-5 — Trust read-only score output), **as a point-in-time snapshot only, never a live coupling**.

### 3.6 Regenerable-Cache Read Semantics (R7)
Artifacts are a **disposable TTL cache** with **no business state machine** (cache lifecycle only — `Doc-4K §B.12` + `Doc-2 §10.10`). The **`is_expired` flag** (`expires_at < now()`) is exposed; **a read NEVER extends TTL**; an expired row may be returned with `is_expired: true` until the System sweep deletes it; callers treat it as stale. TTL expiry ≠ business invalidation.

### 3.7 Non-Disclosure & Single-Owner Boundary (R9)
Reads are tenancy-scoped (§3.3). **Two not-found cases:** (a) own-org point-lookup for an **absent** artifact → `200` + **`null`** result (`Doc-4K` — "null = not-found"); (b) **cross-tenant / out-of-scope** → uniform **`NOT_FOUND` (`404`)** collapse — no existence/timing side-channel (`Doc-5A §6.3/§7`; `Doc-4A §7.5`/§12.4). `similar_vendors` results hold **bare UUIDv7 refs only**. Reads are **not audited** (`Doc-5A §17.1`).

---

## §4 — Derived-Artifact Read Surface Realization (BC-AI-1…4)

The four families are **structurally identical reads** (a point-lookup + a cursor list each), differing only in resource name and the Doc-4K-owned representation.

### 4.1 Endpoint Realization (§5.2/§5.3)
- **Point-lookup** → `GET /ai/{artifact-plural}/{id}` (`{id}` = artifact `UUIDv7`; `200`). **List** → `GET /ai/{artifact-plural}` (`200`). All 8 are **Query (`GET`) — safe, no request body** (`Doc-5A §5.2`); no caller-facing command.
- Inputs per §5.4: path `{id}` (point); query params (list, §4.4); **no prohibited input** (actor / org-selection / authz / state never a field — `Doc-4A §9.7`); tenancy `subject_org_id` is resolved from the server-validated active-org context, **never client-supplied as authority**.
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4K` BC-AI-1…4.

### 4.2 Success Representation (Doc-4K-owned; bound by pointer)
- **Point-lookup:** `result` = the **Doc-4K artifact representation** **or `null`** (`null` = own-org artifact absent; a `200`, not an error). It carries the computed **`is_expired`** flag and, for BC-AI-1, the two Recommendation value objects — **VO-1 `Score`** (advisory confidence, 0.0–1.0) and **VO-2 `Basis`** (rationale) — *non-authoritative; the Score is NOT a Trust score* (R6; VO-1/VO-2 bound to `Doc-4K §K5-VO`). No value object is enumerated for BC-AI-2/3/4 (`Doc-2 §2`); none invented.
- **List:** `result` = the §5.6 list shape (array of representations + opaque `cursor`).
- `similar_vendors` representations hold **bare UUIDv7 refs only** (R9).
- **Binds:** `Doc-5A §5.6`; `Doc-4K` BC-AI-1…4, `§K5-VO`; R5/R6/R9.

### 4.3 Disclosure Class per Read (§3.3)
All 8 → **Subject-Org-tenancy**. Two not-found cases: own-org absent → `200`+`null`; cross-tenant → `NOT_FOUND` `404` collapse (§3.7; R9). **Binds:** §3.3/§3.7; `Doc-5A §6.3/§7`; `Doc-4A §7.5`.

### 4.4 Pagination & Filters (list reads)
**Cursor-only — opaque `cursor`, no offset** (`CHK-5A-070`; `Doc-5A §8`). The list is implicitly scoped to the **`subject_org_id` tenancy — the server-validated active-org context, NOT a caller-supplied query param** (`Doc-4A §9.7`; `Doc-4K` index `(subject_org_id, entity_ref_id)`). Query-param filters: optional `entity_ref_id` / `entity_ref_type` and `include_expired` (default **excludes** expired; `true` includes with `is_expired: true`). Counts/items exclude out-of-scope rows identically (R9). **Binds:** `Doc-5A §8`; `CHK-5A-070`; `Doc-4K`.

### 4.5 Regenerable-Cache Read Semantics (R7)
`is_expired` exposed; **read never extends TTL**; expired rows returned until the System sweep hard-deletes them (§5); callers treat as stale; TTL expiry ≠ business invalidation; expired ≠ authoritative evidence (R5). Cache lifecycle only — no business state machine (`Doc-4K §B.12`; `Doc-2 §10.10`). **Binds:** `Doc-4K §B.12`; `Doc-2 §10.10`; R5/R7.

### 4.6 Error, Authorization & Audit
- Reads are **safe `GET`s — no idempotency key, no concurrency token, no body** (`Doc-5A §9` mutation rules N/A). Error classes per **`Doc-5A §6.2`** (by pointer; codes owned by `Doc-4K`, `ai_` namespace, `Doc-4A Appendix B.2`): `VALIDATION` → `400` (malformed `{id}` / `cursor` / filter); `AUTHORIZATION` → `403` **only** where own-tenancy already establishes the right to know the artifact exists, **else `404` collapse** (`Doc-5A §6.3`; `Doc-4A §12.4`; §3.7/R9); `NOT_FOUND` → `404` (cross-tenant). **No `REFERENCE`** — a read does no write-side cross-ref validation; a filter naming an absent `entity_ref` returns an **empty result**, never `422`. No `STATE`/`CONFLICT`.
- **Authorization** server-side via `check_permission` (§3.2; no `ai_` slug, `[ESC-AI-SLUG]`). **Reads not audited** (`Doc-5A §17.1`). **No `Doc-2 §8` event** (R8).
- **Binds:** `Doc-5A §6/§17.1`; `Doc-4C §C3`; `[ESC-AI-SLUG]`.

### 4.7 Per-Family Representation Pointers (Doc-4K-owned; not restated)

| BC | Family | Resource | Point | List | Representation owner |
|---|---|---|---|---|---|
| BC-AI-1 | Recommendation | `recommendations` | `ai.get_recommendation.v1` | `ai.list_recommendations.v1` | `Doc-4K` BC-AI-1 (+ VO-1 `Score` / VO-2 `Basis`, `§K5-VO` — advisory, firewall) |
| BC-AI-2 | Prediction | `predictions` | `ai.get_prediction.v1` | `ai.list_predictions.v1` | `Doc-4K` BC-AI-2 |
| BC-AI-3 | Classification Result | `classifications` | `ai.get_classification.v1` | `ai.list_classifications.v1` | `Doc-4K` BC-AI-3 |
| BC-AI-4 | Similar-Vendor Result | `similar_vendors` | `ai.get_similar_vendors.v1` | `ai.list_similar_vendors.v1` | `Doc-4K` BC-AI-4 (bare UUIDv7 refs only — R9) |

---

## §5 — Out-of-Wire Boundary (generate · expire · internal-service leg)

The **8 out-of-wire contracts have no HTTP wire** — in-process services / background jobs / event-free derivation, never a caller surface. Doc-5K realizes none as an endpoint (boundary statement only).

### 5.1 `generate_*` — AI-Agent on-demand + System scheduled (4)
`ai.generate_recommendation.v1` · `ai.generate_prediction.v1` · `ai.generate_classification.v1` · `ai.generate_similar_vendors.v1` — `21.4 Command / 21.5 System`, **Actor `AI Agent / System`** (no caller actor — out-of-wire). Invoked in-process, never over HTTP. **Idempotent upsert** on the **globally-unique cache identity `(subject_org_id, entity_ref_id, model_version)`** (`Doc-4K`; different `model_version` → new row); request key `ai_idempotency_key` (`UUIDv7`). Writes **only `ai.*`**; no authoritative write attributed to the AI Agent (R5). **Binds:** `Doc-4K` BC-AI-1…4; R5/R7.

### 5.2 `expire_*` — System TTL hard-delete sweep (4)
`ai.expire_recommendations.v1` · `ai.expire_predictions.v1` · `ai.expire_classifications.v1` · `ai.expire_similar_vendors.v1` — `21.5 System`, **Response: none**. Hard-deletes rows where `expires_at < now()` (legitimate hard-delete — disposable cache, **not** Invariant #8 append-only; `Doc-4K §B.12` + `Doc-2 §10.10`); idempotent; batch-configurable; System authority. **Binds:** `Doc-4K §B.12`; `Doc-2 §10.10`; R7.

### 5.3 Dual-audience internal-service consumption leg (mechanism)
The `get_*`/`list_*` **System / internal-service leg** (in-process artifact consumption by an owning module) has **no HTTP wire** (the caller-facing **User** leg is §4); **mechanism, not a counted contract**. **Binds:** §1.2; R1.

### 5.4 Protocol fence
**Out-of-wire contracts have no caller wire in any protocol: no REST, no SSE, no WebSocket, no Webhook, no GraphQL. No streaming protocol today; any future protocol addition requires governance approval (`Gov-Note §5` amendment), never a local decision.** **Flag-and-halt if any wire surface in any protocol is proposed.** Audit: `generate_*`/`expire_*` bind nearest `Doc-2 §9` action by pointer (`[ESC-AI-AUDIT]`); reads not audited (`§17.1`). **M9 emits no `Doc-2 §8` event** (R8; `[ESC-AI-EVENT]`). **Binds:** `Doc-5A §1.3/§11`; `[ESC-AI-AUDIT]`, `[ESC-AI-EVENT]`.

---

## §6 — Conformance & Carried Items

### 6.1 Conformance Obligation
Doc-5K passes the **Doc-5A Appendix A** `CHK-5A-xxx` checklist (Appendix A); conformance is transitive (Doc-4A + upstream not waived). Doc-5K **coins nothing** and **restates no DF-AI rule** — all by pointer.

### 6.2 Carried-Item Register (by pointer; resolved only via named channels)

| ID | Channel | Disposition |
|---|---|---|
| DF-AI-1 (Identity) · DF-AI-2 (Marketplace) · DF-AI-3 (RFQ) · DF-AI-4 (Operations) · DF-AI-5 (Trust) · DF-AI-6 (Platform Core) | `Doc-4K` | consumed by pointer; no rule restated (M-5); no cross-module surface realized |
| `[ESC-AI-AUDIT]` | Doc-2 §9 additive | generate/expire → nearest §9 action; reads not audited; never invented |
| `[ESC-AI-EVENT]` | Doc-2 §8 additive | M9 emits/consumes no event; §11 N/A; never coin an event |
| `[ESC-AI-POLICY]` | Doc-3 §12.2 additive | TTL keys `policy.ai.<bc>.ttl_seconds` by intended name; **not finalized until registered** |
| `[ESC-AI-SLUG]` | Doc-2 §7 additive | no `ai_` slug; reuse upstream entitlements via `check_permission`; never invented |
| `[REC-AI-WIRE]` | Doc-4K contract metadata | **Satisfied** — `generate_*` out-of-wire (no caller actor); final 8+8; reconfirm verbatim at code |

---

## Appendix A — Doc-5K Conformance Attestation

> Attestations only — **no normative behavior**; all binding rules live in §0–§6.

### A.1 Doc-5A core-band attestation

| Band | Check | Result |
|---|---|---|
| Method / status | `CHK-5A-035` success status from §5.5 (all reads `200`) | ✅ §4.1 |
| Top-level `reference_id` | `CHK-5A-042` at envelope top, never inside `error` | ✅ §2.1 |
| Pagination | `CHK-5A-070` cursor-only, no offset | ✅ §4.4 |
| Async | `CHK-5A-090/091/092` | **N/A** — no async wire (generation out-of-wire) |
| Route namespace | `CHK-5A-151` route prefix in App B.1 (`ai`) | ✅ §2.1 / R3 |
| Error-code namespace | `CHK-5A-152` / `-043` within `ai_` prefix | ✅ §4.6 |
| Anti-invention | `CHK-5A-121` nothing coined | ✅ §0.3 / R4 |
| Event payload | `CHK-5A-103` | **N/A** — M9 emits no event (R8) |
| Audit | reads not audited (`§17.1`); mutations `[ESC-AI-AUDIT]` | ✅ §4.6 / §5.4 |

### A.2 M9-unique band attestation

| Band | Attestation | Result |
|---|---|---|
| Advisory / non-authoritative | No caller bound; no AI-attributed authoritative write; writes only `ai.*`; expired ≠ authoritative evidence | ✅ R5 / §3.4 / §5.1 |
| Score / decision firewall | AI confidence (VO-1 `Score`) ≠ Trust score; snapshot-only (DF-AI-5); no matching/routing/award | ✅ R6 / §3.5 / §4.2 |
| Regenerable cache | TTL hard-delete legitimate (not append-only); globally-unique cache identity; TTL ≠ business invalidation; no business state machine | ✅ R7 / §4.5 / §5.2 |
| Non-disclosure | Subject-Org tenancy; own-org `null` vs cross-tenant `404`; bare-UUID similar-vendors; no leakage via totals | ✅ R9 / §3.7 / §4.3 |
| Actor | User read-only; AI-Agent/System out-of-wire; no public, no Admin | ✅ R2 / §3.1 / §5.1 |
| Protocol fence | No wire in any protocol for the 8 out-of-wire contracts; no streaming (governance-gated) | ✅ §5.4 |

### A.3 Freeze statement
Doc-5K realizes the M9 caller-facing surface as **8 read endpoints**, coins nothing, restates no DF-AI rule, and passes the applicable Doc-5A Appendix A checks. `[REC-AI-WIRE]` honored throughout. **No open BLOCKER / MAJOR / MINOR.** Carried to implementation: `[ESC-AI-POLICY]` TTL-key registration · `[REC-AI-WIRE]` verbatim reconfirm at code · DF-AI-1…6 consumed-contract verification at integration.

---

*End of Doc-5K Content v1.0 (FROZEN) — consolidated Pass-1/2/3. The M9 surface = 8 caller-facing reads (§4, all `GET`/`200`, representation-or-`null`, cursor-only, Subject-Org tenancy with own-org-`null`/cross-tenant-`404` non-disclosure) + the 8 out-of-wire contracts (§5, protocol-fenced) + conformance (§6) + the Appendix A attestation. Advisory / firewall / regenerable-cache / non-disclosure signature intact; nothing coined; no DF-AI rule restated. Authoring history + hard-review dispositions retained in `Doc-5K_Content_v1.0_Pass1/2/3.md`; freeze readiness certified by `Doc-5K_Content_Freeze_Audit_v1.0.md`. Conforms to `Doc-5K_Structure_v1.0_FROZEN.md` (+ Patch CE-01). On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt.*
