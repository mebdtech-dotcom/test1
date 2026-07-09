// Public DTOs / IDs for module "identity" (cross-module surface). DTOs/IDs only — domain
// value-objects stay private. Realized per the module's Doc-5C / Doc-6C contracts.
//
// Reference-never-restate: field names/semantics are owned by Doc-2 §10.2 (the buyer_profiles
// column set) and the read shape by Doc-5C §6.1/§6.3 (`identity.get_buyer_profile.v1`); bound by
// pointer, never re-authored here. WP-1.2 realizes the buyer-profile read DTO + outcome; WP-1.3
// adds the first-login provisioning DTOs.

/**
 * The `identity.buyer_profiles` read projection (Doc-2 §10.2 column set; Doc-6C §3.8).
 * Owning-org / active-org singleton (one per org — `buyer_profiles_org_live_uq`). The jsonb
 * columns carry IDs/values only (Doc-6A §12); their internal shape is owned by Doc-2 §10.2 and
 * left opaque (`unknown`) here — Doc-5C representation is bound by pointer, not coined.
 */
export interface BuyerProfileView {
  /** PK (UUIDv7) of the buyer_profile row. */
  id: string;
  /** Owning organization (the active-org / tenant anchor — Doc-2 §6). */
  organizationId: string;
  /** Buyer industry (Doc-2 §10.2); nullable. */
  industry: string | null;
  /** Factory info (Doc-2 §10.2); jsonb, shape owned upstream. */
  factoryInfo: unknown;
  /** Delivery locations (Doc-2 §10.2); jsonb, shape owned upstream. */
  deliveryLocations: unknown;
  /** Procurement preferences (Doc-2 §10.2); jsonb, shape owned upstream. */
  procurementPreferences: unknown;
}

/**
 * Outcome of `identity.get_buyer_profile.v1` (Doc-5C §6.1 row 33; §6.3 non-disclosure).
 * Active-org singleton read scoped by RLS (`app.active_org`). When the active org has no
 * buyer_profile — or the target is cross-tenant — the read collapses to `not-found`
 * (Doc-5C §6.3: cross-tenant reads collapse to `404`, indistinguishable from genuine absence).
 * Doc-5C realizes the wire `404`; the in-process query surfaces the same fact as `found: false`.
 */
export type GetBuyerProfileResult = { found: true; profile: BuyerProfileView } | { found: false };

/**
 * Input to `identity.upsert_buyer_profile.v1` (Doc-4C §C10; Doc-2 §10.2 column set). All fields are
 * OPTIONAL (partial upsert — an omitted field is left unchanged on update / DB-null on create). The active
 * org is the SERVER-RESOLVED tenant anchor (never client input — Invariant #5) and is NOT part of this
 * input. (Doc-4C also lists `approval_settings` — no `buyer_profiles` column exists for it in Doc-2 §10.2,
 * so it is deferred; a future schema/contract additive owns it.)
 */
export interface UpsertBuyerProfileInput {
  /** Buyer industry (Doc-2 §10.2); omit = unchanged (update) / null (create). */
  industry?: string | null;
  /** Factory info (`factory_info_jsonb`, Doc-2 §10.2); IDs/values only, no blobs (Doc-6A §12). */
  factoryInfo?: unknown;
  /** Delivery locations (`delivery_locations_jsonb`, Doc-2 §10.2). */
  deliveryLocations?: unknown;
  /** Procurement preferences (`procurement_preferences_jsonb`, Doc-2 §10.2). */
  procurementPreferences?: unknown;
  /**
   * Optimistic-concurrency token (Doc-4C §C10 — `updated_at` concurrency on UPDATE). When present and the
   * live row's `updated_at` differs, the update is a CONFLICT (stale). Ignored on create.
   */
  expectedUpdatedAt?: Date;
}

/** The result of a successful upsert (Doc-4C §C10 response: `buyer_profile_id` + `updated_at`). */
export interface UpsertBuyerProfileResult {
  /** The upserted `buyer_profiles.id` (UUIDv7). */
  buyerProfileId: string;
  /** The resulting `updated_at` (the new optimistic-concurrency token). */
  updatedAt: Date;
}

