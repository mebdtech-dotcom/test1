// App-layer composition for M1 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/identity/**`) delegate here; the composition wires Supabase Auth ↔
// active-org context ↔ M1 contracts. Authentication/active-org context are app-layer; RLS is the backstop.

export {
  handleGetBuyerProfile,
  loadActiveOrgBuyerProfile,
  type ActiveOrgBuyerProfileOutcome,
  type GetBuyerProfileHandlerDeps,
  type ResolveSession,
} from "./get-buyer-profile.route-handler";

export {
  handleUpsertBuyerProfile,
  type UpsertBuyerProfileHandlerDeps,
} from "./upsert-buyer-profile.route-handler";

// W2-IDN-6.1 — the §C4 User/Account wired surface (Doc-5C §4.1 rows 1–4).
export {
  handleUpdateUserProfile,
  type UpdateUserProfileHandlerDeps,
} from "./update-user-profile.route-handler";
export {
  handleUpdateUser2faSettings,
  type UpdateUser2faSettingsHandlerDeps,
} from "./update-user-2fa-settings.route-handler";
export {
  handleDeactivateOwnAccount,
  type DeactivateOwnAccountHandlerDeps,
} from "./deactivate-own-account.route-handler";
export {
  handleSetUserAccountStatus,
  type SetUserAccountStatusHandlerDeps,
} from "./set-user-account-status.route-handler";

// W2-IDN-6.5 — the §C9 Delegation wired surface (Doc-5C §5.1, all 6 contracts) + the §B.6
// command-dedup composition helpers (the Idempotency-Key replay wrap; also retro-fitted across the
// 6.1 §C4 compositions above — the RV-0152 close carry).
export {
  handleCreateDelegationGrant,
  type CreateDelegationGrantHandlerDeps,
} from "./create-delegation-grant.route-handler";
export {
  handleReinstateDelegationGrant,
  handleRevokeDelegationGrant,
  handleSuspendDelegationGrant,
  type DelegationGrantLifecycleHandlerDeps,
} from "./delegation-grant-lifecycle.route-handler";
export {
  handleGetDelegationGrant,
  type GetDelegationGrantHandlerDeps,
} from "./get-delegation-grant.route-handler";
export {
  handleListDelegationGrants,
  type ListDelegationGrantsHandlerDeps,
  type ListDelegationGrantsWireInput,
} from "./list-delegation-grants.route-handler";
export {
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  storedToWire,
  wireToStored,
  type WireIdempotencyKey,
} from "./command-dedup";

// W2-IDN-6.2 — the §C5 Organization wired surface (Doc-5C §4.1 rows 5–11, all 7 contracts).
export {
  handleCreateOrganization,
  type CreateOrganizationHandlerDeps,
} from "./create-organization.route-handler";
export {
  handleSoftDeleteOrganization,
  handleTransferOwnership,
  handleUpdateOrganizationProfile,
  type OrganizationTenantHandlerDeps,
} from "./organization-tenant.route-handler";
export {
  handleRestoreOrganization,
  type RestoreOrganizationHandlerDeps,
} from "./restore-organization.route-handler";
export {
  handleAdminRecoverOwnership,
  handleSetOrganizationStatus,
  type OrganizationAdminHandlerDeps,
} from "./organization-admin.route-handler";

// W2-IDN-6.3 — the §C6 Membership wired surface (Doc-5C §5.1 rows 12–16, all 5 contracts).
export {
  handleInviteMember,
  handleRemoveMember,
  handleRevokeInvitation,
  handleSetMembershipStatus,
  type MembershipTenantHandlerDeps,
} from "./membership-tenant.route-handler";
export {
  handleAcceptInvitation,
  type AcceptInvitationHandlerDeps,
} from "./accept-invitation.route-handler";
