// App-layer wiring ("context") — server-validated ACTIVE-ORG context (REPOSITORY_STRUCTURE §5).
// Authorization is app-layer; RLS is the backstop. The active org is SERVER-RESOLVED from a confirmed
// active membership — the client-supplied org id is NEVER trusted (Invariant #5; Doc-5C §3.3 / CHK-5A-061;
// Doc-6C §2.1). `withActiveOrg` is the request-transaction wrapper that pins the RLS GUCs per request.

export { resolveActiveOrg } from "./active-org";
export type { ActiveOrgContext, ResolveActiveOrgResult } from "./active-org";
export { withActiveOrg, withActiveOrgContext } from "./with-active-org";
export type { ActiveOrgTx } from "./with-active-org";
