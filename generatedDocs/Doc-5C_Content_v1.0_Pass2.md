# Doc-5C — Identity & Organization (M1 `identity`) API Realization — Content v1.0, Pass 2 (§4–§8 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5C — Identity & Organization (Module 1) — API Realization |
| Pass | 2 of 2 — Sections §4, §5, §6, §7, §8 and Appendix A (final content pass) |
| Status | ACTIVE — Content Pass 2 of 2; pending Independent Hard Review → then Doc-5C Freeze Audit |
| Structure | Conforms to `Doc-5C_Structure_v1.0_FROZEN.md` |
| Realizes | The 35 caller-facing M1 endpoints (§4–§6), the Doc-4C out-of-wire boundary (§7), the Doc-5A Appendix A attestation (§8 + App A) |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5C Content Pass-1 (§0–§3 + inventory; register resolved) |
| Contains | The §5.7 realization of each caller-facing surface (method/path per §5.2/§5.3, idempotency/concurrency, error-status set, audit, state-machine binding), the out-of-wire boundary, conformance attestation, carried items. No contract bodies, representations, error codes, POLICY keys, or audit actions restated |
| Audience | Architecture / API Governance Boards · Doc-5C authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4C fixed *what* each M1 contract declares (FROZEN); Doc-5A fixed *how* it becomes HTTP. §4–§6 realize the **wire face** per Doc-5A §5/§6/§7/§9 and re-decide nothing; representations, error codes, POLICY keys, slugs, audit actions, and state machines (Doc-4M) are bound **by pointer, never restated**. Transport-level choices are marked **[realization convention]**.

> **Method realization — supersedes the Pass-1 inventory placeholders.** Pass-1 §2 carried a uniform `POST`-named-command placeholder. Pass-2 realizes the **`Doc-5A §5.2` method mapping strictly** (`CHK-5A-031` [B]): create-command → `POST` to the **collection** (`201`); partial non-state field update → `PATCH` on the item; ADR-012 soft-delete → `DELETE` on the item; state-transition / domain command → `POST` to a **named command sub-resource**; read → `GET`. The Pass-1 §2 inventory is patched to match (method/path/status columns).

**Dependency realization path:** `Doc-5A §5/§6/§7/§9`, Appendix A; `Doc-4C §C4–§C12`; `Doc-4M` (state machines).

---

## §4 — User & Organization Surface Realization

### 4.1 Endpoint Realization (method/path per §5.2/§5.3)

| Doc-4C Contract-ID | §5.2 kind | Method · Path | Success |
|---|---|---|---|
| `identity.update_user_profile.v1` | update (partial) | `PATCH /identity/users/{id}` | `200` |
| `identity.update_user_2fa_settings.v1` | settings command | `POST /identity/users/{id}/update_user_2fa_settings` *(named command — §4.6 flag)* | `200` |
| `identity.deactivate_own_account.v1` | domain command (anonymize) | `POST /identity/users/{id}/deactivate_own_account` | `200` |
| `identity.set_user_account_status.v1` | Admin state command | `POST /identity/users/{id}/set_user_account_status` | `200` |
| `identity.create_organization.v1` | create | `POST /identity/organizations` *(+`Location`)* | `201` |
| `identity.update_organization_profile.v1` | update (partial) | `PATCH /identity/organizations/{id}` | `200` |
| `identity.transfer_ownership.v1` | domain command (§5.5) | `POST /identity/organizations/{id}/transfer_ownership` | `200` |
| `identity.soft_delete_organization.v1` | soft-delete (ADR-012) | `DELETE /identity/organizations/{id}` *(§4.6 flag)* | `200` |
| `identity.restore_organization.v1` | domain command (restore) | `POST /identity/organizations/{id}/restore_organization` | `200` |
| `identity.set_organization_status.v1` | Admin state command | `POST /identity/organizations/{id}/set_organization_status` | `200` |
| `identity.admin_recover_ownership.v1` | Admin recovery command | `POST /identity/organizations/{id}/admin_recover_ownership` | `200` |

