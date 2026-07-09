// M1 domain (PRIVATE) — the Last-Owner-Protection + Ownership-Succession guards (service-layer). PURE
// decision functions over already-resolved facts (no I/O, no governance-signal read) — the repository resolves
// the owner facts (`resolveOwnerRemovalFacts`), this module DECIDES. The W2-IDN-6.2 wired commands
// (`remove_member`, `set_membership_status` suspend, `transfer_ownership`, `deactivate_own_account`) consult these
// before any Owner-disabling write; they are the BUSINESS-stage guard behind the `identity_org_last_owner_block`
// / `identity_user_last_owner_block` register codes (Doc-4C §C4/§C5/§C6).
//
// Reference-never-restate. The rule is frozen in Master System Architecture §5.5 + Doc-2 §5.1 guards (bound by
// VERBATIM transcription, per the WP acceptance criteria):
//
//   Master Architecture §5.5 — Owner Protection and Succession:
//     • "Last Owner Protection. An organization must always have at least one active owner. Before an owner
//        can be removed, ownership must be transferred or a new owner assigned. Organizations must never
//        become ownerless."
//     • "Ownership Succession. If an owner account becomes disabled, deleted, or suspended, ownership must be
//        reassigned via manual transfer, admin recovery, or a legal recovery process. Every recovery action
//        requires an audit record, a reason code, and an approver identity."
//   Doc-2 §5.1 guard: "an organization must always have ≥1 active Owner (Last Owner Protection); ownership
//                      succession must run before owner removal/disablement."
//
// "Owner" = an ACTIVE membership bound to the seeded Owner system-bundle role (`roles.name = 'Owner'`,
// `organization_id IS NULL`, `is_system_bundle = true`; Doc-6C §5.2). Resolving "who is an active Owner" is
// the repository's job; these predicates take the resolved counts.

/** The facts the repository resolves for a proposed Owner-disabling mutation (remove/suspend/demote/close). */
export interface LastOwnerProtectionFacts {
  /** True iff the mutation's TARGET membership is currently an ACTIVE Owner (the row about to be disabled). */
  targetIsActiveOwner: boolean;
  /**
   * Count of OTHER active Owner memberships in the same org (excluding the target). `0` means the target is
   * the SOLE active Owner — disabling it would leave the org ownerless.
   */
  otherActiveOwnerCount: number;
}

/** The guard verdict. `blocked = true` ⇒ the caller returns `identity_*_last_owner_block` (BUSINESS) and
 *  writes nothing (succession must run first). */
export interface LastOwnerProtectionVerdict {
  blocked: boolean;
}

/**
 * Last Owner Protection (Master Architecture §5.5 / Doc-2 §5.1). BLOCK a mutation that would remove, suspend,
 * demote, or otherwise disable the SOLE active Owner — i.e. when the target IS an active Owner AND no OTHER
 * active Owner remains. When the target is not an active Owner, OR another active Owner remains, the mutation
 * is permitted (this guard alone; the machine + other guards still apply). Never "an org can become ownerless".
 */
export function evaluateLastOwnerProtection(
  facts: LastOwnerProtectionFacts,
): LastOwnerProtectionVerdict {
  const blocked = facts.targetIsActiveOwner && facts.otherActiveOwnerCount === 0;
  return { blocked };
}

/** The facts a transfer/succession supplies (Doc-4C §C5 `transfer_ownership` / `admin_recover_ownership`). */
export interface OwnershipSuccessionFacts {
  /** The nominated new owner holds an ACTIVE membership in the org (Doc-4C §C5 REFERENCE precondition). */
  newOwnerHasActiveMembership: boolean;
  /** The number of active Owners the org would hold AFTER the succession completes (must be ≥ 1). */
  resultingActiveOwnerCount: number;
}

/** The succession verdict. `permitted = false` ⇒ the caller rejects (the transfer would violate §5.5). */
export interface OwnershipSuccessionVerdict {
  permitted: boolean;
}

/**
 * Ownership Succession (Master Architecture §5.5). A succession/transfer is PERMITTED only when the nominated
 * new owner holds an active membership AND the org retains ≥1 active Owner as a result — "ownership must be
 * transferred or a new owner assigned" BEFORE the outgoing Owner is disabled, and the org "must never become
 * ownerless". Any other combination (inactive nominee, or a result of 0 active Owners) is rejected.
 */
export function evaluateOwnershipSuccession(
  facts: OwnershipSuccessionFacts,
): OwnershipSuccessionVerdict {
  const permitted = facts.newOwnerHasActiveMembership && facts.resultingActiveOwnerCount >= 1;
  return { permitted };
}
