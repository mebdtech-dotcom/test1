// M0 infrastructure / events barrel (PRIVATE — not a cross-module surface). The transactional-outbox
// dispatcher/drainer over `core.outbox_events`. Cross-module callers reach this only through the M0
// public contract surface (`@/modules/core/contracts`), never by importing infrastructure
// (REPOSITORY_STRUCTURE §3/§7).

export { archiveDispatchedEvents, dispatchOutboxEvents, drainOutbox } from "./drain-outbox.service";
export type { DrainOutboxOptions, DrainOutboxResult } from "./drain-outbox.service";
