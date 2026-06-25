# Doc-5K — AI Layer (M9 `ai`) API Realization — Content v1.0, Pass 1 (§0–§3 + inventory)

| Field | Value |
|---|---|
| Document | Doc-5K — AI Layer (Module 9) — API Realization |
| Pass | 1 of 3 — §0 Document Control · §1 Scope & Partition · §2 Realized Endpoint Inventory (8 caller-facing reads) · §3 Cross-Cutting Wire Model |
| Status | ACTIVE — Content Pass 1 of 3. **Independent Hard Review applied: MAJOR-01 `Doc-4K §K13` dangling-pointer corrected → `Doc-4K §B.12` + `Doc-2 §10.10`; m-01 not-found semantics (own-org `null` vs cross-tenant `404`); m-02 cursor-only pagination (`CHK-5A-070`); NP-01 path-stem [rc] basis.** 0 open BLOCKER/MAJOR/MINOR. Conforms to `Doc-5K_Structure_v1.0_FROZEN.md`. **Carried errata (CE-01):** the FROZEN structure (R7, §4) inherits the same stale `Doc-4K §K13` pointer — fix via an additive pointer-only erratum patch (non-substantive; same fact = §B.12 / Doc-2 §10.10) |
| Realizes | the 8 caller-facing M9 read endpoints' wire face (method/path/actor/active-org/status); the 8 out-of-wire contracts (`generate_*` · `expire_*` · get/list internal-service leg) + §5.7 per-endpoint bodies are Pass-2/3 |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | `Doc-5K_Structure_v1.0_FROZEN.md` (R1–R9; 16-contract partition; REC-1 resolved 8+8) |
| Contains | §0–§3 + the read inventory. No §5.7 contract bodies, representations, error codes, POLICY keys, slugs, audit actions, events, scores, or Doc-4K rules restated — bound by pointer |
| Audience | Architecture / API Governance Boards · Doc-5K authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4K fixed the contracts; Doc-5A fixed the wire mechanics; M9 artifacts carry **no business state machine** (cache lifecycle only; TTL/hard-delete per `Doc-4K §B.12` + `Doc-2 §10.10` (cache semantics) — no state-machine section defined). §0–§3 realize the **wire face** and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, the (empty) M9 event set, scores, and DF-AI rules are bound **by pointer, never restated**. The §3 cross-cutting model (User read · `check_permission` sole authority · advisory/non-authoritative · score firewall · regenerable-cache · non-disclosure) governs every endpoint; **every read declares its disclosure scope = Subject-Org-tenancy** (§3.3 binding rule).

**Dependency realization path:** `Doc-5A §5/§6/§7/§8`; `Doc-4K` BC-AI-1…4; `Doc-4C §C3/§C8` (consumed); §3 (this document).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
Doc-5K sits at: `Master Architecture → ADR Compendium → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A → Doc-4K → Doc-5A → **Doc-5K** → Code`. On any conflict, the higher document governs and Doc-5K is corrected; **flag-and-halt**, never resolve locally (`Gov-Note §7`).

### 0.2 Scope of Authority
Doc-5K realizes **only the M9 caller-facing read wire face**. It owns no entity, state edge, event, slug, audit action, POLICY key, or **score** — those are Doc-2/Doc-4K/Doc-3/Trust. It realizes no other module's surface (§1.3) and writes only `ai.*` (R5).

### 0.3 Conformance Obligation
Every section conforms to **Doc-5A** and must pass the **Doc-5A Appendix A** `CHK-5A-xxx` checklist before freeze (`Gov-Note §6`). Doc-5K **coins nothing** — no endpoint, status, header, error class, slug, POLICY key, event, or **score** (R4/R8; `CHK-5A-121`).

### 0.4 Realize-Never-Redecide & Realization Conventions
Where Doc-5A is **silent** on a transport detail (e.g., the concrete path string), Doc-5K fixes a **[realization convention]** that contradicts nothing upstream; the binding rule (method, status, namespace) remains Doc-5A. Where the corpus **decides**, Doc-5K binds by pointer and never re-opens it. **No DF-AI rule is restated — only referenced** (M-5).

