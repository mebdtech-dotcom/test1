// M6 infrastructure (PRIVATE) — the Idempotency-Key replay store over `communication.command_dedup`
// (W3-COMM-1). M6 reading/writing its OWN schema (One Module, One Owner); the wire compositions consume
// this ONLY via the M6 contracts facade. Mirrors the ratified `identity.command_dedup.repository`.
//
// FROZEN GROUNDING (see the `communication_command_dedup` migration header for the full anchor set):
// Doc-4H §H8 / Doc-5H §7.5 (replay → cached response; no duplicate row/audit) · Doc-6A §10.3 (dedicated
// dedup table; window = POLICY key, never a literal) · Doc-5A §9.3 (the stored result + status +
// ORIGINAL reference_id are what a safe replay returns).
//
// SEMANTICS (the M1 house pattern):
//   • SUCCESS-ONLY caching: only a 2xx execution is stored (errors are never cached — a 409 must stay
//     retriable). Enforced by the composition (`persistWireReplay`).
//   • WINDOW: `communication.idempotency_dedup_window` read via `core.config_value_query.v1` at lookup
//     time — never a literal.
//   • POST-WINDOW: a stale row is OVERWRITTEN by the next execution (Doc-5A §9.4 — a bounded operational
//     update of a non-authoritative cache).
//   • CONCURRENT SAME-KEY: the CREATE / append legs (no CAS/machine guard) claim the scope key BEFORE
//     executing (Doc-4A §14.3 in-flight protection); a concurrent contender blocks on the uncommitted
//     claim's unique-index entry, LOSES once the winner commits, and returns the winner's stored payload.
//     The claim rides the SAME transaction as the business write (crash-safe rollback; explicit release
//     on an error outcome).
//
// The upsert/claim is raw SQL on M6's OWN table (the `UNIQUE NULLS NOT DISTINCT` scope key is not
// Prisma-expressible — the house pattern; NOT cross-schema SQL).

import { prisma, Prisma, type DbExecutor } from "@/shared/db";
import { uuidv7 } from "@/shared/ids";
import type { ConfigValueQuery } from "@/modules/core/contracts";
import { policyDurationToMs } from "../../domain/value-objects/policy-duration";
import type { CommandDedupScope, StoredCommandResponse } from "../../contracts/types";

export interface FindCommandDedupDeps {
  /** `core.config_value_query.v1` — resolves the `communication.idempotency_dedup_window` (never a literal). */
  configValueQuery: ConfigValueQuery;
  /** Injectable clock (deterministic window tests). Default `new Date()`. */
  now?: () => Date;
}

/** The PENDING-claim sentinel `response_status` — never a real HTTP status. A claim row carries it
 *  between `claimCommandDedupRecord` and the completing `persistCommandDedupRecord` /releasing
 *  `releaseCommandDedupRecord`, all inside ONE transaction (a committed pending row is unreachable). */
const CLAIM_PENDING_STATUS = 0;

/**
 * Look up the stored response for `scope` WITHIN the POLICY window (Doc-4H §H8 safe replay). Returns
 * `null` when no row exists, the row is a pending claim, or the row is post-window (re-execute).
 *
 * @param windowPolicyKey the full Doc-4A §18.2 reference form
 *   (`core.system_configuration.communication.idempotency_dedup_window`).
 */
export async function findCommandDedupRecord(
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db: DbExecutor = prisma,
): Promise<StoredCommandResponse | null> {
  const row = await db.communicationCommandDedup.findFirst({
    where: {
      contractId: scope.contractId,
      actorUserId: scope.actorUserId,
      organizationId: scope.organizationId, // null matches the org-less staff scope rows exactly
      idempotencyKey: scope.idempotencyKey,
    },
    select: {
      responseStatus: true,
      responseBody: true,
      responseHeaders: true,
      executedAt: true,
    },
  });
  if (row === null) return null;
  if (row.responseStatus === CLAIM_PENDING_STATUS) return null; // a pending claim is never a replay.

  const cfg = await deps.configValueQuery({ key: windowPolicyKey }, db);
  const windowMs = policyDurationToMs(cfg.value, "communication dedup window POLICY");
  const now = deps.now?.() ?? new Date();
  if (row.executedAt.getTime() + windowMs <= now.getTime()) {
    return null; // post-window — Doc-5A §9.4 asserts no outcome; the caller re-executes.
  }

  return {
    status: row.responseStatus,
    body: row.responseBody,
    headers:
      row.responseHeaders === null
        ? undefined
        : (row.responseHeaders as Record<string, string> | undefined),
  };
}

