// M0 infrastructure — realizes `core.config_value_query.v1` (Doc-4B §B8): the internal runtime
// POLICY read over `core.system_configuration` (Doc-6B §3.4). Module 0 owns the STORE; POLICY key
// definitions/values are owned by Doc-3 §12.2 — M0 stores, it never defines keys or values
// (Doc-4B §18.2). This is M0 reading its OWN schema (allowed); other modules consume this via the
// contract surface, never raw `core` SQL (One Module, One Owner).
//
// Read-only: no audit (Doc-4B §B8 — Audit-Required: no), no event (Events-Produced: none), no
// state-machine effect. RLS on the table is the platform-staff defense-in-depth backstop
// (Doc-6B §2.2 / CHK-6-023); this app-layer service is the authorized read path.
//
// Key form (Doc-4A §18.2 / Doc-4B §B8 V1): callers reference a POLICY key in the full reference
// form `core.system_configuration.<domain>.<key_name>`. The store's natural key is the registered
// key `<domain>.<key_name>` (Doc-6B §5.2 seed pattern — e.g. `core.config_change_dedup_window`);
// the reader strips the fixed `core.system_configuration.` reference prefix to resolve it. No
// literal POLICY value lives in code — values come only from the table (Doc-4A §18.2).

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { ConfigValueQuery, CoreServiceExecutor } from "../../contracts/services";
import { CoreServiceError } from "../../contracts/types";

/** The fixed Doc-4A §18.2 reference-form prefix (a namespace pointer, not a POLICY value). */
const POLICY_REFERENCE_PREFIX = "core.system_configuration.";

/**
 * Doc-4B §B8 V1 (SYNTAX): well-formed `core.system_configuration.<domain>.<key_name>`.
 * `<domain>` / `<key_name>` are snake_case identifiers (Doc-3 §12.2 registered-key shape).
 */
const WELL_FORMED_KEY = /^core\.system_configuration\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

/**
 * Resolve a POLICY value by key (Doc-4B §B8 / Doc-6B §3.4). Runs on the supplied transaction
 * executor when present (a caller may read POLICY bounds inside its own transaction); otherwise
 * on the shared client.
 *
 * Errors (verbatim Doc-4B §B8): `core_config_invalid_key` (VALIDATION — malformed key) ·
 * `core_config_key_not_found` (REFERENCE — key absent from the store; an unknown key is a
 * contract gap to escalate, never a runtime invention).
 */
export const configValueQuery: ConfigValueQuery = async (input, executor?: CoreServiceExecutor) => {
  const key = input.key;
  if (typeof key !== "string" || !WELL_FORMED_KEY.test(key)) {
    throw new CoreServiceError(
      "core_config_invalid_key",
      "core.config_value_query.v1: key must be well-formed core.system_configuration.<domain>.<key_name> (Doc-4A §18.2)",
    );
  }

  // Registered key = `<domain>.<key_name>` — the store's natural key (Doc-6B §5.2).
  const registeredKey = key.slice(POLICY_REFERENCE_PREFIX.length);

  const db = (executor as DbExecutor | undefined) ?? prisma;
  const row = await db.systemConfiguration.findUnique({
    where: { key: registeredKey },
    select: { valueJsonb: true, valueType: true },
  });

  if (row === null) {
    throw new CoreServiceError(
      "core_config_key_not_found",
      `core.config_value_query.v1: POLICY key not found: ${key}`,
    );
  }

  return { value: row.valueJsonb, valueType: row.valueType };
};
