// Public service interfaces + callables for module "identity" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (e.g. `src/server`) import from here, never the
// private application/domain/infrastructure layers (the boundary linter enforces this).
//
// `provisionIdentity` (WP-1.3 [W1-AUTH-001]) is the public face over the private M1 first-login
// provisioning command — the contracts/ facade delegates to its OWN module's application layer
// (same-module import; the cross-module One-Module rule is untouched). The Module 0
// `allocateHumanReference` contract service is INJECTED (typed from `@/modules/core/contracts` — a
// cross-module TYPE import, the only boundary-legal way to consume another module): M0 allocation
// stays flowing through contracts, never a concrete cross-module value import (Doc-4B §A7; Doc-4C §C5
// "allocate the ref via Module 0").

import type { AllocateHumanReference } from "@/modules/core/contracts";
import type { DbExecutor } from "@/shared/db";
import {
  createDelegationGrantCommand,
  type CreateDelegationGrantContext,
  type CreateDelegationGrantDeps,
} from "../application/commands/create-delegation-grant.command";
import {
  revokeDelegationGrantCommand,
  suspendDelegationGrantCommand,
  type DelegationGrantLifecycleContext,
  type DelegationGrantLifecycleDeps,
} from "../application/commands/suspend-revoke-delegation-grant.command";
import {
  reinstateDelegationGrantCommand,
  type ReinstateDelegationGrantContext,
  type ReinstateDelegationGrantDeps,
} from "../application/commands/reinstate-delegation-grant.command";
import { getDelegationGrant as getDelegationGrantQuery } from "../application/queries/get-delegation-grant.query";
import { listDelegationGrants as listDelegationGrantsQuery } from "../application/queries/list-delegation-grants.query";
import {
  claimCommandDedupRecord as claimCommandDedupRecordImpl,
  findCommandDedupRecord as findCommandDedupRecordImpl,
  persistCommandDedupRecord as persistCommandDedupRecordImpl,
  releaseCommandDedupRecord as releaseCommandDedupRecordImpl,
  type FindCommandDedupDeps,
} from "../infrastructure/data/command-dedup.repository";
import {
  expireDelegationGrantsCommand,
  type ExpireDelegationGrantsDeps,
} from "../application/commands/expire-delegation-grants.command";
import {
  expireInvitationsCommand,
  type ExpireInvitationsDeps,
} from "../application/commands/expire-invitations.command";
import {
  activateMembershipCommand,
  type ActivateMembershipDeps,
} from "../application/commands/activate-membership.command";
import { provisionIdentityForAuthUser } from "../application/commands/provision-identity.command";
import {
  updateUserProfileCommand,
  DISPLAY_NAME_MAX_LENGTH,
  type UpdateUserProfileContext,
} from "../application/commands/update-user-profile.command";
import {
  updateUser2faSettingsCommand,
  type UpdateUser2faSettingsContext,
  type UpdateUser2faSettingsDeps,
} from "../application/commands/update-user-2fa-settings.command";
import {
  deactivateOwnAccountCommand,
  type DeactivateOwnAccountContext,
  type DeactivateOwnAccountDeps,
} from "../application/commands/deactivate-own-account.command";
import {
  setUserAccountStatusCommand,
  validateSetUserAccountStatusInput,
  ADMIN_REASON_MAX_LENGTH,
  SET_USER_ACCOUNT_STATUS_SLUG,
  type SetUserAccountStatusContext,
  type SetUserAccountStatusDeps,
} from "../application/commands/set-user-account-status.command";
import {
  createOrganizationCommand,
  ORG_NAME_MAX_LENGTH,
  validateCreateOrganizationInput,
  type CreateOrganizationContext,
  type CreateOrganizationDeferredFields,
  type CreateOrganizationDeps,
} from "../application/commands/create-organization.command";
import {
  updateOrganizationProfileCommand,
  type UpdateOrganizationProfileContext,
  type UpdateOrganizationProfileDeferredFields,
  type UpdateOrganizationProfileDeps,
} from "../application/commands/update-organization-profile.command";
import {
  SUCCESSION_REASON_MAX_LENGTH,
  TRANSFER_OWNERSHIP_SLUG,
  transferOwnershipCommand,
  type TransferOwnershipContext,
  type TransferOwnershipDeps,
} from "../application/commands/transfer-ownership.command";
import {
  DELETE_ORGANIZATION_SLUG,
  DELETE_REASON_MAX_LENGTH,
  softDeleteOrganizationCommand,
  type SoftDeleteOrganizationContext,
  type SoftDeleteOrganizationDeps,
} from "../application/commands/soft-delete-organization.command";
import {
  restoreOrganizationCommand,
  type RestoreOrganizationContext,
  type RestoreOrganizationDeps,
} from "../application/commands/restore-organization.command";
import {
  ORG_ADMIN_REASON_MAX_LENGTH,
  SET_ORGANIZATION_STATUS_SLUG,
  setOrganizationStatusCommand,
  validateSetOrganizationStatusInput,
  type SetOrganizationStatusContext,
  type SetOrganizationStatusDeps,
} from "../application/commands/set-organization-status.command";
import {
  ADMIN_RECOVER_OWNERSHIP_SLUG,
  adminRecoverOwnershipCommand,
  validateAdminRecoverOwnershipInput,
  type AdminRecoverOwnershipContext,
  type AdminRecoverOwnershipDeps,
} from "../application/commands/admin-recover-ownership.command";
import { getBuyerProfile as getBuyerProfileQuery } from "../application/queries/get-buyer-profile.query";
import {
  upsertBuyerProfileCommand,
  type UpsertBuyerProfileContext,
  type UpsertBuyerProfileDeps,
} from "../application/commands/upsert-buyer-profile.command";
import { getUser as getUserQuery } from "../application/queries/get-user.query";
import { getOrganization as getOrganizationQuery } from "../application/queries/get-organization.query";
import { getMembership as getMembershipQuery } from "../application/queries/get-membership.query";
import {
  checkPermission as checkPermissionQuery,
  type CheckPermissionDeps,
} from "../application/queries/check-permission.query";
import type {
  ActivateMembershipInput,
  ActivateMembershipResult,
  AdminRecoverOwnershipInput,
  AdminRecoverOwnershipOutcome,
  CheckPermissionInput,
  CheckPermissionResult,
  CommandDedupScope,
  CreateDelegationGrantInput,
  CreateDelegationGrantOutcome,
  CreateOrganizationInput,
  CreateOrganizationOutcome,
  DeactivateOwnAccountInput,
  DeactivateOwnAccountOutcome,
  DelegationGrantLifecycleInput,
  DelegationGrantLifecycleOutcome,
  ExpireDelegationGrantsResult,
  ExpireInvitationsResult,
  GetBuyerProfileResult,
  GetDelegationGrantResult,
  GetMembershipResult,
  GetOrganizationResult,
  GetUserResult,
  ListDelegationGrantsInput,
  ListDelegationGrantsResult,
  ProvisionIdentityInput,
  ProvisionIdentityResult,
  ReinstateDelegationGrantInput,
  RestoreOrganizationInput,
  RestoreOrganizationOutcome,
  SetOrganizationStatusInput,
  SetOrganizationStatusOutcome,
  SetUserAccountStatusInput,
  SetUserAccountStatusOutcome,
  SoftDeleteOrganizationInput,
  SoftDeleteOrganizationOutcome,
  StoredCommandResponse,
  TransferOwnershipInput,
  TransferOwnershipOutcome,
  UpdateOrganizationProfileInput,
  UpdateOrganizationProfileOutcome,
  UpdateUser2faSettingsInput,
  UpdateUser2faSettingsOutcome,
  UpdateUserProfileInput,
  UpdateUserProfileOutcome,
  UpsertBuyerProfileInput,
  UpsertBuyerProfileOutcome,
} from "./types";