/** Error outcome of an upsert (Doc-4C §C10 error register; classes per Doc-5A §6.2). */
export interface UpsertBuyerProfileError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION → 400 · AUTHORIZATION → 403 · CONFLICT → 409). */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "CONFLICT";
  /** The Doc-4C §C10 `identity_buyer_profile_*` register code (frozen; never coined here). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/**
 * Outcome of `identity.upsert_buyer_profile.v1`. `ok: true` + `created` distinguishes the wire `201`
 * (created) from `200` (updated). `ok: false` carries the contract error (validation/forbidden/conflict).
 */
export type UpsertBuyerProfileOutcome =
  | { ok: true; created: boolean; result: UpsertBuyerProfileResult }
  | { ok: false; error: UpsertBuyerProfileError };

// ─────────────────────────────────────────────────────────────────────────────
// §C3 — Shared Identity Services (the OUT-OF-WIRE auth-root reads). Doc-5C §7.1: these carry NO HTTP
// method/path — they are internal-service, in-process composition surfaces (proposing a wire = an
// architecture change per Doc-5C §7.5). Every consuming module (and `src/server/authz`) calls these,
// never `identity.*` tables directly and never a shadow authorization check (Doc-4C §C3 / §B.11).
// ─────────────────────────────────────────────────────────────────────────────

/** `identity.get_user.v1` projection (Doc-4C §C3) — personal-data-minimized (Doc-2 §3.2); never an
 *  auth-mechanism field (DC-4). `preferencesSummary` is the opaque `preferences_jsonb` (shape owned
 *  upstream). The frozen §C3 projection lists `display_name`, but no realized column carries it
 *  (Doc-2 §10.2 / Doc-6C `identity.users` have none) — omitted here under handle `[ESC-IDN-DISPLAYNAME]`
 *  (RV-0148 MINOR-4; `esc_registry.md`), which GATES the W2-IDN-6.1 `update_user_profile` wire. */
export interface UserView {
  userId: string;
  /** User lifecycle status (Doc-2 §5 / `user_status`): `active` | `suspended` | `soft_deleted`. */
  status: string;
  preferencesSummary: unknown;
}

/** Outcome of `identity.get_user.v1` — `found: false` collapses not-found / not-disclosable (Doc-4C §C3). */
export type GetUserResult = { found: true; user: UserView } | { found: false };

/** `identity.get_organization.v1` projection (Doc-2 §10.2 / Doc-4C §C3 PassB line 128):
 *  `{ organization_id, human_ref, name, slug, org_status, verification_level, participation_flags }`.
 *  `verificationLevel` is the org's OWN derived attribute (read-through), NOT a Trust
 *  `verification_records` projection (DC-2, pre-adjudicated at §C3 — not one of the five firewalled
 *  signals); `participationFlags` realizes the frozen `participation_flags` as the two Doc-2 §10.2
 *  boolean columns (`has_buyer_profile` / `has_vendor_profile`). Both frozen-REQUIRED (RV-0148 MAJOR-1). */
export interface OrganizationView {
  organizationId: string;
  humanRef: string;
  name: string;
  slug: string;
  /** Org lifecycle status (Doc-2 §5.1 / `org_status`): `active` | `suspended` | `soft_deleted`. */
  orgStatus: string;
  /** The org's own derived verification level (Doc-2 §10.2 / `verification_level`): `unverified` |
   *  `verified` | `enhanced_verified` — read-through, not a Trust contract (DC-2). */
  verificationLevel: string;
  /** Participation flags (Doc-2 §10.2) — the org's realized `has_buyer_profile` / `has_vendor_profile`. */
  participationFlags: {
    hasBuyerProfile: boolean;
    hasVendorProfile: boolean;
  };
}

/** Outcome of `identity.get_organization.v1` — `found: false` collapses not-found / not-disclosable. */
export type GetOrganizationResult =
  { found: true; organization: OrganizationView } | { found: false };

/** `identity.get_membership.v1` projection (Doc-2 §10.2 / Doc-4C §C3). `state` is the access-formula input
 *  (§6.1) — only `active` participates in the gate; the caller reads it, never re-derives the
 *  role→permission mapping (that is `check_permission`). */
export interface MembershipView {
  membershipId: string;
  userId: string;
  organizationId: string;
  roleId: string;
  /** Membership state (Doc-2 §5.2 / `membership_state`): `invited`|`pending`|`active`|`suspended`|`removed`. */
  state: string;
  /** The member's department within the org (Doc-2 §10.2 / `department`); nullable. Frozen in the §C3
   *  projection (PassB line 139) — RV-0148 MINOR-3. */
  department: string | null;
}

