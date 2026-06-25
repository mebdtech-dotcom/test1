# Doc-5K — AI Layer (M9 `ai`) API Realization — Content v1.0, Pass 2 (§4)

| Field | Value |
|---|---|
| Document | Doc-5K — AI Layer (Module 9) — API Realization |
| Pass | 2 of 3 — §4 Derived-Artifact Read Surface Realization (BC-AI-1…4) — the 8 caller-facing reads |
| Status | ACTIVE — Content Pass 2 of 3; §4. 0 open BLOCKER/MAJOR/MINOR. Conforms to `Doc-5K_Structure_v1.0_FROZEN.md` (+ Patch CE-01); builds on Pass-1 (§0–§3 + inventory) |
| Realizes | the 8 §4 caller-facing reads on HTTP — method/path (§5.2/§5.3), request inputs (§5.4), success representation + status (§5.5/§5.6), pagination (§8), disclosure scope per read, non-disclosure, regenerable-cache read semantics |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Contains | The §5.7 realization (grouped form — Doc-5D/5H precedent) of each §4 read. No representations, error codes, POLICY keys, slugs, audit actions, events, scores, value-object semantics, or Doc-4K rules restated — bound by pointer; §5 out-of-wire + §6 + Appendix A are Pass-3 |
| Audience | Architecture / API Governance Boards · Doc-5K authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4K fixed the contracts + the artifact representations; Doc-5A fixed the wire mechanics; M9 artifacts carry **no business state machine** (cache lifecycle only; TTL/hard-delete per `Doc-4K §B.12` + `Doc-2 §10.10`). §4 realizes the **read wire face** and re-decides nothing. Representations, error codes, the (empty) M9 event set, scores, and value objects (VO-1/VO-2) are bound **by pointer, never restated**. The §3 cross-cutting model governs every read; **every read declares its disclosure scope = Subject-Org-tenancy** (§3.3).

**Dependency realization path:** `Doc-5A §5/§6/§7/§8/§17.1`; `Doc-4K` BC-AI-1…4, §B.12; `Doc-2 §10.10`; `Doc-4C §C3` (consumed); §3 (Pass-1).

---

## §4 — Derived-Artifact Read Surface Realization (BC-AI-1…4)

The four artifact families are **structurally identical reads** — a point-lookup and a cursor list each — differing only in resource name and the Doc-4K-owned representation. §4.1–§4.6 state the common realization once; §4.7 carries the per-family representation pointers.