// Re-export the write-command's context/deps shapes on the contracts surface so the app-layer composition
// edge (`src/server/identity`) can build them via `@/modules/identity/contracts` (contracts-only).
export type { UpsertBuyerProfileContext, UpsertBuyerProfileDeps };

// Re-export the check_permission deps shape (the injectable ports — vendor-profile-state reader + clock)
// so the app-layer authz seam (`src/server/authz`) can supply them via `@/modules/identity/contracts`.
export type { CheckPermissionDeps };

/** Dependencies a caller injects into provisioning — the Module 0 contract service(s). */
export interface ProvisionIdentityDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), injected by the
   * contract TYPE. Bound into the provisioning transaction so the `ORG-…` ref allocation is atomic
   * with the org create (Doc-4C §C5 — "no second ref on replay").
   */
  allocateHumanReference: AllocateHumanReference;
}

/**
 * `identity.provisionIdentity` — the cross-module callable that lazily provisions a first-login
 * identity (user + Personal Organization + Owner membership), atomically and idempotently. The
 * authoritative behavior (one transaction, idempotent on `auth_user_id`, full rollback, RLS
 * bootstrap context) lives in the private M1 command; this is its public, contracts-only entry point.
 */
export type ProvisionIdentity = (
  input: ProvisionIdentityInput,
  deps: ProvisionIdentityDeps,
) => Promise<ProvisionIdentityResult>;

/**
 * The concrete public provisioning service (M1 contracts facade → M1 application command).
 * Cross-module consumers call this via `@/modules/identity/contracts`.
 */
export const provisionIdentity: ProvisionIdentity = (input, deps) =>
  provisionIdentityForAuthUser(input, { allocateHumanReference: deps.allocateHumanReference });

/**
 * `identity.get_buyer_profile.v1` (Doc-5C §6.1 row 33; §6.3 non-disclosure) — the PUBLIC, contracts-only
 * face over the private M1 read query (WP-1.2). The owning/active-org buyer-profile singleton read; the
 * active org is RESOLVED + enforced upstream by the app-layer org-context guard which sets `app.active_org`
 * on the request transaction (Doc-6C §2.1 / Doc-5C §3.3 — client-supplied org id never trusted). RLS scopes
 * the read; NO organization id is taken as input. Cross-tenant / absent → `found: false` (Doc-5C §6.3 — the
 * wire `404` collapse, indistinguishable from genuine absence).
 *
 * The cross-module surface is the TYPE; the concrete callable below binds the same-module application query
 * (the canonical DDD contracts-facade pattern — `${from.module}`-scoped; no cross-module internal access).
 * Callers (the app-layer route) MUST invoke it with the transaction executor carrying the server-set
 * `app.active_org` GUC — i.e. INSIDE `withActiveOrgContext` (`src/server/context`).
 *
 * @param db the request-transaction executor carrying the server-set active-org GUC (Doc-6C §2.1).
 */
export type GetBuyerProfile = (db?: DbExecutor) => Promise<GetBuyerProfileResult>;

/** Concrete `identity.get_buyer_profile.v1` facade (M1 contracts → M1 application query). */
export const getBuyerProfile: GetBuyerProfile = (db) => getBuyerProfileQuery(db);

// The M1 WIRE FACE for the buyer-profile read (result → Doc-5A envelope + §6.2 status). M1 owns how
// its read becomes HTTP, so the mapper lives in M1's `api/`; this contracts re-export is the public,
// boundary-legal handle the app-layer route composition consumes via `@/modules/identity/contracts`
// (same-module contracts → own `api/`; `${from.module}`-scoped — no cross-module internal access).
export { mapGetBuyerProfile } from "../api/get-buyer-profile.handler";

