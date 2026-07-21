// M0 infrastructure barrel (PRIVATE — not a cross-module surface). Adapters that invoke the
// `core` schema directly. Cross-module callers reach these only through the module composition
// root (core.module.ts) / contracts, never by importing infrastructure (REPOSITORY_STRUCTURE).

export { allocateHumanReference } from "./data/human-reference.service";
export { appendAuditRecord } from "./data/audit-record.service";
export { configValueQuery } from "./data/system-configuration.service";
export { featureFlagEvaluate } from "./data/feature-flag.service";
export {
  archiveDispatchedEvents,
  dispatchOutboxEvents,
  drainOutbox,
} from "./events/drain-outbox.service";
export { writeOutboxEvent } from "./events/write-outbox-event.service";
export type { DrainOutboxOptions, DrainOutboxResult } from "./events/drain-outbox.service";
