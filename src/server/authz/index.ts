// App-layer wiring ("authz") — authorization seam (REPOSITORY_STRUCTURE §5). Authorization is computed
// SERVER-SIDE as the three-layer check (active Membership + Permission Slug + Resource Scope, OR an active
// Delegation Grant) — and is M1's AUTHORITATIVE responsibility, performed inside `identity.check_permission`
// (Doc-4C §C3; Doc-5C §3.5/§7.5). That resolution is OUT-OF-WIRE and lands in Wave-2: no consuming module
// (including this app-layer seam) re-derives it — there is NO shadow authorization here.
//
// WP-1.4 SCOPE: this file is intentionally a thin seam ONLY. It coins NO permission logic, NO slug list, NO
// resolution. The active-org CONTEXT gate (the position-2 CONTEXT category — "is there a valid active org?";
// Doc-5C §3.6) is realized in `src/server/context` (the GUC guard). PERMISSION authorization (position 3+:
// "may this principal perform this action?") is a separate, later concern bound to the M1
// `check_permission` contract when it is exposed (Doc-5C §7.5 — out-of-wire). Until then, this module
// exposes nothing callable — wiring it now would either re-derive M1's authority (forbidden shadow authz)
// or coin a contract M1 has not frozen.

// Intentionally empty seam (no authorization logic). The active-org CONTEXT gate lives in
// `src/server/context`; PERMISSION authorization binds to M1 `check_permission` in Wave-2 (Doc-5C §7.5).
export {};