/**
 * `identity.upsert_buyer_profile.v1` (Doc-4C §C10; D7) — the PUBLIC, contracts-only face over the private
 * M1 write command. Create-or-update the active-org buyer profile, appending the canonical audit action
 * (`buyer_profile_created` / `buyer_profile_updated` — Doc-2_Patch_v1.0.4 + Doc-4C realization patch)
 * ATOMICALLY with the write. The active org is RESOLVED + enforced upstream by the app-layer org-context
 * guard (RLS); the M0 `appendAuditRecord` is INJECTED by the contract TYPE (the boundary-legal mechanism).
 *
 * MUST be invoked INSIDE `withActiveOrgContext` — the `db` executor carries the server-set `app.active_org`
 * / `app.user_id` GUCs that BOTH the buyer_profiles RLS and the audit `WITH CHECK` read.
 */
export type UpsertBuyerProfile = (
  input: UpsertBuyerProfileInput,
  ctx: UpsertBuyerProfileContext,
  deps: UpsertBuyerProfileDeps,
  db?: DbExecutor,
) => Promise<UpsertBuyerProfileOutcome>;

/** Concrete `identity.upsert_buyer_profile.v1` facade (M1 contracts → M1 application command). */
export const upsertBuyerProfile: UpsertBuyerProfile = (input, ctx, deps, db) =>
  upsertBuyerProfileCommand(input, ctx, deps, db);

// The M1 WIRE FACE for the buyer-profile WRITE (outcome → Doc-5A envelope + §6.2 status). Same One-Owner
// placement as the read mapper — M1 owns how its write becomes HTTP.
export { mapUpsertBuyerProfile } from "../api/upsert-buyer-profile.handler";

// ─────────────────────────────────────────────────────────────────────────────
// §C3 — Shared Identity Services (OUT-OF-WIRE, internal-service). The four auth-root reads — the
// SINGLE authorization-resolution source (Doc-4C §C3). Doc-5C §7.1: these carry NO HTTP method/path;
// proposing a wire = an architecture change (§7.5). Every consuming module (and `src/server/authz`)
// consumes THESE, never `identity.*` tables directly and never a shadow authorization check (§B.11).
// All are reads: unaudited (§17.1), zero events. The `db` executor may carry the RLS-scoped active-org
// context (defense-in-depth); resolution correctness does not depend on RLS (each read is org-anchored).
// ─────────────────────────────────────────────────────────────────────────────

/** `identity.get_user.v1` (Doc-4C §C3) — canonical user read (personal-data minimized; never an
 *  auth-mechanism field, DC-4). Consumers MUST call this, never read `identity.users` directly. */
export type GetUser = (userId: string, db?: DbExecutor) => Promise<GetUserResult>;
export const getUser: GetUser = (userId, db) => getUserQuery(userId, db);

/** `identity.get_organization.v1` (Doc-4C §C3) — canonical org read. Consumers MUST call this, never
 *  read `identity.organizations` cross-module. */
export type GetOrganization = (
  organizationId: string,
  db?: DbExecutor,
) => Promise<GetOrganizationResult>;
export const getOrganization: GetOrganization = (organizationId, db) =>
  getOrganizationQuery(organizationId, db);

/** `identity.get_membership.v1` (Doc-4C §C3) — the (user × org) link + its `state` (the access-formula
 *  input, §6.1). Consumers read `state`, never re-derive the role→permission mapping (use `checkPermission`). */
export type GetMembership = (
  userId: string,
  organizationId: string,
  db?: DbExecutor,
) => Promise<GetMembershipResult>;
export const getMembership: GetMembership = (userId, organizationId, db) =>
  getMembershipQuery(userId, organizationId, db);

/**
 * `identity.check_permission.v1` (Doc-4C §C3) — THE platform authorization root. Implements (never
 * redefines) the Doc-4A §6.1 three-layer check + §6B.2 five-condition delegated-access check. This is
 * the SINGLE authorization-resolution source: every consuming module MUST call this (or the §C3 reads it
 * composes) and MUST NOT implement a parallel/shadow check. Slugs only (never a role or plan); no
 * plan/entitlement influences the decision (firewall). `organizationId` is the SERVER-VALIDATED active
 * org (never client-asserted). `deps.vendorProfileStateReader` (the M2 Vendor Service port) is required
 * to affirm §6B.2 condition 5 on a delegated path — absent ⇒ the delegated path fails closed.
 */
export type CheckPermission = (
  input: CheckPermissionInput,
  deps?: CheckPermissionDeps,
  db?: DbExecutor,
) => Promise<CheckPermissionResult>;
export const checkPermission: CheckPermission = (input, deps, db) =>
  checkPermissionQuery(input, deps, db);

// ─────────────────────────────────────────────────────────────────────────────
// §C9 — Delegation Grant surface (W2-IDN-4 write side; W2-IDN-6.5 real reinstate + dual-party reads).
// The controlling-org create/suspend/reinstate/revoke commands + the party-scoped get/list reads +
// the out-of-wire System expiry sweep. Every mutation is an AUDITED, ATOMIC write (the D7 pattern):
// the M0 `appendAuditRecord` is INJECTED by contract TYPE; the audit is atomic with the write (same
// tx). The User commands MUST be invoked INSIDE `withActiveOrgContext` with the CONTROLLING org as
// the active org. Zero §8 events ([DC-1]). Re-export the command context/deps shapes so the app-layer
// composition edge builds them via `@/modules/identity/contracts` (contracts-only).
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CreateDelegationGrantContext,
  CreateDelegationGrantDeps,
  DelegationGrantLifecycleContext,
  DelegationGrantLifecycleDeps,
  ExpireDelegationGrantsDeps,
};

/** `identity.create_delegation_grant.v1` (Doc-4C §C9) — issue a grant (controlling org → representative
 *  org over a controlled vendor profile). Audited (`delegation_grant_issued`) atomically with the insert. */
export type CreateDelegationGrant = (
  input: CreateDelegationGrantInput,
  ctx: CreateDelegationGrantContext,
  deps: CreateDelegationGrantDeps,
  db?: DbExecutor,
) => Promise<CreateDelegationGrantOutcome>;
export const createDelegationGrant: CreateDelegationGrant = (input, ctx, deps, db) =>
  createDelegationGrantCommand(input, ctx, deps, db);

