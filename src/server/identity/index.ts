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

// The server-rendered DATA face for a workspace surface's display identity (Doc-7C SR3). Composition
// only — it coins no contract; see the file header.
export {
  loadActiveOrgIdentity,
  type ActiveOrgIdentity,
  type ActiveOrgIdentityDeps,
  type ActiveOrgIdentityOutcome,
} from "./active-org-identity";

// The server-resolved default workspace entry path (post-login landing + `/dashboard`). Composition
// only — a NAVIGATION default derived from participation flags, never an authorization gate.
export {
  resolveWorkspaceEntryPath,
  BUY_WORKSPACE_HOME,
  SELL_WORKSPACE_HOME,
  type WorkspaceEntryDeps,
} from "./active-org-lens";

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

// W2-IDN-6.4 — the §C7 Role & Permission wired surface (Doc-5C §5.1 rows 17–22, all 6 contracts).
export {
  handleCreateRole,
  handleDeleteRole,
  handleListPermissions,
  handleListRoles,
  handleSetRolePermissions,
  handleUpdateRole,
  type ListPermissionsWireInput,
  type ListRolesWireInput,
  type RoleReadHandlerDeps,
  type RoleWriteHandlerDeps,
} from "./role.route-handler";

// W2-IDN-6.6 — the §C8 Context / Active-Organization wired surface (Doc-5C §6.1 rows 29–31, all 3
// contracts): the side-effect-free switcher + two self reads. The RV-0150 OBS-B1 suspended-org denial is
// enforced SOLELY at the `switch` (§C8 BUSINESS `identity_context_state_invalid`, over the live org row);
// `resolveActiveOrg` is MEMBERSHIP-ONLY (Doc-5C §3.3) and does NOT gate org_status (the switch composition
// resolves the principal via `resolveSelfUser`, not `resolveActiveOrg`). Residual: the open
// `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]` Board completeness item.
export {
  handleSwitchActiveOrganization,
  type SwitchActiveOrganizationHandlerDeps,
  type SwitchActiveOrganizationWireInput,
} from "./switch-active-organization.route-handler";
export {
  handleGetActiveContext,
  type GetActiveContextHandlerDeps,
} from "./active-context.route-handler";
export {
  handleListMyOrganizations,
  type ListMyOrganizationsHandlerDeps,
  type ListMyOrganizationsWireInput,
} from "./list-my-organizations.route-handler";

// W2-IDN-6.8 — the §C11 Workflow-Settings wired surface (Doc-5C §6.1 rows 34–35, both contracts): the
// active-org POLICY-bounded update (writes NO governance signal — the firewall) + the owning-org read.
export {
  handleGetWorkflowSettings,
  handleUpdateWorkflowSettings,
  type GetWorkflowSettingsHandlerDeps,
  type UpdateWorkflowSettingsHandlerDeps,
} from "./workflow-settings.route-handler";

// P1 Growth Hub M1 core slice — the §C13 growth-invitation wired surface (Doc-5C v1.0.1 rows
// 36–37): the active-org create (§B.6 claim leg; its own [DC-5] dedup window) + M1's FIRST PUBLIC
// composition (the §19-rate-limit-bound token resolve). The delivery-payload read is OUT-OF-WIRE
// (internal-service, M6 sole caller — no composition exists here by design; conformance G-5).
export {
  handleCreateInvitation,
  handleResolveInvitationToken,
  type GrowthInvitationHandlerDeps,
} from "./growth-invitation.route-handler";
