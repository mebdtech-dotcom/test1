# ESC — `ESC-W1-CONTEXT-RESOLVE` v1.0

| Field | Value |
|---|---|
| **Type** | Recorded escalation (Raise ≠ Accept — CLAUDE.md §13). **Non-blocking** for Wave 1. |
| **Raised by** | Wave 1 execution, WP-1.4 [W1-CONTEXT-001] |
| **Date** | 2026-06-28 |
| **Severity** | MINOR (non-gating — boundary-legal as realized; a cleaner long-term home exists) |
| **Status** | **OPEN — app-edge realization in use; awaits an additive in-process contract.** |
| **Authority** | CLAUDE.md §11 (Flag-and-Halt on a genuine gap); REPOSITORY_STRUCTURE §5/§9; Doc-5C §C8 |

---

## 1. The situation

WP-1.4's active-org context guard (`src/server/context/active-org.ts`) resolves the active org by reading
M1 tables — `identity.users` (by `auth_user_id`) and the user's confirmed-active `identity.memberships` —
**directly via the shared Prisma client** (`@/shared/db`) at the `src/server` app-layer edge. It applies
only the **frozen** predicate "an active membership ⇒ that org may be active" (Doc-6C §2.1); it re-derives
no M1 business rule, uses **no cross-schema SQL**, and makes **no cross-module import** (it imports
`@/shared/db`, not `@/modules/identity/*`).

## 2. Why it is boundary-legal as realized

- `src/server` is the **app-layer composition edge**, and "**org context**" resolution is explicitly its
  mandate (REPOSITORY_STRUCTURE §5 — "app-layer wiring: auth, org context, authz, guards"). This is not a
  *different module* reaching into M1's tables; it is the app layer resolving the request's tenant context.
- `eslint-plugin-boundaries` does not (and should not) flag it — no module-internal import occurs.
- The org-anchor RLS is the actual enforcement (WP-1.7 `CHK-8-024`); the guard only *sets* the GUC from a
  server-validated membership (never from client input — `CHK-5A-061`).

## 3. The genuine gap

The cleaner long-term home is a **dedicated in-process M1 contract** (e.g. `identity.resolveActiveContext`)
that encapsulates *which* M1 tables/predicate resolve the active org, so the app edge asks M1 rather than
querying M1's tables itself. But **Doc-5C §C8 (`get_active_context`) defines only the WIRE face** (HTTP);
the in-process contract form is **not coined**. Coining it now would be inventing a contract without
authority (realize-never-redecide). So WP-1.4 does the resolution at the app edge and flags it.

## 4. Disposition (Wave 1) + requested action

- **Wave 1:** app-edge resolution via the shared Prisma client (as above) — boundary-legal, predicate
  frozen, fail-closed. Accepted, non-gating.
- **Requested (additive, future wave):** a Board/Architecture additive coining the **in-process M1
  active-context contract** (the out-of-wire sibling of Doc-5C §C8). On ratification, `src/server/context`
  delegates to that M1 contract instead of querying `identity.*` directly — moving the query's ownership
  back inside M1. No Wave-1 rework needed (the guard's call site stays; only its body changes).

---

*Raised under Raise ≠ Accept: recorded as non-gating; the realization is boundary-legal and the cleaner
ownership is requested as a future additive.*
