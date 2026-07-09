// Composition root for module "core" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE section 3). Binds the M0 infrastructure adapters to the public
// `CoreServices` contract surface (Doc-4B §A7 / §A10). Other modules consume `coreServices`,
// never the infrastructure directly.

import type { CoreServices } from "./contracts/services";
import {
  allocateHumanReference,
  appendAuditRecord,
  configValueQuery,
  drainOutbox,
  featureFlagEvaluate,
} from "./infrastructure";

export const coreServices: CoreServices = {
  allocateHumanReference,
  appendAuditRecord,
  drainOutbox: (input) => drainOutbox(input),
  configValueQuery,
  featureFlagEvaluate,
};