- Inputs placed per §5.4: `{id}` = `UUIDv7` in path; Request-Contract fields in body; **no** prohibited input (actor/org-selection/authz/state/attribution never a field — `Doc-4A §9.7`). `201` create carries the standard HTTP `Location` header (§5.5 [realization convention]).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4C §C4/§C5`.

### 4.2 Organization State Machine (§5.1)

- The org lifecycle (`active ⇄ suspended`; `active → soft_deleted → active` restore) is realized as **legal transitions only** — each transition is its named command (`soft_delete_organization`, `restore_organization`, `set_organization_status`); **no transition is invented** (`Doc-4A §13`; **authoritative state authority `Doc-4M`**). An illegal transition is a `STATE` error → `409` (§4.4). Last Owner Protection / Ownership Succession (`Master Architecture §5.5`) are `BUSINESS` rules realized by their error class, bound by pointer (`Doc-4C §C5`).
- **Cross-module cascade (DC-1):** org soft-delete's cascade to Module 2 (vendor profile → suspended) and Module 3 (RFQs → archived) is **out-of-wire** (§7/R6) — no `identity` event, no integration realized until DC-1 resolves. The in-module membership cascade is part of the same transaction (server-side, not a wire surface).
- **Binds:** `Doc-4M` (org §5.1); `Doc-4A §13`; `Doc-4C §C5`; DC-1 (§7).

### 4.3 Idempotency & Concurrency (§9)

- Every §4 mutation declares `Idempotency: required` (`Doc-4C §C12.5`) → the **`Idempotency-Key` header is mandatory** (`Doc-5A §9`); replay within the POLICY-keyed window (intended `identity.*` dedup-window key, **`[DC-5]`** — by key, not finalized until registered) returns the cached original — same result, no duplicate audit record (`Doc-5A §9.7`; §14.3 joint rule; `Events-Produced: none` — no outbox leg, R6).
- Updates declaring `Concurrency: optimistic` carry **`If-Match`** with `updated_at` (`Doc-5A §9`; `Doc-4C §C4/§C5`); a stale token is `CONFLICT` → `409`.
- **Binds:** `Doc-5A §9`; `Doc-4C §C12.5`; DC-5.

### 4.4 Error-Status Set (§6)

- Error classes map to HTTP status by the **`Doc-5A §6.2`** mapping; codes are owned by the `Doc-4C §C4/§C5` error registers within the registered **`identity_`** namespace (`Doc-4A Appendix B.2`) — **bound by pointer, not restated**:

| `error_class` | HTTP | Example condition (codes owned by Doc-4C) |
|---|---|---|
| `VALIDATION` | `400` | malformed input (`identity_user_invalid_input`, …) |
| `AUTHORIZATION` | `403` | slug/scope failure where existence is the caller's to know (else `404` collapse, §4.5) |
| `NOT_FOUND` | `404` | target absent / non-disclosed (collapse target) |
| `STATE` | `409` | illegal lifecycle transition (`Doc-4M`) |
| `CONFLICT` | `409` | stale `If-Match` |
| `BUSINESS` | `422` | Last Owner Protection / succession rules (`identity_user_last_owner_block`, …) |

- Clients branch on `error_class`/`error_code`, never status alone (`Doc-5A §6`; `Doc-4A §12.3`). **Binds:** `Doc-5A §6.2`; `Doc-4C §C4/§C5`.

### 4.5 Authorization, Non-Disclosure & Audit (§3/§7)

- **User** ops carry the server-validated `Iv-Active-Organization` context (§3.3) where org-scoped; **self** ops (profile/2FA/deactivate) act on the platform-owned `users` record (no org context); **Admin** governance (`set_user_account_status`, `set_organization_status`, `admin_recover_ownership`, admin leg of `restore_organization`) carries **no** org context (`staff_*`, DC-3; §3.3). Authorization is server-side (§3.5) — no slug/scope is a wire input.
- Non-disclosure: protected-fact-gated failures collapse to an indistinguishable `404` (`Doc-5A §6.3`; `Doc-4A §12.4`).
- Every mutation is **audited** server-side via Doc-4B `core.append_audit_record.v1` (`Doc-4C §C12.3`, Doc-2 §9 by pointer); some actions carry **`[ESC-IDN-AUDIT]`** (bound to the nearest Doc-2 §9 domain action; nothing invented). `Events-Produced: none` (R6).
- **Binds:** `Doc-5A §6.3/§7`; `Doc-4C §C12.1/§C12.3`; Doc-2 §7/§9.

---

## §5 — Membership, Role & Delegation Surface Realization

### 5.1 Endpoint Realization (method/path per §5.2/§5.3)

| Doc-4C Contract-ID | §5.2 kind | Method · Path | Success |
|---|---|---|---|
| `identity.invite_member.v1` | create (invitation) | `POST /identity/memberships` *(+`Location`)* | `201` |
| `identity.accept_invitation.v1` | state command | `POST /identity/memberships/{id}/accept_invitation` | `200` |
| `identity.set_membership_status.v1` | state command | `POST /identity/memberships/{id}/set_membership_status` | `200` |
| `identity.remove_member.v1` | state command (→ removed) | `POST /identity/memberships/{id}/remove_member` | `200` |
| `identity.revoke_invitation.v1` | state command | `POST /identity/memberships/{id}/revoke_invitation` | `200` |
| `identity.list_permissions.v1` | read | `GET /identity/permissions` | `200` |
| `identity.list_roles.v1` | read | `GET /identity/roles` | `200` |
| `identity.create_role.v1` | create | `POST /identity/roles` *(+`Location`)* | `201` |
| `identity.update_role.v1` | update (partial) | `PATCH /identity/roles/{id}` | `200` |
| `identity.set_role_permissions.v1` | compose command | `POST /identity/roles/{id}/set_role_permissions` | `200` |
| `identity.delete_role.v1` | soft-delete (ADR-012) | `DELETE /identity/roles/{id}` | `200` |
| `identity.create_delegation_grant.v1` | create | `POST /identity/delegation_grants` *(+`Location`)* | `201` |
| `identity.suspend_delegation_grant.v1` | state command | `POST /identity/delegation_grants/{id}/suspend_delegation_grant` | `200` |
| `identity.reinstate_delegation_grant.v1` | state command | `POST /identity/delegation_grants/{id}/reinstate_delegation_grant` *(`[ESC-IDN-DELEG-EXPIRY]` — not finalized)* | `200` |
| `identity.revoke_delegation_grant.v1` | state command | `POST /identity/delegation_grants/{id}/revoke_delegation_grant` | `200` |
| `identity.get_delegation_grant.v1` | read (party) | `GET /identity/delegation_grants/{id}` | `200` |
| `identity.list_delegation_grants.v1` | read (party) | `GET /identity/delegation_grants` | `200` |

- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4C §C6/§C7/§C9`.