---

## §1 — Scope, Audience & M9 Surface Partition

### 1.1 What Doc-5K Governs
The **8 caller-facing** read endpoints (User) across BC-AI-1…4 — the `get_*`/`list_*` reads of the four advisory artifacts (Recommendation, Prediction, Classification Result, Similar-Vendor Result). It does **not** govern the 8 out-of-wire contracts (the 4 `generate_*` AI-Agent/System derivations, the 4 `expire_*` System TTL sweeps, and the dual-audience internal-service consumption leg — §5/Pass-3), nor any other module's surface.

### 1.2 M9 Surface Partition (carried from FROZEN structure; REC-1 resolved)

**16 contracts = 8 caller-facing + 8 out-of-wire.** `generate_*` are out-of-wire (Actor `AI Agent / System` — no caller actor); the get/list internal-service leg is a *mechanism, not a counted contract*.

| Doc-5K § | Surface | Caller-facing | Out-of-wire (→ §5) |
|---|---|---|---|
| §4 | Derived-Artifact Reads (`get_*`/`list_*` User leg) | 8 | — |
| §5 | `generate_*` (4) · `expire_*` (4) · get/list internal leg (mechanism) | — | 8 |
| **Total** | | **8** | **8** = **16** |

### 1.3 Dependency Boundary
M9 realizes only M9 surfaces. Cross-module concerns are the owning module's Doc-5x. M9 **reads** other modules' entitled data/scores by pointer — Identity (`check_permission`/tenancy — DF-AI-1), Marketplace (vendor refs — DF-AI-2), RFQ (RFQ/quotation refs; RFQ owns matching/award — DF-AI-3), Operations (entitled private-record/engagement reads — DF-AI-4), Trust (read-only score **snapshot** — DF-AI-5), Platform Core (audit/UUIDv7 — DF-AI-6) — and **writes only `ai.*`**, never directly or indirectly mutating another BC's authoritative table (R5).

### 1.4 Audience & Carried Items
Carried by pointer, resolved only via their Doc-4K channels (none resolved here; **no DF-AI rule restated**): **DF-AI-1…6**; `[ESC-AI-AUDIT]` (Doc-2 §9 additive), `[ESC-AI-EVENT]` (Doc-2 §8 additive — none today), `[ESC-AI-POLICY]` (Doc-3 §12.2 additive — TTL keys `policy.ai.<bc>.ttl_seconds`), `[ESC-AI-SLUG]` (Doc-2 §7 additive — no `ai_` slug); **`[REC-AI-WIRE]`** (satisfied at structure freeze — `generate_*` out-of-wire; **reconfirm verbatim** in Pass-2/3).

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace, Path Grammar, Method & `reference_id`
- **Route namespace `ai`** (`Doc-5A Appendix B.1`; `Doc-2 §0.3`). Paths follow `/ai/{artifact-plural}[/{id}]` (`Doc-5A §5.3`); **the surface version is an `Iv-Api-Version` header / `Doc-5A §12` concern — there is no `/ai/v1/…` path segment** (R3). Concrete path strings are **[realization convention]** (Doc-5A is silent on path text; the binding rules are method §5.2, status §5.5).
- **Method mapping (`Doc-5A §5.2`):** every M9 caller-facing contract is a **Query → `GET`** (point-lookup item or paginated list), success **`200`** (`Doc-5A §5.5`). M9 has **no caller-facing command** (all `generate_*`/`expire_*` are out-of-wire — §5). List reads use **cursor-based pagination only — opaque `cursor`, no offset/index** (`CHK-5A-070`; `Doc-5A §8`).
- **Path-resource [realization convention]:** the resource-plural path segment derives from the **operation-token stem** (`recommendations`, `predictions`, `classifications`, `similar_vendors`) — not the underlying table name (e.g. `ai.classification_results`); Doc-5A is silent on path text, the binding rule is method/status. Applied uniformly across the 4 families.
- **Command tokens** are the exact `ai.<operation>` names **verbatim from the Doc-4K per-contract blocks**. **Inventory ordering within a section is non-authoritative and informational only; the partition table (§1.2) is authoritative — on conflict the partition table wins; inventory order never implies lifecycle order. Every contract has exactly one owner section — never partial, duplicated, inherited, or implied** (M-3).
- **Top-level `reference_id` (C-05):** every body-bearing response carries a top-level `reference_id` (platform-assigned `UUIDv7`) — `Doc-4A §22.1 C-05` / `Doc-4A_Patch_C-05-204_v1.0` (body-bearing only; `204` exempt — N/A here, all reads are `200`); sibling of `result`, never nested in `error` (`CHK-5A-042`).

