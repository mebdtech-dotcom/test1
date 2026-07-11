// App-layer composition for M7 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/billing/**`) delegate here. Both reads are AUTHENTICATED
// Platform-Public catalog reads (Doc-5I §3.6) — session→401 gate, no org/tenant context.

export { handleGetPlan, type GetPlanHandlerDeps } from "./get-plan.route-handler";
export {
  handleListPlans,
  type ListPlansWireInput,
  type ListPlansHandlerDeps,
} from "./list-plans.route-handler";

// BC-BILL-1 Admin plan-catalog writes (W3-BILL-2) — staff-gated audited POST compositions.
export {
  handleCreatePlan,
  handleActivatePlan,
  handleUpdatePlan,
  handleRetirePlan,
  type CatalogWriteHandlerDeps,
} from "./plan-catalog-write.route-handler";