### 5.2 State Machines & Role Semantics

- Membership (`invited → pending → active`; `active ⇄ suspended`; `→ removed` terminal) and delegation (`draft → active`; `active ⇄ suspended`; `→ revoked`/`→ expired` terminal) lifecycles are realized as **legal transitions only**, each its named command — **no transition invented** (`Doc-4M` authoritative; `Doc-4A §13`). Illegal transition → `STATE` `409`.
- Roles are **bundles**; authorization uses **slugs only** (`Doc-4A §6.2`). `list_permissions` reads the **platform-owned catalog** (read-only; the slug catalog is owned by Doc-2 §7, never extended — `Doc-4A §6.4`). `set_role_permissions` composes the N:N bundle (a workflow setting may add but never remove a required slug — enforced upstream).
- **Binds:** `Doc-4M` (membership §5.2 / delegation §5.10); `Doc-4A §6.2/§6.4/§13`; `Doc-4C §C6/§C7/§C9`.

### 5.3 Delegation Realization (R5)

- Delegation is realized as **grant-management commands + the dual-party reads only**. The **§6B delegated-access check** (five-condition resolution, four-attribution) is performed **server-side inside `check_permission` (out-of-wire, §7)** — no grant id, `permission_set`, scope, or attribution is ever a wire input (§3.4; `Doc-4A §9.7`). The dual-party reads (`get_delegation_grant`, `list_delegation_grants`) are visible to the grant's two party orgs only (scope; `404` collapse otherwise).
- **`reinstate_delegation_grant` carries `[ESC-IDN-DELEG-EXPIRY]`** — Doc-2 §5.10 is silent on the lapsed-validity-window reinstatement disposition; the error boundary is **not finalized** until resolved (Doc-2 §5.10 channel; Doc-4C PassB entry condition 4). No edge invented.
- **Binds:** `Doc-5A §7`; `Doc-4A §6B`; `Doc-4C §C9`; `[ESC-IDN-DELEG-EXPIRY]` (§8).

