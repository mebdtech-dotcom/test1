// M1 application (PRIVATE) — `identity.switch_active_organization.v1` (Doc-4C §C8 · 21.4 Command · Actor:
// User). Orchestration only; owns NO state. The active-org CONTEXT SELECTOR: it validates that the caller
// may adopt the requested organization as active context and echoes the SERVER-VALIDATED org id — the
// client then carries it in the `Iv-Active-Organization` header, re-validated every request (Doc-5C §3.3;
// Invariant #5 — a client-supplied org id is NEVER trusted).
//
// SIDE-EFFECT-FREE by frozen declaration (Doc-4C §C8):
//   - State Effects: NONE (PassB:537 — "session context; no entity §5 transition"); no active-org is
//     persisted (there is no such column — Doc-2 §10.2 / the schema).
//   - Audit: NO (PassB:539 — "context selection is operational, not a Doc-2 §9 business action, §17.1").
//   - Events: none (§8). Idempotency: idempotent BY NATURE (PassB:538 — "replay → same context, no side
//     effect"); the mandatory `Idempotency-Key` wire leg is enforced at the route (SYNTAX), but there is
//     NO §B.6 replay STORE — nothing to dedup (no state transition, no audit, no outbox; §14.3 is satisfied
//     trivially). This command therefore neither writes nor audits nor claims a dedup row.
//
// THE §C8 BUSINESS PRECONDITION (RV-0150 OBS-B1). The switch's Validation Matrix (PassB:535):
//   SYNTAX (uuid) → CONTEXT (authenticated user) → AUTHZ (caller holds ACTIVE membership in target, §6.1)
//   → SCOPE (membership active; NOT_FOUND collapse if not a member) → BUSINESS (org not suspended).
// The org-half is enforced HERE — the switch (§C8 BUSINESS) is the SOLE live enforcement point of
// org-not-suspended. It reads the live org row and applies the domain predicate
// `organizationParticipatesInAccessFormula` (the frozen §C8 BUSINESS check over live state, not a shadow).
// The GENERAL context resolution (`src/server/context/resolveActiveOrg`) is MEMBERSHIP-ONLY (Doc-5C §3.3)
// and DELIBERATELY does NOT gate org_status — a blanket downstream gate would break §C5
// `soft_delete_organization` over a §5.1 `active|suspended → soft_deleted` source (`[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`).
// Only an `active` org may become active context; a `suspended` org rejects (BUSINESS `state_invalid`); a
// soft-deleted org (its cascade tombstones the memberships) collapses to NOT_FOUND (non-disclosure).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { findActiveMembership } from "../../infrastructure/data/authz.repository";
import { readOrganizationLifecycle } from "../../infrastructure/data/context.repository";
import { organizationParticipatesInAccessFormula } from "../../domain/policies/membership-participation.policy";
import type {
  SwitchActiveOrganizationInput,
  SwitchActiveOrganizationOutcome,
  SwitchActiveOrganizationContext,
} from "../../contracts/types";

/**
 * `identity.switch_active_organization.v1` (Doc-4C §C8). Resolve whether `input.organizationId` may become
 * the caller's active context, from the SERVER-RESOLVED principal `ctx.userId` (never a client-asserted
 * actor). Returns the frozen §C8 outcome — a validated org id, the NOT_FOUND collapse (not an active
 * member / not a live org), or the BUSINESS `state_invalid` reject (member of a suspended org). Reads only.
 */
export async function switchActiveOrganization(
  input: SwitchActiveOrganizationInput,
  ctx: SwitchActiveOrganizationContext,
  db: DbExecutor = prisma,
): Promise<SwitchActiveOrganizationOutcome> {
  // AUTHZ + SCOPE (§6.1) — the caller must hold an ACTIVE membership in the target org. Absent (no
  // membership, or a non-active one) ⇒ the frozen NOT_FOUND collapse (PassB:535/:536: "NOT_FOUND collapse
  // if not a member") — never an existence oracle over an org the caller has no live membership in. A
  // soft-deleted org reaches here as `null` too (its cascade tombstones the membership) — same collapse.
  const membership = await findActiveMembership(ctx.userId, input.organizationId, db);
  if (membership === null) {
    return { ok: false, code: "not_found" };
  }

  // BUSINESS (§C8 PassB:535) — "org not suspended for the user's access". The caller IS an active member,
  // so surfacing "your org is suspended" to them is not a disclosure (they are a party). Only an `active`
  // org participates (Doc-2 §5.1); `suspended` (and any non-active status) reject as BUSINESS `state_invalid`.
  const org = await readOrganizationLifecycle(input.organizationId, db);
  if (org === null || !organizationParticipatesInAccessFormula(org.orgStatus)) {
    return { ok: false, code: "state_invalid" };
  }

  return { ok: true, organizationId: input.organizationId };
}