### 2.2 Inventory — §4 Derived-Artifact Reads (BC-AI-1…4, 8)

| # | Contract | Actor | Method · Path **[rc]** | Active-org | Success |
|---|---|---|---|---|---|
| 1 | `ai.get_recommendation.v1` | User | `GET /ai/recommendations/{id}` (point; own-org artifact representation **or `null` = not-found**, `Doc-4K`; `is_expired`) | Y | `200` |
| 2 | `ai.list_recommendations.v1` | User | `GET /ai/recommendations` (cursor list; `subject_org_id`; `entity_ref_id`/`entity_ref_type` filters; `include_expired`) | Y | `200` |
| 3 | `ai.get_prediction.v1` | User | `GET /ai/predictions/{id}` | Y | `200` |
| 4 | `ai.list_predictions.v1` | User | `GET /ai/predictions` (cursor list; filters) | Y | `200` |
| 5 | `ai.get_classification.v1` | User | `GET /ai/classifications/{id}` | Y | `200` |
| 6 | `ai.list_classifications.v1` | User | `GET /ai/classifications` (cursor list; filters) | Y | `200` |
| 7 | `ai.get_similar_vendors.v1` | User | `GET /ai/similar_vendors/{id}` (result holds **bare UUIDv7 refs only** — R9) | Y | `200` |
| 8 | `ai.list_similar_vendors.v1` | User | `GET /ai/similar_vendors` (cursor list; filters) | Y | `200` |

### 2.3 Out-of-wire exclusion
The 8 out-of-wire contracts — the 4 `generate_*` (AI-Agent on-demand + System scheduled; no caller actor), the 4 `expire_*` (System TTL hard-delete sweep), and the dual-audience `get_*`/`list_*` internal-service consumption leg — are **excluded from this inventory** (no HTTP wire in any protocol). They are realized as the §5 out-of-wire boundary in Pass-3.

---

## §3 — Cross-Cutting Actor, Advisory & Firewall Wire Model *(mechanism only — owns no endpoint)*

This section realizes the cross-cutting mechanism every §4 read depends on. **It instantiates no endpoint body.**

