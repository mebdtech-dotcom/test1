# Doc-5C — Identity & Organization (M1 `identity`) API Realization — Content v1.0, Pass 1 (§0–§3 + inventory)

| Field | Value |
|---|---|
| Document | Doc-5C — Identity & Organization (Module 1) — API Realization |
| Pass | 1 of 2 — §0, §1, §2 (inventory) and §3 (cross-cutting wire model) |
| Status | ACTIVE — Content Pass 1 of 2; §0–§3 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5C_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Realizes | `Doc-4C` (M1 contracts, FROZEN — 42 contracts, PassB Appendix A) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN), Doc-4C v1.0 (FROZEN), Doc-4M v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Contains | Document control + scope/surface-partition + the **35-endpoint** caller-facing inventory + the §3 cross-cutting authorization/context **wire model** (mechanism only). No §5.7 template instantiations (Pass-2), no out-of-wire realization detail, no schemas, no contract bodies restated |
| Audience | Architecture / API Governance Boards · Doc-5C content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4C fixed *what* each M1 contract declares (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Pass-1 fixes Doc-5C's precedence/scope, the **caller-facing endpoint inventory** (method, path, actor, active-org applicability, success) for the **35** caller-facing M1 endpoints, and the **§3 cross-cutting wire model** that §4–§6 endpoints depend on — all bound to Doc-5A / Doc-4C by pointer. It instantiates no full endpoint template (that is §4–§6), realizes no out-of-wire mechanism (§7), and coins no endpoint/status/header/error-class/slug/POLICY key. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5/§7` · `Doc-4C §C0–§C3/§C8/§C12` · Appendix B.1 (`identity`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence

- Doc-5C sits one realization level below Doc-5A in the chain Doc-5A fixes (`Doc-5A §0.1`):
  ```
  Master Architecture → ADR Compendium → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-5A → Doc-5C → Code
  ```
- Doc-5C **MUST NOT** override, reinterpret, or weaken any higher document. On conflict, the higher document prevails automatically and Doc-5C is patched (`Doc-5A §0.1`; flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`. **Rationale:** the realization layer inherits, never re-opens, the frozen decisions above it.

### 0.2 Scope of Authority

- Doc-5C governs **how the FROZEN Doc-4C contracts of Module 1 are realized as concrete HTTP APIs on the bound transport** — the wire realization layer only.
- Doc-5C does **not** govern: *what* a contract declares (owned by Doc-4C / Doc-4A, by pointer); domain facts (Doc-2/Doc-3); the state-machine definitions (Doc-4M); persistence (Doc-6); framework/transport implementation; the **authentication mechanism** (Supabase Auth — DC-4); or the M1 in-process mechanisms that have no wire (§7, out-of-wire).
- **Binds:** `Doc-5A §0.2`; Doc-4C §C0/§C1. **Rationale:** one realization document, one wire surface; everything else is bound by pointer.

### 0.3 Conformance Obligation

- Before Doc-5C may freeze, it **MUST** pass the Doc-5A **Appendix A** conformance checklist (`CHK-5A-xxx`) in full (`Doc-5_Program_Governance_Note_v1.0 §6`). A failing check blocks freeze. Doc-5C coins **no** endpoint, status, header, error class, permission slug, or POLICY key (`CHK-5A-121`, `CHK-5A-154`; `Doc-4A §6.4`).
- **Binds:** `Doc-5A §0.5`, Appendix A. **Rationale:** conformance is an obligation; the checklist is the gate (attested in §8 / Appendix A, Pass-2).

### 0.4 Realize-Never-Redecide

- Doc-5C binds each realized point to its Doc-4C / Doc-5A / corpus owner by pointer and **MUST NOT** copy, paraphrase-with-change, or re-decide it. A purely transport-level detail on which Doc-4A/Doc-5A are silent **MAY** be fixed as a **[realization convention]** that contradicts nothing upstream. Missing authority for a declared element ⇒ flag-and-halt (`Doc-5A §0.3`).
- **Binds:** `Doc-5A §0.3`.

---

## §1 — Scope, Audience & M1 Surface Partition

### 1.1 What Doc-5C Governs

- Doc-5C is the **HTTP realization of Module 1's caller-facing contracts** — user/organization/membership/role/delegation/buyer-profile/workflow-settings operations and the active-organization context surface. It contains no other module's surface.
- M1's primary actor is the **User** acting inside a **server-validated active organization** (`Doc-4C §C12.1`; `Doc-5A §7.3` — R2); a platform-governance **Admin** subset (21.6) carries **no** org context (`Doc-5A §7.3`); **System** timers and the **§C3 authorization-resolution reads** are **out-of-wire** (§7, R1).
- **Binds:** `Doc-5A §1`, §7; Doc-4C §C1/§C12.

### 1.2 M1 Surface Partition

The 42 Doc-4C contracts partition by wire-realizability (structure R1) — **35 caller-facing**, **7 out-of-wire**. The canonical partition (from `Doc-5C_Structure_v1.0_FROZEN`, with the explicit **Doc-5C §** owner per group):

| Doc-4C contracts | Nature | **Doc-5C §** |
|---|---|---|
| §C4 `update_user_profile`, `update_user_2fa_settings`, `deactivate_own_account` | User command (21.4) | **§4** `POST` |
| §C4 `set_user_account_status` · §C5 `set_organization_status`, `admin_recover_ownership` | Admin governance (21.6, no org context) | **§4** `POST` |
| §C5 `create_organization`, `update_organization_profile`, `transfer_ownership`, `soft_delete_organization`, `restore_organization` | User command (21.4; §5.1 machine) | **§4** `POST` |
| §C6 `invite_member`, `accept_invitation`, `set_membership_status`, `remove_member`, `revoke_invitation` | User command (21.4; §5.2 machine) | **§5** `POST` |
| §C7 `create_role`, `update_role`, `set_role_permissions`, `delete_role` · `list_roles`, `list_permissions` | User command / Query (21.4 / 21.3) | **§5** `POST` / `GET` |
| §C9 `create/suspend/reinstate/revoke_delegation_grant` · `get_delegation_grant`, `list_delegation_grants` | User command / Query (21.4 / 21.3; §5.10 machine; R5) | **§5** `POST` / `GET` |
| §C8 `switch_active_organization` · `get_active_context`, `list_my_organizations` | User command / Query (21.4 / 21.3) | **§6** `POST` / `GET` |
| §C10 `upsert_buyer_profile` · §C11 `update_workflow_settings` | User command (21.4) | **§6** `POST` |
| §C10 `get_buyer_profile` · §C11 `get_workflow_settings` (owning-org read) | Query (21.3), dual-audience | **§6** `GET` (internal-service M3/M6 leg → §7) |
| §C3 `get_user`, `get_organization`, `get_membership`, `check_permission` (authorization root) | internal-service (21.3) | **§7** out-of-wire |
| §C6 `activate_membership`, `expire_invitation` · §C9 `expire_delegation_grant` · DC-1 cross-module cascade/teardown | System (21.5) / Integration | **§7** out-of-wire |

- **Binds:** `Doc-5C_Structure_v1.0_FROZEN` (canonical partition); Doc-4C PassB Appendix A; `Doc-5A §1.3`. **Rationale:** only contracts with a caller-facing wire are realized; the authorization root, timers, and cross-module integration are fenced (§7), never given a wire. §3 is the cross-cutting mechanism and owns no endpoint.

### 1.3 Dependency Boundary

- **M1 owns realization only for M1 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (Marketplace → Doc-5D; RFQ → Doc-5E). Doc-5C references other modules **by ID / public contract only** and realizes no other module's surface. The §C3 authorization reads are consumed by other modules **in-process** (out-of-wire), never as an M1 HTTP endpoint.
- **Binds:** `Doc-5A §1` (scope allocation); structure §1.x.

### 1.4 Audience & Carried Items

- **Audience:** Architecture / API Governance Boards; Doc-5C content authors (human + AI); AI Coding Supervisor; backend and QA engineers.
- **Carried (Doc-4C Appendix C — by pointer; resolved only via named channels, never here):** **DC-1** (no `identity` event — cross-module cascade out-of-wire, R6), **DC-2** (verification ownership = Trust), **DC-3** (`staff_*` admin slugs), **DC-4** (auth mechanism = infrastructure), **DC-5** (`identity.*` POLICY-key registration — `[DC-5]`-keyed contracts not finalized until registered), `[ESC-IDN-SLUG]`, `[ESC-IDN-AUDIT]`, `[ESC-IDN-DELEG-EXPIRY]` (`reinstate_delegation_grant` not finalized until Doc-2 §5.10 resolves).
- **Binds:** Doc-4C §C12, Appendix C; Doc-2 §7.

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace & Path Grammar

- All M1 caller-facing endpoints live under the reserved **`identity`** route prefix (Appendix B.1; `Doc-2 §0.3`) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. Resource segments are the owning entity tables (Doc-2 §3.2), rendered **plural** **[realization convention]**.
- Command tokens are the **exact `snake_case` operation names from the Doc-4C PassB Appendix A Contract-ID column** (`identity.<operation>.v1`), used verbatim as the `{command-name}` segment (`Doc-5A §5.3`) — no shortening, substitution, or invention.
- **Binds:** `Doc-5A §5.2/§5.3`, Appendix B.1; Doc-2 §0.3, §3.2.

### 2.2 Inventory — §4 User & Organization Surface (11)

> **Methods conform to `Doc-5A §5.2` (realized in Pass-2):** create → `POST` collection (`201`); partial update → `PATCH` item; ADR-012 soft-delete → `DELETE` item; state/domain command → `POST` named sub-resource; read → `GET`.

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 1 | `identity.update_user_profile.v1` | User (self) | `PATCH` | `/identity/users/{id}` | N (self) | `200` |
| 2 | `identity.update_user_2fa_settings.v1` | User (self) | `POST` | `/identity/users/{id}/update_user_2fa_settings` | N (self) | `200` |
| 3 | `identity.deactivate_own_account.v1` | User (self) | `POST` | `/identity/users/{id}/deactivate_own_account` | N (self) | `200` |
| 4 | `identity.set_user_account_status.v1` | Admin | `POST` | `/identity/users/{id}/set_user_account_status` | N (admin) | `200` |
| 5 | `identity.create_organization.v1` | User | `POST` | `/identity/organizations` | N (bootstrap) | `201` |
| 6 | `identity.update_organization_profile.v1` | User | `PATCH` | `/identity/organizations/{id}` | Y | `200` |
| 7 | `identity.transfer_ownership.v1` | User (Owner) | `POST` | `/identity/organizations/{id}/transfer_ownership` | Y | `200` |
| 8 | `identity.soft_delete_organization.v1` | User (Owner) | `DELETE` | `/identity/organizations/{id}` | Y | `200` |
| 9 | `identity.restore_organization.v1` | User (Owner) / Admin | `POST` | `/identity/organizations/{id}/restore_organization` | Y / N (admin) | `200` |
| 10 | `identity.set_organization_status.v1` | Admin | `POST` | `/identity/organizations/{id}/set_organization_status` | N (admin) | `200` |
| 11 | `identity.admin_recover_ownership.v1` | Admin | `POST` | `/identity/organizations/{id}/admin_recover_ownership` | N (admin) | `200` |

### 2.3 Inventory — §5 Membership, Role & Delegation Surface (17)

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 12 | `identity.invite_member.v1` | User | `POST` | `/identity/memberships` | Y | `201` |
| 13 | `identity.accept_invitation.v1` | User (invitee) | `POST` | `/identity/memberships/{id}/accept_invitation` | N (pre-membership) | `200` |
| 14 | `identity.set_membership_status.v1` | User | `POST` | `/identity/memberships/{id}/set_membership_status` | Y | `200` |
| 15 | `identity.remove_member.v1` | User | `POST` | `/identity/memberships/{id}/remove_member` | Y | `200` |
| 16 | `identity.revoke_invitation.v1` | User | `POST` | `/identity/memberships/{id}/revoke_invitation` | Y | `200` |
| 17 | `identity.list_permissions.v1` | User / int-svc | `GET` | `/identity/permissions` | N (platform catalog) | `200` |
| 18 | `identity.list_roles.v1` | User | `GET` | `/identity/roles` | Y | `200` |
| 19 | `identity.create_role.v1` | User | `POST` | `/identity/roles` | Y | `201` |
| 20 | `identity.update_role.v1` | User | `PATCH` | `/identity/roles/{id}` | Y | `200` |
| 21 | `identity.set_role_permissions.v1` | User | `POST` | `/identity/roles/{id}/set_role_permissions` | Y | `200` |
| 22 | `identity.delete_role.v1` | User | `DELETE` | `/identity/roles/{id}` | Y | `200` (soft-delete) |
| 23 | `identity.create_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants` | Y | `201` |
| 24 | `identity.suspend_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/{id}/suspend_delegation_grant` | Y | `200` |
| 25 | `identity.reinstate_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/{id}/reinstate_delegation_grant` | Y | `200` *(`[ESC-IDN-DELEG-EXPIRY]` — not finalized)* |
| 26 | `identity.revoke_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/{id}/revoke_delegation_grant` | Y | `200` |
| 27 | `identity.get_delegation_grant.v1` | User (party) | `GET` | `/identity/delegation_grants/{id}` | Y (party scope) | `200` |
| 28 | `identity.list_delegation_grants.v1` | User (party) | `GET` | `/identity/delegation_grants` | Y (party scope) | `200` |

### 2.4 Inventory — §6 Context, Buyer-Profile & Workflow-Settings Surface (7)

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 29 | `identity.switch_active_organization.v1` | User | `POST` | `/identity/active_context/switch_active_organization` *(context command — §6.2 flag)* | establishes context | `200` |
| 30 | `identity.get_active_context.v1` | User | `GET` | `/identity/active_context` | principal-scoped | `200` |
| 31 | `identity.list_my_organizations.v1` | User | `GET` | `/identity/organizations` *(principal-scoped, server-derived)* | principal-scoped | `200` |
| 32 | `identity.upsert_buyer_profile.v1` | User | `PATCH` | `/identity/buyer_profiles` *(active-org singleton — §6.2 flag)* | Y | `200` |
| 33 | `identity.get_buyer_profile.v1` | User (owning-org) | `GET` | `/identity/buyer_profiles` *(owning-org)* | Y (owning-org) | `200` |
| 34 | `identity.update_workflow_settings.v1` | User | `PATCH` | `/identity/organization_workflow_settings` *(active-org singleton)* | Y | `200` |
| 35 | `identity.get_workflow_settings.v1` | User (owning-org) | `GET` | `/identity/organization_workflow_settings` *(owning-org)* | Y (owning-org) | `200` |

### 2.5 Inventory Notes

- **Methods (§5.2):** create → `POST` to the **collection** (`201` + `Location`); partial non-state field update → `PATCH` on the item; ADR-012 soft-delete → `DELETE` on the item; state-transition / domain command → `POST` to a **named command sub-resource**; read → `GET` (safe). Never arbitrary field replacement; never `PUT` (§5.2).
- **Success (§5.5):** creates (`create_organization`, `invite_member`, `create_role`, `create_delegation_grant`) realize `201`; all other commands and reads realize `200` (synchronous; no async — none returns `202`/`204`). `Doc-4A §10.2/§10.3`.
- **Active-Org column** records, by pointer, whether the §3 `Iv-Active-Organization` mechanism applies; the **rule is §3** and the per-endpoint application is finalized in §4–§6. Self-user ops (1–3) act on the platform-owned `users` record (no org); Admin ops (4, 10, 11; admin leg of 9) carry no org context (§7.3); `create_organization` (5) is the bootstrap (no prior org); `accept_invitation` (13) is pre-membership (the invitation scopes it server-side); the context surface (29–31) establishes/reads principal context.
- **⚠ Context / singleton addressing [realization convention] — flagged for Hard Review (detailed in Pass-2 §6.2):** endpoints 29–32, 34 do not address a single child-entity row by `{id}`. Realized as: `switch_active_organization` = a context command `POST /identity/active_context/switch_active_organization` (target `organization_id` in body, server-validated per §3, never trusted); `get_active_context` = `GET /identity/active_context` (principal-scoped context singleton); `list_my_organizations` = `GET /identity/organizations` scoped **server-side to the principal's memberships** (not a client filter — `Doc-4A §9.7`); `upsert_buyer_profile` / `update_workflow_settings` = `PATCH` on the **active-org singleton** (`/identity/buyer_profiles`, `/identity/organization_workflow_settings`). Surfaced, not silently fixed.
- **Dual-audience reads (33, 35):** the **internal-service (M3/M6) consumption** of `get_buyer_profile` and `get_workflow_settings` is **out-of-wire** (§7, structure R1) — only the **owning-org** wire face appears here, so the `int-svc` leg is **not** a wire actor. Row 17 (`list_permissions`) is genuinely dual-actor on the wire (`Doc-4C §C7` — User / internal-service, no split leg) and stays `User / int-svc`.
- The full §5.7 template instantiation (request/response binding, error-status set, idempotency/concurrency, audit) for each endpoint is authored in **§4 (user/org), §5 (membership/role/delegation), §6 (context/profile/settings)** — not here.
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7`, §7.3; Doc-4C PassB Appendix A.

---

## §3 — Cross-Cutting Authorization & Context Wire Model *(mechanism only — owns no endpoint)*

> §3 realizes the **mechanism** every §4–§6 endpoint depends on. It binds `Doc-5A §7.1–§7.6` (the identity/context/authorization wire-carriage standard) **by pointer** and states the M1-specific application. It **instantiates no endpoint** — the §C8 context endpoints are realized in §6.

### 3.1 Authentication Carriage (§7.1)

- The authenticated principal is carried in the **`Authorization`** header (Bearer scheme), conveying **authentication only** — never authorization (`Doc-5A §7.1`; `Doc-4A §5.1`). Credential format, issuance, validation, session, and login/2FA-challenge mechanics are **out of scope** (DC-4 — Supabase Auth infrastructure; `Doc-5A §7.1`). A contract assumes an already-authenticated principal.
- **Binds:** `Doc-5A §7.1`; `Doc-4A §5.1`; Doc-4C §C1 (auth boundary, DC-4).

### 3.2 Actor-Type Determination (§7.2)

- M1's actor types — **User** (primary), **Admin** (`staff_*`, governance subset), **System** (out-of-wire timers) — are **determined server-side** from the authenticated principal (`Doc-5A §7.2`; `Doc-4A §5.2`). A request **MUST NOT** carry a field/header asserting its actor type (forbidden input, §4.4 / `Doc-4A §9.7`). Admin vs User is distinguished by the server from the platform-role basis (`Master Architecture §13.5`; `Doc-2 §7` slug catalog), never by the wire.
- **Binds:** `Doc-5A §7.2`; `Doc-4A §5.2`; Doc-4C §C12.1.

### 3.3 Active-Organization Context (§7.3) — R2

- A User-actor tenant business operation executes within a **server-validated active organization context** carried in the **`Iv-Active-Organization`** header (the org `UUIDv7`) — a **context selector, not a trusted assertion**: the server **MUST** validate that the principal holds an **active membership** in the named organization **before** any business processing (CONTEXT category, §3.6; `Doc-5A §7.3`; `Doc-4A §5.3`). A client-supplied organization identifier is **never** trusted.
- The **active organization is owned by the Identity context state model** (`Doc-4C §C8`); the `Iv-Active-Organization` header **carries selected context only and never establishes authority independently** — the server resolves it against the §C8-owned state. No "act as organization X" payload/path/query field exists outside this mechanism (`Doc-4A §9.7`; `Doc-5A §7.3`).
- **Absence / Admin:** an org-scoped operation with absent/unvalidated context is a CONTEXT failure (§3.6); **Admin** governance contracts carry **no** active-org context (`Doc-5A §7.3`; `Doc-4A §5.6`), scope deriving solely from `staff_*` + declared admin scope (DC-3). Every record created is owned by the **active organization**, never the user personally (`Master Architecture` Invariant 5).
- **Binds:** `Doc-5A §7.3`; `Doc-4A §5.3/§5.6/§9.7`; `Master Architecture §6.1`, Invariant 5; Doc-4C §C8.

### 3.4 Delegation Context (§7.4) — R5

- Delegation is **resolved server-side, never asserted on the wire.** A request carries the principal (§3.1), active-org context (§3.3), and the target resource (path); from these the server resolves any applicable Delegation Grant via the **§6B five-condition delegated-access check** (`Doc-5A §7.4`; `Doc-4A §6B.2`). **No delegation header or delegation request field exists** (R5 — none added). A grant id, `permission_set`, or "acting under grant X" assertion is a **forbidden input** (`Doc-4A §9.7`).
- The five-condition check and four-attribution rule are computed inside **`identity.check_permission.v1`**, which is the authorization-resolution engine — **out-of-wire** (§7, R1). Attribution is server-populated (`Doc-4A §6B.3`); Doc-5C carries no attribution input.
- **Binds:** `Doc-5A §7.4`; `Doc-4A §6B.1/§6B.2/§6B.3`; Doc-4C §C9 (grant lifecycle, realized §5) / §C3 (check_permission, out-of-wire §7).

### 3.5 Authorization Realization (§7.5)

- Authorization is **computed server-side** as the three-layer check — active Membership **+** Permission Slug **+** Resource Scope, **OR** an active Delegation Grant — from the §3.1–§3.4 context (`Doc-5A §7.5`; `Doc-4A §6.1`; `Master Architecture §13.2`). The wire carries **no authorization vocabulary**: roles, permission slugs, membership, grants, scopes are **never** request inputs (`Doc-4A §6.2` slugs-only; §9.7). This resolution is M1's authoritative responsibility (Doc-4C §C3 authoritative-source rule) and is performed in the out-of-wire `check_permission` / `get_membership` reads (§7) — **no consuming module re-derives it** (no shadow authorization).
- Authorization outcomes surface **only** as the §6 error classes — `AUTHORIZATION` (403) where existence is the caller's to know, otherwise the `NOT_FOUND` (404) **collapse** under non-disclosure (`Doc-5A §6.3`; `Doc-4A §12.4/§7`). A response never echoes the caller's slugs, grants, or authorization decision beyond what §5.6 representation permits.
- **Binds:** `Doc-5A §7.5`, §6.2/§6.3; `Doc-4A §6.1/§6.2/§9.7`; Doc-4C §C3 (authoritative-source rule).

### 3.6 Context Validation Position (§7.6)

- Carried context is validated in the fixed **CONTEXT category** of the universal validation order (`Doc-5A §7.6`; `Doc-4A §11.2`, position 2): actor type permitted, active-org context valid, admin scope satisfied — established **before** AUTHZ / SCOPE / DELEGATION (positions 3–5) and any semantic processing. Doc-5C maps the resulting failure to its §6 status and **MUST NOT** reorder, merge, or short-circuit the categories — the order is a disclosure control owned by `Doc-4A §11.2`.
- **Binds:** `Doc-5A §7.6`; `Doc-4A §11.2`.

---

*End of Doc-5C Content v1.0, Pass 1 (§0–§3 + inventory). Document control, scope/surface-partition, the 35-entry caller-facing inventory, and the §3 cross-cutting authorization/context wire model (mechanism only) — no §5.7 template instantiation, no out-of-wire realization (§7), no schemas, no contract bodies; one context-surface addressing realization flagged for review; nothing coined. §4 (user/org), §5 (membership/role/delegation), §6 (context/profile/settings), §7 (out-of-wire) and §8 + Appendix A follow in Pass-2, conforming to `Doc-5C_Structure_v1.0_FROZEN.md`.*
