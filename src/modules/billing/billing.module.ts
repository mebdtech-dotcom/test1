// Composition root for module "billing" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE section 3). W3-BILL-1 realizes the two authenticated Platform-Public catalog
// reads `billing.get_plan.v1` / `billing.list_plans.v1` (Doc-4I §HB-1.4 / Doc-5I §4) over the
// Plans & Entitlements schema (Doc-6I §3.1). Other modules consume `billingQueries`, never the
// application/infrastructure layers directly.

import {
  activatePlan,
  bundlePlanEntitlement,
  createEntitlement,
  createPlan,
  getPlan,
  getSubscription,
  listPlans,
  purchaseSubscription,
  retirePlan,
  updateEntitlement,
  updatePlan,
} from "./contracts/services";

/** The M7 read surface realized so far (Platform-Public catalog reads + the org-self subscription read). */
export const billingQueries = {
  getPlan,
  listPlans,
  getSubscription,
};

/** The M7 write surface realized so far (W3-BILL-2 plan lifecycle + W3-BILL-3 entitlement/bundle — the
 *  complete BC-BILL-1 Admin catalog write surface). */
export const billingCommands = {
  createPlan,
  activatePlan,
  updatePlan,
  retirePlan,
  createEntitlement,
  updateEntitlement,
  bundlePlanEntitlement,
  purchaseSubscription,
};
