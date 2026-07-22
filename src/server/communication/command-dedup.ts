// App-layer §B.6 command-dedup composition helper for M6 (W3-COMM-1; REPOSITORY_STRUCTURE §5). The wire
// compositions wrap each BC-COMM-4 mutation with the M6 replay store (consumed ONLY via
// `@/modules/communication/contracts` — the store is M6-owned; this file holds no storage logic).
// Mirrors the ratified `src/server/identity/command-dedup.ts` house shape:
//
//   1. REQUIRE the `Idempotency-Key` header (Doc-5H §7.5: mandatory on every BC-COMM-4 mutation; Doc-5A
//      §9.2 header carriage). The thin route entry parses it (`parseIdempotencyKey`); the composition
//      maps an ABSENT/over-bound key (`null`) to the domain's SYNTAX `VALIDATION` 400.
//   2. LOOK UP the scope in the store BEFORE executing — a within-window hit is the Doc-5A §9.3 safe
//      replay: the STORED result, the SAME status, the SAME ORIGINAL `reference_id`, NO re-execution.
//   3. CLAIM the scope key (Doc-4A §14.3 in-flight protection) — BC-COMM-4 create/message legs have no
//      CAS guard, so the pre-execution claim is the single-execution guard; update/close ALSO claim
//      (uniform) — their CAS is a second guard, never a weaker one.
//   4. PERSIST a SUCCESSFUL execution's wire response (success-only; errors stay re-tryable — §9.6), on
//      the SAME transaction executor as the audited write (the §14.3 joint rule).

import { configValueQuery } from "@/modules/core/contracts";
import {
  claimCommandDedupRecord,
  COMMUNICATION_DEDUP_WINDOW_KEY,
  findCommandDedupRecord,
  persistCommandDedupRecord,
  releaseCommandDedupRecord,
  type CommandDedupScope,
  type StoredCommandResponse,
} from "@/modules/communication/contracts";
import type { WireResponse } from "@/shared/http";
import type { DbExecutor } from "@/shared/db";

/** The tri-state wire key: `string` active · `null` absent (400) · `undefined` off-wire (dedup inactive). */
export type WireIdempotencyKey = string | null | undefined;

/** Rehydrate a stored §B.6 record as the replayed wire response (Doc-5A §9.3 — stored body incl. the
 *  ORIGINAL `reference_id`, stored status, stored infra headers). */
export function storedToWire<T>(stored: StoredCommandResponse): WireResponse<T> {
  return {
    status: stored.status,
    body: stored.body as WireResponse<T>["body"],
    ...(stored.headers !== undefined ? { headers: stored.headers } : {}),
  };
}

/** Serialize a wire response for the §B.6 store (status + envelope + standard infra headers). */
export function wireToStored<T>(wire: WireResponse<T>): StoredCommandResponse {
  return {
    status: wire.status,
    body: wire.body,
    ...(wire.headers !== undefined ? { headers: wire.headers } : {}),
  };
}

/** Build the replay scope (the §7.5 poisoning guard — contract × actor × org context × key). */
export function dedupScope(
  contractId: string,
  actorUserId: string,
  organizationId: string | null,
  idempotencyKey: string,
): CommandDedupScope {
  return { contractId, actorUserId, organizationId, idempotencyKey };
}

/** §B.6 replay lookup, production-wired (M0 `configValueQuery` bound for the window). Returns the
 *  REPLAYED wire response, or `null` (execute fresh). Run on the composition's transaction executor. */
export async function findStoredReplay<T>(
  scope: CommandDedupScope,
  db: DbExecutor,
): Promise<WireResponse<T> | null> {
  const stored = await findCommandDedupRecord(
    scope,
    COMMUNICATION_DEDUP_WINDOW_KEY,
    { configValueQuery },
    db,
  );
  return stored === null ? null : storedToWire<T>(stored);
}

/** §B.6 pre-execution CLAIM, production-wired. `"claimed"` → execute + persist/release; `"lost"` →
 *  re-read via `findStoredReplay` and return the winner (this caller's business logic never begins). */
export async function claimStoredReplay(
  scope: CommandDedupScope,
  db: DbExecutor,
): Promise<"claimed" | "lost"> {
  return claimCommandDedupRecord(scope, COMMUNICATION_DEDUP_WINDOW_KEY, { configValueQuery }, db);
}

/** §B.6 persist, production-wired — store a SUCCESSFUL (2xx) wire response on the SAME tx as the write
 *  (the §14.3 joint rule). Non-2xx is NEVER cached (success-only). */
export async function persistWireReplay<T>(
  scope: CommandDedupScope,
  wire: WireResponse<T>,
  db: DbExecutor,
): Promise<void> {
  if (wire.status < 200 || wire.status >= 300) return;
  await persistCommandDedupRecord(scope, wireToStored(wire), db);
}

/** §B.6 claim release, production-wired — for an ERROR OUTCOME after a successful claim (the tx commits;
 *  the pending claim must not survive). A THROWN failure needs no release (transaction rollback). */
export async function releaseStoredClaim(scope: CommandDedupScope, db: DbExecutor): Promise<void> {
  await releaseCommandDedupRecord(scope, db);
}