/** `identity.suspend_delegation_grant.v1` (Doc-4C §C9) — `active → suspended`. Audited atomically. */
export type SuspendDelegationGrant = (
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  db?: DbExecutor,
) => Promise<DelegationGrantLifecycleOutcome>;
export const suspendDelegationGrant: SuspendDelegationGrant = (input, ctx, deps, db) =>
  suspendDelegationGrantCommand(input, ctx, deps, db);

/** `identity.revoke_delegation_grant.v1` (Doc-4C §C9) — `active|suspended → revoked` (terminal); fires the
 *  refresh-on-revocation seam after commit. Audited (`delegation_grant_revoked`) atomically. */
export type RevokeDelegationGrant = (
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  db?: DbExecutor,
) => Promise<DelegationGrantLifecycleOutcome>;
export const revokeDelegationGrant: RevokeDelegationGrant = (input, ctx, deps, db) =>
  revokeDelegationGrantCommand(input, ctx, deps, db);

// The reinstate context/deps shapes for the app-layer composition edge (contracts-only).
export type { ReinstateDelegationGrantContext, ReinstateDelegationGrantDeps };

/** `identity.reinstate_delegation_grant.v1` (Doc-4C §C9 #25 — REAL since W2-IDN-6.5, per
 *  `Doc-2_Patch_v1.0.7` / the 2026-07-09 owner ruling; the former `[ESC-IDN-DELEG-EXPIRY]` scaffold
 *  and its `DelegationReinstateGatedError` are REPLACED per the Board decision instrument (c)) —
 *  `suspended → active`, valid ONLY while the validity window is open (patch rule 3; an expired
 *  grant is terminal — rules 2/4). Audited (`delegation_grant_reinstated`) atomically. Must run
 *  INSIDE `withActiveOrgContext` with the CONTROLLING org as the active org. */
export type ReinstateDelegationGrant = (
  input: ReinstateDelegationGrantInput,
  ctx: ReinstateDelegationGrantContext,
  deps: ReinstateDelegationGrantDeps,
  db?: DbExecutor,
) => Promise<DelegationGrantLifecycleOutcome>;
export const reinstateDelegationGrant: ReinstateDelegationGrant = (input, ctx, deps, db) =>
  reinstateDelegationGrantCommand(input, ctx, deps, db);

/** `identity.get_delegation_grant.v1` (Doc-4C §C9) — the dual-party single-grant read (both party
 *  orgs; non-party collapses to `found: false` — §7.5). `partyOrgId` = the SERVER-RESOLVED active org. */
export type GetDelegationGrant = (
  delegationGrantId: string,
  partyOrgId: string,
  db?: DbExecutor,
) => Promise<GetDelegationGrantResult>;
export const getDelegationGrant: GetDelegationGrant = (delegationGrantId, partyOrgId, db) =>
  getDelegationGrantQuery(delegationGrantId, partyOrgId, db);

/** `identity.list_delegation_grants.v1` (Doc-4C §C9) — the party-scoped list (frozen filters +
 *  `valid_from`/`delegation_grant_id` order). Pagination is FAIL-CLOSED at the wire pending
 *  `ESC-IDN-LIST-PAGESIZE` (no registered identity page-size POLICY key — Doc-3 v1.9 §Notes). */
export type ListDelegationGrants = (
  input: ListDelegationGrantsInput,
  partyOrgId: string,
  db?: DbExecutor,
) => Promise<ListDelegationGrantsResult>;
export const listDelegationGrants: ListDelegationGrants = (input, partyOrgId, db) =>
  listDelegationGrantsQuery(input, partyOrgId, db);

// ─────────────────────────────────────────────────────────────────────────────
// §B.6 — the command-dedup / Idempotency-Key replay store (W2-IDN-6.5). M1 owns the store
// (`identity.command_dedup` — Doc-6A §10.3 dedicated-table vehicle per the owning-module design,
// Doc-6C §6.1); the app-layer wire compositions consume these two primitives around each governed
// mutation: lookup BEFORE execution (a within-window hit is the §9.3 safe replay — stored result,
// same status, same ORIGINAL reference_id, NO re-execution), persist AFTER a successful execution
// (on the SAME transaction executor as the business write wherever the composition owns the tx —
// the §14.3 joint no-duplicate rule). Success-only caching; window = `[DC-5]` POLICY key.
// ─────────────────────────────────────────────────────────────────────────────

export type { FindCommandDedupDeps };

/** The two `[DC-5]` dedup-window POLICY keys the §B.6 legs read (Doc-3 v1.9 REGISTERED — names
 *  verbatim; reference form per Doc-4A §18.2; UNSEEDED until W2-IDN-7 — read, never a literal). */
export const COMMAND_DEDUP_WINDOW_KEY =
  "core.system_configuration.identity.command_dedup_window" as const;
export const USER_UPDATE_DEDUP_WINDOW_KEY =
  "core.system_configuration.identity.user_update_dedup_window" as const;

/** §B.6 replay lookup — the stored response for (contract, actor, org, key) within the POLICY
 *  window, or `null` (execute fresh). */
export type FindCommandDedupRecord = (
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db?: DbExecutor,
) => Promise<StoredCommandResponse | null>;
export const findCommandDedupRecord: FindCommandDedupRecord = (scope, windowPolicyKey, deps, db) =>
  findCommandDedupRecordImpl(scope, windowPolicyKey, deps, db);

/** §B.6 replay persist — store a SUCCESSFUL execution's wire response (upsert on the scope key;
 *  completes this transaction's own pending claim in place on the create leg). */
export type PersistCommandDedupRecord = (
  scope: CommandDedupScope,
  stored: StoredCommandResponse,
  db?: DbExecutor,
) => Promise<void>;
export const persistCommandDedupRecord: PersistCommandDedupRecord = (scope, stored, db) =>
  persistCommandDedupRecordImpl(scope, stored, db);