### 5.4 Idempotency, Concurrency, Error & Audit

- Same conventions as §4.3–§4.5: mutations `Idempotency: required` (`[DC-5]` window) + `If-Match` (`updated_at`) where optimistic; error classes per `Doc-5A §6.2` (adding `STATE`→`409` for transitions), codes owned by `Doc-4C §C6/§C7/§C9` registers (`identity_` namespace); audited via `core.append_audit_record.v1`; `Events-Produced: none`. Authorization slugs (e.g. `can_manage_delegations`, `can_manage_users`) owned by Doc-2 §7; the buyer-profile/some-admin slugs carry **`[ESC-IDN-SLUG]`** (interim authority; escalate, never invent).
- **Binds:** `Doc-5A §6/§9`; `Doc-4C §C6/§C7/§C9/§C12`; Doc-2 §7; DC-5, `[ESC-IDN-SLUG]`.

---

## §6 — Context, Buyer-Profile & Workflow-Settings Surface Realization

### 6.1 Endpoint Realization (method/path per §5.2/§5.3)

| Doc-4C Contract-ID | §5.2 kind | Method · Path | Success |
|---|---|---|---|
| `identity.switch_active_organization.v1` | context command | `POST /identity/active_context/switch_active_organization` *(§6.2 flag)* | `200` |
| `identity.get_active_context.v1` | read (context singleton) | `GET /identity/active_context` | `200` |
| `identity.list_my_organizations.v1` | read (principal-scoped) | `GET /identity/organizations` *(server-scoped to the principal's memberships)* | `200` |
| `identity.upsert_buyer_profile.v1` | upsert (active-org singleton) | `PATCH /identity/buyer_profiles` *(§6.2 flag)* | `200` |
| `identity.get_buyer_profile.v1` | read (owning-org) | `GET /identity/buyer_profiles` | `200` |
| `identity.update_workflow_settings.v1` | update (active-org singleton) | `PATCH /identity/organization_workflow_settings` | `200` |
| `identity.get_workflow_settings.v1` | read (owning-org) | `GET /identity/organization_workflow_settings` | `200` |

### 6.2 Context Surface & Singleton Addressing [realization convention — flagged for Hard Review]

- The §C8 context endpoints and the org-singleton profile/settings do not address a single child-entity row by `{id}`. Realized as:
  - `switch_active_organization` → a **context command** `POST /identity/active_context/switch_active_organization`; the target `organization_id` is in the **body**, **server-validated** against the principal's active memberships (§3.3 — never trusted). It sets the §C8-owned context state (§3.3); the mechanism is §3.
  - `get_active_context` → `GET /identity/active_context` (a **principal-scoped context singleton**; no `{id}`).
  - `list_my_organizations` → `GET /identity/organizations`, **server-scoped to the principal's memberships** (not a client filter — `Doc-4A §9.7`); this is the principal-scoped read of the same `organizations` collection whose `POST` is `create_organization`.
  - `upsert_buyer_profile` / `update_workflow_settings` → `PATCH /identity/buyer_profiles` and `/identity/organization_workflow_settings` as **active-org singletons** (one per org; the active-org context resolves the target — §3.3); `upsert` creates on first call.
- *Alternative the board may prefer: a dedicated `/identity/active_context` resource with a `PATCH` for the switch, and `{id}`-addressed buyer-profile/workflow rows.* Surfaced, not silently fixed.
- **Binds:** `Doc-5A §5.3/§7`; `Doc-4C §C8/§C10/§C11`; §3.3.

### 6.3 ORG-Settings Boundary

- `update_workflow_settings` writes the **ORG** leg of FIXED/POLICY/ORG (`Doc-3 §12.3`): values are **POLICY-bounded**, the bounds resolved via Doc-4B `core.config_value_query.v1` (**out-of-wire** resolution, §7) — never a literal on the wire. An ORG setting **may add required approvals but never remove a required slug** (`Doc-4A §6.2`) — enforced upstream (`BUSINESS` → `422` if violated). Firewall: identity writes **no governance signal** (`Doc-4C §C12.6`).
- **Dual-audience reads** (`get_buyer_profile`, `get_workflow_settings`) realize the **owning-org** wire face only; the internal-service (M3/M6) consumption is **out-of-wire** (§7). Cross-tenant reads collapse to `404` (§6.3 non-disclosure).
- **Binds:** `Doc-3 §12.3`; `Doc-4A §6.2`; `Doc-4C §C10/§C11/§C12.6`; Doc-4B `config_value_query` (§7).

### 6.4 Idempotency, Concurrency, Error & Audit

- Same conventions as §4.3–§4.5: mutations `Idempotency: required` (`[DC-5]`) + `If-Match` (`updated_at`); error classes per `Doc-5A §6.2`; codes owned by `Doc-4C §C8/§C10/§C11` registers (`identity_`); audited; `Events-Produced: none`. Buyer-profile authority carries **`[ESC-IDN-SLUG]`** / **`[ESC-IDN-AUDIT]`**.
- **Binds:** `Doc-5A §6/§9`; `Doc-4C §C8/§C10/§C11/§C12`.

---

## §7 — Out-of-Wire Boundary (§C3 authorization root · System timers · dual-audience internal leg · DC-1 cascade)

### 7.1 The §C3 Authorization-Resolution Root (no wire)

- `identity.get_user.v1`, `identity.get_organization.v1`, `identity.get_membership.v1`, and **`identity.check_permission.v1`** (all `Audience: internal-service`, 21.3) are the **in-process authorization-resolution services** every other module consumes (`Doc-4C §C3` authoritative-source rule). They have **no caller wire** — no path, method, or status is realized. `check_permission` is the engine that computes the three-layer + §6B delegated-access check (§3.4/§3.5); other modules consume it **in-process**, never as an M1 HTTP endpoint, and **never re-derive** authorization (no shadow authorization). *This is the highest-stakes application of R1: the platform authorization root is deliberately out-of-wire.*
- **Binds:** `Doc-4C §C3`; `Doc-5A §1.3`; structure R1.

### 7.2 System Phase-2 Timers (no wire)

- `identity.activate_membership.v1`, `identity.expire_invitation.v1`, `identity.expire_delegation_grant.v1` (System, 21.5, `Response: none`) are scheduler-triggered background workers — **no caller wire**. Timer/sweep windows are POLICY-keyed (`[DC-5]`). `expire_delegation_grant` acts on the literal `active → expired` edge only; the `suspended`-at-expiry case carries **`[ESC-IDN-DELEG-EXPIRY]`** (not resolved here).
- **Binds:** `Doc-4C §C6/§C9`; `Doc-5A §10.5/§11`; DC-5, `[ESC-IDN-DELEG-EXPIRY]`.

### 7.3 Dual-Audience Reads' Internal-Service Leg (no wire)

- The internal-service (M3/M6) consumption of `get_buyer_profile` (Module 3 matching) and `get_workflow_settings` (Module 3 approval gate, Module 6 notifications) is **in-process, out-of-wire**; only the owning-org wire face is realized (§6). Consumers read via the in-process service, never the table (One Owner).
- **Binds:** `Doc-4C §C10/§C11`; structure R1.

### 7.4 DC-1 Cross-Module Cascade / Teardown (no wire, blocked)

- The org soft-delete cascade (→ Module 2 vendor profile suspend, Module 3 RFQ archive) and delegation revocation/expiry teardown (→ Module 3 `rfq_invitation_grantees`/visibility rows) cross module boundaries with **no `identity` event** (`Doc-2 §8`; R6). These integrations are **out-of-wire and blocked at DC-1** — no event coined, no integration wired, until the Board selects service-call vs Doc-2 §8 event (`Doc-4C` Appendix C DC-1; `Doc-4A §4.2/§4.4`).
- **Binds:** `Doc-4C` Appendix C (DC-1); `Doc-2 §8`; `Doc-5A §11`.

### 7.5 Flag-and-Halt Clause

- Proposing an **HTTP wire** for any §7 mechanism — the authorization root, the System timers, the dual-audience internal leg, or the DC-1 cascade — is an **architecture-affecting change** and triggers **flag-and-halt** + human/Board approval (`Doc-5_Program_Governance_Note_v1.0 §7`; CLAUDE.md Red-Flag list). Doc-5C does not, and may not, grant them a wire.
- **Binds:** Gov-Note §7; structure R1 / Fences.

---

## §8 — Conformance & Carried Items

### 8.1 Conformance Obligation

- Before freeze, Doc-5C **MUST** pass the Doc-5A **Appendix A** checklist for every caller-facing endpoint (§4–§6). Freeze eligibility and the `[B]`/`[M]`/`[m]` severity discipline are governed by **`Doc-5A Appendix A §A.0`** / **Gov-Note §6** — not restated here. The attestation is **Appendix A**.

### 8.2 Carried Items (by pointer; resolved only via Doc-4C channels)

| ID | Status | Effect on Doc-5C |
|---|---|---|
| **DC-1** | OPEN (out-of-wire) | Cross-module cascade/teardown unrealized (§7.4); blocks only the integration legs, not the M1 wire surface |
| **DC-2** | OPEN | No `verification_record` surface realized; Trust (Doc-4G) owns it |
| **DC-3** | CARRY FORWARD | Admin governance binds `staff_*`; least-privilege slug = future Doc-2 §7 patch |
| **DC-4** | OPEN | Auth mechanism (login/2FA-challenge/session) is infrastructure; wire carries `Authorization` bearer only (§3.1) |
| **DC-5** | TRACKED | `[DC-5]`-keyed idempotency/timer windows referenced by intended key name; **contracts not finalized until Doc-3 §12.2 registration** |
| `[ESC-IDN-SLUG]` | OPEN | Buyer-profile / some admin slugs — interim authority; escalate, never invent |
| `[ESC-IDN-AUDIT]` | OPEN | Some audit actions bound to the nearest Doc-2 §9 domain action by pointer |
| `[ESC-IDN-DELEG-EXPIRY]` | TRACKED | `reinstate_delegation_grant` (§5) + `expire_delegation_grant` (§7) error boundary **not finalized** until Doc-2 §5.10 resolves |

### 8.3 Doc-5C Coins Nothing

- Doc-5C realizes the wire face of frozen Doc-4C contracts and **coins no** endpoint identity, HTTP status, header token, error class, `error_code`, permission slug, or POLICY key (`CHK-5A-121/154`; `Doc-4A §6.4`/§20.1). Genuine realization ambiguities (the §6.2 context/singleton addressing) are **surfaced**, not silently decided; carried `[DC-*]`/`[ESC-*]` are **escalated**, never invented (`CHK-5A-123`).
- **Binds:** `Doc-5A Appendix A`; `Doc-4A §6.4/§20.1`.

---

## Appendix A — Doc-5C Conformance Attestation

Per-band attestation of the realized M1 caller-facing surface (§4–§6) against the Doc-5A **Appendix A** checklist. **PASS** = satisfied for every endpoint to which the check applies; **N/A** = precondition absent (reason cited). No `[B]`/`[M]` unresolved; no `[m]` deviation. Two items remain **tracked, non-gate** (DC-5 key registration; `[ESC-IDN-DELEG-EXPIRY]` reinstate boundary) — they bound *contract finalization*, not structural conformance.

| ID | Sev | Result | Evidence / scope |
|---|---|---|---|
| CHK-5A-010 | B | PASS | JSON/UTF-8 envelope — §4–§6 (`Doc-5A §3`) |
| CHK-5A-011 | M | PASS | Field names `snake_case`, from Doc-4C by pointer |
| CHK-5A-012 | B | N/A | No money field on the M1 surface |
| CHK-5A-013 | M | PASS | `updated_at`/timestamps in §3 canonical form |
| CHK-5A-014 | B | PASS | `{id}`/identifiers = UUIDv7; `human_ref` not a mutation-path id |
| CHK-5A-015 | B | PASS | Enums from Doc-2; none invented |
| CHK-5A-020 | M | PASS | Single §4 envelope |
| CHK-5A-021 | B | PASS | Only registered standard headers (`Authorization`, `Iv-Active-Organization`, `Idempotency-Key`, `If-Match`) |
| CHK-5A-022 | M | PASS | `Iv-` used only for registered tokens |
| CHK-5A-023 | B | PASS | No identity/role/permission/tenant-assertion header — authorization server-side (§3) |
| CHK-5A-024 | B | PASS | `Authorization` present; `Iv-Active-Organization` on org-scoped ops, absent on self/Admin (§3.3/§4.5) |
| CHK-5A-025 | M | PASS | `Idempotency-Key`/`If-Match` present exactly per §4.3/§5.4/§6.4 |
| CHK-5A-030 | B | PASS | Every endpoint instantiates the §5.7 template — §4.1/§5.1/§6.1 |
| CHK-5A-031 | B | PASS | Method per §5.2 — create→POST/201, update→PATCH, soft-delete→DELETE, state→POST named, read→GET |
| CHK-5A-032 | B | PASS | Paths follow §5.3 grammar |
| CHK-5A-033 | B | PASS | State changes are named commands / typed methods, never arbitrary field replacement |
| CHK-5A-034 | B | PASS | Input placement per §5.4; no prohibited field (org-selection/authz/attribution never input) |
| CHK-5A-035 | M | PASS | Success `200`/`201` per §5.5 |
| CHK-5A-036 | m | PASS | No abstract `get`/`update` verb in a path (named commands are compound operations) |
| CHK-5A-040 | B | PASS | class→status per §6.2 — §4.4/§5.4/§6.4 |
| CHK-5A-041 | B | PASS | §6 canonical error envelope |
| CHK-5A-042 | B | PASS | Top-level `reference_id` on every body-bearing response (`Doc-4A §22.1 C-05`) |
| CHK-5A-043 | B | PASS | Codes within registered `identity_` namespace |
| CHK-5A-044 | M | PASS | `retryable` per §6 class (no rate/quota on M1 mutations) |
| CHK-5A-045 | M | N/A | No rate/quota surface declared on M1 |
| CHK-5A-050/051/052 | B | PASS | No-access vs not-found indistinguishable (status/body/timing) — §4.5/§5.3/§6.3 |
| CHK-5A-053 | B | PASS | Non-disclosed rows undetectable (cross-tenant `404` collapse) |
| CHK-5A-060 | B | PASS | `Authorization` = authentication only (§3.1) |
| CHK-5A-061 | B | PASS | **`Iv-Active-Organization` server-validated, never client-trusted** (§3.3) — the defining M1 check |
| CHK-5A-062 | B | PASS | No authz assertion from client input (§3.5) |
| CHK-5A-063 | M | PASS | Actor-type + delegation resolved server-side (§3.2/§3.4) |
| CHK-5A-070 | B | PASS / N/A | Cursor pagination on list reads (`list_roles`, `list_delegation_grants`, …); N/A singletons |
| CHK-5A-071 | M | PASS | Page bound via POLICY key (`[DC-5]`) on paginated lists |
| CHK-5A-072 | M | PASS | Filter/sort allowlist per Doc-4C |
| CHK-5A-073 | B | PASS | Counts/items exclude non-disclosed/soft-deleted identically |
| CHK-5A-080 | B | PASS | `Idempotency-Key` on `required` mutations (§4.3/§5.4/§6.4) |
| CHK-5A-081 | B | PASS | Replay → same result, no duplicate audit record (no outbox leg — R6) |
| CHK-5A-082 | M | PASS | `If-Match` (`updated_at`) on optimistic commands |
| CHK-5A-083 | m | PASS | Retry aligned to §6 `retryable` |
| CHK-5A-090…095 | B/M | N/A | All M1 caller contracts `Execution: sync` (no async) |
| CHK-5A-100/102 | B/M | N/A | No event-driven completion on the M1 surface |
| CHK-5A-101 | B | PASS | No external webhook/push surface (R6) |
| CHK-5A-103 | m | PASS | Event catalog not restated (`Events-Produced: none`) |
| CHK-5A-110 | B | PASS | No URL/query versioning; surface version via `Iv-Api-Version` (conditional) |
| CHK-5A-111/113 | M | N/A | Initial `v1`; no breaking change / deprecation |
| CHK-5A-112 | B | PASS | Contract identity stable; no `…V2` resource |
| CHK-5A-114 | B | PASS | No domain change expressed as a version bump |
| CHK-5A-120 | B | PASS | No upstream content restated; bound by pointer |
| CHK-5A-121 | B | PASS | Nothing coined — §8.3 |
| CHK-5A-122 | m | PASS | Transport choices marked `[realization convention]` (§4.1/§6.2) |
| CHK-5A-123 | B | PASS | Context addressing surfaced; `[DC-*]`/`[ESC-*]` escalated, not invented |
| CHK-5A-124 | B | PASS | No invented webhook/push |
| CHK-5A-131 | B | PASS | `Owner-Module` = Module 1 on every endpoint |
| CHK-5A-132 | B | PASS | Each traces to a frozen Doc-4C contract (PassB Appendix A) |
| CHK-5A-133 | B | PASS | No undefined aggregate referenced (9 owned entities) |
| CHK-5A-134 | B | PASS | Contract identity stable under §12 |
| CHK-5A-141 | B | PASS | Resources only under the `identity` namespace |
| CHK-5A-142 | B | PASS | No foreign-aggregate read/mutate on the wire; cross-module = out-of-wire (§7) |
| CHK-5A-143 | B | PASS | Cross-module via approved channel (in-process service / blocked DC-1), no foreign-namespace endpoint |
| CHK-5A-144 | B | PASS | No ownership contradiction; defers to Doc-4A Appendix A |
| CHK-5A-151 | B | PASS | `identity` route prefix in App B.1 (`Doc-2 §0.3`) |
| CHK-5A-152 | B | PASS | `identity_` code prefix in `Doc-4A Appendix B.2` |
| CHK-5A-153 | B | PASS | Standard-header tokens in App B.4, agree with §4.4 |
| CHK-5A-154 | B | PASS | No self-assigned namespace/registry token |

**Attestation result:** all applicable `[B]`/`[M]` checks **PASS**; `[m]` PASS, no deviation. No unresolved checklist item remains; freeze eligibility is determined by the Doc-5C Freeze Readiness Audit. DC-5 key registration + `[ESC-IDN-DELEG-EXPIRY]` are tracked contract-finalization dependencies, not structural-conformance gates.

---

*End of Doc-5C Content v1.0, Pass 2 (§4–§8 + Appendix A) — the final content pass. The 35 caller-facing M1 endpoints realized per the §5.2 method mapping (creates `POST`/`201`, updates `PATCH`, soft-deletes `DELETE`, state commands `POST` named, reads `GET`); state machines bound to Doc-4M; idempotency/concurrency/error/audit by pointer; the §C3 authorization root, System timers, dual-audience internal leg, and DC-1 cascade fenced out-of-wire (§7); Appendix A all applicable `[B]`/`[M]` PASS; two context/singleton addressing realizations flagged; carried `[DC-*]`/`[ESC-*]` escalated; nothing coined. Doc-5C content (§0–§8 + Appendix A) is complete; next is the Doc-5C Freeze Readiness Audit, conforming to `Doc-5C_Structure_v1.0_FROZEN.md`.*
