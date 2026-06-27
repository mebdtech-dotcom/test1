import type { InngestFunction } from "inngest";

// Inngest job functions registry — outbox consumers (REPOSITORY_STRUCTURE §7).
//
// EMPTY at Wave 0 (spine only): jobs consume the M0 transactional outbox
// (core.outbox_events), which is realized in Wave 2 (Doc-6B). Registering a consumer now
// would couple to a non-existent oracle table — coin nothing ahead of it. Each module's
// jobs are added here as their owning wave lands.
export const functions: InngestFunction.Any[] = [];