/** §B.6 pre-execution CLAIM (Doc-4A §14.3 in-flight protection — RV-0153 F2; the create leg).
 *  `"claimed"` = this transaction owns the key and may execute; `"lost"` = a concurrent/committed
 *  within-window execution owns it — re-read and return the stored winner, never execute. */
export type ClaimCommandDedupRecord = (
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db?: DbExecutor,
) => Promise<"claimed" | "lost">;
export const claimCommandDedupRecord: ClaimCommandDedupRecord = (
  scope,
  windowPolicyKey,
  deps,
  db,
) => claimCommandDedupRecordImpl(scope, windowPolicyKey, deps, db);

/** §B.6 claim release (error OUTCOME only — the tx will commit; a thrown failure rolls back the
 *  claim automatically). Keeps errors uncached and the key unwedged. */
export type ReleaseCommandDedupRecord = (
  scope: CommandDedupScope,
  db?: DbExecutor,
) => Promise<void>;
export const releaseCommandDedupRecord: ReleaseCommandDedupRecord = (scope, db) =>
  releaseCommandDedupRecordImpl(scope, db);

/** `identity.expire_delegation_grant.v1` (Doc-4C §C9 · System) — the out-of-wire sweep expiring
 *  `active` AND `suspended` grants whose `valid_to` has lapsed (`Doc-2_Patch_v1.0.7` rule 1 — the
 *  sweep covers both states; realized W2-IDN-6.5). Audited per grant (System actor). */
export type ExpireDelegationGrants = (
  deps: ExpireDelegationGrantsDeps,
) => Promise<ExpireDelegationGrantsResult>;
export const expireDelegationGrants: ExpireDelegationGrants = (deps) =>
  expireDelegationGrantsCommand(deps);

// The M1 WIRE FACES for the §C9 delegation surface (outcome → Doc-5A envelope + §6.2 status) — the
// One-Owner placement (M1 owns how its writes/reads become HTTP); the app-layer composition edge
// consumes them via `@/modules/identity/contracts` (contracts-only).
export {
  delegationGrantErrorResponse,
  delegationInvalidInput,
  mapCreateDelegationGrant,
} from "../api/create-delegation-grant.handler";
export {
  mapDelegationGrantLifecycle,
  mapRevokeDelegationGrant,
  type RevokeDelegationGrantWireResult,
} from "../api/delegation-grant-lifecycle.handler";
export { mapGetDelegationGrant } from "../api/get-delegation-grant.handler";
export {
  mapListDelegationGrants,
  type ListDelegationGrantsWireResult,
} from "../api/list-delegation-grants.handler";

// ─────────────────────────────────────────────────────────────────────────────
// §C4/§C5/§C6 — User · Organization · Membership lifecycle (W2-IDN-5). The two out-of-wire System timers +
// the pure lifecycle authority (state machines + guards) re-exported for the app-layer / W2-IDN-6.2 wired
// commands / other-module consumers. The machines/guards are PURE (own no state, read no DB, touch no
// governance signal) — Doc-4M's "single lookup surface" for lifecycle, boundary-legal on the contracts face.
// Every System-timer mutation is an AUDITED, ATOMIC write (D7): the M0 `appendAuditRecord` is INJECTED by
// contract TYPE; the audit is atomic with the state write (same tx). Zero §8 events ([DC-1]).
// ─────────────────────────────────────────────────────────────────────────────

export type { ExpireInvitationsDeps, ActivateMembershipDeps };

/** `identity.expire_invitation.v1` (Doc-4C §C6 · System) — the out-of-wire sweep expiring `invited`
 *  memberships whose invite window (`identity.membership_invite_expiry_window` POLICY) has lapsed
 *  (`invited → removed`). Audited per invitation (System actor). */
export type ExpireInvitations = (deps: ExpireInvitationsDeps) => Promise<ExpireInvitationsResult>;
export const expireInvitations: ExpireInvitations = (deps) => expireInvitationsCommand(deps);

/** `identity.activate_membership.v1` (Doc-4C §C6 · System) — the out-of-wire worker activating a `pending`
 *  membership on the DC-4 verification-complete signal (`pending → active`, idempotent). Audited (System). */
export type ActivateMembership = (
  input: ActivateMembershipInput,
  deps: ActivateMembershipDeps,
) => Promise<ActivateMembershipResult>;
export const activateMembership: ActivateMembership = (input, deps) =>
  activateMembershipCommand(input, deps);

// ─────────────────────────────────────────────────────────────────────────────
// §C4 — User/Account WIRED write surface (W2-IDN-6.1). The four Doc-5C §4.1 user contracts on their
// frozen routes (PATCH item + 3 named POST commands — never PUT). Actor scope: self + Admin-state;
// NO active-org authorization on this sub-domain (Doc-5C §4.5). User lifecycle edges are consumed
// from the IDN-5 `user.state-machine.ts` (the single authority — never re-derived). Three of the
// four are AUDITED atomic writes (D7 pattern; M0 `appendAuditRecord` injected by contract TYPE);
// `update_user_profile` is UNAUDITED BY FROZEN DECLARATION (Doc-4C §C4 PassB:183 "Audit: no").
// Zero §8 events ([DC-1]). Context/deps shapes re-exported for the composition edge (contracts-only).
// ─────────────────────────────────────────────────────────────────────────────

export type {
  UpdateUserProfileContext,
  UpdateUser2faSettingsContext,
  UpdateUser2faSettingsDeps,
  DeactivateOwnAccountContext,
  DeactivateOwnAccountDeps,
  SetUserAccountStatusContext,
  SetUserAccountStatusDeps,
};