/** Outcome of `identity.get_membership.v1` — `found: false` collapses no-link / beyond-tenant-scope. */
export type GetMembershipResult = { found: true; membership: MembershipView } | { found: false };

/**
 * Input to `identity.check_permission.v1` (Doc-4C §C3 request contract). `organizationId` is the
 * SERVER-VALIDATED active-org context (Doc-4A §5.3) — never a client-asserted org. `permissionSlug`
 * MUST exist in the Doc-2 §7 catalog (never a role/plan name, §6.2). `vendorProfileId` is present ONLY
 * when evaluating a delegated act-as path (§6B) — a bare UUID ref (not owned). `resourceScope` carries
 * optional resource identifiers for scope evaluation; absent ⇒ an org-level check.
 */
export interface CheckPermissionInput {
  userId: string;
  organizationId: string;
  permissionSlug: string;
  resourceScope?: Record<string, string>;
  vendorProfileId?: string;
}

/** `identity.check_permission.v1` decision (Doc-4C §C3 response — `decision`). */
export type PermissionDecision = "allow" | "deny";

/** `identity.check_permission.v1` granting path (Doc-4C §C3 response — `satisfied_by`), for auditability. */
export type PermissionSatisfiedBy = "membership" | "delegation" | "none";

/**
 * Diagnostic cause of a `deny` — INTERNAL-SERVICE audience only. The wire face (W2-IDN-6) collapses this
 * to the uniform non-disclosure shape (§7.5) and maps `unknown_slug` → `identity_permission_slug_unknown`
 * (REFERENCE, §6.4). Out-of-wire consumers may branch on it (e.g. audit), never leak it to a tenant.
 */
export type CheckPermissionDenyReason =
  | "unknown_slug"
  | "staff_space_firewall"
  | "no_active_membership"
  | "slug_not_held"
  | "delegation_denied"
  // RV-0148 MAJOR-2: a `resource_scope` was supplied but Doc-4A §6.1 layer-3 per-resource evaluation is
  // not realized in this wave — the request FAILS CLOSED (never a silent org-level allow). See the policy.
  | "resource_scope_unsupported";

/** Outcome of `identity.check_permission.v1` (Doc-4C §C3 response). `allow` carries the granting path;
 *  `deny` carries the internal `denyReason` (uniform on the wire). */
export type CheckPermissionResult =
  | { decision: "allow"; satisfiedBy: "membership" | "delegation" }
  | { decision: "deny"; satisfiedBy: "none"; denyReason: CheckPermissionDenyReason };

/**
 * A port that resolves whether a target vendor profile's OWN lifecycle state permits a delegated
 * operation — Doc-4A §6B.2 condition 5 ("the target vendor profile is itself in a state permitting the
 * operation … a delegation grant never overrides profile state"). The vendor profile is M2-owned, so
 * this is INJECTED at the app edge (the M2 Vendor Service, read-validation only) — never an M2 import
 * from M1. Returns `true` only when the profile's state affirmatively permits the operation.
 */
export type VendorProfileStateReader = (vendorProfileId: string) => Promise<boolean>;

// ─────────────────────────────────────────────────────────────────────────────
// §C9 — Delegation Grant write surface (W2-IDN-4). The dual-party `delegation_grants` aggregate: both
// party orgs read; ONLY the controlling org creates/suspends/revokes (Doc-2 §10.2 / §5.10). Field
// names/semantics owned by Doc-2 §10.2 + Doc-4C §C9 (identifiers verbatim); bound by pointer, never
// re-authored. `vendor_profile_id` is a BARE UUID cross-module ref (→ M2, NO FK).
// ─────────────────────────────────────────────────────────────────────────────

/** The `delegation_grant_status` value set (Doc-2 §5.10). */
export type DelegationGrantStatusValue = "draft" | "active" | "suspended" | "revoked" | "expired";