/**
 * CLAIM the scope key BEFORE executing a command (Doc-4A §14.3 in-flight protection). Must run on the
 * SAME transaction executor the business write will use. `"claimed"` → execute + complete/release;
 * `"lost"` → a concurrent/committed within-window execution owns the key (re-read the winner). A
 * post-window committed row is RECLAIMED in place (the §9.4 post-window re-execution).
 */
export async function claimCommandDedupRecord(
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db: DbExecutor = prisma,
): Promise<"claimed" | "lost"> {
  const cfg = await deps.configValueQuery({ key: windowPolicyKey }, db);
  const windowSeconds = policyDurationToMs(cfg.value, "communication dedup window POLICY") / 1000;
  const affected = await db.$executeRaw(Prisma.sql`
    INSERT INTO "communication"."command_dedup"
      ("id", "contract_id", "actor_user_id", "organization_id", "idempotency_key",
       "response_status", "response_body", "response_headers", "executed_at", "created_at", "updated_at")
    VALUES
      (${uuidv7()}::uuid, ${scope.contractId}, ${scope.actorUserId}::uuid,
       ${scope.organizationId}::uuid, ${scope.idempotencyKey},
       ${CLAIM_PENDING_STATUS}, 'null'::jsonb, NULL, now(), now(), now())
    ON CONFLICT ("contract_id", "actor_user_id", "organization_id", "idempotency_key")
    DO UPDATE SET
      "response_status"  = ${CLAIM_PENDING_STATUS},
      "response_body"    = 'null'::jsonb,
      "response_headers" = NULL,
      "executed_at"      = now(),
      "updated_at"       = now()
    WHERE "command_dedup"."executed_at" + make_interval(secs => ${windowSeconds}::float8) <= now()
  `);
  return affected === 1 ? "claimed" : "lost";
}

/**
 * RELEASE an unconsumed claim (an ERROR outcome — the command returned `ok: false` without throwing, so
 * the transaction will still COMMIT). Deleting the pending row keeps errors uncached (retry stays live)
 * and the key un-wedged. A THROWN failure needs no release — the transaction rollback removes the claim.
 */
export async function releaseCommandDedupRecord(
  scope: CommandDedupScope,
  db: DbExecutor = prisma,
): Promise<void> {
  await db.communicationCommandDedup.deleteMany({
    where: {
      contractId: scope.contractId,
      actorUserId: scope.actorUserId,
      organizationId: scope.organizationId,
      idempotencyKey: scope.idempotencyKey,
      responseStatus: CLAIM_PENDING_STATUS, // only ever the pending claim — never a completed record
    },
  });
}

/**
 * Persist (upsert) the stored response for `scope` — called ONLY after a SUCCESSFUL execution, on the
 * SAME transaction executor as the business write (the §14.3 joint rule: a replay finds the cache IFF the
 * side effect committed). Completes this transaction's own pending claim in place; overwrites a
 * post-window row (bounded operational update; `executed_at` re-anchors).
 */
export async function persistCommandDedupRecord(
  scope: CommandDedupScope,
  stored: StoredCommandResponse,
  db: DbExecutor = prisma,
): Promise<void> {
  const bodyJson = JSON.stringify(stored.body ?? null);
  const headersJson = stored.headers !== undefined ? JSON.stringify(stored.headers) : null;
  await db.$executeRaw(Prisma.sql`
    INSERT INTO "communication"."command_dedup"
      ("id", "contract_id", "actor_user_id", "organization_id", "idempotency_key",
       "response_status", "response_body", "response_headers", "executed_at", "created_at", "updated_at")
    VALUES
      (${uuidv7()}::uuid, ${scope.contractId}, ${scope.actorUserId}::uuid,
       ${scope.organizationId}::uuid, ${scope.idempotencyKey},
       ${stored.status}, ${bodyJson}::jsonb, ${headersJson}::jsonb, now(), now(), now())
    ON CONFLICT ("contract_id", "actor_user_id", "organization_id", "idempotency_key")
    DO UPDATE SET
      "response_status"  = EXCLUDED."response_status",
      "response_body"    = EXCLUDED."response_body",
      "response_headers" = EXCLUDED."response_headers",
      "executed_at"      = now(),
      "updated_at"       = now()
  `);
}