// The realized wire bounds ([realization convention]s — Doc-4C §C4 `bounded` display_name per
// Doc-2_Patch_v1.0.6 §2 + the `structured admin reason` bound, RV-0152 NIT-B3 symmetric export) +
// the frozen DC-3 admin slug binding + the exported SYNTAX validator (composition-edge category
// ordering), on the public face so the composition edge and tests bind the SAME values (never
// re-declared literals).
export {
  ADMIN_REASON_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  SET_USER_ACCOUNT_STATUS_SLUG,
  validateSetUserAccountStatusInput,
};

/** `identity.update_user_profile.v1` (Doc-4C §C4; Doc-5C §4.1 row 1 — `PATCH /identity/users/{id}`).
 *  Self-scope partial update: display_name · phone (writable) — `preferences` is FAIL-CLOSED
 *  (any supplied value → VALIDATION reject pending `ESC-IDN-PREF-KEYS`; RV-0152 F1 — the frozen
 *  `schema-validated keys only` constraint has no registered key schema). Optimistic on
 *  `updated_at` (If-Match). UNAUDITED — frozen §C4 `Audit: no`. Invoke with the self-context
 *  executor (`withUserSelfContext` — `app.user_id` pinned). */
export type UpdateUserProfile = (
  input: UpdateUserProfileInput,
  ctx: UpdateUserProfileContext,
  db?: DbExecutor,
) => Promise<UpdateUserProfileOutcome>;
export const updateUserProfile: UpdateUserProfile = (input, ctx, db) =>
  updateUserProfileCommand(input, ctx, db);

/** `identity.update_user_2fa_settings.v1` (Doc-4C §C4; Doc-5C §4.1 row 2 — named POST command).
 *  Self-scope 2FA SETTINGS toggle (DC-4 — never the challenge mechanism). AUDITED atomically
 *  ([ESC-IDN-AUDIT] interim pointer). MUST be invoked INSIDE `withActiveOrg` — the ADR-021 tenant
 *  audit leg requires the server-resolved org anchor (audit context, not authorization). */
export type UpdateUser2faSettings = (
  input: UpdateUser2faSettingsInput,
  ctx: UpdateUser2faSettingsContext,
  deps: UpdateUser2faSettingsDeps,
  db?: DbExecutor,
) => Promise<UpdateUser2faSettingsOutcome>;
export const updateUser2faSettings: UpdateUser2faSettings = (input, ctx, deps, db) =>
  updateUser2faSettingsCommand(input, ctx, deps, db);

/** `identity.deactivate_own_account.v1` (Doc-4C §C4; Doc-5C §4.1 row 3 — named POST command).
 *  Depart + anonymize (§14.3 compliance-redaction; irreversible; `soft_deleted` terminal). Last
 *  Owner Protection enforced per org in ONE locking transaction (RV-0150 T6-F1). Opens its OWN
 *  transaction under the frozen Doc-6C §6.2a DELETE-anonymize staff-GUC leg; audit rows stay
 *  USER-attributed. AUDITED atomically ([ESC-IDN-AUDIT] — §9 redaction family pointer). */
export type DeactivateOwnAccount = (
  input: DeactivateOwnAccountInput,
  ctx: DeactivateOwnAccountContext,
  deps: DeactivateOwnAccountDeps,
) => Promise<DeactivateOwnAccountOutcome>;
export const deactivateOwnAccount: DeactivateOwnAccount = (input, ctx, deps) =>
  deactivateOwnAccountCommand(input, ctx, deps);

/** `identity.set_user_account_status.v1` (Doc-4C §C4; Doc-5C §4.1 row 4 — named POST command).
 *  Admin platform governance (21.6; NO org context): `active ⇄ suspended` on the IDN-5 machine.
 *  Affirmative leg = the server-derived platform-staff basis (DC-3 interim; fail-closed); the
 *  non-staff deny leg is DELEGATED to `check_permission` at the composition edge (staff-space
 *  never via org roles — RV-0147 B8). AUDITED atomically, ADMIN-attributed (never System). */
export type SetUserAccountStatus = (
  input: SetUserAccountStatusInput,
  ctx: SetUserAccountStatusContext,
  deps: SetUserAccountStatusDeps,
) => Promise<SetUserAccountStatusOutcome>;
export const setUserAccountStatus: SetUserAccountStatus = (input, ctx, deps) =>
  setUserAccountStatusCommand(input, ctx, deps);

// The M1 WIRE FACES for the §C4 user commands (outcome → Doc-5A envelope + §6.2 status) — same
// One-Owner placement as the buyer-profile mappers (M1 owns how its writes become HTTP).
export { mapUpdateUserProfile, userAccountInvalidInput } from "../api/update-user-profile.handler";
export { mapUpdateUser2faSettings } from "../api/update-user-2fa-settings.handler";
export { mapDeactivateOwnAccount } from "../api/deactivate-own-account.handler";
export {
  mapSetUserAccountStatus,
  forbiddenSetUserAccountStatus,
} from "../api/set-user-account-status.handler";

// ─────────────────────────────────────────────────────────────────────────────
// §C5 — Organization WIRED write surface (W2-IDN-6.2). The seven Doc-5C §4.1 organization contracts
// on their frozen routes (rows 5–11). Every mutation is an AUDITED, ATOMIC write (D7): the M0
// `appendAuditRecord` — and, on create, `allocateHumanReference` — are INJECTED by contract TYPE.
// The org lifecycle edges are consumed from the IDN-5 `organization.state-machine.ts` (single
// authority — never rebuilt). The §5.5-GUARDED commands (`transfer_ownership` ·
// `admin_recover_ownership` — the frozen-text-derived guarded set) honor the RV-0150 T6-F1
// serialization contract: each passes its OWN transaction to the FOR-UPDATE fact resolver
// (`resolveOwnerRemovalFacts` / `resolveOwnershipRecoveryFacts`) and applies the guarded write in
// that SAME transaction. Zero §8 events ([DC-1]); the soft-delete/status cross-module cascade
// stays OUT-OF-WIRE (Doc-5C §7.4). Context/deps shapes re-exported for the composition edge.
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CreateOrganizationContext,
  CreateOrganizationDeferredFields,
  CreateOrganizationDeps,
  UpdateOrganizationProfileContext,
  UpdateOrganizationProfileDeps,
  UpdateOrganizationProfileDeferredFields,
  TransferOwnershipContext,
  TransferOwnershipDeps,
  SoftDeleteOrganizationContext,
  SoftDeleteOrganizationDeps,
  RestoreOrganizationContext,
  RestoreOrganizationDeps,
  SetOrganizationStatusContext,
  SetOrganizationStatusDeps,
  AdminRecoverOwnershipContext,
  AdminRecoverOwnershipDeps,
};

