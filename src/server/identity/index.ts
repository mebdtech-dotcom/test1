// App-layer composition for M1 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/identity/**`) delegate here; the composition wires Supabase Auth ↔
// active-org context ↔ M1 contracts. Authentication/active-org context are app-layer; RLS is the backstop.

export {
  handleGetBuyerProfile,
  loadActiveOrgBuyerProfile,
  type ActiveOrgBuyerProfileOutcome,
  type GetBuyerProfileHandlerDeps,
  type ResolveSession,
} from "./get-buyer-profile.route-handler";