/** Error outcome of a delegation-grant command (Doc-4C §C9 error registers; classes per Doc-5A §6.2). */
export interface DelegationGrantError {
  /** Doc-5A §6.2 class → HTTP status. `BUSINESS` is the frozen §C9 ownership-class-block class. */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "REFERENCE" | "NOT_FOUND" | "STATE" | "BUSINESS";
  /** The Doc-4C §C9 `identity_delegation_*` / `identity_org_not_found` / `identity_permission_slug_unknown`
   *  register code (frozen; never coined here). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/**
 * Input to `identity.create_delegation_grant.v1` (Doc-4C §C9). The active org is the SERVER-RESOLVED
 * controlling org (Invariant #5 — never client input) and is NOT part of this input.
 */
export interface CreateDelegationGrantInput {
  /** The grantee org (Doc-4C §C9). */
  representativeOrganizationId: string;
  /** The controlled vendor profile (bare UUID ref; validated via the injected Vendor Service port). */
  vendorProfileId: string;
  /** PermissionSet (Doc-2 §2) — each slug MUST exist in the §7 catalog; never ownership-class / staff. */
  permissionSet: string[];
  /** Window start (Doc-4C §C9; default now). */
  validFrom?: Date;
  /** Window end (Doc-4C §C9; default per `identity.delegation_validity_default` POLICY when omitted). */
  validTo?: Date;
}

/** Result of a successful `create_delegation_grant` (Doc-4C §C9 response). */
export interface CreateDelegationGrantResult {
  delegationGrantId: string;
  /** Always `active` on success (Doc-4C §C9). */
  status: DelegationGrantStatusValue;
}

/** Outcome of `identity.create_delegation_grant.v1`. */
export type CreateDelegationGrantOutcome =
  { ok: true; result: CreateDelegationGrantResult } | { ok: false; error: DelegationGrantError };

/** Input to `identity.suspend_delegation_grant.v1` / `revoke_delegation_grant.v1` (Doc-4C §C9). `updatedAt`
 *  is the required optimistic-concurrency token (the caller's last-seen `updated_at`). */
export interface DelegationGrantLifecycleInput {
  delegationGrantId: string;
  /** Optional operator reason (Doc-4C §C9); recorded, not required. */
  reason?: string;
  /** Required optimistic-concurrency token (Doc-4C §C9 `updated_at : required`). */
  updatedAt: Date;
}

/** Result of a successful suspend/revoke (Doc-4C §C9 response). */
export interface DelegationGrantLifecycleResult {
  delegationGrantId: string;
  status: DelegationGrantStatusValue;
  updatedAt: Date;
}

/** Outcome of a delegation-grant lifecycle command (suspend/revoke). */
export type DelegationGrantLifecycleOutcome =
  { ok: true; result: DelegationGrantLifecycleResult } | { ok: false; error: DelegationGrantError };

/** Input to the SCAFFOLD `identity.reinstate_delegation_grant.v1` (Doc-4C §C9 — gated on
 *  `[ESC-IDN-DELEG-EXPIRY]`). */
export interface ReinstateDelegationGrantInput {
  delegationGrantId: string;
  updatedAt: Date;
}

/** Result of the System `identity.expire_delegation_grant.v1` sweep (Doc-4C §C9 — mechanical counter). */
export interface ExpireDelegationGrantsResult {
  /** Grants advanced `active → expired` this pass. */
  expired: number;
}

/**
 * A port that answers "does `controllingOrgId` control the vendor profile `vendorProfileId`?" — Doc-4C §C9
 * SCOPE (caller is the controlling org of the profile) + REFERENCE (the profile exists). The vendor profile
 * is M2-owned, so this is INJECTED at the app edge (the M2 Vendor Service, read-validation only — Doc-4C
 * §C1/§C9) — never an M2 import from M1. Fail-closed: the default reader answers `not_found`.
 *   • `controls`       — the profile exists and the org controls it (proceed).
 *   • `not_controller` — the profile exists but a DIFFERENT org controls it (`identity_delegation_not_controller`).
 *   • `not_found`      — no such profile (`identity_delegation_vendor_ref_invalid`).
 */
export type VendorProfileControlReader = (
  vendorProfileId: string,
  controllingOrgId: string,
) => Promise<"controls" | "not_controller" | "not_found">;

/**
 * The refresh-on-revocation SEAM (Doc-2 §5.10 / Doc-4C §C9). On `→ revoked` / `→ expired`, the derived M3
 * `rfq_invitation_grantees` + visibility rows for the representative would be torn down — but that is a
 * CROSS-MODULE effect with NO §8 identity emitter ([DC-1]) and M3 does not exist in Wave 2. So it is an
 * INJECTED PORT (the `VendorProfileStateReader` precedent): the DEFAULT is a genuine NO-OP (it calls no
 * M3, emits no event — honoring [DC-1]); the seam exists so revocation/expiry INVOKES it (tested), and the
 * real teardown lands via service/event when [DC-1] resolves. NEVER a cross-schema write from identity.
 */
export type DelegationRefreshPort = (input: {
  delegationGrantId: string;
  vendorProfileId: string;
  representativeOrganizationId: string;
}) => Promise<void>;

// ─────────────────────────────────────────────────────────────────────────────
// §C4/§C5/§C6 — User · Organization · Membership lifecycle (W2-IDN-5). The state-machine value sets + the two
// System-timer surfaces. The transition matrices themselves live in the domain state machines (the single
// lifecycle authority, Doc-2 §5.1/§5.2); the pure predicates are re-exported on `services.ts`. Value-set
// literals below are bound by pointer to the realized enums (Doc-6C §3.1/§3.2/§3.3), never re-authored.
// ─────────────────────────────────────────────────────────────────────────────

/** The `org_status` value set (Doc-2 §5.1 / `OrgStatus`, Doc-6C §3.2). */
export type OrganizationStatusValue = "active" | "suspended" | "soft_deleted";

/** The `membership_state` value set (Doc-2 §5.2 / `MembershipState`, Doc-6C §3.3). */
export type MembershipStateValue = "invited" | "pending" | "active" | "suspended" | "removed";

/** The `user_status` value set (Doc-2 §10.2 status enum / `UserStatus`, Doc-6C §3.1). */
export type UserStatusValue = "active" | "suspended" | "soft_deleted";

/** Input to the System `identity.activate_membership.v1` worker (Doc-4C §C6). The target `pending`
 *  membership id (from the DC-4 verification-complete signal); System actor — no org/user context input. */
export interface ActivateMembershipInput {
  membershipId: string;
}

/** Outcome of `identity.activate_membership.v1`. `activated: true` ⇒ the membership advanced `pending →
 *  active` (audited). `activated: false` carries the discriminated no-op reason (System workers surface no
 *  user response — this is for the Inngest seam + tests): `not_found` (no live membership) · `already_active`
 *  (idempotent no-op) · `illegal_state` (source state ≠ `pending`) · `precondition` (org/user not active). */
export interface ActivateMembershipResult {
  activated: boolean;
  reason?: "not_found" | "already_active" | "illegal_state" | "precondition";
}

/** Result of the System `identity.expire_invitation.v1` sweep (Doc-4C §C6 — mechanical counter). */
export interface ExpireInvitationsResult {
  /** Invitations advanced `invited → removed` (expire) this pass. */
  expired: number;
}

/**
 * Input to lazy first-login identity provisioning (WP-1.3) — the authenticated Supabase subject.
 *
 * Provisioning is OUT-OF-BAND (Doc-7E §2 / `[ESC-7-API-SIGNUP]`): signup coins NO `create_user`
 * wire contract; M1 materializes the identity (user + Personal Organization + Owner membership) on
 * first authenticated login. `authUserId` is the Supabase `auth.users` id — the infra auth-boundary
 * linkage (Doc-6C §3.1 / DC-4); the credential/secret never reaches M1.
 */
export interface ProvisionIdentityInput {
  /** The Supabase `auth.users` id linking the session to the `identity.users` record (Doc-6C §3.1). */
  authUserId: string;
  /** The subject's email (auth-managed identifier; persisted on `identity.users` per Doc-2 §10.2). */
  email?: string | null;
}

/**
 * Outcome of provisioning — the resolved identity (created or pre-existing).
 * `created = false` ⇒ idempotent no-op (the identity already existed); the ids reflect the
 * authoritative existing rows.
 */
export interface ProvisionIdentityResult {
  /** True when this call materialized the identity; false on the idempotent path. */
  created: boolean;
  /** The `identity.users` id (UUIDv7). */
  userId: string;
  /** The Personal Organization id (UUIDv7), or null if not resolvable on the idempotent path. */
  organizationId: string | null;
  /** The org `human_ref` (`ORG-YYYY-NNNNNN`), or null if not resolvable on the idempotent path. */
  organizationHumanRef: string | null;
  /** The founding Owner membership id (UUIDv7), or null if not resolvable on the idempotent path. */
  ownerMembershipId: string | null;
}