// The realized wire bounds ([realization convention]s — face-exported so compositions and tests
// bind the SAME values, RV-0152 NIT-B3 symmetry) + the frozen slug bindings (Doc-2 §7 catalog
// tokens by pointer — `can_transfer_ownership` / `can_delete_organization` / the DC-3 interim
// `staff_super_admin` pair) + the exported SYNTAX validators (composition-edge category ordering).
export { ORG_NAME_MAX_LENGTH, validateCreateOrganizationInput };
export { SUCCESSION_REASON_MAX_LENGTH, TRANSFER_OWNERSHIP_SLUG };
export { DELETE_ORGANIZATION_SLUG, DELETE_REASON_MAX_LENGTH };
export {
  ORG_ADMIN_REASON_MAX_LENGTH,
  SET_ORGANIZATION_STATUS_SLUG,
  validateSetOrganizationStatusInput,
};
export { ADMIN_RECOVER_OWNERSHIP_SLUG, validateAdminRecoverOwnershipInput };

/** `identity.create_organization.v1` (Doc-4C §C5; Doc-5C §4.1 row 5 — `POST /identity/organizations`
 *  · 201 + Location). Bootstrap create: org + founding Owner membership + `ORG-…` human_ref (M0)
 *  atomically; audited with the ENUMERATED §9 "create". MUST run inside the composition-owned
 *  Doc-6C §6.2a bootstrap transaction (the WP-1.3 provisioning mechanism; attribution stays User). */
export type CreateOrganization = (
  input: CreateOrganizationInput,
  ctx: CreateOrganizationContext,
  deps: CreateOrganizationDeps,
  db?: DbExecutor,
) => Promise<CreateOrganizationOutcome>;
export const createOrganization: CreateOrganization = (input, ctx, deps, db) =>
  createOrganizationCommand(input, ctx, deps, db);

/** `identity.update_organization_profile.v1` (Doc-4C §C5; Doc-5C §4.1 row 6 — `PATCH
 *  /identity/organizations/{id}`). Attribute edit only (never a §5.1 transition). The ONE §C5
 *  contract declaring `Concurrency: optimistic` — the token rides `If-Match`; stale → CONFLICT +
 *  `ETag`. AUTHZ = the `[ESC-IDN-SLUG]` interim Owner/Director authority (the D7 precedent).
 *  Audited (`[ESC-IDN-AUDIT]` org-profile-change pointer). MUST run INSIDE `withActiveOrgContext`. */
export type UpdateOrganizationProfile = (
  input: UpdateOrganizationProfileInput,
  ctx: UpdateOrganizationProfileContext,
  deps: UpdateOrganizationProfileDeps,
  db?: DbExecutor,
) => Promise<UpdateOrganizationProfileOutcome>;
export const updateOrganizationProfile: UpdateOrganizationProfile = (input, ctx, deps, db) =>
  updateOrganizationProfileCommand(input, ctx, deps, db);

/** `identity.transfer_ownership.v1` (Doc-4C §C5; Doc-5C §4.1 row 7 — named POST command). The §5.5
 *  succession command — GUARDED (RV-0150): resolves the Owner facts under the FOR-UPDATE lock on
 *  ITS OWN transaction and reassigns the Owner role in that same transaction. `can_transfer_
 *  ownership` via the wired authorization root; NEVER delegable. Audited with the ENUMERATED §9
 *  "ownership change/succession". MUST run INSIDE `withActiveOrgContext` (that tx IS the lock tx). */
export type TransferOwnership = (
  input: TransferOwnershipInput,
  ctx: TransferOwnershipContext,
  deps: TransferOwnershipDeps,
  db?: DbExecutor,
) => Promise<TransferOwnershipOutcome>;
export const transferOwnership: TransferOwnership = (input, ctx, deps, db) =>
  transferOwnershipCommand(input, ctx, deps, db);

/** `identity.soft_delete_organization.v1` (Doc-4C §C5; Doc-5C §4.1 row 8 — ADR-012 `DELETE` item).
 *  Doc-2 §5.1 `active|suspended → soft_deleted` on the IDN-5 machine + the IN-MODULE membership
 *  cascade (marker tuple). Cross-module legs BLOCKED ([DC-1] — Doc-5C §7.4; nothing authored).
 *  Audited with the ENUMERATED §9 "soft delete/restore". MUST run INSIDE `withActiveOrgContext`. */
export type SoftDeleteOrganization = (
  input: SoftDeleteOrganizationInput,
  ctx: SoftDeleteOrganizationContext,
  deps: SoftDeleteOrganizationDeps,
  db?: DbExecutor,
) => Promise<SoftDeleteOrganizationOutcome>;
export const softDeleteOrganization: SoftDeleteOrganization = (input, ctx, deps, db) =>
  softDeleteOrganizationCommand(input, ctx, deps, db);

/** `identity.restore_organization.v1` (Doc-4C §C5; Doc-5C §4.1 row 9 — named POST command). Doc-2
 *  §5.1 `soft_deleted → active` + the slug restore-conflict rule + the marker-scoped membership
 *  un-cascade. Dual-leg actor (Owner self-restore / Admin). MUST run inside the composition-owned
 *  Doc-6C §6.2a transaction (a soft-deleted org has no resolvable active-org context). */