### 4.1 Endpoint Realization (§5.2/§5.3; inventory §2.2)
- **Point-lookup** → `GET /ai/{artifact-plural}/{id}` — `{id}` = the artifact `UUIDv7` in path; success `200`. **List** → `GET /ai/{artifact-plural}` — success `200`. All 8 are **Query (`GET`) — safe, no request body** (`Doc-5A §5.2`); M9 exposes **no caller-facing command** (generate/expire out-of-wire — §5/Pass-3).
- Resource-plural path segment derives from the **operation-token stem** (`recommendations` · `predictions` · `classifications` · `similar_vendors`), not the table name — **[realization convention]** (Doc-5A silent on path text; binding rule = method/status). Surface version is the `Iv-Api-Version` header (`Doc-5A §12`); **no `/ai/v1/` path segment** (R3).
- Inputs per §5.4: path `{id}` (point); query params (list, §4.4); **no prohibited input** — actor / org-selection / authz / state are **never** a wire field (`Doc-4A §9.7`); the tenancy `subject_org_id` is resolved from the server-validated active-org context (§3.1), **never client-supplied as authority**.
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4K` BC-AI-1…4.

### 4.2 Success Representation (Doc-4K-owned; bound by pointer)
- **Point-lookup:** the success envelope's `result` is the **Doc-4K artifact representation** (owned by `Doc-4K` BC-AI-x) **or `null`** — *`null` = the own-org artifact does not exist (not yet generated)* (`Doc-4K`); a `null` result is a `200`, not an error. The representation carries the computed **`is_expired`** flag (`expires_at < now()`) and, for BC-AI-1, the advisory **confidence value (VO-1)** — *non-authoritative; NOT a Trust score* (R6; firewall; VO-1 semantics bound to `Doc-4K §K5-VO`, not restated).
- **List:** `result` is the §5.6 list shape — an array of representations + the opaque pagination `cursor` (§4.4).
- **Representations are advisory / non-authoritative** (R5) — the wire presents them as suggestions; no field binds the caller. `similar_vendors` representations hold **bare UUIDv7 refs only** (no vendor-data copies — R9).
- **Binds:** `Doc-5A §5.6`; `Doc-4K` BC-AI-1…4 (representations), `§K5-VO` (VO-1/VO-2); R5/R6/R9.

### 4.3 Disclosure Class per Read (§3.3 binding rule)
- All 8 reads → **Subject-Org-tenancy** scope: an artifact is read only by its `subject_org_id`. **Two not-found cases:** (a) **own-org, artifact absent** → `200` + `null` result (`Doc-4K` — "null = not-found"); (b) **cross-tenant / out-of-scope** → uniform **`NOT_FOUND` (`404`)** collapse — no existence/timing side-channel (`Doc-5A §6.3/§7`; `Doc-4A §7.5`; R9). The distinction never leaks another org's artifact existence.
- **Binds:** §3.3/§3.7; `Doc-5A §6.3/§7`; `Doc-4A §7.5`; `Doc-4K`.

### 4.4 Pagination & Filters (list reads)
- **Cursor-based pagination only — opaque `cursor`, no offset/index** (`CHK-5A-070`; `Doc-5A §8`). Filters (query params): `subject_org_id` scope (server-validated), optional `entity_ref_id` / `entity_ref_type`, and `include_expired` (default **excludes** expired rows; `include_expired: true` includes them with `is_expired: true`). Counts/items exclude out-of-scope rows identically (R9 — no leakage via totals).
- **Binds:** `Doc-5A §8`; `CHK-5A-070`; `Doc-4K` BC-AI-1…4 (filter fields).

### 4.5 Regenerable-Cache Read Semantics (R7)
- Artifacts are a **disposable TTL cache** with **no business state machine** (cache lifecycle only — `Doc-4K §B.12` + `Doc-2 §10.10`). On the read wire: the **`is_expired` flag** is exposed; **a read NEVER extends TTL**; an expired row may be returned (with `is_expired: true`) until the System sweep hard-deletes it (§5); **callers treat an expired artifact as stale** (and may trigger out-of-wire regeneration). TTL expiry **≠** business invalidation; an expired (or live) artifact is **never authoritative historical evidence** (R5).
- **Binds:** `Doc-4K §B.12`; `Doc-2 §10.10`; R5/R7.

### 4.6 Error, Authorization & Audit
- Reads are **safe `GET`s — no idempotency key, no concurrency token, no request body** (`Doc-5A §9` mutation rules N/A). Error classes per **`Doc-5A §6.2`** (by pointer; codes owned by the `Doc-4K` register, `ai_` namespace, `Doc-4A Appendix B.2`): `VALIDATION` → `400` (malformed `{id}`/cursor/filter), `AUTHORIZATION` → `403` **else `404` collapse** (§3.7/R9), `NOT_FOUND` → `404` (cross-tenant), `REFERENCE` → `422`. No `STATE`/`CONFLICT` (no state transition; no write).
- **Authorization** server-side via `check_permission` (§3.2; the requesting org's upstream entitlement on the inputs — **no `ai_` slug**, `[ESC-AI-SLUG]`). **Reads are not audited** (`Doc-5A §17.1`). **M9 emits no `Doc-2 §8` event** (R8).
- **Binds:** `Doc-5A §6/§17.1`; `Doc-4C §C3` (consumed); `[ESC-AI-SLUG]`.

### 4.7 Per-Family Representation Pointers (Doc-4K-owned; not restated)

| BC | Family | Resource | Point | List | Representation owner |
|---|---|---|---|---|---|
| BC-AI-1 | Recommendation | `recommendations` | `ai.get_recommendation.v1` | `ai.list_recommendations.v1` | `Doc-4K` BC-AI-1 (+ VO-1 confidence, `§K5-VO` — advisory, firewall) |
| BC-AI-2 | Prediction | `predictions` | `ai.get_prediction.v1` | `ai.list_predictions.v1` | `Doc-4K` BC-AI-2 |
| BC-AI-3 | Classification Result | `classifications` | `ai.get_classification.v1` | `ai.list_classifications.v1` | `Doc-4K` BC-AI-3 |
| BC-AI-4 | Similar-Vendor Result | `similar_vendors` | `ai.get_similar_vendors.v1` | `ai.list_similar_vendors.v1` | `Doc-4K` BC-AI-4 (bare UUIDv7 refs only — R9) |

- **Top-level `reference_id` (C-05):** every read response (always `200` body-bearing) carries the top-level `reference_id` declared in §2.1 (Pass-1) — not restated per read.

---

*End of Doc-5K Content v1.0, Pass 2 (§4). The 8 caller-facing reads realized as safe `GET`s (point-lookup `/{id}` → `200` + representation **or `null` = not-found**; cursor list → `200` + array, no offset — `CHK-5A-070`); resource-plural paths from the operation-token stem `[realization convention]`, no `/ai/v1/` segment; success representations owned by `Doc-4K` BC-AI-1…4 (+ VO-1 confidence, advisory/firewall — not a Trust score), bound by pointer, never restated; Subject-Org disclosure scope with the two not-found cases (own-org `null` vs cross-tenant `404` collapse — R9); cursor pagination + `include_expired` filter; regenerable-cache read semantics (`is_expired`, read never extends TTL, no business state machine — `Doc-4K §B.12` + `Doc-2 §10.10`); reads not audited (`§17.1`), no event (R8), no idempotency/concurrency (safe `GET`); `check_permission` sole authority, no `ai_` slug (`[ESC-AI-SLUG]`); nothing coined — no endpoint/status/error-class/slug/POLICY key/event/score. §5 (out-of-wire boundary), §6 (conformance) + Appendix A follow in Pass-3, conforming to `Doc-5K_Structure_v1.0_FROZEN.md` (+ Patch CE-01).*
