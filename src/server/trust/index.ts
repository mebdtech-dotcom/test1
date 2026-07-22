// App-layer composition for M5 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/trust/**`) delegate here; the composition wires Supabase Auth ↔
// active-org context ↔ the app-layer authz seam ↔ M5 contracts. This is the ONLY place M5's write
// crosses to M1 (authz via `src/server/authz`); the M5 module itself imports nothing of M1/M2.

export {
  handleRequestVerification,
  type RequestVerificationHandlerDeps,
} from "./request-verification.route-handler";