export type RestoreOrganization = (
  input: RestoreOrganizationInput,
  ctx: RestoreOrganizationContext,
  deps: RestoreOrganizationDeps,
  db?: DbExecutor,
) => Promise<RestoreOrganizationOutcome>;
export const restoreOrganization: RestoreOrganization = (input, ctx, deps, db) =>
  restoreOrganizationCommand(input, ctx, deps, db);

/** `identity.set_organization_status.v1` (Doc-4C §C5; Doc-5C §4.1 row 10 — named POST command).
 *  Admin platform governance (21.6; NO org context): Doc-2 §5.1 `active ⇄ suspended` on the IDN-5
 *  machine. Opens its OWN staff-GUC transaction; ADMIN-attributed audit ([ESC-IDN-AUDIT] pointer). */
export type SetOrganizationStatus = (
  input: SetOrganizationStatusInput,
  ctx: SetOrganizationStatusContext,
  deps: SetOrganizationStatusDeps,
) => Promise<SetOrganizationStatusOutcome>;
export const setOrganizationStatusService: SetOrganizationStatus = (input, ctx, deps) =>
  setOrganizationStatusCommand(input, ctx, deps);

/** `identity.admin_recover_ownership.v1` (Doc-4C §C5; Doc-5C §4.1 row 11 — named POST command).
 *  The §5.5 orphaned-ownership recovery — GUARDED (RV-0150): opens its OWN transaction, resolves
 *  the recovery facts under the SAME FOR-UPDATE lock set, and (re)assigns the Owner in that same
 *  transaction. ADMIN-attributed audit with reason code + approver identity (ENUMERATED §9
 *  "ownership change/succession"). */
export type AdminRecoverOwnership = (
  input: AdminRecoverOwnershipInput,
  ctx: AdminRecoverOwnershipContext,
  deps: AdminRecoverOwnershipDeps,
) => Promise<AdminRecoverOwnershipOutcome>;
export const adminRecoverOwnership: AdminRecoverOwnership = (input, ctx, deps) =>
  adminRecoverOwnershipCommand(input, ctx, deps);

// The M1 WIRE FACES for the §C5 organization commands (outcome → Doc-5A envelope + §6.2 status) —
// the One-Owner placement (M1 owns how its writes become HTTP); the app-layer composition edge
// consumes them via `@/modules/identity/contracts` (contracts-only).
export {
  forbiddenOrgAdmin,
  mapAdminRecoverOwnership,
  mapCreateOrganization,
  mapRestoreOrganization,
  mapSetOrganizationStatus,
  mapSoftDeleteOrganization,
  mapTransferOwnership,
  mapUpdateOrganizationProfile,
  orgInvalidInput,
  orgNotFoundCollapse,
  organizationErrorResponse,
} from "../api/organization.handler";

// The pure lifecycle authority (state machines) — the SINGLE source of legal-edge truth (Doc-2 §5.1/§5.2 +
// Doc-4C §C4/§C5/§C6). Re-exported so the W2-IDN-6.2 wired commands + consuming callers consult the SAME matrix and
// never hand-roll a transition. Domain owns them; this is the boundary-legal public face.
export {
  canTransitionOrganization,
  assertOrganizationTransition,
  IllegalOrganizationTransitionError,
  TERMINAL_ORGANIZATION_STATUSES,
  type OrganizationStatus,
} from "../domain/state-machines/organization.state-machine";
export {
  canTransitionMembership,
  assertMembershipTransition,
  IllegalMembershipTransitionError,
  TERMINAL_MEMBERSHIP_STATES,
  type MembershipState,
} from "../domain/state-machines/membership.state-machine";
export {
  canTransitionUser,
  assertUserTransition,
  IllegalUserTransitionError,
  TERMINAL_USER_STATUSES,
  type UserStatus,
} from "../domain/state-machines/user.state-machine";

// The lifecycle GUARDS (pure policies) — the "only active participates" gate + Last-Owner-Protection /
// Ownership-Succession decisions. Re-exported for the W2-IDN-6.2 wired commands (the BUSINESS-stage guard).
export {
  membershipParticipatesInAccessFormula,
  organizationParticipatesInAccessFormula,
} from "../domain/policies/membership-participation.policy";
export {
  evaluateLastOwnerProtection,
  evaluateOwnershipSuccession,
  type LastOwnerProtectionFacts,
  type LastOwnerProtectionVerdict,
  type OwnershipSuccessionFacts,
  type OwnershipSuccessionVerdict,
} from "../domain/policies/last-owner-protection.policy";

// The repository fact-resolver for the Last-Owner guard (the SERVICE-LAYER guard's DB read). Re-exported so
// W2-IDN-6.2 commands resolve owner facts through the M1 contracts face and hand them to the pure policy.
// `UnresolvableOwnerRoleError` is the loud fail-closed signal when the seeded Owner role is missing — the
// guard's prerequisite is corrupt, so the resolver refuses rather than fabricating never-block facts.
//
// SERIALIZATION CONTRACT (RV-0150 T6-F1): the facts MUST be resolved AND the guarded write applied within ONE
// transaction. `resolveOwnerRemovalFacts` locks the org's active-Owner rows (`SELECT … FOR UPDATE`) so
// concurrent Owner-disabling mutations serialize (the second sees the first's committed write) — a
// check-then-act cannot race two removals to an ownerless org. `evaluateOwnershipSuccession`'s
// `resultingActiveOwnerCount` inherits the same class; a transfer MUST resolve it in that same locking tx.
// `resolveOwnershipRecoveryFacts` (W2-IDN-6.2) is the recovery leg of the SAME contract: it takes
// the IDENTICAL set-level lock, so transfer/recovery/deactivate all serialize on one lock set.
export {
  resolveOwnerRemovalFacts,
  resolveOwnershipRecoveryFacts,
  UnresolvableOwnerRoleError,
} from "../infrastructure/data/membership-lifecycle.repository";