### 3.1 Actor Model
**User read-only on the wire — there is NO public/anonymous actor and NO Admin actor** (R2). The User carries `Authorization` (authentication) **and** `Iv-Active-Organization` — **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`). The **AI Agent** actor (`generate_*`) is **M9-internal, never an HTTP caller**; System (`generate_*`/`expire_*`) is out-of-wire (§5).

### 3.2 Authorization Authority
Authorization is resolved **server-side via Identity's `check_permission`** (`Doc-4C §C3`, consumed — DF-AI-1). **`check_permission` is the sole authorization authority consumed by M9 surfaces; no parallel or shadow authorization path is permitted** (`Doc-4A §5.3`, `Doc-4A §6`). **No `ai_` permission slug exists** — caller-gating reuses the requesting org's upstream entitlements on the inputs; the gap carries `[ESC-AI-SLUG]` (Doc-2 §7 additive; never invented).

### 3.3 Per-Read Disclosure-Scope Rule (binding)
**Every §4 read declares its disclosure scope = Subject-Org-tenancy** — an artifact is read only by its `subject_org_id`. A cross-tenant / out-of-scope read **collapses to a uniform `NOT_FOUND`** — no existence/timing side-channel (`Doc-5A §6.3/§7`; `Doc-4A §7.5`; R9). An ambiguous/undeclared scope is a **content-authoring blocker**.

### 3.4 Advisory / Non-Authoritative (M9 signature — R5)
Artifacts are **presented as non-authoritative**; **no caller is bound** by them. **M9 owns only `ai.*` persistence and never directly or indirectly mutates another bounded context's authoritative table; no authoritative write is ever attributed to the AI Agent** — an authoritative action arising from an advisory is executed by a User/System contract in the **owning** module (DF-AI-3). **Expired (or live) artifacts can never become authoritative historical evidence.** M9 realizes no decision/mutation/matching/routing/award surface.

### 3.5 Score / Decision Firewall (R6)
**AI confidence ≠ Trust score.** M9 computes/owns/re-publishes **no** Trust/Performance/Verification/Governance score and produces **no** matching/routing/award/eligibility decision (RFQ owns — DF-AI-3). M9 reads a published score only where the org is entitled (DF-AI-5 — Trust read-only score output), **as a point-in-time snapshot only, never a live coupling**.

### 3.6 Regenerable-Cache Read Semantics (R7)
Artifacts are a **disposable TTL cache** with **no business state machine** (cache lifecycle only; TTL/hard-delete per `Doc-4K §B.12` + `Doc-2 §10.10` (cache semantics) — no state-machine section defined). On the read wire: the **`is_expired` flag** (`expires_at < now()`) is exposed; **a read NEVER extends TTL**; an expired row may be returned with `is_expired: true` until the System sweep deletes it; **callers treat an expired artifact as stale** (and may trigger out-of-wire regeneration). TTL expiry ≠ business invalidation.

### 3.7 Non-Disclosure & Single-Owner Boundary (R9)
Reads are tenancy-scoped (§3.3). **Two distinct not-found cases:** (a) an **own-org point-lookup for an absent artifact** (not yet generated) returns the success envelope with a **`null` result** (`200`; `Doc-4K` — "null = not-found"); (b) a **cross-tenant / out-of-scope** read **collapses to `NOT_FOUND` (`404`)** — no existence/timing side-channel (R9; `Doc-4A §7.5`). `similar_vendors` results hold **bare UUIDv7 refs only** (no vendor-data copies — M9 owns no vendor data; widens/leaks no protected fact — DF-AI-2/DF-AI-4). Reads are **not audited** (`Doc-5A §17.1`).

---

*End of Doc-5K Content v1.0, Pass 1 (§0–§3 + inventory). The 8 caller-facing reads realized per the §5.2 method mapping (all Query → `GET` → `200`; point-lookup `/{id}` + cursor list); route namespace `ai` (paths `[realization convention]`, no `/ai/v1/` version segment); the 8 out-of-wire contracts excluded (§5/Pass-3); the §3 cross-cutting model (User read, no public/Admin · `check_permission` sole authority, no `ai_` slug · Subject-Org disclosure scope · advisory/non-authoritative, no AI-attributed authoritative write, writes only `ai.*` · score firewall, snapshot-only · regenerable-cache, `is_expired`, read never extends TTL, no business state machine · non-disclosure `NOT_FOUND`, bare-UUID similar-vendors) governs every endpoint; representations/codes/POLICY keys/slugs/audit actions/events/scores/DF-AI rules not restated; nothing coined. §4 read bodies (§5.7) + §5 out-of-wire + §6 conformance + Appendix A follow in Pass-2 (§4) and Pass-3 (§5–§6 + Appendix A), each conforming to `Doc-5K_Structure_v1.0_FROZEN.md`.*
